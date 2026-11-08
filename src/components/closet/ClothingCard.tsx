import React, { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  Plus,
  Heart,
} from 'lucide-react';
import { ClothingItem, BodyProfile, CustomCategory } from '../../types/closet';
import { calculateCostPerWear, calculateUnwornStatus } from '../../utils/closetLogic';

interface ClothingCardProps {
  item: ClothingItem;
  bodyProfile: BodyProfile;
  customCategories?: CustomCategory[];
  onIncrementWear: (id: string) => void;
  onClickDetail: (item: ClothingItem) => void;
  onOpenPurgeModal?: () => void;
}

export const ClothingCard: React.FC<ClothingCardProps> = ({
  item,
  bodyProfile,
  customCategories = [],
  onIncrementWear,
  onClickDetail,
  onOpenPurgeModal,
}) => {
  const [activePhoto, setActivePhoto] = useState<'front' | 'back' | 'tag'>('front');

  const cpwInfo = calculateCostPerWear(item.price, item.wearCount);
  const unwornInfo = calculateUnwornStatus(item.lastWornDate, item.purchaseDate);

  const currentImage =
    activePhoto === 'back' && item.backImage
      ? item.backImage
      : activePhoto === 'tag' && item.tagImage
      ? item.tagImage
      : item.frontImage;

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-modern hover:shadow-modern-md transition-all flex flex-col group border border-zinc-200/80 hover:border-zinc-300">
      {/* 3:4 Lookbook Photo Slot */}
      <div className="relative aspect-[3/4] w-full bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200/60">
        <img
          src={currentImage}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          loading="lazy"
        />

        {/* Unworn warning badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {unwornInfo.isTwoYearUnworn && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPurgeModal?.();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-medium rounded-md shadow-sm hover:bg-rose-700 transition-colors"
            >
              <Heart size={10} className="fill-white" />
              <span>2년+ 미착용 (나눔)</span>
            </button>
          )}
          {unwornInfo.isOneYearUnworn && !unwornInfo.isTwoYearUnworn && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white text-[10px] font-medium rounded-md shadow-sm">
              <AlertTriangle size={10} />
              <span>1년+ 미착용 (점검)</span>
            </span>
          )}
          {item.status !== 'active' && (
            <span className="px-2 py-0.5 bg-zinc-800 text-white text-[9px] font-medium rounded-md">
              {item.status === 'donated' ? '기부 완료' : item.status === 'sold' ? '판매 완료' : '정리 완료'}
            </span>
          )}
        </div>

        {/* Cost Per Wear Grade Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-zinc-900/85 text-white backdrop-blur-xs">
            CPW {cpwInfo.grade}급
          </span>
        </div>

        {/* 3-Photo Segmented Switcher */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center bg-zinc-900/80 backdrop-blur-md px-1.5 py-1 rounded-lg text-white">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePhoto('front');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activePhoto === 'front'
                  ? 'bg-white text-zinc-900 font-semibold'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              정면
            </button>
            {item.backImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhoto('back');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activePhoto === 'back'
                    ? 'bg-white text-zinc-900 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                뒷면
              </button>
            )}
            {item.tagImage && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhoto('tag');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                  activePhoto === 'tag'
                    ? 'bg-white text-zinc-900 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                택
              </button>
            )}
          </div>
          <span className="text-[10px] font-mono text-zinc-300 pr-1">
            {unwornInfo.label}
          </span>
        </div>
      </div>

      {/* Card Content: Zero-Pill Discipline */}
      <div className="pt-3 px-0.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Size (Unboxed Metadata) */}
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1 font-mono">
            <span className="truncate max-w-[140px]">
              {item.store || '스토어 미상'}
            </span>
            <span className="text-zinc-700 font-medium">
              {item.size || 'Free'}
            </span>
          </div>

          {/* Item Name */}
          <h3
            onClick={() => onClickDetail(item)}
            className="text-sm font-semibold text-zinc-900 hover:text-zinc-600 cursor-pointer line-clamp-1 transition-colors tracking-tight"
          >
            {item.name}
          </h3>

          {/* Pricing & CPW Metric: Tabular Figures */}
          <div className="mt-2.5 p-2.5 bg-[#FDF2F4]/70 rounded-xl border border-[#FBCFE8]/60 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-700 font-medium">누적 착용</span>
              <strong className="text-rose-950 font-mono font-bold text-xs">
                {item.wearCount}회
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#FBCFE8]/60 font-mono">
              <span className="text-rose-700 font-medium">1회 착용당</span>
              <div className="text-right">
                <span className="text-xs font-bold text-[#E11D48]">
                  {cpwInfo.cpw.toLocaleString()}원
                </span>
                <span className="text-[10px] text-rose-400 block">
                  (구매가 {item.price?.toLocaleString()}원)
                </span>
              </div>
            </div>
          </div>

          {/* Custom Collection Badges */}
          {item.customCategories && item.customCategories.length > 0 && (
            <div className="mt-2 flex items-center gap-1 flex-wrap">
              {item.customCategories.map((catId) => {
                const found = customCategories.find((c) => c.id === catId || c.name === catId);
                const name = found ? found.name : catId;
                return (
                  <span
                    key={catId}
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FFF4DE] text-amber-900 border border-amber-200/60 shadow-2xs"
                  >
                    {name}
                  </span>
                );
              })}
            </div>
          )}

          {/* AI Weather & TPO Tags: Clean Unboxed Inline Text */}
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono flex-wrap">
            <span>{item.tempRange?.min}~{item.tempRange?.max}°C</span>
            {item.tpoTags && item.tpoTags.length > 0 && (
              <>
                <span className="text-zinc-300">·</span>
                <span>{item.tpoTags.slice(0, 2).join(' · ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-3 pt-2.5 border-t border-zinc-200/70 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onIncrementWear(item.id)}
            className="flex-1 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium transition-all shadow-modern-sm flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus size={13} className="stroke-[2.5]" />
            <span>착용 +1</span>
          </button>
          <button
            type="button"
            onClick={() => onClickDetail(item)}
            className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <Eye size={13} />
            <span>상세</span>
          </button>
        </div>
      </div>
    </div>
  );
};

