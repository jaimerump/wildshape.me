import { describe, it, expect } from '@jest/globals';
import {
  canWildShapeInto,
  getMaxWildShapeCR,
  canWildShapeFlying,
  canWildShapeSwimming,
  calculateWildshapedDruid,
} from '../wildShape';
import type {
  Beast,
  Druid,
  Movement,
  Trait,
  Action,
  AbilityName,
  SkillProficiency,
  BodyType,
  Equipment,
  EquipmentType,
} from '../../../models';

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

// Helper function to create a full mock druid for testing calculateWildshapedDruid
function createMockDruid(options: {
  edition?: '2024' | '2014';
  druidLevel?: number;
  totalCharacterLevel?: number;
  druidCircle?: 'Circle of the Moon' | null;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  hitPoints?: number;
  savingThrowProficiencies?: AbilityName[];
  skillProficiencies?: SkillProficiency[];
  traits?: Trait[];
  actions?: Action[];
  equipment?: Equipment[];
  otherClassLevels?: Record<string, number>;
}): Druid {
  return {
    name: 'Test Druid',
    edition: options.edition || '2024',
    size: 'Medium',
    strength: options.strength || 10,
    dexterity: options.dexterity || 12,
    constitution: options.constitution || 14,
    intelligence: options.intelligence || 13,
    wisdom: options.wisdom || 16,
    charisma: options.charisma || 11,
    armorClass: 15,
    hitPoints: options.hitPoints || 30,
    hitDice: '5d8',
    movement: { walking: 30 },
    senses: {},
    passivePerception: 13,
    languages: ['Common', 'Druidic'],
    savingThrowProficiencies: options.savingThrowProficiencies || [
      'intelligence',
      'wisdom',
    ],
    skillProficiencies: options.skillProficiencies || [
      { skill: 'Perception', proficiencyLevel: 'proficient' },
      { skill: 'Nature', proficiencyLevel: 'proficient' },
    ],
    traits: options.traits || [
      {
        name: 'Spellcasting',
        description: 'Can cast druid spells',
        source: 'class',
        className: 'Druid',
        levelRequirement: 1,
      },
    ],
    actions: options.actions || [
      {
        name: 'Quarterstaff',
        actionType: 'Action',
        description: 'Melee weapon attack',
        source: 'class',
        className: 'Druid',
        levelRequirement: 1,
      },
    ],
    totalCharacterLevel: options.totalCharacterLevel || 5,
    druidLevel: options.druidLevel || 5,
    druidCircle: options.druidCircle ?? null,
    otherClassLevels: options.otherClassLevels,
    equipment: options.equipment || [],
  };
}

// Helper function to create a full mock beast for testing calculateWildshapedDruid
function createFullMockBeast(options: {
  name?: string;
  edition?: '2024' | '2014';
  challengeRating?: number;
  size?: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  armorClass?: number;
  hitPoints?: number;
  movement?: Partial<Movement>;
  savingThrowProficiencies?: AbilityName[];
  skillProficiencies?: SkillProficiency[];
  traits?: Trait[];
  actions?: Action[];
  bodyType?: BodyType;
}): Beast {
  return {
    name: options.name || 'Test Beast',
    edition: options.edition || '2024',
    size: options.size || 'Medium',
    strength: options.strength || 14,
    dexterity: options.dexterity || 15,
    constitution: options.constitution || 12,
    intelligence: options.intelligence || 3,
    wisdom: options.wisdom || 12,
    charisma: options.charisma || 6,
    armorClass: options.armorClass || 13,
    hitPoints: options.hitPoints || 11,
    hitDice: '2d8+2',
    movement: {
      walking: 40,
      ...options.movement,
    },
    senses: { darkvision: 60 },
    passivePerception: 11,
    languages: [],
    savingThrowProficiencies: options.savingThrowProficiencies || [],
    skillProficiencies: options.skillProficiencies || [],
    traits: options.traits || [
      {
        name: 'Keen Hearing',
        description: 'Advantage on Wisdom (Perception) checks',
        source: 'species',
      },
    ],
    actions: options.actions || [
      {
        name: 'Bite',
        actionType: 'Action',
        description: 'Melee weapon attack',
        source: 'species',
      },
    ],
    challengeRating: options.challengeRating || 0.25,
    bodyType: options.bodyType || 'unassigned',
  };
}

describe('calculateWildshapedDruid', () => {
  describe('Validation', () => {
    it('should support 2014 edition druids', () => {
      const druid = createMockDruid({ edition: '2014', druidLevel: 5 });
      const beast = createFullMockBeast({
        edition: '2014',
        challengeRating: 0.25,
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.edition).toBe('2014');
      expect(wildshaped.druidLevel).toBe(5);
    });

    it('should throw error if editions do not match', () => {
      const druid = createMockDruid({ edition: '2024', druidLevel: 5 });
      const beast = createFullMockBeast({
        edition: '2014',
        challengeRating: 0.25,
      });

      expect(() => calculateWildshapedDruid(druid, beast)).toThrow(
        'Edition mismatch'
      );
    });

    it('should throw error if beast CR is too high', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 2 }); // CR 2 too high for level 5

      expect(() => calculateWildshapedDruid(druid, beast)).toThrow(
        'Cannot Wild Shape into'
      );
    });

    it('should throw error if beast has flying speed but druid is under level 8', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        movement: { flying: 60 },
      });

      expect(() => calculateWildshapedDruid(druid, beast)).toThrow(
        'Cannot fly until level 8'
      );
    });
  });

  describe('Basic transformation - Ability scores and HP', () => {
    it('should use physical ability scores from beast', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        strength: 8,
        dexterity: 12,
        constitution: 14,
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        strength: 16,
        dexterity: 18,
        constitution: 15,
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.strength).toBe(16); // From beast
      expect(wildshaped.dexterity).toBe(18); // From beast
      expect(wildshaped.constitution).toBe(15); // From beast
    });

    it('should use mental ability scores from druid', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        intelligence: 13,
        wisdom: 16,
        charisma: 11,
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        intelligence: 3,
        wisdom: 12,
        charisma: 6,
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.intelligence).toBe(13); // From druid
      expect(wildshaped.wisdom).toBe(16); // From druid
      expect(wildshaped.charisma).toBe(11); // From druid
    });

    it('should use hit points from druid', () => {
      const druid = createMockDruid({ druidLevel: 5, hitPoints: 35 });
      const beast = createFullMockBeast({ hitPoints: 11 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.hitPoints).toBe(35); // From druid
    });

    it('should set temporary hit points equal to druid level', () => {
      const druid = createMockDruid({ druidLevel: 8 });
      const beast = createFullMockBeast({ challengeRating: 1 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.temporaryHitPoints).toBe(8);
    });

    it('should use hit dice from druid', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.hitDice).toBe('5d8'); // From druid
    });
  });

  describe('Basic transformation - Combat and movement', () => {
    it('should use AC from beast', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ armorClass: 14 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.armorClass).toBe(14);
    });

    it('should use movement from beast', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        movement: { walking: 50, swimming: 30 },
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.movement.walking).toBe(50);
      expect(wildshaped.movement.swimming).toBe(30);
    });

    it('should use senses from beast', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.senses.darkvision).toBe(60);
    });

    it('should use languages from druid', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.languages).toEqual(['Common', 'Druidic']);
    });

    it('should use beast name and size', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({
        name: 'Wolf',
        size: 'Medium',
        challengeRating: 0.25,
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.name).toBe('Wolf');
      expect(wildshaped.size).toBe('Medium');
    });
  });

  describe('Saving throw merging', () => {
    it('should use higher save bonus when druid is proficient and has higher total', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 5,
        wisdom: 16, // +3 modifier
        savingThrowProficiencies: ['intelligence', 'wisdom'], // PB +3
        // Wisdom save: +3 (mod) + 3 (PB) = +6
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        wisdom: 12, // +1 modifier
        savingThrowProficiencies: [], // Not proficient, PB +2
        // Wisdom save: +1 (mod) = +1
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Should use druid's higher save: +6
      expect(wildshaped.savingThrowBonuses.wisdom).toBe(6);
    });

    it('should use higher save bonus when beast is proficient and has higher total', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 5,
        dexterity: 12, // Druid's physical score
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        // Dex save: hybrid uses beast's Dex (18) = +4 (mod) = +4 (not proficient)
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        dexterity: 18, // +4 modifier
        savingThrowProficiencies: ['dexterity'], // PB +2
        // Dex save: +4 (mod) + 2 (PB) = +6
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Should use beast's higher save: +6
      expect(wildshaped.savingThrowBonuses.dexterity).toBe(6);
    });

    it('should use druid save when neither is proficient but druid has better hybrid score', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        charisma: 14, // +2 modifier (from druid, mental stat)
        savingThrowProficiencies: ['intelligence', 'wisdom'],
        // Charisma save: +2 (not proficient)
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        charisma: 6, // -2 modifier
        savingThrowProficiencies: [],
        // Charisma save: -2 (not proficient)
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Should use druid's higher save: +2
      expect(wildshaped.savingThrowBonuses.charisma).toBe(2);
    });
  });

  describe('Skill merging', () => {
    it('should use higher skill bonus when druid is proficient and has higher total', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 5,
        wisdom: 16, // +3 modifier
        skillProficiencies: [
          { skill: 'Perception', proficiencyLevel: 'proficient' }, // PB +3
        ],
        // Perception: +3 (mod) + 3 (PB) = +6
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        wisdom: 12, // +1 modifier
        skillProficiencies: [],
        // Perception: +1 (mod) = +1 (not proficient)
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.skillBonuses['Perception']).toBe(6);
    });

    it('should use higher skill bonus when beast has expertise', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 5,
        dexterity: 12, // Druid's mental (but hybrid uses beast's 18)
        skillProficiencies: [
          { skill: 'Stealth', proficiencyLevel: 'proficient' },
        ],
        // Stealth: +4 (hybrid Dex mod) + 3 (PB) = +7
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        dexterity: 18, // +4 modifier
        skillProficiencies: [
          { skill: 'Stealth', proficiencyLevel: 'expertise' }, // 2x PB +2 = +4
        ],
        // Stealth: +4 (mod) + 4 (expertise) = +8
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Should use beast's higher skill: +8
      expect(wildshaped.skillBonuses['Stealth']).toBe(8);
    });

    it('should calculate all 18 skills', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Check that all skills have bonuses calculated
      const skills = [
        'Acrobatics',
        'Animal Handling',
        'Arcana',
        'Athletics',
        'Deception',
        'History',
        'Insight',
        'Intimidation',
        'Investigation',
        'Medicine',
        'Nature',
        'Perception',
        'Performance',
        'Persuasion',
        'Religion',
        'Sleight of Hand',
        'Stealth',
        'Survival',
      ];

      for (const skill of skills) {
        expect(wildshaped.skillBonuses[skill]).toBeDefined();
        expect(typeof wildshaped.skillBonuses[skill]).toBe('number');
      }
    });
  });

  describe('Passive Perception', () => {
    it('should recalculate passive perception from merged Perception skill', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 5,
        wisdom: 16, // +3 modifier
        skillProficiencies: [
          { skill: 'Perception', proficiencyLevel: 'proficient' },
        ],
        // Perception: +3 (mod) + 3 (PB) = +6
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        wisdom: 12,
        skillProficiencies: [],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Passive Perception = 10 + Perception bonus
      expect(wildshaped.passivePerception).toBe(16); // 10 + 6
    });
  });

  describe('Traits and actions source filtering', () => {
    it('should include all beast species traits', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        traits: [
          {
            name: 'Spellcasting',
            description: 'Can cast druid spells',
            source: 'class',
            className: 'Druid',
            levelRequirement: 1,
          },
          {
            name: 'Darkvision',
            description: 'From species',
            source: 'species',
          },
        ],
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        traits: [
          {
            name: 'Keen Hearing',
            description: 'Advantage on Perception',
            source: 'species',
          },
          {
            name: 'Pack Tactics',
            description: 'Advantage when ally is nearby',
            source: 'species',
          },
        ],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      const beastTraitNames = wildshaped.traits
        .filter((t) => t.source === 'species')
        .map((t) => t.name);

      expect(beastTraitNames).toContain('Keen Hearing');
      expect(beastTraitNames).toContain('Pack Tactics');
    });

    it('should include druid class and feat traits but exclude druid species traits', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        traits: [
          {
            name: 'Spellcasting',
            description: 'Can cast druid spells',
            source: 'class',
            className: 'Druid',
            levelRequirement: 1,
          },
          {
            name: 'Wild Shape',
            description: 'Can transform',
            source: 'class',
            className: 'Druid',
            levelRequirement: 2,
          },
          {
            name: 'Alert',
            description: 'From feat',
            source: 'feat',
          },
          {
            name: 'Darkvision',
            description: 'From elf species',
            source: 'species',
          },
        ],
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        traits: [
          {
            name: 'Keen Hearing',
            description: 'Advantage on Perception',
            source: 'species',
          },
        ],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      const traitNames = wildshaped.traits.map((t) => t.name);

      // Should include druid class and feat traits
      expect(traitNames).toContain('Spellcasting');
      expect(traitNames).toContain('Wild Shape');
      expect(traitNames).toContain('Alert');

      // Should include beast species traits
      expect(traitNames).toContain('Keen Hearing');

      // Should NOT include druid species traits
      expect(traitNames).not.toContain('Darkvision');
    });

    it('should include all beast species actions', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        actions: [
          {
            name: 'Quarterstaff',
            actionType: 'Action',
            description: 'Melee weapon attack',
            source: 'class',
            className: 'Druid',
            levelRequirement: 1,
          },
        ],
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        actions: [
          {
            name: 'Bite',
            actionType: 'Action',
            description: 'Melee weapon attack',
            source: 'species',
          },
          {
            name: 'Claw',
            actionType: 'Action',
            description: 'Melee weapon attack',
            source: 'species',
          },
        ],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      const beastActionNames = wildshaped.actions
        .filter((a) => a.source === 'species')
        .map((a) => a.name);

      expect(beastActionNames).toContain('Bite');
      expect(beastActionNames).toContain('Claw');
    });

    it('should include druid class and feat actions', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        actions: [
          {
            name: 'Wild Shape',
            actionType: 'Bonus Action',
            description: 'Transform into beast',
            source: 'class',
            className: 'Druid',
            levelRequirement: 2,
          },
          {
            name: 'Second Wind',
            actionType: 'Bonus Action',
            description: 'From multiclass',
            source: 'class',
            className: 'Fighter',
            levelRequirement: 1,
          },
          {
            name: 'Grappler Attack',
            actionType: 'Action',
            description: 'From feat',
            source: 'feat',
          },
        ],
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        actions: [
          {
            name: 'Bite',
            actionType: 'Action',
            description: 'Melee weapon attack',
            source: 'species',
          },
        ],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      const actionNames = wildshaped.actions.map((a) => a.name);

      // Should include druid class and feat actions
      expect(actionNames).toContain('Wild Shape');
      expect(actionNames).toContain('Second Wind');
      expect(actionNames).toContain('Grappler Attack');

      // Should include beast species actions
      expect(actionNames).toContain('Bite');
    });
  });

  describe('Retained druid properties', () => {
    it('should retain druid progression properties', () => {
      const druid = createMockDruid({
        druidLevel: 8,
        totalCharacterLevel: 10,
        druidCircle: 'Circle of the Moon',
      });
      const beast = createFullMockBeast({ challengeRating: 2 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.druidLevel).toBe(8);
      expect(wildshaped.totalCharacterLevel).toBe(10);
      expect(wildshaped.druidCircle).toBe('Circle of the Moon');
    });

    it('should retain other class levels', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 7,
        otherClassLevels: { Fighter: 2 },
      });

      const beast = createFullMockBeast({ challengeRating: 0.5 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.otherClassLevels).toEqual({ Fighter: 2 });
    });

    it('should store references to source druid and beast', () => {
      const druid = createMockDruid({ druidLevel: 5 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.sourceDruid).toBe(druid);
      expect(wildshaped.sourceBeast).toBe(beast);
    });
  });

  describe('Edge cases', () => {
    it('should work for level 2 druid (minimum Wild Shape level)', () => {
      const druid = createMockDruid({ druidLevel: 2, totalCharacterLevel: 2 });
      const beast = createFullMockBeast({ challengeRating: 0.25 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.temporaryHitPoints).toBe(2);
      expect(wildshaped.druidLevel).toBe(2);
    });

    it('should work for Moon druid with high CR beast', () => {
      const druid = createMockDruid({
        druidLevel: 12,
        totalCharacterLevel: 12,
        druidCircle: 'Circle of the Moon',
      });
      const beast = createFullMockBeast({ challengeRating: 4 }); // CR 4 allowed at level 12

      const wildshaped = calculateWildshapedDruid(druid, beast);

      expect(wildshaped.druidCircle).toBe('Circle of the Moon');
      expect(wildshaped.sourceBeast.challengeRating).toBe(4);
    });

    it('should handle skills where neither druid nor beast is proficient', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        skillProficiencies: [
          { skill: 'Nature', proficiencyLevel: 'proficient' },
        ],
      });
      const beast = createFullMockBeast({
        challengeRating: 0.25,
        skillProficiencies: [],
      });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Athletics should use just the ability modifier (no proficiency)
      expect(wildshaped.skillBonuses['Athletics']).toBeDefined();
      expect(typeof wildshaped.skillBonuses['Athletics']).toBe('number');
    });

    it('should handle multiclass druid', () => {
      const druid = createMockDruid({
        druidLevel: 5,
        totalCharacterLevel: 8, // 5 druid + 3 other class
        otherClassLevels: { Ranger: 3 },
      });

      const beast = createFullMockBeast({ challengeRating: 0.5 });

      const wildshaped = calculateWildshapedDruid(druid, beast);

      // Should use total character level for proficiency bonus
      // Level 8: PB = +3
      expect(wildshaped.totalCharacterLevel).toBe(8);
      expect(wildshaped.druidLevel).toBe(5);
    });
  });

  describe('2014 vs 2024 Edition Differences', () => {
    describe('Hit Points and Hit Dice', () => {
      it('2024 should use druid HP, 2014 should use beast HP', () => {
        const druid2024 = createMockDruid({
          edition: '2024',
          druidLevel: 5,
          hitPoints: 35,
        });
        const beast2024 = createFullMockBeast({
          edition: '2024',
          challengeRating: 0.25,
          hitPoints: 11,
        });

        const druid2014 = createMockDruid({
          edition: '2014',
          druidLevel: 5,
          hitPoints: 35,
        });
        const beast2014 = createFullMockBeast({
          edition: '2014',
          challengeRating: 0.25,
          hitPoints: 11,
        });

        const wildshaped2024 = calculateWildshapedDruid(druid2024, beast2024);
        const wildshaped2014 = calculateWildshapedDruid(druid2014, beast2014);

        expect(wildshaped2024.hitPoints).toBe(35); // From druid
        expect(wildshaped2014.hitPoints).toBe(11); // From beast
      });

      it('2024 should use druid hit dice, 2014 should use beast hit dice', () => {
        const druid2024 = createMockDruid({
          edition: '2024',
          druidLevel: 5,
        });
        const beast2024 = createFullMockBeast({
          edition: '2024',
          challengeRating: 0.25,
        });

        const druid2014 = createMockDruid({
          edition: '2014',
          druidLevel: 5,
        });
        const beast2014 = createFullMockBeast({
          edition: '2014',
          challengeRating: 0.25,
        });

        const wildshaped2024 = calculateWildshapedDruid(druid2024, beast2024);
        const wildshaped2014 = calculateWildshapedDruid(druid2014, beast2014);

        expect(wildshaped2024.hitDice).toBe('5d8'); // From druid
        expect(wildshaped2014.hitDice).toBe('2d8+2'); // From beast
      });
    });

    describe('Temporary Hit Points', () => {
      it('2024 should gain temp HP equal to druid level', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
        });
        const beast = createFullMockBeast({
          edition: '2024',
          challengeRating: 1,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.temporaryHitPoints).toBe(8);
      });

      it('2014 should not gain any temp HP', () => {
        const druid = createMockDruid({
          edition: '2014',
          druidLevel: 8,
        });
        const beast = createFullMockBeast({
          edition: '2014',
          challengeRating: 1,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.temporaryHitPoints).toBe(0);
      });
    });

    describe('Traits and Actions Merging', () => {
      it('2024 should filter out druid species traits', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 5,
          traits: [
            {
              name: 'Fey Ancestry',
              description: 'From elf species',
              source: 'species',
            },
            {
              name: 'Spellcasting',
              description: 'From druid class',
              source: 'class',
              className: 'Druid',
              levelRequirement: 1,
            },
          ],
        });
        const beast = createFullMockBeast({
          edition: '2024',
          challengeRating: 0.25,
          traits: [
            {
              name: 'Keen Hearing',
              description: 'From wolf species',
              source: 'species',
            },
          ],
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).toContain('Keen Hearing'); // Beast species ✓
        expect(traitNames).toContain('Spellcasting'); // Druid class ✓
        expect(traitNames).not.toContain('Fey Ancestry'); // Druid species ✗
      });

      it('2014 should include ALL traits from both druid and beast', () => {
        const druid = createMockDruid({
          edition: '2014',
          druidLevel: 5,
          traits: [
            {
              name: 'Fey Ancestry',
              description: 'From elf species',
              source: 'species',
            },
            {
              name: 'Spellcasting',
              description: 'From druid class',
              source: 'class',
              className: 'Druid',
              levelRequirement: 1,
            },
          ],
        });
        const beast = createFullMockBeast({
          edition: '2014',
          challengeRating: 0.25,
          traits: [
            {
              name: 'Keen Hearing',
              description: 'From wolf species',
              source: 'species',
            },
          ],
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).toContain('Keen Hearing'); // Beast species ✓
        expect(traitNames).toContain('Spellcasting'); // Druid class ✓
        expect(traitNames).toContain('Fey Ancestry'); // Druid species ✓ (2014 keeps it!)
      });

      it('2024 should filter out druid species actions', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 5,
          actions: [
            {
              name: 'Weapon Attack',
              actionType: 'Action',
              description: 'From species weapon proficiency',
              source: 'species',
            },
            {
              name: 'Wild Shape',
              actionType: 'Bonus Action',
              description: 'From druid class',
              source: 'class',
              className: 'Druid',
              levelRequirement: 2,
            },
          ],
        });
        const beast = createFullMockBeast({
          edition: '2024',
          challengeRating: 0.25,
          actions: [
            {
              name: 'Bite',
              actionType: 'Action',
              description: 'From wolf species',
              source: 'species',
            },
          ],
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const actionNames = wildshaped.actions.map((a) => a.name);
        expect(actionNames).toContain('Bite'); // Beast species ✓
        expect(actionNames).toContain('Wild Shape'); // Druid class ✓
        expect(actionNames).not.toContain('Weapon Attack'); // Druid species ✗
      });

      it('2014 should include ALL actions from both druid and beast', () => {
        const druid = createMockDruid({
          edition: '2014',
          druidLevel: 5,
          actions: [
            {
              name: 'Weapon Attack',
              actionType: 'Action',
              description: 'From species weapon proficiency',
              source: 'species',
            },
            {
              name: 'Wild Shape',
              actionType: 'Bonus Action',
              description: 'From druid class',
              source: 'class',
              className: 'Druid',
              levelRequirement: 2,
            },
          ],
        });
        const beast = createFullMockBeast({
          edition: '2014',
          challengeRating: 0.25,
          actions: [
            {
              name: 'Bite',
              actionType: 'Action',
              description: 'From wolf species',
              source: 'species',
            },
          ],
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const actionNames = wildshaped.actions.map((a) => a.name);
        expect(actionNames).toContain('Bite'); // Beast species ✓
        expect(actionNames).toContain('Wild Shape'); // Druid class ✓
        expect(actionNames).toContain('Weapon Attack'); // Druid species ✓ (2014 keeps it!)
      });
    });

    describe('Senses (same for both editions)', () => {
      it('both editions should use beast senses only', () => {
        const druid2024 = createMockDruid({
          edition: '2024',
          druidLevel: 5,
        });
        const beast2024 = createFullMockBeast({
          edition: '2024',
          challengeRating: 0.25,
        });

        const druid2014 = createMockDruid({
          edition: '2014',
          druidLevel: 5,
        });
        const beast2014 = createFullMockBeast({
          edition: '2014',
          challengeRating: 0.25,
        });

        const wildshaped2024 = calculateWildshapedDruid(druid2024, beast2024);
        const wildshaped2014 = calculateWildshapedDruid(druid2014, beast2014);

        // Both should have beast's darkvision
        expect(wildshaped2024.senses.darkvision).toBe(60);
        expect(wildshaped2014.senses.darkvision).toBe(60);
      });
    });
  });

  describe('Equipment Compatibility in Wild Shape', () => {
    describe('Size compatibility', () => {
      it('should include equipment-sourced trait when beast size is within range', () => {
        const equipment: Equipment = {
          name: 'Ring of Protection',
          description: '+1 AC',
          type: 'ring',
          minSize: 'Small',
          maxSize: 'Large',
        };

        const druid = createMockDruid({
          equipment: [equipment],
          traits: [
            {
              name: 'Protection',
              description: '+1 AC from ring',
              source: 'equipment',
              equipmentName: 'Ring of Protection',
            },
          ],
        });

        const beast = createFullMockBeast({
          size: 'Medium', // Within Small-Large range
          bodyType: 'primate', // Can use rings
          challengeRating: 0.25,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).toContain('Protection');
      });

      it('should exclude equipment-sourced trait when beast is too small', () => {
        const equipment: Equipment = {
          name: 'Longsword',
          description: 'A longsword',
          type: 'weapon',
          minSize: 'Small',
          maxSize: 'Large',
        };

        const druid = createMockDruid({
          equipment: [equipment],
          actions: [
            {
              name: 'Longsword Attack',
              actionType: 'Action',
              description: 'Attack with longsword',
              source: 'equipment',
              equipmentName: 'Longsword',
            },
          ],
        });

        const beast = createFullMockBeast({
          size: 'Tiny', // Below Small minimum
          bodyType: 'primate',
          challengeRating: 0.25,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const actionNames = wildshaped.actions.map((a) => a.name);
        expect(actionNames).not.toContain('Longsword Attack');
      });

      it('should exclude equipment-sourced trait when beast is too large', () => {
        const equipment: Equipment = {
          name: 'Small Ring',
          description: 'A tiny ring',
          type: 'ring',
          minSize: 'Tiny',
          maxSize: 'Medium',
        };

        const druid = createMockDruid({
          druidLevel: 9,
          totalCharacterLevel: 9,
          druidCircle: 'Circle of the Moon',
          equipment: [equipment],
          traits: [
            {
              name: 'Small Ring Benefit',
              description: 'Benefit from tiny ring',
              source: 'equipment',
              equipmentName: 'Small Ring',
            },
          ],
        });

        const beast = createFullMockBeast({
          size: 'Huge', // Above Medium maximum
          bodyType: 'primate',
          challengeRating: 2,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).not.toContain('Small Ring Benefit');
      });
    });

    describe('Body type compatibility', () => {
      const createTestScenario = (
        bodyType: BodyType,
        equipmentType: EquipmentType
      ) => {
        const equipment: Equipment = {
          name: `Test ${equipmentType}`,
          description: `A test ${equipmentType}`,
          type: equipmentType,
          minSize: 'Tiny',
          maxSize: 'Gargantuan',
        };

        const druid = createMockDruid({
          equipment: [equipment],
          traits: [
            {
              name: `${equipmentType} Trait`,
              description: `Trait from ${equipmentType}`,
              source: 'equipment',
              equipmentName: `Test ${equipmentType}`,
            },
          ],
        });

        const beast = createFullMockBeast({
          size: 'Medium',
          bodyType: bodyType,
          challengeRating: 0.25,
        });

        return { druid, beast };
      };

      it('primate should use all equipment types', () => {
        const types: EquipmentType[] = [
          'armor',
          'shield',
          'ring',
          'weapon',
          'clothing',
          'other',
        ];

        for (const type of types) {
          const { druid, beast } = createTestScenario('primate', type);
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).toContain(`${type} Trait`);
        }
      });

      it('octopus should use rings, weapons, and shields only', () => {
        // Can use
        ['ring', 'weapon', 'shield'].forEach((type) => {
          const { druid, beast } = createTestScenario(
            'octopus',
            type as EquipmentType
          );
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).toContain(`${type} Trait`);
        });

        // Cannot use
        ['armor', 'clothing', 'other'].forEach((type) => {
          const { druid, beast } = createTestScenario(
            'octopus',
            type as EquipmentType
          );
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).not.toContain(`${type} Trait`);
        });
      });

      it('bird should use rings only', () => {
        // Can use
        const { druid: druid1, beast: beast1 } = createTestScenario(
          'bird',
          'ring'
        );
        const wildshaped1 = calculateWildshapedDruid(druid1, beast1);
        expect(wildshaped1.traits.map((t) => t.name)).toContain('ring Trait');

        // Cannot use
        ['armor', 'shield', 'weapon', 'clothing', 'other'].forEach((type) => {
          const { druid, beast } = createTestScenario(
            'bird',
            type as EquipmentType
          );
          const wildshaped = calculateWildshapedDruid(druid, beast);
          expect(wildshaped.traits.map((t) => t.name)).not.toContain(
            `${type} Trait`
          );
        });
      });

      it('lizard should use rings only', () => {
        // Can use
        const { druid: druid1, beast: beast1 } = createTestScenario(
          'lizard',
          'ring'
        );
        const wildshaped1 = calculateWildshapedDruid(druid1, beast1);
        expect(wildshaped1.traits.map((t) => t.name)).toContain('ring Trait');

        // Cannot use
        ['armor', 'shield', 'weapon', 'clothing', 'other'].forEach((type) => {
          const { druid, beast } = createTestScenario(
            'lizard',
            type as EquipmentType
          );
          const wildshaped = calculateWildshapedDruid(druid, beast);
          expect(wildshaped.traits.map((t) => t.name)).not.toContain(
            `${type} Trait`
          );
        });
      });

      it('snake should use rings only', () => {
        // Can use
        const { druid: druid1, beast: beast1 } = createTestScenario(
          'snake',
          'ring'
        );
        const wildshaped1 = calculateWildshapedDruid(druid1, beast1);
        expect(wildshaped1.traits.map((t) => t.name)).toContain('ring Trait');

        // Cannot use
        ['armor', 'shield', 'weapon', 'clothing', 'other'].forEach((type) => {
          const { druid, beast } = createTestScenario(
            'snake',
            type as EquipmentType
          );
          const wildshaped = calculateWildshapedDruid(druid, beast);
          expect(wildshaped.traits.map((t) => t.name)).not.toContain(
            `${type} Trait`
          );
        });
      });

      it('fish should not use any equipment', () => {
        const types: EquipmentType[] = [
          'armor',
          'shield',
          'ring',
          'weapon',
          'clothing',
          'other',
        ];

        for (const type of types) {
          const { druid, beast } = createTestScenario('fish', type);
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).not.toContain(`${type} Trait`);
        }
      });

      it('insect should not use any equipment', () => {
        const types: EquipmentType[] = [
          'armor',
          'shield',
          'ring',
          'weapon',
          'clothing',
          'other',
        ];

        for (const type of types) {
          const { druid, beast } = createTestScenario('insect', type);
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).not.toContain(`${type} Trait`);
        }
      });

      it('quadruped should not use any equipment', () => {
        const types: EquipmentType[] = [
          'armor',
          'shield',
          'ring',
          'weapon',
          'clothing',
          'other',
        ];

        for (const type of types) {
          const { druid, beast } = createTestScenario('quadruped', type);
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).not.toContain(`${type} Trait`);
        }
      });

      it('unassigned should not use any equipment', () => {
        const types: EquipmentType[] = [
          'armor',
          'shield',
          'ring',
          'weapon',
          'clothing',
          'other',
        ];

        for (const type of types) {
          const { druid, beast } = createTestScenario('unassigned', type);
          const wildshaped = calculateWildshapedDruid(druid, beast);
          const traitNames = wildshaped.traits.map((t) => t.name);
          expect(traitNames).not.toContain(`${type} Trait`);
        }
      });
    });

    describe('Missing equipment handling', () => {
      it('should skip equipment-sourced trait when equipment not found', () => {
        const druid = createMockDruid({
          equipment: [], // No equipment
          traits: [
            {
              name: 'Mystery Trait',
              description: 'From missing equipment',
              source: 'equipment',
              equipmentName: 'Nonexistent Ring',
            },
          ],
        });

        const beast = createFullMockBeast({
          size: 'Medium',
          bodyType: 'primate',
          challengeRating: 0.25,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).not.toContain('Mystery Trait');
      });
    });

    describe('2014 edition equipment compatibility', () => {
      it('should filter equipment by compatibility in 2014 edition', () => {
        const ring: Equipment = {
          name: 'Ring of Swimming',
          description: 'Grants swimming ability',
          type: 'ring',
          minSize: 'Tiny',
          maxSize: 'Large',
        };

        const armor: Equipment = {
          name: 'Plate Armor',
          description: '+18 AC',
          type: 'armor',
          minSize: 'Medium',
          maxSize: 'Large',
        };

        const druid = createMockDruid({
          edition: '2014',
          equipment: [ring, armor],
          traits: [
            {
              name: 'Swimming',
              description: 'From ring',
              source: 'equipment',
              equipmentName: 'Ring of Swimming',
            },
            {
              name: 'Heavy Armor',
              description: 'From armor',
              source: 'equipment',
              equipmentName: 'Plate Armor',
            },
          ],
        });

        const beast = createFullMockBeast({
          edition: '2014',
          size: 'Medium',
          bodyType: 'bird', // Can only use rings
          challengeRating: 0.25,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        const traitNames = wildshaped.traits.map((t) => t.name);
        expect(traitNames).toContain('Swimming'); // Ring - compatible
        expect(traitNames).not.toContain('Heavy Armor'); // Armor - not compatible
      });
    });
  });

  describe('2024 Circle of the Moon specific rules', () => {
    describe('Temporary hit points', () => {
      it('should give 3x druid level temp HP for 2024 Moon druid', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
          druidCircle: 'Circle of the Moon',
        });
        const beast = createFullMockBeast({ challengeRating: 1 });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.temporaryHitPoints).toBe(24); // 3 × 8
      });

      it('should give 1x druid level temp HP for non-Moon 2024 druid', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
          druidCircle: null,
        });
        const beast = createFullMockBeast({ challengeRating: 1 });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.temporaryHitPoints).toBe(8); // 1 × 8
      });

      it('should give no temp HP for 2014 Moon druid', () => {
        const druid = createMockDruid({
          edition: '2014',
          druidLevel: 8,
          druidCircle: 'Circle of the Moon',
        });
        const beast = createFullMockBeast({
          edition: '2014',
          challengeRating: 1,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.temporaryHitPoints).toBe(0);
      });
    });

    describe('Armor class', () => {
      it('should use 13 + Wisdom mod when it exceeds beast AC for 2024 Moon druid', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
          druidCircle: 'Circle of the Moon',
          wisdom: 20, // +5 mod → AC 18
        });
        const beast = createFullMockBeast({
          challengeRating: 1,
          armorClass: 13,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.armorClass).toBe(18); // 13 + 5 = 18 > 13
      });

      it('should use beast AC when it exceeds 13 + Wisdom mod for 2024 Moon druid', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
          druidCircle: 'Circle of the Moon',
          wisdom: 10, // +0 mod → AC 13
        });
        const beast = createFullMockBeast({
          challengeRating: 1,
          armorClass: 15,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.armorClass).toBe(15); // 15 > 13 + 0 = 13
      });

      it('should use beast AC unchanged for non-Moon 2024 druid', () => {
        const druid = createMockDruid({
          edition: '2024',
          druidLevel: 8,
          druidCircle: null,
          wisdom: 20, // +5 mod
        });
        const beast = createFullMockBeast({
          challengeRating: 1,
          armorClass: 13,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.armorClass).toBe(13); // No Moon bonus
      });

      it('should use beast AC unchanged for 2014 Moon druid', () => {
        const druid = createMockDruid({
          edition: '2014',
          druidLevel: 8,
          druidCircle: 'Circle of the Moon',
          wisdom: 20, // +5 mod
        });
        const beast = createFullMockBeast({
          edition: '2014',
          challengeRating: 1,
          armorClass: 13,
        });

        const wildshaped = calculateWildshapedDruid(druid, beast);

        expect(wildshaped.armorClass).toBe(13); // Rule is 2024-only
      });
    });
  });
});
