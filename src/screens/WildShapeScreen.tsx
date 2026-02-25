import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BeastSelect } from '../components/BeastSelect';
import beasts2014 from '../data/beasts_2014.json';
import type { AbilityName, Beast, Druid, WildshapedDruid } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getAbilityModifier } from '../utils/calculations/abilityScores';
import {
  calculateWildshapedDruid,
  canWildShapeFlying,
  canWildShapeInto,
  canWildShapeSwimming,
  getMaxWildShapeCR,
} from '../utils/calculations/wildShape';

const ABILITY_NAMES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

const ABILITY_ABBREV: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

interface AbilityDisplayProps {
  name: AbilityName;
  score: number;
}

function AbilityDisplay({ name, score }: AbilityDisplayProps) {
  const mod = getAbilityModifier(score);
  return (
    <View className="items-center">
      <Text className="text-xs font-semibold text-gray-500 uppercase">
        {ABILITY_ABBREV[name]}
      </Text>
      <Text className="text-xl font-bold text-gray-800">{score}</Text>
      <Text className="text-sm text-gray-600">{formatModifier(mod)}</Text>
    </View>
  );
}

function formatCR(cr: number): string {
  if (cr === 0.125) return '1/8';
  if (cr === 0.25) return '1/4';
  if (cr === 0.5) return '1/2';
  return `${cr}`;
}

export function WildShapeScreen() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);
  const strength = useDruidStore((s) => s.strength);
  const dexterity = useDruidStore((s) => s.dexterity);
  const constitution = useDruidStore((s) => s.constitution);
  const intelligence = useDruidStore((s) => s.intelligence);
  const wisdom = useDruidStore((s) => s.wisdom);
  const charisma = useDruidStore((s) => s.charisma);
  const savingThrowProficiencies = useDruidStore(
    (s) => s.savingThrowProficiencies
  );
  const skillProficiencies = useDruidStore((s) => s.skillProficiencies);

  const [selectedBeast, setSelectedBeast] = useState<Beast | null>(null);

  const allBeasts = beasts2014 as unknown as Beast[];
  const eligibleBeasts = allBeasts.filter(
    (b) => canWildShapeInto(druidLevel, b, edition, druidCircle).canTransform
  );

  // When edition/level changes, clear selected beast if it's no longer eligible
  const currentSelectedIsEligible =
    selectedBeast !== null &&
    canWildShapeInto(druidLevel, selectedBeast, edition, druidCircle)
      .canTransform;
  const effectiveSelectedBeast = currentSelectedIsEligible
    ? selectedBeast
    : null;

  const maxCR = getMaxWildShapeCR(druidLevel, edition, druidCircle);
  const canFly = canWildShapeFlying(druidLevel, edition);
  const canSwim = canWildShapeSwimming(druidLevel, edition);

  let wildshaped: WildshapedDruid | null = null;
  if (effectiveSelectedBeast) {
    const druidObj: Druid = {
      name: 'Druid',
      edition,
      size: 'Medium',
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      armorClass: 10 + getAbilityModifier(dexterity),
      hitPoints: 8 * druidLevel,
      hitDice: `${druidLevel}d8`,
      movement: { walking: 30 },
      senses: {},
      passivePerception: 10 + getAbilityModifier(wisdom),
      languages: [],
      savingThrowProficiencies,
      skillProficiencies,
      traits: [],
      actions: [],
      equipment: [],
      totalCharacterLevel: druidLevel,
      druidLevel,
      druidCircle,
    };

    const beastForCalc = { ...effectiveSelectedBeast, edition };
    try {
      wildshaped = calculateWildshapedDruid(druidObj, beastForCalc);
    } catch (e) {
      console.error('calculateWildshapedDruid failed:', e);
      wildshaped = null;
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 py-6"
    >
      {/* Beast selector card */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2 text-gray-800">
          Select Beast Form
        </Text>
        <BeastSelect
          beasts={eligibleBeasts}
          selectedBeast={effectiveSelectedBeast}
          onSelect={setSelectedBeast}
        />
        {eligibleBeasts.length === 0 && (
          <Text className="text-sm text-gray-500 mt-2">
            No eligible beasts at this level.
          </Text>
        )}
      </View>

      {/* Restrictions card */}
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2 text-gray-800">
          Wild Shape Restrictions
        </Text>
        <Text className="text-base text-gray-700 mb-1">
          Max CR: {formatCR(maxCR)}
        </Text>
        <Text className="text-base text-gray-700 mb-1">
          Flying:{' '}
          {canFly ? (
            <Text className="text-green-700">Allowed</Text>
          ) : (
            <Text className="text-red-600">Not allowed (requires level 8)</Text>
          )}
        </Text>
        <Text className="text-base text-gray-700">
          Swimming:{' '}
          {canSwim ? (
            <Text className="text-green-700">Allowed</Text>
          ) : (
            <Text className="text-red-600">
              Not allowed (2014 only: requires level 4)
            </Text>
          )}
        </Text>
      </View>

      {/* Stat block card */}
      {wildshaped && (
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            {wildshaped.name}
          </Text>
          <View className="flex-row flex-wrap gap-y-4">
            {ABILITY_NAMES.map((ability) => (
              <View key={ability} className="w-1/3 items-center">
                <AbilityDisplay name={ability} score={wildshaped[ability]} />
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}
