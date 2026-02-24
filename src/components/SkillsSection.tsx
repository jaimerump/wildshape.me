import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { ProficiencyLevel } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getProficiencyBonusFromLevel } from '../utils/calculations/proficiencyBonus';
import { SKILL_ABILITY_MAP, getSkillBonus } from '../utils/calculations/skills';

const SKILL_NAMES = Object.keys(SKILL_ABILITY_MAP).sort();

interface SkillRowProps {
  skill: string;
}

function SkillRow({ skill }: SkillRowProps) {
  const strength = useDruidStore((s) => s.strength);
  const dexterity = useDruidStore((s) => s.dexterity);
  const constitution = useDruidStore((s) => s.constitution);
  const intelligence = useDruidStore((s) => s.intelligence);
  const wisdom = useDruidStore((s) => s.wisdom);
  const charisma = useDruidStore((s) => s.charisma);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const skillProficiencies = useDruidStore((s) => s.skillProficiencies);
  const skillOverrides = useDruidStore((s) => s.skillOverrides);
  const setSkillProficiency = useDruidStore((s) => s.setSkillProficiency);
  const setSkillOverride = useDruidStore((s) => s.setSkillOverride);

  const proficiencyEntry = skillProficiencies.find((p) => p.skill === skill);
  const proficiencyLevel = proficiencyEntry?.proficiencyLevel ?? null;
  const proficiencyBonus = getProficiencyBonusFromLevel(druidLevel);

  const abilityScores = {
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
  };
  const calculated = getSkillBonus(
    skill,
    abilityScores,
    proficiencyBonus,
    proficiencyLevel
  );

  const hasOverride = skillOverrides[skill] !== undefined;
  const displayed = hasOverride ? skillOverrides[skill]! : calculated;

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
      setSkillOverride(skill, null);
    } else if (parsed === calculated) {
      setSkillOverride(skill, null);
    } else {
      setSkillOverride(skill, parsed);
    }
  };

  const handleProficiencyCycle = () => {
    const nextLevel: ProficiencyLevel | null =
      proficiencyLevel === null
        ? 'proficient'
        : proficiencyLevel === 'proficient'
          ? 'expertise'
          : null;
    setSkillProficiency(skill, nextLevel);
  };

  const profButtonLabel =
    proficiencyLevel === 'proficient'
      ? 'P'
      : proficiencyLevel === 'expertise'
        ? 'E'
        : '';
  const profButtonFilled = proficiencyLevel !== null;

  return (
    <View className="flex-row items-center gap-2 py-1 px-2">
      <Pressable
        onPress={handleProficiencyCycle}
        className={`w-6 h-6 rounded-full border-2 border-green-700 items-center justify-center ${
          profButtonFilled ? 'bg-green-700' : 'bg-transparent'
        }`}
      >
        {profButtonFilled && (
          <Text className="text-white text-xs font-bold">
            {profButtonLabel}
          </Text>
        )}
      </Pressable>
      <Text className="flex-1 text-sm text-gray-700">{skill}</Text>
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
        <Pressable onPress={() => setSkillOverride(skill, null)}>
          <Text className="text-amber-500 text-xs">×</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SkillsSection() {
  return (
    <View>
      <Text className="text-lg font-semibold mb-4 text-gray-800">Skills</Text>
      <View className="flex-row flex-wrap">
        {SKILL_NAMES.map((skill) => (
          <View key={skill} className="w-full md:w-1/2">
            <SkillRow skill={skill} />
          </View>
        ))}
      </View>
    </View>
  );
}
