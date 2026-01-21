/**
 * Skill bonus calculation utilities
 */

import { getAbilityModifier } from './abilityScores';
import type { AbilityName, ProficiencyLevel, SkillProficiency } from '../../models';

/**
 * Skill-to-Ability mapping for D&D 5e (2024 edition)
 */
const SKILL_ABILITY_MAP: Record<string, AbilityName> = {
  'Acrobatics': 'dexterity',
  'Animal Handling': 'wisdom',
  'Arcana': 'intelligence',
  'Athletics': 'strength',
  'Deception': 'charisma',
  'History': 'intelligence',
  'Insight': 'wisdom',
  'Intimidation': 'charisma',
  'Investigation': 'intelligence',
  'Medicine': 'wisdom',
  'Nature': 'intelligence',
  'Perception': 'wisdom',
  'Performance': 'charisma',
  'Persuasion': 'charisma',
  'Religion': 'intelligence',
  'Sleight of Hand': 'dexterity',
  'Stealth': 'dexterity',
  'Survival': 'wisdom'
};

/**
 * All 18 skill names in D&D 5e
 */
const ALL_SKILLS = Object.keys(SKILL_ABILITY_MAP);

/**
 * Gets the ability associated with a skill.
 *
 * @param skillName - The name of the skill
 * @returns The ability name
 *
 * @example
 * getSkillAbility('Stealth')     // returns 'dexterity'
 * getSkillAbility('Perception')  // returns 'wisdom'
 */
export function getSkillAbility(skillName: string): AbilityName {
  const ability = SKILL_ABILITY_MAP[skillName];
  if (!ability) {
    throw new Error(`Unknown skill: ${skillName}`);
  }
  return ability;
}

/**
 * Calculates the skill bonus for a specific skill.
 *
 * D&D 5e Rule:
 * - Not proficient: ability modifier
 * - Proficient: ability modifier + proficiency bonus
 * - Expertise: ability modifier + (2 × proficiency bonus)
 *
 * @param skillName - The name of the skill
 * @param abilityScores - Object with all six ability scores
 * @param proficiencyBonus - The creature's proficiency bonus
 * @param proficiencyLevel - null, "proficient", or "expertise"
 * @returns The skill bonus
 *
 * @example
 * getSkillBonus('Stealth', { dexterity: 16, ... }, 2, null)         // returns +3 (just modifier)
 * getSkillBonus('Stealth', { dexterity: 16, ... }, 2, 'proficient') // returns +5 (modifier + PB)
 * getSkillBonus('Stealth', { dexterity: 16, ... }, 2, 'expertise')  // returns +7 (modifier + 2xPB)
 */
export function getSkillBonus(
  skillName: string,
  abilityScores: Record<AbilityName, number>,
  proficiencyBonus: number,
  proficiencyLevel: ProficiencyLevel | null
): number {
  const ability = getSkillAbility(skillName);
  const abilityScore = abilityScores[ability];
  const modifier = getAbilityModifier(abilityScore);

  if (proficiencyLevel === 'expertise') {
    return modifier + (2 * proficiencyBonus);
  } else if (proficiencyLevel === 'proficient') {
    return modifier + proficiencyBonus;
  }

  // Not proficient or null
  return modifier;
}

/**
 * Calculates all skill bonuses for a creature.
 *
 * @param abilityScores - Object with all six ability scores
 * @param proficiencyBonus - The creature's proficiency bonus
 * @param skillProficiencies - Array of skill proficiencies
 * @returns Object with all skill bonuses
 *
 * @example
 * getAllSkillBonuses(
 *   { strength: 10, dexterity: 16, constitution: 12, intelligence: 8, wisdom: 14, charisma: 10 },
 *   2,
 *   [{ skill: 'Stealth', proficiencyLevel: 'proficient' }]
 * )
 * // returns { Athletics: 0, Acrobatics: 3, Stealth: 5, Arcana: -1, ... }
 */
export function getAllSkillBonuses(
  abilityScores: Record<AbilityName, number>,
  proficiencyBonus: number,
  skillProficiencies: SkillProficiency[]
): Record<string, number> {
  const skillBonuses: Record<string, number> = {};

  // Create a map of skill name to proficiency level for faster lookup
  const proficiencyMap = new Map<string, ProficiencyLevel>();
  for (const prof of skillProficiencies) {
    proficiencyMap.set(prof.skill, prof.proficiencyLevel);
  }

  // Calculate bonus for each skill
  for (const skill of ALL_SKILLS) {
    const proficiencyLevel = proficiencyMap.get(skill) || null;
    skillBonuses[skill] = getSkillBonus(skill, abilityScores, proficiencyBonus, proficiencyLevel);
  }

  return skillBonuses;
}
