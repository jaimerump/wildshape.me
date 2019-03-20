const {
  computeWildshapeSavingThrows,
  computeWildshapeSkills,
  wildshapedStats
} = require('../src/lib/wildshape');
const _ = require('lodash');
const assert = require('assert');

const PHYSICAL_ABILITIES = ["STR", "DEX", "CON"];
const MENTAL_ABILITIES = ["INT", "WIS", "CHA"];

describe('Wildshape', () => {

  const createTestBeast = () => {

    let ability_scores = {
      "STR": 15,
      "DEX": 14,
      "CON": 13,
      "INT": 12,
      "WIS": 10,
      "CHA": 8
    };

    let save_proficiencies = {
      "STR": true,
      "DEX": false,
      "CON": true,
      "INT": true,
      "WIS": false,
      "CHA": true
    };

    let save_overrides = {
      "INT": 4
    };

    let skill_proficiencies = {
      "Acrobatics": true,
      "Animal Handling": false,
      "Arcana": false,
      "Athletics": true,
      "Deception": false,
      "History": false,
      "Insight": false,
      "Intimidation": false,
      "Investigation": false,
      "Medicine": false,
      "Nature": false,
      "Perception": false,
      "Performance": false,
      "Persuasion": false,
      "Religion": false,
      "Sleight of Hand": false,
      "Stealth": false,
      "Survival": false
    };

    let senses = {
      darkvision: 60,
      passive_perception: 13
    };

    return {
      ability_scores,
      armor_class: 12,
      lair_actions: [{name: 'A Test Action'}],
      legendary_actions: [{name: 'A Test Action'}],
      proficiency_bonus: 3,
      save_proficiencies,
      save_overrides,
      senses,
      size: 'Large',
      skill_proficiencies,
      speed: 40,
      HP: {
        average: 9,
        roll: "1d10+3"
      }
    };

  };

  const createTestCharacter = () => {

    let ability_scores = {
      "STR": 8,
      "DEX": 10,
      "CON": 12,
      "INT": 13,
      "WIS": 14,
      "CHA": 15
    };

    let save_proficiencies = {
      "STR": true,
      "DEX": false,
      "CON": false,
      "INT": true,
      "WIS": true,
      "CHA": false
    };

    let save_overrides = {
    };

    let skill_proficiencies = {
      "Acrobatics": true,
      "Animal Handling": false,
      "Arcana": false,
      "Athletics": false,
      "Deception": false,
      "History": false,
      "Insight": false,
      "Intimidation": true,
      "Investigation": false,
      "Medicine": false,
      "Nature": false,
      "Perception": false,
      "Performance": false,
      "Persuasion": false,
      "Religion": false,
      "Sleight of Hand": false,
      "Stealth": false,
      "Survival": false
    };

    let senses = {
      passive_perception: 12
    }

    return {
      ability_scores,
      alignment: "chaotic stupid",
      armor_class: 10,
      proficiency_bonus: 2,
      save_proficiencies,
      save_overrides,
      senses,
      size: "Medium",
      skill_proficiencies,
      speed: 30,
      HP: {
        average: 7,
        roll: "1d6+3"
      }
    };

  };


  describe('.wildshapedStats', () => {

    it("uses the creature's physical ability scores", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.deepEqual( 
        _.pick(wildshaped_stats.ability_scores, PHYSICAL_ABILITIES), 
        _.pick(beast.ability_scores, PHYSICAL_ABILITIES) 
      );

    }); // it("uses the creature's physical ability scores")

    it("uses the character's mental ability scores", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);
      
      assert.deepEqual( 
        _.pick(wildshaped_stats.ability_scores, MENTAL_ABILITIES), 
        _.pick(character.ability_scores, MENTAL_ABILITIES) 
      );

    }); // it("uses the character's mental ability scores")

    it("uses the creature's senses", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.deepEqual( 
        wildshaped_stats.senses, 
        beast.senses 
      );

    }); // it("uses the creature's senses")

    it("uses the creature's physical attributes", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);
      let physical_attributes = ['armor_class', 'size', 'speed'];

      assert.deepEqual( _.pick(wildshaped_stats, physical_attributes), _.pick(beast, physical_attributes));

    }); // it("uses the creature's physical attributes")

    it("uses the character's mental attributes", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);
      let mental_attributes = ['alignment'];

      assert.deepEqual( _.pick(wildshaped_stats, mental_attributes), _.pick(character, mental_attributes));

    }); // it("uses the character's mental attributes")

    it("uses the character's HP", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.deepEqual( 
        wildshaped_stats.HP, 
        character.HP
      );      

    }); // it("uses the character's HP");

    it("uses the creature's HP as temporary HP", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.deepEqual( 
        wildshaped_stats.tempHP, 
        beast.HP
      );      

    }); // it("uses the creature's HP as temporary HP"); 

    it("doesn't grant lair actions", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.equal( wildshaped_stats.lair_actions, undefined );

    }); // it("doesn't grant lair actions")

    it("doesn't grant legendary actions", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.equal( wildshaped_stats.legendary_actions, undefined );

    }); // it("doesn't grant legendary actions")

  }); // describe('.wildshapedStats')

  describe('computeWildshapeSavingThrows', () => {

    it("keeps all of the character's saves", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshape_stats = wildshapedStats(character, beast);

      assert.equal( wildshape_stats.saves.WIS, 4 );

    }); // it("keeps all of the character's saves")

    it("gains the beast's saves", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshape_stats = wildshapedStats(character, beast);

      assert.equal( wildshape_stats.saves.CON, 3 );

    }); // it("gains the beast's saves")

    it("uses the creature's saves if higher", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshape_stats = wildshapedStats(character, beast);

      assert.equal( wildshape_stats.saves.INT, 4 );

    }); // it("uses the creature's saves if higher")

  }); // describe('computeWildshapeSavingThrows')

  describe('computeWildshapeSkills', () => {

    it("keeps all of the character's skills", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshaped_stats = wildshapedStats(character, beast);

      assert.equal( wildshaped_stats.skills['Intimidation'], 4 );

    }); // it("keeps all of the character's skills")

    it("gains the beast's skills", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshape_stats = wildshapedStats(character, beast);

      assert.equal( wildshape_stats.skills['Athletics'], 4 );

    }); // it("gains the beast's skills")

    it("uses the creature's skills if higher", () => {

      let character = createTestCharacter();
      let beast = createTestBeast();
      let wildshape_stats = wildshapedStats(character, beast);

      assert.equal( wildshape_stats.skills['Acrobatics'], 4 );

    }); // it("uses the creature's skills if higher")

  }); // describe('computeWildshapeSkills')

}); // describe('Wildshape')