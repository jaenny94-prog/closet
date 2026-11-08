import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  Sparkles,
  Thermometer,
  ChevronRight,
  Shirt,
} from 'lucide-react';

export interface WeatherDay {
  id: string;
  dayLabel: string; // 오늘, 내일, 모레
  dateText: string; // 11.08 (토)
  condition: string; // 맑음, 구름많음, 서늘함/비
  iconType: 'sun' | 'cloud-sun' | 'rain';
  tempCurrent: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  wearGuide: string;
  recommendedTags: string[];
}

interface WeatherForecastWidgetProps {
  onSelectWeatherForStyling?: (temp: number, condition: string) => void;
}

export const WeatherForecastWidget: React.FC<WeatherForecastWidgetProps> = ({
  onSelectWeatherForStyling,
}) => {
  const [selectedCity, setSelectedCity] = useState<'서울' | '부산' | '대구' | '제주'>('서울');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // 3-Day Forecast data tailored for Korean weather seasons
  const forecastsByCity: Record<'서울' | '부산' | '대구' | '제주', WeatherDay[]> = {
    서울: [
      {
        id: 'day-0',
        dayLabel: '오늘',
        dateText: '11.08 (토)',
        condition: '화창함',
        iconType: 'sun',
        tempCurrent: 18,
        tempMin: 8,
        tempMax: 19,
        humidity: 45,
        wearGuide: '가벼운 니트나 셔츠에 슬랙스가 쾌적해요. (일교차 11°C 주의)',
        recommendedTags: ['캐시미어 니트', '슬랙스', '로퍼'],
      },
      {
        id: 'day-1',
        dayLabel: '내일',
        dateText: '11.09 (일)',
        condition: '선선함',
        iconType: 'cloud-sun',
        tempCurrent: 14,
        tempMin: 6,
        tempMax: 15,
        humidity: 55,
        wearGuide: '기온이 떨어집니다. 포근한 트렌치코트나 자켓을 준비하세요.',
        recommendedTags: ['자켓', '트렌치코트', '셔츠 레이어드'],
      },
      {
        id: 'day-2',
        dayLabel: '모레',
        dateText: '11.10 (월)',
        condition: '흐리고 쌀쌀',
        iconType: 'rain',
        tempCurrent: 9,
        tempMin: 3,
        tempMax: 11,
        humidity: 70,
        wearGuide: '초겨울 찬바람 주의. 도톰한 울 코트와 머플러를 추천합니다.',
        recommendedTags: ['울 코트', '도톰한 스웨터', '머플러'],
      },
    ],
    부산: [
      {
        id: 'day-0',
        dayLabel: '오늘',
        dateText: '11.08 (토)',
        condition: '화창함',
        iconType: 'sun',
        tempCurrent: 21,
        tempMin: 12,
        tempMax: 22,
        humidity: 50,
        wearGuide: '포근한 낮 기온. 단품 긴소매 셔츠와 와이드 팬츠가 어울립니다.',
        recommendedTags: ['옥스포드 셔츠', '와이드 팬츠'],
      },
      {
        id: 'day-1',
        dayLabel: '내일',
        dateText: '11.09 (일)',
        condition: '구름조금',
        iconType: 'cloud-sun',
        tempCurrent: 17,
        tempMin: 10,
        tempMax: 18,
        humidity: 60,
        wearGuide: '가디건이나 블레이저 자켓을 매치하기 좋은 선선한 날씨입니다.',
        recommendedTags: ['가디건', '블레이저'],
      },
      {
        id: 'day-2',
        dayLabel: '모레',
        dateText: '11.10 (월)',
        condition: '비/바람',
        iconType: 'rain',
        tempCurrent: 13,
        tempMin: 8,
        tempMax: 14,
        humidity: 75,
        wearGuide: '해풍과 비바람에 대비해 방풍 아우터와 편한 슈즈를 권장합니다.',
        recommendedTags: ['윈드브레이커', '자켓'],
      },
    ],
    대구: [
      {
        id: 'day-0',
        dayLabel: '오늘',
        dateText: '11.08 (토)',
        condition: '맑음',
        iconType: 'sun',
        tempCurrent: 19,
        tempMin: 7,
        tempMax: 20,
        humidity: 40,
        wearGuide: '낮에는 온화하나 일몰 후 쌀쌀하므로 가벼운 외투가 필수입니다.',
        recommendedTags: ['니트', '가벼운 자켓'],
      },
      {
        id: 'day-1',
        dayLabel: '내일',
        dateText: '11.09 (일)',
        condition: '흐림',
        iconType: 'cloud-sun',
        tempCurrent: 15,
        tempMin: 6,
        tempMax: 16,
        humidity: 50,
        wearGuide: '포근한 니트웨어와 슬랙스 조합으로 편안하게 연출하세요.',
        recommendedTags: ['크루넥 니트', '슬랙스'],
      },
      {
        id: 'day-2',
        dayLabel: '모레',
        dateText: '11.10 (월)',
        condition: '쌀쌀함',
        iconType: 'rain',
        tempCurrent: 10,
        tempMin: 4,
        tempMax: 12,
        humidity: 65,
        wearGuide: '보온성 좋은 코트와 도톰한 이너로 온기를 유지하세요.',
        recommendedTags: ['울 코트', '패딩 조끼'],
      },
    ],
    제주: [
      {
        id: 'day-0',
        dayLabel: '오늘',
        dateText: '11.08 (토)',
        condition: '맑음/선선',
        iconType: 'sun',
        tempCurrent: 20,
        tempMin: 14,
        tempMax: 21,
        humidity: 55,
        wearGuide: '활동하기 좋은 온화한 날씨, 캐주얼 셔츠와 치노 팬츠를 추천합니다.',
        recommendedTags: ['캐주얼 셔츠', '치노 팬츠'],
      },
      {
        id: 'day-1',
        dayLabel: '내일',
        dateText: '11.09 (일)',
        condition: '바람많음',
        iconType: 'cloud-sun',
        tempCurrent: 16,
        tempMin: 11,
        tempMax: 17,
        humidity: 65,
        wearGuide: '바람이 강하므로 방풍 자켓이나 탄탄한 아우터를 챙기세요.',
        recommendedTags: ['윈드브레이커', '니트 집업'],
      },
      {
        id: 'day-2',
        dayLabel: '모레',
        dateText: '11.10 (월)',
        condition: '비 소식',
        iconType: 'rain',
        tempCurrent: 12,
        tempMin: 9,
        tempMax: 13,
        humidity: 80,
        wearGuide: '비바람 대비 방수 아우터 및 레인 슈즈로 쾌적하게 착용하세요.',
        recommendedTags: ['방수 자켓', '레인 슈즈'],
      },
    ],
  };

  const days = forecastsByCity[selectedCity];
  const activeDay = days[selectedDayIndex] || days[0];

  const renderWeatherIcon = (iconType: string, size = 20) => {
    switch (iconType) {
      case 'sun':
        return <Sun size={size} className="text-amber-500" />;
      case 'cloud-sun':
        return <CloudSun size={size} className="text-sky-500" />;
      case 'rain':
        return <CloudRain size={size} className="text-indigo-500" />;
      default:
        return <Sun size={size} className="text-amber-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFCED8] shadow-modern space-y-4">
      {/* Widget Header & City Segmented Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF4DE] flex items-center justify-center text-rose-600">
            <Thermometer size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-tight">
              3일 기상예보 & 스타일 가이드
            </h3>
            <p className="text-[11px] text-rose-700/80 font-mono">기온 맞춤 권장 옷차림</p>
          </div>
        </div>

        {/* Clean Segmented City Selector */}
        <div className="flex bg-[#FFFDF8] p-0.5 rounded-xl border border-[#FFCED8]">
          {(['서울', '부산', '대구', '제주'] as const).map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                selectedCity === city
                  ? 'bg-[#FFCED8] text-[#2D1E22] shadow-sm font-bold'
                  : 'text-gray-600 hover:text-rose-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Day Cards Row (Target selector: button:nth-of-type(1) and sibling days) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3 rounded-2xl text-center transition-all flex flex-col items-center justify-between border cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-b from-[#FFF4DE] via-[#FFDDDD] to-[#FFCED8] text-[#2D1E22] border-2 border-[#FFCED8] ring-2 ring-rose-200/70 shadow-modern-sm scale-[1.02]'
                  : 'bg-[#FFFDF9] hover:bg-[#FFF4DE]/40 text-gray-700 border-[#FFCED8]/60 hover:border-[#FFCED8]'
              }`}
            >
              {/* Day Label */}
              <div className="flex items-center gap-1 mb-1">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-[#2D1E22]' : 'text-gray-800'
                  }`}
                >
                  {day.dayLabel}
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected ? 'text-rose-800/80 font-semibold' : 'text-gray-400'
                  }`}
                >
                  {day.dateText.split(' ')[0]}
                </span>
              </div>

              {/* Weather Icon */}
              <div className="my-1.5">{renderWeatherIcon(day.iconType, 22)}</div>

              {/* Current Temperature */}
              <div
                className={`text-lg font-mono font-extrabold tracking-tight ${
                  isSelected ? 'text-[#2D1E22]' : 'text-gray-900'
                }`}
              >
                {day.tempCurrent}°C
              </div>

              {/* Min/Max Temperature */}
              <div
                className={`text-[10px] font-mono mt-0.5 ${
                  isSelected ? 'text-rose-950/70 font-medium' : 'text-gray-500'
                }`}
              >
                <span>{day.tempMin}°</span> / <span>{day.tempMax}°</span>
              </div>

              {/* Condition Text */}
              <span
                className={`mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-white/90 text-rose-950 border border-[#FFCED8] shadow-2xs'
                    : 'bg-[#FFF4DE] text-amber-950 border border-amber-200/50'
                }`}
              >
                {day.condition}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Outfit Recommendation Banner: Zero-Pill Discipline */}
      <div className="p-3.5 sm:p-4 bg-[#FFFDF8] rounded-2xl border border-[#FFCED8] space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#2D1E22] flex items-center gap-1.5">
            <Shirt size={14} className="text-rose-500" />
            <span>[{activeDay.dayLabel}] 코디 브리프</span>
          </span>
          <span className="text-[11px] font-mono text-rose-800 font-medium">
            체감 {activeDay.tempCurrent}°C · 습도 {activeDay.humidity}%
          </span>
        </div>

        <p className="text-xs text-gray-700 leading-relaxed font-normal">
          {activeDay.wearGuide}
        </p>

        {/* Clean Unboxed Tags with Typographic Dividers */}
        <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-gray-700 flex-wrap">
            <span className="font-semibold text-rose-600">추천 아이템:</span>
            {activeDay.recommendedTags.map((tag, i) => (
              <React.Fragment key={tag}>
                <span className="font-medium text-[#2D1E22]">{tag}</span>
                {i < activeDay.recommendedTags.length - 1 && (
                  <span className="text-rose-300">·</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {onSelectWeatherForStyling && (
            <button
              type="button"
              onClick={() => onSelectWeatherForStyling(activeDay.tempCurrent, activeDay.condition)}
              className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ml-auto active:scale-95 shadow-modern-sm"
            >
              <Sparkles size={12} />
              <span>맞춤 코디 보기</span>
              <ChevronRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

