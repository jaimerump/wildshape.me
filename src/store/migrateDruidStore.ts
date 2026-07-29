import { AbilityName, DruidCircle, Edition, SkillProficiency } from '../models';
import { generateId } from '../utils/id';

export interface DruidRecord {
  id: string;
  name: string;
  edition: Edition;
  druidLevel: number;
  druidCircle: DruidCircle;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  savingThrowProficiencies: AbilityName[];
  savingThrowOverrides: Partial<Record<AbilityName, number>>;
  skillProficiencies: SkillProficiency[];
  skillOverrides: Partial<Record<string, number>>;
  traitChoices: Record<string, string>;
}

export interface MultiDruidData extends DruidRecord {
  druids: Record<string, DruidRecord>;
  druidOrder: string[];
  activeDruidId: string;
}

export function recordFromDefaults(name: string): DruidRecord {
  return {
    id: generateId(),
    name,
    edition: '2024',
    druidLevel: 2,
    druidCircle: null,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    savingThrowOverrides: {},
    skillProficiencies: [],
    skillOverrides: {},
    traitChoices: {},
  };
}

type LegacyDruidState = Partial<Omit<DruidRecord, 'id' | 'name'>>;

export function migrateDruidStorage(
  persistedState: unknown,
  version: number
): MultiDruidData {
  if (version >= 1) {
    return persistedState as MultiDruidData;
  }

  const legacy = (persistedState ?? {}) as LegacyDruidState;
  const defaults = recordFromDefaults('My Druid');
  const record: DruidRecord = {
    ...defaults,
    ...legacy,
  };

  return {
    ...record,
    druids: { [record.id]: record },
    druidOrder: [record.id],
    activeDruidId: record.id,
  };
}
