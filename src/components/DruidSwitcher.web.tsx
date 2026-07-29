/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { View } from 'react-native';

import { useDruidStore } from '../store/useDruidStore';

export function DruidSwitcher() {
  const druids = useDruidStore((s) => s.druids);
  const druidOrder = useDruidStore((s) => s.druidOrder);
  const activeDruidId = useDruidStore((s) => s.activeDruidId);
  const setActiveDruid = useDruidStore((s) => s.setActiveDruid);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveDruid(e.target.value);
  };

  return (
    <View className="flex-1">
      <select
        value={activeDruidId}
        onChange={handleChange}
        className="border-2 border-green-700 rounded-md px-3 py-2 text-base text-gray-800 bg-white focus:outline-none w-full"
      >
        {druidOrder.map((id) => (
          <option key={id} value={id}>
            {druids[id].name}
          </option>
        ))}
      </select>
    </View>
  );
}
