import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className="w-full max-w-sm bg-white rounded-xl p-4 shadow-sm">
          <Text className="text-lg font-semibold mb-2 text-gray-800">
            {title}
          </Text>
          <Text className="text-base text-gray-600 mb-4">{message}</Text>
          <View className="flex-row justify-end gap-3">
            <Pressable
              onPress={onCancel}
              className="px-5 py-2 rounded-md border-2 bg-transparent border-green-700"
            >
              <Text className="font-semibold text-base text-green-700">
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              className="px-5 py-2 rounded-md border-2 bg-red-600 border-red-600"
            >
              <Text className="font-semibold text-base text-white">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
