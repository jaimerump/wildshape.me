import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import type { Beast } from '../models';

interface BeastSelectProps {
  beasts: Beast[];
  selectedBeast: Beast | null;
  onSelect: (beast: Beast) => void;
}

export function BeastSelect({
  beasts,
  selectedBeast,
  onSelect,
}: BeastSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (beast: Beast) => {
    onSelect(beast);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="border-2 border-green-700 rounded-md px-3 py-2 flex-row justify-between items-center"
      >
        <Text className="text-base text-gray-800">
          {selectedBeast ? selectedBeast.name : 'Select a beast...'}
        </Text>
        <Text className="text-gray-400">▼</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/50"
          onPress={() => setOpen(false)}
        >
          <View className="mx-4 mb-8 bg-white rounded-xl overflow-hidden max-h-96">
            <ScrollView>
              {beasts.map((beast) => (
                <Pressable
                  key={`${beast.name}-${beast.challengeRating}`}
                  onPress={() => handleSelect(beast)}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-base ${selectedBeast?.name === beast.name ? 'text-green-700 font-semibold' : 'text-gray-800'}`}
                  >
                    {beast.name} (CR {beast.challengeRating})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
