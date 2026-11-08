import React, { useState } from 'react';
import {
  X,
  Camera,
  Sparkles,
  Barcode,
  CloudSun,
  MapPin,
  Loader2,
  CheckCircle2,
  Plus,
  FolderHeart,
  Check,
} from 'lucide-react';
import { ClothingItem, ClothingCategory, CustomCategory } from '../../types/closet';
import { PRESET_PHOTO_SAMPLES } from '../../data/sampleCloset';
import { mockOcrTagAnalysis } from '../../utils/closetLogic';

interface ClothingRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ClothingItem) => void;
  customCategories?: CustomCategory[];
}

export const ClothingRegisterModal: React.FC<ClothingRegisterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customCategories = [],
}) => {
  if (!isOpen) return null;

  const [selectedCustomCategories, setSelectedCustomCategories] = useState<string[]>([]);

  // 3 Photo slots
  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [tagImage, setTagImage] = useState<string>('');

  // Form Fields
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [price, setPrice] = useState<number | ''>(69000);
  const [store, setStore] = useState<string>('무신사 스탠다드');
  const [purchaseDate, setPurchaseDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [color, setColor] = useState<string>('블랙');
  const [size, setSize] = useState<string>('100 (L)');
  const [targetWaistInch, setTargetWaistInch] = useState<number | ''>(30);

  // AI Generated Tags
  const [weatherDescription, setWeatherDescription] = useState<string>(
    '봄/가을, 15~22°C, 쾌청한 날'
  );
  const [tempMin, setTempMin] = useState<number>(15);
  const [tempMax, setTempMax] = useState<number>(22);
  const [tpoTags, setTpoTags] = useState<string[]>([
    '출근룩',
    '주말 데이트',
    '가벼운 산책',
  ]);
  const [newTagInput, setNewTagInput] = useState<string>('');

  // AI Analysis Loading State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    targetSlot: 'front' | 'back' | 'tag'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (targetSlot === 'front') setFrontImage(result);
        if (targetSlot === 'back') setBackImage(result);
        if (targetSlot === 'tag') {
          setTagImage(result);
          triggerAiTagAnalysis(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = (preset: (typeof PRESET_PHOTO_SAMPLES)[0]) => {
    setFrontImage(preset.front);
    setBackImage(preset.back);
    setTagImage(preset.tag);
    setName(preset.title);
    if (preset.title.includes('팬츠') || preset.title.includes('데님')) {
      setCategory('bottoms');
      setTargetWaistInch(31);
    } else if (preset.title.includes('코트')) {
      setCategory('outerwear');
    } else {
      setCategory('tops');
    }
    triggerAiTagAnalysis(preset.tag, preset.hint);
  };

  const triggerAiTagAnalysis = async (tagImg: string, hint?: string) => {
    setIsAnalyzing(true);
    setAnalysisSource(null);

    try {
      const response = await fetch('/api/gemini/analyze-tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: tagImg,
          textHint: hint || name || store,
        }),
      });

      if (response.ok) {
        const resData = await response.json();
        if (resData.success && resData.data) {
          const d = resData.data;
          setAnalysisSource(resData.source === 'gemini' ? 'Gemini AI Vision' : 'AI 엔진');
          if (d.name) setName(d.name);
          if (d.category) setCategory(d.category);
          if (d.price) setPrice(d.price);
          if (d.brand) setStore(d.brand);
          if (d.purchaseDate) setPurchaseDate(d.purchaseDate);
          if (d.weatherText) setWeatherDescription(d.weatherText);
          if (d.tempRange) {
            setTempMin(d.tempRange.min);
            setTempMax(d.tempRange.max);
          }
          if (Array.isArray(d.tpoTags) && d.tpoTags.length > 0) {
            setTpoTags(d.tpoTags);
          }
          if (d.color) setColor(d.color);
          if (d.size) setSize(d.size);
          if (d.targetWaistInch) setTargetWaistInch(d.targetWaistInch);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch {
      // fallback
    }

    const fallback = mockOcrTagAnalysis(hint || name);
    setName((prev) => prev || fallback.name);
    setCategory(fallback.category);
    setPrice(fallback.price);
    setStore(fallback.brand);
    setPurchaseDate(fallback.purchaseDate);
    setWeatherDescription(fallback.tempRange.description);
    setTempMin(fallback.tempRange.min);
    setTempMax(fallback.tempRange.max);
    setTpoTags(fallback.tpoTags);
    setColor(fallback.color);
    setSize(fallback.size);
    if (fallback.targetWaistInch) setTargetWaistInch(fallback.targetWaistInch);
    setAnalysisSource('AI 패션 분석 엔진');
    setIsAnalyzing(false);
  };

  const handleAddTpoTag = () => {
    if (newTagInput.trim() && !tpoTags.includes(newTagInput.trim())) {
      setTpoTags([...tpoTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTpoTag = (tagToRemove: string) => {
    setTpoTags(tpoTags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: ClothingItem = {
      id: `item-${Date.now()}`,
      name: name.trim(),
      category,
      frontImage:
        frontImage ||
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      backImage: backImage || frontImage,
      tagImage: tagImage || '',
      price: Number(price) || 0,
      store: store.trim() || '미상',
      purchaseDate: purchaseDate || new Date().toISOString().split('T')[0],
      wearCount: 0,
      lastWornDate: undefined,
      season: ['봄', '가을'],
      tempRange: {
        min: tempMin,
        max: tempMax,
        description: weatherDescription,
      },
      weatherCondition: '온화함',
      tpoTags: tpoTags.length > 0 ? tpoTags : ['데일리', '출근룩'],
      color: color.trim() || '기타',
      size: size.trim() || 'Free',
      targetWaistInch: targetWaistInch ? Number(targetWaistInch) : undefined,
      status: 'active',
      notes: `${store} 구매 · AI 자동 태깅 완료`,
      customCategories: selectedCustomCategories,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-modern-float overflow-hidden border border-zinc-200">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
              <Camera size={16} />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">
                Item Registration
              </span>
              <h2 className="text-sm font-bold tracking-tight">새 의류 스마트 등록</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-zinc-50/50">
          {/* Preset Samples Selector for Quick Testing */}
          <div className="bg-white border border-zinc-200 rounded-xl p-3.5 space-y-2 shadow-modern-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-zinc-700" />
                <span>빠른 테스트용 샘플 프리셋</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">사진 3장 자동 채우기</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PHOTO_SAMPLES.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="flex flex-col items-center p-2 bg-zinc-50 rounded-lg border border-zinc-200/70 hover:bg-zinc-100 hover:border-zinc-300 transition-all text-center"
                >
                  <img
                    src={preset.front}
                    alt={preset.title}
                    className="w-full aspect-[3/4] object-cover rounded mb-1 bg-zinc-200"
                  />
                  <span className="text-[10px] font-medium text-zinc-800 truncate w-full">
                    {preset.title.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 3 Photo Upload Slots in 3:4 Lookbook Proportion */}
          <div className="bg-white p-4 rounded-xl shadow-modern-sm border border-zinc-200 space-y-2.5">
            <label className="block text-xs font-semibold text-zinc-900">
              의류 사진 3장 등록 (3:4 비율) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* Slot 1: Front */}
              <div className="relative flex flex-col">
                <div
                  className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 text-center transition-all overflow-hidden ${
                    frontImage
                      ? 'border-zinc-900 bg-white'
                      : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50'
                  }`}
                >
                  {frontImage ? (
                    <img
                      src={frontImage}
                      alt="정면 사진"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-1 text-zinc-500">
                      <Camera size={18} className="mb-1 text-zinc-400" />
                      <span className="text-[10px] font-medium">정면 사진</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="정면 사진 업로드"
                    onChange={(e) => handleImageUpload(e, 'front')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-center text-[10px] font-medium text-zinc-600 mt-1">
                  1. 정면
                </span>
              </div>

              {/* Slot 2: Back */}
              <div className="relative flex flex-col">
                <div
                  className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 text-center transition-all overflow-hidden ${
                    backImage
                      ? 'border-zinc-900 bg-white'
                      : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50'
                  }`}
                >
                  {backImage ? (
                    <img
                      src={backImage}
                      alt="뒷면 사진"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-1 text-zinc-500">
                      <Camera size={18} className="mb-1 text-zinc-400" />
                      <span className="text-[10px] font-medium">뒷면 사진</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="뒷면 사진 업로드"
                    onChange={(e) => handleImageUpload(e, 'back')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-center text-[10px] font-medium text-zinc-600 mt-1">
                  2. 뒷면
                </span>
              </div>

              {/* Slot 3: Tag / Barcode */}
              <div className="relative flex flex-col">
                <div
                  className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 text-center transition-all overflow-hidden ${
                    tagImage
                      ? 'border-zinc-900 bg-white'
                      : 'border-zinc-300 hover:border-zinc-500 bg-zinc-50'
                  }`}
                >
                  {tagImage ? (
                    <img
                      src={tagImage}
                      alt="바코드/택 사진"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-1 text-zinc-500">
                      <Barcode size={18} className="mb-1 text-zinc-400" />
                      <span className="text-[10px] font-medium">바코드/택</span>
                      <span className="text-[9px] text-zinc-400">OCR 추출</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    aria-label="바코드 또는 택 사진 업로드"
                    onChange={(e) => handleImageUpload(e, 'tag')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-center text-[10px] font-medium text-zinc-600 mt-1">
                  3. 바코드/택
                </span>
              </div>
            </div>

            {/* AI OCR Trigger Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => triggerAiTagAnalysis(tagImage || frontImage)}
                disabled={isAnalyzing || (!tagImage && !frontImage)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium shadow-modern-sm transition-all disabled:opacity-40 active:scale-95"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>AI 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>AI 바코드/택 자동 분석</span>
                  </>
                )}
              </button>
              {analysisSource && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {analysisSource}
                </span>
              )}
            </div>
          </div>

          {/* AI Generated Tags Preview & Edit: Zero-Pill Discipline */}
          <div className="p-4 bg-white rounded-xl shadow-modern-sm border border-zinc-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-zinc-700" />
                <span>AI 권장 태그 설정</span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">수정 가능</span>
            </div>

            {/* Weather & Temp Tag */}
            <div>
              <label className="text-[11px] font-medium text-zinc-700 flex items-center gap-1 mb-1">
                <CloudSun size={13} className="text-zinc-500" />
                <span>적정 날씨 및 기온 범위</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={weatherDescription}
                  onChange={(e) => setWeatherDescription(e.target.value)}
                  placeholder="예: 봄/가을, 15~22°C, 쾌청한 날"
                  className="col-span-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 font-medium focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                />
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    value={tempMin}
                    onChange={(e) => setTempMin(Number(e.target.value))}
                    aria-label="최저 기온"
                    className="w-full text-xs text-center bg-zinc-50 border border-zinc-200 rounded-lg py-2 font-bold text-zinc-700"
                  />
                  <span className="text-xs text-zinc-400">~</span>
                  <input
                    type="number"
                    value={tempMax}
                    onChange={(e) => setTempMax(Number(e.target.value))}
                    aria-label="최고 기온"
                    className="w-full text-xs text-center bg-zinc-50 border border-zinc-200 rounded-lg py-2 font-bold text-zinc-700"
                  />
                  <span className="text-xs text-zinc-500">°C</span>
                </div>
              </div>
            </div>

            {/* TPO Tags */}
            <div>
              <label className="text-[11px] font-medium text-zinc-700 flex items-center gap-1 mb-1">
                <MapPin size={13} className="text-zinc-500" />
                <span>추천 TPO (상황/장소)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tpoTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-800 rounded-md text-xs font-medium"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTpoTag(tag)}
                      aria-label={`${tag} 태그 삭제`}
                      className="text-zinc-400 hover:text-zinc-700"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTpoTag();
                    }
                  }}
                  placeholder="새 TPO 태그 입력 (예: 하객룩, 출근룩)"
                  className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddTpoTag}
                  className="px-3 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-800"
                >
                  <Plus size={13} className="stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Core Clothing Metadata Inputs */}
          <div className="bg-white p-4 rounded-xl shadow-modern-sm border border-zinc-200 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-1">
                의류명 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 캐시미어 릴렉스드 크루넥 니트"
                className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-medium text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  카테고리
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-medium text-zinc-900 focus:outline-hidden"
                >
                  <option value="tops">상의 (Top)</option>
                  <option value="bottoms">하의 (Bottom)</option>
                  <option value="outerwear">아우터 (Outerwear)</option>
                  <option value="shoes">신발 (Shoes)</option>
                  <option value="onepiece">원피스 / 셋업</option>
                  <option value="bags_accessories">가방 / 소품</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1 font-mono">
                  구매 가격 (원)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  placeholder="89000"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-mono font-bold text-zinc-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  구매처 (브랜드/스토어)
                </label>
                <input
                  type="text"
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  placeholder="예: 무신사, COS, 자라"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-medium text-zinc-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1 font-mono">
                  구매 날짜
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2.5 font-mono text-zinc-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  색상
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="블랙"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  표기 사이즈
                </label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="100 (L)"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1 font-mono">
                  허리 (인치)
                </label>
                <input
                  type="number"
                  value={targetWaistInch}
                  onChange={(e) =>
                    setTargetWaistInch(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  placeholder="30"
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-2 font-mono focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Custom Collections Multi-selection */}
          {customCategories.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-modern-sm border border-zinc-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <FolderHeart size={14} className="text-rose-500" />
                  <span>나만의 컬렉션 태그 (복수 선택 가능)</span>
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {selectedCustomCategories.length}개 선택됨
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                옷장 컬렉션(페이보릿, 하객룩, 출근룩 등)을 지정해 취향별로 모아보세요.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customCategories.map((cat) => {
                  const isSelected = selectedCustomCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCustomCategories(
                            selectedCustomCategories.filter((id) => id !== cat.id)
                          );
                        } else {
                          setSelectedCustomCategories([
                            ...selectedCustomCategories,
                            cat.id,
                          ]);
                        }
                      }}
                      className={`px-3 py-1.5 text-xs rounded-xl font-medium transition-all flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                          : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border-zinc-200'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-xl shadow-modern-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 size={15} />
              <span>옷장에 의류 등록 완료</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

