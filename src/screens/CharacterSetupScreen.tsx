import React from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AbilityScoreInput } from '../components/AbilityScoreInput';
import { DruidCircleSelect } from '../components/DruidCircleSelect';
import { EditionSelector } from '../components/EditionSelector';
import { LevelInput } from '../components/LevelInput';
import { AbilityName } from '../models';

const ABILITY_NAMES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

export function CharacterSetupScreen() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="px-4 py-6"
    >
      <Text className="text-3xl font-bold text-green-800 text-center mb-8">
        Wildshape.me
      </Text>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <Text className="text-lg font-semibold mb-2 text-gray-800">
          Edition
        </Text>
        <EditionSelector />
      </View>

      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-col md:flex-row gap-4 items-start">
          <LevelInput />
          <DruidCircleSelect />
        </View>
      </View>

      <View className="bg-white rounded-xl p-4 shadow-sm">
        <Text className="text-lg font-semibold mb-4 text-gray-800">
          Ability Scores
        </Text>
        <View className="flex-row flex-wrap gap-y-4">
          {ABILITY_NAMES.map((ability) => (
            <View key={ability} className="w-1/2 md:w-1/3 items-center">
              <AbilityScoreInput ability={ability} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
