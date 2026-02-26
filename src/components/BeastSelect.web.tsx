/* eslint-disable react-native/no-raw-text */
import React from 'react';
import { View } from 'react-native';

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
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const beast = beasts.find((b) => b.name === e.target.value);
    if (beast) {
      onSelect(beast);
    }
  };

  return (
    <View>
      <select
        value={selectedBeast?.name ?? ''}
        onChange={handleChange}
        className="border-2 border-green-700 rounded-md px-3 py-2 text-base text-gray-800 bg-white focus:outline-none w-full"
      >
        <option value="">Select a beast...</option>
        {beasts.map((beast) => (
          <option
            key={`${beast.name}-${beast.challengeRating}`}
            value={beast.name}
          >
            {beast.name} (CR {beast.challengeRating})
          </option>
        ))}
      </select>
    </View>
  );
}
