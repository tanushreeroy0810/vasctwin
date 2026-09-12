/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  User,
  Calculator,
  Activity,
  History,
  CheckCircle2,
} from 'lucide-react';
import { PatientInputData, VisitRecord } from './types';
import { calculatePhysiology, calculateDigitalTwin } from './services/physicsEngine';
import { Screen1PatientInput } from './components/Screen1PatientInput';
import { Screen2CalculatedPhysiology } from './components/Screen2CalculatedPhysiology';
import { Screen3DigitalTwin } from './components/Screen3DigitalTwin';
import { Screen4History } from './components/Screen4History';

// Default 3 Visits matching the user's specification:
// HR: 72, 74, 70 | MAP: 91, 94, 97
const DEFAULT_VISITS: VisitRecord[] = [
  {
    id: 'visit-1',
    visitLabel: 'Visit 1',
    date: '3 months ago',
    hr: 72,
    map: 91.3,
    resistance: 7.784,
    compliance: 0.0224,
    ai: 10.2,
    sbp: 118,
    dbp: 78,
    ri: 3.10,
    h: 0.39,
  },
  {
    id: 'visit-2',
    visitLabel: 'Visit 2',
    date: '1 month ago',
    hr: 74,
    map: 94.0,
    resistance: 8.245,
    compliance: 0.0168,
    ai: 14.1,
    sbp: 122,
    dbp: 80,
    ri: 3.06,
    h: 0.44,
  },
  {
    id: 'visit-3',
    visitLabel: 'Visit 3',
    date: 'Today',
    hr: 70,
    map: 97.3,
    resistance: 8.721,
    compliance: 0.0135,
    ai: 17.6,
    sbp: 124,
    dbp: 84,
    ri: 3.02,
    h: 0.47,
  },
];

export default function App() {
  // Screen state: 1 | 2 | 3 | 4
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3 | 4>(1);

  // Screen 1 Patient Input Data (initialized to produce MAP 97.3 mmHg & cycle ~0.83-0.86s)
  const [inputData, setInputData] = useState<PatientInputData>({
    patientId: 'PT-8029',
    age: 42,
    heartRate: 72,
    sbp: 124,
    dbp: 84,
    arteryRadius: 3.05,
    wallThickness: 0.45,
    arteryLength: 192.5,
    elasticModulus: 0.48,
    velocitySource: 'preset',
  });

  // Screen 4 History Records
  const [visits, setVisits] = useState<VisitRecord[]>(DEFAULT_VISITS);
  const [isCurrentSaved, setIsCurrentSaved] = useState(false);

  // Screen 2 Calculated Physiology Engine
  const calculatedPhysiology = useMemo(() => {
    return calculatePhysiology(inputData);
  }, [inputData]);

  // Screen 3 Digital Twin Prediction Engine
  const digitalTwinOutput = useMemo(() => {
    return calculateDigitalTwin(inputData, calculatedPhysiology);
  }, [inputData, calculatedPhysiology]);

  const handlePatientDataChange = (updated: Partial<PatientInputData>) => {
    setInputData((prev) => ({ ...prev, ...updated }));
    setIsCurrentSaved(false);
  };

  const handleLoadPreset = (type: 'healthy' | 'prehtn' | 'htn1') => {
    if (type === 'healthy') {
      setInputData({
        patientId: 'PT-NORM-101',
        age: 31,
        heartRate: 72,
        sbp: 117,
        dbp: 71,
        arteryRadius: 3.10,
        wallThickness: 0.39,
        arteryLength: 192.5,
        elasticModulus: 0.40,
        velocitySource: 'preset',
      });
    } else if (type === 'prehtn') {
      setInputData({
        patientId: 'PT-8029',
        age: 42,
        heartRate: 72,
        sbp: 124,
        dbp: 84,
        arteryRadius: 3.03,
        wallThickness: 0.46,
        arteryLength: 192.5,
        elasticModulus: 0.48,
        velocitySource: 'preset',
      });
    } else {
      setInputData({
        patientId: 'PT-STAGE1-309',
        age: 56,
        heartRate: 78,
        sbp: 148,
        dbp: 96,
        arteryRadius: 2.99,
        wallThickness: 0.50,
        arteryLength: 192.5,
        elasticModulus: 0.65,
        velocitySource: 'preset',
      });
    }
    setIsCurrentSaved(false);
  };

  const handleSaveToHistory = () => {
    const newVisit: VisitRecord = {
      id: `visit-${Date.now()}`,
      visitLabel: `Visit ${visits.length + 1}`,
      date: 'Current Run',
      hr: inputData.heartRate,
      map: calculatedPhysiology.map,
      resistance: calculatedPhysiology.totalR,
      compliance: calculatedPhysiology.cv,
      ai: digitalTwinOutput.augmentationIndex,
      sbp: inputData.sbp,
      dbp: inputData.dbp,
      ri: inputData.arteryRadius,
      h: inputData.wallThickness,
    };
    setVisits((prev) => [...prev, newVisit]);
    setIsCurrentSaved(true);
  };

  const handleLoadVisit = (v: VisitRecord) => {
    setInputData((prev) => ({
      ...prev,
      heartRate: v.hr,
      sbp: v.sbp,
      dbp: v.dbp,
      arteryRadius: v.ri,
      wallThickness: v.h,
    }));
    setCurrentScreen(3);
  };

  const handleResetHistory = () => {
    setVisits(DEFAULT_VISITS);
    setIsCurrentSaved(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none block">
                VascTwin Heart Pulse
              </span>
              <span className="text-xs font-mono text-indigo-600 font-bold tracking-wider block mt-0.5">
                4-SCREEN CLINICAL PROTOTYPE
              </span>
            </div>
          </div>

          {/* 4-Screen Step Navigation Bar */}
          <nav className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono">
            <button
              onClick={() => setCurrentScreen(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                currentScreen === 1
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
              }`}
            >
              <User size={15} />
              <span>1. Patient Input</span>
            </button>

            <button
              onClick={() => setCurrentScreen(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                currentScreen === 2
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
              }`}
            >
              <Calculator size={15} />
              <span>2. Calculated Physiology</span>
            </button>

            <button
              onClick={() => setCurrentScreen(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                currentScreen === 3
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
              }`}
            >
              <Activity size={15} />
              <span>3. Digital Twin</span>
            </button>

            <button
              onClick={() => setCurrentScreen(4)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
                currentScreen === 4
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold'
              }`}
            >
              <History size={15} />
              <span>4. History</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Screen Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentScreen === 1 && (
          <Screen1PatientInput
            inputData={inputData}
            onChange={handlePatientDataChange}
            onProceed={() => setCurrentScreen(2)}
            onSelectPresetProfile={(p) => {
              setInputData({
                patientId: p.medicalRecordNumber,
                age: p.age,
                heartRate: p.heartRate,
                sbp: p.systolicBP,
                dbp: p.diastolicBP,
                arteryRadius: p.lumenRadius,
                wallThickness: p.wallThickness,
                arteryLength: 192.5,
                elasticModulus: p.systolicBP > 140 ? 0.65 : p.systolicBP > 120 ? 0.48 : 0.40,
                velocitySource: 'preset',
              });
              setIsCurrentSaved(false);
            }}
          />
        )}

        {currentScreen === 2 && (
          <Screen2CalculatedPhysiology
            inputData={inputData}
            physiology={calculatedPhysiology}
            onBack={() => setCurrentScreen(1)}
            onProceed={() => setCurrentScreen(3)}
          />
        )}

        {currentScreen === 3 && (
          <Screen3DigitalTwin
            inputData={inputData}
            physiology={calculatedPhysiology}
            twinOutput={digitalTwinOutput}
            onBack={() => setCurrentScreen(2)}
            onProceedToHistory={() => setCurrentScreen(4)}
            onSaveToHistory={handleSaveToHistory}
            isSaved={isCurrentSaved}
          />
        )}

        {currentScreen === 4 && (
          <Screen4History
            visits={visits}
            inputData={inputData}
            physiology={calculatedPhysiology}
            twinOutput={digitalTwinOutput}
            onBackToTwin={() => setCurrentScreen(3)}
            onAddCurrentAsVisit={handleSaveToHistory}
            onResetHistory={handleResetHistory}
            onLoadVisit={handleLoadVisit}
          />
        )}
      </main>
    </div>
  );
}
