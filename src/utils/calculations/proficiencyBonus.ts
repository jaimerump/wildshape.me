/**
 * Proficiency bonus calculation utilities
 */

/**
 * Calculates proficiency bonus from character level.
 *
 * D&D 5e Rule: PB = floor((level - 1) / 4) + 2
 *
 * @param level - The character level (1-20)
 * @returns The proficiency bonus (+2 to +6)
 *
 * @example
 * getProficiencyBonusFromLevel(1)  // returns +2
 * getProficiencyBonusFromLevel(5)  // returns +3
 * getProficiencyBonusFromLevel(20) // returns +6
 */
export function getProficiencyBonusFromLevel(level: number): number {
  return Math.floor((level - 1) / 4) + 2;
}

/**
 * Calculates proficiency bonus from Challenge Rating.
 *
 * D&D 5e Rule: PB = floor(CR / 4) + 2
 *
 * @param challengeRating - The creature's CR (0-30, can be fractional like 0.5 for CR 1/2)
 * @returns The proficiency bonus (+2 to +9)
 *
 * @example
 * getProficiencyBonusFromCR(0)    // returns +2
 * getProficiencyBonusFromCR(0.5)  // returns +2 (CR 1/2)
 * getProficiencyBonusFromCR(4)    // returns +3
 * getProficiencyBonusFromCR(30)   // returns +9
 */
export function getProficiencyBonusFromCR(challengeRating: number): number {
  return Math.floor(challengeRating / 4) + 2;
}
