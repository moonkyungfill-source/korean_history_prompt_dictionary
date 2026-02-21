import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Replication of the sorting constants and logic from PromptList.tsx
// ---------------------------------------------------------------------------

const ERA_ORDER_INDEX: Record<string, number> = {
  prehistoric: 0,
  gojoseon: 1,
  threeKingdoms: 2,
  northSouth: 3,
  goryeo: 4,
  joseon: 5,
  koreanEmpire: 6,
  japaneseOccupation: 7,
  modern: 8,
};

interface MockPrompt {
  id: string;
  era: string;
  usageCount: number;
}

function sortByEra(items: MockPrompt[]): MockPrompt[] {
  return [...items].sort((a, b) => {
    const eraA = ERA_ORDER_INDEX[a.era] ?? 99;
    const eraB = ERA_ORDER_INDEX[b.era] ?? 99;
    if (eraA !== eraB) return eraA - eraB;
    return b.usageCount - a.usageCount;
  });
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ALL_ERA_PROMPTS: MockPrompt[] = [
  { id: 'p1', era: 'modern', usageCount: 100 },
  { id: 'p2', era: 'prehistoric', usageCount: 50 },
  { id: 'p3', era: 'joseon', usageCount: 200 },
  { id: 'p4', era: 'gojoseon', usageCount: 75 },
  { id: 'p5', era: 'threeKingdoms', usageCount: 30 },
  { id: 'p6', era: 'northSouth', usageCount: 60 },
  { id: 'p7', era: 'goryeo', usageCount: 90 },
  { id: 'p8', era: 'koreanEmpire', usageCount: 45 },
  { id: 'p9', era: 'japaneseOccupation', usageCount: 80 },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Era chronological ordering', () => {
  it('sorts prompts by era chronological order (prehistoric first, modern last)', () => {
    const result = sortByEra(ALL_ERA_PROMPTS);
    const eras = result.map((p) => p.era);

    expect(eras).toEqual([
      'prehistoric',
      'gojoseon',
      'threeKingdoms',
      'northSouth',
      'goryeo',
      'joseon',
      'koreanEmpire',
      'japaneseOccupation',
      'modern',
    ]);
  });

  it('within the same era, sorts by usageCount descending', () => {
    const sameEraPrompts: MockPrompt[] = [
      { id: 'a', era: 'joseon', usageCount: 10 },
      { id: 'b', era: 'joseon', usageCount: 500 },
      { id: 'c', era: 'joseon', usageCount: 250 },
    ];

    const result = sortByEra(sameEraPrompts);
    expect(result.map((p) => p.usageCount)).toEqual([500, 250, 10]);
    expect(result.map((p) => p.id)).toEqual(['b', 'c', 'a']);
  });

  it('handles mixed eras correctly', () => {
    const mixed: MockPrompt[] = [
      { id: 'x1', era: 'modern', usageCount: 999 },
      { id: 'x2', era: 'goryeo', usageCount: 1 },
      { id: 'x3', era: 'prehistoric', usageCount: 0 },
    ];

    const result = sortByEra(mixed);
    expect(result[0].era).toBe('prehistoric');
    expect(result[1].era).toBe('goryeo');
    expect(result[2].era).toBe('modern');
  });

  it('puts unknown era at the end (index 99)', () => {
    const withUnknown: MockPrompt[] = [
      { id: 'u1', era: 'unknownEra', usageCount: 9999 },
      { id: 'u2', era: 'modern', usageCount: 1 },
      { id: 'u3', era: 'prehistoric', usageCount: 1 },
    ];

    const result = sortByEra(withUnknown);
    expect(result[0].era).toBe('prehistoric');
    expect(result[1].era).toBe('modern');
    expect(result[2].era).toBe('unknownEra');
  });

  it('handles an empty array', () => {
    const result = sortByEra([]);
    expect(result).toEqual([]);
  });

  it('handles a single-item array', () => {
    const single: MockPrompt[] = [{ id: 's1', era: 'goryeo', usageCount: 42 }];
    const result = sortByEra(single);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('s1');
  });

  it('preserves all items (no items lost during sort)', () => {
    const result = sortByEra(ALL_ERA_PROMPTS);
    expect(result).toHaveLength(ALL_ERA_PROMPTS.length);

    const originalIds = new Set(ALL_ERA_PROMPTS.map((p) => p.id));
    const resultIds = new Set(result.map((p) => p.id));
    expect(resultIds).toEqual(originalIds);
  });

  it('all 9 eras have correct relative order', () => {
    const eraOrder = [
      'prehistoric',
      'gojoseon',
      'threeKingdoms',
      'northSouth',
      'goryeo',
      'joseon',
      'koreanEmpire',
      'japaneseOccupation',
      'modern',
    ];

    // Verify each consecutive pair is in ascending index order
    for (let i = 0; i < eraOrder.length - 1; i++) {
      const currentIndex = ERA_ORDER_INDEX[eraOrder[i]];
      const nextIndex = ERA_ORDER_INDEX[eraOrder[i + 1]];
      expect(currentIndex).toBeLessThan(nextIndex);
    }
  });

  it('does not mutate the original array', () => {
    const original: MockPrompt[] = [
      { id: 'm1', era: 'modern', usageCount: 10 },
      { id: 'm2', era: 'prehistoric', usageCount: 5 },
    ];
    const originalCopy = [...original];

    sortByEra(original);

    // Original array order must be unchanged
    expect(original[0].id).toBe(originalCopy[0].id);
    expect(original[1].id).toBe(originalCopy[1].id);
  });

  it('sorts multiple unknown eras by usageCount descending among themselves', () => {
    const unknowns: MockPrompt[] = [
      { id: 'un1', era: 'futureEra', usageCount: 50 },
      { id: 'un2', era: 'alienEra', usageCount: 200 },
    ];

    const result = sortByEra(unknowns);
    // Both are index 99, so usageCount descending applies
    expect(result[0].usageCount).toBe(200);
    expect(result[1].usageCount).toBe(50);
  });
});
