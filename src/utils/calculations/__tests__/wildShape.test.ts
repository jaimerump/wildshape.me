import { describe, it, expect } from '@jest/globals';
import {
  canWildShapeInto,
  getMaxWildShapeCR,
  canWildShapeFlying,
  canWildShapeSwimming
} from '../wildShape';
import type { Beast, Movement } from '../../../models';

// Helper function to create mock beasts for testing
function createMockBeast(cr: number, movement: Partial<Movement>): Pick<Beast, 'challengeRating' | 'movement'> {
  return {
    challengeRating: cr,
    movement: {
      walking: 30,
      ...movement
    }
  };
}

describe('getMaxWildShapeCR', () => {
  describe('Base druid (no circle)', () => {
    it('should return 0.25 for levels 2-3', () => {
      expect(getMaxWildShapeCR(2)).toBe(0.25);
      expect(getMaxWildShapeCR(3)).toBe(0.25);
    });

    it('should return 0.5 for levels 4-7', () => {
      expect(getMaxWildShapeCR(4)).toBe(0.5);
      expect(getMaxWildShapeCR(5)).toBe(0.5);
      expect(getMaxWildShapeCR(6)).toBe(0.5);
      expect(getMaxWildShapeCR(7)).toBe(0.5);
    });

    it('should return 1 for levels 8+', () => {
      expect(getMaxWildShapeCR(8)).toBe(1);
      expect(getMaxWildShapeCR(10)).toBe(1);
      expect(getMaxWildShapeCR(15)).toBe(1);
      expect(getMaxWildShapeCR(20)).toBe(1);
    });

    it('should use base druid rules when circle is null', () => {
      expect(getMaxWildShapeCR(3, null)).toBe(0.25);
      expect(getMaxWildShapeCR(6, null)).toBe(0.5);
      expect(getMaxWildShapeCR(10, null)).toBe(1);
    });

    it('should use base druid rules for non-Moon circles', () => {
      expect(getMaxWildShapeCR(6, 'Circle of the Land')).toBe(0.5);
      expect(getMaxWildShapeCR(10, 'Circle of the Stars')).toBe(1);
    });
  });

  describe('Circle of the Moon', () => {
    it('should use base CR when it is higher than Moon formula', () => {
      // Level 2: max(0.25, floor(2/3)=0) = 0.25
      expect(getMaxWildShapeCR(2, 'Circle of the Moon')).toBe(0.25);
      // Level 4: max(0.5, floor(4/3)=1) = 1
      expect(getMaxWildShapeCR(4, 'Circle of the Moon')).toBe(1);
      // Level 5: max(0.5, floor(5/3)=1) = 1
      expect(getMaxWildShapeCR(5, 'Circle of the Moon')).toBe(1);
      // Level 8: max(1, floor(8/3)=2) = 2
      expect(getMaxWildShapeCR(8, 'Circle of the Moon')).toBe(2);
    });

    it('should use Moon formula when it exceeds base CR', () => {
      // Level 3: max(0.25, floor(3/3)=1) = 1
      expect(getMaxWildShapeCR(3, 'Circle of the Moon')).toBe(1);
      // Level 6: max(0.5, floor(6/3)=2) = 2
      expect(getMaxWildShapeCR(6, 'Circle of the Moon')).toBe(2);
      // Level 9: max(1, floor(9/3)=3) = 3
      expect(getMaxWildShapeCR(9, 'Circle of the Moon')).toBe(3);
      // Level 12: max(1, floor(12/3)=4) = 4
      expect(getMaxWildShapeCR(12, 'Circle of the Moon')).toBe(4);
      // Level 15: max(1, floor(15/3)=5) = 5
      expect(getMaxWildShapeCR(15, 'Circle of the Moon')).toBe(5);
      // Level 20: max(1, floor(20/3)=6) = 6
      expect(getMaxWildShapeCR(20, 'Circle of the Moon')).toBe(6);
    });
  });
});

describe('canWildShapeFlying', () => {
  it('should return false for levels below 8', () => {
    expect(canWildShapeFlying(2)).toBe(false);
    expect(canWildShapeFlying(3)).toBe(false);
    expect(canWildShapeFlying(4)).toBe(false);
    expect(canWildShapeFlying(5)).toBe(false);
    expect(canWildShapeFlying(6)).toBe(false);
    expect(canWildShapeFlying(7)).toBe(false);
  });

  it('should return true for levels 8+', () => {
    expect(canWildShapeFlying(8)).toBe(true);
    expect(canWildShapeFlying(10)).toBe(true);
    expect(canWildShapeFlying(20)).toBe(true);
  });
});

describe('canWildShapeSwimming', () => {
  it('should return false for levels 2-3', () => {
    expect(canWildShapeSwimming(2)).toBe(false);
    expect(canWildShapeSwimming(3)).toBe(false);
  });

  it('should return true for levels 4+', () => {
    expect(canWildShapeSwimming(4)).toBe(true);
    expect(canWildShapeSwimming(5)).toBe(true);
    expect(canWildShapeSwimming(8)).toBe(true);
    expect(canWildShapeSwimming(20)).toBe(true);
  });
});

describe('canWildShapeInto', () => {
  describe('Level 2-3 druid restrictions', () => {
    it('should allow CR 1/4 beast with no special movement', () => {
      const beast = createMockBeast(0.25, {});
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should reject CR 1/2 beast', () => {
      const beast = createMockBeast(0.5, {});
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('CR');
    });

    it('should reject beast with flying speed', () => {
      const beast = createMockBeast(0.25, { flying: 60 });
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('fly');
    });

    it('should reject beast with swimming speed', () => {
      const beast = createMockBeast(0.25, { swimming: 40 });
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('swim');
    });

    it('should allow beast with climbing speed', () => {
      const beast = createMockBeast(0.25, { climbing: 30 });
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 0 beast', () => {
      const beast = createMockBeast(0, {});
      const result = canWildShapeInto(2, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1/8 beast', () => {
      const beast = createMockBeast(0.125, {});
      const result = canWildShapeInto(3, beast);
      expect(result.canTransform).toBe(true);
    });
  });

  describe('Level 4-7 druid restrictions', () => {
    it('should allow CR 1/2 beast with no flying', () => {
      const beast = createMockBeast(0.5, {});
      const result = canWildShapeInto(4, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1/2 beast with swimming speed', () => {
      const beast = createMockBeast(0.5, { swimming: 40 });
      const result = canWildShapeInto(4, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should reject CR 1/2 beast with flying speed', () => {
      const beast = createMockBeast(0.5, { flying: 60 });
      const result = canWildShapeInto(4, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('fly');
    });

    it('should reject CR 1 beast', () => {
      const beast = createMockBeast(1, {});
      const result = canWildShapeInto(5, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('CR');
    });

    it('should allow CR 1/4 beast (lower than max)', () => {
      const beast = createMockBeast(0.25, {});
      const result = canWildShapeInto(6, beast);
      expect(result.canTransform).toBe(true);
    });
  });

  describe('Level 8+ druid restrictions', () => {
    it('should allow CR 1 beast with any movement', () => {
      const beast = createMockBeast(1, {});
      const result = canWildShapeInto(8, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1 beast with flying speed', () => {
      const beast = createMockBeast(1, { flying: 60 });
      const result = canWildShapeInto(8, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1 beast with swimming speed', () => {
      const beast = createMockBeast(1, { swimming: 40 });
      const result = canWildShapeInto(10, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should allow CR 1 beast with both flying and swimming', () => {
      const beast = createMockBeast(1, { flying: 60, swimming: 40 });
      const result = canWildShapeInto(15, beast);
      expect(result.canTransform).toBe(true);
    });

    it('should reject CR 2 beast', () => {
      const beast = createMockBeast(2, {});
      const result = canWildShapeInto(10, beast);
      expect(result.canTransform).toBe(false);
      expect(result.reason).toContain('CR');
    });

    it('should allow lower CR beasts', () => {
      const beast = createMockBeast(0.5, { flying: 60 });
      const result = canWildShapeInto(20, beast);
      expect(result.canTransform).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle exact CR boundaries for level 2', () => {
      const exactCR = createMockBeast(0.25, {});
      expect(canWildShapeInto(2, exactCR).canTransform).toBe(true);

      const overCR = createMockBeast(0.26, {});
      expect(canWildShapeInto(2, overCR).canTransform).toBe(false);
    });

    it('should handle exact CR boundaries for level 4', () => {
      const exactCR = createMockBeast(0.5, {});
      expect(canWildShapeInto(4, exactCR).canTransform).toBe(true);

      const overCR = createMockBeast(0.51, {});
      expect(canWildShapeInto(4, overCR).canTransform).toBe(false);
    });

    it('should handle exact CR boundaries for level 8', () => {
      const exactCR = createMockBeast(1, {});
      expect(canWildShapeInto(8, exactCR).canTransform).toBe(true);

      const overCR = createMockBeast(1.01, {});
      expect(canWildShapeInto(8, overCR).canTransform).toBe(false);
    });

    it('should handle beast with burrowing speed', () => {
      // Burrowing is not restricted at any level
      const beast = createMockBeast(0.25, { burrowing: 20 });
      expect(canWildShapeInto(2, beast).canTransform).toBe(true);
    });
  });

  describe('Circle of the Moon', () => {
    describe('Moon Druid at level 3', () => {
      it('should allow CR 1 beast (Moon exceeds base 1/4)', () => {
        const beast = createMockBeast(1, {});
        const result = canWildShapeInto(3, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 2 beast (above limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(3, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should reject flying at level 3', () => {
        const beast = createMockBeast(1, { flying: 60 });
        const result = canWildShapeInto(3, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should reject swimming at level 3', () => {
        const beast = createMockBeast(1, { swimming: 40 });
        const result = canWildShapeInto(3, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('swim');
      });
    });

    describe('Moon Druid at level 6', () => {
      it('should allow CR 2 beast (within limit)', () => {
        const beast = createMockBeast(2, {});
        const result = canWildShapeInto(6, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 3 beast (above limit)', () => {
        const beast = createMockBeast(3, {});
        const result = canWildShapeInto(6, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('CR');
      });

      it('should still enforce flying restriction', () => {
        const beast = createMockBeast(2, { flying: 60 });
        const result = canWildShapeInto(6, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
        expect(result.reason).toContain('fly');
      });

      it('should allow swimming at level 6', () => {
        const beast = createMockBeast(2, { swimming: 40 });
        const result = canWildShapeInto(6, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });
    });

    describe('Moon Druid at level 9', () => {
      it('should allow CR 3 beast with flying', () => {
        const beast = createMockBeast(3, { flying: 60 });
        const result = canWildShapeInto(9, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(true);
      });

      it('should reject CR 4 beast', () => {
        const beast = createMockBeast(4, {});
        const result = canWildShapeInto(9, beast, 'Circle of the Moon');
        expect(result.canTransform).toBe(false);
      });
    });

    describe('Comparison: Base vs Moon Druid', () => {
      it('level 6 base druid limited to CR 1/2, Moon to CR 2', () => {
        const cr1Beast = createMockBeast(1, {});

        // Base druid cannot
        expect(canWildShapeInto(6, cr1Beast, null).canTransform).toBe(false);

        // Moon druid can
        expect(canWildShapeInto(6, cr1Beast, 'Circle of the Moon').canTransform).toBe(true);
      });

      it('level 3 base druid limited to CR 1/4, Moon to CR 1', () => {
        const cr1Beast = createMockBeast(1, {});

        // Base druid cannot
        expect(canWildShapeInto(3, cr1Beast).canTransform).toBe(false);

        // Moon druid can
        expect(canWildShapeInto(3, cr1Beast, 'Circle of the Moon').canTransform).toBe(true);
      });

      it('Moon druid still respects movement restrictions at same levels as base druid', () => {
        const flyingBeast = createMockBeast(1, { flying: 60 });

        // Both cannot fly at level 7
        expect(canWildShapeInto(7, flyingBeast, null).canTransform).toBe(false);
        expect(canWildShapeInto(7, flyingBeast, 'Circle of the Moon').canTransform).toBe(false);

        // Both can fly at level 8
        expect(canWildShapeInto(8, flyingBeast, null).canTransform).toBe(true);
        expect(canWildShapeInto(8, flyingBeast, 'Circle of the Moon').canTransform).toBe(true);
      });
    });
  });
});
