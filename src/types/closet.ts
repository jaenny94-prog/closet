export type ClothingCategory = 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'onepiece' | 'bags_accessories';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  frontImage: string;
  backImage: string;
  tagImage: string;
  price: number;
  store: string;
  purchaseDate: string; // YYYY-MM-DD
  wearCount: number;
  lastWornDate?: string; // YYYY-MM-DD
  season: string[];
  tempRange: {
    min: number;
    max: number;
    description: string;
  };
  weatherCondition?: string;
  tpoTags: string[];
  color: string;
  size: string;
  targetWaistInch?: number;
  status: 'active' | 'donated' | 'purged' | 'sold';
  notes?: string;
  donationNote?: string;
  customCategories?: string[]; // IDs or names of custom collections (e.g. '페이보릿 ⭐')
}

export interface CustomCategory {
  id: string;
  name: string;
  emoji?: string;
  color?: string; // background tint
  createdAt: string;
}

export type AppThemeId = 'warm_shop' | 'toss_gray' | 'pastel_diary' | 'dark_chic' | 'blossom_pink';

export interface AppThemeConfig {
  id: AppThemeId;
  name: string;
  subtitle: string;
  previewColors: [string, string, string]; // 3 palette swatches
  isDark?: boolean;
}

export interface OOTDRecord {
  id: string;
  date: string; // YYYY-MM-DD
  image: string;
  clothingItemIds: string[];
  tpo: string;
  weather: {
    temp: number;
    condition: string;
  };
  memo?: string;
  createdAt: string;
}

export interface DietTarget {
  startWeight: number; // kg
  startWaistInch: number; // inch
  targetWeight: number; // kg
  targetWaistInch: number; // inch
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD (D-Day)
}

export interface BodyLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  waistInch: number; // inch
  waistCm: number; // cm
  chestCm?: number;
  hipCm?: number;
  note?: string;
}

export interface BodyProfile {
  height: number; // cm
  weight: number; // kg (current)
  waistInch: number; // inch (current)
  waistCm: number; // cm (current)
  chestCm?: number;
  hipCm?: number;
  topSize: string;
  bottomSize: string;
  dietTarget: DietTarget;
  bodyLogs: BodyLogEntry[];
  updatedAt: string;
}

export interface OutfitRecommendation {
  id: string;
  top?: ClothingItem;
  bottom?: ClothingItem;
  outerwear?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
  title: string;
  colorHarmonyReason: string;
  silhouetteReason: string;
  bodyFitReason: string;
  weatherSuitabilityReason: string;
  dietMotivationTip?: string;
  stylistTips: string[];
}

export type CosmeticCategory =
  | 'skincare'     // 기초스킨케어 (토너/세럼/크림)
  | 'base'         // 베이스메이크업 (쿠션/파운데이션/프라이머)
  | 'lip'          // 립 (틴트/립스틱/립밤)
  | 'eye'          // 아이 (아이라이너/마스카라/섀도우)
  | 'suncare'      // 선케어 (선크림/선스틱)
  | 'cleansing'    // 클렌징/팩
  | 'other';       // 기타/바디/향수

export interface CosmeticItem {
  id: string;
  name: string;
  brand: string;
  category: CosmeticCategory;
  frontImage: string;
  labelImage?: string;
  purchaseDate?: string;    // YYYY-MM-DD
  openedDate: string;       // YYYY-MM-DD (개봉일 - 핵심)
  expDate: string;          // YYYY-MM-DD (기본 유통기한)
  paoMonths: number;        // 개봉 후 권장 사용월수 (예: 6, 12, 24)
  effectiveExpiryDate: string; // YYYY-MM-DD: min(expDate, openedDate + paoMonths)
  price?: number;
  memo?: string;
  status: 'active' | 'discarded'; // 사용 중 / 비우기(버리기 완료)
  createdAt: string;
}

export type CosmeticDDayStatus = 'safe' | 'impending' | 'expired';

export interface CosmeticDDayInfo {
  daysRemaining: number;
  status: CosmeticDDayStatus;
  dDayText: string;       // e.g. "D-45", "D-15", "D+60"
  label: string;          // "안전", "사용 임박 (30일 이내)", "기한 만료 (버리기 권장)"
  reason: 'exp' | 'pao';  // 만료일 기준 (EXP vs 개봉일+PAO)
}
