'use client';

import { useMemo } from 'react';
import { Revenus, SituationFamiliale } from '@/lib/types';
import { calculerIR } from '@/lib/calculs/impot-revenu';
import { formatEuro, formatPercent } from '@/lib/utils';
import Card from '@/components/ui/Card';

interface IRSimulatorProps {
  revenus: Revenus;
  situation: SituationFamiliale;
  enfantsACharge: number;
}

export default function IRSimulator({ revenus, situation, enfantsACharge }: IRSimulatorProps) {
  const resultat = useMemo(
    () => calculerIR(revenus, situation, enfantsACharge),
    [revenus, situation, enfantsACharge]
  );

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Impôt net</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.impotNet)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">TMI</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(resultat.tauxMarginalImposition)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Taux moyen</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatPercent(resultat.tauxMoyenImposition)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Total fiscalité</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(resultat.totalFiscalite)}</p>
        </div>
      </div>

      {/* Detail */}
      <Card title="Détail du calcul">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Revenu brut global</span><span className="font-medium">{formatEuro(resultat.revenuBrutGlobal)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Revenu net imposable</span><span className="font-medium">{formatEuro(resultat.revenuNetImposable)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Nombre de parts</span><span className="font-medium">{resultat.nombreParts}</span></div>
          <hr />
          <div className="flex justify-between"><span className="text-gray-500">Impôt brut</span><span className="font-medium">{formatEuro(resultat.impotBrut)}</span></div>
          {resultat.decote > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Décote</span><span className="font-medium text-green-600">-{formatEuro(resultat.decote)}</span></div>
          )}
          <div className="flex justify-between font-semibold"><span>Impôt sur le revenu</span><span>{formatEuro(resultat.impotNet)}</span></div>
          <hr />
          {resultat.pfuCapital > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">PFU revenus mobiliers</span><span className="font-medium">{formatEuro(resultat.pfuCapital)}</span></div>
          )}
          {resultat.prelevementsSociaux > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">Prélèvements sociaux</span><span className="font-medium">{formatEuro(resultat.prelevementsSociaux)}</span></div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total fiscalité</span><span className="text-red-600">{formatEuro(resultat.totalFiscalite)}</span></div>
        </div>
      </Card>

      {/* Barème detail */}
      <Card title="Détail par tranche">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-gray-500 font-medium">Tranche</th>
              <th className="text-right py-2 text-gray-500 font-medium">Taux</th>
              <th className="text-right py-2 text-gray-500 font-medium">Montant</th>
            </tr>
          </thead>
          <tbody>
            {resultat.detailParTranche.map((t, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2">{t.tranche}</td>
                <td className="text-right">{formatPercent(t.taux)}</td>
                <td className="text-right font-medium">{formatEuro(t.montant)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
