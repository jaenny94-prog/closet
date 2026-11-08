import React, { useState, useEffect, useMemo } from 'react';
import {
  INITIAL_CLOTHING_ITEMS,
  INITIAL_OOTD_RECORDS,
  INITIAL_BODY_PROFILE,
} from './data/sampleCloset';
import { SAMPLE_COSMETICS } from './data/sampleCosmetics';
import { ClothingItem, OOTDRecord, BodyProfile, CosmeticItem } from './types/closet';
import { BottomNavigation, TabType } from './components/layout/BottomNavigation';
import { DashboardView } from './components/dashboard/DashboardView';
import { ClosetView } from './components/closet/ClosetView';
import { OOTDView } from './components/ootd/OOTDView';
import { StylingView } from './components/styling/StylingView';
import { BodyTrackerView } from './components/body/BodyTrackerView';
import { CosmeticsView } from './components/cosmetics/CosmeticsView';
import { ClothingRegisterModal } from './components/closet/ClothingRegisterModal';
import { ClothingDetailModal } from './components/closet/ClothingDetailModal';
import { PurgeDonationModal } from './components/closet/PurgeDonationModal';
import { calculateUnwornStatus, getCosmeticsSummary } from './utils/closetLogic';
import { Sparkles, Plus, Heart } from 'lucide-react';

const STORAGE_KEYS = {
  ITEMS: 'smart_closet_items_v1',
  OOTDS: 'smart_closet_ootds_v1',
  BODY: 'smart_closet_body_v1',
  COSMETICS: 'smart_closet_cosmetics_v1',
};

export default function App() {
  // LocalStorage-backed state with initial sample seeds
  const [items, setItems] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ITEMS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading items from localStorage', e);
    }
    return INITIAL_CLOTHING_ITEMS;
  });

  const [ootdRecords, setOotdRecords] = useState<OOTDRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OOTDS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading OOTDs from localStorage', e);
    }
    return INITIAL_OOTD_RECORDS;
  });

  const [bodyProfile, setBodyProfile] = useState<BodyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BODY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_BODY_PROFILE,
          ...parsed,
          dietTarget: parsed.dietTarget || INITIAL_BODY_PROFILE.dietTarget,
          bodyLogs:
            Array.isArray(parsed.bodyLogs) && parsed.bodyLogs.length > 0
              ? parsed.bodyLogs
              : INITIAL_BODY_PROFILE.bodyLogs,
        };
      }
    } catch (e) {
      console.error('Error loading body profile from localStorage', e);
    }
    return INITIAL_BODY_PROFILE;
  });

  // Cosmetics state (with 3 initial sample items: safe, impending, expired)
  const [cosmetics, setCosmetics] = useState<CosmeticItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COSMETICS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cosmetics from localStorage', e);
    }
    return SAMPLE_COSMETICS;
  });

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ClothingItem | null>(null);

  // Filters passed from Dashboard into Closet
  const [closetCategoryFilter, setClosetCategoryFilter] = useState<string>('all');
  const [closetUnwornFilter, setClosetUnwornFilter] = useState<'all' | '1year' | '2year'>('all');
  const [selectedWeatherForStyling, setSelectedWeatherForStyling] = useState<{ temp: number; condition: string } | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OOTDS, JSON.stringify(ootdRecords));
    } catch (e) {
      console.error('Failed to save OOTDs', e);
    }
  }, [ootdRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BODY, JSON.stringify(bodyProfile));
    } catch (e) {
      console.error('Failed to save body profile', e);
    }
  }, [bodyProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COSMETICS, JSON.stringify(cosmetics));
    } catch (e) {
      console.error('Failed to save cosmetics', e);
    }
  }, [cosmetics]);

  // Handlers for Clothing
  const handleSaveClothingItem = (newItem: ClothingItem) => {
    setItems((prev) => [newItem, ...prev]);
    showToast(`✨ '${newItem.name}'이(가) 옷장에 쏘옥 등록되었어요!`);
  };

  const handleIncrementWear = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextCount = (item.wearCount || 0) + 1;
          showToast(`🌸 '${item.name}' 착용 횟수 갱신! (총 ${nextCount}회)`);
          return {
            ...item,
            wearCount: nextCount,
            lastWornDate: today,
          };
        }
        return item;
      })
    );
  };

  const handleSaveOOTD = (record: OOTDRecord) => {
    setOotdRecords((prev) => [record, ...prev]);

    // Automatically update wear count & last worn date for all matched clothes!
    setItems((prev) =>
      prev.map((item) => {
        if (record.clothingItemIds.includes(item.id)) {
          return {
            ...item,
            wearCount: (item.wearCount || 0) + 1,
            lastWornDate: record.date,
          };
        }
        return item;
      })
    );

    showToast(`📸 오늘의 착샷 일기 등록 완료! (${record.clothingItemIds.length}벌 착용 카운트 +1)`);
  };

  const handleDeleteOOTD = (id: string) => {
    setOotdRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('착샷 일기가 삭제되었습니다.');
  };

  const handleDeleteClothingItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast('의류가 옷장에서 삭제되었습니다.');
  };

  const handleUpdateItemStatus = (
    id: string,
    newStatus: 'active' | 'donated' | 'purged' | 'sold',
    note?: string
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status: newStatus,
            donationNote: note || undefined,
          };
        }
        return item;
      })
    );

    const statusNames = {
      donated: '아름다운가게 나눔 완료 🎁',
      purged: '의류수거함 정리 완료 🍃',
      sold: '중고 판매 완료 🏷️',
      active: '다시 옷장으로 🧸',
    };
    showToast(`🧸 '${statusNames[newStatus]}' 처리되었습니다!`);
  };

  // Handlers for Cosmetics
  const handleSaveCosmetic = (
    itemData: Omit<CosmeticItem, 'id' | 'createdAt' | 'status'>
  ) => {
    const newItem: CosmeticItem = {
      ...itemData,
      id: `cosme-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setCosmetics((prev) => [newItem, ...prev]);
    showToast(`✨ '${newItem.name}'이(가) 파우치에 등록되었습니다!`);
  };

  const handleDiscardCosmetic = (id: string) => {
    setCosmetics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'discarded' } : c))
    );
    showToast('🌿 화장품 비우기(폐기) 완료! 파우치가 깨끗해졌어요.');
  };

  const handleDeleteCosmetic = (id: string) => {
    setCosmetics((prev) => prev.filter((c) => c.id !== id));
    showToast('화장품이 목록에서 완전히 삭제되었습니다.');
  };

  const handleSelectCategoryFromDashboard = (cat: string) => {
    setClosetCategoryFilter(cat);
    setClosetUnwornFilter('all');
  };

  const handleSelectUnwornFromDashboard = (filter: '1year' | '2year') => {
    setClosetCategoryFilter('all');
    setClosetUnwornFilter(filter);
    setCurrentTab('closet');
  };

  const handleSelectForOOTD = (itemIds: string[], tpo: string, weather: { temp: number; condition: string }) => {
    setCurrentTab('ootd');
    showToast(`🎀 추천 코디(${tpo})가 OOTD 다이어리로 연결되었어요!`);
  };

  const handleSelectWeatherFromForecast = (temp: number, condition: string) => {
    setSelectedWeatherForStyling({ temp, condition });
    setCurrentTab('styling');
    showToast(`🌤️ ${temp}°C (${condition}) 날씨 맞춤 코디를 추천해 드릴게요!`);
  };

  // Count 2-year unworn items for badge in bottom bar
  const twoYearUnwornCount = useMemo(() => {
    return items.filter((i) => {
      if (i.status !== 'active') return false;
      return calculateUnwornStatus(i.lastWornDate, i.purchaseDate).isTwoYearUnworn;
    }).length;
  }, [items]);

  // Cosmetics alert count (expired + impending)
  const cosmeticsSummary = useMemo(() => {
    return getCosmeticsSummary(cosmetics);
  }, [cosmetics]);

  const cosmeticsAlertCount = cosmeticsSummary.expiredCount + cosmeticsSummary.impendingCount;

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex justify-center selection:bg-rose-500 selection:text-white">
      {/* Responsive Architectural Container */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl bg-[#FFFDF9] min-h-screen flex flex-col shadow-modern-lg relative border-x border-[#FFCED8]">
        {/* Top App Bar complying with Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#FFCED8] flex items-center justify-between">
          {/* Zone 1: Brand Wordmark */}
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFCED8] to-[#FFDDDD] border border-[#FFCED8] flex items-center justify-center text-rose-700 text-xs font-mono font-bold transition-transform group-hover:scale-95 shadow-sm">
              CA
            </div>
            <div>
              <span className="text-[13px] font-bold text-[#2D1E22] tracking-tight leading-tight block">
                스마트 옷장 & 뷰티 아카이브
              </span>
              <span className="text-[10px] text-rose-600 font-mono tracking-wider block uppercase">
                Wardrobe OS · Body Log · Beauty Pouch
              </span>
            </div>
          </div>

          {/* Zone 2 & 3: Badges & Exactly 1 Primary Action */}
          <div className="flex items-center gap-2">
            {twoYearUnwornCount > 0 && (
              <button
                onClick={() => setIsPurgeModalOpen(true)}
                className="px-2.5 py-1 text-rose-700 bg-[#FFDDDD] hover:bg-[#FFCED8] border border-[#FFCED8] rounded-xl text-[11px] font-semibold flex items-center gap-1 transition-colors"
              >
                <Heart size={11} className="text-rose-600" />
                <span>미착용 정리 {twoYearUnwornCount}</span>
              </button>
            )}
            <button
              onClick={() => {
                if (currentTab === 'cosmetics') {
                  // If already in cosmetics tab, quick add cosmetic
                  const btn = document.querySelector('button:has(svg.lucide-plus)') as HTMLButtonElement;
                  if (btn) btn.click();
                } else {
                  setIsRegisterModalOpen(true);
                }
              }}
              aria-label={currentTab === 'cosmetics' ? '화장품 등록' : '새 의류 등록'}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-modern-sm"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>{currentTab === 'cosmetics' ? '화장품 등록' : '새 옷 등록'}</span>
            </button>
          </div>
        </header>

        {/* Minimalist Floating Toast Message */}
        {toastMessage && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-[#2D1E22] text-white px-4 py-2.5 rounded-2xl shadow-modern-float text-xs font-medium flex items-center gap-2.5 border border-[#FFCED8]/40 animate-in slide-in-from-top-3 fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFCED8] shrink-0" />
            <span className="flex-1 leading-snug">{toastMessage}</span>
          </div>
        )}

        {/* Main Content Area based on Current Tab */}
        <main className="flex-1 p-4 overflow-x-hidden">
          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              ootdRecords={ootdRecords}
              bodyProfile={bodyProfile}
              cosmetics={cosmetics}
              onNavigateTab={setCurrentTab}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onOpenPurgeModal={() => setIsPurgeModalOpen(true)}
              onSelectCategoryFilter={handleSelectCategoryFromDashboard}
              onSelectUnwornFilter={handleSelectUnwornFromDashboard}
              onSelectWeatherForStyling={handleSelectWeatherFromForecast}
            />
          )}

          {currentTab === 'closet' && (
            <ClosetView
              items={items}
              bodyProfile={bodyProfile}
              initialCategoryFilter={closetCategoryFilter}
              initialUnwornFilter={closetUnwornFilter}
              onIncrementWear={handleIncrementWear}
              onClickDetail={(item) => setDetailItem(item)}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              onOpenPurgeModal={() => setIsPurgeModalOpen(true)}
            />
          )}

          {currentTab === 'ootd' && (
            <OOTDView
              items={items}
              ootdRecords={ootdRecords}
              onSaveOOTD={handleSaveOOTD}
              onDeleteOOTD={handleDeleteOOTD}
            />
          )}

          {currentTab === 'styling' && (
            <StylingView
              items={items}
              bodyProfile={bodyProfile}
              initialWeather={selectedWeatherForStyling}
              onSelectForOOTD={handleSelectForOOTD}
            />
          )}

          {currentTab === 'body' && (
            <BodyTrackerView
              bodyProfile={bodyProfile}
              items={items}
              onUpdateBodyProfile={setBodyProfile}
            />
          )}

          {currentTab === 'cosmetics' && (
            <CosmeticsView
              cosmetics={cosmetics}
              onSaveCosmetic={handleSaveCosmetic}
              onDiscardCosmetic={handleDiscardCosmetic}
              onDeleteCosmetic={handleDeleteCosmetic}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavigation
          currentTab={currentTab}
          onChangeTab={setCurrentTab}
          unwornAlertCount={twoYearUnwornCount}
          cosmeticsAlertCount={cosmeticsAlertCount}
        />

        {/* Modals */}
        <ClothingRegisterModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onSave={handleSaveClothingItem}
        />

        <ClothingDetailModal
          item={detailItem}
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          bodyProfile={bodyProfile}
          onIncrementWear={handleIncrementWear}
          onDeleteItem={handleDeleteClothingItem}
          onUpdateStatus={handleUpdateItemStatus}
        />

        <PurgeDonationModal
          isOpen={isPurgeModalOpen}
          onClose={() => setIsPurgeModalOpen(false)}
          items={items}
          onUpdateItemStatus={handleUpdateItemStatus}
        />
      </div>
    </div>
  );
}
