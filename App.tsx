import './global.css';

import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { CharacterSetupScreen } from './src/screens/CharacterSetupScreen';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <CharacterSetupScreen />
    </>
  );
}
