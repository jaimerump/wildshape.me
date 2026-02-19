/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { Text, View } from 'react-native';

import { DRUID_CIRCLES, DruidCircle } from '../models';
import { useDruidStore } from '../store/useDruidStore';

export function DruidCircleSelect() {
  const edition = useDruidStore((s) => s.edition);
  const druidLevel = useDruidStore((s) => s.druidLevel);
  const druidCircle = useDruidStore((s) => s.druidCircle);
  const setDruidCircle = useDruidStore((s) => s.setDruidCircle);

  const minLevel = edition === '2024' ? 3 : 2;
  if (druidLevel < minLevel) return null;

  const circles = DRUID_CIRCLES[edition];

  return (
    <View>
      <Text className="text-lg font-semibold mb-2 text-gray-800">Subclass</Text>
      <select
        value={(druidCircle ?? '') as string}
        onChange={(e) =>
          setDruidCircle((e.target.value || null) as DruidCircle)
        }
        className="border-2 border-green-700 rounded-md px-3 py-2 text-base text-gray-800 bg-white focus:outline-none"
      >
        <option value="">None</option>
        {circles.map((circle) => (
          <option key={circle as string} value={circle as string}>
            {circle}
          </option>
        ))}
      </select>
    </View>
  );
}
