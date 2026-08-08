import { describe, it, expect } from '@jest/globals';
import { getCarryingCapacity } from '../carryingCapacity';

describe('getCarryingCapacity', () => {
  it('should use the raw Strength score, not the modifier', () => {
    expect(getCarryingCapacity(16, 'Medium')).toEqual({
      encumbered: 80,
      heavilyEncumbered: 160,
      maximum: 240,
      pushDragLift: 480,
    });
  });

  it('should treat Small the same as Medium', () => {
    expect(getCarryingCapacity(16, 'Small')).toEqual(
      getCarryingCapacity(16, 'Medium')
    );
  });

  it('should halve capacities for Tiny creatures', () => {
    expect(getCarryingCapacity(16, 'Tiny')).toEqual({
      encumbered: 40,
      heavilyEncumbered: 80,
      maximum: 120,
      pushDragLift: 240,
    });
  });

  it('should double capacities for Large creatures', () => {
    expect(getCarryingCapacity(16, 'Large')).toEqual({
      encumbered: 160,
      heavilyEncumbered: 320,
      maximum: 480,
      pushDragLift: 960,
    });
  });

  it('should quadruple capacities for Huge creatures', () => {
    expect(getCarryingCapacity(16, 'Huge')).toEqual({
      encumbered: 320,
      heavilyEncumbered: 640,
      maximum: 960,
      pushDragLift: 1920,
    });
  });

  it('should multiply capacities by 8 for Gargantuan creatures', () => {
    expect(getCarryingCapacity(16, 'Gargantuan')).toEqual({
      encumbered: 640,
      heavilyEncumbered: 1280,
      maximum: 1920,
      pushDragLift: 3840,
    });
  });

  it('should produce fractional-free values for odd Strength on Tiny creatures', () => {
    // Str 3 Tiny: 3 x 5 x 0.5 = 7.5
    expect(getCarryingCapacity(3, 'Tiny').encumbered).toBe(7.5);
  });

  it('should apply an effect multiplier on top of the size multiplier', () => {
    // Powerful Build on a Large creature: 2 (size) x 2 (effect)
    expect(getCarryingCapacity(16, 'Large', 2)).toEqual({
      encumbered: 320,
      heavilyEncumbered: 640,
      maximum: 960,
      pushDragLift: 1920,
    });
  });

  it('should default the effect multiplier to 1', () => {
    expect(getCarryingCapacity(12, 'Huge', 1)).toEqual(
      getCarryingCapacity(12, 'Huge')
    );
  });
});
