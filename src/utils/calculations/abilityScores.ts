/**
 * Ability score calculation utilities
 */

/**
 * Calculates the ability score modifier for a given ability score.
 *
 * D&D 5e Rule: Modifier = floor((abilityScore - 10) / 2)
 *
 * @param abilityScore - The raw ability score (1-30)
 * @returns The ability modifier
 *
 * @example
 * getAbilityModifier(10) // returns 0
 * getAbilityModifier(16) // returns +3
 * getAbilityModifier(8)  // returns -1
 */
export function getAbilityModifier(abilityScore: number): number {
  return Math.floor((abilityScore - 10) / 2);
}
