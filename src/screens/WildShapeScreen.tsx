import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BeastSelect } from '../components/BeastSelect';
import beasts2014 from '../data/beasts_2014.json';
import type { AbilityName, Beast, Druid, WildshapedDruid } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getAbilityModifier } from '../utils/calculations/abilityScores';
import { getProficiencyBonusFromCR } from '../utils/calculations/proficiencyBonus';
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
          <Text className="text-xl font-bold text-gray-800 mb-2">
            {wildshaped.name}
          </Text>

          {/* Top horizontal rule */}
          <View className="border-t border-gray-200 my-3" />

          {/* Combat stats */}
          <View className="flex-row flex-wrap gap-x-4 gap-y-1 mb-2">
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">Size:</Text> {wildshaped.size}
            </Text>
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">AC:</Text> {wildshaped.armorClass}
            </Text>
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">HP:</Text> {wildshaped.hitPoints}
            </Text>
            {wildshaped.temporaryHitPoints > 0 && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">THP:</Text>{' '}
                {wildshaped.temporaryHitPoints}
              </Text>
            )}
          </View>

          {/* Movement speeds */}
          <View className="flex-row flex-wrap gap-x-4 gap-y-1">
            {wildshaped.movement.walking !== undefined && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">Walk:</Text>{' '}
                {wildshaped.movement.walking} ft
              </Text>
            )}
            {wildshaped.movement.swimming !== undefined && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">Swim:</Text>{' '}
                {wildshaped.movement.swimming} ft
              </Text>
            )}
            {wildshaped.movement.flying !== undefined && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">Fly:</Text>{' '}
                {wildshaped.movement.flying} ft
              </Text>
            )}
            {wildshaped.movement.climbing !== undefined && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">Climb:</Text>{' '}
                {wildshaped.movement.climbing} ft
              </Text>
            )}
            {wildshaped.movement.burrowing !== undefined && (
              <Text className="text-sm text-gray-700">
                <Text className="font-semibold">Burrow:</Text>{' '}
                {wildshaped.movement.burrowing} ft
              </Text>
            )}
          </View>

          {/* Horizontal rule above ability scores */}
          <View className="border-t border-gray-200 my-3" />

          <View className="flex-row flex-wrap gap-y-4">
            {ABILITY_NAMES.map((ability) => (
              <View key={ability} className="w-1/3 items-center">
                <AbilityDisplay name={ability} score={wildshaped[ability]} />
              </View>
            ))}
          </View>

          {/* Horizontal rule below ability scores */}
          <View className="border-t border-gray-200 my-3" />

          {/* Saving Throws */}
          {wildshaped.savingThrowProficiencies.length > 0 && (
            <Text className="text-sm text-gray-700 mb-1">
              <Text className="font-semibold">Saving Throws: </Text>
              {wildshaped.savingThrowProficiencies
                .map(
                  (ab) =>
                    `${ABILITY_ABBREV[ab]} ${formatModifier(wildshaped.savingThrowBonuses[ab])}`
                )
                .join(', ')}
            </Text>
          )}

          {/* Skills */}
          {wildshaped.skillProficiencies.length > 0 && (
            <Text className="text-sm text-gray-700 mb-1">
              <Text className="font-semibold">Skills: </Text>
              {wildshaped.skillProficiencies
                .map(
                  ({ skill }) =>
                    `${skill} ${formatModifier(wildshaped.skillBonuses[skill])}`
                )
                .join(', ')}
            </Text>
          )}

          {/* Senses */}
          <Text className="text-sm text-gray-700 mb-1">
            <Text className="font-semibold">Senses: </Text>
            {[
              wildshaped.senses.darkvision !== undefined &&
                `Darkvision ${wildshaped.senses.darkvision} ft`,
              wildshaped.senses.blindsight !== undefined &&
                `Blindsight ${wildshaped.senses.blindsight} ft`,
              wildshaped.senses.tremorsense !== undefined &&
                `Tremorsense ${wildshaped.senses.tremorsense} ft`,
              wildshaped.senses.truesight !== undefined &&
                `Truesight ${wildshaped.senses.truesight} ft`,
              `Passive Perception ${wildshaped.passivePerception}`,
            ]
              .filter(Boolean)
              .join(', ')}
          </Text>

          {/* CR and Proficiency Bonus */}
          <View className="flex-row gap-x-4">
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">CR: </Text>
              {formatCR(wildshaped.sourceBeast.challengeRating)}
            </Text>
            <Text className="text-sm text-gray-700">
              <Text className="font-semibold">Proficiency Bonus: </Text>
              {formatModifier(
                getProficiencyBonusFromCR(
                  wildshaped.sourceBeast.challengeRating
                )
              )}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
