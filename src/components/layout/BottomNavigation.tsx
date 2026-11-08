import React from 'react';
import { LayoutGrid, Shirt, Camera, Sparkles, User, Heart } from 'lucide-react';

export type TabType = 'dashboard' | 'closet' | 'ootd' | 'styling' | 'body' | 'cosmetics';

interface BottomNavigationProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  unwornAlertCount?: number;
  cosmeticsAlertCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onChangeTab,
  unwornAlertCount = 0,
  cosmeticsAlertCount = 0,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: '대시보드', icon: LayoutGrid },
    {
      id: 'closet' as TabType,
      label: '내 옷장',
      icon: Shirt,
      badge: unwornAlertCount > 0 ? unwornAlertCount : undefined,
    },
    { id: 'ootd' as TabType, label: '착샷 기록', icon: Camera },
    { id: 'styling' as TabType, label: 'AI 코디', icon: Sparkles },
    { id: 'body' as TabType, label: '바디 로그', icon: User },
    {
      id: 'cosmetics' as TabType,
      label: '파우치',
      icon: Heart,
      badge: cosmeticsAlertCount > 0 ? cosmeticsAlertCount : undefined,
    },
  ];

  return (
    <nav
      aria-label="하단 네비게이션 바"
      className="fixed bottom-3 left-0 right-0 z-40 max-w-md mx-auto px-3 pointer-events-none pb-safe"
    >
      <div className="pointer-events-auto bg-[#2D1E22]/95 backdrop-blur-xl border border-[#FFCED8]/20 shadow-modern-float rounded-2xl p-1.5 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              aria-label={tab.label}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-white bg-[#FFCED8]/25 shadow-sm'
                  : 'text-rose-200/60 hover:text-rose-100 hover:bg-white/5'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={18}
                  className={`transition-colors ${
                    isActive ? 'text-[#FFCED8] stroke-[2.4]' : 'text-rose-200/60 stroke-[1.8]'
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#2D1E22] shadow-sm animate-pulse">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none ${
                  isActive ? 'font-bold text-[#FFCED8]' : 'font-medium text-rose-200/60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
