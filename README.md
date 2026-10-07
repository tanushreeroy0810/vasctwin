# VascTwin Heart Pulse 🫀
### Real-Time Biometric Carotid Hemodynamic Digital Twin & Clinical Monitoring Dashboard

**VascTwin Heart Pulse** is a digital twin clinical simulation and biometric monitoring application. Built upon the validated 4-element Windkessel hemodynamic formulation (Paisal et al., 2019) and arterial wave reflection criteria (Weber et al., 2004), the platform converts patient-specific cardiovascular vitals, carotid geometry, and Doppler ultrasound flow velocities into a personalized, real-time arterial pressure waveform and diagnostic trajectory.

---

## 🌟 Key Capabilities

- **Biomechanically Grounded**: Solves the carotid pressure differential equation using a 4th-Order Runge-Kutta (RK4) numerical integration engine.
- **Biometric Calibration**: Calculates patient-specific vessel compliance ($C_v$), inertance ($L_v$), viscous resistance ($R_v$), characteristic resistance ($R_1$), and peripheral resistance ($R_2$).
- **Real-Time Waveform Pulsation**: Dynamic CSS keyframe pulsation and SVG glow filters simulating arterial contraction and expansion at the patient's resting heart rate.
- **3D Interactive Carotid Artery (WebGL / Three.js)**: Real-time 3D vessel lumen visualization that physically contracts and expands synchronously with the computed pulse cycle, with risk-informed wall stress tinting.
- **Comprehensive Disease Risk Screening**: Automated biomarker evaluation for 6 major cardiovascular, cerebrovascular, and metabolic pathologies.
- **Longitudinal Biomarker Matrix**: Tracks multi-visit hemodynamics across patient history with comparative cohort benchmarking.

---

## 🩺 The 4-Screen Clinical Workflow

The application follows a structured 4-screen clinical workflow:

### Screen 1 — Patient Input
Input patient demographics, hemodynamic vitals, and carotid artery geometry:
- **Patient Identifiers**: Patient ID, Age.
- **Cardiovascular Vitals**: Heart Rate (HR, bpm), Systolic Blood Pressure (SBP, mmHg), Diastolic Blood Pressure (DBP, mmHg).
- **Vessel Morphometry**:
  - Artery inner radius ($R_i$, mm)
  - Wall thickness ($h$, mm)
  - Artery segment length ($L$, mm)
  - Elastic modulus of arterial wall ($E$, MPa)
- **Blood Velocity Input**:
  - Drag-and-drop or manual upload of clinical Doppler ultrasound velocity CSVs (`time,velocity`).
  - Realistic reference presets (Normotensive, Prehypertensive, Stage 1/2 Hypertensive).
  - Quick action to start with a **Blank Form** or load **Reference Normals**.

### Screen 2 — Calculated Physiology
Derives hemodynamic and Windkessel parameters from patient inputs:
- **Primary Hemodynamics**:
  - Mean Arterial Pressure ($MAP = \frac{SBP + 2 \cdot DBP}{3}$, mmHg)
  - Cardiac Cycle Duration ($T_c = \frac{60}{HR}$, s)
  - Mean & Peak Blood Flow Velocity ($Q(t)$, mL/s)
  - Stroke Volume ($SV$, mL/beat) & Cardiac Output ($CO$, L/min)
- **4-Element Windkessel Network Parameters**:
  - $R_v$: Viscous arterial blood resistance ($\text{mmHg}\cdot\text{s}/\text{cm}^3$)
  - $L_v$: Arterial blood inertance ($\text{mmHg}\cdot\text{s}^2/\text{cm}^3$)
  - $C_v$: Carotid conduit compliance ($\text{cm}^3/\text{mmHg}$)
  - $R_1$: Proximal characteristic impedance ($\text{mmHg}\cdot\text{s}/\text{cm}^3$)
  - $R_2$: Distal peripheral vascular resistance ($\text{mmHg}\cdot\text{s}/\text{cm}^3$)
  - Total Resistance ($R = R_1 + R_2$)
  - Womersley flow parameter ($\alpha$)

### Screen 3 — Digital Twin Simulation
Interactive simulation and waveform diagnostic inspection:
- **Predicted Arterial Pressure Waveform**:
  - Continuous simulated carotid pressure curve $P(t)$ over the cardiac cycle.
  - Subtle real-time glow and pulse animation tuned to patient heart rate.
  - Landmark indicators: First Systolic Peak ($P_1$), Reflected Systolic Peak ($P_2$), and Dicrotic Notch ($t_{dic}$).
  - Real-Time Bedside Monitor mode (oscilloscope sweep view with live vitals).
- **Core Waveform Diagnostic Metrics**:
  - **Pulse Pressure** ($PP = SBP - DBP$, mmHg)
  - **Reflection Time** ($T_R = |t_{P2} - t_{P1}|$, ms)
  - **$P_1$**: First forward incident peak pressure
  - **$P_2$**: Second reflected wave peak pressure
  - **Augmentation Index** ($AI\% = \frac{|P_2 - P_1|}{PP} \times 100$)
- **3D Interactive Carotid Vessel**:
  - Three.js procedural arterial tube with camera orbit controls.
  - Rhythmic radial strain dilation driven by normalized pressure $P(t)$.
  - Dynamic wall color mapping (Emerald = Normal, Amber = Elevated, Rose = High Risk).
- **Pathology Screening Panel**:
  - Integrated disease risk assessment engine evaluated against patient values.

### Screen 4 — Longitudinal History & Comparative Analysis
Longitudinal tracking and multi-visit clinical comparison:
- **Biomarker Tracking Matrix**:
  - Multi-column comparison across clinical visits (HR, MAP, Resistance, Compliance, AI).
  - Ability to log the current simulation run as a new visit or reload prior visits into the digital twin.
- **Longitudinal Trend Chart**:
  - Interactive dual-axis trajectories of Mean Arterial Pressure ($MAP$) and Augmentation Index ($AI\%$).
- **Comparative Cohort Benchmarking**:
  - Visual patient positioning against Framingham Heart Study reference distributions across age, arterial compliance, and reflection time.
- **Clinical Summary Export**:
  - One-click formatted printable clinical report.

---

## 🔬 Tracked Pathologies & Diagnostic Criteria

The built-in **Pathology Screening Engine** automatically evaluates calculated biomarkers against established clinical thresholds:

| Disease / Condition | Primary Biomarkers Tracked | Pathophysiological Mechanism | Clinical Action Target |
| :--- | :--- | :--- | :--- |
| **Arterial Stiffening & Vascular Aging** | $C_v < 0.020\text{ cm}^3/\text{mmHg}$, $E > 0.50\text{ MPa}$, $AI > 17.2\%$, $T_R < 130\text{ ms}$ | Degradation of medial elastin and collagen cross-linking accelerates wave velocity, returning reflections in peak systole. | Assess vascular age discrepancy; lifestyle modification; consider RAS blockade. |
| **Isolated Systolic & Essential Hypertension** | $MAP \ge 105\text{ mmHg}$, $PP \ge 60\text{ mmHg}$, $R_2 \ge 0.88$, $\text{BP} \ge 130/80$ | Distinguishes whether hypertension is driven by elevated peripheral vasoconstriction ($R_2$) or conduit stiffness ($C_v$). | 24h ambulatory BP monitoring (ABPM); titrate antihypertensives targeting $MAP < 95\text{ mmHg}$. |
| **Carotid Stenosis & Atherosclerotic Remodeling** | $R_i < 2.7\text{ mm}$, $h \ge 0.50\text{ mm}$, $R_1 \ge 0.095\text{ mmHg}\cdot\text{s}/\text{cm}^3$ | Intimal hyperplasia and luminal encroachment increase viscous shear stress and elevate proximal characteristic impedance. | Order carotid duplex B-mode ultrasound; assess Peak Systolic Velocity (PSV); lipid management. |
| **Left Ventricular Hypertrophy (LVH) & Overload** | $P_2 \ge P_1$ (Type A Wave), $AI \ge 17.2\%$, Total Resistance $\ge 0.95$ | Reflected wave boosts late-systolic cardiac afterload, triggering concentric myocardial remodeling and diastolic stiffening. | Echocardiogram for LV Mass Index and $E/e'$ ratio; afterload reduction therapy. |
| **Diabetic Vasculopathy & Chronic Kidney Disease** | $C_v < 0.015\text{ cm}^3/\text{mmHg}$, $PP \ge 55\text{ mmHg}$, $E \ge 0.58\text{ MPa}$ | Medial calcification (Mönckeberg sclerosis) removes pulse buffering, transmitting damaging pressure waves into microvasculature. | Urine albumin-to-creatinine ratio (uACR); eGFR monitoring; nephroprotection via SGLT2i/ACEi. |
| **Cerebrovascular Stroke & Pulsatility Risk** | Carotid $PP \ge 55\text{ mmHg}$, $C_v < 0.018$, $AI \ge 16\%$ | Carotid buffering failure transmits high pulsatile energy into cerebral capillary beds, risking lacunar infarcts and microbleeds. | Neurovascular consultation; brain MRI for silent white matter hyperintensities; strict BP control. |

---

## 📐 Mathematical & Biophysical Formulation

### 1. Arterial Compliance ($C_v$)
Calculated from carotid geometry and wall elasticity using thick-walled cylinder theory (Paisal et al. Eq. 14):
$$C_v = \frac{3 \pi R_i^3 L}{2 E h}$$
Where:
- $R_i$: Artery inner lumen radius
- $L$: Artery segment length
- $E$: Elastic modulus of the arterial wall
- $h$: Intima-media wall thickness

### 2. Viscous Resistance ($R_v$) & Inertance ($L_v$)
Derived from Poiseuille flow and fluid momentum:
$$R_v = \frac{8 \mu L}{\pi R_i^4}$$
$$L_v = \frac{\rho L}{\pi R_i^2}$$
Where blood dynamic viscosity $\mu = 0.0035\text{ Pa}\cdot\text{s}$ and density $\rho = 1060\text{ kg}/\text{m}^3$.

### 3. Pressure Governing Differential Equation
The four-element Windkessel circuit couples blood flow $Q(t)$, characteristic resistance $R_1$, peripheral resistance $R_2$, compliance $C_v$, and inertance $L_v$:
$$\frac{dP}{dt} = \frac{Q(t) - \frac{P - P_{\text{bias}}}{R_2}}{C_v} + R_1 \frac{dQ}{dt} + L_v \frac{d^2Q}{dt^2}$$
Integrated numerically over the cardiac cycle using a **4th-Order Runge-Kutta (RK4)** method with periodic boundary condition convergence:
$$|P(0) - P(T_c)| < \epsilon$$

---

## 💻 Tech Stack & Architecture

- **Frontend Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom arterial pulse keyframe utilities
- **Waveform & Trajectory Visualization**: Recharts with SVG drop-shadow filters
- **3D Bio-rendering**: Three.js WebGL procedural geometry
- **Animation System**: Motion (`motion/react`) & CSS GPU-accelerated transforms
- **Icons**: Lucide React
- **Build Tool**: Vite 6

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- npm 9+

### Installation
```bash
# 1. Clone the repository
git clone <repository-url>
cd vasctwin-heart-pulse

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
The application will launch at `http://localhost:3000`.

### Production Build
```bash
# Build static client bundle
npm run build

# Preview build locally
npm run preview
```

### Type Checking & Linting
```bash
npm run lint
```

---

## 📊 Real-World Kaggle Dataset Integration

The platform directly integrates real-world cardiovascular datasets from **Kaggle**:

1. **Kaggle Cardiovascular Disease Dataset (70,000 Records)**:
   - Authored by Svetlana Ulianova.
   - Includes real clinical records covering age, systolic BP (`ap_hi`), diastolic BP (`ap_lo`), cholesterol levels, smoking status, and confirmed cardiovascular disease diagnosis (`cardio` = 0/1).
   - Ingested deciles provide direct population percentile benchmarking (e.g. comparing individual patient SBP/DBP against 70,000 verified patients).
2. **Kaggle Framingham Heart Study (Longitudinal Cohort)**:
   - 32-year longitudinal follow-up dataset linking carotid stiffness, blood pressure trajectories, and 10-year coronary heart disease (CHD) risk.
3. **Kaggle Carotid Duplex Ultrasound Doppler Flow Library**:
   - Digitized real ultrasound Doppler blood flow velocity traces across the cardiac cycle ($Q(t)$), calibrated for young normal, prehypertension, hypertensive stiff vessels, and high-velocity carotid stenosis jets.
4. **Interactive Kaggle Dataset Hub & Custom CSV Uploader**:
   - Accessible via the **"Kaggle Data (70k)"** button in the top navigation bar or from Screen 1.
   - Built-in drag-and-drop CSV parser compatible with `cardio_train.csv`, `framingham.csv`, and custom Doppler spreadsheets with auto-column mapping.

---

## 📁 Project Structure

```
├── README.md                      # Comprehensive project documentation
├── metadata.json                  # Application metadata and capabilities
├── index.html                     # HTML5 entry point
├── package.json                   # Dependencies and scripts
├── src/
│   ├── App.tsx                    # Main 4-screen coordinator and state store
│   ├── main.tsx                   # React root mount
│   ├── types.ts                   # TypeScript interfaces for hemodynamics
│   ├── index.css                  # Tailwind styles and arterial pulse animations
│   ├── data/
│   │   ├── patientPresets.ts      # Clinical archetype presets (Normal, Pre-HTN, HTN)
│   │   └── kaggleDatasets.ts      # 70k Kaggle cohort data, Doppler traces, and percentiles
│   ├── components/
│   │   ├── Screen1PatientInput.tsx        # Screen 1: Demographics, geometry, velocity
│   │   ├── Screen2CalculatedPhysiology.tsx # Screen 2: Windkessel elements, MAP, flow
│   │   ├── Screen3DigitalTwin.tsx         # Screen 3: Waveform, landmarks, 3D, telemetry
│   │   ├── Screen4History.tsx             # Screen 4: Longitudinal matrix & trends
│   │   ├── KaggleDatasetHub.tsx           # Kaggle 70k Explorer, benchmarks & CSV parser
│   │   ├── DiseaseRiskAnalysis.tsx        # Pathology screening for 6 conditions
│   │   ├── Vessel3D.tsx                   # Three.js 3D carotid artery renderer
│   │   ├── RealTimeMonitor.tsx            # Bedside oscilloscope telemetry monitor
│   │   ├── ComparisonView.tsx             # Population cohort benchmarking
│   │   └── QuickDataAnalysis.tsx          # Clinical data summary and export
│   └── services/
│       └── physicsEngine.ts       # RK4 differential solver & Windkessel math
```

---

## ⚠️ Clinical Simulation Disclaimer

*VascTwin Heart Pulse is a computational physiological simulation tool designed for research, academic evaluation, and clinical decision support prototyping. Diagnostic and therapeutic decisions should be made in accordance with clinical guidelines and confirmed by certified medical professionals using direct diagnostic imaging and validated pressure catheters.*
