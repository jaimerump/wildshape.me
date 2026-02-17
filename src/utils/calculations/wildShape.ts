/**
 * Wild Shape eligibility calculation utilities
 * Supports D&D 5e 2024 and 2014 edition rules
 */

import type {
  Beast,
  Druid,
  WildShapeEligibility,
  WildshapedDruid,
  DruidCircle,
  Edition,
  AbilityName,
  SkillProficiency,
  ProficiencyLevel,
  Trait,
  Action,
} from '../../models';
import {
  getProficiencyBonusFromLevel,
  getProficiencyBonusFromCR,
} from './proficiencyBonus';
import { getSkillBonus } from './skills';
import { getSavingThrowBonus } from './savingThrows';

/**
 * Gets the maximum CR a druid can Wild Shape into at their level.
 *
 * D&D 5e Base Druid (both editions):
 * - Level 2-3: CR ≤ 1/4
 * - Level 4-7: CR ≤ 1/2
 * - Level 8+: CR ≤ 1
 *
 * Circle of the Moon druids:
 * - 2024: Max CR = max(base druid CR, floor(druid level / 3))
 * - 2014: Level 2 gets CR 1 (special case), Level 3+ uses floor(druid level / 3)
 * - Moon druids never get worse than base druids, but can exceed base limits
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns The maximum CR
 *
 * @example
 * getMaxWildShapeCR(2, '2024')  // returns 0.25 (CR 1/4)
 * getMaxWildShapeCR(5, '2024')  // returns 0.5 (CR 1/2)
 * getMaxWildShapeCR(10, '2024') // returns 1 (CR 1)
 * getMaxWildShapeCR(6, '2024', 'Circle of the Moon')  // returns 2 (CR 2)
 * getMaxWildShapeCR(2, '2014', 'Circle of the Moon')  // returns 1 (CR 1, special 2014 rule)
 */
export function getMaxWildShapeCR(
  druidLevel: number,
  edition: Edition,
  druidCircle?: DruidCircle | null
): number {
  // Calculate base druid CR
  let baseCR: number;
  if (druidLevel >= 8) {
    baseCR = 1;
  } else if (druidLevel >= 4) {
    baseCR = 0.5;
  } else {
    baseCR = 0.25;
  }

  // If Circle of the Moon, use max of base CR or Moon formula
  if (druidCircle === 'Circle of the Moon') {
    // 2014 edition special case: Moon druids get CR 1 at level 2
    if (edition === '2014' && druidLevel === 2) {
      return 1;
    }

    const moonCR = Math.floor(druidLevel / 3);
    return Math.max(baseCR, moonCR);
  }

  // Otherwise use base druid rules
  return baseCR;
}

/**
 * Checks if a druid can Wild Shape into beasts with flying speed.
 *
 * D&D 5e Rule (both editions): Flying forms available at level 8+
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @returns true if flying forms are allowed
 *
 * @example
 * canWildShapeFlying(5, '2024')  // returns false
 * canWildShapeFlying(8, '2024')  // returns true
 */
export function canWildShapeFlying(
  druidLevel: number,
  _edition: Edition
): boolean {
  // Both editions have the same rule: flying at level 8+
  return druidLevel >= 8;
}

/**
 * Checks if a druid can Wild Shape into beasts with swimming speed.
 *
 * D&D 5e Rules:
 * - 2024: No restriction (can swim at any Wild Shape level)
 * - 2014: Swimming forms available at level 4+
 *
 * @param druidLevel - The druid's level (1-20)
 * @param edition - The D&D edition ('2024' or '2014')
 * @returns true if swimming forms are allowed
 *
 * @example
 * canWildShapeSwimming(3, '2024')  // returns true (no restriction)
 * canWildShapeSwimming(3, '2014')  // returns false
 * canWildShapeSwimming(4, '2014')  // returns true
 */
export function canWildShapeSwimming(
  druidLevel: number,
  edition: Edition
): boolean {
  // 2024 edition: no swimming restriction
  if (edition === '2024') {
    return true;
  }

  // 2014 edition: swimming available at level 4+
  return druidLevel >= 4;
}

/**
 * Determines if a druid can Wild Shape into a specific beast.
 *
 * D&D 5e Rules (base druid):
 * - Level 2-3: CR ≤ 1/4, no flying speed
 *   - 2024: no swimming restriction
 *   - 2014: no swimming speed
 * - Level 4-7: CR ≤ 1/2, no flying speed
 * - Level 8+: CR ≤ 1, any movement
 *
 * Circle of the Moon druids have higher CR limits (see getMaxWildShapeCR),
 * but still respect the same level-based movement restrictions.
 *
 * @param druidLevel - The druid's level (1-20)
 * @param beast - The beast to check eligibility for
 * @param edition - The D&D edition ('2024' or '2014')
 * @param druidCircle - Optional druid circle (affects CR for Circle of the Moon)
 * @returns Object with { canTransform: boolean, reason?: string }
 *
 * @example
 * const wolf = { challengeRating: 0.25, movement: { walking: 40 } };
 * canWildShapeInto(2, wolf, '2024')
 * // returns { canTransform: true }
 *
 * const eagle = { challengeRating: 0, movement: { walking: 10, flying: 60 } };
 * canWildShapeInto(2, eagle, '2024')
 * // returns { canTransform: false, reason: "Cannot fly until level 8" }
 *
 * const direWolf = { challengeRating: 1, movement: { walking: 50 } };
 * canWildShapeInto(3, direWolf, '2024', 'Circle of the Moon')
 * // returns { canTransform: true } - 2024 Moon druid can transform into CR 1 at level 3
 *
 * canWildShapeInto(2, direWolf, '2014', 'Circle of the Moon')
 * // returns { canTransform: true } - 2014 Moon druid can transform into CR 1 at level 2
 */
export function canWildShapeInto(
  druidLevel: number,
  beast: Pick<Beast, 'challengeRating' | 'movement'>,
  edition: Edition,
  druidCircle?: DruidCircle | null
): WildShapeEligibility {
  // Check CR restriction
  const maxCR = getMaxWildShapeCR(druidLevel, edition, druidCircle);
  if (beast.challengeRating > maxCR) {
    return {
      canTransform: false,
      reason: `CR ${beast.challengeRating} is too high. Maximum CR at level ${druidLevel} is ${maxCR}.`,
    };
  }

  // Check flying restriction
  if (beast.movement.flying && !canWildShapeFlying(druidLevel, edition)) {
    return {
      canTransform: false,
      reason: `Cannot fly until level 8. Current level: ${druidLevel}.`,
    };
  }

  // Check swimming restriction
  if (beast.movement.swimming && !canWildShapeSwimming(druidLevel, edition)) {
    const swimLevel =
      edition === '2014' ? 4 : 'never (2024 has no restriction)';
    return {
      canTransform: false,
      reason: `Cannot swim until level ${swimLevel}. Current level: ${druidLevel}.`,
    };
  }

  // All checks passed
  return {
    canTransform: true,
  };
}

/**
 * List of all 18 D&D 5e skills
 */
const ALL_SKILLS = [
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

/**
 * List of all 6 D&D 5e abilities
 */
const ALL_ABILITIES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

/**
 * Merges skill bonuses between druid and beast, using the higher value.
 *
 * D&D 5e 2024 Wild Shape Rule: Use the higher skill bonus between
 * the druid (with hybrid ability scores) and the beast (with original ability scores).
 *
 * @param druidSkillProfs - Druid's skill proficiencies
 * @param beastSkillProfs - Beast's skill proficiencies
 * @param hybridAbilities - Hybrid ability scores (physical from beast, mental from druid)
 * @param beastAbilities - Beast's original ability scores
 * @param druidPB - Druid's proficiency bonus
 * @param beastPB - Beast's proficiency bonus
 * @returns Record of skill name to final bonus
 */
function mergeSkillBonuses(
  druidSkillProfs: SkillProficiency[],
  beastSkillProfs: SkillProficiency[],
  hybridAbilities: Record<AbilityName, number>,
  beastAbilities: Record<AbilityName, number>,
  druidPB: number,
  beastPB: number
): Record<string, number> {
  const finalBonuses: Record<string, number> = {};

  // Create maps for faster lookup
  const druidProfMap = new Map<string, ProficiencyLevel>();
  for (const prof of druidSkillProfs) {
    druidProfMap.set(prof.skill, prof.proficiencyLevel);
  }

  const beastProfMap = new Map<string, ProficiencyLevel>();
  for (const prof of beastSkillProfs) {
    beastProfMap.set(prof.skill, prof.proficiencyLevel);
  }

  // Calculate for each skill
  for (const skill of ALL_SKILLS) {
    // Calculate druid's bonus with hybrid abilities
    const druidProfLevel = druidProfMap.get(skill) || null;
    const druidBonus = getSkillBonus(
      skill,
      hybridAbilities,
      druidPB,
      druidProfLevel
    );

    // Calculate beast's bonus with original abilities
    const beastProfLevel = beastProfMap.get(skill) || null;
    const beastBonus = getSkillBonus(
      skill,
      beastAbilities,
      beastPB,
      beastProfLevel
    );

    // Use the higher value
    finalBonuses[skill] = Math.max(druidBonus, beastBonus);
  }

  return finalBonuses;
}

/**
 * Merges saving throw bonuses between druid and beast, using the higher value.
 *
 * D&D 5e 2024 Wild Shape Rule: Use the higher saving throw bonus between
 * the druid (with hybrid ability scores) and the beast (with original ability scores).
 *
 * @param druidSaveProfs - Druid's saving throw proficiencies
 * @param beastSaveProfs - Beast's saving throw proficiencies
 * @param hybridAbilities - Hybrid ability scores (physical from beast, mental from druid)
 * @param beastAbilities - Beast's original ability scores
 * @param druidPB - Druid's proficiency bonus
 * @param beastPB - Beast's proficiency bonus
 * @returns Record of ability name to final bonus
 */
function mergeSavingThrowBonuses(
  druidSaveProfs: AbilityName[],
  beastSaveProfs: AbilityName[],
  hybridAbilities: Record<AbilityName, number>,
  beastAbilities: Record<AbilityName, number>,
  druidPB: number,
  beastPB: number
): Record<AbilityName, number> {
  const finalBonuses: Record<string, number> = {};

  for (const ability of ALL_ABILITIES) {
    // Calculate druid's save with hybrid abilities
    const druidProficient = druidSaveProfs.includes(ability);
    const druidBonus = getSavingThrowBonus(
      hybridAbilities[ability],
      druidPB,
      druidProficient
    );

    // Calculate beast's save with original abilities
    const beastProficient = beastSaveProfs.includes(ability);
    const beastBonus = getSavingThrowBonus(
      beastAbilities[ability],
      beastPB,
      beastProficient
    );

    // Use the higher value
    finalBonuses[ability] = Math.max(druidBonus, beastBonus);
  }

  return finalBonuses as Record<AbilityName, number>;
}

/**
 * Merges saving throw proficiencies for reference.
 * Includes abilities where either druid or beast is proficient.
 *
 * @param druidSaveProfs - Druid's saving throw proficiencies
 * @param beastSaveProfs - Beast's saving throw proficiencies
 * @returns Combined list of proficient abilities
 */
function mergeSavingThrowProficiencies(
  druidSaveProfs: AbilityName[],
  beastSaveProfs: AbilityName[]
): AbilityName[] {
  const profSet = new Set<AbilityName>();

  for (const ability of druidSaveProfs) {
    profSet.add(ability);
  }

  for (const ability of beastSaveProfs) {
    profSet.add(ability);
  }

  return Array.from(profSet);
}

/**
 * Merges skill proficiencies for reference.
 * Prefers beast's proficiency level if beast has higher total bonus.
 *
 * @param druidSkillProfs - Druid's skill proficiencies
 * @param beastSkillProfs - Beast's skill proficiencies
 * @param skillBonuses - Final merged skill bonuses
 * @param hybridAbilities - Hybrid ability scores
 * @param beastAbilities - Beast's original ability scores
 * @param druidPB - Druid's proficiency bonus
 * @param beastPB - Beast's proficiency bonus
 * @returns Combined list of skill proficiencies
 */
function mergeSkillProficiencies(
  druidSkillProfs: SkillProficiency[],
  beastSkillProfs: SkillProficiency[],
  skillBonuses: Record<string, number>,
  hybridAbilities: Record<AbilityName, number>,
  beastAbilities: Record<AbilityName, number>,
  druidPB: number,
  beastPB: number
): SkillProficiency[] {
  const profMap = new Map<string, SkillProficiency>();

  // Add druid proficiencies
  for (const prof of druidSkillProfs) {
    profMap.set(prof.skill, prof);
  }

  // Add or override with beast proficiencies if beast has higher bonus
  for (const beastProf of beastSkillProfs) {
    const druidBonus = getSkillBonus(
      beastProf.skill,
      hybridAbilities,
      druidPB,
      profMap.get(beastProf.skill)?.proficiencyLevel || null
    );
    const beastBonus = getSkillBonus(
      beastProf.skill,
      beastAbilities,
      beastPB,
      beastProf.proficiencyLevel
    );

    // If beast has higher bonus, use beast's proficiency level
    if (beastBonus >= druidBonus) {
      profMap.set(beastProf.skill, beastProf);
    }
  }

  return Array.from(profMap.values());
}

/**
 * Merges traits by source, including beast species traits and druid class/feat traits.
 *
 * D&D 5e 2024 Wild Shape Rule: Retain druid's class and feat traits/actions,
 * but gain beast's species traits/actions.
 *
 * @param druidTraits - Druid's traits
 * @param beastTraits - Beast's traits
 * @returns Combined list of traits
 */
function mergeTraits(druidTraits: Trait[], beastTraits: Trait[]): Trait[] {
  const merged: Trait[] = [];

  // Add all beast species traits
  for (const trait of beastTraits) {
    if (trait.source === 'species') {
      merged.push(trait);
    }
  }

  // Add druid's class and feat traits
  for (const trait of druidTraits) {
    if (trait.source === 'class' || trait.source === 'feat') {
      merged.push(trait);
    }
  }

  return merged;
}

/**
 * Merges actions by source, including beast species actions and druid class/feat actions.
 *
 * D&D 5e 2024 Wild Shape Rule: Retain druid's class and feat traits/actions,
 * but gain beast's species traits/actions.
 *
 * @param druidActions - Druid's actions
 * @param beastActions - Beast's actions
 * @returns Combined list of actions
 */
function mergeActions(
  druidActions: Action[],
  beastActions: Action[]
): Action[] {
  const merged: Action[] = [];

  // Add all beast species actions
  for (const action of beastActions) {
    if (action.source === 'species') {
      merged.push(action);
    }
  }

  // Add druid's class and feat actions
  for (const action of druidActions) {
    if (action.source === 'class' || action.source === 'feat') {
      merged.push(action);
    }
  }

  return merged;
}

/**
 * Calculates the complete stat block for a wildshaped druid.
 *
 * D&D 5e 2024 Wild Shape Rules:
 * - Physical ability scores (Str, Dex, Con) from beast
 * - Mental ability scores (Int, Wis, Cha) from druid
 * - Hit points and hit dice from druid
 * - Temporary HP equal to druid level
 * - AC, movement, and senses from beast
 * - Proficiency bonus from druid level
 * - Saving throws: use higher bonus between druid and beast
 * - Skills: use higher bonus between druid and beast
 * - Languages from druid (understand but cannot speak)
 * - Traits/Actions: beast species + druid class/feat
 *
 * @param druid - The druid character
 * @param beast - The beast to transform into
 * @returns The wildshaped druid stat block
 * @throws Error if transformation is invalid or druid is not 2024 edition
 *
 * @example
 * const druid = { edition: '2024', druidLevel: 5, totalCharacterLevel: 5, ... };
 * const wolf = { edition: '2024', challengeRating: 0.25, ... };
 * const wildshaped = calculateWildshapedDruid(druid, wolf);
 * // Returns complete hybrid stat block
 */
export function calculateWildshapedDruid(
  druid: Druid,
  beast: Beast
): WildshapedDruid {
  // Validation: Only 2024 edition supported
  if (druid.edition !== '2024') {
    throw new Error(
      'Wild Shape stat calculation is only supported for 2024 edition druids. ' +
        '2014 edition uses different rules that are not yet implemented.'
    );
  }

  // Validation: Editions must match
  if (druid.edition !== beast.edition) {
    throw new Error(
      `Edition mismatch: Druid is ${druid.edition} edition but beast is ${beast.edition} edition. ` +
        'Both must use the same edition rules.'
    );
  }

  // Validation: Check if transformation is valid
  const eligibility = canWildShapeInto(
    druid.druidLevel,
    beast,
    druid.edition,
    druid.druidCircle
  );

  if (!eligibility.canTransform) {
    throw new Error(
      `Cannot Wild Shape into ${beast.name}: ${eligibility.reason}`
    );
  }

  // Calculate proficiency bonuses
  const druidPB = getProficiencyBonusFromLevel(druid.totalCharacterLevel);
  const beastPB = getProficiencyBonusFromCR(beast.challengeRating);

  // Create hybrid ability scores (physical from beast, mental from druid)
  const hybridAbilities: Record<AbilityName, number> = {
    strength: beast.strength,
    dexterity: beast.dexterity,
    constitution: beast.constitution,
    intelligence: druid.intelligence,
    wisdom: druid.wisdom,
    charisma: druid.charisma,
  };

  // Beast's original abilities (for comparison during merging)
  const beastAbilities: Record<AbilityName, number> = {
    strength: beast.strength,
    dexterity: beast.dexterity,
    constitution: beast.constitution,
    intelligence: beast.intelligence,
    wisdom: beast.wisdom,
    charisma: beast.charisma,
  };

  // Merge saving throws and skills (use higher bonus)
  const savingThrowBonuses = mergeSavingThrowBonuses(
    druid.savingThrowProficiencies,
    beast.savingThrowProficiencies,
    hybridAbilities,
    beastAbilities,
    druidPB,
    beastPB
  );

  const skillBonuses = mergeSkillBonuses(
    druid.skillProficiencies,
    beast.skillProficiencies,
    hybridAbilities,
    beastAbilities,
    druidPB,
    beastPB
  );

  // Merge proficiencies for reference
  const savingThrowProficiencies = mergeSavingThrowProficiencies(
    druid.savingThrowProficiencies,
    beast.savingThrowProficiencies
  );

  const skillProficiencies = mergeSkillProficiencies(
    druid.skillProficiencies,
    beast.skillProficiencies,
    skillBonuses,
    hybridAbilities,
    beastAbilities,
    druidPB,
    beastPB
  );

  // Merge traits and actions by source
  const traits = mergeTraits(druid.traits, beast.traits);
  const actions = mergeActions(druid.actions, beast.actions);

  // Calculate passive perception from merged skill bonuses
  const passivePerception = 10 + skillBonuses['Perception'];

  // Build the wildshaped druid
  const wildshaped: WildshapedDruid = {
    // Source references
    sourceDruid: druid,
    sourceBeast: beast,

    // Basic properties from beast
    name: beast.name,
    edition: beast.edition,
    size: beast.size,

    // Hybrid ability scores
    ...hybridAbilities,

    // Hit points from druid
    hitPoints: druid.hitPoints,
    hitDice: druid.hitDice,
    temporaryHitPoints: druid.druidLevel,

    // Combat stats from beast
    armorClass: beast.armorClass,
    movement: beast.movement,
    senses: beast.senses,

    // Perception from merged skills
    passivePerception,

    // Languages from druid (can understand but not speak in beast form)
    languages: druid.languages,

    // Merged proficiencies and bonuses
    savingThrowProficiencies,
    savingThrowBonuses,
    skillProficiencies,
    skillBonuses,

    // Merged traits and actions
    traits,
    actions,

    // Retained druid progression
    totalCharacterLevel: druid.totalCharacterLevel,
    druidLevel: druid.druidLevel,
    druidCircle: druid.druidCircle,
    otherClassLevels: druid.otherClassLevels,
  };

  return wildshaped;
}
