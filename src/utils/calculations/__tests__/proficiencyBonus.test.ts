import { describe, it, expect } from '@jest/globals';
import {
  getProficiencyBonusFromLevel,
  getProficiencyBonusFromCR,
} from '../proficiencyBonus';

describe('getProficiencyBonusFromLevel', () => {
  describe('levels 1-4 should have +2 proficiency bonus', () => {
    it('should return +2 for level 1', () => {
      expect(getProficiencyBonusFromLevel(1)).toBe(2);
    });

    it('should return +2 for level 2', () => {
      expect(getProficiencyBonusFromLevel(2)).toBe(2);
    });

    it('should return +2 for level 3', () => {
      expect(getProficiencyBonusFromLevel(3)).toBe(2);
    });

    it('should return +2 for level 4', () => {
      expect(getProficiencyBonusFromLevel(4)).toBe(2);
    });
  });

  describe('levels 5-8 should have +3 proficiency bonus', () => {
    it('should return +3 for level 5', () => {
      expect(getProficiencyBonusFromLevel(5)).toBe(3);
    });

    it('should return +3 for level 6', () => {
      expect(getProficiencyBonusFromLevel(6)).toBe(3);
    });

    it('should return +3 for level 7', () => {
      expect(getProficiencyBonusFromLevel(7)).toBe(3);
    });

    it('should return +3 for level 8', () => {
      expect(getProficiencyBonusFromLevel(8)).toBe(3);
    });
  });

  describe('levels 9-12 should have +4 proficiency bonus', () => {
    it('should return +4 for level 9', () => {
      expect(getProficiencyBonusFromLevel(9)).toBe(4);
    });

    it('should return +4 for level 12', () => {
      expect(getProficiencyBonusFromLevel(12)).toBe(4);
    });
  });

  describe('levels 13-16 should have +5 proficiency bonus', () => {
    it('should return +5 for level 13', () => {
      expect(getProficiencyBonusFromLevel(13)).toBe(5);
    });

    it('should return +5 for level 16', () => {
      expect(getProficiencyBonusFromLevel(16)).toBe(5);
    });
  });

  describe('levels 17-20 should have +6 proficiency bonus', () => {
    it('should return +6 for level 17', () => {
      expect(getProficiencyBonusFromLevel(17)).toBe(6);
    });

    it('should return +6 for level 20', () => {
      expect(getProficiencyBonusFromLevel(20)).toBe(6);
    });
  });

  it('should handle all levels from 1 to 20', () => {
    const expectedBonuses = [
      2,
      2,
      2,
      2, // levels 1-4
      3,
      3,
      3,
      3, // levels 5-8
      4,
      4,
      4,
      4, // levels 9-12
      5,
      5,
      5,
      5, // levels 13-16
      6,
      6,
      6,
      6, // levels 17-20
    ];

    for (let level = 1; level <= 20; level++) {
      expect(getProficiencyBonusFromLevel(level)).toBe(
        expectedBonuses[level - 1]
      );
    }
  });
});

describe('getProficiencyBonusFromCR', () => {
  describe('CR 0-3 should have +2 proficiency bonus', () => {
    it('should return +2 for CR 0', () => {
      expect(getProficiencyBonusFromCR(0)).toBe(2);
    });

    it('should return +2 for CR 1', () => {
      expect(getProficiencyBonusFromCR(1)).toBe(2);
    });

    it('should return +2 for CR 3', () => {
      expect(getProficiencyBonusFromCR(3)).toBe(2);
    });
  });

  describe('CR 4-7 should have +3 proficiency bonus', () => {
    it('should return +3 for CR 4', () => {
      expect(getProficiencyBonusFromCR(4)).toBe(3);
    });

    it('should return +3 for CR 7', () => {
      expect(getProficiencyBonusFromCR(7)).toBe(3);
    });
  });

  describe('CR 8-11 should have +4 proficiency bonus', () => {
    it('should return +4 for CR 8', () => {
      expect(getProficiencyBonusFromCR(8)).toBe(4);
    });

    it('should return +4 for CR 11', () => {
      expect(getProficiencyBonusFromCR(11)).toBe(4);
    });
  });

  describe('CR 12-15 should have +5 proficiency bonus', () => {
    it('should return +5 for CR 12', () => {
      expect(getProficiencyBonusFromCR(12)).toBe(5);
    });

    it('should return +5 for CR 15', () => {
      expect(getProficiencyBonusFromCR(15)).toBe(5);
    });
  });

  describe('CR 16-19 should have +6 proficiency bonus', () => {
    it('should return +6 for CR 16', () => {
      expect(getProficiencyBonusFromCR(16)).toBe(6);
    });

    it('should return +6 for CR 19', () => {
      expect(getProficiencyBonusFromCR(19)).toBe(6);
    });
  });

  describe('CR 20-23 should have +7 proficiency bonus', () => {
    it('should return +7 for CR 20', () => {
      expect(getProficiencyBonusFromCR(20)).toBe(7);
    });

    it('should return +7 for CR 23', () => {
      expect(getProficiencyBonusFromCR(23)).toBe(7);
    });
  });

  describe('CR 24-27 should have +8 proficiency bonus', () => {
    it('should return +8 for CR 24', () => {
      expect(getProficiencyBonusFromCR(24)).toBe(8);
    });

    it('should return +8 for CR 27', () => {
      expect(getProficiencyBonusFromCR(27)).toBe(8);
    });
  });

  describe('CR 28-30 should have +9 proficiency bonus', () => {
    it('should return +9 for CR 28', () => {
      expect(getProficiencyBonusFromCR(28)).toBe(9);
    });

    it('should return +9 for CR 30', () => {
      expect(getProficiencyBonusFromCR(30)).toBe(9);
    });
  });

  it('should handle fractional CRs', () => {
    expect(getProficiencyBonusFromCR(0.125)).toBe(2); // CR 1/8
    expect(getProficiencyBonusFromCR(0.25)).toBe(2); // CR 1/4
    expect(getProficiencyBonusFromCR(0.5)).toBe(2); // CR 1/2
  });
});
