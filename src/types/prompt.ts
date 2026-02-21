import { Timestamp } from 'firebase/firestore';

export interface Prompt {
  id: string;
  title: Record<string, string>; // { ko: "석굴암", en: "Seokguram Grotto", ... }
  era: EraKey;
  category: CategoryKey;
  promptText: string;
  thumbnailUrl: string | null;
  tags: string[];
  keywords: string[]; // Firestore array-contains search
  usageCount: number;
  status: 'draft' | 'published';
  isFeatured: boolean;
  bookmarkCount: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Timestamp;
}

export interface Generation {
  id: string;
  uid: string;
  promptId: string;
  promptText: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl: string | null;
  storagePath: string | null;
  creditsCharged: number;
  createdAt: Timestamp;
  completedAt: Timestamp | null;
}

// Era keys map to translation keys in messages/*.json under "eras"
export const ERA_KEYS = [
  'all',
  'prehistoric',
  'gojoseon',
  'threeKingdoms',
  'northSouth',
  'goryeo',
  'joseon',
  'koreanEmpire',
  'japaneseOccupation',
  'modern',
] as const;

export type EraKey = (typeof ERA_KEYS)[number];

// Maps i18n keys → Korean Firestore values
export const ERA_TO_KOREAN: Record<EraKey, string> = {
  all: '전체',
  prehistoric: '선사시대',
  gojoseon: '고조선',
  threeKingdoms: '삼국시대',
  northSouth: '남북국시대',
  goryeo: '고려시대',
  joseon: '조선시대',
  koreanEmpire: '대한제국',
  japaneseOccupation: '일제강점기',
  modern: '현대',
};

// Reverse map: Korean → i18n key
export const KOREAN_TO_ERA_KEY: Record<string, EraKey> = Object.fromEntries(
  Object.entries(ERA_TO_KOREAN).map(([k, v]) => [v, k as EraKey])
) as Record<string, EraKey>;

// Category keys map to translation keys in messages/*.json under "categories"
export const CATEGORY_KEYS = [
  'all',
  'war',
  'culture',
  'people',
  'architecture',
  'art',
  'dailyLife',
  'politics',
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_TO_KOREAN: Record<CategoryKey, string> = {
  all: '전체',
  war: '전쟁',
  culture: '문화',
  people: '인물',
  architecture: '건축',
  art: '예술',
  dailyLife: '생활',
  politics: '정치',
};

export const KOREAN_TO_CATEGORY_KEY: Record<string, CategoryKey> = Object.fromEntries(
  Object.entries(CATEGORY_TO_KOREAN).map(([k, v]) => [v, k as CategoryKey])
) as Record<string, CategoryKey>;

// Legacy string arrays (for backward compatibility)
export const ERA_OPTIONS = Object.values(ERA_TO_KOREAN);
export const CATEGORY_OPTIONS = Object.values(CATEGORY_TO_KOREAN);
