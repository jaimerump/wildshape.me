/* eslint-disable react-native/no-raw-text */
import React from 'react';

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
  return (
    <select
      value={value}
      onChange={(e) => onSelect(e.target.value)}
      className="ml-1 text-xs text-blue-600 bg-white border border-gray-300 rounded focus:outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
