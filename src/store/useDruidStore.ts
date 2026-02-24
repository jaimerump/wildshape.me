import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AbilityName, DruidCircle, Edition } from '../models';

interface DruidState {
  edition: Edition;
  druidLevel: number;
  druidCircle: DruidCircle;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  savingThrowProficiencies: AbilityName[];
  savingThrowOverrides: Partial<Record<AbilityName, number>>;
  setEdition: (edition: Edition) => void;
  setDruidLevel: (level: number) => void;
  setDruidCircle: (circle: DruidCircle) => void;
  setAbilityScore: (ability: AbilityName, score: number) => void;
  toggleSavingThrowProficiency: (ability: AbilityName) => void;
  setSavingThrowOverride: (ability: AbilityName, value: number | null) => void;
}

export const useDruidStore = create<DruidState>()(
  persist(
    (set) => ({
      edition: '2024',
      druidLevel: 2,
      druidCircle: null,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      savingThrowProficiencies: ['intelligence', 'wisdom'],
      savingThrowOverrides: {},
      setEdition: (edition) => set({ edition, druidCircle: null }),
      setDruidLevel: (level) =>
        set({ druidLevel: Math.min(20, Math.max(2, level)) }),
      setDruidCircle: (circle) => set({ druidCircle: circle }),
      setAbilityScore: (ability, score) =>
        set({ [ability]: Math.min(30, Math.max(1, score)) }),
      toggleSavingThrowProficiency: (ability) =>
        set((state) => {
          const current = state.savingThrowProficiencies;
          const next = current.includes(ability)
            ? current.filter((a) => a !== ability)
            : [...current, ability];
          return { savingThrowProficiencies: next };
        }),
      setSavingThrowOverride: (ability, value) =>
        set((state) => {
          const overrides = { ...state.savingThrowOverrides };
          if (value === null) {
            delete overrides[ability];
          } else {
            overrides[ability] = value;
          }
          return { savingThrowOverrides: overrides };
        }),
    }),
    {
      name: 'druid-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
