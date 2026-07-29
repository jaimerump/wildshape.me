import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

import { useDruidStore } from '../useDruidStore';
import { recordFromDefaults } from '../migrateDruidStore';

describe('useDruidStore', () => {
  beforeEach(() => {
    const record = recordFromDefaults('My Druid');
    useDruidStore.setState({
      ...record,
      druids: { [record.id]: record },
      druidOrder: [record.id],
      activeDruidId: record.id,
    });
  });

  it('starts with a single default druid named "My Druid"', () => {
    const state = useDruidStore.getState();
    expect(state.druidOrder).toHaveLength(1);
    expect(state.name).toBe('My Druid');
    expect(state.druids[state.activeDruidId].name).toBe('My Druid');
  });

  it('createDruid adds a new druid with default stats and switches to it', () => {
    const initialId = useDruidStore.getState().activeDruidId;
    const newId = useDruidStore.getState().createDruid('Thornwood');

    const state = useDruidStore.getState();
    expect(state.druidOrder).toEqual([initialId, newId]);
    expect(state.activeDruidId).toBe(newId);
    expect(state.name).toBe('Thornwood');
    expect(state.druidLevel).toBe(2);
    expect(state.edition).toBe('2024');
  });

  it('editing the active druid does not affect other druids', () => {
    const firstId = useDruidStore.getState().activeDruidId;
    useDruidStore.getState().setAbilityScore('strength', 18);

    const secondId = useDruidStore.getState().createDruid('Second Druid');
    useDruidStore.getState().setAbilityScore('strength', 6);

    expect(useDruidStore.getState().druids[firstId].strength).toBe(18);
    expect(useDruidStore.getState().druids[secondId].strength).toBe(6);

    useDruidStore.getState().setActiveDruid(firstId);
    expect(useDruidStore.getState().strength).toBe(18);
  });

  it('deleteDruid removes a druid and activates another when the active one is deleted', () => {
    const firstId = useDruidStore.getState().activeDruidId;
    const secondId = useDruidStore.getState().createDruid('Second Druid');

    useDruidStore.getState().deleteDruid(secondId);

    const state = useDruidStore.getState();
    expect(state.druidOrder).toEqual([firstId]);
    expect(state.activeDruidId).toBe(firstId);
    expect(state.druids[secondId]).toBeUndefined();
  });

  it('deleteDruid is a no-op when only one druid remains', () => {
    const onlyId = useDruidStore.getState().activeDruidId;

    useDruidStore.getState().deleteDruid(onlyId);

    const state = useDruidStore.getState();
    expect(state.druidOrder).toEqual([onlyId]);
    expect(state.druids[onlyId]).toBeDefined();
  });

  it('setDruidName renames only the active druid', () => {
    useDruidStore.getState().setDruidName('Renamed Druid');
    const state = useDruidStore.getState();
    expect(state.name).toBe('Renamed Druid');
    expect(state.druids[state.activeDruidId].name).toBe('Renamed Druid');
  });
});
