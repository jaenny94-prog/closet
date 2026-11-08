import React, { useState } from 'react';
import {
  X,
  Calendar,
  DollarSign,
  UserCheck,
  Check,
  Trash2,
} from 'lucide-react';
import { ClothingItem, BodyProfile, CustomCategory } from '../../types/closet';
import { calculateCostPerWear, calculateUnwornStatus, analyzeFitAdvice } from '../../utils/closetLogic';
import { FolderHeart } from 'lucide-react';

interface ClothingDetailModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  bodyProfile: BodyProfile;
  customCategories?: CustomCategory[];
  onIncrementWear: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onUpdateStatus: (id: string, status: 'active' | 'donated' | 'purged' | 'sold') => void;
  onToggleCustomCategory?: (itemId: string, categoryId: string) => void;
}

export const ClothingDetailModal: React.FC<ClothingDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  bodyProfile,
  customCategories = [],
  onIncrementWear,
  onDeleteItem,
  onToggleCustomCategory,
}) => {
  if (!isOpen || !item) return null;

  const [activePhoto, setActivePhoto] = useState<'front' | 'back' | 'tag'>('front');

  const cpwInfo = calculateCostPerWear(item.price, item.wearCount);
  const unwornInfo = calculateUnwornStatus(item.lastWornDate, item.purchaseDate);
  const fitAdvice = analyzeFitAdvice(bodyProfile, item);

  const currentImage =
    activePhoto === 'back' && item.backImage
      ? item.backImage
      : activePhoto === 'tag' && item.tagImage
      ? item.tagImage
      : item.frontImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-modern-float overflow-hidden border border-zinc-200">
        {/* Header Bar */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-zinc-200 bg-white">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
            <span className="font-semibold text-zinc-900 uppercase">
              {item.category}
            </span>
            <span>·</span>
            <span>{item.store}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
          {/* Main Photo (3:4 Ratio Lookbook Frame) & Selector */}
          <div className="relative aspect-[3/4] max-h-80 mx-auto w-full rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
            <img
              src={currentImage}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {/* 3 Photo Switcher */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1 rounded-lg">
              <button
                onClick={() => setActivePhoto('front')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activePhoto === 'front'
                    ? 'bg-white text-zinc-900 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                정면
              </button>
              {item.backImage && (
                <button
                  onClick={() => setActivePhoto('back')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
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
                  onClick={() => setActivePhoto('tag')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    activePhoto === 'tag'
                      ? 'bg-white text-zinc-900 font-semibold'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                >
                  바코드/택
                </button>
              )}
            </div>
          </div>

          {/* Title & Price Info */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-modern-sm">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">{item.name}</h2>
            <div className="flex items-center gap-2 text-xs text-zinc-600 mt-1.5 flex-wrap font-mono">
              <span>
                구매가: <strong className="text-zinc-900 font-bold">{item.price?.toLocaleString()}원</strong>
              </span>
              <span className="text-zinc-300">·</span>
              <span>사이즈: {item.size || 'Free'}</span>
              <span className="text-zinc-300">·</span>
              <span>색상: {item.color}</span>
            </div>

            {/* Custom Collection Tags */}
            {customCategories.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-medium mr-1 flex items-center gap-1">
                  <FolderHeart size={12} className="text-rose-500" />
                  컬렉션:
                </span>
                {customCategories.map((cat) => {
                  const isTagged = (item.customCategories || []).includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onToggleCustomCategory && onToggleCustomCategory(item.id, cat.id)}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition-all border cursor-pointer ${
                        isTagged
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs font-bold'
                          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cost-Per-Wear (가성비 지표) Box */}
          <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-3 shadow-modern-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <DollarSign size={14} className="text-zinc-700" />
                <span>1회 착용 비용 (CPW)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-zinc-100 text-zinc-800">
                {cpwInfo.grade}등급 ({cpwInfo.gradeText})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 font-mono">
                <span className="text-[11px] text-zinc-500 block">총 누적 착용</span>
                <span className="text-lg font-bold text-zinc-900">{item.wearCount}회</span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200/70 font-mono">
                <span className="text-[11px] text-zinc-500 block">1회 착용당 비용</span>
                <span className="text-lg font-bold text-zinc-900">
                  {cpwInfo.cpw.toLocaleString()}원
                </span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 leading-relaxed font-mono">
              {item.wearCount === 0
                ? '첫 착용을 기록하면 실질 가성비가 계산됩니다.'
                : `구매가 대비 1회당 약 ${(item.price - cpwInfo.cpw).toLocaleString()}원의 착용 가치를 실현했습니다.`}
            </p>
          </div>

          {/* Unworn Status & Last Worn */}
          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-modern-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500 flex items-center gap-1.5">
                <Calendar size={13} className="text-zinc-400" /> 마지막 착용일
              </span>
              <strong className="text-zinc-900 font-medium">
                {item.lastWornDate || `${item.purchaseDate} (구매 후 미착용)`}
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 font-mono">
              <span className="text-zinc-500">미착용 상태</span>
              <span className={`px-2 py-0.5 rounded font-medium text-[11px] ${
                unwornInfo.isTwoYearUnworn
                  ? 'bg-rose-100 text-rose-800'
                  : unwornInfo.isOneYearUnworn
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-zinc-100 text-zinc-700'
              }`}>
                {unwornInfo.label}
              </span>
            </div>
          </div>

          {/* Body Fit Diagnosis */}
          <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl space-y-1">
            <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <UserCheck size={14} className="text-zinc-700" />
              <span>신체 치수 기반 핏 가이드</span>
            </span>
            <p className="text-xs text-zinc-700 leading-relaxed">
              {fitAdvice}
            </p>
          </div>

          {/* AI Recommended Weather & TPO */}
          <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-modern-sm space-y-1.5 text-xs text-zinc-700 font-mono">
            <div>
              <span className="text-zinc-400">적정 기온: </span>
              <span className="text-zinc-900">{item.tempRange?.description || `${item.tempRange?.min}~${item.tempRange?.max}°C`}</span>
            </div>
            {item.tpoTags && item.tpoTags.length > 0 && (
              <div>
                <span className="text-zinc-400">추천 TPO: </span>
                <span className="text-zinc-900">{item.tpoTags.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center gap-2">
          <button
            onClick={() => onIncrementWear(item.id)}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-modern-sm transition-all active:scale-95"
          >
            <Check size={14} className="stroke-[2.5]" />
            <span>오늘 착용 완료 (+1)</span>
          </button>
          <button
            onClick={() => {
              if (confirm('이 의류를 옷장에서 완전히 삭제하시겠습니까?')) {
                onDeleteItem(item.id);
                onClose();
              }
            }}
            aria-label="의류 삭제"
            className="p-2.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

