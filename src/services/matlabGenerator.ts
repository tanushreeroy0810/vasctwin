import { PatientInputData, CalculatedPhysiology, DigitalTwinOutput } from '../types';
import { getBPBracket } from './physicsEngine';

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const lerpArray = (a: number[], b: number[], f: number) =>
  a.map((v, i) => lerp(v, b[i], f));

/**
 * Generates an executable, production-ready MATLAB (.m) script
 * for solving the 4-Element Windkessel Differential Equation via ode45
 * and plotting complete hemodynamic profiles.
 */
export function generateMatlabScript(
  input: PatientInputData,
  phys: CalculatedPhysiology,
  twin: DigitalTwinOutput
): string {
  const { A: condA, B: condB, frac } = getBPBracket(input.sbp);
  const omega = +(lerp(condA.omega, condB.omega, frac) * (input.heartRate / 75)).toFixed(4);
  const aCoeffs = lerpArray(condA.a, condB.a, frac).map((v) => +v.toFixed(6));
  const bCoeffs = lerpArray(condA.b, condB.b, frac).map((v) => +v.toFixed(6));

  const aStr = `[${aCoeffs.join(', ')}]`;
  const bStr = `[${bCoeffs.join(', ')}]`;

  return `%% =========================================================================
% CAROTID ARTERY 4-ELEMENT WINDKESSEL DIGITAL TWIN SIMULATOR
% Governing Differential Equation & Biomechanical Hemodynamic Solver
% Reference: Paisal et al., J. Adv. Res. Fluid Mech. Therm. Sci. Vol. 57, No. 1 (2019)
% Patient ID: ${input.patientId} | SBP: ${input.sbp} mmHg | DBP: ${input.dbp} mmHg | HR: ${input.heartRate} bpm
% Solved via MATLAB ode45 numerical integration (4th/5th-order Runge-Kutta Dormand-Prince)
% =========================================================================

clear; clc; close all;

%% 1. PATIENT BIOPHYSICAL & WINDKESSEL CIRCUIT PARAMETERS
p = struct();
p.patientId = '${input.patientId}';
p.age       = ${input.age};                  % Patient age [years]
p.HR        = ${input.heartRate};            % Resting heart rate [bpm]
p.SBP       = ${input.sbp};                  % Systolic blood pressure [mmHg]
p.DBP       = ${input.dbp};                  % Diastolic blood pressure [mmHg]
p.MAP       = ${phys.map};                   % Mean Arterial Pressure [mmHg]
p.Tc        = ${phys.cardiacCycle};          % Cardiac cycle duration Tc = 60/HR [s]
p.Ri        = ${input.arteryRadius};         % Carotid internal lumen radius [mm]
p.h         = ${input.wallThickness};        % Intima-media wall thickness [mm]
p.L         = ${input.arteryLength};         % Vessel segment length [mm]
p.E         = ${input.elasticModulus};       % Young's elastic modulus [MPa]

% 4-Element Windkessel Electrical-Analog Parameters (Paisal et al. Eq. 12-14, 23)
p.R1        = ${phys.r1};                    % Proximal characteristic resistance [mmHg/(cm^3/s)]
p.R2        = ${phys.r2};                    % Peripheral systemic resistance [mmHg/(cm^3/s)]
p.Cv        = ${phys.cv};                    % Carotid wall compliance [cm^3/mmHg]
p.Lv        = ${phys.lv};                    % Blood fluid inertance [mmHg/(cm^3/s^2)]
p.A         = pi * (p.Ri / 10)^2;            % Cross-sectional area [cm^2]

% 8-Harmonic Fourier Blood Velocity Coefficients (Table 1, Paisal et al.)
p.omega     = ${omega};                      % Angular heart rate frequency [rad/s]
p.a         = ${aStr};                       % Cosine harmonic coefficients
p.b         = ${bStr};                       % Sine harmonic coefficients

fprintf('--- 4-ELEMENT WINDKESSEL DIGITAL TWIN (MATLAB ode45) ---\\n');
fprintf('Patient ID: %s | SBP/DBP: %.0f/%.0f mmHg | MAP: %.1f mmHg\\n', p.patientId, p.SBP, p.DBP, p.MAP);
fprintf('Compliance Cv: %.4f cm3/mmHg | Proximal R1: %.4f | Peripheral R2: %.4f\\n', p.Cv, p.R1, p.R2);
fprintf('Fluid Inertance Lv: %.4f mmHg/(cm3/s2) | Cardiac Cycle: %.2f s\\n', p.Lv, p.Tc);

%% 2. SOLVE WINDKESSEL GOVERNING DIFFERENTIAL EQUATION
% Governing Equation (Paisal et al. Eq. 24):
% dP(t)/dt = [(R2 + R1)/(R2 * Cv)] * i(t) ...
%          + [R1 + 1/(Cv * R2)] * (di/dt) ...
%          + Lv * (d^2 i / dt^2) ...
%          - P(t) / (Cv * R2)
%
% Where blood flow current i(t) = 100 * A * V(t) [mL/s]
% Initial condition: P(0) = MAP (stabilized baseline)
tspan = [0, 4 * p.Tc];                       % Integrate 4 complete cycles to eliminate start transients
P0 = p.MAP;                                  % Initial condition [mmHg]
opts = odeset('RelTol', 1e-6, 'AbsTol', 1e-8, 'MaxStep', p.Tc / 200);

[t_all, P_all] = ode45(@(t, P) windkessel_ode(t, P, p), tspan, P0, opts);

%% 3. EXTRACT PERIODIC STEADY-STATE LAST CYCLE
t_cycle_start = 3 * p.Tc;
idx = t_all >= t_cycle_start;
t_cycle = t_all(idx) - t_cycle_start;
P_cycle = P_all(idx);

% Scale to patient physiological range
raw_ps = max(P_cycle);
raw_pd = min(P_cycle);
scale_factor = (p.SBP - p.DBP) / max(raw_ps - raw_pd, 1e-5);
P_calibrated = p.DBP + (P_cycle - raw_pd) * scale_factor;

% Compute instantaneous flow Q(t) and velocity V(t)
V_cycle = zeros(size(t_cycle));
Q_cycle = zeros(size(t_cycle));
for k = 1:length(t_cycle)
    V_cycle(k) = eval_fourier_v(t_cycle(k), p);
    Q_cycle(k) = 100 * p.A * V_cycle(k);     % Flow in mL/s
end

%% 4. HEMODYNAMIC LANDMARKS & AUGMENTATION INDEX
[P1_val, P1_idx] = max(P_calibrated);
t_P1 = t_cycle(P1_idx);

% Search for reflected tidal peak P2 in late systole
P2_val = P1_val * 0.94;
t_P2 = t_P1 + 0.12;
search_range = (P1_idx + 10):min(length(P_calibrated) - 10, P1_idx + 60);
for i = search_range
    if P_calibrated(i) >= P_calibrated(i-1) && P_calibrated(i) >= P_calibrated(i+1)
        P2_val = P_calibrated(i);
        t_P2 = t_cycle(i);
        break;
    end
end

PP = p.SBP - p.DBP;
AI_pct = (abs(P2_val - P1_val) / PP) * 100;
fprintf('Systolic Peak P1: %.1f mmHg at t=%.3f s\\n', P1_val, t_P1);
fprintf('Reflected Peak P2: %.1f mmHg at t=%.3f s\\n', P2_val, t_P2);
fprintf('Augmentation Index (AI): %.1f%% (Weber benchmark: Normal <11.7%%, Elevated 11.7-17.2%%)\\n', AI_pct);

%% 5. GENERATE 4-PANEL MATLAB CLINICAL PLOT
fig = figure('Color', [0.98, 0.98, 0.99], 'Position', [80, 80, 1150, 780], ...
             'Name', sprintf('MATLAB Carotid Twin - %s', p.patientId));

% ---------------- SUBPLOT 1: ARTERIAL PRESSURE WAVEFORM P(t) ----------------
subplot(2, 2, 1);
plot(t_cycle, P_calibrated, 'Color', [0.0, 0.45, 0.74], 'LineWidth', 2.2); hold on;
plot(t_P1, P1_val, 'ro', 'MarkerFaceColor', [0.85, 0.33, 0.1], 'MarkerSize', 7);
plot(t_P2, P2_val, 's', 'MarkerFaceColor', [0.93, 0.69, 0.13], 'MarkerSize', 7);
yline(p.MAP, 'r--', sprintf('MAP = %.1f mmHg', p.MAP), 'LineWidth', 1.2, 'FontSize', 9);
yline(p.SBP, 'k:', 'Systolic (SBP)', 'Alpha', 0.5);
yline(p.DBP, 'k:', 'Diastolic (DBP)', 'Alpha', 0.5);
grid on; box on; set(gca, 'FontSize', 10, 'GridAlpha', 0.25);
xlabel('Time t [s]', 'FontWeight', 'bold');
ylabel('Arterial Pressure P(t) [mmHg]', 'FontWeight', 'bold');
title(sprintf('1. Carotid Pressure P(t) (AI = %.1f%%)', AI_pct), 'FontSize', 11, 'FontWeight', 'bold');
legend('ode45 P(t)', 'P1 Percussion Peak', 'P2 Tidal Peak', 'Location', 'northeast');

% ---------------- SUBPLOT 2: INFLOW BLOOD FLOW RATE Q(t) ----------------
subplot(2, 2, 2);
yyaxis left;
area(t_cycle, Q_cycle, 'FaceColor', [0.85, 0.33, 0.1], 'FaceAlpha', 0.2, 'EdgeColor', [0.85, 0.33, 0.1], 'LineWidth', 1.8);
ylabel('Carotid Flow Q(t) [mL/s]', 'FontWeight', 'bold');
ylim([0, max(Q_cycle) * 1.25]);

yyaxis right;
plot(t_cycle, V_cycle * 100, 'Color', [0.47, 0.67, 0.19], 'LineWidth', 1.8, 'LineStyle', '--');
ylabel('Doppler Velocity V(t) [cm/s]', 'FontWeight', 'bold');
grid on; box on; set(gca, 'FontSize', 10, 'GridAlpha', 0.25);
xlabel('Time t [s]', 'FontWeight', 'bold');
title('2. Inflow Hemodynamics Q(t) & Velocity V(t)', 'FontSize', 11, 'FontWeight', 'bold');

% ---------------- SUBPLOT 3: P-Q PHASE PORTRAIT (HYSTERESIS LOOP) ----------------
subplot(2, 2, 3);
plot(Q_cycle, P_calibrated, 'Color', [0.49, 0.18, 0.56], 'LineWidth', 2.0); hold on;
plot(Q_cycle(1), P_calibrated(1), 'go', 'MarkerFaceColor', [0.1, 0.7, 0.2], 'MarkerSize', 8);
text(Q_cycle(1) + 2, P_calibrated(1), ' t=0 (Diastole)', 'FontSize', 9, 'Color', [0.1, 0.5, 0.1]);
grid on; box on; set(gca, 'FontSize', 10, 'GridAlpha', 0.25);
xlabel('Carotid Blood Flow Q [mL/s]', 'FontWeight', 'bold');
ylabel('Carotid Pressure P [mmHg]', 'FontWeight', 'bold');
title('3. P-Q Phase Portrait (Arterial Compliance Loop)', 'FontSize', 11, 'FontWeight', 'bold');

% ---------------- SUBPLOT 4: 4 WINDKESSEL FORCE DECOMPOSITION ----------------
subplot(2, 2, 4);
term_resist = zeros(size(t_cycle));
term_compl  = zeros(size(t_cycle));
term_inert  = zeros(size(t_cycle));
term_drain  = zeros(size(t_cycle));
dPdt_total  = zeros(size(t_cycle));

for k = 1:length(t_cycle)
    v   = eval_fourier_v(t_cycle(k), p);
    dv  = eval_fourier_dv(t_cycle(k), p);
    d2v = eval_fourier_d2v(t_cycle(k), p);
    i   = 100 * p.A * v;
    di  = 100 * p.A * dv;
    d2i = 100 * p.A * d2v;
    
    term_resist(k) = ((p.R2 + p.R1) / (p.R2 * p.Cv)) * i;
    term_compl(k)  = (p.R1 + 1 / (p.Cv * p.R2)) * di;
    term_inert(k)  = p.Lv * d2i;
    term_drain(k)  = -P_calibrated(k) / (p.Cv * p.R2);
    dPdt_total(k)  = term_resist(k) + term_compl(k) + term_inert(k) + term_drain(k);
end

plot(t_cycle, term_resist, 'Color', [0.0, 0.45, 0.74], 'LineWidth', 1.5); hold on;
plot(t_cycle, term_compl,  'Color', [0.47, 0.67, 0.19], 'LineWidth', 1.5);
plot(t_cycle, term_inert,  'Color', [0.93, 0.69, 0.13], 'LineWidth', 1.5);
plot(t_cycle, term_drain,  'Color', [0.85, 0.33, 0.1], 'LineWidth', 1.5);
yline(0, 'k-', 'Alpha', 0.2);
grid on; box on; set(gca, 'FontSize', 10, 'GridAlpha', 0.25);
xlabel('Time t [s]', 'FontWeight', 'bold');
ylabel('Force [mmHg/s]', 'FontWeight', 'bold');
title('4. Windkessel Differential Equation Force Decomposition', 'FontSize', 11, 'FontWeight', 'bold');
legend('Resistive Push', 'Elastic Rate', 'Inertial Kick', 'Peripheral Drain', 'Location', 'best');

sgtitle(sprintf('Carotid Artery 4-Element Windkessel Twin | Patient: %s | Age: %d | BP: %d/%d mmHg', ...
    p.patientId, p.age, p.SBP, p.DBP), 'FontSize', 13, 'FontWeight', 'bold');

fprintf('Simulation complete. Figures successfully plotted.\\n');

%% =========================================================================
% LOCAL AUXILIARY FUNCTIONS: WINDKESSEL ODE & FOURIER HARMONICS
% =========================================================================

function dPdt = windkessel_ode(t, P, p)
    % Evaluates blood velocity and its first & second derivatives
    v   = eval_fourier_v(t, p);
    dv  = eval_fourier_dv(t, p);
    d2v = eval_fourier_d2v(t, p);
    
    % Flow rate current i(t) = 100 * A * V(t) in mL/s
    i   = 100 * p.A * v;
    di  = 100 * p.A * dv;
    d2i = 100 * p.A * d2v;
    
    % Eq. 24 (Paisal et al., 2019):
    dPdt = ((p.R2 + p.R1) / (p.R2 * p.Cv)) * i ...
         + (p.R1 + 1 / (p.Cv * p.R2)) * di ...
         + p.Lv * d2i ...
         - P / (p.Cv * p.R2);
end

function v = eval_fourier_v(t, p)
    v = p.a(1);
    for n = 1:8
        angle = n * p.omega * t;
        v = v + p.a(n + 1) * cos(angle) + p.b(n + 1) * sin(angle);
    end
end

function dv = eval_fourier_dv(t, p)
    dv = 0;
    for n = 1:8
        nw = n * p.omega;
        angle = nw * t;
        dv = dv - p.a(n + 1) * nw * sin(angle) + p.b(n + 1) * nw * cos(angle);
    end
end

function d2v = eval_fourier_d2v(t, p)
    d2v = 0;
    for n = 1:8
        nw = n * p.omega;
        angle = nw * t;
        d2v = d2v - p.a(n + 1) * (nw^2) * cos(angle) - p.b(n + 1) * (nw^2) * sin(angle);
    end
end
`;
}
