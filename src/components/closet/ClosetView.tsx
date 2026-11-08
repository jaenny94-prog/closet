import React, { useState } from 'react';
import {
  Search,
  Plus,
  AlertTriangle,
  Heart,
  ArrowUpDown,
} from 'lucide-react';
import { ClothingItem, BodyProfile } from '../../types/closet';
import { ClothingCard } from './ClothingCard';
import { calculateUnwornStatus } from '../../utils/closetLogic';

interface ClosetViewProps {
  items: ClothingItem[];
  bodyProfile: BodyProfile;
  initialCategoryFilter?: string;
  initialUnwornFilter?: '1year' | '2year' | 'all';
  onIncrementWear: (id: string) => void;
  onClickDetail: (item: ClothingItem) => void;
  onOpenRegisterModal: () => void;
  onOpenPurgeModal: () => void;
}

export const ClosetView: React.FC<ClosetViewProps> = ({
  items,
  bodyProfile,
  initialCategoryFilter = 'all',
  initialUnwornFilter = 'all',
  onIncrementWear,
  onClickDetail,
  onOpenRegisterModal,
  onOpenPurgeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategoryFilter);
  const [unwornFilter, setUnwornFilter] = useState<'all' | '1year' | '2year'>(initialUnwornFilter);
  const [sortBy, setSortBy] = useState<'wears_desc' | 'unworn_desc' | 'price_desc' | 'newest'>('newest');

  const categories: Array<{ id: string; label: string }> = [
    { id: 'all', label: '전체' },
    { id: 'tops', label: '상의' },
    { id: 'bottoms', label: '하의' },
    { id: 'outerwear', label: '아우터' },
    { id: 'shoes', label: '신발' },
    { id: 'onepiece', label: '원피스/셋업' },
    { id: 'bags_accessories', label: '가방/소품' },
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    if (item.status !== 'active') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchStore = item.store.toLowerCase().includes(q);
      const matchTags = item.tpoTags?.some((t) => t.toLowerCase().includes(q));
      const matchColor = item.color.toLowerCase().includes(q);
      if (!matchName && !matchStore && !matchTags && !matchColor) return false;
    }

    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    const status = calculateUnwornStatus(item.lastWornDate, item.purchaseDate);
    if (unwornFilter === '1year' && !status.isOneYearUnworn && !status.isTwoYearUnworn) {
      return false;
    }
    if (unwornFilter === '2year' && !status.isTwoYearUnworn) {
      return false;
    }

    return true;
  });

  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'wears_desc') {
      return (b.wearCount || 0) - (a.wearCount || 0);
    }
    if (sortBy === 'unworn_desc') {
      const aDays = calculateUnwornStatus(a.lastWornDate, a.purchaseDate).daysSinceLastWorn;
      const bDays = calculateUnwornStatus(b.lastWornDate, b.purchaseDate).daysSinceLastWorn;
      return bDays - aDays;
    }
    if (sortBy === 'price_desc') {
      return (b.price || 0) - (a.price || 0);
    }
    return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
  });

  const oneYearCount = items.filter((i) => {
    if (i.status !== 'active') return false;
    const s = calculateUnwornStatus(i.lastWornDate, i.purchaseDate);
    return s.isOneYearUnworn || s.isTwoYearUnworn;
  }).length;

  const twoYearCount = items.filter((i) => {
    if (i.status !== 'active') return false;
    return calculateUnwornStatus(i.lastWornDate, i.purchaseDate).isTwoYearUnworn;
  }).length;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Wardrobe Archive
          </span>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            내 옷장 컬렉션
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-mono">
            보관 중인 의류 {items.filter((i) => i.status === 'active').length}벌
          </p>
        </div>
        <div className="flex gap-2">
          {twoYearCount > 0 && (
            <button
              onClick={onOpenPurgeModal}
              className="px-3 py-1.5 bg-[#FCE7F3] hover:bg-[#FBCFE8] text-[#E11D48] border border-[#FBCFE8] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Heart size={12} className="text-[#E11D48]" />
              <span>나눔 ({twoYearCount})</span>
            </button>
          )}
          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-1.5 bg-[#E11D48] hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>옷 등록</span>
          </button>
        </div>
      </div>

      {/* Search Input with Clean Architectural Styling */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="의류명, 브랜드, TPO, 색상 검색..."
          className="w-full text-xs bg-white border border-rose-100 rounded-xl pl-9 pr-14 py-2.5 focus:border-[#E11D48] focus:outline-hidden shadow-modern-sm font-medium text-zinc-900 placeholder-zinc-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-rose-400 hover:text-[#E11D48] font-medium"
          >
            초기화
          </button>
        )}
      </div>

      {/* Categories Horizontal Segmented Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-[#E11D48] text-white font-semibold shadow-sm'
                  : 'bg-[#FDF2F4] text-rose-900/80 hover:bg-[#FCE7F3] hover:text-[#E11D48]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Quick Unworn Filters Bar (Requirements 4.1 & 4.2) */}
      <div className="flex items-center justify-between gap-2 p-1.5 bg-[#FDF2F4] rounded-xl border border-[#FBCFE8]">
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => setUnwornFilter('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
              unwornFilter === 'all'
                ? 'bg-white text-[#E11D48] shadow-sm font-bold'
                : 'text-rose-900/70 hover:text-[#E11D48]'
            }`}
          >
            전체 의류
          </button>
          <button
            onClick={() => setUnwornFilter('1year')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              unwornFilter === '1year'
                ? 'bg-amber-100 text-amber-900 font-semibold shadow-sm'
                : 'text-rose-900/70 hover:text-amber-800'
            }`}
          >
            <AlertTriangle size={11} className="text-amber-600" />
            <span>1년+ 미착용 ({oneYearCount})</span>
          </button>
          <button
            onClick={() => setUnwornFilter('2year')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
              unwornFilter === '2year'
                ? 'bg-[#E11D48] text-white font-semibold shadow-sm'
                : 'text-rose-900/70 hover:text-[#E11D48]'
            }`}
          >
            <Heart size={11} className={unwornFilter === '2year' ? 'text-white' : 'text-[#E11D48]'} />
            <span>2년+ 미착용 ({twoYearCount})</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-[11px] font-mono bg-white border border-zinc-200 rounded-md px-2 py-1 font-medium text-zinc-700 focus:outline-hidden"
          >
            <option value="newest">최신 등록순</option>
            <option value="wears_desc">착용 횟수순</option>
            <option value="unworn_desc">미착용 기간순</option>
            <option value="price_desc">구매가 높은순</option>
          </select>
        </div>
      </div>

      {/* Grid of Clothes */}
      {sortedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center space-y-3 shadow-modern border border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-900">검색 조건에 맞는 의류가 없습니다</h3>
          <p className="text-xs text-zinc-500">
            필터 조건을 변경하거나 새로운 의류를 등록해 보세요.
          </p>
          <button
            onClick={onOpenRegisterModal}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 transition-colors inline-flex items-center gap-1.5 shadow-modern-sm active:scale-95"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>새 옷 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {sortedItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              bodyProfile={bodyProfile}
              onIncrementWear={onIncrementWear}
              onClickDetail={onClickDetail}
              onOpenPurgeModal={onOpenPurgeModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

