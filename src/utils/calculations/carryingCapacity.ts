/**
 * Carrying capacity calculation utilities
 */

import type { Size } from '../../models';

/**
 * The four weight thresholds a creature is measured against, in pounds.
 */
export interface CarryingCapacity {
  encumbered: number;
  heavilyEncumbered: number;
  maximum: number;
  pushDragLift: number;
}

/**
 * Multiplier applied to a Medium creature's capacities for each size category.
 */
const SIZE_MULTIPLIERS: Record<Size, number> = {
  Tiny: 0.5,
  Small: 1,
  Medium: 1,
  Large: 2,
  Huge: 4,
  Gargantuan: 8,
};

/** Pounds per point of Strength for a Medium creature, per threshold. */
const BASE_PER_STRENGTH = {
  encumbered: 5,
  heavilyEncumbered: 10,
  maximum: 15,
  pushDragLift: 30,
};

/**
 * Calculates a creature's carrying capacity thresholds.
 *
 * D&D 5e Rule: capacity is derived from the raw Strength score (not the
 * modifier), then scaled by size — halved for Tiny, doubled for Large,
 * x4 for Huge, x8 for Gargantuan.
 *
 * @param strength - The raw Strength score
 * @param size - The creature's size category
 * @param multiplier - Extra multiplier from effects that increase capacity,
 *   such as Powerful Build or the Enlarge spell. Applied on top of the size
 *   multiplier. Defaults to 1 (no effects).
 * @returns The four capacity thresholds, in pounds
 *
 * @example
 * getCarryingCapacity(16, 'Medium')
 * // returns { encumbered: 80, heavilyEncumbered: 160, maximum: 240, pushDragLift: 480 }
 *
 * @example
 * getCarryingCapacity(16, 'Medium', 2) // Powerful Build: all values doubled
 */
export function getCarryingCapacity(
  strength: number,
  size: Size,
  multiplier = 1
): CarryingCapacity {
  const scale = SIZE_MULTIPLIERS[size] * multiplier;

  return {
    encumbered: strength * BASE_PER_STRENGTH.encumbered * scale,
    heavilyEncumbered: strength * BASE_PER_STRENGTH.heavilyEncumbered * scale,
    maximum: strength * BASE_PER_STRENGTH.maximum * scale,
    pushDragLift: strength * BASE_PER_STRENGTH.pushDragLift * scale,
  };
}
