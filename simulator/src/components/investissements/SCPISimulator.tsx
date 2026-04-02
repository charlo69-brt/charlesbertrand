'use client';

import { useState, useMemo } from 'react';
import { simulerSCPI } from '@/lib/calculs/scpi';
import { formatEuro } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

export default function SCPISimulator() {
  const [montant, setMontant] = useState(50000);
  const [taux, setTaux] = useState(4.5);
  const [tmi, setTmi] = useState(30);

  const resultat = useMemo(
    () => simulerSCPI(montant, taux, tmi / 100),
    [montant, taux, tmi]
  );

  return (
    <div className="space-y-6">
      <Card title="Paramètres SCPI">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput label="Montant investi" value={montant} onChange={setMontant} />
          <NumberInput label="Taux distribution" value={taux} onChange={setTaux} suffix="%" step={0.1} />
          <NumberInput label="TMI" value={tmi} onChange={setTmi} suffix="%" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Revenus annuels</p><p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.revenusAnnuels)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Fiscalité</p><p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(resultat.fiscaliteRevenusFonciers)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Revenus nets</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.revenusAnnuels - resultat.fiscaliteRevenusFonciers)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Rendement net</p><p className="text-2xl font-bold text-gray-900 mt-1">{resultat.rendementNet.toFixed(2)} %</p></div>
      </div>
    </div>
  );
}
