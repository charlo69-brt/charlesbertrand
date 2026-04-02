'use client';

import { useState, useMemo } from 'react';
import { simulerDeficitFoncier } from '@/lib/calculs/deficit-foncier';
import { formatEuro } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

export default function DeficitFoncierSimulator() {
  const [travaux, setTravaux] = useState(30000);
  const [revenusFonciers, setRevenusFonciers] = useState(15000);
  const [tmi, setTmi] = useState(30);

  const resultat = useMemo(
    () => simulerDeficitFoncier(travaux, revenusFonciers, tmi / 100),
    [travaux, revenusFonciers, tmi]
  );

  return (
    <div className="space-y-6">
      <Card title="Paramètres Déficit foncier">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput label="Travaux déductibles" value={travaux} onChange={setTravaux} />
          <NumberInput label="Revenus fonciers" value={revenusFonciers} onChange={setRevenusFonciers} />
          <NumberInput label="TMI" value={tmi} onChange={setTmi} suffix="%" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Déficit imputable</p><p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.deficitImputable)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Déficit reportable</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.deficitReportable)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Économie d&apos;impôt</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.economieImpot)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Plafond</p><p className="text-2xl font-bold text-gray-500 mt-1">10 700 €</p></div>
      </div>
    </div>
  );
}
