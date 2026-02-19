import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Edition } from '../models';
import { useDruidStore } from '../store/useDruidStore';

const EDITIONS: Edition[] = ['2014', '2024'];

export function EditionSelector() {
  const edition = useDruidStore((s) => s.edition);
  const setEdition = useDruidStore((s) => s.setEdition);

  return (
    <View className="flex-row gap-3">
      {EDITIONS.map((ed) => {
        const active = edition === ed;
        return (
          <Pressable
            key={ed}
            onPress={() => setEdition(ed)}
            className={`px-5 py-2 rounded-md border-2 ${
              active
                ? 'bg-green-700 border-green-700'
                : 'bg-transparent border-green-700'
            }`}
          >
            <Text
              className={`font-semibold text-base ${
                active ? 'text-white' : 'text-green-700'
              }`}
            >
              {ed}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
