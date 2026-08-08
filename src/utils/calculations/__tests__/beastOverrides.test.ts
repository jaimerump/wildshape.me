import { describe, it, expect } from '@jest/globals';
import beasts2014 from '../../../data/beasts_2014.json';
import type { Beast } from '../../../models';
import { getCarryingCapacity } from '../carryingCapacity';
import { getJumpDistances } from '../jumping';

/**
 * Verifies the overrides in beast_updates.json reach beasts_2014.json and
 * produce the right numbers through the calculations.
 */

const beasts = beasts2014 as unknown as Beast[];

const findBeast = (name: string): Beast => {
  const beast = beasts.find((b) => b.name === name);
  if (!beast) throw new Error(`No beast named "${name}" in beasts_2014.json`);
  return beast;
};

const jumpsFor = (name: string) => {
  const beast = findBeast(name);
  return getJumpDistances(beast.strength, { overrides: beast.jumpOverrides });
};

describe('beast jump overrides', () => {
  it("should apply the Frog's Standing Leap to every jump type", () => {
    // Str 1 would otherwise give a 1 ft long jump and no high jump
    expect(jumpsFor('Frog')).toEqual({
      runningLongJump: 10,
      standingLongJump: 10,
      runningHighJump: 5,
      standingHighJump: 5,
    });
  });

  it("should apply the Giant Frog's Standing Leap to every jump type", () => {
    expect(jumpsFor('Giant Frog')).toEqual({
      runningLongJump: 20,
      standingLongJump: 20,
      runningHighJump: 10,
      standingHighJump: 10,
    });
  });

  it("should apply the Giant Toad's Standing Leap to every jump type", () => {
    expect(jumpsFor('Giant Toad')).toEqual({
      runningLongJump: 20,
      standingLongJump: 20,
      runningHighJump: 10,
      standingHighJump: 10,
    });
  });

  it("should apply the Lion's Running Leap to only its running long jump", () => {
    // Lion is Str 17, so the other three stay at their calculated values
    expect(jumpsFor('Lion')).toEqual({
      runningLongJump: 25,
      standingLongJump: 8,
      runningHighJump: 6,
      standingHighJump: 3,
    });
  });

  it('should leave beasts without the trait on calculated distances', () => {
    const wolf = findBeast('Wolf');

    expect(wolf.jumpOverrides).toBeUndefined();
    expect(jumpsFor('Wolf')).toEqual(getJumpDistances(wolf.strength));
  });
});

describe('beast carrying capacity overrides', () => {
  it('should treat the Mule as Large for carrying capacity via Beast of Burden', () => {
    const mule = findBeast('Mule');

    expect(mule.size).toBe('Medium');
    expect(mule.carryingCapacitySize).toBe('Large');
    // Str 14 at Large: double what its actual Medium size would give
    expect(
      getCarryingCapacity(mule.strength, mule.carryingCapacitySize ?? mule.size)
    ).toEqual({
      encumbered: 140,
      heavilyEncumbered: 280,
      maximum: 420,
      pushDragLift: 840,
    });
  });

  it('should be the only beast with a carrying capacity override', () => {
    const overridden = beasts
      .filter((b) => b.carryingCapacitySize !== undefined)
      .map((b) => b.name);

    expect(overridden).toEqual(['Mule']);
  });
});
