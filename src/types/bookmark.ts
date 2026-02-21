import { Timestamp } from 'firebase/firestore';
import { EraKey } from './prompt';

export interface Bookmark {
  promptId: string;
  promptSnapshot: {
    title: Record<string, string>;
    era: EraKey;
    thumbnailUrl: string | null;
  };
  createdAt: Timestamp;
}
