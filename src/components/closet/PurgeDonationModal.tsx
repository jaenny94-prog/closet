import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ExternalLink } from 'lucide-react';
import { ClothingItem } from '../../types/closet';
import { calculateUnwornStatus } from '../../utils/closetLogic';

interface PurgeDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ClothingItem[];
  onUpdateItemStatus: (itemId: string, newStatus: 'donated' | 'purged' | 'sold' | 'active', note?: string) => void;
}

export const PurgeDonationModal: React.FC<PurgeDonationModalProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateItemStatus,
}) => {
  if (!isOpen) return null;

  const twoYearItems = items.filter((item) => {
    if (item.status !== 'active') return false;
    const { isTwoYearUnworn } = calculateUnwornStatus(item.lastWornDate, item.purchaseDate);
    return isTwoYearUnworn;
  });

  const totalValue = twoYearItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const estimatedTaxCredit = Math.round(totalValue * 0.25);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-modern-float overflow-hidden border border-zinc-200">
        {/* Header Bar */}
        <div className="bg-rose-50 border-b border-rose-200/80 p-5 relative text-zinc-900">
          <button
            onClick={onClose}
            aria-label="닫기"
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-rose-100/60 transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-rose-100 rounded-lg text-rose-600">
              <Heart size={16} />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-rose-700">
              Wardrobe Circulation & Donation
            </span>
          </div>
          <h2 className="text-base font-bold text-zinc-900">
            2년 이상 미착용 의류 비우기 & 기부
          </h2>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            오랫동안 손이 닿지 않은 옷을 정리하거나 아름다운가게 등에 기부하여 의류 자원을 순환하세요.
          </p>
        </div>

        {/* Donation Value Banner */}
        <div className="bg-zinc-50 p-4 flex items-center justify-between text-xs border-b border-zinc-200">
          <div>
            <span className="text-zinc-900 font-medium block">
              미착용 대상: <strong className="font-mono">{twoYearItems.length}벌</strong> (취득가: {totalValue.toLocaleString()}원)
            </span>
            <span className="text-zinc-500 text-[11px] font-mono">
              기부 시 예상 세액공제 가치: <strong className="text-zinc-900 font-bold">약 {estimatedTaxCredit.toLocaleString()}원</strong>
            </span>
          </div>
          <a
            href="https://www.beautifulstore.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 bg-white px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 shadow-modern-sm transition-colors"
          >
            기부 안내 <ExternalLink size={11} />
          </a>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-zinc-50/50">
          {twoYearItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 space-y-2">
              <p className="font-bold text-zinc-900 text-sm">2년 이상 방치된 의류가 없습니다.</p>
              <p className="text-xs text-zinc-400">옷장 순환율이 양호하게 관리되고 있습니다.</p>
            </div>
          ) : (
            twoYearItems.map((item) => {
              const statusInfo = calculateUnwornStatus(item.lastWornDate, item.purchaseDate);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-3.5 shadow-modern-sm border border-zinc-200 flex flex-col gap-2.5"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.frontImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80'}
                      alt={item.name}
                      className="w-14 aspect-[3/4] rounded-lg object-cover shrink-0 bg-zinc-100 border border-zinc-200"
                    />
                    <div className="flex-1 min-w-0 font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-zinc-400">· {item.store || '구매처 미상'}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-900 truncate mt-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        구매가: <strong className="text-zinc-900 font-bold">{item.price?.toLocaleString()}원</strong> · 누적 {item.wearCount}회
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        마지막 착용: {item.lastWornDate || `${item.purchaseDate} (미착용)`}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-100">
                    <button
                      onClick={() => onUpdateItemStatus(item.id, 'donated', '아름다운가게 나눔 기부 완료')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      <Heart size={12} className="text-emerald-700" />
                      <span>기부 완료</span>
                    </button>
                    <button
                      onClick={() => onUpdateItemStatus(item.id, 'sold', '중고 판매 완료')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      <ShoppingBag size={12} />
                      <span>중고 판매</span>
                    </button>
                    <button
                      onClick={() => onUpdateItemStatus(item.id, 'purged', '의류수거함 정리')}
                      className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-lg text-[11px] font-medium transition-colors"
                    >
                      <Trash2 size={12} />
                      <span>수거함</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-zinc-200 flex items-center justify-between">
          <p className="text-[11px] text-zinc-400 font-mono">
            * 처리된 의류는 보관 아카이브로 이동됩니다.
          </p>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 text-xs font-medium rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

