import React, { useState } from 'react';
import {
  Camera,
  Calendar,
  Check,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { ClothingItem, OOTDRecord } from '../../types/closet';

interface OOTDViewProps {
  items: ClothingItem[];
  ootdRecords: OOTDRecord[];
  onSaveOOTD: (record: OOTDRecord) => void;
  onDeleteOOTD: (id: string) => void;
}

export const OOTDView: React.FC<OOTDViewProps> = ({
  items,
  ootdRecords,
  onSaveOOTD,
  onDeleteOOTD,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [ootdImage, setOotdImage] = useState<string>('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tpo, setTpo] = useState<string>('출근룩');
  const [temp, setTemp] = useState<number>(18);
  const [weatherCondition, setWeatherCondition] = useState<string>('맑음');
  const [memo, setMemo] = useState<string>('');

  const activeItems = items.filter((i) => i.status === 'active');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOotdImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSampleImage = (url: string) => {
    setOotdImage(url);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ootdImage) {
      alert('오늘의 착샷 사진을 업로드하거나 샘플 사진을 선택해 주세요.');
      return;
    }
    if (selectedItemIds.length === 0) {
      alert('오늘 착용한 의류를 최소 1벌 이상 선택해 주세요.');
      return;
    }

    const newRecord: OOTDRecord = {
      id: `ootd-${Date.now()}`,
      date,
      image: ootdImage,
      clothingItemIds: selectedItemIds,
      tpo,
      weather: { temp, condition: weatherCondition },
      memo: memo.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveOOTD(newRecord);
    setIsRecording(false);
    setOotdImage('');
    setSelectedItemIds([]);
    setMemo('');
  };

  const sampleOotdPhotos = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
            Daily OOTD Journal
          </span>
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            오늘의 착샷 기록
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            착샷 등록 시 선택한 의류의 착용 횟수와 마지막 착용일이 자동 업데이트됩니다.
          </p>
        </div>
        {!isRecording && (
          <button
            onClick={() => setIsRecording(true)}
            className="px-3.5 py-1.5 bg-[#E11D48] hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>착샷 기록</span>
          </button>
        )}
      </div>

      {/* Recording Form Accordion / Card */}
      {isRecording && (
        <div className="bg-white rounded-2xl p-5 shadow-modern-lg space-y-4 border border-zinc-200 animate-in slide-in-from-top-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
            <span className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Camera size={16} className="text-zinc-700" />
              <span>오늘의 착용 룩 기록</span>
            </span>
            <button
              onClick={() => setIsRecording(false)}
              className="text-xs text-zinc-400 hover:text-zinc-700 font-medium"
            >
              취소
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* OOTD Image Upload / Picker (3:4 Lookbook Frame) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-1.5">
                착샷 사진 (3:4 비율) <span className="text-rose-500">*</span>
              </label>

              {ootdImage ? (
                <div className="relative aspect-[3/4] max-h-72 w-full rounded-xl overflow-hidden bg-zinc-100 shadow-modern border border-zinc-200 mx-auto">
                  <img src={ootdImage} alt="OOTD Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setOotdImage('')}
                    className="absolute top-2.5 right-2.5 px-3 py-1 bg-zinc-900/80 text-white text-[11px] font-medium rounded-md hover:bg-zinc-900"
                  >
                    사진 변경
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative h-40 rounded-xl border-2 border-dashed border-zinc-300 hover:border-zinc-500 bg-zinc-50 flex flex-col items-center justify-center text-center p-3 cursor-pointer">
                    <Camera size={24} className="text-zinc-400 mb-1" />
                    <span className="text-xs font-medium text-zinc-800">
                      착샷 사진 촬영 또는 앨범 업로드
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">
                      클릭하여 사진을 선택하세요
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      aria-label="착샷 사진 업로드"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>

                  {/* Preset quick test selector */}
                  <div className="flex items-center gap-2 pt-1 font-mono">
                    <span className="text-[11px] text-zinc-500">테스트 샘플:</span>
                    <div className="flex gap-2">
                      {sampleOotdPhotos.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handlePresetSampleImage(url)}
                          className="w-10 h-12 rounded-lg overflow-hidden border border-zinc-300 shadow-sm hover:border-zinc-900 transition-colors"
                        >
                          <img src={url} alt={`Sample ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Match/select items from closet */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-zinc-900">
                  착용한 옷 매칭 <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                  {selectedItemIds.length}벌 선택됨 (착용 카운트 +1)
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-2">
                선택한 의류는 누적 착용 횟수(+1)와 마지막 착용일이 오늘 날짜로 자동 갱신됩니다.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1.5 bg-zinc-50 rounded-xl border border-zinc-200">
                {activeItems.map((item) => {
                  const isSelected = selectedItemIds.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`relative flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-[#E11D48] text-white shadow-sm'
                          : 'bg-white hover:bg-[#FDF2F4] text-zinc-800 border border-rose-100/80'
                      }`}
                    >
                      <img
                        src={item.frontImage}
                        alt={item.name}
                        className="w-10 h-12 rounded object-cover shrink-0 bg-zinc-200"
                      />
                      <div className="min-w-0 flex-1">
                        <span className={`text-[9px] font-mono block truncate ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {item.category}
                        </span>
                        <h5 className="text-[11px] font-semibold truncate leading-tight mt-0.5">
                          {item.name}
                        </h5>
                        <span className={`text-[10px] font-mono block mt-0.5 ${isSelected ? 'text-emerald-300' : 'text-zinc-500'}`}>
                          현재 {item.wearCount}회
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-white text-zinc-900 rounded-full p-0.5 shadow-sm">
                          <Check size={9} className="stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date, TPO, Weather */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  착용 날짜
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 font-mono text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  TPO
                </label>
                <select
                  value={tpo}
                  onChange={(e) => setTpo(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 font-medium text-zinc-900"
                >
                  <option value="출근룩">출근룩</option>
                  <option value="하객룩">하객룩</option>
                  <option value="주말 데이트">주말 데이트</option>
                  <option value="가벼운 산책">가벼운 산책</option>
                  <option value="비즈니스 미팅">비즈니스 미팅</option>
                  <option value="여행룩">여행룩</option>
                  <option value="홈웨어/원마일">원마일웨어</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1 font-mono">
                  기온 (°C)
                </label>
                <input
                  type="number"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 font-mono text-zinc-900"
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                코디 메모 & 착용 소감
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 니트와 슬랙스 조합이 편안했고 신발 착화감이 좋았음"
                className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#E11D48] hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 size={15} />
              <span>착샷 기록 저장 & 착용 카운트 갱신</span>
            </button>
          </form>
        </div>
      )}

      {/* Timeline of Past OOTD Records */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
          <Calendar size={14} className="text-zinc-500" />
          <span>착샷 일기 아카이브 ({ootdRecords.length}건)</span>
        </h3>

        {ootdRecords.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center space-y-2 shadow-modern border border-zinc-200">
            <p className="text-sm font-semibold text-zinc-900">등록된 OOTD 착샷 기록이 없습니다</p>
            <p className="text-xs text-zinc-500">
              오늘 입은 옷을 기록하여 착용 횟수와 CPW 가성비를 누적해 보세요.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ootdRecords.map((record) => {
              const matchedItems = items.filter((item) =>
                record.clothingItemIds.includes(item.id)
              );

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-4 shadow-modern border border-zinc-200 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 flex-wrap font-mono">
                      <span className="font-semibold text-zinc-900">
                        {record.date}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px]">
                        {record.tpo}
                      </span>
                      <span className="text-zinc-400">
                        · {record.weather?.temp}°C {record.weather?.condition}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('이 OOTD 기록을 삭제하시겠습니까?')) {
                          onDeleteOOTD(record.id);
                        }
                      }}
                      className="text-zinc-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex gap-3.5">
                    <img
                      src={record.image}
                      alt="OOTD"
                      className="w-20 aspect-[3/4] rounded-lg object-cover shrink-0 bg-zinc-100 border border-zinc-200"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-medium text-zinc-500 block mb-1">
                          착용 아이템 ({matchedItems.length}벌):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchedItems.map((item) => (
                            <span
                              key={item.id}
                              className="text-[11px] font-medium bg-zinc-50 text-zinc-800 border border-zinc-200 px-2 py-1 rounded-md flex items-center gap-1.5"
                            >
                              <img
                                src={item.frontImage}
                                alt={item.name}
                                className="w-3.5 h-4.5 rounded-xs object-cover bg-zinc-200"
                              />
                              <span>{item.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {record.memo && (
                        <p className="text-xs text-zinc-700 bg-zinc-50 p-2.5 rounded-lg mt-2 border border-zinc-200/80">
                          "{record.memo}"
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

