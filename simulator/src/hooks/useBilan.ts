'use client';

import { useCallback } from 'react';
import { BilanPatrimonial, Actifs, Passifs, Revenus, Charges, AppData } from '../lib/types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'cgp-simulator-data';

function getDefaultBilan(clientId: string): BilanPatrimonial {
  return {
    clientId,
    actifs: {
      immobilier: [],
      financier: [],
      professionnel: [],
    },
    passifs: {
      credits: [],
      autresDettes: [],
    },
    revenus: {
      salairesNets: 0,
      bicBnc: 0,
      revenusFonciers: 0,
      revenusMobiliers: 0,
      pensions: 0,
      autresRevenus: 0,
    },
    charges: {
      chargesCourantes: 0,
      impotRevenu: 0,
      taxeFonciere: 0,
      ifi: 0,
      epargneAnnuelle: 0,
    },
    modifieLe: new Date().toISOString(),
  };
}

export function useBilan(clientId: string) {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, {
    version: 1,
    clients: [],
    bilans: {},
  });

  const bilan = data.bilans[clientId] || getDefaultBilan(clientId);

  const updateBilan = useCallback((updates: Partial<BilanPatrimonial>): void => {
    setData((prev) => ({
      ...prev,
      bilans: {
        ...prev.bilans,
        [clientId]: {
          ...(prev.bilans[clientId] || getDefaultBilan(clientId)),
          ...updates,
          modifieLe: new Date().toISOString(),
        },
      },
    }));
  }, [clientId, setData]);

  const updateActifs = useCallback((actifs: Actifs): void => {
    updateBilan({ actifs });
  }, [updateBilan]);

  const updatePassifs = useCallback((passifs: Passifs): void => {
    updateBilan({ passifs });
  }, [updateBilan]);

  const updateRevenus = useCallback((revenus: Revenus): void => {
    updateBilan({ revenus });
  }, [updateBilan]);

  const updateCharges = useCallback((charges: Charges): void => {
    updateBilan({ charges });
  }, [updateBilan]);

  // Computed totals
  const totalActifsImmobilier = bilan.actifs.immobilier.reduce((sum, b) => sum + b.valeur, 0);
  const totalActifsFinancier = bilan.actifs.financier.reduce((sum, a) => sum + a.valeur, 0);
  const totalActifsProfessionnel = bilan.actifs.professionnel.reduce((sum, a) => sum + a.valeur, 0);
  const totalActifs = totalActifsImmobilier + totalActifsFinancier + totalActifsProfessionnel;

  const totalCredits = bilan.passifs.credits.reduce((sum, c) => sum + c.capitalRestant, 0);
  const totalAutresDettes = bilan.passifs.autresDettes.reduce((sum, d) => sum + d.montant, 0);
  const totalPassifs = totalCredits + totalAutresDettes;

  const patrimoineNet = totalActifs - totalPassifs;

  const totalRevenus =
    bilan.revenus.salairesNets +
    bilan.revenus.bicBnc +
    bilan.revenus.revenusFonciers +
    bilan.revenus.revenusMobiliers +
    bilan.revenus.pensions +
    bilan.revenus.autresRevenus;

  const totalCharges =
    bilan.charges.chargesCourantes +
    bilan.charges.impotRevenu +
    bilan.charges.taxeFonciere +
    bilan.charges.ifi +
    bilan.charges.epargneAnnuelle;

  return {
    bilan,
    updateBilan,
    updateActifs,
    updatePassifs,
    updateRevenus,
    updateCharges,
    totalActifsImmobilier,
    totalActifsFinancier,
    totalActifsProfessionnel,
    totalActifs,
    totalCredits,
    totalAutresDettes,
    totalPassifs,
    patrimoineNet,
    totalRevenus,
    totalCharges,
  };
}
