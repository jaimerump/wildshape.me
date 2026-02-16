/**
 * Beast Download Script
 * Downloads beast creatures from the D&D 5e API and transforms them to match our Beast interface
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  Beast,
  Size,
  AbilityName,
  Movement,
  Senses,
  SkillProficiency,
  Trait,
  Action,
  ProficiencyLevel,
} from '../../models/index';
import { getAbilityModifier } from '../calculations/abilityScores';
import { getProficiencyBonusFromCR } from '../calculations/proficiencyBonus';

// API Response interfaces
interface ApiMonster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: Array<{ type: string; value: number }>;
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  speed: Record<string, string>;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: Array<{
    value: number;
    proficiency: { index: string; name: string; url: string };
  }>;
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: Array<{ index: string; name: string; url: string }>;
  senses: Record<string, string | number>;
  languages: string;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{
    name: string;
    desc: string;
    attack_bonus?: number;
    damage?: Array<{ damage_type: { name: string }; damage_dice: string }>;
  }>;
  url: string;
}

interface ApiMonsterList {
  count: number;
  results: Array<{ index: string; name: string; url: string }>;
}

/**
 * Parse movement speeds from API format
 * Converts {walk: "40 ft.", swim: "30 ft."} to {walking: 40, swimming: 30}
 */
function parseMovement(speed: Record<string, string>): Movement {
  const movement: Movement = { walking: 0 };

  for (const [key, value] of Object.entries(speed)) {
    const match = value.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1], 10) : 0;

    switch (key) {
      case 'walk':
        movement.walking = speedValue;
        break;
      case 'swim':
        movement.swimming = speedValue;
        break;
      case 'fly':
        movement.flying = speedValue;
        break;
      case 'climb':
        movement.climbing = speedValue;
        break;
      case 'burrow':
        movement.burrowing = speedValue;
        break;
    }
  }

  return movement;
}

/**
 * Parse senses from API format
 * Extracts numeric values from strings and passive perception
 */
function parseSenses(sensesObj: Record<string, string | number>): {
  senses: Senses;
  passivePerception: number;
} {
  const senses: Senses = {};
  let passivePerception = 10;

  for (const [key, value] of Object.entries(sensesObj)) {
    // Handle both number and string formats
    let senseValue: number;
    if (typeof value === 'number') {
      senseValue = value;
    } else {
      const match = value.match(/(\d+)/);
      senseValue = match ? parseInt(match[1], 10) : 0;
    }

    switch (key) {
      case 'darkvision':
        senses.darkvision = senseValue;
        break;
      case 'blindsight':
        senses.blindsight = senseValue;
        break;
      case 'tremorsense':
        senses.tremorsense = senseValue;
        break;
      case 'truesight':
        senses.truesight = senseValue;
        break;
      case 'passive_perception':
        passivePerception = senseValue;
        break;
    }
  }

  return { senses, passivePerception };
}

/**
 * Parse languages from comma-separated string
 */
function parseLanguages(languagesStr: string): string[] {
  if (!languagesStr || languagesStr.trim() === '' || languagesStr === '-') {
    return [];
  }
  return languagesStr.split(',').map((lang) => lang.trim());
}

/**
 * Extract saving throw proficiencies
 */
function extractSavingThrowProficiencies(
  proficiencies: Array<{
    value: number;
    proficiency: { index: string; name: string };
  }>
): AbilityName[] {
  const savingThrows: AbilityName[] = [];

  for (const prof of proficiencies) {
    const profName = prof.proficiency.name.toLowerCase();
    if (profName.includes('saving throw')) {
      const ability = profName.split(':')[1]?.trim() as AbilityName;
      if (ability) {
        savingThrows.push(ability);
      }
    }
  }

  return savingThrows;
}

/**
 * Extract skill proficiencies and detect proficiency level
 */
function extractSkillProficiencies(
  proficiencies: Array<{
    value: number;
    proficiency: { index: string; name: string };
  }>,
  abilityScores: Record<AbilityName, number>,
  challengeRating: number
): SkillProficiency[] {
  const skills: SkillProficiency[] = [];
  const proficiencyBonus = getProficiencyBonusFromCR(challengeRating);

  // Skill to ability mapping
  const skillAbilityMap: Record<string, AbilityName> = {
    acrobatics: 'dexterity',
    'animal handling': 'wisdom',
    arcana: 'intelligence',
    athletics: 'strength',
    deception: 'charisma',
    history: 'intelligence',
    insight: 'wisdom',
    intimidation: 'charisma',
    investigation: 'intelligence',
    medicine: 'wisdom',
    nature: 'intelligence',
    perception: 'wisdom',
    performance: 'charisma',
    persuasion: 'charisma',
    religion: 'intelligence',
    'sleight of hand': 'dexterity',
    stealth: 'dexterity',
    survival: 'wisdom',
  };

  for (const prof of proficiencies) {
    const profName = prof.proficiency.name.toLowerCase();
    if (profName.includes('skill:')) {
      const skillName = profName.split(':')[1]?.trim();
      if (skillName) {
        const ability = skillAbilityMap[skillName];
        if (ability) {
          const abilityMod = getAbilityModifier(abilityScores[ability]);
          const expectedExpertise = abilityMod + proficiencyBonus * 2;

          // Detect proficiency level by comparing actual value to expected
          let proficiencyLevel: ProficiencyLevel = 'proficient';
          if (Math.abs(prof.value - expectedExpertise) <= 1) {
            proficiencyLevel = 'expertise';
          }

          skills.push({
            skill: skillName,
            proficiencyLevel,
          });
        }
      }
    }
  }

  return skills;
}

/**
 * Parse traits from special_abilities
 */
function parseTraits(
  special_abilities?: Array<{ name: string; desc: string }>
): Trait[] {
  if (!special_abilities) return [];

  return special_abilities.map((ability) => ({
    name: ability.name,
    description: ability.desc,
  }));
}

/**
 * Parse actions from API format
 */
function parseActions(
  actions?: Array<{
    name: string;
    desc: string;
    attack_bonus?: number;
    damage?: Array<{ damage_type: { name: string }; damage_dice: string }>;
  }>
): Action[] {
  if (!actions) return [];

  return actions.map((action) => {
    const parsedAction: Action = {
      name: action.name,
      actionType: 'Action',
      description: action.desc,
    };

    // Determine attack type from description
    if (action.desc.toLowerCase().includes('melee')) {
      parsedAction.attackType = 'Melee';
    } else if (action.desc.toLowerCase().includes('ranged')) {
      parsedAction.attackType = 'Ranged';
    }

    // Extract to-hit bonus
    if (action.attack_bonus !== undefined) {
      parsedAction.toHitBonus = action.attack_bonus;
    }

    // Extract reach from description
    const reachMatch = action.desc.match(/reach (\d+) ft\./i);
    if (reachMatch) {
      parsedAction.reach = parseInt(reachMatch[1], 10);
    }

    // Extract range from description
    const rangeMatch = action.desc.match(/range (\d+\/\d+) ft\./i);
    if (rangeMatch) {
      parsedAction.range = rangeMatch[1];
    }

    // Extract damage
    if (action.damage && action.damage.length > 0) {
      const primaryDamage = action.damage[0];
      parsedAction.damage = primaryDamage.damage_dice;
      parsedAction.damageType = primaryDamage.damage_type.name;
    }

    return parsedAction;
  });
}

/**
 * Parse size to match Size type
 */
function parseSize(sizeStr: string): Size {
  const normalized =
    sizeStr.charAt(0).toUpperCase() + sizeStr.slice(1).toLowerCase();
  return normalized as Size;
}

/**
 * Construct full hit dice string with modifier
 */
function parseHitDice(apiMonster: ApiMonster): string {
  const constitutionMod = getAbilityModifier(apiMonster.constitution);
  const diceMatch = apiMonster.hit_dice.match(/(\d+)d(\d+)/);

  if (!diceMatch) {
    return apiMonster.hit_dice;
  }

  const numDice = parseInt(diceMatch[1], 10);
  const diceSize = parseInt(diceMatch[2], 10);
  const totalMod = constitutionMod * numDice;

  if (totalMod >= 0) {
    return `${numDice}d${diceSize}+${totalMod}`;
  } else {
    return `${numDice}d${diceSize}${totalMod}`;
  }
}

/**
 * Transform API monster to Beast interface
 */
function transformApiBeastToBeast(apiMonster: ApiMonster): Beast {
  const abilityScores: Record<AbilityName, number> = {
    strength: apiMonster.strength,
    dexterity: apiMonster.dexterity,
    constitution: apiMonster.constitution,
    intelligence: apiMonster.intelligence,
    wisdom: apiMonster.wisdom,
    charisma: apiMonster.charisma,
  };

  const { senses, passivePerception } = parseSenses(apiMonster.senses);
  const movement = parseMovement(apiMonster.speed);
  const savingThrowProficiencies = extractSavingThrowProficiencies(
    apiMonster.proficiencies
  );
  const skillProficiencies = extractSkillProficiencies(
    apiMonster.proficiencies,
    abilityScores,
    apiMonster.challenge_rating
  );

  const beast: Beast = {
    name: apiMonster.name,
    edition: '2014',
    size: parseSize(apiMonster.size),
    challengeRating: apiMonster.challenge_rating,

    // Ability scores
    strength: apiMonster.strength,
    dexterity: apiMonster.dexterity,
    constitution: apiMonster.constitution,
    intelligence: apiMonster.intelligence,
    wisdom: apiMonster.wisdom,
    charisma: apiMonster.charisma,

    // Combat stats
    armorClass: apiMonster.armor_class[0]?.value || 10,
    hitPoints: apiMonster.hit_points,
    hitDice: parseHitDice(apiMonster),

    // Movement
    movement,

    // Senses
    senses,
    passivePerception,

    // Languages
    languages: parseLanguages(apiMonster.languages),

    // Proficiencies
    savingThrowProficiencies,
    skillProficiencies,

    // Abilities
    traits: parseTraits(apiMonster.special_abilities),
    actions: parseActions(apiMonster.actions),
  };

  return beast;
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
      console.warn(`Attempt ${i + 1} failed for ${url}: ${response.status}`);
    } catch (error) {
      console.warn(`Attempt ${i + 1} failed for ${url}:`, error);
    }

    if (i < retries - 1) {
      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(2, i))
      );
    }
  }

  throw new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

/**
 * Download all beasts from the API
 */
async function downloadBeasts(): Promise<Beast[]> {
  const baseUrl = 'https://www.dnd5eapi.co';
  const monstersUrl = `${baseUrl}/api/monsters`;

  console.log('Fetching monster list...');
  const listResponse = await fetchWithRetry(monstersUrl);
  const monsterList = (await listResponse.json()) as ApiMonsterList;

  console.log(
    `Found ${monsterList.count} total monsters. Filtering for beasts...`
  );

  const beasts: Beast[] = [];
  const errors: Array<{ name: string; error: string }> = [];
  let processed = 0;

  for (const monster of monsterList.results) {
    try {
      // Fetch full monster data
      const monsterUrl = `${baseUrl}${monster.url}`;
      const response = await fetchWithRetry(monsterUrl);
      const apiMonster = (await response.json()) as ApiMonster;

      // Filter for beasts only
      if (apiMonster.type === 'beast') {
        const beast = transformApiBeastToBeast(apiMonster);
        beasts.push(beast);
        console.log(`✓ ${beast.name} (CR ${beast.challengeRating})`);
      }

      processed++;
      if (processed % 10 === 0) {
        console.log(`Progress: ${processed}/${monsterList.count}`);
      }

      // Rate limiting - 100ms delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      errors.push({ name: monster.name, error: errorMsg });
      console.error(`✗ Failed to process ${monster.name}:`, errorMsg);
    }
  }

  console.log(`\nDownload complete!`);
  console.log(`Successfully processed: ${beasts.length} beasts`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\nFailed monsters:');
    errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
  }

  return beasts;
}

/**
 * Save beasts to JSON file
 */
function saveBeasts(beasts: Beast[], outputPath: string): void {
  // Create output directory if it doesn't exist
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write JSON with pretty formatting
  const jsonContent = JSON.stringify(beasts, null, 2);
  fs.writeFileSync(outputPath, jsonContent, 'utf-8');

  console.log(`\nSaved ${beasts.length} beasts to ${outputPath}`);

  // Log statistics
  const crDistribution: Record<number, number> = {};
  beasts.forEach((beast) => {
    crDistribution[beast.challengeRating] =
      (crDistribution[beast.challengeRating] || 0) + 1;
  });

  console.log('\nBeasts by Challenge Rating:');
  Object.entries(crDistribution)
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .forEach(([cr, count]) => {
      console.log(`  CR ${cr}: ${count} beasts`);
    });
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    console.log('Starting beast download from D&D 5e API...\n');

    const outputPath = path.join(__dirname, '../../data/beasts_2014.json');
    const beasts = await downloadBeasts();
    saveBeasts(beasts, outputPath);

    console.log('\n✓ Beast download completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Beast download failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  void main();
}

// Export functions for potential testing/reuse
export {
  parseMovement,
  parseSenses,
  parseLanguages,
  extractSavingThrowProficiencies,
  extractSkillProficiencies,
  parseTraits,
  parseActions,
  parseSize,
  parseHitDice,
  transformApiBeastToBeast,
  downloadBeasts,
  saveBeasts,
};
