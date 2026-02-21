import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Replication of ERA_ORDER_INDEX from PromptList.tsx — pure logic tests
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

const EXPECTED_ERA_KEYS = [
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ERA_ORDER_INDEX — PromptList sorting constants', () => {
  it('covers all 9 historical eras', () => {
    const definedKeys = Object.keys(ERA_ORDER_INDEX);
    expect(definedKeys).toHaveLength(9);

    EXPECTED_ERA_KEYS.forEach((key) => {
      expect(ERA_ORDER_INDEX).toHaveProperty(key);
    });
  });

  it('ERA_ORDER_INDEX values are sequential 0–8', () => {
    const values = Object.values(ERA_ORDER_INDEX).sort((a, b) => a - b);
    expect(values).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('has no duplicate values in ERA_ORDER_INDEX', () => {
    const values = Object.values(ERA_ORDER_INDEX);
    const unique = new Set(values);
    expect(unique.size).toBe(values.length);
  });

  it('prehistoric (0) < gojoseon (1) < threeKingdoms (2)', () => {
    expect(ERA_ORDER_INDEX['prehistoric']).toBe(0);
    expect(ERA_ORDER_INDEX['gojoseon']).toBe(1);
    expect(ERA_ORDER_INDEX['threeKingdoms']).toBe(2);

    expect(ERA_ORDER_INDEX['prehistoric']).toBeLessThan(ERA_ORDER_INDEX['gojoseon']);
    expect(ERA_ORDER_INDEX['gojoseon']).toBeLessThan(ERA_ORDER_INDEX['threeKingdoms']);
  });

  it('threeKingdoms (2) < northSouth (3) < goryeo (4)', () => {
    expect(ERA_ORDER_INDEX['threeKingdoms']).toBe(2);
    expect(ERA_ORDER_INDEX['northSouth']).toBe(3);
    expect(ERA_ORDER_INDEX['goryeo']).toBe(4);

    expect(ERA_ORDER_INDEX['threeKingdoms']).toBeLessThan(ERA_ORDER_INDEX['northSouth']);
    expect(ERA_ORDER_INDEX['northSouth']).toBeLessThan(ERA_ORDER_INDEX['goryeo']);
  });

  it('goryeo (4) < joseon (5) < koreanEmpire (6)', () => {
    expect(ERA_ORDER_INDEX['goryeo']).toBe(4);
    expect(ERA_ORDER_INDEX['joseon']).toBe(5);
    expect(ERA_ORDER_INDEX['koreanEmpire']).toBe(6);

    expect(ERA_ORDER_INDEX['goryeo']).toBeLessThan(ERA_ORDER_INDEX['joseon']);
    expect(ERA_ORDER_INDEX['joseon']).toBeLessThan(ERA_ORDER_INDEX['koreanEmpire']);
  });

  it('koreanEmpire (6) < japaneseOccupation (7) < modern (8)', () => {
    expect(ERA_ORDER_INDEX['koreanEmpire']).toBe(6);
    expect(ERA_ORDER_INDEX['japaneseOccupation']).toBe(7);
    expect(ERA_ORDER_INDEX['modern']).toBe(8);

    expect(ERA_ORDER_INDEX['koreanEmpire']).toBeLessThan(ERA_ORDER_INDEX['japaneseOccupation']);
    expect(ERA_ORDER_INDEX['japaneseOccupation']).toBeLessThan(ERA_ORDER_INDEX['modern']);
  });

  it('prehistoric is the earliest era (index 0)', () => {
    const minValue = Math.min(...Object.values(ERA_ORDER_INDEX));
    expect(ERA_ORDER_INDEX['prehistoric']).toBe(minValue);
    expect(ERA_ORDER_INDEX['prehistoric']).toBe(0);
  });

  it('modern is the latest era (index 8)', () => {
    const maxValue = Math.max(...Object.values(ERA_ORDER_INDEX));
    expect(ERA_ORDER_INDEX['modern']).toBe(maxValue);
    expect(ERA_ORDER_INDEX['modern']).toBe(8);
  });

  it('each era key maps to a non-negative integer', () => {
    Object.entries(ERA_ORDER_INDEX).forEach(([key, value]) => {
      expect(typeof value).toBe('number');
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });

  it('the full order is strictly ascending when keys are sorted by value', () => {
    const sortedByValue = Object.entries(ERA_ORDER_INDEX)
      .sort(([, a], [, b]) => a - b)
      .map(([key]) => key);

    expect(sortedByValue).toEqual([
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
});
