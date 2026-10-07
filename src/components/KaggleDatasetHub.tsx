import React, { useState, useMemo } from 'react';
import {
  KAGGLE_CARDIO_RECORDS,
  KAGGLE_DOPPLER_PROFILES,
  KAGGLE_COHORT_STATISTICS,
  KaggleCardioRecord,
  calculateKagglePercentile,
} from '../data/kaggleDatasets';
import { PatientInputData } from '../types';
import {
  Database,
  Search,
  Filter,
  ArrowRight,
  Upload,
  CheckCircle2,
  AlertCircle,
  Activity,
  Heart,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Info,
  X,
  ExternalLink,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';

interface KaggleDatasetHubProps {
  currentInputData: PatientInputData;
  onSelectKaggleRecord: (record: KaggleCardioRecord) => void;
  onClose?: () => void;
}

export const KaggleDatasetHub: React.FC<KaggleDatasetHubProps> = ({
  currentInputData,
  onSelectKaggleRecord,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'explorer' | 'distributions' | 'importer'>('explorer');
  const [datasetFilter, setDatasetFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  // Custom CSV parser state
  const [customCsvText, setCustomCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [csvParseError, setCsvParseError] = useState<string | null>(null);
  const [csvSuccessMsg, setCsvSuccessMsg] = useState<string | null>(null);

  // Filter Kaggle records
  const filteredRecords = useMemo(() => {
    return KAGGLE_CARDIO_RECORDS.filter((rec) => {
      // Dataset filter
      if (datasetFilter !== 'all' && rec.datasetSource !== datasetFilter) {
        return false;
      }
      // Outcome filter
      if (outcomeFilter === 'cvd_pos' && !rec.cardioDiseaseOutcome) return false;
      if (outcomeFilter === 'cvd_neg' && rec.cardioDiseaseOutcome) return false;

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchId = String(rec.kaggleId).includes(q) || rec.patientCode.toLowerCase().includes(q);
        const matchSubtype = rec.clinicalSubtype.toLowerCase().includes(q);
        const matchNotes = rec.clinicalNotes.toLowerCase().includes(q);
        if (!matchId && !matchSubtype && !matchNotes) return false;
      }

      return true;
    });
  }, [datasetFilter, outcomeFilter, searchQuery]);

  // Current patient percentile relative to Kaggle 70k population
  const patientStats = useMemo(() => {
    return calculateKagglePercentile(
      currentInputData.sbp,
      currentInputData.dbp,
      currentInputData.age
    );
  }, [currentInputData.sbp, currentInputData.dbp, currentInputData.age]);

  // Handle CSV file upload & parsing
  const handleCsvUpload = (file: File) => {
    setCsvParseError(null);
    setCsvSuccessMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCustomCsvText(text);
      parseKaggleCsv(text);
    };
    reader.onerror = () => {
      setCsvParseError('Failed to read the uploaded CSV file.');
    };
    reader.readAsText(file);
  };

  const parseKaggleCsv = (csvContent: string) => {
    try {
      const lines = csvContent.trim().split(/\r?\n/);
      if (lines.length < 2) {
        throw new Error('CSV must contain a header row and at least one data row.');
      }

      const delimiter = lines[0].includes(';') ? ';' : ',';
      const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));

      // Map column headers intelligently
      const idIdx = headers.findIndex((h) => h === 'id' || h === 'patient_id');
      const ageIdx = headers.findIndex((h) => h === 'age' || h.includes('age'));
      const sbpIdx = headers.findIndex((h) => h === 'ap_hi' || h === 'sysbp' || h === 'sbp' || h.includes('systolic'));
      const dbpIdx = headers.findIndex((h) => h === 'ap_lo' || h === 'diabp' || h === 'dbp' || h.includes('diastolic'));
      const hrIdx = headers.findIndex((h) => h === 'heartrate' || h === 'hr' || h === 'heart_rate');
      const genderIdx = headers.findIndex((h) => h === 'gender' || h === 'sex' || h === 'male');
      const cardioIdx = headers.findIndex((h) => h === 'cardio' || h === 'tenyearchd' || h.includes('disease'));

      if (sbpIdx === -1 && dbpIdx === -1) {
        throw new Error('Could not identify Blood Pressure columns (ap_hi / sysBP / sbp).');
      }

      const rows: any[] = [];
      for (let i = 1; i < Math.min(lines.length, 51); i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(delimiter).map((c) => c.trim().replace(/['"]/g, ''));

        let rawAge = ageIdx !== -1 ? parseFloat(cols[ageIdx]) : 50;
        // In Kaggle cardio_train.csv, age is stored in days (e.g. 18393 days = ~50.3 years)
        if (rawAge > 1000) {
          rawAge = Math.round(rawAge / 365.25);
        }

        const sbp = sbpIdx !== -1 ? parseFloat(cols[sbpIdx]) : 120;
        const dbp = dbpIdx !== -1 ? parseFloat(cols[dbpIdx]) : 80;
        const hr = hrIdx !== -1 ? parseFloat(cols[hrIdx]) : 72;
        const isMale = genderIdx !== -1 ? (cols[genderIdx] === '2' || cols[genderIdx].toLowerCase() === 'm' || cols[genderIdx] === '1') : true;
        const cardio = cardioIdx !== -1 ? (cols[cardioIdx] === '1' || cols[cardioIdx].toLowerCase() === 'true') : false;

        // Skip obvious erroneous entries in raw datasets (e.g. negative SBP or SBP > 260)
        if (sbp >= 70 && sbp <= 250 && dbp >= 40 && dbp <= 160) {
          rows.push({
            id: idIdx !== -1 ? cols[idIdx] : `ROW-${i}`,
            age: isNaN(rawAge) ? 52 : rawAge,
            gender: isMale ? 'Male' : 'Female',
            sbp,
            dbp,
            hr: isNaN(hr) ? 72 : hr,
            cardio,
            rawIndex: i,
          });
        }
      }

      if (rows.length === 0) {
        throw new Error('No valid hemodynamic rows could be parsed. Check your CSV column values.');
      }

      setParsedRows(rows);
      setCsvSuccessMsg(`Successfully parsed ${rows.length} patient records from Kaggle CSV!`);
    } catch (err: any) {
      setCsvParseError(err.message || 'Error parsing CSV file');
    }
  };

  const loadSampleKaggleSnippet = () => {
    const sample = `id,age,gender,height,weight,ap_hi,ap_lo,cholesterol,gluc,smoke,alco,active,cardio
1024,19730,1,168,62,110,80,1,1,0,0,1,0
2048,20242,2,174,86,140,90,2,1,0,0,1,1
3072,21854,1,156,74,160,100,3,2,0,0,0,1
4096,17520,2,182,78,120,80,1,1,1,0,1,0
5120,23040,1,160,68,150,75,2,1,0,0,0,1`;
    setCustomCsvText(sample);
    parseKaggleCsv(sample);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 border-b border-indigo-900/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-400 text-slate-950 text-xs font-black font-mono tracking-wider uppercase">
                Kaggle Dataset Hub
              </span>
              <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                <Database size={13} /> 70,000+ Verified Patient Records
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
              Real Clinical Cardiovascular &amp; Hemodynamic Datasets
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Directly load authentic clinical patient records from the Kaggle Cardiovascular Disease Dataset (Svetlana Ulianova),
              the Framingham 32-Year Heart Study, and digitized Carotid Duplex Ultrasound Doppler velocity profiles into your digital twin.
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              title="Close Kaggle Hub"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'explorer'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Database size={15} />
            <span>Curated Kaggle Patient Cohorts ({KAGGLE_CARDIO_RECORDS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('distributions')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'distributions'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp size={15} />
            <span>70k Population Benchmarks &amp; Deciles</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('importer')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition flex items-center gap-2 ${
              activeTab === 'importer'
                ? 'bg-cyan-400 text-slate-950 shadow-md'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Upload size={15} />
            <span>Upload Custom Kaggle CSV File</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CURATED KAGGLE PATIENT EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="p-6 sm:p-7 space-y-6">
          {/* Filtering and Search Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              {/* Dataset Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Dataset:</span>
                <select
                  value={datasetFilter}
                  onChange={(e) => setDatasetFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Datasets ({KAGGLE_CARDIO_RECORDS.length})</option>
                  <option value="Kaggle Cardiovascular 70k">Kaggle Cardiovascular 70k</option>
                  <option value="Kaggle Framingham Study">Kaggle Framingham Study</option>
                  <option value="Kaggle Carotid Ultrasound Doppler">Kaggle Carotid Ultrasound Doppler</option>
                </select>
              </div>

              {/* Outcome filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">CVD Outcome:</span>
                <select
                  value={outcomeFilter}
                  onChange={(e) => setOutcomeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Diagnoses</option>
                  <option value="cvd_pos">Cardiovascular Positive (Cardio=1)</option>
                  <option value="cvd_neg">Cardiovascular Negative (Cardio=0)</option>
                </select>
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative min-w-[240px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ID, condition, or notes..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecords.map((rec) => {
              const isSelected = selectedRecordId === rec.kaggleId;
              const dopplerProfile = KAGGLE_DOPPLER_PROFILES[rec.velocityProfileId];

              return (
                <div
                  key={rec.kaggleId}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-200'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header line with badge and dataset source */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-md bg-slate-900 text-white">
                          {rec.patientCode}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          ID #{rec.kaggleId}
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          rec.cardioDiseaseOutcome
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {rec.cardioDiseaseOutcome ? 'CVD Positive' : 'CVD Negative'}
                      </span>
                    </div>

                    {/* Clinical Subtype & Dataset Source */}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {rec.clinicalSubtype}
                      </h4>
                      <span className="text-[11px] font-mono text-indigo-600 font-medium block">
                        Source: {rec.datasetSource}
                      </span>
                    </div>

                    {/* Vitals & Geometry Matrix */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs font-mono border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px]">BP &amp; HR</span>
                        <span className="font-bold text-slate-800">
                          {rec.sbp}/{rec.dbp} <span className="text-[10px] text-slate-500 font-normal">mmHg</span>
                        </span>
                        <div className="text-[10px] text-slate-500">{rec.heartRate} bpm</div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Demographics</span>
                        <span className="font-bold text-slate-800">
                          {rec.age}y · {rec.gender}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {rec.smoker ? 'Smoker' : 'Non-smoker'}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Carotid Geometry</span>
                        <span className="font-bold text-slate-800">
                          Ri: {rec.arteryRadius} mm
                        </span>
                        <div className="text-[10px] text-slate-500">
                          h: {rec.wallThickness}mm · E: {rec.elasticModulus}MPa
                        </div>
                      </div>
                    </div>

                    {/* Ultrasound Doppler trace link */}
                    {dopplerProfile && (
                      <div className="flex items-center justify-between text-[11px] font-mono bg-cyan-50/70 border border-cyan-200/70 px-3 py-1.5 rounded-lg text-cyan-900">
                        <div className="flex items-center gap-1.5">
                          <Activity size={13} className="text-cyan-700" />
                          <span>Doppler: {dopplerProfile.name}</span>
                        </div>
                        <span className="font-bold text-cyan-800">PSV {dopplerProfile.peakVelocity} cm/s</span>
                      </div>
                    )}

                    {/* Clinical Notes from Kaggle Record */}
                    <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-slate-300 pl-2.5">
                      "{rec.clinicalNotes}"
                    </p>
                  </div>

                  {/* Load Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-3">
                    <span className="text-[11px] font-mono text-slate-400">
                      Windkessel Ready
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRecordId(rec.kaggleId);
                        onSelectKaggleRecord(rec);
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-mono font-bold flex items-center gap-2 transition shadow-xs"
                    >
                      <span>Simulate in Digital Twin</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: POPULATION BENCHMARKS & DECILES (70,000 Kaggle Cohort) */}
      {activeTab === 'distributions' && (
        <div className="p-6 sm:p-7 space-y-7">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold font-mono text-slate-900 text-base">
                Current Patient vs. 70,000 Kaggle Cohort
              </h3>
              <p className="text-xs text-slate-600 font-mono mt-1">
                Evaluating Patient SBP ({currentInputData.sbp} mmHg), DBP ({currentInputData.dbp} mmHg), and Age ({currentInputData.age}y).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">SBP Percentile</span>
                <span className="text-base font-bold font-mono text-indigo-700">
                  {patientStats.sbpPercentile}th %ile
                </span>
              </div>

              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">DBP Percentile</span>
                <span className="text-base font-bold font-mono text-indigo-700">
                  {patientStats.dbpPercentile}th %ile
                </span>
              </div>

              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Kaggle Est. CVD Risk</span>
                <span className={`text-base font-bold font-mono ${
                  patientStats.estimatedCvdRisk > 50 ? 'text-rose-600' : 'text-emerald-600'
                }`}>
                  {patientStats.estimatedCvdRisk}%
                </span>
              </div>
            </div>
          </div>

          {/* SBP Distribution Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900 font-mono uppercase tracking-wider">
                  Kaggle 70,000 Patient Systolic Blood Pressure (SBP) Distribution
                </h4>
                <p className="text-xs text-slate-500">
                  Distribution of systolic blood pressure across the dataset with hypertensive transition proportion.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-indigo-600">
                  <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block"></span>
                  Kaggle Population %
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={KAGGLE_COHORT_STATISTICS.sbpDistribution} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Cohort Proportion']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}
                  />
                  <Bar dataKey="countPct" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {KAGGLE_COHORT_STATISTICS.sbpDistribution.map((entry, index) => {
                      const isCurrentRange =
                        (entry.range === '< 110' && currentInputData.sbp < 110) ||
                        (entry.range === '110-119' && currentInputData.sbp >= 110 && currentInputData.sbp <= 119) ||
                        (entry.range === '120-129' && currentInputData.sbp >= 120 && currentInputData.sbp <= 129) ||
                        (entry.range === '130-139' && currentInputData.sbp >= 130 && currentInputData.sbp <= 139) ||
                        (entry.range === '140-159' && currentInputData.sbp >= 140 && currentInputData.sbp <= 159) ||
                        (entry.range === '>= 160' && currentInputData.sbp >= 160);

                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isCurrentRange ? '#e11d48' : '#6366f1'}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-xs font-mono text-slate-500 mt-2">
              <span className="inline-flex items-center gap-1.5 text-rose-600 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
                Red Bar indicates current patient's bracket ({currentInputData.sbp} mmHg)
              </span>
            </div>
          </div>

          {/* Age Deciles & Arterial Compliance Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200">
              <h4 className="font-bold text-sm font-mono text-slate-900 uppercase tracking-wider">
                Age Deciles &amp; Hemodynamic Trajectories (Kaggle &amp; Clinical Normals)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100/75 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Age Decile</th>
                    <th className="py-3 px-4">Mean SBP (mmHg)</th>
                    <th className="py-3 px-4">Mean DBP (mmHg)</th>
                    <th className="py-3 px-4">Normative Compliance (Cv)</th>
                    <th className="py-3 px-4">Augmentation Index (AI)</th>
                    <th className="py-3 px-4">CVD Prevalence (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {KAGGLE_COHORT_STATISTICS.ageDeciles.map((dec) => (
                    <tr key={dec.ageGroup} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">{dec.ageGroup} years</td>
                      <td className="py-3 px-4 text-slate-700">{dec.meanSbp} mmHg</td>
                      <td className="py-3 px-4 text-slate-700">{dec.meanDbp} mmHg</td>
                      <td className="py-3 px-4 text-indigo-700 font-semibold">{dec.meanCompliance} cm³/mmHg</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">{dec.meanAI}%</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-800">
                          {dec.cvdPrevalencePct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM KAGGLE CSV UPLOADER & PARSER */}
      {activeTab === 'importer' && (
        <div className="p-6 sm:p-7 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold font-mono text-slate-900 text-base">
                  Upload Any Kaggle Cardiovascular CSV
                </h3>
                <p className="text-xs text-slate-600 font-mono mt-0.5">
                  Compatible with Kaggle <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">cardio_train.csv</code>,{' '}
                  <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">framingham.csv</code>, or custom clinical spreadsheets.
                </p>
              </div>

              <button
                type="button"
                onClick={loadSampleKaggleSnippet}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-indigo-700 border border-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-2xs"
              >
                <Sparkles size={14} />
                <span>Load Sample Kaggle Snippet</span>
              </button>
            </div>

            {/* Drag & drop upload target */}
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition bg-white">
              <Upload size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Drop your Kaggle CSV file here, or{' '}
                <label className="text-indigo-600 hover:text-indigo-800 cursor-pointer underline">
                  browse files
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleCsvUpload(e.target.files[0]);
                    }}
                  />
                </label>
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Auto-detects columns: ap_hi, ap_lo, sysBP, diaBP, age, gender, heartRate, cardio
              </p>
            </div>
          </div>

          {/* Status and Error banners */}
          {csvParseError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{csvParseError}</span>
            </div>
          )}

          {csvSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{csvSuccessMsg}</span>
            </div>
          )}

          {/* Parsed Rows Table */}
          {parsedRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs font-mono text-slate-800 uppercase tracking-wider">
                  Parsed Patient Records ({parsedRows.length} rows loaded)
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Click 'Simulate' to populate into Digital Twin
                </span>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">Patient ID</th>
                      <th className="py-2.5 px-4">Age / Sex</th>
                      <th className="py-2.5 px-4">Blood Pressure</th>
                      <th className="py-2.5 px-4">Heart Rate</th>
                      <th className="py-2.5 px-4">Kaggle Cardio Outcome</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row) => (
                      <tr key={row.rawIndex} className="hover:bg-indigo-50/40 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-900">#{row.id}</td>
                        <td className="py-2.5 px-4 text-slate-700">{row.age}y · {row.gender}</td>
                        <td className="py-2.5 px-4 font-bold text-indigo-700">{row.sbp} / {row.dbp} mmHg</td>
                        <td className="py-2.5 px-4 text-slate-700">{row.hr} bpm</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.cardio
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {row.cardio ? 'CVD Positive' : 'CVD Negative'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              // Convert row to KaggleCardioRecord structure
                              const mappedRecord: KaggleCardioRecord = {
                                kaggleId: parseInt(row.id) || 9999,
                                datasetSource: 'Kaggle Cardiovascular 70k',
                                patientCode: `KAG-CSV-${row.id}`,
                                age: row.age,
                                gender: row.gender,
                                sbp: row.sbp,
                                dbp: row.dbp,
                                heartRate: row.hr,
                                smoker: false,
                                cardioDiseaseOutcome: row.cardio,
                                clinicalSubtype: row.cardio ? 'Custom Kaggle: CVD Positive' : 'Custom Kaggle: CVD Negative',
                                arteryRadius: row.sbp > 140 ? 2.92 : 3.10,
                                wallThickness: row.sbp > 140 ? 0.52 : 0.40,
                                elasticModulus: row.sbp > 140 ? 0.62 : 0.44,
                                arteryLength: 192.5,
                                velocityProfileId: row.sbp > 140 ? 'doppler-hypertensive-stiff' : 'doppler-healthy-young',
                                clinicalNotes: `Imported directly from user Kaggle CSV (Row #${row.rawIndex}). SBP ${row.sbp} mmHg, DBP ${row.dbp} mmHg.`,
                              };
                              onSelectKaggleRecord(mappedRecord);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] font-mono transition"
                          >
                            Simulate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
