import React, { useMemo } from 'react';
import {
  Shirt,
  Sparkles,
  Camera,
  AlertTriangle,
  Heart,
  Plus,
  ChevronRight,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkle,
} from 'lucide-react';
import { ClothingItem, BodyProfile, OOTDRecord, CosmeticItem } from '../../types/closet';
import { TabType } from '../layout/BottomNavigation';
import {
  getCategorySummary,
  getUnwornCounts,
  calculateCostPerWear,
  calculateDietProgress,
  getCosmeticsSummary,
} from '../../utils/closetLogic';
import { WeatherForecastWidget } from './WeatherForecastWidget';

interface DashboardViewProps {
  items: ClothingItem[];
  ootdRecords: OOTDRecord[];
  bodyProfile: BodyProfile;
  cosmetics?: CosmeticItem[];
  onNavigateTab: (tab: TabType) => void;
  onOpenRegisterModal: () => void;
  onOpenPurgeModal: () => void;
  onSelectCategoryFilter: (category: string) => void;
  onSelectUnwornFilter: (filter: '1year' | '2year') => void;
  onSelectWeatherForStyling?: (temp: number, condition: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  ootdRecords,
  bodyProfile,
  cosmetics = [],
  onNavigateTab,
  onOpenRegisterModal,
  onOpenPurgeModal,
  onSelectCategoryFilter,
  onSelectUnwornFilter,
  onSelectWeatherForStyling,
}) => {
  const activeItems = items.filter((i) => i.status === 'active');
  const totalCount = activeItems.length;

  const categorySummary = getCategorySummary(items);
  const unwornCounts = getUnwornCounts(items);

  const totalCost = activeItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalWears = activeItems.reduce((acc, curr) => acc + (curr.wearCount || 0), 0);

  const topWornItem = [...activeItems].sort((a, b) => b.wearCount - a.wearCount)[0];

  const dietProgress = calculateDietProgress(
    bodyProfile.dietTarget,
    bodyProfile.weight,
    bodyProfile.waistInch
  );

  const cosmeticsSummary = useMemo(() => {
    return getCosmeticsSummary(cosmetics);
  }, [cosmetics]);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Modern Dashboard Summary Panel with Color Hunt Palette (#FFCED8, #FFDDDD, #FFF4DE, #FFE8C4) */}
      <div className="bg-gradient-to-br from-[#FFF4DE] via-[#FFDDDD] to-[#FFCED8] text-[#2D1E22] rounded-3xl p-5 border border-[#FFCED8] shadow-modern space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-rose-700 font-bold block">
              Overview & Analytics
            </span>
            <h1 className="text-xl font-bold tracking-tight text-[#2D1E22] mt-0.5">
              스마트 라이프스타일 대시보드
            </h1>
          </div>
          <button
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-modern-sm"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>새 옷 등록</span>
          </button>
        </div>

        {/* 3 Summary KPI Cards: Closet, Diet, and Cosmetics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Card 1: Total Clothes */}
          <div
            onClick={() => onNavigateTab('closet')}
            className="bg-white/95 hover:bg-white cursor-pointer rounded-2xl p-3.5 border border-[#FFCED8] shadow-modern-sm flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span className="font-semibold text-[#2D1E22] flex items-center gap-1">
                <Shirt size={12} className="text-rose-500" />
                보관 의류
              </span>
              <span className="text-[10px] text-rose-600 group-hover:text-rose-800 flex items-center font-bold">
                옷장 <ArrowUpRight size={11} className="ml-0.5" />
              </span>
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight text-[#2D1E22] mt-2">
              {totalCount}
              <span className="text-xs font-normal text-gray-500 ml-1">벌</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500 mt-1 truncate">
              가치 {(totalCost / 10000).toFixed(0)}만원 · 누적 {totalWears}회
            </span>
          </div>

          {/* Card 2: Diet Achievement */}
          <div
            onClick={() => onNavigateTab('body')}
            className="bg-white/95 hover:bg-white cursor-pointer rounded-2xl p-3.5 border border-[#FFCED8] shadow-modern-sm flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span className="font-semibold text-[#2D1E22]">목표 달성률</span>
              <span className="text-[10px] font-mono text-rose-600 font-bold bg-[#FFDDDD]/60 px-2 py-0.5 rounded-full">
                {dietProgress.dDayText}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold tracking-tight text-rose-600 mt-2 flex items-baseline gap-1">
              {dietProgress.overallProgress}
              <span className="text-xs font-normal text-rose-400">%</span>
            </div>
            <div className="w-full bg-[#FFDDDD] h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${dietProgress.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Card 3: Cosmetics Pouch & Expiry Status */}
          <div
            onClick={() => onNavigateTab('cosmetics')}
            className="col-span-2 sm:col-span-1 bg-white/95 hover:bg-white cursor-pointer rounded-2xl p-3.5 border border-[#FFCED8] shadow-modern-sm flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span className="font-semibold text-[#2D1E22] flex items-center gap-1">
                <Heart size={12} className="text-rose-500 fill-rose-100" />
                화장품 파우치
              </span>
              <span className="text-[10px] text-rose-600 group-hover:text-rose-800 flex items-center font-bold">
                파우치 <ArrowUpRight size={11} className="ml-0.5" />
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <div className="text-2xl font-mono font-bold tracking-tight text-[#2D1E22]">
                {cosmeticsSummary.totalCount}
                <span className="text-xs font-normal text-gray-500 ml-1">개</span>
              </div>
              {/* Impending / Expired Badge */}
              {cosmeticsSummary.expiredCount > 0 ? (
                <span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded-full animate-pulse flex items-center gap-0.5">
                  <AlertTriangle size={10} />
                  만료 {cosmeticsSummary.expiredCount}개
                </span>
              ) : cosmeticsSummary.impendingCount > 0 ? (
                <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Clock size={10} />
                  임박 {cosmeticsSummary.impendingCount}개
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck size={10} />
                  전체 안전
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
              <span>안전 {cosmeticsSummary.safeCount}</span>·
              <span className="text-amber-600 font-semibold">임박 {cosmeticsSummary.impendingCount}</span>·
              <span className="text-rose-600 font-semibold">만료 {cosmeticsSummary.expiredCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Day Weather Forecast & Outfit Guide Widget */}
      <WeatherForecastWidget onSelectWeatherForStyling={onSelectWeatherForStyling} />

      {/* Expired Cosmetics Alert Banner (Requirement: 홈 대시보드 유통기한 알림) */}
      {cosmeticsSummary.expiredCount > 0 && (
        <div className="bg-gradient-to-r from-[#FFF4DE] via-[#FFFDF8] to-[#FFDDDD] border border-[#FFCED8] rounded-3xl p-4 flex items-center justify-between gap-3 shadow-modern-sm animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFCED8] text-rose-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#2D1E22]">
                  유통기한 지난 화장품 {cosmeticsSummary.expiredCount}개 감지
                </span>
                <span className="text-[10px] font-bold text-rose-800 bg-white/80 px-2 py-0.5 rounded-full border border-[#FFCED8]">
                  피부 트러블 주의
                </span>
              </div>
              <p className="text-xs text-rose-950/80 mt-0.5 leading-relaxed">
                EXP 기한 또는 개봉 후 사용기한(PAO)이 경과한 화장품을 즉시 비우세요.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('cosmetics')}
            className="shrink-0 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-modern-sm transition-all active:scale-95"
          >
            파우치 비우기
          </button>
        </div>
      )}

      {/* Long-term Unworn Banners */}
      <div className="space-y-2.5">
        {/* 2-Year Unworn Banner */}
        {unwornCounts.twoYearCount > 0 && (
          <div className="bg-[#FFF4DE] border border-[#FFE8C4] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-modern-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFE8C4] flex items-center justify-center text-amber-900 shrink-0 mt-0.5">
                <Heart size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-amber-950">
                    2년 이상 미착용 의류 {unwornCounts.twoYearCount}벌 감지
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold bg-white/70 px-2 py-0.5 rounded-full">
                    아름다운가게 기부 추천
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                  오랫동안 착용하지 않은 옷을 정리하거나 기부하여 옷장을 순환시키세요.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPurgeModal}
              className="shrink-0 px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-95"
            >
              기부·정리하기
            </button>
          </div>
        )}

        {/* 1-Year Unworn Banner */}
        {unwornCounts.oneYearCount > 0 && (
          <div className="bg-[#FFFDF8] border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-2 shadow-modern-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <AlertTriangle size={15} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  1년 이상 미착용 의류 <strong className="font-mono">{unwornCounts.oneYearCount}벌</strong> (점검 권장)
                </h4>
                <p className="text-[11px] text-amber-800/80 mt-0.5">
                  이번 시즌에 새롭게 코디해 보거나 처분 계획을 세워보세요.
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectUnwornFilter('1year')}
              className="text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl transition-colors shrink-0 flex items-center gap-0.5"
            >
              목록 확인 <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Category Summary Grid */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#FFCED8] shadow-modern space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#FFF4DE] flex items-center justify-center text-rose-600">
              <Layers size={14} />
            </div>
            <h3 className="text-xs font-bold text-gray-900">카테고리별 의류 현황</h3>
          </div>
          <button
            onClick={() => onNavigateTab('closet')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5"
          >
            전체 보기 <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {categorySummary.map((cat) => (
            <button
              key={cat.category}
              onClick={() => {
                onSelectCategoryFilter(cat.category);
                onNavigateTab('closet');
              }}
              className="p-3 bg-[#FFFDF9] hover:bg-[#FFF4DE]/50 border border-rose-100 hover:border-[#FFCED8] rounded-2xl text-center transition-all group"
            >
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-rose-700 block truncate">
                {cat.label}
              </span>
              <div className="text-base font-mono font-bold text-gray-900 group-hover:text-rose-600 mt-1">
                {cat.count}
                <span className="text-[10px] font-normal text-gray-400 ml-0.5">벌</span>
              </div>
              <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                평균 {cat.avgWears}회
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Navigation Panels */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('ootd')}
          className="p-4 bg-white border border-[#FFCED8] rounded-2xl text-left shadow-modern hover:shadow-modern-md transition-all group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFDDDD] text-rose-600 flex items-center justify-center mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Camera size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-rose-500 block uppercase font-bold">Daily Journal</span>
            <h4 className="text-xs font-bold text-gray-900 group-hover:text-rose-600 transition-colors mt-0.5">
              오늘의 착샷 기록
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              착용한 옷을 매칭하고 착용 카운트를 갱신합니다.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('styling')}
          className="p-4 bg-white border border-[#FFCED8] rounded-2xl text-left shadow-modern hover:shadow-modern-md transition-all group flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FFF4DE] text-amber-700 flex items-center justify-center mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-[10px] font-mono text-amber-600 block uppercase font-bold">Personal Stylist</span>
            <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors mt-0.5">
              AI 맞춤 코디 스튜디오
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              날씨와 체형에 최적화된 조합을 제안합니다.
            </p>
          </div>
        </button>
      </div>

      {/* Lifetime Most Worn Item */}
      {topWornItem && (
        <div className="bg-white rounded-3xl p-4.5 border border-[#FFCED8] shadow-modern space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900">
              최다 착용 에센셜 (착용 1위)
            </h3>
            <span className="text-[11px] font-mono font-semibold text-rose-700 bg-[#FFDDDD] px-2.5 py-0.5 rounded-full">
              누적 {topWornItem.wearCount}회 착용
            </span>
          </div>

          <div className="flex items-center gap-3.5 bg-[#FFFDF8] p-3 rounded-2xl border border-rose-100">
            <div className="aspect-3/4 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <img
                src={topWornItem.frontImage}
                alt={topWornItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-gray-500 font-mono">
                {topWornItem.store} · {topWornItem.category}
              </div>
              <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">
                {topWornItem.name}
              </h4>
              <p className="text-[11px] text-gray-600 mt-1 font-mono">
                1회 착용당{' '}
                <strong className="text-rose-600 font-bold">
                  {calculateCostPerWear(topWornItem.price, topWornItem.wearCount).cpw.toLocaleString()}원
                </strong>
                <span className="text-gray-400"> (구매가 {topWornItem.price?.toLocaleString()}원)</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Body Quick Summary Banner */}
      <div
        onClick={() => onNavigateTab('body')}
        className="p-3.5 bg-white hover:bg-[#FFF4DE]/40 border border-[#FFCED8] cursor-pointer rounded-2xl flex items-center justify-between transition-colors text-xs shadow-modern-sm"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="font-mono text-gray-700">
            신체 프로필: {bodyProfile.height}cm · {bodyProfile.weight}kg · 허리 {bodyProfile.waistInch}인치({bodyProfile.waistCm}cm)
          </span>
        </div>
        <span className="text-rose-600 font-bold flex items-center gap-0.5 text-[11px]">
          상세 기록 <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
};
