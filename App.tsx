import './global.css';

import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ConfirmDialog } from './src/components/ConfirmDialog';
import { CreateDruidDialog } from './src/components/CreateDruidDialog';
import { DruidSwitcher } from './src/components/DruidSwitcher';
import { CharacterSetupScreen } from './src/screens/CharacterSetupScreen';
import { WildShapeScreen } from './src/screens/WildShapeScreen';
import { useDruidStore } from './src/store/useDruidStore';

type Tab = 'character' | 'wildshape';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('character');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const activeDruidId = useDruidStore((s) => s.activeDruidId);
  const activeDruidName = useDruidStore((s) => s.name);
  const druidCount = useDruidStore((s) => s.druidOrder.length);
  const createDruid = useDruidStore((s) => s.createDruid);
  const deleteDruid = useDruidStore((s) => s.deleteDruid);
  const isOnlyDruid = druidCount <= 1;

  const handleCreate = (name: string) => {
    createDruid(name);
    setCreateDialogOpen(false);
    setActiveTab('character');
  };

  const handleConfirmDelete = () => {
    deleteDruid(activeDruidId);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <StatusBar style="auto" />
      <View className="flex-1 bg-gray-50">
        {/* App header with title */}
        <View className="bg-gray-50 pt-safe px-4 pb-0">
          <Text className="text-3xl font-bold text-green-800 text-center py-4">
            Wildshape.me
          </Text>
          {/* Druid switcher */}
          <View className="flex-row items-center gap-2 pb-3">
            <DruidSwitcher />
            <Pressable
              onPress={() => setCreateDialogOpen(true)}
              className="px-3 py-2 rounded-md border-2 border-green-700 bg-transparent"
            >
              <Text className="font-semibold text-sm text-green-700">
                + New Druid
              </Text>
            </Pressable>
            {!isOnlyDruid && (
              <Pressable
                onPress={() => setDeleteDialogOpen(true)}
                className="px-3 py-2 rounded-md border-2 border-red-600 bg-transparent"
              >
                <Text className="font-semibold text-sm text-red-600">
                  Delete {activeDruidName}
                </Text>
              </Pressable>
            )}
          </View>
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
      <CreateDruidDialog
        visible={createDialogOpen}
        onCreate={handleCreate}
        onCancel={() => setCreateDialogOpen(false)}
      />
      <ConfirmDialog
        visible={deleteDialogOpen}
        title={`Delete ${activeDruidName}?`}
        message="This will permanently delete this druid's data. This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
