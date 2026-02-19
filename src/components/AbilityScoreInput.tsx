import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

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
      <TextInput
        value={inputValue}
        onChangeText={setInputValue}
        onBlur={handleBlur}
        keyboardType="number-pad"
        className="w-14 h-12 border-2 border-gray-300 rounded-md text-center text-lg font-bold text-gray-800 bg-white"
        maxLength={2}
      />
      <Text className="text-sm text-gray-500 mt-1">{modifierText}</Text>
    </View>
  );
}
