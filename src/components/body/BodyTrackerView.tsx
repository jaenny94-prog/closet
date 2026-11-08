import React, { useState } from 'react';
import {
  Scale,
  Ruler,
  Calendar,
  Target,
  Check,
  TrendingDown,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { BodyProfile, ClothingItem, BodyLogEntry, DietTarget } from '../../types/closet';
import { convertWaist, calculateDietProgress } from '../../utils/closetLogic';
import { DietTrendChart } from './DietTrendChart';

interface BodyTrackerViewProps {
  bodyProfile: BodyProfile;
  items: ClothingItem[];
  onUpdateBodyProfile: (profile: BodyProfile) => void;
}

export const BodyTrackerView: React.FC<BodyTrackerViewProps> = ({
  bodyProfile,
  items,
  onUpdateBodyProfile,
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Quick Daily Log Input state
  const [logDate, setLogDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [logWeight, setLogWeight] = useState<number>(bodyProfile.weight || 70.4);
  const [logWaistInch, setLogWaistInch] = useState<number>(bodyProfile.waistInch || 29.6);
  const [logWaistCm, setLogWaistCm] = useState<number>(bodyProfile.waistCm || 75.2);
  const [logChestCm, setLogChestCm] = useState<number>(bodyProfile.chestCm || 98);
  const [logHipCm, setLogHipCm] = useState<number>(bodyProfile.hipCm || 96);
  const [logNote, setLogNote] = useState<string>('');

  // Target Settings Edit state
  const [targetWeight, setTargetWeight] = useState<number>(
    bodyProfile.dietTarget?.targetWeight || 67.5
  );
  const [targetWaistInch, setTargetWaistInch] = useState<number>(
    bodyProfile.dietTarget?.targetWaistInch || 28.0
  );
  const [targetDate, setTargetDate] = useState<string>(
    bodyProfile.dietTarget?.targetDate || '2026-12-31'
  );
  const [startWeight, setStartWeight] = useState<number>(
    bodyProfile.dietTarget?.startWeight || 74.5
  );
  const [startWaistInch, setStartWaistInch] = useState<number>(
    bodyProfile.dietTarget?.startWaistInch || 32.0
  );

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Waist conversion handlers
  const handleWaistInchChange = (val: number) => {
    setLogWaistInch(val);
    const converted = convertWaist(val, 'inch');
    setLogWaistCm(converted.cm);
  };

  const handleWaistCmChange = (val: number) => {
    setLogWaistCm(val);
    const converted = convertWaist(val, 'cm');
    setLogWaistInch(converted.inch);
  };

  // Add daily body log
  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();

    const newLog: BodyLogEntry = {
      id: `log-${Date.now()}`,
      date: logDate,
      weight: logWeight,
      waistInch: logWaistInch,
      waistCm: logWaistCm,
      chestCm: logChestCm || undefined,
      hipCm: logHipCm || undefined,
      note: logNote.trim() || undefined,
    };

    // Upsert by date or append
    const existingIndex = (bodyProfile.bodyLogs || []).findIndex((l) => l.date === logDate);
    let updatedLogs: BodyLogEntry[];

    if (existingIndex >= 0) {
      updatedLogs = [...bodyProfile.bodyLogs];
      updatedLogs[existingIndex] = newLog;
    } else {
      updatedLogs = [...(bodyProfile.bodyLogs || []), newLog];
    }

    updatedLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const updatedProfile: BodyProfile = {
      ...bodyProfile,
      weight: logWeight,
      waistInch: logWaistInch,
      waistCm: logWaistCm,
      chestCm: logChestCm,
      hipCm: logHipCm,
      bodyLogs: updatedLogs,
      updatedAt: new Date().toISOString(),
    };

    onUpdateBodyProfile(updatedProfile);
    setLogNote('');
    showToast(`${logDate} 신체 기록이 저장되었습니다.`);
  };

  // Save Target Settings
  const handleSaveTargetSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTarget: DietTarget = {
      startWeight,
      startWaistInch,
      targetWeight,
      targetWaistInch,
      startDate: bodyProfile.dietTarget?.startDate || '2026-09-25',
      targetDate,
    };

    const updatedProfile: BodyProfile = {
      ...bodyProfile,
      dietTarget: updatedTarget,
      updatedAt: new Date().toISOString(),
    };

    onUpdateBodyProfile(updatedProfile);
    setIsEditingTarget(false);
    showToast('다이어트 목표가 저장되었습니다.');
  };

  // Delete a log
  const handleDeleteLog = (id: string) => {
    const updated = bodyProfile.bodyLogs.filter((l) => l.id !== id);
    const lastLog = updated[updated.length - 1];

    const updatedProfile: BodyProfile = {
      ...bodyProfile,
      bodyLogs: updated,
      weight: lastLog ? lastLog.weight : bodyProfile.weight,
      waistInch: lastLog ? lastLog.waistInch : bodyProfile.waistInch,
      waistCm: lastLog ? lastLog.waistCm : bodyProfile.waistCm,
    };

    onUpdateBodyProfile(updatedProfile);
    showToast('기록이 삭제되었습니다.');
  };

  // Calculate Progress Metrics
  const dietProgress = calculateDietProgress(
    bodyProfile.dietTarget,
    bodyProfile.weight,
    bodyProfile.waistInch
  );

  // Clothing Items that target the goal waist (Motivation / Goal items)
  const goalItems = items.filter(
    (i) =>
      i.category === 'bottoms' &&
      i.targetWaistInch &&
      i.targetWaistInch <= bodyProfile.dietTarget.targetWaistInch + 0.5
  );

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 block">
            Silhouette & Wellness Tracker
          </span>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            체형 및 다이어트 추이
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            목표 체중과 허리둘레를 추적하고 옷장 속 핏 변화를 확인하세요.
          </p>
        </div>
        <button
          onClick={() => setIsEditingTarget(!isEditingTarget)}
          className="h-10 px-3.5 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 active:scale-98"
        >
          <Target size={14} className="text-zinc-600" />
          {isEditingTarget ? '설정 닫기' : '목표 설정'}
        </button>
      </div>

      {saveToast && (
        <div className="p-3 bg-zinc-900 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-modern animate-in fade-in">
          <Check size={15} className="text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Target Settings Modal / Panel */}
      {isEditingTarget && (
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/90 shadow-modern-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Target size={16} className="text-zinc-700" /> 다이어트 목표 설정
            </span>
            <button
              onClick={() => setIsEditingTarget(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700"
            >
              닫기
            </button>
          </div>

          <form onSubmit={handleSaveTargetSettings} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  시작 체중 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={startWeight}
                  onChange={(e) => setStartWeight(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-zinc-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">
                  시작 허리둘레 (인치)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={startWaistInch}
                  onChange={(e) => setStartWaistInch(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">
                  목표 체중 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums bg-blue-50/50 border border-blue-200 rounded-lg px-3 py-2 text-blue-900 font-semibold focus:bg-white focus:outline-hidden focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">
                  목표 허리 (인치)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={targetWaistInch}
                  onChange={(e) => setTargetWaistInch(Number(e.target.value))}
                  className="w-full text-sm font-mono tabular-nums bg-emerald-50/50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-900 font-semibold focus:bg-white focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                목표 달성 기한
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition-all shadow-2xs active:scale-98"
            >
              목표 저장
            </button>
          </form>
        </div>
      )}

      {/* Requirement 5.2: Achievement Status Card in Rose Pink Gradient */}
      <div className="bg-gradient-to-br from-[#881337] via-[#9F1239] to-[#E11D48] text-white rounded-2xl p-5 shadow-modern space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-200 block">
              Diet Target Progress
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
                {dietProgress.overallProgress}%
              </h3>
              <span className="text-xs text-rose-200">목표 달성률</span>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white/20 border border-white/30 rounded-md text-white shadow-2xs">
            {dietProgress.dDayText}
          </span>
        </div>

        {/* Crisp Progress Track */}
        <div className="space-y-2">
          <div className="w-full bg-black/25 h-2 rounded-full overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${dietProgress.overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-rose-200 font-mono tabular-nums">
            <span>시작 {bodyProfile.dietTarget.startWeight}kg · {bodyProfile.dietTarget.startWaistInch}인치</span>
            <span className="text-white font-bold">목표 {bodyProfile.dietTarget.targetWeight}kg · {bodyProfile.dietTarget.targetWaistInch}인치</span>
          </div>
        </div>

        {/* Dual metrics panel */}
        <div className="grid grid-cols-2 gap-3 pt-1 border-t border-white/20">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-200">체중 감량</span>
              <span className="font-mono tabular-nums text-white font-bold">
                {dietProgress.weightProgressPct}%
              </span>
            </div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              -{dietProgress.totalWeightLost} <span className="text-xs font-normal text-rose-200">kg</span>
            </div>
            <span className="text-[11px] text-rose-200/90 font-mono tabular-nums block">
              잔여 {dietProgress.remainingWeight}kg
            </span>
          </div>

          <div className="space-y-1 border-l border-white/20 pl-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-200">허리둘레</span>
              <span className="font-mono tabular-nums text-white font-bold">
                {dietProgress.waistProgressPct}%
              </span>
            </div>
            <div className="text-lg font-bold text-white font-mono tabular-nums">
              -{dietProgress.totalWaistLost} <span className="text-xs font-normal text-rose-200">인치</span>
            </div>
            <span className="text-[11px] text-rose-200/90 font-mono tabular-nums block">
              잔여 {dietProgress.remainingWaist}인치
            </span>
          </div>
        </div>
      </div>

      {/* Requirement 5.4: Visual Trend Line Chart */}
      <DietTrendChart
        logs={bodyProfile.bodyLogs || []}
        target={bodyProfile.dietTarget}
      />

      {/* Requirement 5.3: Daily Body Record Input Form */}
      <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-modern space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-rose-100">
          <Edit3 size={15} className="text-[#E11D48]" />
          <h3 className="text-sm font-bold text-zinc-900">신체 치수 기록</h3>
        </div>

        <form onSubmit={handleAddDailyLog} className="space-y-4">
          {/* Date & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                기록 날짜
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full text-xs font-mono bg-zinc-50 border border-rose-100 rounded-lg px-3 py-2.5 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#E11D48]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                몸무게 (kg) <span className="text-[#E11D48]">*</span>
              </label>
              <div className="flex items-center bg-zinc-50 border border-rose-100 rounded-lg px-3 py-2 focus-within:bg-white focus-within:border-[#E11D48]">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={logWeight}
                  onChange={(e) => setLogWeight(Number(e.target.value))}
                  aria-label="몸무게 kg"
                  className="w-full text-sm font-mono tabular-nums font-semibold text-zinc-900 bg-transparent focus:outline-hidden"
                />
                <span className="text-xs font-mono text-zinc-400">kg</span>
              </div>
            </div>
          </div>

          {/* Waist (Inch ↔ CM Dual Conversion) in clean architectural box */}
          <div className="p-4 bg-[#FDF2F4] border border-[#FBCFE8] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                <Ruler size={14} className="text-[#E11D48]" /> 허리둘레 상호 자동 환산
              </label>
              <span className="text-[10px] text-rose-600 font-mono">
                1 inch = 2.54 cm
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-rose-700 block mb-1 font-medium">
                  인치 (inch)
                </span>
                <div className="flex items-center bg-white border border-[#FBCFE8] rounded-lg px-3 py-2 shadow-2xs focus-within:border-[#E11D48]">
                  <input
                    type="number"
                    step="0.1"
                    value={logWaistInch}
                    onChange={(e) => handleWaistInchChange(Number(e.target.value))}
                    aria-label="허리둘레 인치"
                    className="w-full text-sm font-mono tabular-nums font-semibold text-zinc-900 bg-transparent focus:outline-hidden"
                  />
                  <span className="text-xs font-mono text-[#E11D48] font-bold">in</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-rose-700 block mb-1 font-medium">
                  센티미터 (cm)
                </span>
                <div className="flex items-center bg-white border border-[#FBCFE8] rounded-lg px-3 py-2 shadow-2xs focus-within:border-[#E11D48]">
                  <input
                    type="number"
                    step="0.1"
                    value={logWaistCm}
                    onChange={(e) => handleWaistCmChange(Number(e.target.value))}
                    aria-label="허리둘레 센티미터"
                    className="w-full text-sm font-mono tabular-nums font-semibold text-zinc-900 bg-transparent focus:outline-hidden"
                  />
                  <span className="text-xs font-mono text-[#E11D48] font-bold">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chest & Hip (Optional detailed dimensions) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                가슴둘레 (cm)
              </label>
              <input
                type="number"
                value={logChestCm}
                onChange={(e) => setLogChestCm(Number(e.target.value))}
                className="w-full text-xs font-mono tabular-nums bg-zinc-50 border border-rose-100 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#E11D48]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                엉덩이둘레 (cm)
              </label>
              <input
                type="number"
                value={logHipCm}
                onChange={(e) => setLogHipCm(Number(e.target.value))}
                className="w-full text-xs font-mono tabular-nums bg-zinc-50 border border-rose-100 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#E11D48]"
              />
            </div>
          </div>

          {/* Daily Note */}
          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">
              메모 및 피팅 체감
            </label>
            <input
              type="text"
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              placeholder="예: 슬랙스 허리 여유 생김, 유산소 40분 완료"
              className="w-full text-xs bg-zinc-50 border border-rose-100 rounded-lg px-3 py-2.5 text-zinc-900 focus:bg-white focus:outline-hidden focus:border-[#E11D48]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-[#E11D48] hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
          >
            <CheckCircle2 size={15} /> 신체 기록 저장
          </button>
        </form>
      </div>

      {/* Requirement 6: Goal Clothes Wishlist & Body Fit Motivation */}
      {goalItems.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-modern space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-zinc-700" />
              <div>
                <h4 className="text-xs font-bold text-zinc-900">
                  목표 허리({bodyProfile.dietTarget.targetWaistInch}인치) 피팅 아이템
                </h4>
                <p className="text-[11px] text-zinc-500">
                  목표 달성 시 최적의 핏으로 착용 가능한 옷장 아이템입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {goalItems.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-50 p-2.5 rounded-xl flex items-center gap-2.5 border border-zinc-200/70"
              >
                <img
                  src={item.frontImage}
                  alt={item.name}
                  className="w-10 aspect-3/4 rounded-lg object-cover shrink-0 bg-zinc-100"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-xs font-medium text-zinc-900 truncate">
                    {item.name}
                  </h5>
                  <div className="text-[11px] font-mono tabular-nums text-zinc-500 mt-0.5">
                    허리 {item.targetWaistInch}in
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Log Table */}
      <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-modern space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            기록 히스토리
          </h3>
          <span className="text-xs font-mono tabular-nums text-zinc-400">
            총 {bodyProfile.bodyLogs?.length || 0}건
          </span>
        </div>

        <div className="divide-y divide-zinc-100 max-h-64 overflow-y-auto">
          {[...(bodyProfile.bodyLogs || [])]
            .reverse()
            .map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-2.5 text-xs hover:bg-zinc-50/60 px-1 rounded transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-zinc-900 font-semibold">{log.date}</span>
                    <span className="font-mono tabular-nums text-zinc-600">{log.weight}kg</span>
                    <span className="text-zinc-400">·</span>
                    <span className="font-mono tabular-nums text-zinc-600">
                      허리 {log.waistInch}in ({log.waistCm}cm)
                    </span>
                  </div>
                  {log.note && (
                    <p className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-sm">
                      {log.note}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteLog(log.id)}
                  aria-label="기록 삭제"
                  className="text-zinc-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
