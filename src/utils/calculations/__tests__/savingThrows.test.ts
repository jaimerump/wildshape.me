import { describe, it, expect } from '@jest/globals';
import { getSavingThrowBonus, getAllSavingThrows } from '../savingThrows';
import type { AbilityName } from '../../../models';

describe('getSavingThrowBonus', () => {
  it('should return ability modifier only when not proficient', () => {
    // Ability score 14 = +2 modifier
    expect(getSavingThrowBonus(14, 3, false)).toBe(2);
  });

  it('should return ability modifier + proficiency bonus when proficient', () => {
    // Ability score 14 = +2 modifier, PB +3 = +5 total
    expect(getSavingThrowBonus(14, 3, true)).toBe(5);
  });

  it('should handle negative ability modifiers without proficiency', () => {
    // Ability score 8 = -1 modifier
    expect(getSavingThrowBonus(8, 2, false)).toBe(-1);
  });

  it('should handle negative ability modifiers with proficiency', () => {
    // Ability score 8 = -1 modifier, PB +2 = +1 total
    expect(getSavingThrowBonus(8, 2, true)).toBe(1);
  });

  it('should handle very high ability scores', () => {
    // Ability score 20 = +5 modifier, PB +6 = +11 total
    expect(getSavingThrowBonus(20, 6, true)).toBe(11);
  });

  it('should handle very low ability scores', () => {
    // Ability score 3 = -4 modifier, PB +2 = -2 total
    expect(getSavingThrowBonus(3, 2, true)).toBe(-2);
  });
});

describe('getAllSavingThrows', () => {
  const abilityScores: Record<AbilityName, number> = {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 8,
    wisdom: 16,
    charisma: 13,
  };

  it('should calculate all saving throws with no proficiencies', () => {
    const proficiencyBonus = 2;
    const proficientSaves: AbilityName[] = [];

    const result = getAllSavingThrows(
      abilityScores,
      proficiencyBonus,
      proficientSaves
    );

    expect(result).toEqual({
      strength: 0, // 10 = +0
      dexterity: 2, // 14 = +2
      constitution: 1, // 12 = +1
      intelligence: -1, // 8 = -1
      wisdom: 3, // 16 = +3
      charisma: 1, // 13 = +1
    });
  });

  it('should calculate all saving throws with some proficiencies', () => {
    const proficiencyBonus = 2;
    const proficientSaves: AbilityName[] = ['dexterity', 'wisdom'];

    const result = getAllSavingThrows(
      abilityScores,
      proficiencyBonus,
      proficientSaves
    );

    expect(result).toEqual({
      strength: 0, // 10 = +0 (not proficient)
      dexterity: 4, // 14 = +2, +2 PB = +4 (proficient)
      constitution: 1, // 12 = +1 (not proficient)
      intelligence: -1, // 8 = -1 (not proficient)
      wisdom: 5, // 16 = +3, +2 PB = +5 (proficient)
      charisma: 1, // 13 = +1 (not proficient)
    });
  });

  it('should calculate all saving throws with all proficiencies', () => {
    const proficiencyBonus = 3;
    const proficientSaves: AbilityName[] = [
      'strength',
      'dexterity',
      'constitution',
      'intelligence',
      'wisdom',
      'charisma',
    ];

    const result = getAllSavingThrows(
      abilityScores,
      proficiencyBonus,
      proficientSaves
    );

    expect(result).toEqual({
      strength: 3, // 10 = +0, +3 PB = +3
      dexterity: 5, // 14 = +2, +3 PB = +5
      constitution: 4, // 12 = +1, +3 PB = +4
      intelligence: 2, // 8 = -1, +3 PB = +2
      wisdom: 6, // 16 = +3, +3 PB = +6
      charisma: 4, // 13 = +1, +3 PB = +4
    });
  });

  it('should handle typical beast saving throws', () => {
    // Example: A wolf with STR 12, DEX 15, CON 12, INT 3, WIS 12, CHA 6
    // Proficient in Strength and Dexterity saves, PB +2
    const beastAbilities: Record<AbilityName, number> = {
      strength: 12,
      dexterity: 15,
      constitution: 12,
      intelligence: 3,
      wisdom: 12,
      charisma: 6,
    };
    const proficiencyBonus = 2;
    const proficientSaves: AbilityName[] = ['strength', 'dexterity'];

    const result = getAllSavingThrows(
      beastAbilities,
      proficiencyBonus,
      proficientSaves
    );

    expect(result).toEqual({
      strength: 3, // 12 = +1, +2 PB = +3 (proficient)
      dexterity: 4, // 15 = +2, +2 PB = +4 (proficient)
      constitution: 1, // 12 = +1 (not proficient)
      intelligence: -4, // 3 = -4 (not proficient)
      wisdom: 1, // 12 = +1 (not proficient)
      charisma: -2, // 6 = -2 (not proficient)
    });
  });
});
