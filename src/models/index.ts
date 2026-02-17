/**
 * Domain model type definitions for Wildshape.me
 * Based on D&D 5e (2024 edition)
 */

/**
 * D&D edition
 */
export type Edition = '2024' | '2014';

/**
 * Creature size categories
 */
export type Size =
  | 'Tiny'
  | 'Small'
  | 'Medium'
  | 'Large'
  | 'Huge'
  | 'Gargantuan';

/**
 * Ability score names
 */
export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma';

/**
 * Skill proficiency levels
 */
export type ProficiencyLevel = 'proficient' | 'expertise';

/**
 * Action types
 */
export type ActionType = 'Action' | 'Bonus Action' | 'Reaction';

/**
 * Trait and action source (for Wild Shape stat merging)
 */
export type TraitSource = 'species' | 'class' | 'feat';

/**
 * Attack types
 */
export type AttackType = 'Melee' | 'Ranged';

/**
 * Creature senses
 */
export interface Senses {
  darkvision?: number;
  blindsight?: number;
  tremorsense?: number;
  truesight?: number;
}

/**
 * Movement speeds (all in feet)
 */
export interface Movement {
  walking: number;
  swimming?: number;
  flying?: number;
  climbing?: number;
  burrowing?: number;
}

/**
 * Skill proficiency
 */
export interface SkillProficiency {
  skill: string;
  proficiencyLevel: ProficiencyLevel;
}

/**
 * Creature trait (passive abilities)
 */
export interface Trait {
  name: string;
  description: string;
  source: TraitSource;
}

/**
 * Creature action
 */
export interface Action {
  name: string;
  actionType: ActionType;
  description: string;
  source: TraitSource;
  attackType?: AttackType;
  toHitBonus?: number;
  reach?: number;
  range?: string;
  targets?: number;
  damage?: string;
  damageType?: string;
  additionalEffects?: string;
}

/**
 * Base creature interface
 */
export interface Creature {
  name: string;
  edition: Edition;
  size: Size;

  // Ability scores
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  // Combat stats
  armorClass: number;
  hitPoints: number;
  hitDice: string;

  // Speeds
  movement: Movement;

  // Senses
  senses: Senses;
  passivePerception: number;

  // Languages
  languages: string[];

  // Proficiencies
  savingThrowProficiencies: AbilityName[];
  skillProficiencies: SkillProficiency[];

  // Abilities
  traits: Trait[];
  actions: Action[];
}

/**
 * Beast creature (animals that can be Wild Shaped into)
 */
export interface Beast extends Creature {
  challengeRating: number;
}

/**
 * Druid circle (subclass)
 */
export type DruidCircle =
  | 'Circle of the Moon'
  | 'Circle of the Land'
  | 'Circle of the Sea'
  | 'Circle of the Stars'
  | null;

/**
 * Druid character
 */
export interface Druid extends Creature {
  totalCharacterLevel: number;
  druidLevel: number;
  druidCircle: DruidCircle;
  otherClassLevels?: Record<string, number>;
}

/**
 * Wildshaped druid (hybrid stats when transformed into a beast)
 * Follows 2024 D&D 5e Wild Shape rules
 */
export interface WildshapedDruid extends Creature {
  // Source references
  sourceDruid: Druid;
  sourceBeast: Beast;

  // Wild Shape specific
  temporaryHitPoints: number;

  // Computed final bonuses (after merging druid/beast)
  savingThrowBonuses: Record<AbilityName, number>;
  skillBonuses: Record<string, number>;

  // Retained druid properties
  totalCharacterLevel: number;
  druidLevel: number;
  druidCircle: DruidCircle;
  otherClassLevels?: Record<string, number>;
}

/**
 * Wild Shape eligibility result
 */
export interface WildShapeEligibility {
  canTransform: boolean;
  reason?: string;
}
