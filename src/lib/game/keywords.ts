/**
 * MVP 키워드 풀 (~50개)
 * 카테고리별로 분류, 라운드마다 중복 없이 랜덤 선택
 */

export interface Keyword {
  word: string;
  emoji: string;
  category: string;
}

export const KEYWORDS: Keyword[] = [
  // 과일
  { word: "사과", emoji: "🍎", category: "과일" },
  { word: "바나나", emoji: "🍌", category: "과일" },
  { word: "수박", emoji: "🍉", category: "과일" },
  { word: "포도", emoji: "🍇", category: "과일" },
  { word: "딸기", emoji: "🍓", category: "과일" },
  { word: "오렌지", emoji: "🍊", category: "과일" },
  { word: "체리", emoji: "🍒", category: "과일" },
  { word: "복숭아", emoji: "🍑", category: "과일" },
  { word: "파인애플", emoji: "🍍", category: "과일" },
  { word: "레몬", emoji: "🍋", category: "과일" },

  // 동물
  { word: "고양이", emoji: "🐱", category: "동물" },
  { word: "강아지", emoji: "🐶", category: "동물" },
  { word: "토끼", emoji: "🐰", category: "동물" },
  { word: "코끼리", emoji: "🐘", category: "동물" },
  { word: "펭귄", emoji: "🐧", category: "동물" },
  { word: "돌고래", emoji: "🐬", category: "동물" },
  { word: "사자", emoji: "🦁", category: "동물" },
  { word: "곰", emoji: "🐻", category: "동물" },
  { word: "닭", emoji: "🐔", category: "동물" },
  { word: "물고기", emoji: "🐟", category: "동물" },

  // 사물
  { word: "자동차", emoji: "🚗", category: "사물" },
  { word: "비행기", emoji: "✈️", category: "사물" },
  { word: "집", emoji: "🏠", category: "사물" },
  { word: "우산", emoji: "☂️", category: "사물" },
  { word: "안경", emoji: "👓", category: "사물" },
  { word: "시계", emoji: "⏰", category: "사물" },
  { word: "책", emoji: "📚", category: "사물" },
  { word: "가위", emoji: "✂️", category: "사물" },
  { word: "열쇠", emoji: "🔑", category: "사물" },
  { word: "카메라", emoji: "📷", category: "사물" },

  // 음식
  { word: "피자", emoji: "🍕", category: "음식" },
  { word: "햄버거", emoji: "🍔", category: "음식" },
  { word: "아이스크림", emoji: "🍦", category: "음식" },
  { word: "케이크", emoji: "🎂", category: "음식" },
  { word: "라면", emoji: "🍜", category: "음식" },
  { word: "김밥", emoji: "🍙", category: "음식" },
  { word: "떡볶이", emoji: "🌶️", category: "음식" },
  { word: "치킨", emoji: "🍗", category: "음식" },

  // 자연
  { word: "해", emoji: "☀️", category: "자연" },
  { word: "달", emoji: "🌙", category: "자연" },
  { word: "별", emoji: "⭐", category: "자연" },
  { word: "무지개", emoji: "🌈", category: "자연" },
  { word: "꽃", emoji: "🌸", category: "자연" },
  { word: "나무", emoji: "🌳", category: "자연" },
  { word: "비", emoji: "🌧️", category: "자연" },
  { word: "눈", emoji: "❄️", category: "자연" },
  { word: "산", emoji: "⛰️", category: "자연" },
  { word: "바다", emoji: "🌊", category: "자연" },

  // 학교
  { word: "연필", emoji: "✏️", category: "학교" },
  { word: "가방", emoji: "🎒", category: "학교" },
  { word: "운동장", emoji: "🏃", category: "학교" },
];

/**
 * Pick N random keywords without duplicates.
 * Optionally exclude keywords already used.
 */
export function pickKeywords(count: number, exclude: string[] = []): Keyword[] {
  const available = KEYWORDS.filter((k) => !exclude.includes(k.word));
  const shuffled = [...available];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
