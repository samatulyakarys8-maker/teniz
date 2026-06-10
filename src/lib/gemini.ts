import { checkLegality } from "./fish";
import type { AnomalyVerdict, FishAiVerdict, FishType } from "./types";

const fishIdentificationPrompt = `Ты эксперт по рыбам Каспийского моря. 
Посмотри на фото и определи:
1. Вид рыбы (сазан/вобла/осётр/судак/другое)
2. Примерный размер в см
3. Законность: осётр мин 60см, сазан 40см, вобла 17см, судак 38см
4. Вердикт: МОЖНО ПРОДАВАТЬ или НУЖНО ОТПУСТИТЬ
Отвечай ТОЛЬКО в JSON: 
{вид, размер_см, законно: boolean, вердикт, причина}`;

export function priceAdvisorPrompt(
  species: string,
  weight: number,
  price: number,
  avgPrices: string,
) {
  return `Рыбак выставляет ${species} ${weight}кг по ${price}₸/кг.
Средние цены за 24ч: ${avgPrices}.
Дай совет 2 предложения на русском: справедливая ли цена 
и рекомендуемая цена.`;
}

export function anomalyPrompt(
  species: string,
  weight: number,
  remainingQuota: number,
  zoneAverage: number,
) {
  return `Рыбак поймал ${species} ${weight}кг. Квота осталась: ${remainingQuota}кг.
Средний улов в зоне: ${zoneAverage}кг/день.
Оцени риск 1-10. JSON: {риск, флаг: boolean, причина}`;
}

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

async function callGemini(parts: GeminiPart[], jsonMode = true) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: jsonMode
          ? {
              temperature: 0.2,
              responseMimeType: "application/json",
            }
          : { temperature: 0.4 },
      }),
    },
  );

  if (!response.ok) return null;
  const json = await response.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
}

function parseJson<T>(text: string | undefined | null): T | null {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? (JSON.parse(match[0]) as T) : null;
  }
}

export async function analyzeFishPhoto(file?: File | null): Promise<{
  verdict: FishAiVerdict;
  source: "gemini" | "demo";
}> {
  const parts: GeminiPart[] = [{ text: fishIdentificationPrompt }];

  if (file && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const buffer = Buffer.from(await file.arrayBuffer());
    parts.push({
      inlineData: {
        mimeType: file.type || "image/jpeg",
        data: buffer.toString("base64"),
      },
    });
  }

  const parsed = parseJson<FishAiVerdict>(await callGemini(parts));
  if (parsed?.["вид"] && typeof parsed?.["размер_см"] === "number") {
    const legality = checkLegality(parsed["вид"], parsed["размер_см"]);
    return {
      verdict: {
        ...parsed,
        "законно": legality.legal,
        "вердикт": legality.legal ? "МОЖНО ПРОДАВАТЬ" : "НУЖНО ОТПУСТИТЬ",
        "причина": parsed["причина"] || legality.reason,
      },
      source: "gemini",
    };
  }

  return {
    verdict: {
      "вид": "судак",
      "размер_см": 44,
      "законно": true,
      "вердикт": "МОЖНО ПРОДАВАТЬ",
      "причина": "Демо-режим: судак больше минимального размера 38 см.",
    },
    source: "demo",
  };
}

export async function advisePrice({
  species,
  weight,
  price,
  avgPrices,
}: {
  species: FishType;
  weight: number;
  price: number;
  avgPrices: string;
}) {
  const prompt = priceAdvisorPrompt(species, weight, price, avgPrices);
  const text = await callGemini([{ text: prompt }], false);
  if (text) return { advice: text.replace(/^"|"$/g, ""), source: "gemini" as const };
  return {
    advice:
      price > 3500
        ? "Цена выше средней по рынку, покупатели могут торговаться. Рекомендуемая цена: 3100-3300 ₸/кг для быстрой продажи."
        : "Цена выглядит справедливой для сегодняшнего спроса. Рекомендуем держать диапазон 2900-3200 ₸/кг и не уходить ниже себестоимости.",
    source: "demo" as const,
  };
}

export async function detectAnomaly({
  species,
  weight,
  remainingQuota,
  zoneAverage,
}: {
  species: FishType;
  weight: number;
  remainingQuota: number;
  zoneAverage: number;
}) {
  const text = await callGemini([
    { text: anomalyPrompt(species, weight, remainingQuota, zoneAverage) },
  ]);
  const parsed = parseJson<AnomalyVerdict>(text);
  if (parsed) return { anomaly: parsed, source: "gemini" as const };

  const risk = Math.min(10, Math.max(1, Math.round((weight / zoneAverage) * 4)));
  return {
    anomaly: {
      "риск": risk,
      "флаг": risk >= 7 || remainingQuota < weight,
      "причина":
        risk >= 7
          ? "Демо-режим: вес выше среднего по зоне, требуется проверка."
          : "Демо-режим: улов в пределах обычного диапазона.",
    },
    source: "demo" as const,
  };
}
