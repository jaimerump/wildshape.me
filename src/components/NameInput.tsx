import React from 'react';
import { TextInput } from 'react-native';

import { useDruidStore } from '../store/useDruidStore';

export function NameInput() {
  const name = useDruidStore((s) => s.name);
  const setDruidName = useDruidStore((s) => s.setDruidName);

  const handleBlur = () => {
    if (!name.trim()) {
      setDruidName('My Druid');
    }
  };

  return (
    <TextInput
      value={name}
      onChangeText={setDruidName}
      onBlur={handleBlur}
      placeholder="Druid name"
      className="border-2 border-gray-300 rounded-md px-3 py-2 text-base text-gray-800 bg-white"
    />
  );
}
