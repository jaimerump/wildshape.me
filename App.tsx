import './global.css';

import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CharacterSetupScreen } from './src/screens/CharacterSetupScreen';
import { WildShapeScreen } from './src/screens/WildShapeScreen';

type Tab = 'character' | 'wildshape';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('character');

  return (
    <>
      <StatusBar style="auto" />
      <View className="flex-1 bg-gray-50">
        {/* App header with title */}
        <View className="bg-gray-50 pt-safe px-4 pb-0">
          <Text className="text-3xl font-bold text-green-800 text-center py-4">
            Wildshape.me
          </Text>
          {/* Tab bar */}
          <View className="flex-row border-b-2 border-gray-200">
            <Pressable
              onPress={() => setActiveTab('character')}
              className={`flex-1 py-2 items-center border-b-2 -mb-0.5 ${activeTab === 'character' ? 'border-green-700' : 'border-transparent'}`}
            >
              <Text
                className={`text-base font-medium ${activeTab === 'character' ? 'text-green-700' : 'text-gray-500'}`}
              >
                Character
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('wildshape')}
              className={`flex-1 py-2 items-center border-b-2 -mb-0.5 ${activeTab === 'wildshape' ? 'border-green-700' : 'border-transparent'}`}
            >
              <Text
                className={`text-base font-medium ${activeTab === 'wildshape' ? 'text-green-700' : 'text-gray-500'}`}
              >
                Wild Shape
              </Text>
            </Pressable>
          </View>
        </View>
        {activeTab === 'character' ? (
          <CharacterSetupScreen />
        ) : (
          <WildShapeScreen />
        )}
      </View>
    </>
  );
}
