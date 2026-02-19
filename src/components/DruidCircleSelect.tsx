import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { DRUID_CIRCLES, DruidCircle } from '../models';
import { useDruidStore } from '../store/useDruidStore';

export function DruidCircleSelect() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);
  const setDruidCircle = useDruidStore((s) => s.setDruidCircle);
  const [open, setOpen] = useState(false);

  const minLevel = edition === '2024' ? 3 : 2;
  if (druidLevel < minLevel) return null;

  const circles = DRUID_CIRCLES[edition];

  const handleSelect = (circle: DruidCircle) => {
    setDruidCircle(circle);
    setOpen(false);
  };

  return (
    <View>
      <Text className="text-lg font-semibold mb-2 text-gray-800">Subclass</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className="border-2 border-green-700 rounded-md px-3 py-2 flex-row justify-between items-center"
      >
        <Text className="text-base text-gray-800">{druidCircle ?? 'None'}</Text>
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
          <View className="mx-4 mb-8 bg-white rounded-xl overflow-hidden">
            <Pressable
              onPress={() => handleSelect(null)}
              className="px-4 py-3 border-b border-gray-100"
            >
              <Text
                className={`text-base ${druidCircle === null ? 'text-green-700 font-semibold' : 'text-gray-800'}`}
              >
                None
              </Text>
            </Pressable>
            {circles.map((circle) => (
              <Pressable
                key={circle}
                onPress={() => handleSelect(circle)}
                className="px-4 py-3 border-b border-gray-100"
              >
                <Text
                  className={`text-base ${druidCircle === circle ? 'text-green-700 font-semibold' : 'text-gray-800'}`}
                >
                  {circle}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
