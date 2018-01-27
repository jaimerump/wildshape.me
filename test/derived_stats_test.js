const {
  modifierFromAbilityScore,
  proficiencyByChallengeRating,
  computeSavingThrows
} = require('../lib/derived_stats');
const _ = require('lodash');
const assert = require('assert');

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
        proficiency: 2,
        ability_scores,
        save_proficiencies: proficiencies,
        save_overrides: overrides
      };

    };

    it("uses ability modifier if no proficiency", () => {

      let calced_saves = computeSavingThrows(createTestCreature());
      assert.equal( calced_saves.DEX, 2 );

    }); // it("uses ability modifier if no proficiency")

    it("calculates proficiency correctly", () => {

      let calced_saves = computeSavingThrows(createTestCreature());
      assert.equal( calced_saves.STR, 4 );

    }); // it("calculates proficiency correctly")

    it("uses override if present", () => {

      let calced_saves = computeSavingThrows(createTestCreature());
      assert.equal( calced_saves.INT, 4 );

    }); // it("uses override if present")

  }); // describe('.computeSavingThrows')

}); // describe('DerivedStats')