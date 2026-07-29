import { describe, it, expect } from '@jest/globals';
import { migrateDruidStorage, recordFromDefaults } from '../migrateDruidStore';

describe('migrateDruidStorage', () => {
  it('wraps a legacy (version 0) flat druid state into a single-druid multi-druid shape', () => {
    const legacy = {
      edition: '2014',
      druidLevel: 5,
      druidCircle: 'Circle of the Moon',
      strength: 14,
      dexterity: 12,
      constitution: 13,
      intelligence: 8,
      wisdom: 16,
      charisma: 10,
      savingThrowProficiencies: ['intelligence', 'wisdom'],
      savingThrowOverrides: {},
      skillProficiencies: [{ skill: 'Nature', proficiencyLevel: 'proficient' }],
      skillOverrides: {},
      traitChoices: { someGroup: 'Choice A' },
    };

    const migrated = migrateDruidStorage(legacy, 0);

    expect(migrated.name).toBe('My Druid');
    expect(migrated.edition).toBe('2014');
    expect(migrated.druidLevel).toBe(5);
    expect(migrated.druidCircle).toBe('Circle of the Moon');
    expect(migrated.strength).toBe(14);
    expect(migrated.wisdom).toBe(16);
    expect(migrated.skillProficiencies).toEqual([
      { skill: 'Nature', proficiencyLevel: 'proficient' },
    ]);
    expect(migrated.traitChoices).toEqual({ someGroup: 'Choice A' });

    expect(migrated.druidOrder).toEqual([migrated.id]);
    expect(migrated.activeDruidId).toBe(migrated.id);
    expect(Object.keys(migrated.druids)).toEqual([migrated.id]);
    expect(migrated.druids[migrated.id]).toMatchObject({
      name: 'My Druid',
      edition: '2014',
      druidLevel: 5,
    });
  });

  it('falls back to store defaults when persisted state is missing or empty', () => {
    const migrated = migrateDruidStorage(undefined, 0);

    expect(migrated.name).toBe('My Druid');
    expect(migrated.edition).toBe('2024');
    expect(migrated.druidLevel).toBe(2);
    expect(migrated.druidCircle).toBeNull();
    expect(migrated.strength).toBe(10);
  });

  it('passes through unchanged when already at version 1', () => {
    const record = recordFromDefaults('Already Migrated');
    const alreadyMigrated = {
      ...record,
      druids: { [record.id]: record },
      druidOrder: [record.id],
      activeDruidId: record.id,
    };

    expect(migrateDruidStorage(alreadyMigrated, 1)).toBe(alreadyMigrated);
  });
});

describe('recordFromDefaults', () => {
  it('produces a druid record with default stats and a unique id', () => {
    const a = recordFromDefaults('Alice');
    const b = recordFromDefaults('Bob');

    expect(a.name).toBe('Alice');
    expect(a.edition).toBe('2024');
    expect(a.druidLevel).toBe(2);
    expect(a.druidCircle).toBeNull();
    expect(a.strength).toBe(10);
    expect(a.savingThrowProficiencies).toEqual(['intelligence', 'wisdom']);
    expect(a.id).not.toBe(b.id);
  });
});
