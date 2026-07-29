import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

interface Props {
  visible: boolean;
  onCreate: (name: string) => void;
  onCancel: () => void;
}

export function CreateDruidDialog({ visible, onCreate, onCancel }: Props) {
  const [name, setName] = useState('');

  const trimmedName = name.trim();

  const handleCancel = () => {
    setName('');
    onCancel();
  };

  const handleCreate = () => {
    if (!trimmedName) {
      return;
    }
    onCreate(trimmedName);
    setName('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full max-w-sm bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2 text-gray-800">
            Create New Druid
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Druid name"
            autoFocus
            className="border-2 border-gray-300 rounded-md px-3 py-2 text-base text-gray-800 bg-white mb-4"
          />
          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={handleCancel}
              className="px-5 py-2 rounded-md border-2 bg-transparent border-green-700"
            >
              <Text className="font-semibold text-base text-green-700">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleCreate}
              disabled={!trimmedName}
              className={`px-5 py-2 rounded-md border-2 ${
                trimmedName
                  ? 'bg-green-700 border-green-700'
                  : 'border-gray-300 bg-gray-100'
              }`}
            >
              <Text
                className={`font-semibold text-base ${
                  trimmedName ? 'text-white' : 'text-gray-400'
                }`}
              >
                Create
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
