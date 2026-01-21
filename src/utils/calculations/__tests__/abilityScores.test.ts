import { describe, it, expect } from '@jest/globals';
import { getAbilityModifier } from '../abilityScores';

describe('getAbilityModifier', () => {
  it('should return +0 for ability score 10', () => {
    expect(getAbilityModifier(10)).toBe(0);
  });

  it('should return +0 for ability score 11', () => {
    expect(getAbilityModifier(11)).toBe(0);
  });

  it('should return -5 for ability score 1', () => {
    expect(getAbilityModifier(1)).toBe(-5);
  });

  it('should return +10 for ability score 30', () => {
    expect(getAbilityModifier(30)).toBe(10);
  });

  it('should return correct modifier for odd scores', () => {
    expect(getAbilityModifier(15)).toBe(2);
    expect(getAbilityModifier(13)).toBe(1);
    expect(getAbilityModifier(17)).toBe(3);
  });

  it('should return correct modifier for even scores', () => {
    expect(getAbilityModifier(14)).toBe(2);
    expect(getAbilityModifier(16)).toBe(3);
    expect(getAbilityModifier(18)).toBe(4);
  });

  it('should return -1 for ability score 8', () => {
    expect(getAbilityModifier(8)).toBe(-1);
  });

  it('should return -1 for ability score 9', () => {
    expect(getAbilityModifier(9)).toBe(-1);
  });

  it('should handle all ability scores from 1 to 30', () => {
    const expectedModifiers = [
      -5, -4, -4, -3, -3, -2, -2, -1, -1, 0,  // 1-10
      0, 1, 1, 2, 2, 3, 3, 4, 4, 5,           // 11-20
      5, 6, 6, 7, 7, 8, 8, 9, 9, 10           // 21-30
    ];

    for (let score = 1; score <= 30; score++) {
      expect(getAbilityModifier(score)).toBe(expectedModifiers[score - 1]);
    }
  });
});
