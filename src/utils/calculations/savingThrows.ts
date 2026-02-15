/**
 * Saving throw calculation utilities
 */

import { getAbilityModifier } from './abilityScores';
import type { AbilityName } from '../../models';

/**
 * Calculates the saving throw bonus for a specific ability.
 *
 * D&D 5e Rule:
 * - Not proficient: ability modifier
 * - Proficient: ability modifier + proficiency bonus
 *
 * @param abilityScore - The ability score (1-30)
 * @param proficiencyBonus - The creature's proficiency bonus
 * @param isProficient - Whether the creature is proficient in this save
 * @returns The saving throw bonus
 *
 * @example
 * getSavingThrowBonus(14, 2, false) // returns +2 (just modifier)
 * getSavingThrowBonus(14, 2, true)  // returns +4 (modifier + PB)
 */
export function getSavingThrowBonus(
  abilityScore: number,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  const modifier = getAbilityModifier(abilityScore);
  return isProficient ? modifier + proficiencyBonus : modifier;
}

/**
 * Calculates all saving throw bonuses for a creature.
 *
 * @param abilityScores - Object with all six ability scores
 * @param proficiencyBonus - The creature's proficiency bonus
 * @param proficientSaves - Array of ability names the creature is proficient in
 * @returns Object with all six saving throw bonuses
 *
 * @example
 * getAllSavingThrows(
 *   { strength: 10, dexterity: 14, constitution: 12, intelligence: 8, wisdom: 16, charisma: 13 },
 *   2,
 *   ['dexterity', 'wisdom']
 * )
 * // returns { strength: 0, dexterity: 4, constitution: 1, intelligence: -1, wisdom: 5, charisma: 1 }
 */
export function getAllSavingThrows(
  abilityScores: Record<AbilityName, number>,
  proficiencyBonus: number,
  proficientSaves: AbilityName[]
): Record<AbilityName, number> {
  const abilities: AbilityName[] = [
    'strength',
    'dexterity',
    'constitution',
    'intelligence',
    'wisdom',
    'charisma',
  ];

  const savingThrows: Record<string, number> = {};

  for (const ability of abilities) {
    const abilityScore = abilityScores[ability];
    const isProficient = proficientSaves.includes(ability);
    savingThrows[ability] = getSavingThrowBonus(
      abilityScore,
      proficiencyBonus,
      isProficient
    );
  }

  return savingThrows as Record<AbilityName, number>;
}
