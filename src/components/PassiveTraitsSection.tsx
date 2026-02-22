import React from 'react';
import { Text, View } from 'react-native';

import traits2014 from '../data/class_traits_2014.json';
import traits2024 from '../data/class_traits_2024.json';
import { ClassTrait, DnDClass, Edition } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getActiveClassTraits } from '../utils/calculations/classFeatures';

const CLASS_DEFS: Record<Edition, DnDClass> = {
  '2014': {
    name: 'Druid',
    edition: '2014',
    subclassUnlockLevel: 2,
    traits: traits2014 as ClassTrait[],
    actions: [],
  },
  '2024': {
    name: 'Druid',
    edition: '2024',
    subclassUnlockLevel: 3,
    traits: traits2024 as ClassTrait[],
    actions: [],
  },
};

export function PassiveTraitsSection() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);

  const activeTraits = getActiveClassTraits(
    CLASS_DEFS[edition],
    druidLevel,
    druidCircle
  );

  const sortedTraits = [...activeTraits].sort((a, b) => {
    if (a.levelRequirement !== b.levelRequirement) {
      return a.levelRequirement - b.levelRequirement;
    }
    return a.name.localeCompare(b.name);
  });

  if (sortedTraits.length === 0) return null;

  return (
    <View>
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Passive Traits
      </Text>
      {sortedTraits.map((trait, index) => (
        <View
          key={trait.name}
          className={index > 0 ? 'border-t border-gray-100 mt-3 pt-3' : ''}
        >
          <View className="flex-row items-baseline gap-2">
            <Text className="font-semibold text-gray-800">{trait.name}</Text>
            <Text className="text-xs text-green-700">
              Level {trait.levelRequirement}
            </Text>
            <Text className="text-xs text-gray-500">
              {trait.subclass ?? trait.className}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            {trait.description}
          </Text>
        </View>
      ))}
    </View>
  );
}
