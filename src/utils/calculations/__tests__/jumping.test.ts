import { describe, it, expect } from '@jest/globals';
import { getJumpDistances } from '../jumping';

describe('getJumpDistances', () => {
  it('should base long jumps on the raw Strength score', () => {
    expect(getJumpDistances(16)).toEqual({
      runningLongJump: 16,
      standingLongJump: 8,
      runningHighJump: 6,
      standingHighJump: 3,
    });
  });

  it('should base high jumps on 3 + the Strength modifier', () => {
    // Str 10: modifier 0, so a 3 foot running high jump
    expect(getJumpDistances(10).runningHighJump).toBe(3);
    // Str 20: modifier +5, so an 8 foot running high jump
    expect(getJumpDistances(20).runningHighJump).toBe(8);
  });

  it('should round standing jumps down', () => {
    // Str 15: long 15 -> 7, high 3 + 2 = 5 -> 2
    expect(getJumpDistances(15).standingLongJump).toBe(7);
    expect(getJumpDistances(15).standingHighJump).toBe(2);
  });

  it('should floor high jumps at 0 for low Strength creatures', () => {
    // Str 2 (Rat): modifier -4, so 3 - 4 = -1 before flooring
    expect(getJumpDistances(2).runningHighJump).toBe(0);
    expect(getJumpDistances(2).standingHighJump).toBe(0);
    // Str 1 (Frog): modifier -5
    expect(getJumpDistances(1).runningHighJump).toBe(0);
  });

  it('should still allow a 1 foot long jump at Strength 1', () => {
    expect(getJumpDistances(1).runningLongJump).toBe(1);
    expect(getJumpDistances(1).standingLongJump).toBe(0);
  });

  it('should let an override replace one jump type without affecting the others', () => {
    // Lion (Str 17) with Running Leap: running long jump is set to 25,
    // but the standing long jump stays at half the calculated 17
    const lion = getJumpDistances(17, { overrides: { runningLongJump: 25 } });

    expect(lion.runningLongJump).toBe(25);
    expect(lion.standingLongJump).toBe(8);
    expect(lion.runningHighJump).toBe(6);
    expect(lion.standingHighJump).toBe(3);
  });

  it('should multiply every distance', () => {
    // Jump spell on a Str 16 creature
    expect(getJumpDistances(16, { multiplier: 3 })).toEqual({
      runningLongJump: 48,
      standingLongJump: 24,
      runningHighJump: 18,
      standingHighJump: 9,
    });
  });

  it('should apply the multiplier after overrides', () => {
    const lion = getJumpDistances(17, {
      overrides: { runningLongJump: 25 },
      multiplier: 3,
    });

    expect(lion.runningLongJump).toBe(75);
    expect(lion.standingLongJump).toBe(24);
  });

  it('should default to no overrides and a multiplier of 1', () => {
    expect(getJumpDistances(14, {})).toEqual(getJumpDistances(14));
    expect(getJumpDistances(14, { multiplier: 1 })).toEqual(
      getJumpDistances(14)
    );
  });
});
