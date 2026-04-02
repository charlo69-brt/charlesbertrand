'use client';

import { useCallback } from 'react';
import { Client, AppData } from '../lib/types';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../lib/utils';

const STORAGE_KEY = 'cgp-simulator-data';

export function useClients() {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, {
    version: 1,
    clients: [],
    bilans: {},
  });

  const clients = data.clients;

  const getClient = useCallback((id: string): Client | undefined => {
    return data.clients.find((c) => c.id === id);
  }, [data.clients]);

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'creeLe' | 'modifieLe'>): Client => {
    const now = new Date().toISOString();
    const newClient: Client = {
      ...clientData,
      id: generateId(),
      creeLe: now,
      modifieLe: now,
    };
    setData((prev) => ({
      ...prev,
      clients: [...prev.clients, newClient],
    }));
    return newClient;
  }, [setData]);

  const updateClient = useCallback((id: string, updates: Partial<Client>): void => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === id
          ? { ...c, ...updates, modifieLe: new Date().toISOString() }
          : c
      ),
    }));
  }, [setData]);

  const deleteClient = useCallback((id: string): void => {
    setData((prev) => {
      const newBilans = { ...prev.bilans };
      delete newBilans[id];
      return {
        ...prev,
        clients: prev.clients.filter((c) => c.id !== id),
        bilans: newBilans,
      };
    });
  }, [setData]);

  return { clients, getClient, addClient, updateClient, deleteClient, data, setData };
}
