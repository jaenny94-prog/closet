import { AppThemeId, AppThemeConfig } from '../types/closet';

export interface ThemeStyles {
  id: AppThemeId;
  name: string;
  subtitle: string;
  previewColors: [string, string, string];
  isDark: boolean;
  // CSS class mappings
  appBg: string;
  containerBg: string;
  containerBorder: string;
  headerBg: string;
  headerBorder: string;
  cardBg: string;
  cardBorder: string;
  cardInnerBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentPrimary: string;
  accentHover: string;
  accentLight: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  bottomNavBg: string;
  bottomNavBorder: string;
  bottomNavActiveText: string;
  bottomNavActiveBg: string;
  bottomNavInactiveText: string;
  bannerGradient: string;
}

export const APP_THEMES: Record<AppThemeId, ThemeStyles> = {
  // 1. Warm Atelier (따뜻한 웜톤 편집샵 - 29CM, 르메르)
  warm_shop: {
    id: 'warm_shop',
    name: '따뜻한 웜톤 편집샵',
    subtitle: '크림 아이보리 & 에스프레소 브라운 (29CM 감성)',
    previewColors: ['#FAF8F5', '#3E362E', '#6B705C'],
    isDark: false,
    appBg: 'bg-[#FAF8F5]',
    containerBg: 'bg-[#FAF8F5]',
    containerBorder: 'border-[#EAE3D9]',
    headerBg: 'bg-[#FAF8F5]/95',
    headerBorder: 'border-[#EAE3D9]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#EAE3D9]',
    cardInnerBg: 'bg-[#F5EFE6]',
    textPrimary: 'text-[#3E362E]',
    textSecondary: 'text-[#6B705C]',
    textMuted: 'text-[#9A948D]',
    accentPrimary: 'bg-[#3E362E]',
    accentHover: 'hover:bg-[#2A241E]',
    accentLight: 'bg-[#F3EFEA]',
    accentText: 'text-[#3E362E]',
    badgeBg: 'bg-[#EAE3D9]',
    badgeText: 'text-[#3E362E]',
    bottomNavBg: 'bg-[#3E362E]/95',
    bottomNavBorder: 'border-[#5A5046]/40',
    bottomNavActiveText: 'text-[#F5EFE6]',
    bottomNavActiveBg: 'bg-white/15',
    bottomNavInactiveText: 'text-[#C5BEB5]',
    bannerGradient: 'bg-gradient-to-r from-[#F5EFE6] via-[#FAF8F5] to-[#EAE3D9]',
  },

  // 2. Toss Minimal Gray (모던 토스 그레이 - 토스/애플 스타일)
  toss_gray: {
    id: 'toss_gray',
    name: '모던 토스 그레이',
    subtitle: '쿨 라이트 그레이 & 인디고 블루 (토스/애플 스타일)',
    previewColors: ['#F2F4F6', '#3182F6', '#4E5968'],
    isDark: false,
    appBg: 'bg-[#F2F4F6]',
    containerBg: 'bg-[#F2F4F6]',
    containerBorder: 'border-[#E5E8EB]',
    headerBg: 'bg-white/95',
    headerBorder: 'border-[#E5E8EB]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#E5E8EB]',
    cardInnerBg: 'bg-[#F9FAFB]',
    textPrimary: 'text-[#191F28]',
    textSecondary: 'text-[#4E5968]',
    textMuted: 'text-[#8B95A1]',
    accentPrimary: 'bg-[#3182F6]',
    accentHover: 'hover:bg-[#1B64DA]',
    accentLight: 'bg-[#E8F3FF]',
    accentText: 'text-[#3182F6]',
    badgeBg: 'bg-[#E8F3FF]',
    badgeText: 'text-[#1B64DA]',
    bottomNavBg: 'bg-[#191F28]/95',
    bottomNavBorder: 'border-[#333D4B]',
    bottomNavActiveText: 'text-[#3182F6]',
    bottomNavActiveBg: 'bg-[#3182F6]/20',
    bottomNavInactiveText: 'text-[#8B95A1]',
    bannerGradient: 'bg-gradient-to-r from-[#E8F3FF] via-[#F2F4F6] to-[#E5E8EB]',
  },

  // 3. Pastel Diary (파스텔 다이어리 - 핀터레스트, 지그재그)
  pastel_diary: {
    id: 'pastel_diary',
    name: '파스텔 다이어리',
    subtitle: '밀크 화이트 & 소프트 라벤더 & 버터 옐로우',
    previewColors: ['#FDFBF9', '#8B5CF6', '#FEF08A'],
    isDark: false,
    appBg: 'bg-[#FDFBF9]',
    containerBg: 'bg-[#FDFBF9]',
    containerBorder: 'border-[#DDD6FE]',
    headerBg: 'bg-[#FDFBF9]/95',
    headerBorder: 'border-[#DDD6FE]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#DDD6FE]/70',
    cardInnerBg: 'bg-[#F5F3FF]',
    textPrimary: 'text-[#2E1065]',
    textSecondary: 'text-[#6D28D9]',
    textMuted: 'text-[#8B5CF6]/70',
    accentPrimary: 'bg-[#8B5CF6]',
    accentHover: 'hover:bg-[#7C3AED]',
    accentLight: 'bg-[#EDE9FE]',
    accentText: 'text-[#8B5CF6]',
    badgeBg: 'bg-[#FEF08A]',
    badgeText: 'text-[#854D0E]',
    bottomNavBg: 'bg-[#2E1065]/95',
    bottomNavBorder: 'border-[#8B5CF6]/30',
    bottomNavActiveText: 'text-[#FEF08A]',
    bottomNavActiveBg: 'bg-[#8B5CF6]/30',
    bottomNavInactiveText: 'text-[#C4B5FD]',
    bannerGradient: 'bg-gradient-to-r from-[#FEF08A]/60 via-[#FDFBF9] to-[#EDE9FE]',
  },

  // 4. Chic Midnight (시크한 다크 모드 - 네온 민트 포인트)
  dark_chic: {
    id: 'dark_chic',
    name: '시크한 다크 모드',
    subtitle: '딥 차콜 & 네온 민트 (눈이 편안한 프리미엄)',
    previewColors: ['#121212', '#1E1E1E', '#10B981'],
    isDark: true,
    appBg: 'bg-[#121212]',
    containerBg: 'bg-[#121212]',
    containerBorder: 'border-[#2A2A2A]',
    headerBg: 'bg-[#1A1A1A]/95',
    headerBorder: 'border-[#2A2A2A]',
    cardBg: 'bg-[#1E1E1E]',
    cardBorder: 'border-[#2E2E2E]',
    cardInnerBg: 'bg-[#262626]',
    textPrimary: 'text-[#F3F4F6]',
    textSecondary: 'text-[#9CA3AF]',
    textMuted: 'text-[#6B7280]',
    accentPrimary: 'bg-[#10B981]',
    accentHover: 'hover:bg-[#059669]',
    accentLight: 'bg-[#10B981]/20',
    accentText: 'text-[#34D399]',
    badgeBg: 'bg-[#10B981]/20',
    badgeText: 'text-[#34D399]',
    bottomNavBg: 'bg-[#1A1A1A]/95',
    bottomNavBorder: 'border-[#333333]',
    bottomNavActiveText: 'text-[#34D399]',
    bottomNavActiveBg: 'bg-[#10B981]/25',
    bottomNavInactiveText: 'text-[#6B7280]',
    bannerGradient: 'bg-gradient-to-r from-[#1E293B] via-[#1E1E1E] to-[#064E3B]/40',
  },

  // 5. Blossom Pink (소프트 블러시 핑크 - Color Hunt 팔레트)
  blossom_pink: {
    id: 'blossom_pink',
    name: '소프트 블러시 핑크',
    subtitle: '블러썸 핑크 & 피치 바닐라 (Color Hunt 감성)',
    previewColors: ['#FFCED8', '#FFF4DE', '#FFE8C4'],
    isDark: false,
    appBg: 'bg-[#FFFDF9]',
    containerBg: 'bg-[#FFFDF9]',
    containerBorder: 'border-[#FFCED8]',
    headerBg: 'bg-[#FFFDF9]/95',
    headerBorder: 'border-[#FFCED8]',
    cardBg: 'bg-white',
    cardBorder: 'border-[#FFCED8]',
    cardInnerBg: 'bg-[#FFFDF8]',
    textPrimary: 'text-[#2D1E22]',
    textSecondary: 'text-[#881337]',
    textMuted: 'text-[#9F1239]/60',
    accentPrimary: 'bg-rose-600',
    accentHover: 'hover:bg-rose-700',
    accentLight: 'bg-[#FFDDDD]/60',
    accentText: 'text-rose-600',
    badgeBg: 'bg-[#FFDDDD]',
    badgeText: 'text-rose-900',
    bottomNavBg: 'bg-[#2D1E22]/95',
    bottomNavBorder: 'border-[#FFCED8]/20',
    bottomNavActiveText: 'text-[#FFCED8]',
    bottomNavActiveBg: 'bg-[#FFCED8]/25',
    bottomNavInactiveText: 'text-rose-200/60',
    bannerGradient: 'bg-gradient-to-r from-[#FFF4DE] via-[#FFDDDD] to-[#FFCED8]',
  },
};

export const THEME_LIST: ThemeStyles[] = [
  APP_THEMES.warm_shop,
  APP_THEMES.toss_gray,
  APP_THEMES.pastel_diary,
  APP_THEMES.dark_chic,
  APP_THEMES.blossom_pink,
];
