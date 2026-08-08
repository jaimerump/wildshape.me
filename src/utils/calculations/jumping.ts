/**
 * Jump distance calculation utilities
 */

import type { JumpDistances } from '../../models';

import { getAbilityModifier } from './abilityScores';

/**
 * Effects that change a creature's jump distances.
 */
export interface JumpModifiers {
  /**
   * Hard-set distances for individual jump types, replacing the calculated
   * value. A Lion's Running Leap sets `runningLongJump` to 25 without
   * affecting its standing long jump, so each type is overridden separately.
   */
  overrides?: Partial<JumpDistances>;
  /**
   * Multiplier applied to every distance last, after any overrides.
   * The Jump spell passes 3. Defaults to 1.
   */
  multiplier?: number;
}

/**
 * Calculates a creature's jump distances.
 *
 * D&D 5e Rule: a running long jump covers a number of feet equal to the raw
 * Strength score; a running high jump covers 3 + the Strength modifier.
 * Standing jumps cover half the corresponding running distance, rounded down
 * per the general rule for division. High jumps are floored at 0 feet, since
 * a low Strength modifier can otherwise drive the total negative.
 *
 * @param strength - The raw Strength score
 * @param modifiers - Effects that change the distances. Overrides replace
 *   individual calculated values; the multiplier is applied afterwards.
 * @returns The four jump distances, in feet
 *
 * @example
 * getJumpDistances(16)
 * // returns { runningLongJump: 16, standingLongJump: 8, runningHighJump: 6, standingHighJump: 3 }
 *
 * @example
 * // Lion's Running Leap, then the Jump spell
 * getJumpDistances(17, { overrides: { runningLongJump: 25 }, multiplier: 3 })
 */
export function getJumpDistances(
  strength: number,
  { overrides, multiplier = 1 }: JumpModifiers = {}
): JumpDistances {
  const runningLong = strength;
  const runningHigh = Math.max(0, 3 + getAbilityModifier(strength));

  const base: JumpDistances = {
    runningLongJump: runningLong,
    standingLongJump: Math.floor(runningLong / 2),
    runningHighJump: runningHigh,
    standingHighJump: Math.floor(runningHigh / 2),
  };

  const apply = (jump: keyof JumpDistances) =>
    (overrides?.[jump] ?? base[jump]) * multiplier;

  return {
    runningLongJump: apply('runningLongJump'),
    standingLongJump: apply('standingLongJump'),
    runningHighJump: apply('runningHighJump'),
    standingHighJump: apply('standingHighJump'),
  };
}
