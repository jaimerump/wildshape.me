/**
 * Wild Shape eligibility calculation utilities
 * Supports D&D 5e 2024 and 2014 edition rules
 */

import type {
  Beast,
  WildShapeEligibility,
  DruidCircle,
  Edition,
} from '../../models';

/**
 * Gets the maximum CR a druid can Wild Shape into at their level.
 *
 * D&D 5e Base Druid (both editions):
 * - Level 2-3: CR ≤ 1/4
 * - Level 4-7: CR ≤ 1/2
 * - Level 8+: CR ≤ 1
 *
 * Circle of the Moon druids:
 * - 2024: Max CR = max(base druid CR, floor(druid level / 3))
 * - 2014: Level 2 gets CR 1 (special case), Level 3+ uses floor(druid level / 3)
 * - Moon druids never get worse than base druids, but can exceed base limits
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns The maximum CR
 *
 * @example
 * getMaxWildShapeCR(2, '2024')  // returns 0.25 (CR 1/4)
 * getMaxWildShapeCR(5, '2024')  // returns 0.5 (CR 1/2)
 * getMaxWildShapeCR(10, '2024') // returns 1 (CR 1)
 * getMaxWildShapeCR(6, '2024', 'Circle of the Moon')  // returns 2 (CR 2)
 * getMaxWildShapeCR(2, '2014', 'Circle of the Moon')  // returns 1 (CR 1, special 2014 rule)
 */
export function getMaxWildShapeCR(
  druidLevel: number,
  edition: Edition,
  druidCircle?: DruidCircle | null
): number {
  // Calculate base druid CR
  let baseCR: number;
  if (druidLevel >= 8) {
    baseCR = 1;
  } else if (druidLevel >= 4) {
    baseCR = 0.5;
  } else {
    baseCR = 0.25;
  }

  // If Circle of the Moon, use max of base CR or Moon formula
  if (druidCircle === 'Circle of the Moon') {
    // 2014 edition special case: Moon druids get CR 1 at level 2
    if (edition === '2014' && druidLevel === 2) {
      return 1;
    }

    const moonCR = Math.floor(druidLevel / 3);
    return Math.max(baseCR, moonCR);
  }

  // Otherwise use base druid rules
  return baseCR;
}

/**
 * Checks if a druid can Wild Shape into beasts with flying speed.
 *
 * D&D 5e Rule (both editions): Flying forms available at level 8+
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @returns true if flying forms are allowed
 *
 * @example
 * canWildShapeFlying(5, '2024')  // returns false
 * canWildShapeFlying(8, '2024')  // returns true
 */
export function canWildShapeFlying(
  druidLevel: number,
  _edition: Edition
): boolean {
  // Both editions have the same rule: flying at level 8+
  return druidLevel >= 8;
}

/**
 * Checks if a druid can Wild Shape into beasts with swimming speed.
 *
 * D&D 5e Rules:
 * - 2024: No restriction (can swim at any Wild Shape level)
 * - 2014: Swimming forms available at level 4+
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @returns true if swimming forms are allowed
 *
 * @example
 * canWildShapeSwimming(3, '2024')  // returns true (no restriction)
 * canWildShapeSwimming(3, '2014')  // returns false
 * canWildShapeSwimming(4, '2014')  // returns true
 */
export function canWildShapeSwimming(
  druidLevel: number,
  edition: Edition
): boolean {
  // 2024 edition: no swimming restriction
  if (edition === '2024') {
    return true;
  }

  // 2014 edition: swimming available at level 4+
  return druidLevel >= 4;
}

/**
 * Determines if a druid can Wild Shape into a specific beast.
 *
 * D&D 5e Rules (base druid):
 * - Level 2-3: CR ≤ 1/4, no flying speed
 *   - 2024: no swimming restriction
 *   - 2014: no swimming speed
 * - Level 4-7: CR ≤ 1/2, no flying speed
 * - Level 8+: CR ≤ 1, any movement
 *
 * Circle of the Moon druids have higher CR limits (see getMaxWildShapeCR),
 * but still respect the same level-based movement restrictions.
 *
 * @param druidLevel - The druid's level (1-20)
 * @param beast - The beast to check eligibility for
 * @param edition - The D&D edition ('2024' or '2014')
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns Object with { canTransform: boolean, reason?: string }
 *
 * @example
 * const wolf = { challengeRating: 0.25, movement: { walking: 40 } };
 * canWildShapeInto(2, wolf, '2024')
 * // returns { canTransform: true }
 *
 * const eagle = { challengeRating: 0, movement: { walking: 10, flying: 60 } };
 * canWildShapeInto(2, eagle, '2024')
 * // returns { canTransform: false, reason: "Cannot fly until level 8" }
 *
 * const direWolf = { challengeRating: 1, movement: { walking: 50 } };
 * canWildShapeInto(3, direWolf, '2024', 'Circle of the Moon')
 * // returns { canTransform: true } - 2024 Moon druid can transform into CR 1 at level 3
 *
 * canWildShapeInto(2, direWolf, '2014', 'Circle of the Moon')
 * // returns { canTransform: true } - 2014 Moon druid can transform into CR 1 at level 2
 */
export function canWildShapeInto(
  druidLevel: number,
  beast: Pick<Beast, 'challengeRating' | 'movement'>,
  edition: Edition,
  druidCircle?: DruidCircle | null
): WildShapeEligibility {
  // Check CR restriction
  const maxCR = getMaxWildShapeCR(druidLevel, edition, druidCircle);
  if (beast.challengeRating > maxCR) {
    return {
      canTransform: false,
      reason: `CR ${beast.challengeRating} is too high. Maximum CR at level ${druidLevel} is ${maxCR}.`,
    };
  }

  // Check flying restriction
  if (beast.movement.flying && !canWildShapeFlying(druidLevel, edition)) {
    return {
      canTransform: false,
      reason: `Cannot fly until level 8. Current level: ${druidLevel}.`,
    };
  }

  // Check swimming restriction
  if (beast.movement.swimming && !canWildShapeSwimming(druidLevel, edition)) {
    const swimLevel =
      edition === '2014' ? 4 : 'never (2024 has no restriction)';
    return {
      canTransform: false,
      reason: `Cannot swim until level ${swimLevel}. Current level: ${druidLevel}.`,
    };
  }

  // All checks passed
  return {
    canTransform: true,
  };
}
