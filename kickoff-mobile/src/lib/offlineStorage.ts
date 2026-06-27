import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

const KEY = 'REACT_QUERY_CACHE';

export const asyncStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await AsyncStorage.setItem(KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const json = await AsyncStorage.getItem(KEY);
    return json ? JSON.parse(json) as PersistedClient : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem(KEY);
  },
};
