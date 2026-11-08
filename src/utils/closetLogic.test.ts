import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCostPerWear,
  calculateUnwornStatus,
  convertWaist,
  getCategorySummary,
  getUnwornCounts,
  generateRuleBasedOutfit,
  calculateDietProgress,
  calculateCosmeticExpiry,
  calculateCosmeticDDay,
} from './closetLogic';
import { ClothingItem, BodyProfile, DietTarget } from '../types/closet';

test('calculateCostPerWear calculates CPW and assigns correct grades', () => {
  // 0 wears: cost equals purchase price, grade C
  const zeroWears = calculateCostPerWear(100000, 0);
  assert.equal(zeroWears.cpw, 100000);
  assert.equal(zeroWears.grade, 'C');

  // 10 wears: 10,000 KRW/wear, grade A
  const tenWears = calculateCostPerWear(100000, 10);
  assert.equal(tenWears.cpw, 10000);
  assert.equal(tenWears.grade, 'A');

  // 25 wears: 4,000 KRW/wear, grade S
  const twentyFiveWears = calculateCostPerWear(100000, 25);
  assert.equal(twentyFiveWears.cpw, 4000);
  assert.equal(twentyFiveWears.grade, 'S');
});

test('calculateUnwornStatus accurately distinguishes 1-year and 2-year thresholds', () => {
  const refDate = new Date('2026-11-01T00:00:00Z');

  // Recent: 30 days ago
  const recent = calculateUnwornStatus('2026-10-02', '2026-01-01', refDate);
  assert.equal(recent.isOneYearUnworn, false);
  assert.equal(recent.isTwoYearUnworn, false);
  assert.equal(recent.statusBadge, 'none');

  // 1-year unworn: 450 days ago (around 2025-08-08)
  const oneYear = calculateUnwornStatus('2025-08-08', '2025-01-01', refDate);
  assert.equal(oneYear.isOneYearUnworn, true);
  assert.equal(oneYear.isTwoYearUnworn, false);
  assert.equal(oneYear.statusBadge, '1year');

  // 2-year unworn: 800 days ago (around 2024-08-23)
  const twoYear = calculateUnwornStatus('2024-08-23', '2024-01-01', refDate);
  assert.equal(twoYear.isTwoYearUnworn, true);
  assert.equal(twoYear.isOneYearUnworn, false);
  assert.equal(twoYear.statusBadge, '2year');

  // Never worn, fallback to purchase date 800 days ago
  const neverWorn = calculateUnwornStatus('', '2024-08-23', refDate);
  assert.equal(neverWorn.isTwoYearUnworn, true);
});

test('convertWaist converts bidirectional inch and cm correctly', () => {
  const fromInch = convertWaist(28, 'inch');
  assert.equal(fromInch.inch, 28);
  assert.equal(fromInch.cm, 71.1);

  const fromCm = convertWaist(76.2, 'cm');
  assert.equal(fromCm.inch, 30);
  assert.equal(fromCm.cm, 76.2);
});

test('generateRuleBasedOutfit creates a matched outfit with reasoning', () => {
  const sampleItems: ClothingItem[] = [
    {
      id: 'top-1',
      name: '캐시미어 크루넥 니트',
      category: 'tops',
      frontImage: 'img1',
      backImage: '',
      tagImage: '',
      price: 89000,
      store: '무신사',
      purchaseDate: '2025-10-01',
      wearCount: 15,
      lastWornDate: '2026-10-25',
      season: ['가을', '겨울'],
      tempRange: { min: 10, max: 20, description: '10~20°C' },
      tpoTags: ['출근룩', '주말 데이트'],
      color: '오트밀 베이지',
      size: 'L',
      status: 'active',
    },
    {
      id: 'bot-1',
      name: '테이퍼드 슬랙스',
      category: 'bottoms',
      frontImage: 'img2',
      backImage: '',
      tagImage: '',
      price: 79000,
      store: 'COS',
      purchaseDate: '2025-09-01',
      wearCount: 20,
      lastWornDate: '2026-10-28',
      season: ['가을', '겨울'],
      tempRange: { min: 8, max: 22, description: '8~22°C' },
      tpoTags: ['출근룩', '하객룩'],
      color: '차콜 그레이',
      size: '30인치',
      targetWaistInch: 30,
      status: 'active',
    },
  ];

  const bodyProfile: BodyProfile = {
    height: 178,
    weight: 71,
    waistInch: 30,
    waistCm: 76.2,
    topSize: '100 (L)',
    bottomSize: '30 inch',
    dietTarget: {
      startWeight: 75,
      startWaistInch: 32,
      targetWeight: 68,
      targetWaistInch: 28,
      startDate: '2026-09-20',
      targetDate: '2026-12-31',
    },
    bodyLogs: [{ id: '1', date: '2026-11-01', weight: 71, waistInch: 30, waistCm: 76.2 }],
    updatedAt: '2026-11-01',
  };

  const outfit = generateRuleBasedOutfit(
    sampleItems,
    { temp: 16, condition: '맑음' },
    '출근룩',
    bodyProfile
  );

  assert.ok(outfit.top);
  assert.equal(outfit.top?.id, 'top-1');
  assert.ok(outfit.bottom);
  assert.equal(outfit.bottom?.id, 'bot-1');
  assert.ok(outfit.colorHarmonyReason.length > 0);
  assert.ok(outfit.silhouetteReason.length > 0);
  assert.ok(outfit.bodyFitReason.length > 0);
});

test('calculateDietProgress accurately calculates loss, remaining, and percentage', () => {
  const target: DietTarget = {
    startWeight: 75,
    startWaistInch: 32,
    targetWeight: 68,
    targetWaistInch: 28,
    startDate: '2026-09-20',
    targetDate: '2026-12-31',
  };

  // Halfway: weight 71.5 (-3.5kg of 7kg = 50%), waist 30 (-2 inch of 4 inch = 50%)
  const progress = calculateDietProgress(target, 71.5, 30, new Date('2026-11-01'));
  assert.equal(progress.totalWeightLost, 3.5);
  assert.equal(progress.totalWaistLost, 2.0);
  assert.equal(progress.remainingWeight, 3.5);
  assert.equal(progress.remainingWaist, 2.0);
  assert.equal(progress.overallProgress, 50);
});

test('calculateCosmeticExpiry calculates earlier date between EXP and opened + PAO', () => {
  // Case 1: Opened 2026-06-01, PAO 6 months -> PAO date is 2026-12-01. EXP is 2027-05-30.
  // Effective should be 2026-12-01 (PAO wins).
  const case1 = calculateCosmeticExpiry('2026-06-01', 6, '2027-05-30');
  assert.equal(case1.effectiveExpiryDate, '2026-12-01');
  assert.equal(case1.reason, 'pao');

  // Case 2: Opened 2026-06-01, PAO 12 months -> PAO date is 2027-06-01. EXP is 2026-11-20.
  // Effective should be 2026-11-20 (EXP wins).
  const case2 = calculateCosmeticExpiry('2026-06-01', 12, '2026-11-20');
  assert.equal(case2.effectiveExpiryDate, '2026-11-20');
  assert.equal(case2.reason, 'exp');

  // Case 3: No EXP date provided -> defaults to PAO date
  const case3 = calculateCosmeticExpiry('2026-01-15', 12, '');
  assert.equal(case3.effectiveExpiryDate, '2027-01-15');
  assert.equal(case3.reason, 'pao');
});

test('calculateCosmeticDDay categorizes safe, impending (<=30 days), and expired (<0 days)', () => {
  const refDate = new Date('2026-11-08T12:00:00Z');

  // Safe (> 30 days)
  const safe = calculateCosmeticDDay('2027-03-01', refDate);
  assert.equal(safe.status, 'safe');
  assert.ok(safe.daysRemaining > 30);
  assert.ok(safe.dDayText.startsWith('D-'));

  // Impending (15 days remaining)
  const impending = calculateCosmeticDDay('2026-11-23', refDate);
  assert.equal(impending.status, 'impending');
  assert.equal(impending.daysRemaining, 15);
  assert.equal(impending.dDayText, 'D-15');

  // Expired (-60 days)
  const expired = calculateCosmeticDDay('2026-09-09', refDate);
  assert.equal(expired.status, 'expired');
  assert.equal(expired.daysRemaining, -60);
  assert.equal(expired.dDayText, 'D+60');
});
