import {
  ClothingItem,
  ClothingCategory,
  BodyProfile,
  OutfitRecommendation,
  DietTarget,
  CosmeticItem,
  CosmeticCategory,
  CosmeticDDayInfo,
  CosmeticDDayStatus,
} from '../types/closet';

/**
 * Calculate Diet Target Progress & D-Day metrics
 */
export function calculateDietProgress(
  target: DietTarget,
  currentWeight: number,
  currentWaistInch: number,
  referenceDate: Date = new Date()
) {
  const safeStartW = target.startWeight || 75;
  const safeTargetW = target.targetWeight || 68;
  const safeStartWaist = target.startWaistInch || 32;
  const safeTargetWaist = target.targetWaistInch || 28;

  // Weight progress
  const weightLossGoal = safeStartW - safeTargetW;
  const currentWeightLoss = safeStartW - currentWeight;
  const weightProgressPct =
    weightLossGoal > 0 ? (currentWeightLoss / weightLossGoal) * 100 : 0;

  // Waist progress
  const waistLossGoal = safeStartWaist - safeTargetWaist;
  const currentWaistLoss = safeStartWaist - currentWaistInch;
  const waistProgressPct =
    waistLossGoal > 0 ? (currentWaistLoss / waistLossGoal) * 100 : 0;

  // Overall achievement rate (0% ~ 100%)
  const overallProgress = Math.min(
    100,
    Math.max(0, Math.round((weightProgressPct + waistProgressPct) / 2))
  );

  // Remaining deltas
  const remainingWeight = Math.max(0, Math.round((currentWeight - safeTargetW) * 10) / 10);
  const remainingWaist = Math.max(
    0,
    Math.round((currentWaistInch - safeTargetWaist) * 10) / 10
  );

  // Total lost so far
  const totalWeightLost = Math.round((safeStartW - currentWeight) * 10) / 10;
  const totalWaistLost = Math.round((safeStartWaist - currentWaistInch) * 10) / 10;

  // D-Day calculation
  const targetTime = new Date(target.targetDate).getTime();
  const nowTime = referenceDate.getTime();
  const diffDays = Math.ceil((targetTime - nowTime) / (1000 * 60 * 60 * 24));
  const dDayText =
    diffDays === 0
      ? 'D-Day (오늘)'
      : diffDays > 0
      ? `D-${diffDays}`
      : `D+${Math.abs(diffDays)} (기한 경과)`;

  return {
    overallProgress,
    totalWeightLost,
    totalWaistLost,
    remainingWeight,
    remainingWaist,
    dDayText,
    diffDays,
    weightProgressPct: Math.min(100, Math.max(0, Math.round(weightProgressPct))),
    waistProgressPct: Math.min(100, Math.max(0, Math.round(waistProgressPct))),
  };
}

/**
 * Calculate Cost-Per-Wear (CPW) and value metric
 */
export function calculateCostPerWear(price: number, wearCount: number) {
  const safePrice = Math.max(0, price || 0);
  const safeWears = Math.max(0, wearCount || 0);

  if (safeWears === 0) {
    return {
      cpw: safePrice,
      wearCount: 0,
      grade: 'C' as const,
      gradeText: '미착용 (아직 뽕을 못 뽑음)',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      savingsPercent: 0,
    };
  }

  const cpw = Math.round(safePrice / safeWears);

  // Benchmarking value:
  // e.g., if price is 100,000 KRW and worn 20 times => 5,000 KRW/wear (S grade)
  // If worn 10 times => 10,000 KRW/wear (A grade)
  // If worn 4 times => 25,000 KRW/wear (B grade)
  let grade: 'S' | 'A' | 'B' | 'C' = 'C';
  let gradeText = '착용 시작 단계';
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';

  if (safeWears >= 20 || (safePrice > 0 && cpw <= safePrice * 0.05)) {
    grade = 'S';
    gradeText = '가성비 최상 (인생템)';
    badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  } else if (safeWears >= 10 || (safePrice > 0 && cpw <= safePrice * 0.1)) {
    grade = 'A';
    gradeText = '가성비 훌륭 (본전 회수 중)';
    badgeColor = 'bg-blue-100 text-blue-800 border-blue-300';
  } else if (safeWears >= 4) {
    grade = 'B';
    gradeText = '가성비 양호';
    badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
  }

  const savingsPercent = Math.min(100, Math.round(((safePrice - cpw) / (safePrice || 1)) * 100));

  return {
    cpw,
    wearCount: safeWears,
    grade,
    gradeText,
    badgeColor,
    savingsPercent: Math.max(0, savingsPercent),
  };
}

/**
 * Calculates how long the item has gone unworn (1 year+, 2 years+)
 */
export function calculateUnwornStatus(
  lastWornDate: string | undefined,
  purchaseDate: string,
  referenceDate: Date = new Date()
) {
  // If never worn, fallback to purchaseDate
  const baseDateStr = lastWornDate && lastWornDate.trim() ? lastWornDate : purchaseDate;
  const baseTime = new Date(baseDateStr).getTime();
  const nowTime = referenceDate.getTime();

  const diffTime = Math.max(0, nowTime - baseTime);
  const daysSinceLastWorn = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const isTwoYearUnworn = daysSinceLastWorn >= 730; // 2 years (365 * 2)
  const isOneYearUnworn = daysSinceLastWorn >= 365 && !isTwoYearUnworn; // 1 to 2 years

  let statusBadge: 'none' | '1year' | '2year' = 'none';
  let label = '최근 착용';

  if (isTwoYearUnworn) {
    statusBadge = '2year';
    label = `2년+ 미착용 (${Math.floor(daysSinceLastWorn / 365)}년 ${Math.floor((daysSinceLastWorn % 365) / 30)}개월)`;
  } else if (isOneYearUnworn) {
    statusBadge = '1year';
    label = `1년+ 미착용 (${Math.floor(daysSinceLastWorn / 30)}개월 경과)`;
  } else if (daysSinceLastWorn <= 7) {
    label = daysSinceLastWorn === 0 ? '오늘 착용' : `${daysSinceLastWorn}일 전 착용`;
  } else if (daysSinceLastWorn <= 30) {
    label = `${Math.floor(daysSinceLastWorn / 7)}주 전 착용`;
  } else {
    label = `${Math.floor(daysSinceLastWorn / 30)}개월 전 착용`;
  }

  return {
    daysSinceLastWorn,
    isOneYearUnworn,
    isTwoYearUnworn,
    statusBadge,
    label,
    baseDateStr,
    hasNeverWorn: !lastWornDate,
  };
}

/**
 * Convert waist measurement between inch and cm
 */
export function convertWaist(value: number, fromUnit: 'inch' | 'cm') {
  if (fromUnit === 'inch') {
    const cm = Math.round(value * 2.54 * 10) / 10;
    return { inch: value, cm };
  } else {
    const inch = Math.round((value / 2.54) * 10) / 10;
    return { inch, cm: value };
  }
}

/**
 * Analyze body fit advice for an item based on waist and weight
 */
export function analyzeFitAdvice(bodyProfile: BodyProfile, item: ClothingItem): string {
  if (item.category === 'bottoms') {
    if (item.targetWaistInch && bodyProfile.waistInch) {
      const diff = bodyProfile.waistInch - item.targetWaistInch;
      if (diff > 1.5) {
        return `현재 허리(${bodyProfile.waistInch}인치) 기준 의류 표기(${item.targetWaistInch}인치)보다 약 ${diff.toFixed(1)}인치 작아 허리가 타이트할 수 있습니다. 밴딩 또는 이너 상의를 가볍게 매치하세요.`;
      } else if (diff < -1.5) {
        return `현재 허리(${bodyProfile.waistInch}인치) 기준 약 ${Math.abs(diff).toFixed(1)}인치 여유가 있어 벨트 착용이나 오버핏 스타일링을 추천합니다.`;
      } else {
        return `현재 허리둘레(${bodyProfile.waistInch}인치)와 완벽한 정사이즈 핏입니다!`;
      }
    }
  }

  if (item.category === 'tops' || item.category === 'outerwear') {
    return `${bodyProfile.topSize || '표준 체형'} 기준 자연스러운 실루엣을 연출할 수 있습니다.`;
  }

  return '체형에 무리 없이 편안하게 착용 가능한 베이직 아이템입니다.';
}

/**
 * Calculate dashboard summary statistics
 */
export function getCategorySummary(items: ClothingItem[]) {
  const activeItems = items.filter((i) => i.status === 'active');
  const categories: ClothingCategory[] = ['tops', 'bottoms', 'outerwear', 'shoes', 'onepiece', 'bags_accessories'];

  const categoryLabels: Record<ClothingCategory, string> = {
    tops: '상의',
    bottoms: '하의',
    outerwear: '아우터',
    shoes: '신발',
    onepiece: '원피스/셋업',
    bags_accessories: '가방/소품',
  };

  const summary = categories.map((cat) => {
    const catItems = activeItems.filter((i) => i.category === cat);
    const count = catItems.length;
    const totalCost = catItems.reduce((acc, curr) => acc + (curr.price || 0), 0);
    const totalWears = catItems.reduce((acc, curr) => acc + (curr.wearCount || 0), 0);
    const avgWears = count > 0 ? Math.round((totalWears / count) * 10) / 10 : 0;

    return {
      category: cat,
      label: categoryLabels[cat],
      count,
      totalCost,
      avgWears,
    };
  });

  return summary;
}

/**
 * Count unworn items (1+ year vs 2+ years)
 */
export function getUnwornCounts(items: ClothingItem[], referenceDate: Date = new Date()) {
  const activeItems = items.filter((i) => i.status === 'active');
  let oneYearCount = 0;
  let twoYearCount = 0;

  activeItems.forEach((item) => {
    const status = calculateUnwornStatus(item.lastWornDate, item.purchaseDate, referenceDate);
    if (status.isTwoYearUnworn) {
      twoYearCount++;
    } else if (status.isOneYearUnworn) {
      oneYearCount++;
    }
  });

  return {
    oneYearCount,
    twoYearCount,
    activeTotal: activeItems.length,
  };
}

/**
 * Intelligent Outfit Matching Algorithm
 */
export function generateRuleBasedOutfit(
  items: ClothingItem[],
  weather: { temp: number; condition: string },
  tpo: string,
  bodyProfile: BodyProfile
): OutfitRecommendation {
  const activeItems = items.filter((i) => i.status === 'active');

  // Filter items matching weather & season
  const isCold = weather.temp <= 12;
  const isMild = weather.temp > 12 && weather.temp <= 22;

  // Filter candidate items
  const tops = activeItems.filter((i) => i.category === 'tops');
  const bottoms = activeItems.filter((i) => i.category === 'bottoms');
  const outers = activeItems.filter((i) => i.category === 'outerwear');
  const shoes = activeItems.filter((i) => i.category === 'shoes');
  const accessories = activeItems.filter((i) => i.category === 'bags_accessories');

  // Score items by TPO match
  const scoreItem = (item: ClothingItem) => {
    let score = 0;
    if (item.tpoTags?.some((tag) => tag.includes(tpo) || tpo.includes(tag))) {
      score += 10;
    }
    if (weather.temp >= item.tempRange?.min && weather.temp <= item.tempRange?.max) {
      score += 8;
    }
    // Favor frequently worn or well-balanced items
    score += Math.min(5, (item.wearCount || 0) * 0.2);
    return score;
  };

  const sortedTops = [...tops].sort((a, b) => scoreItem(b) - scoreItem(a));
  const sortedBottoms = [...bottoms].sort((a, b) => scoreItem(b) - scoreItem(a));
  const sortedOuters = [...outers].sort((a, b) => scoreItem(b) - scoreItem(a));
  const sortedShoes = [...shoes].sort((a, b) => scoreItem(b) - scoreItem(a));
  const sortedAcc = [...accessories].sort((a, b) => scoreItem(b) - scoreItem(a));

  const top = sortedTops[0];
  const bottom = sortedBottoms[0];
  const outerwear = (isCold || (isMild && outers.length > 0)) ? sortedOuters[0] : undefined;
  const shoe = sortedShoes[0];
  const accessory = sortedAcc[0];

  // Reasons
  const title = `${tpo} 맞춤 스마트 스타일링 (${weather.temp}°C ${weather.condition})`;

  const colorHarmonyReason = top && bottom
    ? `${top.color || '톤다운'} 상의와 ${bottom.color || '뉴트럴'} 하의의 조화로 차분하면서도 세련된 톤온톤 대비를 연출합니다.`
    : '전체적인 컬러 밸런스를 고려한 세련된 모노크롬 매치입니다.';

  const silhouetteReason = outerwear
    ? `이너 ${top?.name || '상의'}의 깔끔한 라인 위에 여유 있는 핏의 ${outerwear.name}를 매치하여 시각적으로 안정감 있는 A/H 실루엣을 완성했습니다.`
    : `상·하의의 상호 보완적인 핏을 통해 단정하고 다리가 길어 보이는 비율을 강조했습니다.`;

  const bodyFitReason = bodyProfile.waistInch
    ? `현재 허리 치수(${bodyProfile.waistInch}인치)에 최적화된 하의 매칭으로 하루 종일 답답함 없는 편안한 착용감을 제공합니다.`
    : `체형을 보완해 주어 자연스럽고 호감 가는 인상을 주는 조합입니다.`;

  const weatherSuitabilityReason = `현재 기온 ${weather.temp}°C에 최적화된 소재 조합으로, ${
    isCold ? '체온 유지와 보온성을 극대화한 레이어드' : isMild ? '일교차에 유연하게 대처할 수 있는 스마트 룩' : '통기성과 쾌적함을 살린 가벼운 구성'
  }입니다.`;

  const stylistTips = [
    `소매를 1~2cm 가볍게 롤업하거나 하의 안으로 프론트 턱(Front-tuck)하면 비율이 더욱 돋보입니다.`,
    outerwear ? `실내에 들어갈 때는 아우터를 가볍게 어깨에 걸치거나 의자에 걸어두어 단정한 이너 룩을 연출하세요.` : `심플한 가죽 시계나 가방을 매치하면 완성도가 한층 높아집니다.`,
    `신발은 ${shoe ? shoe.name : '깔끔한 슈즈'}로 정돈된 마무리감을 주었습니다.`,
  ];

  return {
    id: `outfit-${Date.now()}`,
    top,
    bottom,
    outerwear,
    shoes: shoe,
    accessory,
    title,
    colorHarmonyReason,
    silhouetteReason,
    bodyFitReason,
    weatherSuitabilityReason,
    stylistTips,
  };
}

/**
 * Intelligent Mock OCR / Tag Extraction fallback for Barcode / Tag photos
 */
export function mockOcrTagAnalysis(keywords?: string) {
  const kw = (keywords || '').toLowerCase();

  if (kw.includes('slacks') || kw.includes('바지') || kw.includes('슬랙스')) {
    return {
      name: '테이퍼드 울 블렌드 슬랙스',
      category: 'bottoms' as ClothingCategory,
      brand: 'COS',
      price: 135000,
      purchaseDate: '2024-03-15',
      tempRange: { min: 12, max: 23, description: '봄/가을, 12~23°C, 쾌청한 날' },
      tpoTags: ['출근룩', '비즈니스', '하객룩', '주말 데이트'],
      season: ['봄', '가을'],
      color: '차콜 그레이',
      size: '29인치 (M)',
      targetWaistInch: 29,
    };
  }

  if (kw.includes('coat') || kw.includes('코트') || kw.includes('패딩')) {
    return {
      name: '캐시미어 싱글 발마칸 코트',
      category: 'outerwear' as ClothingCategory,
      brand: '솔리드옴므',
      price: 480000,
      purchaseDate: '2023-11-20',
      tempRange: { min: -5, max: 10, description: '늦가을/겨울, -5~10°C, 쌀쌀한 날' },
      tpoTags: ['출근룩', '하객룩', '포멀 데이트'],
      season: ['늦가을', '겨울'],
      color: '다크 네이비',
      size: '100 (L)',
    };
  }

  // General default fallback
  return {
    name: '프리미엄 릴렉스드 옥스포드 셔츠',
    category: 'tops' as ClothingCategory,
    brand: '무신사 스탠다드',
    price: 49000,
    purchaseDate: new Date().toISOString().split('T')[0],
    tempRange: { min: 16, max: 24, description: '봄/초여름/가을, 16~24°C, 화창한 날' },
    tpoTags: ['출근룩', '주말 데이트', '가벼운 산책', '캠퍼스'],
    season: ['봄', '가을'],
    color: '스카이 블루',
    size: '100 (L)',
  };
}

/**
 * Recommended PAO (Period After Opening) in months by category
 */
export const RECOMMENDED_PAO_BY_CATEGORY: Record<CosmeticCategory, number> = {
  skincare: 12,
  base: 12,
  lip: 12,
  eye: 6,       // 마스카라/아이라이너 등 안구 점막 접촉 위생 고려 6개월
  suncare: 12,   // 자외선 차단 필터 성분 산화 고려 12개월
  cleansing: 12,
  other: 24,
};

export const COSMETIC_CATEGORY_LABELS: Record<CosmeticCategory, string> = {
  skincare: '기초 스킨케어',
  base: '베이스 메이크업',
  lip: '립',
  eye: '아이 메이크업',
  suncare: '선케어',
  cleansing: '클렌징·팩',
  other: '기타·향수',
};

/**
 * Calculate effective expiry date: min(expDate, openedDate + paoMonths)
 * If expDate is invalid or absent, returns openedDate + paoMonths.
 */
export function calculateCosmeticExpiry(
  openedDate: string,
  paoMonths: number,
  expDate: string
): { effectiveExpiryDate: string; reason: 'exp' | 'pao' } {
  // Safe fallback if openedDate is empty
  const safeOpened = openedDate || new Date().toISOString().split('T')[0];
  const safePao = paoMonths > 0 ? paoMonths : 12;

  // Calculate openedDate + paoMonths
  const opened = new Date(safeOpened);
  const paoDateObj = new Date(opened);
  paoDateObj.setMonth(paoDateObj.getMonth() + safePao);
  const paoDateStr = paoDateObj.toISOString().split('T')[0];

  if (!expDate || isNaN(new Date(expDate).getTime())) {
    return {
      effectiveExpiryDate: paoDateStr,
      reason: 'pao',
    };
  }

  // Compare EXP vs PAO
  const expTime = new Date(expDate).getTime();
  const paoTime = paoDateObj.getTime();

  if (paoTime <= expTime) {
    return {
      effectiveExpiryDate: paoDateStr,
      reason: 'pao',
    };
  } else {
    return {
      effectiveExpiryDate: expDate,
      reason: 'exp',
    };
  }
}

/**
 * Calculate D-Day status and info for cosmetics
 */
export function calculateCosmeticDDay(
  effectiveExpiryDate: string,
  referenceDate: Date = new Date()
): CosmeticDDayInfo {
  const target = new Date(effectiveExpiryDate);
  // Compare by calendar dates (midnight)
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const refMidnight = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  ).getTime();

  const diffDays = Math.round((targetMidnight - refMidnight) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      daysRemaining: diffDays,
      status: 'expired',
      dDayText: `D+${Math.abs(diffDays)}`,
      label: `기한 만료 (${Math.abs(diffDays)}일 경과)`,
      reason: 'exp',
    };
  } else if (diffDays === 0) {
    return {
      daysRemaining: 0,
      status: 'impending',
      dDayText: 'D-Day',
      label: '오늘 만료 (빨리 사용하세요!)',
      reason: 'exp',
    };
  } else if (diffDays <= 30) {
    return {
      daysRemaining: diffDays,
      status: 'impending',
      dDayText: `D-${diffDays}`,
      label: `사용 임박 (${diffDays}일 남음)`,
      reason: 'exp',
    };
  } else {
    return {
      daysRemaining: diffDays,
      status: 'safe',
      dDayText: `D-${diffDays}`,
      label: `안전 (${diffDays}일 남음)`,
      reason: 'exp',
    };
  }
}

/**
 * Aggregate summary for active cosmetics
 */
export function getCosmeticsSummary(
  items: CosmeticItem[],
  referenceDate: Date = new Date()
) {
  const activeItems = items.filter((item) => item.status === 'active');
  let safeCount = 0;
  let impendingCount = 0;
  let expiredCount = 0;

  const expiredList: Array<{ item: CosmeticItem; dDay: CosmeticDDayInfo }> = [];
  const impendingList: Array<{ item: CosmeticItem; dDay: CosmeticDDayInfo }> = [];

  for (const item of activeItems) {
    const dDay = calculateCosmeticDDay(item.effectiveExpiryDate, referenceDate);
    if (dDay.status === 'expired') {
      expiredCount++;
      expiredList.push({ item, dDay });
    } else if (dDay.status === 'impending') {
      impendingCount++;
      impendingList.push({ item, dDay });
    } else {
      safeCount++;
    }
  }

  // Sort expired by most overdue first
  expiredList.sort((a, b) => a.dDay.daysRemaining - b.dDay.daysRemaining);
  // Sort impending by closest to expiry first
  impendingList.sort((a, b) => a.dDay.daysRemaining - b.dDay.daysRemaining);

  return {
    totalCount: activeItems.length,
    safeCount,
    impendingCount,
    expiredCount,
    hasAlerts: expiredCount > 0 || impendingCount > 0,
    expiredList,
    impendingList,
  };
}
