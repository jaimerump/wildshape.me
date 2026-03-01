import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import traits2014 from '../data/class_traits_2014.json';
import traits2024 from '../data/class_traits_2024.json';
import { ClassTrait, DnDClass, Edition, TraitModification } from '../models';
import { useDruidStore } from '../store/useDruidStore';
import { getActiveClassTraits } from '../utils/calculations/classFeatures';

const FIELD_LABELS: Record<string, string> = {
  damage: 'Damage',
  range: 'Range',
  additionalEffects: 'Additional Effects',
  swimSpeed: 'Swim Speed',
  flySpeed: 'Fly Speed',
  language: 'Language',
  bonus: 'Bonus',
};

function formatModValue(value: TraitModification['value']): string {
  if (typeof value === 'object' && value !== null) {
    const dv = value;
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    return `${cap(dv.ability)} modifier`;
  }
  return String(value);
}

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

function TraitCard({
  trait,
  divider,
}: {
  trait: ClassTrait;
  divider: boolean;
}) {
  return (
    <View className={divider ? 'border-t border-gray-100 mt-3 pt-3' : ''}>
      <View className="flex-row items-baseline gap-2">
        <Text className="font-semibold text-gray-800">{trait.name}</Text>
        <Text className="text-xs text-green-700">
          Level {trait.levelRequirement}
        </Text>
        <Text className="text-xs text-gray-500">
          {trait.subclass ?? trait.className}
        </Text>
      </View>
      <Text className="text-sm text-gray-600 mt-1">{trait.description}</Text>
      {trait.modifies && trait.modifies.length > 0 && (
        <View className="mt-1">
          <Text className="text-xs text-gray-400 italic">Modifies:</Text>
          {trait.modifies.map((mod: TraitModification, i: number) => (
            <Text key={i} className="text-xs text-gray-500 italic">
              {mod.targetType === 'savingThrow'
                ? `${mod.targetName ?? ''} Saving Throw`
                : mod.targetName
                  ? `${mod.targetName}`
                  : ''}
              {' — '}
              {FIELD_LABELS[mod.field] ?? mod.field}:{' '}
              {formatModValue(mod.value)}
              {mod.onlyWhileWildshaped ? ' (while wildshaped)' : ''}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

interface ChoiceGroup {
  key: string;
  minLevel: number;
  options: ClassTrait[];
}

export function PassiveTraitsSection() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);
  const traitChoices = useDruidStore((s) => s.traitChoices);
  const setTraitChoice = useDruidStore((s) => s.setTraitChoice);

  const activeTraits = getActiveClassTraits(
    CLASS_DEFS[edition],
    druidLevel,
    druidCircle
  );

  // Partition into ungrouped and grouped
  const ungrouped: ClassTrait[] = [];
  const groupMap = new Map<string, ClassTrait[]>();

  for (const trait of activeTraits) {
    if (trait.choiceGroupKey) {
      const existing = groupMap.get(trait.choiceGroupKey) ?? [];
      existing.push(trait);
      groupMap.set(trait.choiceGroupKey, existing);
    } else {
      ungrouped.push(trait);
    }
  }

  // Build choice groups, deduplicated by choiceLabel (keep lowest level per label)
  const choiceGroups: ChoiceGroup[] = [];
  for (const [key, traits] of groupMap.entries()) {
    // Deduplicate options by choiceLabel — keep the one with the lowest levelRequirement
    const byLabel = new Map<string, ClassTrait>();
    for (const t of traits) {
      const label = t.choiceLabel ?? t.name;
      const existing = byLabel.get(label);
      if (!existing || t.levelRequirement < existing.levelRequirement) {
        byLabel.set(label, t);
      }
    }
    const options = Array.from(byLabel.values()).sort((a, b) =>
      (a.choiceLabel ?? a.name).localeCompare(b.choiceLabel ?? b.name)
    );
    const minLevel = Math.min(...traits.map((t) => t.levelRequirement));
    choiceGroups.push({ key, minLevel, options });
  }

  // Sort ungrouped traits
  const sortedUngrouped = [...ungrouped].sort((a, b) => {
    if (a.levelRequirement !== b.levelRequirement) {
      return a.levelRequirement - b.levelRequirement;
    }
    return a.name.localeCompare(b.name);
  });

  // Sort choice groups by min level
  choiceGroups.sort((a, b) => a.minLevel - b.minLevel);

  // Build the final render list: interleave ungrouped and groups by level order
  type RenderItem =
    | { kind: 'trait'; trait: ClassTrait }
    | { kind: 'group'; group: ChoiceGroup };

  const renderItems: RenderItem[] = [];

  let ui = 0; // index into sortedUngrouped
  let gi = 0; // index into choiceGroups

  while (ui < sortedUngrouped.length || gi < choiceGroups.length) {
    const nextUngroupedLevel =
      ui < sortedUngrouped.length
        ? sortedUngrouped[ui].levelRequirement
        : Infinity;
    const nextGroupLevel =
      gi < choiceGroups.length ? choiceGroups[gi].minLevel : Infinity;

    if (nextUngroupedLevel <= nextGroupLevel) {
      renderItems.push({ kind: 'trait', trait: sortedUngrouped[ui] });
      ui++;
    } else {
      renderItems.push({ kind: 'group', group: choiceGroups[gi] });
      gi++;
    }
  }

  if (renderItems.length === 0) return null;

  return (
    <View>
      <Text className="text-lg font-semibold mb-4 text-gray-800">
        Passive Traits
      </Text>
      {renderItems.map((item, index) => {
        const divider = index > 0;
        if (item.kind === 'trait') {
          return (
            <TraitCard
              key={item.trait.name}
              trait={item.trait}
              divider={divider}
            />
          );
        }

        const { group } = item;
        const chosenLabel = traitChoices[group.key];

        if (chosenLabel) {
          // Show only the chosen option's active traits
          const chosenTraits = groupMap
            .get(group.key)!
            .filter((t) => t.choiceLabel === chosenLabel)
            .sort((a, b) => a.levelRequirement - b.levelRequirement);

          return (
            <View
              key={group.key}
              className={divider ? 'border-t border-gray-100 mt-3 pt-3' : ''}
            >
              {chosenTraits.map((trait, i) => (
                <View
                  key={trait.name}
                  className={i > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}
                >
                  <View className="flex-row items-baseline gap-2">
                    <Text className="font-semibold text-gray-800">
                      {trait.name}
                    </Text>
                    <Text className="text-xs text-green-700">
                      Level {trait.levelRequirement}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {trait.subclass ?? trait.className}
                    </Text>
                    {i === 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          // Cycle to next option
                          const labels = group.options.map(
                            (o) => o.choiceLabel ?? o.name
                          );
                          const currentIndex = labels.indexOf(chosenLabel);
                          const nextLabel =
                            labels[(currentIndex + 1) % labels.length];
                          setTraitChoice(group.key, nextLabel);
                        }}
                      >
                        <Text className="text-xs text-blue-600 underline ml-1">
                          Change
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text className="text-sm text-gray-600 mt-1">
                    {trait.description}
                  </Text>
                  {trait.modifies && trait.modifies.length > 0 && (
                    <View className="mt-1">
                      <Text className="text-xs text-gray-400 italic">
                        Modifies:
                      </Text>
                      {trait.modifies.map(
                        (mod: TraitModification, mi: number) => (
                          <Text
                            key={mi}
                            className="text-xs text-gray-500 italic"
                          >
                            {mod.targetType === 'savingThrow'
                              ? `${mod.targetName ?? ''} Saving Throw`
                              : mod.targetName
                                ? `${mod.targetName}`
                                : ''}
                            {' — '}
                            {FIELD_LABELS[mod.field] ?? mod.field}:{' '}
                            {formatModValue(mod.value)}
                            {mod.onlyWhileWildshaped
                              ? ' (while wildshaped)'
                              : ''}
                          </Text>
                        )
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        }

        // No choice made yet — show picker
        return (
          <View
            key={group.key}
            className={divider ? 'border-t border-gray-100 mt-3 pt-3' : ''}
          >
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Choose one (Level {group.minLevel}):
            </Text>
            {group.options.map((option) => (
              <TouchableOpacity
                key={option.choiceLabel ?? option.name}
                onPress={() =>
                  setTraitChoice(group.key, option.choiceLabel ?? option.name)
                }
                className="border border-gray-300 rounded-lg p-3 mb-2 bg-white"
              >
                <Text className="font-semibold text-gray-800">
                  {option.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );
}
