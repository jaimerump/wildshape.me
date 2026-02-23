/**
 * Class feature filtering utilities.
 * Generic: works for any DnDClass, not druid-specific.
 */

import type { DnDClass, ClassTrait, ClassAction } from '../../models';

/**
 * Returns traits from a class definition that a character qualifies for,
 * given their level and optional subclass name.
 *
 * A feature is included if:
 * - feature.levelRequirement <= level
 * - AND either:
 *   - The feature has no subclass (base class feature), OR
 *   - The feature has a subclass AND subclassName matches AND level >= classDef.subclassUnlockLevel
 *
 * @param classDef - The class definition with all traits
 * @param level - The character's level in this class
 * @param subclassName - The character's subclass name, or null if none
 * @returns Traits the character qualifies for
 */
export function getActiveClassTraits(
  classDef: DnDClass,
  level: number,
  subclassName: string | null
): ClassTrait[] {
  return classDef.traits.filter((trait) => {
    if (trait.levelRequirement > level) {
      return false;
    }

    if (trait.subclass === undefined) {
      // Base class feature — no subclass required
      return true;
    }

    // Subclass feature: requires matching subclass and subclass unlock level
    return (
      subclassName !== null &&
      trait.subclass === subclassName &&
      level >= classDef.subclassUnlockLevel
    );
  });
}

/**
 * Returns actions from a class definition that a character qualifies for,
 * given their level and optional subclass name.
 *
 * A feature is included if:
 * - feature.levelRequirement <= level
 * - AND either:
 *   - The feature has no subclass (base class feature), OR
 *   - The feature has a subclass AND subclassName matches AND level >= classDef.subclassUnlockLevel
 *
 * @param classDef - The class definition with all actions
 * @param level - The character's level in this class
 * @param subclassName - The character's subclass name, or null if none
 * @returns Actions the character qualifies for
 */
export function getActiveClassActions(
  classDef: DnDClass,
  level: number,
  subclassName: string | null
): ClassAction[] {
  return classDef.actions.filter((action) => {
    if (action.levelRequirement > level) {
      return false;
    }

    if (action.subclass === undefined) {
      // Base class feature — no subclass required
      return true;
    }

    // Subclass feature: requires matching subclass and subclass unlock level
    return (
      subclassName !== null &&
      action.subclass === subclassName &&
      level >= classDef.subclassUnlockLevel
    );
  });
}
