import { AppData } from './types';

const STORAGE_KEY = 'cgp-simulator-data';
const CURRENT_VERSION = 1;

function getDefaultData(): AppData {
  return {
    version: CURRENT_VERSION,
    clients: [],
    bilans: {},
  };
}

export function loadData(): AppData {
  if (typeof window === 'undefined') return getDefaultData();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();

    const data = JSON.parse(raw) as AppData;

    // Version migration (future-proofing)
    if (data.version < CURRENT_VERSION) {
      return migrateData(data);
    }

    return data;
  } catch {
    console.error('Erreur de lecture des données localStorage');
    return getDefaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  try {
    data.version = CURRENT_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erreur de sauvegarde localStorage:', e);
  }
}

export function clearData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function exportData(): string {
  const data = loadData();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): AppData | null {
  try {
    const data = JSON.parse(jsonString) as AppData;
    if (!data.clients || !data.bilans) {
      throw new Error('Format invalide');
    }
    saveData(data);
    return data;
  } catch {
    console.error('Erreur d\'importation des données');
    return null;
  }
}

function migrateData(data: AppData): AppData {
  // Add migration logic here as versions increase
  data.version = CURRENT_VERSION;
  return data;
}
