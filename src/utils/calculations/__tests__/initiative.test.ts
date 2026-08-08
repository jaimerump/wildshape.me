import { describe, it, expect } from '@jest/globals';
import { getInitiativeBonus } from '../initiative';

describe('getInitiativeBonus', () => {
  it('should default to the Dexterity modifier', () => {
    expect(getInitiativeBonus(15)).toBe(2);
    expect(getInitiativeBonus(10)).toBe(0);
  });

  it('should stay negative for clumsy forms', () => {
    // Giant Toad (Dex 13) vs. Awakened Shrub (Dex 8)
    expect(getInitiativeBonus(8)).toBe(-1);
    // Str/Dex 1 creatures bottom out at -5
    expect(getInitiativeBonus(1)).toBe(-5);
  });

  it('should add a single bonus', () => {
    // Alert feat on a Dex 15 form
    expect(getInitiativeBonus(15, { bonuses: [5] })).toBe(7);
  });

  it('should sum multiple bonuses', () => {
    // Alert (+5) plus Rakish Audacity with a +3 Charisma modifier
    expect(getInitiativeBonus(14, { bonuses: [5, 3] })).toBe(10);
  });

  it('should handle negative bonuses', () => {
    expect(getInitiativeBonus(14, { bonuses: [-2] })).toBe(0);
  });

  it('should default to no bonuses', () => {
    expect(getInitiativeBonus(16, {})).toBe(getInitiativeBonus(16));
    expect(getInitiativeBonus(16, { bonuses: [] })).toBe(
      getInitiativeBonus(16)
    );
  });
});
