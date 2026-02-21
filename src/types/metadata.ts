import { EraKey, CategoryKey } from './prompt';

export interface EraMetadata {
  key: EraKey;
  order: number;
  emoji: string;
}

export interface CategoryMetadata {
  key: CategoryKey;
  order: number;
}
