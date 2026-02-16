import { describe, it, expect } from '@jest/globals';
import {
  canWildShapeInto,
  getMaxWildShapeCR,
  canWildShapeFlying,
  canWildShapeSwimming,
} from '../wildShape';
import type { Beast, Movement } from '../../../models';

// Helper function to create mock beasts for testing
function createMockBeast(
  cr: number,
  movement: Partial<Movement>
): Pick<Beast, 'challengeRating' | 'movement'> {
  return {
    challengeRating: cr,
    movement: {
      walking: 30,
      ...movement,
    },
  };
}

describe('getMaxWildShapeCR', () => {
  describe('2024 Edition - Base druid (no circle)', () => {
    it('should return 0.25 for levels 2-3', () => {
      expect(getMaxWildShapeCR(2, '2024')).toBe(0.25);
      expect(getMaxWildShapeCR(3, '2024')).toBe(0.25);
    });

    it('should return 0.5 for levels 4-7', () => {
      expect(getMaxWildShapeCR(4, '2024')).toBe(0.5);
      expect(getMaxWildShapeCR(5, '2024')).toBe(0.5);
      expect(getMaxWildShapeCR(6, '2024')).toBe(0.5);
      expect(getMaxWildShapeCR(7, '2024')).toBe(0.5);
    });

    it('should return 1 for levels 8+', () => {
      expect(getMaxWildShapeCR(8, '2024')).toBe(1);
      expect(getMaxWildShapeCR(10, '2024')).toBe(1);
      expect(getMaxWildShapeCR(15, '2024')).toBe(1);
      expect(getMaxWildShapeCR(20, '2024')).toBe(1);
    });

    it('should use base druid rules when circle is null', () => {
      expect(getMaxWildShapeCR(3, '2024', null)).toBe(0.25);
      expect(getMaxWildShapeCR(6, '2024', null)).toBe(0.5);
      expect(getMaxWildShapeCR(10, '2024', null)).toBe(1);
    });

    it('should use base druid rules for non-Moon circles', () => {
      expect(getMaxWildShapeCR(6, '2024', 'Circle of the Land')).toBe(0.5);
      expect(getMaxWildShapeCR(10, '2024', 'Circle of the Stars')).toBe(1);
    });
  });

  describe('2024 Edition - Circle of the Moon', () => {
    it('should use base CR when it is higher than Moon formula', () => {
      // Level 2: max(0.25, floor(2/3)=0) = 0.25
      expect(getMaxWildShapeCR(2, '2024', 'Circle of the Moon')).toBe(0.25);
      // Level 4: max(0.5, floor(4/3)=1) = 1
      expect(getMaxWildShapeCR(4, '2024', 'Circle of the Moon')).toBe(1);
      // Level 5: max(0.5, floor(5/3)=1) = 1
      expect(getMaxWildShapeCR(5, '2024', 'Circle of the Moon')).toBe(1);
      // Level 8: max(1, floor(8/3)=2) = 2
      expect(getMaxWildShapeCR(8, '2024', 'Circle of the Moon')).toBe(2);
    });

    it('should use Moon formula when it exceeds base CR', () => {
      // Level 3: max(0.25, floor(3/3)=1) = 1
      expect(getMaxWildShapeCR(3, '2024', 'Circle of the Moon')).toBe(1);
      // Level 6: max(0.5, floor(6/3)=2) = 2
      expect(getMaxWildShapeCR(6, '2024', 'Circle of the Moon')).toBe(2);
      // Level 9: max(1, floor(9/3)=3) = 3
      expect(getMaxWildShapeCR(9, '2024', 'Circle of the Moon')).toBe(3);
      // Level 12: max(1, floor(12/3)=4) = 4
      expect(getMaxWildShapeCR(12, '2024', 'Circle of the Moon')).toBe(4);
      // Level 15: max(1, floor(15/3)=5) = 5
      expect(getMaxWildShapeCR(15, '2024', 'Circle of the Moon')).toBe(5);
      // Level 20: max(1, floor(20/3)=6) = 6
      expect(getMaxWildShapeCR(20, '2024', 'Circle of the Moon')).toBe(6);
    });
  });

  describe('2014 Edition - Base druid (no circle)', () => {
    it('should return 0.25 for levels 2-3', () => {
      expect(getMaxWildShapeCR(2, '2014')).toBe(0.25);
      expect(getMaxWildShapeCR(3, '2014')).toBe(0.25);
    });

    it('should return 0.5 for levels 4-7', () => {
      expect(getMaxWildShapeCR(4, '2014')).toBe(0.5);
      expect(getMaxWildShapeCR(5, '2014')).toBe(0.5);
      expect(getMaxWildShapeCR(6, '2014')).toBe(0.5);
      expect(getMaxWildShapeCR(7, '2014')).toBe(0.5);
    });

    it('should return 1 for levels 8+', () => {
      expect(getMaxWildShapeCR(8, '2014')).toBe(1);
      expect(getMaxWildShapeCR(10, '2014')).toBe(1);
      expect(getMaxWildShapeCR(15, '2014')).toBe(1);
      expect(getMaxWildShapeCR(20, '2014')).toBe(1);
    });

    it('should use base druid rules when circle is null', () => {
      expect(getMaxWildShapeCR(3, '2014', null)).toBe(0.25);
      expect(getMaxWildShapeCR(6, '2014', null)).toBe(0.5);
      expect(getMaxWildShapeCR(10, '2014', null)).toBe(1);
    });

    it('should use base druid rules for non-Moon circles', () => {
      expect(getMaxWildShapeCR(6, '2014', 'Circle of the Land')).toBe(0.5);
      expect(getMaxWildShapeCR(10, '2014', 'Circle of the Stars')).toBe(1);
    });
  });

  describe('2014 Edition - Circle of the Moon', () => {
    it('should return CR 1 for level 2 Moon druid (special 2014 rule)', () => {
      expect(getMaxWildShapeCR(2, '2014', 'Circle of the Moon')).toBe(1);
    });

    it('should use base CR when it is higher than Moon formula', () => {
      // Level 4: max(0.5, floor(4/3)=1) = 1
      expect(getMaxWildShapeCR(4, '2014', 'Circle of the Moon')).toBe(1);
      // Level 5: max(0.5, floor(5/3)=1) = 1
      expect(getMaxWildShapeCR(5, '2014', 'Circle of the Moon')).toBe(1);
      // Level 8: max(1, floor(8/3)=2) = 2
      expect(getMaxWildShapeCR(8, '2014', 'Circle of the Moon')).toBe(2);
    });

    it('should use Moon formula when it exceeds base CR', () => {
      // Level 3: max(0.25, floor(3/3)=1) = 1
      expect(getMaxWildShapeCR(3, '2014', 'Circle of the Moon')).toBe(1);
      // Level 6: max(0.5, floor(6/3)=2) = 2
      expect(getMaxWildShapeCR(6, '2014', 'Circle of the Moon')).toBe(2);
      // Level 9: max(1, floor(9/3)=3) = 3
      expect(getMaxWildShapeCR(9, '2014', 'Circle of the Moon')).toBe(3);
      // Level 12: max(1, floor(12/3)=4) = 4
      expect(getMaxWildShapeCR(12, '2014', 'Circle of the Moon')).toBe(4);
      // Level 15: max(1, floor(15/3)=5) = 5
      expect(getMaxWildShapeCR(15, '2014', 'Circle of the Moon')).toBe(5);
      // Level 20: max(1, floor(20/3)=6) = 6
      expect(getMaxWildShapeCR(20, '2014', 'Circle of the Moon')).toBe(6);
    });
  });
});

describe('canWildShapeFlying', () => {
  it('should return false for levels below 8 (both editions)', () => {
    expect(canWildShapeFlying(2, '2024')).toBe(false);
    expect(canWildShapeFlying(3, '2024')).toBe(false);
    expect(canWildShapeFlying(4, '2024')).toBe(false);
    expect(canWildShapeFlying(5, '2024')).toBe(false);
    expect(canWildShapeFlying(6, '2024')).toBe(false);
    expect(canWildShapeFlying(7, '2024')).toBe(false);
    expect(canWildShapeFlying(7, '2014')).toBe(false);
  });

  it('should return true for levels 8+ (both editions)', () => {
    expect(canWildShapeFlying(8, '2024')).toBe(true);
    expect(canWildShapeFlying(10, '2024')).toBe(true);
    expect(canWildShapeFlying(20, '2024')).toBe(true);
    expect(canWildShapeFlying(8, '2014')).toBe(true);
    expect(canWildShapeFlying(10, '2014')).toBe(true);
    expect(canWildShapeFlying(20, '2014')).toBe(true);
  });
});

describe('canWildShapeSwimming', () => {
  describe('2024 Edition', () => {
    it('should return true for all Wild Shape levels (no restriction)', () => {
      expect(canWildShapeSwimming(2, '2024')).toBe(true);
      expect(canWildShapeSwimming(3, '2024')).toBe(true);
      expect(canWildShapeSwimming(4, '2024')).toBe(true);
      expect(canWildShapeSwimming(8, '2024')).toBe(true);
      expect(canWildShapeSwimming(20, '2024')).toBe(true);
    });
  });

  describe('2014 Edition', () => {
    it('should return false for levels 2-3', () => {
      expect(canWildShapeSwimming(2, '2014')).toBe(false);
      expect(canWildShapeSwimming(3, '2014')).toBe(false);
    });

    it('should return true for levels 4+', () => {
      expect(canWildShapeSwimming(4, '2014')).toBe(true);
      expect(canWildShapeSwimming(5, '2014')).toBe(true);
      expect(canWildShapeSwimming(8, '2014')).toBe(true);
      expect(canWildShapeSwimming(20, '2014')).toBe(true);
    });
  });
});

describe('canWildShapeInto', () => {
  describe('2024 Edition - Level 2-3 druid restrictions', () => {
    it('should allow CR 1/4 beast with no special movement', () => {
      const beast = createMockBeast(0.25, {});
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(true);
    });

    it('should reject CR 1/2 beast', () => {
      const beast = createMockBeast(0.5, {});
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('CR');
    });

    it('should reject beast with flying speed', () => {
      const beast = createMockBeast(0.25, { flying: 60 });
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('fly');
    });

    it('should allow beast with swimming speed (2024 has no restriction)', () => {
      const beast = createMockBeast(0.25, { swimming: 40 });
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(true);
    });

    it('should allow beast with climbing speed', () => {
      const beast = createMockBeast(0.25, { climbing: 30 });
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 0 beast', () => {
      const beast = createMockBeast(0, {});
      const result = canWildShapeInto(2, beast, '2024');
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1/8 beast', () => {
      const beast = createMockBeast(0.125, {});
      const result = canWildShapeInto(3, beast, '2024');
      expect(result.canTransform).toBe(true);
    });
  });

  describe('2014 Edition - Level 2-3 druid restrictions', () => {
    it('should allow CR 1/4 beast with no special movement', () => {
      const beast = createMockBeast(0.25, {});
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(true);
    });

    it('should reject CR 1/2 beast', () => {
      const beast = createMockBeast(0.5, {});
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('CR');
    });

    it('should reject beast with flying speed', () => {
      const beast = createMockBeast(0.25, { flying: 60 });
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('fly');
    });

    it('should reject beast with swimming speed (2014 requires level 4)', () => {
      const beast = createMockBeast(0.25, { swimming: 40 });
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('swim');
    });

    it('should allow beast with climbing speed', () => {
      const beast = createMockBeast(0.25, { climbing: 30 });
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 0 beast', () => {
      const beast = createMockBeast(0, {});
      const result = canWildShapeInto(2, beast, '2014');
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1/8 beast', () => {
      const beast = createMockBeast(0.125, {});
      const result = canWildShapeInto(3, beast, '2014');
      expect(result.canTransform).toBe(true);
    });
  });

  describe('Level 4-7 druid restrictions (both editions)', () => {
    it('should allow CR 1/2 beast with no flying', () => {
      const beast = createMockBeast(0.5, {});
      expect(canWildShapeInto(4, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(4, beast, '2014').canTransform).toBe(true);
    });

    it('should allow CR 1/2 beast with swimming speed', () => {
      const beast = createMockBeast(0.5, { swimming: 40 });
      expect(canWildShapeInto(4, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(4, beast, '2014').canTransform).toBe(true);
    });

    it('should reject CR 1/2 beast with flying speed', () => {
      const beast = createMockBeast(0.5, { flying: 60 });
      const result2024 = canWildShapeInto(4, beast, '2024');
      const result2014 = canWildShapeInto(4, beast, '2014');
      expect(result2024.canTransform).toBe(false);
      expect(result2024.reason).toContain('fly');
      expect(result2014.canTransform).toBe(false);
      expect(result2014.reason).toContain('fly');
    });

    it('should reject CR 1 beast', () => {
      const beast = createMockBeast(1, {});
      const result2024 = canWildShapeInto(5, beast, '2024');
      const result2014 = canWildShapeInto(5, beast, '2014');
      expect(result2024.canTransform).toBe(false);
      expect(result2024.reason).toContain('CR');
      expect(result2014.canTransform).toBe(false);
      expect(result2014.reason).toContain('CR');
    });

    it('should allow CR 1/4 beast (lower than max)', () => {
      const beast = createMockBeast(0.25, {});
      expect(canWildShapeInto(6, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(6, beast, '2014').canTransform).toBe(true);
    });
  });

  describe('Level 8+ druid restrictions (both editions)', () => {
    it('should allow CR 1 beast with any movement', () => {
      const beast = createMockBeast(1, {});
      expect(canWildShapeInto(8, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(8, beast, '2014').canTransform).toBe(true);
    });

    it('should allow CR 1 beast with flying speed', () => {
      const beast = createMockBeast(1, { flying: 60 });
      expect(canWildShapeInto(8, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(8, beast, '2014').canTransform).toBe(true);
    });

    it('should allow CR 1 beast with swimming speed', () => {
      const beast = createMockBeast(1, { swimming: 40 });
      expect(canWildShapeInto(10, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(10, beast, '2014').canTransform).toBe(true);
    });

    it('should allow CR 1 beast with both flying and swimming', () => {
      const beast = createMockBeast(1, { flying: 60, swimming: 40 });
      expect(canWildShapeInto(15, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(15, beast, '2014').canTransform).toBe(true);
    });

    it('should reject CR 2 beast', () => {
      const beast = createMockBeast(2, {});
      const result2024 = canWildShapeInto(10, beast, '2024');
      const result2014 = canWildShapeInto(10, beast, '2014');
      expect(result2024.canTransform).toBe(false);
      expect(result2024.reason).toContain('CR');
      expect(result2014.canTransform).toBe(false);
      expect(result2014.reason).toContain('CR');
    });

    it('should allow lower CR beasts', () => {
      const beast = createMockBeast(0.5, { flying: 60 });
      expect(canWildShapeInto(20, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(20, beast, '2014').canTransform).toBe(true);
    });
  });

  describe('Edge cases (both editions)', () => {
    it('should handle exact CR boundaries for level 2', () => {
      const exactCR = createMockBeast(0.25, {});
      expect(canWildShapeInto(2, exactCR, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(2, exactCR, '2014').canTransform).toBe(true);

      const overCR = createMockBeast(0.26, {});
      expect(canWildShapeInto(2, overCR, '2024').canTransform).toBe(false);
      expect(canWildShapeInto(2, overCR, '2014').canTransform).toBe(false);
    });

    it('should handle exact CR boundaries for level 4', () => {
      const exactCR = createMockBeast(0.5, {});
      expect(canWildShapeInto(4, exactCR, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(4, exactCR, '2014').canTransform).toBe(true);

      const overCR = createMockBeast(0.51, {});
      expect(canWildShapeInto(4, overCR, '2024').canTransform).toBe(false);
      expect(canWildShapeInto(4, overCR, '2014').canTransform).toBe(false);
    });

    it('should handle exact CR boundaries for level 8', () => {
      const exactCR = createMockBeast(1, {});
      expect(canWildShapeInto(8, exactCR, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(8, exactCR, '2014').canTransform).toBe(true);

      const overCR = createMockBeast(1.01, {});
      expect(canWildShapeInto(8, overCR, '2024').canTransform).toBe(false);
      expect(canWildShapeInto(8, overCR, '2014').canTransform).toBe(false);
    });

    it('should handle beast with burrowing speed', () => {
      // Burrowing is not restricted at any level
      const beast = createMockBeast(0.25, { burrowing: 20 });
      expect(canWildShapeInto(2, beast, '2024').canTransform).toBe(true);
      expect(canWildShapeInto(2, beast, '2014').canTransform).toBe(true);
    });
  });

  describe('2024 Edition - Circle of the Moon', () => {
    describe('Moon Druid at level 3', () => {
      it('should allow CR 1 beast (Moon exceeds base 1/4)', () => {
        const beast = createMockBeast(1, {});
        const result = canWildShapeInto(3, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 2 beast (above limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(3, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should reject flying at level 3', () => {
        const beast = createMockBeast(1, { flying: 60 });
        const result = canWildShapeInto(3, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should allow swimming at level 3 (2024 has no swimming restriction)', () => {
        const beast = createMockBeast(1, { swimming: 40 });
        const result = canWildShapeInto(3, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });
    });

    describe('Moon Druid at level 6', () => {
      it('should allow CR 2 beast (within limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(6, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 3 beast (above limit)', () => {
        const beast = createMockBeast(3, {});
        const result = canWildShapeInto(6, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should still enforce flying restriction', () => {
        const beast = createMockBeast(2, { flying: 60 });
        const result = canWildShapeInto(6, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should allow swimming at level 6', () => {
        const beast = createMockBeast(2, { swimming: 40 });
        const result = canWildShapeInto(6, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });
    });

    describe('Moon Druid at level 9', () => {
      it('should allow CR 3 beast with flying', () => {
        const beast = createMockBeast(3, { flying: 60 });
        const result = canWildShapeInto(9, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 4 beast', () => {
        const beast = createMockBeast(4, {});
        const result = canWildShapeInto(9, beast, '2024', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
      });
    });
  });

  describe('2014 Edition - Circle of the Moon', () => {
    describe('Moon Druid at level 2 (special 2014 rule)', () => {
      it('should allow CR 1 beast (special 2014 Moon druid rule)', () => {
        const beast = createMockBeast(1, {});
        const result = canWildShapeInto(2, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 2 beast (above limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(2, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should reject flying at level 2', () => {
        const beast = createMockBeast(1, { flying: 60 });
        const result = canWildShapeInto(2, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should reject swimming at level 2 (2014 requires level 4)', () => {
        const beast = createMockBeast(1, { swimming: 40 });
        const result = canWildShapeInto(2, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('swim');
      });
    });

    describe('Moon Druid at level 3', () => {
      it('should allow CR 1 beast (Moon exceeds base 1/4)', () => {
        const beast = createMockBeast(1, {});
        const result = canWildShapeInto(3, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 2 beast (above limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(3, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should reject flying at level 3', () => {
        const beast = createMockBeast(1, { flying: 60 });
        const result = canWildShapeInto(3, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should reject swimming at level 3 (2014 requires level 4)', () => {
        const beast = createMockBeast(1, { swimming: 40 });
        const result = canWildShapeInto(3, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('swim');
      });
    });

    describe('Moon Druid at level 6', () => {
      it('should allow CR 2 beast (within limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(6, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 3 beast (above limit)', () => {
        const beast = createMockBeast(3, {});
        const result = canWildShapeInto(6, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should still enforce flying restriction', () => {
        const beast = createMockBeast(2, { flying: 60 });
        const result = canWildShapeInto(6, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should allow swimming at level 6', () => {
        const beast = createMockBeast(2, { swimming: 40 });
        const result = canWildShapeInto(6, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });
    });

    describe('Moon Druid at level 9', () => {
      it('should allow CR 3 beast with flying', () => {
        const beast = createMockBeast(3, { flying: 60 });
        const result = canWildShapeInto(9, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 4 beast', () => {
        const beast = createMockBeast(4, {});
        const result = canWildShapeInto(9, beast, '2014', 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
      });
    });
  });

  describe('Comparison: Base vs Moon Druid (both editions)', () => {
    it('level 6 base druid limited to CR 1/2, Moon to CR 2', () => {
      const cr1Beast = createMockBeast(1, {});

      // Base druid cannot (both editions)
      expect(canWildShapeInto(6, cr1Beast, '2024', null).canTransform).toBe(
        false
      );
      expect(canWildShapeInto(6, cr1Beast, '2014', null).canTransform).toBe(
        false
      );

      // Moon druid can (both editions)
      expect(
        canWildShapeInto(6, cr1Beast, '2024', 'Circle of the Moon').canTransform
      ).toBe(true);
      expect(
        canWildShapeInto(6, cr1Beast, '2014', 'Circle of the Moon').canTransform
      ).toBe(true);
    });

    it('level 3 base druid limited to CR 1/4, Moon to CR 1', () => {
      const cr1Beast = createMockBeast(1, {});

      // Base druid cannot (both editions)
      expect(canWildShapeInto(3, cr1Beast, '2024').canTransform).toBe(false);
      expect(canWildShapeInto(3, cr1Beast, '2014').canTransform).toBe(false);

      // Moon druid can (both editions)
      expect(
        canWildShapeInto(3, cr1Beast, '2024', 'Circle of the Moon').canTransform
      ).toBe(true);
      expect(
        canWildShapeInto(3, cr1Beast, '2014', 'Circle of the Moon').canTransform
      ).toBe(true);
    });

    it('Moon druid still respects movement restrictions at same levels as base druid', () => {
      const flyingBeast = createMockBeast(1, { flying: 60 });

      // Both cannot fly at level 7 (both editions)
      expect(canWildShapeInto(7, flyingBeast, '2024', null).canTransform).toBe(
        false
      );
      expect(
        canWildShapeInto(7, flyingBeast, '2024', 'Circle of the Moon')
          .canTransform
      ).toBe(false);
      expect(canWildShapeInto(7, flyingBeast, '2014', null).canTransform).toBe(
        false
      );
      expect(
        canWildShapeInto(7, flyingBeast, '2014', 'Circle of the Moon')
          .canTransform
      ).toBe(false);

      // Both can fly at level 8 (both editions)
      expect(canWildShapeInto(8, flyingBeast, '2024', null).canTransform).toBe(
        true
      );
      expect(
        canWildShapeInto(8, flyingBeast, '2024', 'Circle of the Moon')
          .canTransform
      ).toBe(true);
      expect(canWildShapeInto(8, flyingBeast, '2014', null).canTransform).toBe(
        true
      );
      expect(
        canWildShapeInto(8, flyingBeast, '2014', 'Circle of the Moon')
          .canTransform
      ).toBe(true);
    });

    it('2014 Moon druid can use CR 1 at level 2 (special rule)', () => {
      const cr1Beast = createMockBeast(1, {});

      // Base druids cannot at level 2 (both editions)
      expect(canWildShapeInto(2, cr1Beast, '2024', null).canTransform).toBe(
        false
      );
      expect(canWildShapeInto(2, cr1Beast, '2014', null).canTransform).toBe(
        false
      );

      // 2024 Moon druid cannot at level 2
      expect(
        canWildShapeInto(2, cr1Beast, '2024', 'Circle of the Moon').canTransform
      ).toBe(false);

      // 2014 Moon druid CAN at level 2 (special rule)
      expect(
        canWildShapeInto(2, cr1Beast, '2014', 'Circle of the Moon').canTransform
      ).toBe(true);
    });
  });
});
