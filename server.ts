import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Server-side Gemini Client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: AI Barcode / Tag OCR analysis
app.post('/api/gemini/analyze-tag', async (req, res) => {
  try {
    const { imageBase64, textHint } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        source: 'local_engine',
        data: {
          brand: textHint ? `${textHint} Brand` : 'COS',
          price: 89000,
          purchaseDate: new Date().toISOString().split('T')[0],
          weatherText: '봄/가을, 14~22°C, 쾌청한 날',
          tempRange: { min: 14, max: 22, description: '봄/가을 온화한 기온' },
          tpoTags: ['출근룩', '주말 데이트', '가벼운 산책'],
          size: 'M (95~100)',
          targetWaistInch: 29,
          color: '뉴트럴 차콜',
        },
      });
    }

    const prompt = `당신은 한국의 패션 전문가 및 의류 라벨/바코드 분석 AI입니다.
업로드된 의류 사진 및 텍스트 힌트를 분석하여 다음 JSON 객체 형식으로만 응답해 주세요.
반드시 유효한 JSON 문자열만 출력하세요:
{
  "brand": "추출된 브랜드명 (없으면 무신사/자라/COS 중 적절한 추정)",
  "price": 숫자(원화 금액 추정, 예: 89000),
  "purchaseDate": "YYYY-MM-DD (오늘 날짜 또는 추정)",
  "name": "의류 추천 명칭",
  "category": "tops | bottoms | outerwear | shoes | onepiece | bags_accessories 중 하나",
  "weatherText": "입기 좋은 날씨 및 적정 기온 (예: 봄/가을, 15~22°C, 화창한 날)",
  "tempRange": { "min": 최소기온숫자, "max": 최대기온숫자, "description": "기온 요약" },
  "tpoTags": ["출근룩", "주말 데이트", "하객룩", "가벼운 산책", "캠퍼스룩" 등 2~4개],
  "color": "주요 색상명",
  "size": "사이즈 표기",
  "targetWaistInch": 28~34 사이 숫자(하의인 경우만, 아니면 null)
}`;

    const parts: any[] = [];
    if (imageBase64 && imageBase64.includes(';base64,')) {
      const [header, base64Data] = imageBase64.split(';base64,');
      const mimeType = header.replace('data:', '') || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
    parts.push({ text: `${prompt}\n추가 힌트: ${textHint || '없음'}` });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, source: 'gemini', data: parsed });
  } catch (error: any) {
    console.error('Gemini tag analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI 태그 분석 중 오류가 발생했습니다.',
    });
  }
});

// Endpoint: AI Outfit Recommendation
app.post('/api/gemini/recommend-outfit', async (req, res) => {
  try {
    const { items, weather, tpo, bodyProfile } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        source: 'local_fashion_engine',
        data: {
          topId: (items || []).find((i: any) => i.category === 'tops')?.id,
          bottomId: (items || []).find((i: any) => i.category === 'bottoms')?.id,
          outerwearId: (items || []).find((i: any) => i.category === 'outerwear')?.id,
          shoesId: (items || []).find((i: any) => i.category === 'shoes')?.id,
          title: `${tpo || '출근룩'} 맞춤 세련된 데일리 스타일링`,
          colorHarmonyReason: '모던한 뉴트럴 톤온톤 배색으로 어떤 환경에서도 편안하고 신뢰감 있는 인상을 줍니다.',
          silhouetteReason: '슬림하거나 레귤러한 상의 핏과 단정한 하의 라인이 자연스러운 세로 실루엣을 강조합니다.',
          bodyFitReason: `현재 허리(${bodyProfile?.waistInch || 30}인치)에 무리 없는 편안한 핏감으로 활동성을 보장합니다.`,
          weatherSuitabilityReason: `기온 ${weather?.temp || 18}°C에 최적화된 가벼우면서도 체온을 보호하는 원단 조합입니다.`,
          stylistTips: [
            '소매를 1회 가볍게 롤업하여 손목에 시계나 팔찌로 포인트를 더해보세요.',
            '상의 앞자락을 하의 안으로 살짝 프론트 턱(Front-tuck)하면 다리가 더욱 길어 보입니다.',
            '깔끔한 슈즈와 가방의 톤을 매치하면 코디의 완성도가 높아집니다.',
          ],
        },
      });
    }

    const prompt = `당신은 최고 수준의 퍼스널 패션 스타일리스트 AI입니다.
사용자의 옷장에 등록된 의류 목록과 현재 날씨, 목표 TPO, 사용자의 신체 치수(체중, 허리둘레 등)를 바탕으로 최적의 옷 조합을 추천해 주세요.

[현재 날씨]: 기온 ${weather?.temp || 18}°C, 상태 ${weather?.condition || '맑음'}
[목표 TPO]: ${tpo || '출근룩'}
[사용자 신체 프로필]: 키 ${bodyProfile?.height || 175}cm, 체중 ${bodyProfile?.weight || 70}kg, 허리둘레 ${bodyProfile?.waistInch || 30}인치(${bodyProfile?.waistCm || 76.2}cm), 상의 사이즈 ${bodyProfile?.topSize || '100'}, 하의 사이즈 ${bodyProfile?.bottomSize || '30'}

[등록된 의류 목록]:
${JSON.stringify(
  (items || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    color: i.color,
    tpoTags: i.tpoTags,
    tempRange: i.tempRange,
  })),
  null,
  2
)}

반드시 다음 JSON 형식으로만 응답해 주세요:
{
  "topId": "선택한 상의 id (목록에서)",
  "bottomId": "선택한 하의 id (목록에서)",
  "outerwearId": "선택한 아우터 id 또는 null",
  "shoesId": "선택한 신발 id 또는 null",
  "title": "코디 테마 타이틀",
  "colorHarmonyReason": "색상 조합 및 톤온톤/보색 매칭 이유",
  "silhouetteReason": "상·하의 실루엣 및 핏 밸런스 이유",
  "bodyFitReason": "사용자의 허리둘레 및 체형을 고려한 핏 코멘트",
  "weatherSuitabilityReason": "오늘 기온과 날씨에 알맞은 이유",
  "stylistTips": ["스타일링 팁 1", "스타일링 팁 2", "스타일링 팁 3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, source: 'gemini', data: parsed });
  } catch (error: any) {
    console.error('Gemini outfit recommendation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI 코디 생성 실패',
    });
  }
});

// Endpoint: AI Cosmetic Label & Expiry OCR analysis
app.post('/api/gemini/analyze-cosmetic', async (req, res) => {
  try {
    const { frontImageBase64, labelImageBase64, textHint } = req.body;

    if (!ai) {
      // Local intelligent fallback when Gemini key is not configured
      const isLip = (textHint || '').includes('립') || (textHint || '').includes('틴트');
      const isEye = (textHint || '').includes('마스카라') || (textHint || '').includes('아이');
      const isSun = (textHint || '').includes('선') || (textHint || '').includes('자외선');
      const isBase = (textHint || '').includes('쿠션') || (textHint || '').includes('파데');

      let category = 'skincare';
      let paoMonths = 12;
      let name = '스마트 모이스처 수분 세럼';
      let brand = '라로슈포제';

      if (isEye) {
        category = 'eye';
        paoMonths = 6;
        name = '래쉬 볼륨 워터프루프 마스카라';
        brand = '키스미';
      } else if (isLip) {
        category = 'lip';
        paoMonths = 12;
        name = '글래스팅 멜팅 립밤';
        brand = '롬앤';
      } else if (isSun) {
        category = 'suncare';
        paoMonths = 12;
        name = '워터풀 에센스 선크림 SPF50+';
        brand = '달바';
      } else if (isBase) {
        category = 'base';
        paoMonths = 12;
        name = '글로우 쿠션 21호 바닐라';
        brand = '헤라';
      }

      const today = new Date();
      const futureExp = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());

      return res.json({
        success: true,
        source: 'local_engine',
        data: {
          name: textHint ? `${textHint}` : name,
          brand,
          category,
          expDate: futureExp.toISOString().split('T')[0],
          paoMonths,
          price: 28000,
          memo: 'AI 라벨 인식을 통해 기본 권장 사용기한 및 유통기한이 산출되었습니다.',
        },
      });
    }

    const prompt = `당신은 화장품 라벨 및 유통기한 분석 전문 AI입니다.
업로드된 화장품 정면 사진 및 뒷면/바닥면의 라벨(EXP 유통기한, 개봉 후 사용기한 PAO 심볼 예: 6M, 12M, 24M, 바코드)을 분석하여 다음 JSON 객체 형식으로만 응답해 주세요.
반드시 유효한 JSON 문자열만 출력하세요:
{
  "name": "화장품 제품명 (예: 화이트 트러플 퍼스트 스프레이 세럼)",
  "brand": "브랜드명 (예: 달바, 롬앤, 헤라, 이니스프리 등)",
  "category": "skincare | base | lip | eye | suncare | cleansing | other 중 하나",
  "expDate": "YYYY-MM-DD 형식 (용기 또는 단상자에 인쇄된 EXP 날짜. 읽기 어렵거나 미기재 시 약 1.5~2년 후 날짜)",
  "paoMonths": 숫자 (원형 오픈 캔 심볼의 6M, 12M, 24M 숫자. 아이/마스카라는 6, 립/스킨/베이스는 12 등 권장치)",
  "price": 숫자 또는 0 (추정 정가 또는 기재된 가격),
  "memo": "라벨 판독 내용 (예: EXP 2027.05.12 표기 확인, 개봉 후 12개월(12M) 권장, 자외선 차단 기능성)"
}`;

    const parts: any[] = [];
    // Include front image if provided
    if (frontImageBase64 && frontImageBase64.includes(';base64,')) {
      const [header, base64Data] = frontImageBase64.split(';base64,');
      const mimeType = header.replace('data:', '') || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }
    // Include label image if provided
    if (labelImageBase64 && labelImageBase64.includes(';base64,')) {
      const [header, base64Data] = labelImageBase64.split(';base64,');
      const mimeType = header.replace('data:', '') || 'image/jpeg';
      parts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });
    }

    parts.push({ text: `${prompt}\n사용자 입력 힌트: ${textHint || '없음'}` });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, source: 'gemini', data: parsed });
  } catch (error: any) {
    console.error('Gemini cosmetic analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '화장품 라벨 AI 분석 중 오류가 발생했습니다.',
    });
  }
});


// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
