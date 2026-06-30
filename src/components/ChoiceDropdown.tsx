import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface ChoiceDropdownProps {
  options: string[];
  value: string;
  onSelect: (option: string) => void;
}

export function ChoiceDropdown({
  options,
  value,
  onSelect,
}: ChoiceDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center ml-1"
      >
        <Text className="text-xs text-blue-600 underline">{value}</Text>
        <Text className="text-xs text-blue-600 ml-0.5">▼</Text>
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
          <View className="mx-4 mb-8 bg-white rounded-xl overflow-hidden">
            {options.map((option) => (
              <Pressable
                key={option}
                onPress={() => handleSelect(option)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text
                  className={`text-base ${option === value ? 'text-green-700 font-semibold' : 'text-gray-800'}`}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
