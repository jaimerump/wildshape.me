import React from 'react';
import { Text, View } from 'react-native';

import actions2014 from '../data/class_actions_2014.json';
import actions2024 from '../data/class_actions_2024.json';
import { ClassAction, DnDClass, Edition, SpeciesAction } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getActiveClassActions } from '../utils/calculations/classFeatures';

interface DisplayAction {
  name: string;
  actionType: string;
  levelRequirement: number;
  sourceLabel: string;
  attackType?: string;
  toHitBonus?: number;
  reach?: number;
  range?: string;
  targets?: number;
  damage?: string;
  damageType?: string;
  alternativeDamageTypes?: string[];
  description: string;
  additionalEffects?: string;
}

interface Props {
  beastActions?: SpeciesAction[];
  beastName?: string;
}

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

export function ClassActionsSection({ beastActions, beastName }: Props) {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);

  const activeClassActions = getActiveClassActions(
    CLASS_DEFS[edition],
    druidLevel,
    druidCircle
  );

  const allActions: DisplayAction[] = [
    ...activeClassActions.map((a) => ({
      name: a.name,
      actionType: a.actionType,
      levelRequirement: a.levelRequirement,
      sourceLabel: a.subclass ?? a.className,
      attackType: a.attackType,
      toHitBonus: a.toHitBonus,
      reach: a.reach,
      range: a.range,
      targets: a.targets,
      damage: a.damage,
      damageType: a.damageType,
      description: a.description,
      additionalEffects: a.additionalEffects,
    })),
    ...(beastActions ?? []).map((a) => ({
      name: a.name,
      actionType: a.actionType,
      levelRequirement: 1,
      sourceLabel: beastName ?? 'Beast Form',
      attackType: a.attackType,
      toHitBonus: a.toHitBonus,
      reach: a.reach,
      range: a.range,
      targets: a.targets,
      damage: a.damage,
      damageType: a.damageType,
      alternativeDamageTypes: a.alternativeDamageTypes,
      description: a.description,
      additionalEffects: a.additionalEffects,
    })),
  ];

  const sortedActions = [...allActions].sort((a, b) => {
    if (a.levelRequirement !== b.levelRequirement) {
      return a.levelRequirement - b.levelRequirement;
    }
    return a.name.localeCompare(b.name);
  });

  if (sortedActions.length === 0) return null;

  return (
    <View>
      <View className="border-t border-gray-200 my-3" />
      <Text className="text-lg font-semibold mb-4 text-gray-800">Actions</Text>
      {sortedActions.map((action, index) => (
        <View
          key={`${action.sourceLabel}-${action.name}`}
          className={index > 0 ? 'border-t border-gray-100 mt-3 pt-3' : ''}
        >
          <View className="flex-row items-baseline gap-2 flex-wrap">
            <Text className="font-semibold text-gray-800">{action.name}</Text>
            <Text className="text-xs text-green-700">
              Level {action.levelRequirement}
            </Text>
            <Text className="text-xs text-gray-500">{action.sourceLabel}</Text>
            <View className="bg-blue-100 rounded px-1.5 py-0.5">
              <Text className="text-xs text-blue-700">{action.actionType}</Text>
            </View>
          </View>
          {(action.attackType ||
            action.toHitBonus != null ||
            action.reach != null ||
            action.range ||
            action.targets != null ||
            action.damage ||
            action.damageType) && (
            <View className="flex-row items-center gap-2 flex-wrap mt-1">
              {action.attackType && (
                <Text className="text-xs text-orange-700">
                  {action.attackType}
                </Text>
              )}
              {action.toHitBonus != null && (
                <Text className="text-xs text-gray-500">
                  {action.toHitBonus >= 0 ? '+' : ''}
                  {action.toHitBonus} to hit
                </Text>
              )}
              {action.reach != null && (
                <Text className="text-xs text-gray-500">
                  {action.reach} ft. reach
                </Text>
              )}
              {action.range && (
                <Text className="text-xs text-gray-500">
                  Range: {action.range}
                </Text>
              )}
              {action.targets != null && (
                <Text className="text-xs text-gray-500">
                  {action.targets} target{action.targets !== 1 ? 's' : ''}
                </Text>
              )}
              {(action.damage || action.damageType) && (
                <Text className="text-xs text-gray-500">
                  {[action.damage, action.damageType].filter(Boolean).join(' ')}
                  {action.damageType && action.alternativeDamageTypes?.length
                    ? ` or ${action.alternativeDamageTypes.join(' or ')}`
                    : ''}
                </Text>
              )}
            </View>
          )}
          <Text className="text-sm text-gray-600 mt-1">
            {action.description}
          </Text>
          {action.additionalEffects && (
            <Text className="text-xs text-gray-500 mt-1 italic">
              {action.additionalEffects}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}
