// A script to download beasts from http://www.dnd5eapi.co/

const request = require('request');
const asynclib = require('async');

const BASE_URL = "http://www.dnd5eapi.co/api/";
const SKILLS_KEYS = [
  { key: "Acrobatics", str: "acrobatics" },
  { key: "Animal Handling", str: "animal_handling" },
  { key: "Arcana", str: "arcana" },
  { key: "Athletics", str: "athletics" },
  { key: "Deception", str: "deception" },
  { key: "History", str: "history" },
  { key: "Insight", str: "insight" },
  { key: "Intimidation", str: "intimidation" },
  { key: "Investigation", str: "investigation" },
  { key: "Medicine", str: "medicine" },
  { key: "Nature", str: "nature" },
  { key: "Perception", str: "perception" },
  { key: "Performance", str: "performance" },
  { key: "Persuasion", str: "persuasion" },
  { key: "Religion", str: "religion" },
  { key: "Sleight of Hand", str: "sleight_of_hand" },
  { key: "Stealth", str: "stealth" },
  { key: "Survival", str: "survival" }
];
const SAVES_KEYS = [
  { key: 'STR', str: 'strength_save' },
  { key: 'DEX', str: 'dexterity_save' },
  { key: 'CON', str: 'constitution_save' },
  { key: 'INT', str: 'intelligence_save' },
  { key: 'WIS', str: 'wisdom_save' },
  { key: 'CHA', str: 'charisma_save' }
]

let beasts = [];

request(BASE_URL+'monsters/', (err, response, body) => {

  if(err) {
    console.log("Err:", err);
    process.exit(1);
  }

  let monster_urls = JSON.parse(body).results.map((result) => { return result.url });

  asynclib.eachSeries(monster_urls, (url, each_callback) => {

    request(url, (err, response, monster) => {

      if (err) {
        return each_callback(err);
      }

      monster = JSON.parse(monster);
      // console.log("Monster:", JSON.stringify(monster));

      if (monster.type == 'beast') {
        let beast = processBeast(monster);
        // console.log("Requested:", url);
        // console.log("Parsed:", JSON.stringify(beast));
        console.log("Processed ", beast.name);
        beasts.push(beast);
      }

      return each_callback();
    });

  }, (err) => {

    if (err) {
      console.log("Err:", err);
      process.exit(1);
    }

    // console.log("Beasts:");
    // console.log(JSON.stringify(beasts, undefined, 2));
    require('fs').writeFileSync('./src/data/api_beasts.json', JSON.stringify(beasts, undefined, 2));
    console.log("done");
    process.exit(0);

  });

});

function processBeast(beast) {
  return {
    "name": beast.name,
    "challenge_rating": beast.challenge_rating,
    "size": beast.size.toLowerCase(),
    "armor_class": beast.armor_class,
    "HP": {
      "average": beast.hit_points,
      "roll": `${beast.hit_dice}+${parseInt(beast.hit_dice) * (Math.floor( ( parseInt(beast.constitution) / 2 ) - 5 ) ) }`,
      "hit_dice": beast.hit_dice
    },
    "vulnerabilities": beast.damage_vulnerabilities,
    "resistances": beast.damage_resistances,
    "immunities": beast.damage_immunities,
    "condition_immunities": beast.condition_immunities,
    "speed_str": beast.speed,
    "speed": {
      "land": parseInt(beast.speed),
      "burrow": parseInt(beast.speed.split('burrow')[1]),
      "climb": parseInt(beast.speed.split('climb')[1]),
      "fly": parseInt(beast.speed.split('fly')[1]),
      "swim": parseInt(beast.speed.split('swim')[1])
    },
    "ability_scores": {
      "STR": beast.strength,
      "DEX": beast.dexterity,
      "CON": beast.constitution,
      "INT": beast.intelligence,
      "WIS": beast.wisdom,
      "CHA": beast.charisma
    },
    "sense_str": beast.senses,
    "senses": {
      "passive_perception": parseInt(beast.senses.split('passive Perception')[1]) || 10 + parseInt(beast.perception),
      "darkvision": parseInt(beast.senses.split('darkvision')[1]),
      "blindsight": parseInt(beast.senses.split('blindsight')[1]),
      "truesight": parseInt(beast.senses.split('truesight')[1]),
      "tremorsense": parseInt(beast.senses.split('tremorsense')[1])
    },
    "save_proficiencies": extractSaveProficiencies(beast),
    "save_overrides": extractSaves(beast),
    "skill_proficiencies": extractSkillProficiencies(beast),
    "skill_overrides": extractSkills(beast),
    "features": (beast.special_abilities || []).map((ability) => { return {name: ability.name, description: ability.desc} }),
    "actions": (beast.actions || []).map((action) => { return { name: action.name, description: action.desc } })
  };

}

function extractSkills(beast) {
  
  return SKILLS_KEYS.reduce((skill_overrides, skill) => {

    if(beast.hasOwnProperty(skill.str)) {
      skill_overrides[skill.key] = beast[ skill.str ];
    }

    return skill_overrides;
  }, {});
}

function extractSkillProficiencies(beast) {

  return SKILLS_KEYS.reduce((skill_proficiencies, skill) => {

    skill_proficiencies[skill.key] = beast.hasOwnProperty(skill.str);
    return skill_proficiencies;

  }, {});

}

function extractSaves(beast) {

  return SAVES_KEYS.reduce((save_overrides, save) => {

    if (beast.hasOwnProperty(save.str)) {
      save_overrides[save.key] = beast[save.str];
    }

    return save_overrides;
  }, {});
}

function extractSaveProficiencies(beast) {

  return SAVES_KEYS.reduce((save_proficiencies, save) => {

    save_proficiencies[save.key] = beast.hasOwnProperty(save.str);
    return save_proficiencies;

  }, {});

}