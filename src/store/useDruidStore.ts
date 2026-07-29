import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AbilityName, DruidCircle, Edition, ProficiencyLevel } from '../models';
import {
  DruidRecord,
  migrateDruidStorage,
  recordFromDefaults,
} from './migrateDruidStore';

interface DruidStoreState extends DruidRecord {
  druids: Record<string, DruidRecord>;
  druidOrder: string[];
  activeDruidId: string;

  setEdition: (edition: Edition) => void;
  setDruidLevel: (level: number) => void;
  setDruidCircle: (circle: DruidCircle) => void;
  setTraitChoice: (groupKey: string, choiceLabel: string) => void;
  setAbilityScore: (ability: AbilityName, score: number) => void;
  toggleSavingThrowProficiency: (ability: AbilityName) => void;
  setSavingThrowOverride: (ability: AbilityName, value: number | null) => void;
  setSkillProficiency: (skill: string, level: ProficiencyLevel | null) => void;
  setSkillOverride: (skill: string, value: number | null) => void;
  setDruidName: (name: string) => void;
  createDruid: (name: string) => string;
  deleteDruid: (id: string) => void;
  setActiveDruid: (id: string) => void;
}

export const useDruidStore = create<DruidStoreState>()(
  persist(
    (set, get) => {
      const applyToActive = (
        patch:
          | Partial<DruidRecord>
          | ((record: DruidRecord) => Partial<DruidRecord>)
      ) =>
        set((state) => {
          const id = state.activeDruidId;
          const record = state.druids[id];
          const resolved = typeof patch === 'function' ? patch(record) : patch;
          return {
            ...resolved,
            druids: { ...state.druids, [id]: { ...record, ...resolved } },
          };
        });

      const initial = recordFromDefaults('My Druid');

      return {
        ...initial,
        druids: { [initial.id]: initial },
        druidOrder: [initial.id],
        activeDruidId: initial.id,

        setEdition: (edition) => applyToActive({ edition, druidCircle: null }),
        setDruidLevel: (level) =>
          applyToActive({ druidLevel: Math.min(20, Math.max(2, level)) }),
        setDruidCircle: (circle) => applyToActive({ druidCircle: circle }),
        setAbilityScore: (ability, score) =>
          applyToActive({ [ability]: Math.min(30, Math.max(1, score)) }),
        toggleSavingThrowProficiency: (ability) =>
          applyToActive((record) => {
            const current = record.savingThrowProficiencies;
            const next = current.includes(ability)
              ? current.filter((a) => a !== ability)
              : [...current, ability];
            return { savingThrowProficiencies: next };
          }),
        setSavingThrowOverride: (ability, value) =>
          applyToActive((record) => {
            const overrides = { ...record.savingThrowOverrides };
            if (value === null) {
              delete overrides[ability];
            } else {
              overrides[ability] = value;
            }
            return { savingThrowOverrides: overrides };
          }),
        setSkillProficiency: (skill, level) =>
          applyToActive((record) => {
            if (level === null) {
              return {
                skillProficiencies: record.skillProficiencies.filter(
                  (p) => p.skill !== skill
                ),
              };
            }
            const existing = record.skillProficiencies.find(
              (p) => p.skill === skill
            );
            if (existing) {
              return {
                skillProficiencies: record.skillProficiencies.map((p) =>
                  p.skill === skill ? { ...p, proficiencyLevel: level } : p
                ),
              };
            }
            return {
              skillProficiencies: [
                ...record.skillProficiencies,
                { skill, proficiencyLevel: level },
              ],
            };
          }),
        setSkillOverride: (skill, value) =>
          applyToActive((record) => {
            const overrides = { ...record.skillOverrides };
            if (value === null) {
              delete overrides[skill];
            } else {
              overrides[skill] = value;
            }
            return { skillOverrides: overrides };
          }),
        setTraitChoice: (groupKey, choiceLabel) =>
          applyToActive((record) => ({
            traitChoices: { ...record.traitChoices, [groupKey]: choiceLabel },
          })),
        setDruidName: (name) => applyToActive({ name }),

        createDruid: (name) => {
          const record = recordFromDefaults(name);
          set((state) => ({
            ...record,
            druids: { ...state.druids, [record.id]: record },
            druidOrder: [...state.druidOrder, record.id],
            activeDruidId: record.id,
          }));
          return record.id;
        },

        deleteDruid: (id) => {
          const state = get();
          if (state.druidOrder.length <= 1) {
            return;
          }
          const druids = { ...state.druids };
          delete druids[id];
          const druidOrder = state.druidOrder.filter((d) => d !== id);

          if (state.activeDruidId !== id) {
            set({ druids, druidOrder });
            return;
          }

          const nextActiveId = druidOrder[0];
          const nextRecord = druids[nextActiveId];
          set({
            ...nextRecord,
            druids,
            druidOrder,
            activeDruidId: nextActiveId,
          });
        },

        setActiveDruid: (id) => {
          const record = get().druids[id];
          if (!record) {
            return;
          }
          set({ ...record, activeDruidId: id });
        },
      };
    },
    {
      name: 'druid-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: migrateDruidStorage,
    }
  )
);
