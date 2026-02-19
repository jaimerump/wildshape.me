import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AbilityName } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getAbilityModifier } from '../utils/calculations/abilityScores';

const ABBREVIATIONS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

interface Props {
  ability: AbilityName;
}

export function AbilityScoreInput({ ability }: Props) {
  const score = useDruidStore((s) => s[ability]);
  const setAbilityScore = useDruidStore((s) => s.setAbilityScore);
  const [inputValue, setInputValue] = useState(String(score));

  useEffect(() => {
    setInputValue(String(score));
  }, [score]);

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed)) {
      setAbilityScore(ability, 10);
    } else {
      setAbilityScore(ability, parsed);
    }
  };

  const modifier = getAbilityModifier(score);
  const modifierText = modifier >= 0 ? `+${modifier}` : String(modifier);

  return (
    <View className="items-center">
      <Text className="text-sm font-semibold text-gray-600 mb-1">
        {ABBREVIATIONS[ability]}
      </Text>
      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => setAbilityScore(ability, score - 1)}
          disabled={score <= 1}
          className={`w-8 h-8 rounded-md items-center justify-center border-2 ${
            score <= 1
              ? 'border-gray-300 bg-gray-100'
              : 'border-green-700 bg-transparent'
          }`}
        >
          <Text
            className={`text-lg font-bold ${score <= 1 ? 'text-gray-400' : 'text-green-700'}`}
          >
            −
          </Text>
        </Pressable>
        <TextInput
          value={inputValue}
          onChangeText={setInputValue}
          onBlur={handleBlur}
          keyboardType="number-pad"
          className="w-14 h-12 border-2 border-gray-300 rounded-md text-center text-lg font-bold text-gray-800 bg-white"
          maxLength={2}
          selectTextOnFocus
        />
        <Pressable
          onPress={() => setAbilityScore(ability, score + 1)}
          disabled={score >= 30}
          className={`w-8 h-8 rounded-md items-center justify-center border-2 ${
            score >= 30
              ? 'border-gray-300 bg-gray-100'
              : 'border-green-700 bg-transparent'
          }`}
        >
          <Text
            className={`text-lg font-bold ${score >= 30 ? 'text-gray-400' : 'text-green-700'}`}
          >
            +
          </Text>
        </Pressable>
      </View>
      <Text className="text-sm text-gray-500 mt-1">{modifierText}</Text>
    </View>
  );
}
