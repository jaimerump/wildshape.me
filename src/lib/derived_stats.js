const _ = require('lodash');

// Ability scores
const PHYSICAL_ABILITIES = ["STR", "DEX", "CON"];
const MENTAL_ABILITIES = ["INT", "WIS", "CHA"];
const ABILITY_SCORES = PHYSICAL_ABILITIES.concat(MENTAL_ABILITIES);
// A mapping of skill name => ability score
const SKILLS_ATTRIBUTES = require('./../data/skills.json');

/**
 * Calculates the modifier for the given ability score
 * @param  {Integer} score 
 * @return {Integer}       
 */
function modifierFromAbilityScore(score) {
  return _.floor( (score - 10) / 2 )
}

/**
 * Calculates a creature's proficiency bonus by it's challenge rating
 * @param  {Float} challenge_rating 
 * @return {Integer}
 */
function proficiencyByChallengeRating(challenge_rating) {

  if( challenge_rating <= 4 ) {
    return 2;
  } else if( challenge_rating <= 8 ) {
    return 3;
  } else if( challenge_rating <= 12 ) {
    return 4;
  } else if( challenge_rating <= 16 ) {
    return 5;
  } else if( challenge_rating <= 20 ) {
    return 6;
  } else if( challenge_rating <= 24 ) {
    return 7;
  } else if( challenge_rating <= 28 ) {
    return 8;
  } else {
    return 9;
  }

}

/**
 * Calculate's a character's proficiency bonus by their character level
 * @param  {Integer} level Total character level, not level in a given class
 * @return {Integer}       
 */
function proficiencyByCharacterLevel(level) {

  if( level < 5 ) {
    return 2;
  } else if( level < 9 ) {
    return 3;
  } else if( level < 13 ) {
    return 4;
  } else if( level < 17 ) {
    return 5;
  } else {
    return 6;
  }

}

/**
 * Figures out the creature's proficiency bonus
 * @param  {Creature} creature The creature or character
 * @return {Integer}          
 */
function creatureProficiency(creature) {

  if( !_.isNil( creature.challenge_rating ) ) {
    return proficiencyByChallengeRating( creature.challenge_rating );
  } else if( !_.isNil( creature.level ) ) {
    return proficiencyByCharacterLevel( creature.level );
  } else {
    return creature.proficiency || 2;
  }

}

/**
 * Computes the saving throws for the given creature
 * @param  {Creature} creature 
 * @return {Saves}   
 */
function computeSavingThrows(creature) {

  return _.reduce( ABILITY_SCORES, (acc, attribute) => {

    // Save override or modifier+proficiency or just modifier
    if( creature.save_overrides && !_.isNil(creature.save_overrides[attribute]) ) {
      acc[attribute] = creature.save_overrides[attribute];
    } else if ( creature.save_proficiencies && creature.save_proficiencies[attribute] ) {
      acc[attribute] = modifierFromAbilityScore( creature.ability_scores[attribute] ) + creatureProficiency(creature);
    } else {
      acc[attribute] = modifierFromAbilityScore( creature.ability_scores[attribute] )
    }

    return acc;

  }, {});
}

/**
 * Computes the skill bonuses for the given creature
 * @param  {Creature} creature 
 * @return {Skills}   
 */
function computeSkills(creature) {

  return _.reduce( _.keys(SKILLS_ATTRIBUTES), (acc, skill) => {

    let attribute = SKILLS_ATTRIBUTES[skill];

    // Skill override or modifier+proficiency or just modifier
    if( creature.skill_overrides && !_.isNil(creature.skill_overrides[skill]) ) {
      acc[skill] = creature.skill_overrides[skill];
    } else if ( creature.skill_proficiencies && creature.skill_proficiencies[skill] ) {
      acc[skill] = modifierFromAbilityScore( creature.ability_scores[attribute] ) + creatureProficiency(creature);
    } else {
      acc[skill] = modifierFromAbilityScore( creature.ability_scores[attribute] )
    }

    return acc;

  }, {});
}

module.exports = {
  modifierFromAbilityScore,
  proficiencyByChallengeRating,
  proficiencyByCharacterLevel,
  creatureProficiency,
  computeSavingThrows,
  computeSkills 
}

// Documentation type definitions

/**
 * @typedef Creature
 * @type object
 * @property {AbilityScores} ability_scores
 * @property {Array<Feature>} actions Things this creature can do in combat
 * @property {Integer} armor_class The creature's armor class
 * @property {Float} challenge_rating How challenging the creature is to fight
 * @property {Integer} level The total character level
 * @property {Array<Feature>} features Miscellaneous creature attributes
 * @property {HP} hp
 * @property {String} name The name of the species
 * @property {Senses} senses
 * @property {Saves} save_proficiencies Save proficiencies
 * @property {SaveOverrides} save_overrides Overrides the values of any saves
 * @property {Skills} skill_proficiencies Skill proficiencies
 * @property {SkillOverrides} skill_overrides Overrides the values of any skills
 * @property {String} size The creature's size category
 * @property {String} source The source book the creature is from
 * @property {Speeds} speed
 * @property {HP} [tempHP] Temporary hit points, if the creature has any
 */

/**
 * @typedef AbilityScores
 * @type object
 * @property {Integer} STR The creature's strength score
 * @property {Integer} DEX The creature's dexterity score
 * @property {Integer} CON The creature's constitution score
 * @property {Integer} INT The creature's intelligence score
 * @property {Integer} WIS The creature's wisdom score
 * @property {Integer} CHA The creature's charisma score
 */

/**
 * @typedef Feature
 * @type object
 * @property {String} name
 * @property {String} dm_discretion A cautionary note for abilities that may be DM discretion
 * @property {String} description
 */

/**
 * @typedef HP
 * @type object
 * @property {Integer} average The creature's average HP
 * @property {String} rolls The rolls to determine the creature's HP
 * @property {String} hit_dice The type and number of hit dice
 */

/**
 * @typedef Saves
 * @type object
 * @property {Boolean} STR Whether the creature is proficient in strength saving throws
 * @property {Boolean} DEX Whether the creature is proficient in dexterity saving throws
 * @property {Boolean} CON Whether the creature is proficient in constitution saving throws
 * @property {Boolean} INT Whether the creature is proficient in intelligence saving throws
 * @property {Boolean} WIS Whether the creature is proficient in wisdom saving throws
 * @property {Boolean} CHA Whether the creature is proficient in charisma saving throws
 */

/**
 * @typedef SaveOverrides
 * @type object
 * @property {Integer} STR Overrides the default value for strength saving throws
 * @property {Integer} DEX Overrides the default value for dexterity saving throws
 * @property {Integer} CON Overrides the default value for constitution saving throws
 * @property {Integer} INT Overrides the default value for intelligence saving throws
 * @property {Integer} WIS Overrides the default value for wisdom saving throws
 * @property {Integer} CHA Overrides the default value for charisma saving throws
 */

/**
 * @typedef Senses
 * @type object
 * @property {Integer} passive_perception The creature's passive perception score
 * @property {Integer} darkvision The creature's darkvision radius
 * @property {Integer} blindsight The creature's blindsight radius
 * @property {Integer} truesight The creature's truesight radius
 * @property {Integer} tremor_sense The creature's tremor sense radius
 */

/**
 * @typedef Skills
 * @type object
 * @property {Boolean} Acrobatics Whether the creature is proficient in Acrobatics
 * @property {Boolean} Animal_Handling Whether the creature is proficient in Animal Handling
 * @property {Boolean} Arcana Whether the creature is proficient in Arcana
 * @property {Boolean} Athletics Whether the creature is proficient in Athletics
 * @property {Boolean} Deception Whether the creature is proficient in Deception
 * @property {Boolean} History Whether the creature is proficient in History
 * @property {Boolean} Insight Whether the creature is proficient in Insight
 * @property {Boolean} Intimidation Whether the creature is proficient in Intimidation
 * @property {Boolean} Investigation Whether the creature is proficient in Investigation
 * @property {Boolean} Medicine Whether the creature is proficient in Medicine
 * @property {Boolean} Nature Whether the creature is proficient in Nature
 * @property {Boolean} Perception Whether the creature is proficient in Perception
 * @property {Boolean} Performance Whether the creature is proficient in Performance
 * @property {Boolean} Persuasion Whether the creature is proficient in Persuasion
 * @property {Boolean} Religion Whether the creature is proficient in Religion
 * @property {Boolean} Sleight_of_Hand Whether the creature is proficient in Sleight of Hand
 * @property {Boolean} Stealth Whether the creature is proficient in Stealth
 * @property {Boolean} Survival Whether the creature is proficient in Survival
 */

/**
 * @typedef SkillOverrides
 * @type object
 * @property {Integer} Acrobatics Overrides the default value of Acrobatics
 * @property {Integer} Animal_Handling Overrides the default value of Animal Handling
 * @property {Integer} Arcana Overrides the default value of Arcana
 * @property {Integer} Athletics Overrides the default value of Athletics
 * @property {Integer} Deception Overrides the default value of Deception
 * @property {Integer} History Overrides the default value of History
 * @property {Integer} Insight Overrides the default value of Insight
 * @property {Integer} Intimidation Overrides the default value of Intimidation
 * @property {Integer} Investigation Overrides the default value of Investigation
 * @property {Integer} Medicine Overrides the default value of Medicine
 * @property {Integer} Nature Overrides the default value of Nature
 * @property {Integer} Perception Overrides the default value of Perception
 * @property {Integer} Performance Overrides the default value of Performance
 * @property {Integer} Persuasion Overrides the default value of Persuasion
 * @property {Integer} Religion Overrides the default value of Religion
 * @property {Integer} Sleight_of_Hand Overrides the default value of Sleight of Hand
 * @property {Integer} Stealth Overrides the default value of Stealth
 * @property {Integer} Survival Overrides the default value of Survival
 */

/**
 * @typedef Speeds
 * @type object
 * @property {Integer} land The creature's regular land speed
 * @property {Integer} swim The creature's swim speed
 * @property {Integer} fly The creature's fly speed
 * @property {Integer} climb The creature's climb speed
 * @property {Integer} burrow The creature's burrow speed
 */