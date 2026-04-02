'use client';

import { useState, useMemo } from 'react';
import { simulerPER } from '@/lib/calculs/per';
import { formatEuro } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';
import ProjectionLineChart from '@/components/charts/ProjectionLineChart';

export default function PERSimulator() {
  const [versementAnnuel, setVersementAnnuel] = useState(5000);
  const [tmi, setTmi] = useState(30);
  const [revenu, setRevenu] = useState(50000);
  const [taux, setTaux] = useState(3);
  const [duree, setDuree] = useState(20);

  const resultat = useMemo(
    () => simulerPER(versementAnnuel, tmi / 100, revenu, taux, duree),
    [versementAnnuel, tmi, revenu, taux, duree]
  );

  return (
    <div className="space-y-6">
      <Card title="Paramètres PER">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput label="Versement annuel" value={versementAnnuel} onChange={setVersementAnnuel} />
          <NumberInput label="TMI" value={tmi} onChange={setTmi} suffix="%" />
          <NumberInput label="Revenu professionnel" value={revenu} onChange={setRevenu} />
          <NumberInput label="Rendement" value={taux} onChange={setTaux} suffix="%" step={0.1} />
          <NumberInput label="Durée (années)" value={duree} onChange={setDuree} suffix="ans" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Capital estimé</p><p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.capitalEstime)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Économie IR/an</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.economieImpot)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Plafond déductible</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.plafondDeduction)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Éco. totale IR</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.economieImpot * duree)}</p></div>
      </div>

      <Card title="Projection du capital">
        <ProjectionLineChart data={resultat.projectionAnnuelle} />
      </Card>
    </div>
  );
}
