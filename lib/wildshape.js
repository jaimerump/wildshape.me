const _ = require('lodash');

// Ability scores
const PHYSICAL_ABILITIES = ["STR", "DEX", "CON"];
const MENTAL_ABILITIES = ["INT", "WIS", "CHA"];
const ABILITY_SCORES = PHYSICAL_ABILITIES.concat(MENTAL_ABILITIES);
// A mapping of skill name => ability score
const SKILLS_ATTRIBUTES = require('./../data/skills.json');
// Attributes to take from each source
const BEAST_ATTRIBUTES = ['actions', 'armor_class', 'challenge_rating', 'senses', 'size', 'speed'];
const CHARACTER_ATTRIBUTES = ['alignment', 'features'];

const {
  computeSavingThrows,
  computeSkills,
  modifierFromAbilityScore
} = require('./derived_stats');

/**
 * Generates the stats of the wildshaped form
 * @param  {Creature} character The druid's stats
 * @param  {Creature} beast     The creature they are wildshaping into
 * @return {Creature}           The resulting stats
 */
function wildshapedStats(character, beast) {

  // Take physical attributes from creature and mental from character
  let new_form = _.extend(
    _.pick( beast, BEAST_ATTRIBUTES ),
    _.pick( character, CHARACTER_ATTRIBUTES)
  );
  new_form.ability_scores = _.extend(
    _.pick( beast.ability_scores, PHYSICAL_ABILITIES ),
    _.pick( character.ability_scores, MENTAL_ABILITIES ),
  );

  // You gain the creature's HP as temp and extra damage spills over to character
  new_form.HP = character.HP;
  new_form.tempHP = beast.HP;

  // For saves and skills you basically get the better for both
  new_form.saves = computeWildshapeSavingThrows(character, beast, new_form);
  new_form.skills = computeWildshapeSkills(character, beast, new_form);

  return new_form;

}

/**
 * Generates the saving throws of the wildshaped form. 
 * Proficiencies are new form's ability modifier + character's proficiency, unless creature has a higher modifier
 * @param  {Creature} character The druid's stats
 * @param  {Creature} beast     The creature they are wildshaping into
 * @param  {Creature} new_form  The preliminary stat block for the new form
 * @return {Saves} 
 */
function computeWildshapeSavingThrows(character, beast, new_form) {

  let beast_saves = computeSavingThrows(beast);
  let character_saves = computeSavingThrows(character);
  return _.reduce( ABILITY_SCORES, (saves, attribute) => {

    // Add character proficiency if either has it
    let proficiency_bonus = 0;
    if( character.save_proficiencies[attribute] || beast.save_proficiencies[attribute] ){
      proficiency_bonus = character.proficiency_bonus;
    }
    saves[attribute] = modifierFromAbilityScore( new_form.ability_scores[attribute] ) + proficiency_bonus;

    // If both are proficient, take higher score
    if( character.save_proficiencies[attribute] && beast.save_proficiencies[attribute] ) {
      saves[attribute] = _.max([ beast_saves[attribute], saves[attribute] ]);
    }
    
    return saves;

  }, {});

}

/**
 * Generates the skills of the wildshaped form. 
 * Proficiencies are new form's ability modifier + character's proficiency, unless creature has a higher modifier
 * @param  {Creature} character The druid's stats
 * @param  {Creature} beast     The creature they are wildshaping into
 * @param  {Creature} new_form  The preliminary stat block for the new form
 * @return {Skills} 
 */
function computeWildshapeSkills(character, beast, new_form) {
  
  let beast_skills = computeSkills(beast);
  let character_skills = computeSkills(character);

  return _.reduce( SKILLS_ATTRIBUTES, (skills, attribute, skill) => {

    // Add character proficiency if either has it
    let proficiency_bonus = 0;
    if( character.skill_proficiencies[skill] || beast.skill_proficiencies[skill] ){
      proficiency_bonus = character.proficiency_bonus;
    }
    skills[skill] = modifierFromAbilityScore( new_form.ability_scores[attribute] ) + proficiency_bonus;

    // If both are proficient, take higher score
    if( character.skill_proficiencies[skill] && beast.skill_proficiencies[skill] ) {
      skills[skill] = _.max([ beast_skills[skill], skills[skill] ]);
    }
    
    return skills;

  }, {});

}

module.exports = {
  computeWildshapeSavingThrows,
  computeWildshapeSkills,
  wildshapedStats
}