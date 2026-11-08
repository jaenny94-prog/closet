import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Sparkles,
  Calendar,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check,
  Loader2,
  Tag,
  Info,
} from 'lucide-react';
import { CosmeticItem, CosmeticCategory } from '../../types/closet';
import {
  calculateCosmeticExpiry,
  calculateCosmeticDDay,
  RECOMMENDED_PAO_BY_CATEGORY,
  COSMETIC_CATEGORY_LABELS,
} from '../../utils/closetLogic';

interface CosmeticRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<CosmeticItem, 'id' | 'createdAt' | 'status'>) => void;
}

const CATEGORIES: { id: CosmeticCategory; label: string; defaultPao: number }[] = [
  { id: 'skincare', label: '기초 스킨케어', defaultPao: 12 },
  { id: 'base', label: '베이스 메이크업', defaultPao: 12 },
  { id: 'lip', label: '립 메이크업', defaultPao: 12 },
  { id: 'eye', label: '아이 메이크업 (마스카라 등)', defaultPao: 6 },
  { id: 'suncare', label: '선케어 (자외선 차단)', defaultPao: 12 },
  { id: 'cleansing', label: '클렌징·팩', defaultPao: 12 },
  { id: 'other', label: '기타·바디·향수', defaultPao: 24 },
];

export const CosmeticRegisterModal: React.FC<CosmeticRegisterModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultFutureExp = new Date(
    new Date().getFullYear() + 2,
    new Date().getMonth(),
    new Date().getDate()
  )
    .toISOString()
    .split('T')[0];

  const [frontImage, setFrontImage] = useState<string>('');
  const [labelImage, setLabelImage] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [category, setCategory] = useState<CosmeticCategory>('skincare');
  const [purchaseDate, setPurchaseDate] = useState<string>(todayStr);
  const [openedDate, setOpenedDate] = useState<string>(todayStr);
  const [expDate, setExpDate] = useState<string>(defaultFutureExp);
  const [paoMonths, setPaoMonths] = useState<number>(12);
  const [price, setPrice] = useState<string>('28000');
  const [memo, setMemo] = useState<string>('');

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  // Auto-adjust PAO recommendation when category changes
  const handleCategoryChange = (newCat: CosmeticCategory) => {
    setCategory(newCat);
    const recPao = RECOMMENDED_PAO_BY_CATEGORY[newCat] || 12;
    setPaoMonths(recPao);
  };

  // Live calculation of effective expiry date
  const { effectiveExpiryDate, reason } = calculateCosmeticExpiry(
    openedDate,
    paoMonths,
    expDate
  );
  const dDayInfo = calculateCosmeticDDay(effectiveExpiryDate);

  // Quick photo upload helpers
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'label'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'front') {
        setFrontImage(dataUrl);
      } else {
        setLabelImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Sample quick presets for testing
  const applyPreset = (presetType: 'serum' | 'lipstick' | 'mascara') => {
    if (presetType === 'serum') {
      setFrontImage(
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
      );
      setLabelImage(
        'https://images.unsplash.com/photo-1608248597359-2c0b299e5595?auto=format&fit=crop&w=600&q=80'
      );
      setName('달바 화이트 트러플 수분 미스트 세럼');
      setBrand('d\'Alba');
      setCategory('skincare');
      setPaoMonths(12);
      setExpDate('2028-05-20');
      setPrice('29900');
      setMemo('산뜻한 오일 미스트 / 개봉 후 12M 권장');
    } else if (presetType === 'lipstick') {
      setFrontImage(
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
      );
      setLabelImage(
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80'
      );
      setName('롬앤 글래스팅 멜팅 립밤 (러비 핑크)');
      setBrand('rom&nd');
      setCategory('lip');
      setPaoMonths(12);
      setExpDate('2027-08-15');
      setPrice('14000');
      setMemo('촉촉한 물막 틴트밤');
    } else {
      setFrontImage(
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80'
      );
      setLabelImage(
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
      );
      setName('키스미 히로인메이크 롱앤컬 마스카라 EX');
      setBrand('KISSME');
      setCategory('eye');
      setPaoMonths(6); // 마스카라 위생 6M
      setExpDate('2027-12-31');
      setPrice('18000');
      setMemo('안구 점막 접촉 제품으로 개봉 6개월 엄수');
    }
  };

  // Run AI Label / OCR Analysis
  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiMessage(null);
    try {
      const res = await fetch('/api/gemini/analyze-cosmetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImageBase64: frontImage,
          labelImageBase64: labelImage,
          textHint: name || brand || '화장품 라벨 유통기한 분석',
        }),
      });

      if (!res.ok) throw new Error('AI 분석 서버 응답 오류');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.name) setName(d.name);
        if (d.brand) setBrand(d.brand);
        if (d.category && CATEGORIES.some((c) => c.id === d.category)) {
          setCategory(d.category as CosmeticCategory);
        }
        if (d.expDate) setExpDate(d.expDate);
        if (d.paoMonths) setPaoMonths(Number(d.paoMonths));
        if (d.price) setPrice(String(d.price));
        if (d.memo) setMemo(d.memo);

        setAiMessage(
          json.source === 'gemini'
            ? '✨ Gemini AI가 라벨에서 유통기한(EXP)과 PAO 마크를 정확히 인식했습니다!'
            : '✨ 뷰티 인식 엔진으로 카테고리 권장 사용기한 및 유통기한을 자동 적용했습니다.'
        );
      }
    } catch (err: any) {
      console.error('Cosmetic AI analysis error:', err);
      setAiMessage('⚠️ AI 분석 요청 중 문제가 발생했습니다. 직접 입력값을 확인해 주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      brand: brand.trim() || '브랜드 미기재',
      category,
      frontImage:
        frontImage ||
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      labelImage: labelImage || undefined,
      purchaseDate,
      openedDate,
      expDate,
      paoMonths,
      effectiveExpiryDate,
      price: price ? Number(price) : undefined,
      memo: memo.trim() || undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-modern-float max-h-[92vh] flex flex-col overflow-hidden border border-[#FFCED8]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#FFDDDD] flex items-center justify-between bg-gradient-to-r from-[#FFF4DE] via-[#FFDDDD] to-[#FFCED8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center text-rose-500 shadow-modern-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">
                화장품 등록 & 유통기한 관리
              </h2>
              <p className="text-xs text-rose-900/70">
                사진 2장으로 EXP 유통기한과 개봉 후 기한(PAO)을 자동 계산
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Preset Buttons for rapid testing */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium text-rose-950">샘플 불러오기:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset('serum')}
                className="px-2.5 py-1 rounded-full bg-[#FFF4DE] hover:bg-[#FFE8C4] text-amber-900 font-medium transition-colors border border-amber-200/50"
              >
                미스트 세럼
              </button>
              <button
                type="button"
                onClick={() => applyPreset('lipstick')}
                className="px-2.5 py-1 rounded-full bg-[#FFDDDD] hover:bg-[#FFCED8] text-rose-900 font-medium transition-colors border border-rose-200/50"
              >
                립스틱
              </button>
              <button
                type="button"
                onClick={() => applyPreset('mascara')}
                className="px-2.5 py-1 rounded-full bg-[#FFE8C4] hover:bg-[#FFCED8] text-orange-950 font-medium transition-colors border border-orange-200/50"
              >
                마스카라 (6M)
              </button>
            </div>
          </div>

          {/* 2 Photo Upload Slots */}
          <div className="grid grid-cols-2 gap-3">
            {/* Slot 1: Front photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                <span>1. 제품 정면 사진</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-[#FFCED8] bg-[#FFFDF8] hover:bg-[#FFF4DE]/40 transition-colors flex flex-col items-center justify-center overflow-hidden group">
                {frontImage ? (
                  <>
                    <img
                      src={frontImage}
                      alt="제품 정면"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded-full">
                        사진 변경
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-rose-900/60">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-rose-400" />
                    <p className="text-xs font-medium">정면 사진</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">디자인/브랜드</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'front')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Slot 2: Label / Bottom EXP photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                <span>2. 바닥/뒷면 라벨 사진</span>
                <span className="text-rose-500 text-[10px]">(EXP/PAO)</span>
              </label>
              <div className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-[#FFCED8] bg-[#FFFDF8] hover:bg-[#FFF4DE]/40 transition-colors flex flex-col items-center justify-center overflow-hidden group">
                {labelImage ? (
                  <>
                    <img
                      src={labelImage}
                      alt="라벨/바닥 사진"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs text-white font-medium bg-black/60 px-2 py-1 rounded-full">
                        사진 변경
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-3 text-rose-900/60">
                    <Tag className="w-6 h-6 mx-auto mb-1 text-rose-400" />
                    <p className="text-xs font-medium">라벨/유통기한</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">EXP 날짜 & 12M</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'label')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* AI Auto Analysis Button */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-[#FFF4DE] to-[#FFDDDD] border border-[#FFCED8]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  AI 라벨 & 유통기한 자동 인식
                </p>
                <p className="text-[11px] text-rose-950/70 truncate">
                  라벨 사진의 EXP 날짜와 PAO(6M/12M) 기호를 자동 판독
                </p>
              </div>
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-modern-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI 자동 분석</span>
                  </>
                )}
              </button>
            </div>
            {aiMessage && (
              <p className="text-xs text-rose-800 mt-2 pt-2 border-t border-rose-200/60">
                {aiMessage}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <form id="cosmetic-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name & Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">제품명 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 화이트 트러플 세럼"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">브랜드</label>
                <input
                  type="text"
                  placeholder="예: 달바, 롬앤, 헤라"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                <span>카테고리</span>
                <span className="text-[10px] text-gray-500 font-normal">
                  선택 시 권장 PAO 자동 제안
                </span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCategoryChange(c.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-modern-sm'
                          : 'bg-rose-50 text-rose-950 hover:bg-rose-100 border border-rose-200/60'
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Crucial Expiration Calculation Grid */}
            <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-[#FFCED8] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <Calendar className="w-4 h-4 text-rose-600" />
                <span>유통기한 & 개봉 후 사용기한(PAO) 설정</span>
              </div>

              {/* Opened Date (개봉일 - 중요) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-950 flex items-center gap-1">
                    <span>개봉일 (핵심)</span>
                    <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={openedDate}
                    onChange={(e) => setOpenedDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[10px] text-gray-500">실제 개봉한 날짜</p>
                </div>

                {/* EXP Date (용기 인쇄 유통기한) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    기본 유통기한 (EXP)
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                  <p className="text-[10px] text-gray-500">용기 표기 EXP 날짜</p>
                </div>
              </div>

              {/* PAO Months selection */}
              <div className="space-y-1.5 pt-1 border-t border-rose-100">
                <label className="text-xs font-semibold text-gray-800 flex items-center justify-between">
                  <span>개봉 후 권장 사용기한 (PAO)</span>
                  <span className="text-xs font-bold text-rose-600">{paoMonths}개월</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[6, 12, 24].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaoMonths(m)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                        paoMonths === m
                          ? 'bg-rose-500 text-white border-rose-500 shadow-modern-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-rose-50'
                      }`}
                    >
                      {m}개월 {m === 6 ? '(아이/선)' : m === 12 ? '(권장 표준)' : '(파우더/향수)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Calculation Banner */}
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 transition-all ${
                  dDayInfo.status === 'expired'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : dDayInfo.status === 'impending'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                {dDayInfo.status === 'expired' ? (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : dDayInfo.status === 'impending' ? (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">
                      최종 만료일: {effectiveExpiryDate}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        dDayInfo.status === 'expired'
                          ? 'bg-rose-600 text-white'
                          : dDayInfo.status === 'impending'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {dDayInfo.dDayText}
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    {reason === 'pao'
                      ? `[개봉일 + ${paoMonths}개월]이 기본 유통기한보다 빨라 우선 적용되었습니다.`
                      : '[인쇄된 유통기한(EXP)]이 개봉 권장기한보다 빨라 만료일로 적용되었습니다.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Price & Memo */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">구매 가격 (원)</label>
                <input
                  type="number"
                  placeholder="28000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">구매일</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">메모 & 피부 팁</label>
              <textarea
                rows={2}
                placeholder="예: 촉촉한 제형, 건조한 날씨에 적합, 냉장 보관 권장"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#FFDDDD] bg-[#FFFDF8] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="cosmetic-form"
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-modern-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>파우치에 저장하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
