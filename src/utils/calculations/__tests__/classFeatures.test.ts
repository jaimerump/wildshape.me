import { describe, it, expect } from '@jest/globals';
import { getActiveClassTraits, getActiveClassActions } from '../classFeatures';
import type { DnDClass, ClassTrait, ClassAction } from '../../../models';

// Helper to build a minimal DnDClass for testing
function makeDnDClass(
  overrides: Partial<DnDClass> & {
    traits?: ClassTrait[];
    actions?: ClassAction[];
  }
): DnDClass {
  return {
    name: 'TestClass',
    edition: '2024',
    subclassUnlockLevel: 3,
    traits: [],
    actions: [],
    ...overrides,
  };
}

function makeTrait(
  name: string,
  levelRequirement: number,
  subclass?: string
): ClassTrait {
  return {
    source: 'class',
    name,
    description: `${name} description`,
    className: 'TestClass',
    levelRequirement,
    ...(subclass !== undefined ? { subclass } : {}),
  };
}

function makeAction(
  name: string,
  levelRequirement: number,
  subclass?: string
): ClassAction {
  return {
    source: 'class',
    name,
    actionType: 'Action',
    description: `${name} description`,
    className: 'TestClass',
    levelRequirement,
    ...(subclass !== undefined ? { subclass } : {}),
  };
}

// ── getActiveClassTraits ────────────────────────────────────────────────────

describe('getActiveClassTraits', () => {
  it('excludes base class traits whose levelRequirement exceeds character level', () => {
    const classDef = makeDnDClass({
      traits: [makeTrait('High Level Feature', 10)],
    });

    const result = getActiveClassTraits(classDef, 5, null);

    expect(result.map((t) => t.name)).not.toContain('High Level Feature');
  });

  it('includes base class traits at exactly the levelRequirement', () => {
    const classDef = makeDnDClass({
      traits: [makeTrait('Core Feature', 5)],
    });

    const result = getActiveClassTraits(classDef, 5, null);

    expect(result.map((t) => t.name)).toContain('Core Feature');
  });

  it('includes base class traits above the levelRequirement', () => {
    const classDef = makeDnDClass({
      traits: [makeTrait('Core Feature', 3)],
    });

    const result = getActiveClassTraits(classDef, 10, null);

    expect(result.map((t) => t.name)).toContain('Core Feature');
  });

  it('excludes subclass traits when character has no subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      traits: [makeTrait('Moon Feature', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassTraits(classDef, 5, null);

    expect(result.map((t) => t.name)).not.toContain('Moon Feature');
  });

  it('excludes subclass traits before subclassUnlockLevel even with matching subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      traits: [makeTrait('Moon Feature', 3, 'Circle of the Moon')],
    });

    // Level 2 is before subclassUnlockLevel of 3
    const result = getActiveClassTraits(classDef, 2, 'Circle of the Moon');

    expect(result.map((t) => t.name)).not.toContain('Moon Feature');
  });

  it('excludes subclass traits for a different subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      traits: [makeTrait('Moon Feature', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassTraits(classDef, 5, 'Circle of the Land');

    expect(result.map((t) => t.name)).not.toContain('Moon Feature');
  });

  it('includes subclass traits for the matching subclass at or above subclassUnlockLevel', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      traits: [makeTrait('Moon Feature', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassTraits(classDef, 3, 'Circle of the Moon');

    expect(result.map((t) => t.name)).toContain('Moon Feature');
  });

  it('returns the correct combined set for a representative character', () => {
    // subclassUnlockLevel = 3, character is level 5 with Circle of the Moon
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      traits: [
        makeTrait('Base L1', 1), // ✓ base, met
        makeTrait('Base L10', 10), // ✗ base, not yet met
        makeTrait('Moon L3', 3, 'Circle of the Moon'), // ✓ matching subclass
        makeTrait('Land L3', 3, 'Circle of the Land'), // ✗ wrong subclass
        makeTrait('Moon L6', 6, 'Circle of the Moon'), // ✗ subclass but level too low
      ],
    });

    const result = getActiveClassTraits(classDef, 5, 'Circle of the Moon');
    const names = result.map((t) => t.name);

    expect(names).toContain('Base L1');
    expect(names).not.toContain('Base L10');
    expect(names).toContain('Moon L3');
    expect(names).not.toContain('Land L3');
    expect(names).not.toContain('Moon L6');
  });
});

// ── getActiveClassActions ───────────────────────────────────────────────────

describe('getActiveClassActions', () => {
  it('excludes base class actions whose levelRequirement exceeds character level', () => {
    const classDef = makeDnDClass({
      actions: [makeAction('High Level Action', 10)],
    });

    const result = getActiveClassActions(classDef, 5, null);

    expect(result.map((a) => a.name)).not.toContain('High Level Action');
  });

  it('includes base class actions at exactly the levelRequirement', () => {
    const classDef = makeDnDClass({
      actions: [makeAction('Core Action', 5)],
    });

    const result = getActiveClassActions(classDef, 5, null);

    expect(result.map((a) => a.name)).toContain('Core Action');
  });

  it('includes base class actions above the levelRequirement', () => {
    const classDef = makeDnDClass({
      actions: [makeAction('Core Action', 2)],
    });

    const result = getActiveClassActions(classDef, 8, null);

    expect(result.map((a) => a.name)).toContain('Core Action');
  });

  it('excludes subclass actions when character has no subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      actions: [makeAction('Moon Action', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassActions(classDef, 5, null);

    expect(result.map((a) => a.name)).not.toContain('Moon Action');
  });

  it('excludes subclass actions before subclassUnlockLevel even with matching subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      actions: [makeAction('Moon Action', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassActions(classDef, 2, 'Circle of the Moon');

    expect(result.map((a) => a.name)).not.toContain('Moon Action');
  });

  it('excludes subclass actions for a different subclass', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      actions: [makeAction('Moon Action', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassActions(classDef, 5, 'Circle of the Land');

    expect(result.map((a) => a.name)).not.toContain('Moon Action');
  });

  it('includes subclass actions for the matching subclass at or above subclassUnlockLevel', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      actions: [makeAction('Moon Action', 3, 'Circle of the Moon')],
    });

    const result = getActiveClassActions(classDef, 3, 'Circle of the Moon');

    expect(result.map((a) => a.name)).toContain('Moon Action');
  });

  it('returns the correct combined set for a representative character', () => {
    const classDef = makeDnDClass({
      subclassUnlockLevel: 3,
      actions: [
        makeAction('Base L1', 1),
        makeAction('Base L10', 10),
        makeAction('Moon L3', 3, 'Circle of the Moon'),
        makeAction('Land L3', 3, 'Circle of the Land'),
        makeAction('Moon L6', 6, 'Circle of the Moon'),
      ],
    });

    const result = getActiveClassActions(classDef, 5, 'Circle of the Moon');
    const names = result.map((a) => a.name);

    expect(names).toContain('Base L1');
    expect(names).not.toContain('Base L10');
    expect(names).toContain('Moon L3');
    expect(names).not.toContain('Land L3');
    expect(names).not.toContain('Moon L6');
  });
});
