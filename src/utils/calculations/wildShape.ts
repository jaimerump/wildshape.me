/**
 * Wild Shape eligibility calculation utilities
 * Based on D&D 5e 2024 edition rules
 */

import type { Beast, WildShapeEligibility, DruidCircle } from '../../models';

/**
 * Gets the maximum CR a druid can Wild Shape into at their level.
 *
 * D&D 5e 2024 Rule (base druid):
 * - Level 2-3: CR ≤ 1/4
 * - Level 4-7: CR ≤ 1/2
 * - Level 8+: CR ≤ 1
 *
 * Circle of the Moon druids (2024):
 * - Max CR = max(base druid CR, floor(druid level / 3))
 * - Moon druids never get worse than base druids, but can exceed base limits
 * - Examples: Level 3 Moon = CR 1, Level 6 Moon = CR 2, Level 9 Moon = CR 3
 *
 * @param druidLevel - The druid's level (1-20)
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns The maximum CR
 *
 * @example
 * getMaxWildShapeCR(2)  // returns 0.25 (CR 1/4)
 * getMaxWildShapeCR(5)  // returns 0.5 (CR 1/2)
 * getMaxWildShapeCR(10) // returns 1 (CR 1)
 * getMaxWildShapeCR(6, 'Circle of the Moon')  // returns 2 (CR 2)
 * getMaxWildShapeCR(9, 'Circle of the Moon')  // returns 3 (CR 3)
 */
export function getMaxWildShapeCR(
  druidLevel: number,
  druidCircle?: DruidCircle | null
): number {
  // Calculate base druid CR
  const baseCR = druidLevel >= 8 ? 1 : druidLevel >= 4 ? 0.5 : 0.25;

  // If Circle of the Moon, use max of base CR or Moon formula
  if (druidCircle === 'Circle of the Moon') {
    const moonCR = Math.floor(druidLevel / 3);
    return Math.max(baseCR, moonCR);
  }

  // Otherwise use base druid rules
  return baseCR;
}

/**
 * Checks if a druid can Wild Shape into beasts with flying speed.
 *
 * D&D 5e 2024 Rule: Flying forms available at level 8+
 *
 * @param druidLevel - The druid's level (1-20)
 * @returns true if flying forms are allowed
 *
 * @example
 * canWildShapeFlying(5)  // returns false
 * canWildShapeFlying(8)  // returns true
 */
export function canWildShapeFlying(druidLevel: number): boolean {
  return druidLevel >= 8;
}

/**
 * Checks if a druid can Wild Shape into beasts with swimming speed.
 *
 * D&D 5e 2024 Rule: Swimming forms available at level 4+
 *
 * @param druidLevel - The druid's level (1-20)
 * @returns true if swimming forms are allowed
 *
 * @example
 * canWildShapeSwimming(3)  // returns false
 * canWildShapeSwimming(4)  // returns true
 */
export function canWildShapeSwimming(druidLevel: number): boolean {
  return druidLevel >= 4;
}

/**
 * Determines if a druid can Wild Shape into a specific beast.
 *
 * D&D 5e 2024 Rules (base druid):
 * - Level 2-3: CR ≤ 1/4, no fly/swim speed
 * - Level 4-7: CR ≤ 1/2, no fly speed
 * - Level 8+: CR ≤ 1, any movement
 *
 * Circle of the Moon druids have higher CR limits (see getMaxWildShapeCR),
 * but still respect the same level-based movement restrictions.
 *
 * @param druidLevel - The druid's level (1-20)
 * @param beast - The beast to check eligibility for
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns Object with { canTransform: boolean, reason?: string }
 *
 * @example
 * const wolf = { challengeRating: 0.25, movement: { walking: 40 } };
 * canWildShapeInto(2, wolf)
 * // returns { canTransform: true }
 *
 * const eagle = { challengeRating: 0, movement: { walking: 10, flying: 60 } };
 * canWildShapeInto(2, eagle)
 * // returns { canTransform: false, reason: "Cannot fly until level 8" }
 *
 * const direWolf = { challengeRating: 1, movement: { walking: 50 } };
 * canWildShapeInto(3, direWolf, 'Circle of the Moon')
 * // returns { canTransform: true } - Moon druid can transform into CR 1 at level 3
 */
export function canWildShapeInto(
  druidLevel: number,
  beast: Pick<Beast, 'challengeRating' | 'movement'>,
  druidCircle?: DruidCircle | null
): WildShapeEligibility {
  // Check CR restriction
  const maxCR = getMaxWildShapeCR(druidLevel, druidCircle);
  if (beast.challengeRating > maxCR) {
    return {
      canTransform: false,
      reason: `CR ${beast.challengeRating} is too high. Maximum CR at level ${druidLevel} is ${maxCR}.`
    };
  }

  // Check flying restriction
  if (beast.movement.flying && !canWildShapeFlying(druidLevel)) {
    return {
      canTransform: false,
      reason: `Cannot fly until level 8. Current level: ${druidLevel}.`
    };
  }

  // Check swimming restriction
  if (beast.movement.swimming && !canWildShapeSwimming(druidLevel)) {
    return {
      canTransform: false,
      reason: `Cannot swim until level 4. Current level: ${druidLevel}.`
    };
  }

  // All checks passed
  return {
    canTransform: true
  };
}
