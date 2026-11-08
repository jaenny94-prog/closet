import { CosmeticItem } from '../types/closet';
import { calculateCosmeticExpiry } from '../utils/closetLogic';

/**
 * 3 realistic sample cosmetics showcasing:
 * 1. Safe (>30 days remaining)
 * 2. Impending expiry (<=30 days remaining, e.g. D-15)
 * 3. Expired (<0 days remaining, e.g. D+60)
 */
export const SAMPLE_COSMETICS: CosmeticItem[] = [
  {
    id: 'cosme-safe-1',
    name: '달바 화이트 트러플 퍼스트 스프레이 세럼 (100ml)',
    brand: 'd\'Alba (달바)',
    category: 'skincare',
    frontImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    labelImage: 'https://images.unsplash.com/photo-1608248597359-2c0b299e5595?auto=format&fit=crop&w=600&q=80',
    purchaseDate: '2026-09-28',
    openedDate: '2026-10-01',
    expDate: '2028-04-15',
    paoMonths: 12,
    effectiveExpiryDate: calculateCosmeticExpiry('2026-10-01', 12, '2028-04-15').effectiveExpiryDate,
    price: 29900,
    memo: '미스트 세럼 / 수분 충전 및 은은한 광채 연출 / 개봉 후 12M 권장',
    status: 'active',
    createdAt: '2026-10-01T09:00:00.000Z',
  },
  {
    id: 'cosme-impending-2',
    name: '맥 러스터글래스 립스틱 (씨 쉬어 See Sheer)',
    brand: 'M·A·C (맥)',
    category: 'lip',
    frontImage: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
    labelImage: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
    purchaseDate: '2025-11-15',
    openedDate: '2025-11-23',
    expDate: '2027-08-30',
    paoMonths: 12, // 개봉 12M 기준 2026-11-23 만료 (현재 11월 기준 D-15 임박!)
    effectiveExpiryDate: calculateCosmeticExpiry('2025-11-23', 12, '2027-08-30').effectiveExpiryDate,
    price: 38000,
    memo: '데일리 MLBB 립스틱 / 개봉 1년 기한 임박, 남은 양 15일 내 사용 권장!',
    status: 'active',
    createdAt: '2025-11-23T14:30:00.000Z',
  },
  {
    id: 'cosme-expired-3',
    name: '헤라 블랙 쿠션 SPF34 PA++ (21N1 바닐라)',
    brand: 'HERA (헤라)',
    category: 'base',
    frontImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    labelImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
    purchaseDate: '2025-08-20',
    openedDate: '2025-09-08',
    expDate: '2027-03-10',
    paoMonths: 12, // 2026-09-08 만료 (현재 기준 D+60일 경과)
    effectiveExpiryDate: calculateCosmeticExpiry('2025-09-08', 12, '2027-03-10').effectiveExpiryDate,
    price: 66000,
    memo: '쿠션 퍼프 및 제형 세균 번식 위험으로 기한 만료 후 즉시 폐기/리필 교체 권장',
    status: 'active',
    createdAt: '2025-09-08T11:20:00.000Z',
  },
];
