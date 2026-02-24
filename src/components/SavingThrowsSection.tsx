import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AbilityName } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getSavingThrowBonus } from '../utils/calculations/savingThrows';
import { getProficiencyBonusFromLevel } from '../utils/calculations/proficiencyBonus';

const ABBREVIATIONS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
};

const ABILITY_NAMES: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
];

interface SaveRowProps {
  ability: AbilityName;
}

function SaveRow({ ability }: SaveRowProps) {
  const score = useDruidStore((s) => s[ability]);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const savingThrowProficiencies = useDruidStore(
    (s) => s.savingThrowProficiencies
  );
  const savingThrowOverrides = useDruidStore((s) => s.savingThrowOverrides);
  const toggleSavingThrowProficiency = useDruidStore(
    (s) => s.toggleSavingThrowProficiency
  );
  const setSavingThrowOverride = useDruidStore((s) => s.setSavingThrowOverride);

  const isProficient = savingThrowProficiencies.includes(ability);
  const proficiencyBonus = getProficiencyBonusFromLevel(druidLevel);
  const calculated = getSavingThrowBonus(score, proficiencyBonus, isProficient);
  const hasOverride = savingThrowOverrides[ability] !== undefined;
  const displayed = hasOverride ? savingThrowOverrides[ability]! : calculated;

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const displayString = displayed >= 0 ? `+${displayed}` : String(displayed);
  const inputValue = isEditing ? editValue : displayString;

  const handleFocus = () => {
    setIsEditing(true);
    setEditValue(displayString);
  };

  const handleBlur = () => {
    setIsEditing(false);
    const trimmed = editValue.trim().replace(/^\+/, '');
    const parsed = parseInt(trimmed, 10);
    if (isNaN(parsed) || editValue.trim() === '') {
      setSavingThrowOverride(ability, null);
    } else if (parsed === calculated) {
      setSavingThrowOverride(ability, null);
    } else {
      setSavingThrowOverride(ability, parsed);
    }
  };

  return (
    <View className="flex-row items-center gap-3 py-1">
      <Pressable
        onPress={() => toggleSavingThrowProficiency(ability)}
        className={`w-6 h-6 rounded-full border-2 border-green-700 items-center justify-center ${
          isProficient ? 'bg-green-700' : 'bg-transparent'
        }`}
      />
      <Text className="w-10 text-sm font-semibold text-gray-700">
        {ABBREVIATIONS[ability]}
      </Text>
      <TextInput
        value={inputValue}
        onChangeText={setEditValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="numbers-and-punctuation"
        className={`w-14 text-center text-base font-semibold border-b-2 bg-transparent ${
          hasOverride
            ? 'border-amber-400 text-amber-700'
            : 'border-gray-300 text-gray-800'
        }`}
        selectTextOnFocus
      />
      {hasOverride && (
        <Pressable onPress={() => setSavingThrowOverride(ability, null)}>
          <Text className="text-amber-500 text-xs">×</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SavingThrowsSection() {
  return (
    <View>
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Saving Throws
      </Text>
      <View className="flex-row flex-wrap gap-y-4">
        {ABILITY_NAMES.map((ability) => (
          <View key={ability} className="w-1/2 md:w-1/3 items-center">
            <SaveRow ability={ability} />
          </View>
        ))}
      </View>
    </View>
  );
}
