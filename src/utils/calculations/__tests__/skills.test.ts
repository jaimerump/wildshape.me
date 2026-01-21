import { describe, it, expect } from '@jest/globals';
import { getSkillAbility, getSkillBonus, getAllSkillBonuses } from '../skills';
import type { AbilityName, SkillProficiency } from '../../../models';

describe('getSkillAbility', () => {
  it('should map Strength-based skills correctly', () => {
    expect(getSkillAbility('Athletics')).toBe('strength');
  });

  it('should map Dexterity-based skills correctly', () => {
    expect(getSkillAbility('Acrobatics')).toBe('dexterity');
    expect(getSkillAbility('Sleight of Hand')).toBe('dexterity');
    expect(getSkillAbility('Stealth')).toBe('dexterity');
  });

  it('should map Intelligence-based skills correctly', () => {
    expect(getSkillAbility('Arcana')).toBe('intelligence');
    expect(getSkillAbility('History')).toBe('intelligence');
    expect(getSkillAbility('Investigation')).toBe('intelligence');
    expect(getSkillAbility('Nature')).toBe('intelligence');
    expect(getSkillAbility('Religion')).toBe('intelligence');
  });

  it('should map Wisdom-based skills correctly', () => {
    expect(getSkillAbility('Animal Handling')).toBe('wisdom');
    expect(getSkillAbility('Insight')).toBe('wisdom');
    expect(getSkillAbility('Medicine')).toBe('wisdom');
    expect(getSkillAbility('Perception')).toBe('wisdom');
    expect(getSkillAbility('Survival')).toBe('wisdom');
  });

  it('should map Charisma-based skills correctly', () => {
    expect(getSkillAbility('Deception')).toBe('charisma');
    expect(getSkillAbility('Intimidation')).toBe('charisma');
    expect(getSkillAbility('Performance')).toBe('charisma');
    expect(getSkillAbility('Persuasion')).toBe('charisma');
  });

  it('should throw error for unknown skill', () => {
    expect(() => getSkillAbility('InvalidSkill')).toThrow('Unknown skill: InvalidSkill');
  });
});

describe('getSkillBonus', () => {
  const abilityScores: Record<AbilityName, number> = {
    strength: 14,     // +2
    dexterity: 16,    // +3
    constitution: 12, // +1
    intelligence: 10, // +0
    wisdom: 18,       // +4
    charisma: 8       // -1
  };
  const proficiencyBonus = 3;

  it('should return ability modifier only when not proficient', () => {
    // Athletics uses Strength (14 = +2), not proficient = +2
    expect(getSkillBonus('Athletics', abilityScores, proficiencyBonus, null)).toBe(2);
  });

  it('should return ability modifier + PB when proficient', () => {
    // Stealth uses Dexterity (16 = +3), proficient = +3 + 3 = +6
    expect(getSkillBonus('Stealth', abilityScores, proficiencyBonus, 'proficient')).toBe(6);
  });

  it('should return ability modifier + 2xPB when expertise', () => {
    // Perception uses Wisdom (18 = +4), expertise = +4 + (2 * 3) = +10
    expect(getSkillBonus('Perception', abilityScores, proficiencyBonus, 'expertise')).toBe(10);
  });

  it('should handle negative ability modifiers without proficiency', () => {
    // Deception uses Charisma (8 = -1), not proficient = -1
    expect(getSkillBonus('Deception', abilityScores, proficiencyBonus, null)).toBe(-1);
  });

  it('should handle negative ability modifiers with proficiency', () => {
    // Deception uses Charisma (8 = -1), proficient = -1 + 3 = +2
    expect(getSkillBonus('Deception', abilityScores, proficiencyBonus, 'proficient')).toBe(2);
  });

  it('should handle negative ability modifiers with expertise', () => {
    // Intimidation uses Charisma (8 = -1), expertise = -1 + (2 * 3) = +5
    expect(getSkillBonus('Intimidation', abilityScores, proficiencyBonus, 'expertise')).toBe(5);
  });

  it('should handle different skills using different abilities', () => {
    // Athletics (STR 14 = +2), proficient = +5
    expect(getSkillBonus('Athletics', abilityScores, proficiencyBonus, 'proficient')).toBe(5);

    // Acrobatics (DEX 16 = +3), proficient = +6
    expect(getSkillBonus('Acrobatics', abilityScores, proficiencyBonus, 'proficient')).toBe(6);

    // Arcana (INT 10 = +0), proficient = +3
    expect(getSkillBonus('Arcana', abilityScores, proficiencyBonus, 'proficient')).toBe(3);

    // Animal Handling (WIS 18 = +4), proficient = +7
    expect(getSkillBonus('Animal Handling', abilityScores, proficiencyBonus, 'proficient')).toBe(7);
  });
});

describe('getAllSkillBonuses', () => {
  const abilityScores: Record<AbilityName, number> = {
    strength: 14,     // +2
    dexterity: 16,    // +3
    constitution: 12, // +1
    intelligence: 10, // +0
    wisdom: 18,       // +4
    charisma: 8       // -1
  };
  const proficiencyBonus = 2;

  it('should calculate all skill bonuses with no proficiencies', () => {
    const skillProficiencies: SkillProficiency[] = [];

    const result = getAllSkillBonuses(abilityScores, proficiencyBonus, skillProficiencies);

    expect(result['Athletics']).toBe(2);        // STR +2
    expect(result['Acrobatics']).toBe(3);       // DEX +3
    expect(result['Stealth']).toBe(3);          // DEX +3
    expect(result['Arcana']).toBe(0);           // INT +0
    expect(result['Perception']).toBe(4);       // WIS +4
    expect(result['Deception']).toBe(-1);       // CHA -1
  });

  it('should calculate all skill bonuses with some proficiencies', () => {
    const skillProficiencies: SkillProficiency[] = [
      { skill: 'Stealth', proficiencyLevel: 'proficient' },
      { skill: 'Perception', proficiencyLevel: 'proficient' }
    ];

    const result = getAllSkillBonuses(abilityScores, proficiencyBonus, skillProficiencies);

    expect(result['Athletics']).toBe(2);        // STR +2 (not proficient)
    expect(result['Stealth']).toBe(5);          // DEX +3, +2 PB = +5 (proficient)
    expect(result['Perception']).toBe(6);       // WIS +4, +2 PB = +6 (proficient)
    expect(result['Deception']).toBe(-1);       // CHA -1 (not proficient)
  });

  it('should calculate all skill bonuses with expertise', () => {
    const skillProficiencies: SkillProficiency[] = [
      { skill: 'Stealth', proficiencyLevel: 'expertise' },
      { skill: 'Perception', proficiencyLevel: 'proficient' }
    ];

    const result = getAllSkillBonuses(abilityScores, proficiencyBonus, skillProficiencies);

    expect(result['Stealth']).toBe(7);          // DEX +3, +4 (2xPB) = +7 (expertise)
    expect(result['Perception']).toBe(6);       // WIS +4, +2 PB = +6 (proficient)
    expect(result['Athletics']).toBe(2);        // STR +2 (not proficient)
  });

  it('should handle typical beast skill proficiencies', () => {
    // Example: A wolf with STR 12, DEX 15, CON 12, INT 3, WIS 12, CHA 6
    // Proficient in Perception and Stealth, PB +2
    const beastAbilities: Record<AbilityName, number> = {
      strength: 12,     // +1
      dexterity: 15,    // +2
      constitution: 12, // +1
      intelligence: 3,  // -4
      wisdom: 12,       // +1
      charisma: 6       // -2
    };
    const beastPB = 2;
    const beastSkills: SkillProficiency[] = [
      { skill: 'Perception', proficiencyLevel: 'proficient' },
      { skill: 'Stealth', proficiencyLevel: 'proficient' }
    ];

    const result = getAllSkillBonuses(beastAbilities, beastPB, beastSkills);

    expect(result['Perception']).toBe(3);       // WIS +1, +2 PB = +3 (proficient)
    expect(result['Stealth']).toBe(4);          // DEX +2, +2 PB = +4 (proficient)
    expect(result['Athletics']).toBe(1);        // STR +1 (not proficient)
    expect(result['Arcana']).toBe(-4);          // INT -4 (not proficient)
  });

  it('should include all 18 skills in the result', () => {
    const skillProficiencies: SkillProficiency[] = [];
    const result = getAllSkillBonuses(abilityScores, proficiencyBonus, skillProficiencies);

    const expectedSkills = [
      'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception',
      'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine',
      'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion',
      'Sleight of Hand', 'Stealth', 'Survival'
    ];

    for (const skill of expectedSkills) {
      expect(result).toHaveProperty(skill);
      expect(typeof result[skill]).toBe('number');
    }
  });
});
