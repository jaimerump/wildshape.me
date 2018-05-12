const {
  modifierFromAbilityScore,
  proficiencyByChallengeRating,
  proficiencyByCharacterLevel,
  creatureProficiency,
  computeSavingThrows,
  computeSkills
} = require('../lib/derived_stats');
const _ = require('lodash');
const assert = require('assert');

const PHYSICAL_ABILITIES = ["STR", "DEX", "CON"];
const MENTAL_ABILITIES = ["INT", "WIS", "CHA"];

describe('DerivedStats', () => {

  describe('.modifierFromAbilityScore', () => {

    it("calculates correct modifiers", () => {

      let expected_modifiers = {
        1: -5,
        2: -4, 3: -4,
        4: -3, 5: -3,
        6: -2, 7: -2,
        8: -1, 9: -1,
        10: 0, 11: 0,
        12: 1, 13: 1,
        14: 2, 15: 2,
        16: 3, 17: 3,
        18: 4, 19: 4,
        20: 5, 21: 5,
        22: 6, 23: 6,
        24: 7, 25: 7,
        26: 8, 27: 8,
        28: 9, 29: 9,
        30: 10
      };

      // Lodash reverses value and key
      _.each( expected_modifiers, (expected_modifier, score) => {
        let calced_modifier = modifierFromAbilityScore(score);
        assert.equal( calced_modifier, expected_modifier );
      });

    }); // it("calculates correct modifiers")

  }); // describe('modifierFromAbilityScore')

  describe('.proficiencyByChallengeRating', () => {

    it("calculates the correct bonus", () => {

      let examples = {
        0: 2,
        0.5: 2,
        3: 2,
        7: 3,
        9: 4,
        12: 4,
        13: 5,
        17: 6,
        21: 7,
        25: 8,
        29: 9
      };

      // Lodash reverses value and key
      _.each( examples, (expected_modifier, challenge_rating) => {
        let calced_modifier = proficiencyByChallengeRating(challenge_rating);
        assert.equal( calced_modifier, expected_modifier, `Expected: ${expected_modifier}, Got: ${calced_modifier}` );
      });

    }); // it("calculates the correct bonus")

  }); // describe('.proficiencyByChallengeRating')

  describe('.proficiencyByCharacterLevel', () => {

    it("calculates the correct bonus", () => {

      let examples = {
        1: 2,
        4: 2,
        5: 3,
        8: 3,
        9: 4,
        12: 4,
        13: 5,
        16: 5,
        17: 6
      };

      // Lodash reverses value and key
      _.each( examples, (expected_modifier, level) => {
        let calced_modifier = proficiencyByCharacterLevel(level);
        assert.equal( calced_modifier, expected_modifier, `Expected: ${expected_modifier}, Got: ${calced_modifier}` );
      });

    }); // it("calculates the correct bonus")

  }); // describe('.proficiencyByCharacterLevel')

  describe('.creatureProficiency', () => {

    it("checks the challenge rating", () => {

      let creature = {
        challenge_rating: 13
      };

      assert.equal(creatureProficiency(creature), 5);

    }); // it("checks the challenge rating")

    it("checks the character level", () => {

      let creature = {
        level: 9
      };

      assert.equal(creatureProficiency(creature), 4);

    }); // it("checks the character level")

    it("checks for a proficiency attribute", () => {

      let creature = {
        proficiency: 2
      };

      assert.equal(creatureProficiency(creature), 2);

    }); // it("checks for a proficiency attribute")

    it("defaults to 2", () => {

      let creature = {
      };

      assert.equal(creatureProficiency(creature), 2);

    }); // it("defaults to 2")

  }); // describe('.creatureProficiency')

  describe('.computeSavingThrows', () => {

    const createTestCreature = () => {

      let ability_scores = {
        "STR": 15,
        "DEX": 14,
        "CON": 13,
        "INT": 12,
        "WIS": 10,
        "CHA": 8
      };

      let proficiencies = {
        "STR": true,
        "DEX": false,
        "CON": false,
        "INT": false,
        "WIS": true,
        "CHA": false
      };

      let overrides = {
        "INT": 4
      };

      return {
        ability_scores,
        save_proficiencies: proficiencies,
        save_overrides: overrides
      };

    };

    it("uses ability modifier if no proficiency", () => {

      let calced_saves = computeSavingThrows(createTestCreature());
      assert.equal( calced_saves.DEX, 2 );

    }); // it("uses ability modifier if no proficiency")

    it("applies proficiency", () => {

      let test_creature = createTestCreature();
      test_creature.proficiency = 2;

      let calced_saves = computeSavingThrows(test_creature);
      assert.equal( calced_saves.STR, 4 );

    }); // it("applies proficiency")

    it("uses override if present", () => {

      let calced_saves = computeSavingThrows(createTestCreature());
      assert.equal( calced_saves.INT, 4 );

    }); // it("uses override if present")

  }); // describe('.computeSavingThrows')

  describe('.computeSkills', () => {

    const createTestCreature = () => {

      let ability_scores = {
        "STR": 15,
        "DEX": 14,
        "CON": 13,
        "INT": 12,
        "WIS": 10,
        "CHA": 8
      };

      let proficiencies = {
        "Acrobatics": false,
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

      let overrides = {
        "Insight": 4
      };

      return {
        ability_scores,
        skill_proficiencies: proficiencies,
        skill_overrides: overrides
      };

    };

    it("uses ability modifier if no proficiency", () => {

      let calced_skills = computeSkills(createTestCreature());
      assert.equal( calced_skills['Stealth'], 2 );

    }); // it("uses ability modifier if no proficiency")

    it("applies proficiency", () => {

      let test_creature = createTestCreature();
      test_creature.proficiency = 2;

      let calced_skills = computeSkills(test_creature);
      assert.equal( calced_skills['Athletics'], 4 );

    }); // it("applies proficiency")

    it("uses override if present", () => {

      let calced_skills = computeSkills(createTestCreature());
      assert.equal( calced_skills['Insight'], 4 );

    }); // it("uses override if present")

  }); // describe('.computeSkills')

}); // describe('DerivedStats')