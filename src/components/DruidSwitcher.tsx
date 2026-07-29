import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { useDruidStore } from '../store/useDruidStore';

export function DruidSwitcher() {
  const [open, setOpen] = useState(false);
  const druids = useDruidStore((s) => s.druids);
  const druidOrder = useDruidStore((s) => s.druidOrder);
  const activeDruidId = useDruidStore((s) => s.activeDruidId);
  const setActiveDruid = useDruidStore((s) => s.setActiveDruid);

  const activeName = druids[activeDruidId]?.name ?? '';

  const handleSelect = (id: string) => {
    setActiveDruid(id);
    setOpen(false);
  };

  return (
    <View className="flex-1">
      <Pressable
        onPress={() => setOpen(true)}
        className="border-2 border-green-700 rounded-md px-3 py-2 flex-row justify-between items-center"
      >
        <Text className="text-base text-gray-800" numberOfLines={1}>
          {activeName}
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
              {druidOrder.map((id) => (
                <Pressable
                  key={id}
                  onPress={() => handleSelect(id)}
                  className="px-4 py-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-base ${id === activeDruidId ? 'text-green-700 font-semibold' : 'text-gray-800'}`}
                  >
                    {druids[id].name}
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
