import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useDruidStore } from '../store/useDruidStore';

export function LevelInput() {
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const setDruidLevel = useDruidStore((s) => s.setDruidLevel);
  const [inputValue, setInputValue] = useState<string | null>(null);

  const handleBlur = () => {
    if (inputValue !== null) {
      const parsed = parseInt(inputValue, 10);
      if (!isNaN(parsed)) {
        setDruidLevel(parsed);
      }
      setInputValue(null);
    }
  };

  return (
    <View>
      <Text className="text-lg font-semibold mb-2 text-gray-800">
        Druid Level
      </Text>
      <View className="flex-row items-center gap-4">
        <Pressable
          onPress={() => setDruidLevel(druidLevel - 1)}
          disabled={druidLevel <= 2}
          className={`w-10 h-10 rounded-md items-center justify-center border-2 ${
            druidLevel <= 2
              ? 'border-gray-300 bg-gray-100'
              : 'border-green-700 bg-transparent'
          }`}
        >
          <Text
            className={`text-xl font-bold ${
              druidLevel <= 2 ? 'text-gray-400' : 'text-green-700'
            }`}
          >
            −
          </Text>
        </Pressable>
        <TextInput
          className="text-2xl font-bold w-10 text-center text-gray-800 border-b-2 border-gray-300"
          keyboardType="number-pad"
          value={inputValue !== null ? inputValue : String(druidLevel)}
          onChangeText={setInputValue}
          onBlur={handleBlur}
          selectTextOnFocus
        />
        <Pressable
          onPress={() => setDruidLevel(druidLevel + 1)}
          disabled={druidLevel >= 20}
          className={`w-10 h-10 rounded-md items-center justify-center border-2 ${
            druidLevel >= 20
              ? 'border-gray-300 bg-gray-100'
              : 'border-green-700 bg-transparent'
          }`}
        >
          <Text
            className={`text-xl font-bold ${
              druidLevel >= 20 ? 'text-gray-400' : 'text-green-700'
            }`}
          >
            +
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
