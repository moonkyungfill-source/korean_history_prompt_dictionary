export interface CreditPackage {
  id: string;
  credits: number;
  priceKRW: number;
}

export const CREDIT_PACKAGES: Record<string, CreditPackage> = {
  credit_10:  { id: 'credit_10',  credits: 10,  priceKRW: 1000 },
  credit_50:  { id: 'credit_50',  credits: 50,  priceKRW: 4500 },
  credit_100: { id: 'credit_100', credits: 100, priceKRW: 8000 },
} as const;

export const IMAGE_GENERATION_COST = 1;
