import React, { useState, useMemo } from 'react';
import {
  Plus,
  Sparkles,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Trash2,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Layers,
  Heart,
  Info,
} from 'lucide-react';
import { CosmeticItem, CosmeticCategory } from '../../types/closet';
import {
  calculateCosmeticDDay,
  getCosmeticsSummary,
  COSMETIC_CATEGORY_LABELS,
} from '../../utils/closetLogic';
import { CosmeticRegisterModal } from './CosmeticRegisterModal';

interface CosmeticsViewProps {
  cosmetics: CosmeticItem[];
  onSaveCosmetic: (item: Omit<CosmeticItem, 'id' | 'createdAt' | 'status'>) => void;
  onDiscardCosmetic: (id: string) => void;
  onDeleteCosmetic: (id: string) => void;
}

export const CosmeticsView: React.FC<CosmeticsViewProps> = ({
  cosmetics,
  onSaveCosmetic,
  onDiscardCosmetic,
  onDeleteCosmetic,
}) => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<
    'all' | 'impending' | 'expired' | 'safe'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [discardConfirmId, setDiscardConfirmId] = useState<string | null>(null);

  // Active items summary
  const summary = useMemo(() => {
    return getCosmeticsSummary(cosmetics);
  }, [cosmetics]);

  // Filtered cosmetics list
  const filteredItems = useMemo(() => {
    return cosmetics
      .filter((c) => c.status === 'active')
      .filter((c) => {
        // Status filter
        if (selectedStatusFilter !== 'all') {
          const dDay = calculateCosmeticDDay(c.effectiveExpiryDate);
          if (dDay.status !== selectedStatusFilter) return false;
        }
        // Category filter
        if (selectedCategory !== 'all' && c.category !== selectedCategory) {
          return false;
        }
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchBrand = c.brand.toLowerCase().includes(q);
          const matchMemo = (c.memo || '').toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchMemo) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by closest expiry date first
        return (
          new Date(a.effectiveExpiryDate).getTime() -
          new Date(b.effectiveExpiryDate).getTime()
        );
      });
  }, [cosmetics, selectedStatusFilter, selectedCategory, searchQuery]);

  const handleConfirmDiscard = (id: string) => {
    onDiscardCosmetic(id);
    setDiscardConfirmId(null);
  };

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-300">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#FFF4DE] via-[#FFDDDD] to-[#FFCED8] p-5 rounded-3xl border border-[#FFCED8] shadow-modern-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 backdrop-blur text-xs font-bold text-rose-700 mb-2 shadow-modern-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>화장품 유통기한 & PAO 관리</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              나의 뷰티 파우치
            </h1>
            <p className="text-xs text-rose-950/80 mt-1">
              개봉일과 용기 표기 기한을 자동 비교하여 최적의 안전 사용 만료일을 계산합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="shrink-0 px-3.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-modern flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>화장품 등록</span>
          </button>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-2.5 text-center border border-white/60 shadow-modern-sm">
            <p className="text-[11px] font-medium text-gray-500">전체 화장품</p>
            <p className="text-base font-extrabold text-gray-900 mt-0.5">
              {summary.totalCount}
              <span className="text-xs font-normal text-gray-500 ml-0.5">개</span>
            </p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('safe')}
            className={`rounded-2xl p-2.5 text-center border cursor-pointer transition-all ${
              selectedStatusFilter === 'safe'
                ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300'
                : 'bg-white/90 border-white/60 hover:bg-emerald-50'
            }`}
          >
            <p className="text-[11px] font-medium text-emerald-700 flex items-center justify-center gap-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>안전</span>
            </p>
            <p className="text-base font-extrabold text-emerald-700 mt-0.5">
              {summary.safeCount}
              <span className="text-xs font-normal ml-0.5">개</span>
            </p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('impending')}
            className={`rounded-2xl p-2.5 text-center border cursor-pointer transition-all ${
              selectedStatusFilter === 'impending'
                ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-300'
                : 'bg-white/90 border-white/60 hover:bg-amber-50'
            }`}
          >
            <p className="text-[11px] font-medium text-amber-700 flex items-center justify-center gap-0.5">
              <Clock className="w-3 h-3" />
              <span>사용 임박</span>
            </p>
            <p className="text-base font-extrabold text-amber-700 mt-0.5">
              {summary.impendingCount}
              <span className="text-xs font-normal ml-0.5">개</span>
            </p>
          </div>

          <div
            onClick={() => setSelectedStatusFilter('expired')}
            className={`rounded-2xl p-2.5 text-center border cursor-pointer transition-all ${
              selectedStatusFilter === 'expired'
                ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-300'
                : 'bg-white/90 border-white/60 hover:bg-rose-50'
            }`}
          >
            <p className="text-[11px] font-medium text-rose-700 flex items-center justify-center gap-0.5">
              <AlertTriangle className="w-3 h-3" />
              <span>기한 만료</span>
            </p>
            <p className="text-base font-extrabold text-rose-700 mt-0.5">
              {summary.expiredCount}
              <span className="text-xs font-normal ml-0.5">개</span>
            </p>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if expired items exist */}
      {summary.expiredCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 shadow-modern-sm">
          <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs text-rose-950">
            <p className="font-bold text-sm text-rose-900">
              유통기한 지난 화장품 {summary.expiredCount}개가 있습니다!
            </p>
            <p className="mt-0.5 text-rose-900/80 leading-relaxed">
              성분 변질 및 세균 증식 위험으로 피부 트러블이 발생할 수 있습니다.
              아래 목록에서 확인 후 비우기(버리기)를 권장합니다.
            </p>
            <button
              type="button"
              onClick={() => setSelectedStatusFilter('expired')}
              className="mt-2 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-modern-sm transition-colors"
            >
              <span>만료된 화장품 바로 확인하기</span>
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#FFCED8] shadow-modern-sm space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="제품명, 브랜드, 메모 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#FFFDF8] border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
            >
              지우기
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedStatusFilter('all')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 ${
              selectedStatusFilter === 'all'
                ? 'bg-rose-600 text-white shadow-modern-sm'
                : 'bg-rose-50 text-rose-950 hover:bg-rose-100 border border-rose-200/50'
            }`}
          >
            전체보기 ({summary.totalCount})
          </button>
          <button
            onClick={() => setSelectedStatusFilter('impending')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1 ${
              selectedStatusFilter === 'impending'
                ? 'bg-amber-500 text-white shadow-modern-sm'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>사용 임박 ({summary.impendingCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1 ${
              selectedStatusFilter === 'expired'
                ? 'bg-rose-600 text-white shadow-modern-sm'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>기한 만료 ({summary.expiredCount})</span>
          </button>
          <button
            onClick={() => setSelectedStatusFilter('safe')}
            className={`px-3 py-1.5 rounded-full font-semibold transition-all shrink-0 flex items-center gap-1 ${
              selectedStatusFilter === 'safe'
                ? 'bg-emerald-600 text-white shadow-modern-sm'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>안전 ({summary.safeCount})</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs border-t border-rose-100 pt-2.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체 카테고리
          </button>
          {(
            [
              'skincare',
              'base',
              'lip',
              'eye',
              'suncare',
              'cleansing',
              'other',
            ] as CosmeticCategory[]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-[#FFFDF8] text-gray-700 border border-rose-200/60 hover:bg-rose-50'
              }`}
            >
              {COSMETIC_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Cosmetics Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-[#FFCED8] shadow-modern-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF4DE] text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              해당하는 화장품이 없습니다
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery || selectedStatusFilter !== 'all' || selectedCategory !== 'all'
                ? '선택한 필터 조건에 맞는 화장품이 없습니다.'
                : '소중한 화장품을 등록하고 안전하게 관리해 보세요!'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-modern-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>화장품 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const dDay = calculateCosmeticDDay(item.effectiveExpiryDate);
            const isExpired = dDay.status === 'expired';
            const isImpending = dDay.status === 'impending';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl overflow-hidden border shadow-modern hover:shadow-modern-md transition-all flex flex-col ${
                  isExpired
                    ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20'
                    : isImpending
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20'
                    : 'border-[#FFCED8]'
                }`}
              >
                {/* Image Section with Polaroid aesthetic */}
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
                  <img
                    src={item.frontImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Left PAO badge */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold tracking-wider">
                    PAO {item.paoMonths}M
                  </div>

                  {/* Top Right D-Day badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black shadow-modern-sm flex items-center gap-1 ${
                        isExpired
                          ? 'bg-rose-600 text-white animate-pulse'
                          : isImpending
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isExpired && <AlertTriangle className="w-3.5 h-3.5" />}
                      {isImpending && <Clock className="w-3.5 h-3.5" />}
                      {!isExpired && !isImpending && <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>{dDay.dDayText}</span>
                    </span>
                  </div>

                  {/* Label photo thumbnail preview if exists */}
                  {item.labelImage && (
                    <div className="absolute bottom-2 right-2 w-10 h-10 rounded-lg overflow-hidden border border-white/80 shadow-modern-sm">
                      <img
                        src={item.labelImage}
                        alt="라벨"
                        className="w-full h-full object-cover"
                        title="EXP 및 라벨 사진"
                      />
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Brand & Category */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-rose-950">{item.brand}</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#FFF4DE] text-amber-900 font-medium text-[10px] border border-amber-200/50">
                        {COSMETIC_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Expiry Details Breakdown */}
                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#FFFDF8] border border-rose-100 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span>개봉일:</span>
                        <span className="font-medium text-gray-800">{item.openedDate}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span>용기 표기 EXP:</span>
                        <span className="font-medium text-gray-800">{item.expDate}</span>
                      </div>
                      <div className="pt-1 border-t border-rose-100/70 flex items-center justify-between">
                        <span className="font-bold text-rose-950">최종 만료일:</span>
                        <span
                          className={`font-extrabold ${
                            isExpired
                              ? 'text-rose-600'
                              : isImpending
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          {item.effectiveExpiryDate}
                        </span>
                      </div>
                    </div>

                    {/* Status note */}
                    <p
                      className={`text-[11px] font-semibold mt-2 ${
                        isExpired
                          ? 'text-rose-600'
                          : isImpending
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {dDay.label}
                    </p>

                    {/* Memo */}
                    {item.memo && (
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 italic">
                        "{item.memo}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {discardConfirmId === item.id ? (
                      <div className="w-full flex items-center gap-1.5 animate-in fade-in">
                        <button
                          type="button"
                          onClick={() => handleConfirmDiscard(item.id)}
                          className="flex-1 py-1.5 px-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors"
                        >
                          정말 비우기(버리기)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscardConfirmId(null)}
                          className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setDiscardConfirmId(item.id)}
                          className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                            isExpired
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-modern-sm'
                              : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200/60'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isExpired ? '만료되어 비우기' : '파우치 비우기'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCosmetic(item.id)}
                          title="영구 삭제"
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Registration Modal */}
      <CosmeticRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSave={onSaveCosmetic}
      />
    </div>
  );
};
