import React, { useState } from 'react';
import {
  Sparkles,
  CloudSun,
  MapPin,
  Palette,
  Layers,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { ClothingItem, BodyProfile, OutfitRecommendation } from '../../types/closet';
import { generateRuleBasedOutfit } from '../../utils/closetLogic';

interface StylingViewProps {
  items: ClothingItem[];
  bodyProfile: BodyProfile;
  initialWeather?: { temp: number; condition: string } | null;
  onSelectForOOTD: (itemIds: string[], tpo: string, weather: { temp: number; condition: string }) => void;
}

export const StylingView: React.FC<StylingViewProps> = ({
  items,
  bodyProfile,
  initialWeather,
  onSelectForOOTD,
}) => {
  const [selectedTpo, setSelectedTpo] = useState<string>('출근룩');
  const [weatherTemp, setWeatherTemp] = useState<number>(initialWeather?.temp ?? 18);
  const [weatherCondition, setWeatherCondition] = useState<string>(initialWeather?.condition ?? '맑음');
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stylistSource, setStylistSource] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialWeather) {
      setWeatherTemp(initialWeather.temp);
      setWeatherCondition(initialWeather.condition);
      const updatedOutfit = generateRuleBasedOutfit(
        items,
        { temp: initialWeather.temp, condition: initialWeather.condition },
        selectedTpo,
        bodyProfile
      );
      setRecommendation(updatedOutfit);
      setStylistSource(`3일 기상예보 연동 (${initialWeather.temp}°C ${initialWeather.condition})`);
    }
  }, [initialWeather]);

  const tpoOptions = [
    { label: '출근룩 (비즈니스 캐주얼)', value: '출근룩' },
    { label: '하객룩 (포멀/격식)', value: '하객룩' },
    { label: '주말 데이트룩', value: '주말 데이트' },
    { label: '가벼운 산책/원마일', value: '가벼운 산책' },
    { label: '중요 미팅/프레젠테이션', value: '비즈니스 미팅' },
    { label: '여행/나들이룩', value: '여행룩' },
  ];

  const weatherPresets = [
    { label: '쌀쌀함 8°C', temp: 8, cond: '서늘함' },
    { label: '선선함 16°C', temp: 16, cond: '맑음' },
    { label: '온화함 20°C', temp: 20, cond: '화창함' },
    { label: '초여름 25°C', temp: 25, cond: '맑음' },
  ];

  const handleGenerateOutfit = async () => {
    setIsLoading(true);
    setStylistSource(null);

    try {
      const response = await fetch('/api/gemini/recommend-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          weather: { temp: weatherTemp, condition: weatherCondition },
          tpo: selectedTpo,
          bodyProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const d = data.data;
          const top = items.find((i) => i.id === d.topId);
          const bottom = items.find((i) => i.id === d.bottomId);
          const out = items.find((i) => i.id === d.outerwearId);
          const shoe = items.find((i) => i.id === d.shoesId);

          setRecommendation({
            id: `outfit-${Date.now()}`,
            top: top || items.find((i) => i.category === 'tops'),
            bottom: bottom || items.find((i) => i.category === 'bottoms'),
            outerwear: out,
            shoes: shoe || items.find((i) => i.category === 'shoes'),
            title: d.title || `${selectedTpo} 맞춤 스타일링`,
            colorHarmonyReason: d.colorHarmonyReason || '안정적인 톤온톤 배색입니다.',
            silhouetteReason: d.silhouetteReason || '단정한 실루엣 밸런스입니다.',
            bodyFitReason: d.bodyFitReason || '체형을 자연스럽게 보완해 주는 핏입니다.',
            weatherSuitabilityReason: d.weatherSuitabilityReason || '적정 기온에 적합합니다.',
            stylistTips: d.stylistTips || ['신발과 가방 톤을 맞춰 연출해보세요.'],
          });
          setStylistSource('Gemini Pro Fashion AI');
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // fallback
    }

    const outfit = generateRuleBasedOutfit(
      items,
      { temp: weatherTemp, condition: weatherCondition },
      selectedTpo,
      bodyProfile
    );
    setRecommendation(outfit);
    setStylistSource('퍼스널 스타일링 엔진');
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!recommendation && items.length > 0) {
      const initial = generateRuleBasedOutfit(
        items,
        { temp: weatherTemp, condition: weatherCondition },
        selectedTpo,
        bodyProfile
      );
      setRecommendation(initial);
      setStylistSource('퍼스널 스타일링 엔진');
    }
  }, [items]);

  const handleApplyToOOTD = () => {
    if (!recommendation) return;
    const itemIds = [
      recommendation.top?.id,
      recommendation.bottom?.id,
      recommendation.outerwear?.id,
      recommendation.shoes?.id,
      recommendation.accessory?.id,
    ].filter(Boolean) as string[];

    onSelectForOOTD(itemIds, selectedTpo, { temp: weatherTemp, condition: weatherCondition });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
          AI Styling Studio
        </span>
        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
          AI 의류 조합 코디 추천
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          내 옷장 아이템으로 오늘 날씨, TPO, 신체 치수에 최적화된 조합을 분석하여 제안합니다.
        </p>
      </div>

      {/* TPO & Weather Controller */}
      <div className="bg-white rounded-2xl p-5 shadow-modern border border-zinc-200 space-y-4">
        {/* TPO Selector */}
        <div>
          <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 mb-2">
            <MapPin size={14} className="text-zinc-600" />
            <span>상황 및 목적 (TPO)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tpoOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedTpo(opt.value)}
                className={`p-2.5 rounded-xl text-left text-xs font-medium transition-colors ${
                  selectedTpo === opt.value
                    ? 'bg-[#E11D48] text-white font-semibold shadow-sm'
                    : 'bg-[#FDF2F4] text-rose-900/80 hover:bg-[#FCE7F3] border border-rose-100'
                }`}
              >
                <span className="truncate block">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weather & Temperature Controller */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <CloudSun size={14} className="text-[#E11D48]" />
              <span>날씨 및 기온</span>
            </label>
            <span className="text-xs font-mono font-bold text-[#E11D48] bg-[#FCE7F3] px-2 py-0.5 rounded">
              {weatherTemp}°C ({weatherCondition})
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2.5 scrollbar-none font-mono">
            {weatherPresets.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setWeatherTemp(p.temp);
                  setWeatherCondition(p.cond);
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors border ${
                  weatherTemp === p.temp
                    ? 'bg-[#E11D48] text-white border-[#E11D48] font-semibold shadow-sm'
                    : 'bg-white text-zinc-600 border-rose-100 hover:bg-[#FDF2F4]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <input
            type="range"
            min="-5"
            max="32"
            value={weatherTemp}
            onChange={(e) => setWeatherTemp(Number(e.target.value))}
            aria-label="기온 조절 슬라이더"
            className="w-full accent-[#E11D48] cursor-pointer"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateOutfit}
          disabled={isLoading}
          className="w-full py-3 bg-[#E11D48] hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>최적의 코디를 조합 중입니다...</span>
            </>
          ) : (
            <>
              <Sparkles size={15} />
              <span>내 옷장 기반 AI 코디 조합 실행</span>
            </>
          )}
        </button>
      </div>

      {/* Recommendation Results Card */}
      {recommendation && (
        <div className="bg-white rounded-2xl p-5 shadow-modern-md border border-zinc-200 space-y-4 animate-in fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                {stylistSource || 'AI 스타일리스트'}
              </span>
              <h3 className="text-base font-bold text-zinc-900 mt-0.5 tracking-tight">
                {recommendation.title}
              </h3>
            </div>
            <button
              onClick={handleGenerateOutfit}
              aria-label="다른 조합 추천"
              className="p-2 text-zinc-400 hover:text-zinc-900 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {/* Outfit Items Visual Display in 3:4 Lookbook Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recommendation.top && (
              <div className="bg-zinc-50 p-2.5 rounded-xl text-center flex flex-col justify-between border border-zinc-200/80">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">상의</span>
                <img
                  src={recommendation.top.frontImage}
                  alt={recommendation.top.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5 bg-zinc-200"
                />
                <h5 className="text-[11px] font-semibold text-zinc-900 truncate">
                  {recommendation.top.name}
                </h5>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                  {recommendation.top.color} · {recommendation.top.store}
                </span>
              </div>
            )}

            {recommendation.bottom && (
              <div className="bg-zinc-50 p-2.5 rounded-xl text-center flex flex-col justify-between border border-zinc-200/80">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">하의</span>
                <img
                  src={recommendation.bottom.frontImage}
                  alt={recommendation.bottom.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5 bg-zinc-200"
                />
                <h5 className="text-[11px] font-semibold text-zinc-900 truncate">
                  {recommendation.bottom.name}
                </h5>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                  {recommendation.bottom.color} · 허리 {recommendation.bottom.targetWaistInch || 30}인치
                </span>
              </div>
            )}

            {recommendation.outerwear && (
              <div className="bg-zinc-50 p-2.5 rounded-xl text-center flex flex-col justify-between border border-zinc-200/80">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">아우터</span>
                <img
                  src={recommendation.outerwear.frontImage}
                  alt={recommendation.outerwear.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5 bg-zinc-200"
                />
                <h5 className="text-[11px] font-semibold text-zinc-900 truncate">
                  {recommendation.outerwear.name}
                </h5>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                  {recommendation.outerwear.color}
                </span>
              </div>
            )}

            {recommendation.shoes && (
              <div className="bg-zinc-50 p-2.5 rounded-xl text-center flex flex-col justify-between border border-zinc-200/80">
                <span className="text-[10px] font-mono text-zinc-500 block mb-1">슈즈</span>
                <img
                  src={recommendation.shoes.frontImage}
                  alt={recommendation.shoes.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=400&q=80';
                  }}
                  className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5 bg-zinc-200"
                />
                <h5 className="text-[11px] font-semibold text-zinc-900 truncate">
                  {recommendation.shoes.name}
                </h5>
                <span className="text-[10px] text-zinc-500 font-mono block truncate">
                  {recommendation.shoes.color}
                </span>
              </div>
            )}
          </div>

          {/* 4-Pillar Detailed Recommendation Analysis */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              AI 스타일리스트 분석 리포트
            </h4>

            {/* 1) Color Harmony */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-start gap-2.5">
              <div className="p-1.5 bg-zinc-200/80 text-zinc-700 rounded-md shrink-0 mt-0.5">
                <Palette size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">
                  1) 색상 배색 (Color Harmony)
                </span>
                <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                  {recommendation.colorHarmonyReason}
                </p>
              </div>
            </div>

            {/* 2) Silhouette Balance */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-start gap-2.5">
              <div className="p-1.5 bg-zinc-200/80 text-zinc-700 rounded-md shrink-0 mt-0.5">
                <Layers size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">
                  2) 실루엣 밸런스 (Silhouette Balance)
                </span>
                <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                  {recommendation.silhouetteReason}
                </p>
              </div>
            </div>

            {/* 3) Body Fit Consideration & Diet Progress Integration */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-start gap-2.5">
              <div className="p-1.5 bg-zinc-200/80 text-zinc-700 rounded-md shrink-0 mt-0.5">
                <UserCheck size={14} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 block">
                    3) 신체 치수 및 체형 변화 연동 (Body Fit)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    현재 허리 {bodyProfile.waistInch}인치 기준
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                  {recommendation.bodyFitReason}
                </p>
                <div className="mt-2 p-2.5 bg-white rounded-lg text-[11px] text-zinc-700 border border-zinc-200/80">
                  <strong className="text-zinc-900">체형 변화 코디 팁:</strong> 다이어트 시작 대비 허리둘레가 약{' '}
                  <strong className="font-mono text-zinc-900">
                    {(
                      (bodyProfile.dietTarget?.startWaistInch || 32) -
                      bodyProfile.waistInch
                    ).toFixed(1)}인치
                  </strong>{' '}
                  감소하여, 상의를 바지 안으로 프론트 턱(Front-tuck)해도 복부 답답함 없이 슬림한 실루엣 비율을 유지할 수 있습니다.
                </div>
              </div>
            </div>

            {/* 4) Weather Suitability */}
            <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-start gap-2.5">
              <div className="p-1.5 bg-zinc-200/80 text-zinc-700 rounded-md shrink-0 mt-0.5">
                <CloudSun size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold text-zinc-900 block">
                  4) 기온 및 날씨 적합성 (Weather Suitability)
                </span>
                <p className="text-xs text-zinc-600 leading-relaxed mt-0.5">
                  {recommendation.weatherSuitabilityReason}
                </p>
              </div>
            </div>

            {/* Stylist Pro Tips */}
            {recommendation.stylistTips?.length > 0 && (
              <div className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-1">
                <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-amber-500" />
                  <span>스타일링 연출 팁</span>
                </span>
                <ul className="text-xs text-zinc-600 space-y-1 list-disc list-inside">
                  {recommendation.stylistTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action: Use in Today's OOTD */}
          <div className="pt-2">
            <button
              onClick={handleApplyToOOTD}
              className="w-full py-3 bg-[#E11D48] hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <CheckCircle2 size={15} />
              <span>오늘 이 코디 착용 (착샷 일기로 기록)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

