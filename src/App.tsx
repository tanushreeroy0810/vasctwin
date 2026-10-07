/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  User,
  Calculator,
  Activity,
  History,
  ShieldAlert,
  Database,
} from 'lucide-react';
import { PatientInputData, VisitRecord } from './types';
import { calculatePhysiology, calculateDigitalTwin } from './services/physicsEngine';
import {
  KaggleCardioRecord,
  KAGGLE_DOPPLER_PROFILES,
} from './data/kaggleDatasets';
import { KaggleDatasetHub } from './components/KaggleDatasetHub';
import { ClinicalValidationHub } from './components/ClinicalValidationHub';
import { Screen1PatientInput } from './components/Screen1PatientInput';
import { Screen2CalculatedPhysiology } from './components/Screen2CalculatedPhysiology';
import { Screen3DigitalTwin } from './components/Screen3DigitalTwin';
import { Screen4History } from './components/Screen4History';
import { ClinicalValidationPage } from './components/ClinicalValidationPage';
import { VascTwinLogo } from './components/VascTwinLogo';

// Default 3 Visits:
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
  // Screen state: 1: Patient Input, 2: Physiology, 3: Digital Twin, 4: History, 5: Clinical Defense
  const [currentScreen, setCurrentScreen] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Screen 1 Patient Input Data
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
  const [showGlobalKaggleHub, setShowGlobalKaggleHub] = useState(false);
  const [showValidationHub, setShowValidationHub] = useState(false);

  const handleSelectKaggleRecord = (rec: KaggleCardioRecord) => {
    const doppler = KAGGLE_DOPPLER_PROFILES[rec.velocityProfileId];

    setInputData({
      patientId: rec.patientCode,
      age: rec.age,
      heartRate: rec.heartRate,
      sbp: rec.sbp,
      dbp: rec.dbp,
      arteryRadius: rec.arteryRadius,
      wallThickness: rec.wallThickness,
      arteryLength: rec.arteryLength,
      elasticModulus: rec.elasticModulus,
      velocitySource: doppler ? 'csv' : 'preset',
      velocityCsvFileName: doppler ? `${doppler.name}.csv` : undefined,
      customVelocityData: doppler ? doppler.samplePoints.map((p) => ({ t: p.t, v: p.v })) : undefined,
    });

    setIsCurrentSaved(false);
    setShowGlobalKaggleHub(false);
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* New Modern VascTwin Brand & Logo */}
          <button
            type="button"
            onClick={() => setCurrentScreen(1)}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <VascTwinLogo size={42} className="group-hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight leading-none">
                  VascTwin<span className="text-indigo-600">™</span>
                </span>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Hemodynamic AI
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium block mt-1">
                Carotid Arterial Hemodynamics &amp; Digital Twin
              </span>
            </div>
          </button>

          {/* Clean 5-Screen Step Navigation with Comfortable Fonts */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-sm font-semibold">
            <button
              onClick={() => setCurrentScreen(1)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentScreen === 1
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <User size={16} />
              <span>1. Vitals &amp; Inputs</span>
            </button>

            <button
              onClick={() => setCurrentScreen(2)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentScreen === 2
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Calculator size={16} />
              <span>2. Physiology</span>
            </button>

            <button
              onClick={() => setCurrentScreen(3)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentScreen === 3
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity size={16} />
              <span>3. 3D Digital Twin</span>
            </button>

            <button
              onClick={() => setCurrentScreen(4)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentScreen === 4
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <History size={16} />
              <span>4. History</span>
            </button>

            <button
              onClick={() => setCurrentScreen(5)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentScreen === 5
                  ? 'bg-amber-100 text-amber-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShieldAlert size={16} className={currentScreen === 5 ? 'text-amber-800' : 'text-slate-500'} />
              <span>5. Validation Hub</span>
            </button>
          </nav>

          {/* Quick Dataset Access Shortcut */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGlobalKaggleHub(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition shadow-xs cursor-pointer"
              title="Explore 70,000+ Real Kaggle Cardiovascular Patient Records"
            >
              <Database size={16} className="text-cyan-400" />
              <span className="hidden sm:inline">Kaggle Data</span>
              <span className="bg-cyan-400 text-slate-950 text-xs px-1.5 py-0.2 rounded-md font-bold">
                70k
              </span>
            </button>
          </div>
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
            onOpenValidationHub={() => setCurrentScreen(5)}
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
            onOpenValidationHub={() => setCurrentScreen(5)}
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

        {currentScreen === 5 && (
          <ClinicalValidationPage
            onNavigateToScreen={(screenNum) => setCurrentScreen(screenNum as any)}
          />
        )}
      </main>

      {/* Clinical Validation Hub Modal (Secondary Access) */}
      {showValidationHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <ClinicalValidationHub onClose={() => setShowValidationHub(false)} />
        </div>
      )}

      {/* Global Kaggle Dataset Hub Modal Overlay */}
      {showGlobalKaggleHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-5xl my-auto">
            <KaggleDatasetHub
              currentInputData={inputData}
              onSelectKaggleRecord={handleSelectKaggleRecord}
              onClose={() => setShowGlobalKaggleHub(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
