import React from 'react';
import { Text, View } from 'react-native';

import actions2014 from '../data/class_actions_2014.json';
import actions2024 from '../data/class_actions_2024.json';
import { ClassAction, DnDClass, Edition } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getActiveClassActions } from '../utils/calculations/classFeatures';

const CLASS_DEFS: Record<Edition, DnDClass> = {
  '2014': {
    name: 'Druid',
    edition: '2014',
    subclassUnlockLevel: 2,
    traits: [],
    actions: actions2014 as ClassAction[],
  },
  '2024': {
    name: 'Druid',
    edition: '2024',
    subclassUnlockLevel: 3,
    traits: [],
    actions: actions2024 as ClassAction[],
  },
};

export function ClassActionsSection() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);

  const activeActions = getActiveClassActions(
    CLASS_DEFS[edition],
    druidLevel,
    druidCircle
  );

  const sortedActions = [...activeActions].sort((a, b) => {
    if (a.levelRequirement !== b.levelRequirement) {
      return a.levelRequirement - b.levelRequirement;
    }
    return a.name.localeCompare(b.name);
  });

  if (sortedActions.length === 0) return null;

  return (
    <View>
      <Text className="text-lg font-semibold mb-4 text-gray-800">Actions</Text>
      {sortedActions.map((action, index) => (
        <View
          key={action.name}
          className={index > 0 ? 'border-t border-gray-100 mt-3 pt-3' : ''}
        >
          <View className="flex-row items-baseline gap-2 flex-wrap">
            <Text className="font-semibold text-gray-800">{action.name}</Text>
            <Text className="text-xs text-green-700">
              Level {action.levelRequirement}
            </Text>
            <Text className="text-xs text-gray-500">
              {action.subclass ?? action.className}
            </Text>
            <View className="bg-blue-100 rounded px-1.5 py-0.5">
              <Text className="text-xs text-blue-700">{action.actionType}</Text>
            </View>
          </View>
          <Text className="text-sm text-gray-600 mt-1">
            {action.description}
          </Text>
        </View>
      ))}
    </View>
  );
}
