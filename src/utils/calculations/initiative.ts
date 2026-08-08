/**
 * Initiative calculation utilities
 */

import { getAbilityModifier } from './abilityScores';

/**
 * Effects that change a creature's initiative bonus.
 */
export interface InitiativeModifiers {
  /**
   * Flat bonuses added on top of the Dexterity modifier, such as the Alert
   * feat's +5 or the Swashbuckler Rogue's Charisma modifier from Rakish
   * Audacity. Each source contributes one entry.
   */
  bonuses?: number[];
}

/**
 * Calculates a creature's initiative bonus.
 *
 * D&D 5e Rule: initiative is a Dexterity check, so the bonus is the
 * Dexterity modifier plus any bonuses granted by feats or class features.
 *
 * @param dexterity - The raw Dexterity score
 * @param modifiers - Effects that change the bonus
 * @returns The initiative bonus
 *
 * @example
 * getInitiativeBonus(15) // returns 2
 *
 * @example
 * // Alert feat on a Dex 15 creature
 * getInitiativeBonus(15, { bonuses: [5] }) // returns 7
 */
export function getInitiativeBonus(
  dexterity: number,
  { bonuses = [] }: InitiativeModifiers = {}
): number {
  return getAbilityModifier(dexterity) + bonuses.reduce((sum, b) => sum + b, 0);
}
