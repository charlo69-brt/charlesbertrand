'use client';

import { useMemo } from 'react';
import { BienImmobilier } from '@/lib/types';
import { calculerIFI } from '@/lib/calculs/ifi';
import { formatEuro, formatPercent } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface IFISimulatorProps {
  biens: BienImmobilier[];
}

export default function IFISimulator({ biens }: IFISimulatorProps) {
  const resultat = useMemo(() => calculerIFI(biens), [biens]);

  if (resultat.patrimoineNetTaxable < 1300000) {
    return (
      <Card title="IFI - Impôt sur la Fortune Immobilière">
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-green-600">Non assujetti à l&apos;IFI</p>
          <p className="text-sm text-gray-500 mt-2">
            Patrimoine immobilier net : {formatEuro(resultat.patrimoineNetTaxable)} (seuil : 1 300 000 €)
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Patrimoine brut</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.patrimoineImmobilierBrut)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Net taxable</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.patrimoineNetTaxable)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">IFI dû</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(resultat.ifiDu)}</p>
        </div>
      </div>

      <Card title="Détail du calcul IFI">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Patrimoine immobilier brut</span><span>{formatEuro(resultat.patrimoineImmobilierBrut)}</span></div>
          {resultat.abattementRP > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Abattement RP (30%)</span><span className="text-green-600">-{formatEuro(resultat.abattementRP)}</span></div>
          )}
          <div className="flex justify-between font-medium"><span>Net taxable</span><span>{formatEuro(resultat.patrimoineNetTaxable)}</span></div>
          <hr />
          {resultat.detailParTranche.map((t, i) => (
            <div key={i} className="flex justify-between">
              <span className="text-gray-500">{t.tranche} ({formatPercent(t.taux)})</span>
              <span>{formatEuro(t.montant)}</span>
            </div>
          ))}
          {resultat.decote > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Décote</span><span className="text-green-600">-{formatEuro(resultat.decote)}</span></div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>IFI dû</span><span className="text-red-600">{formatEuro(resultat.ifiDu)}</span></div>
        </div>
      </Card>
    </div>
  );
}
