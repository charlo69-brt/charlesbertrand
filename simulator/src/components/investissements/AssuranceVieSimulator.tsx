'use client';

import { useState, useMemo } from 'react';
import { simulerAssuranceVie } from '@/lib/calculs/assurance-vie';
import { formatEuro } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';
import ProjectionLineChart from '@/components/charts/ProjectionLineChart';

export default function AssuranceVieSimulator() {
  const [versementInitial, setVersementInitial] = useState(10000);
  const [versementsMensuels, setVersementsMensuels] = useState(200);
  const [tauxFE, setTauxFE] = useState(2.5);
  const [tauxUC, setTauxUC] = useState(5);
  const [repartitionFE, setRepartitionFE] = useState(60);
  const [duree, setDuree] = useState(15);

  const resultat = useMemo(
    () => simulerAssuranceVie(versementInitial, versementsMensuels, tauxFE, tauxUC, repartitionFE, duree),
    [versementInitial, versementsMensuels, tauxFE, tauxUC, repartitionFE, duree]
  );

  return (
    <div className="space-y-6">
      <Card title="Paramètres">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput label="Versement initial" value={versementInitial} onChange={setVersementInitial} />
          <NumberInput label="Versements mensuels" value={versementsMensuels} onChange={setVersementsMensuels} />
          <NumberInput label="Durée (années)" value={duree} onChange={setDuree} suffix="ans" min={1} max={50} />
          <NumberInput label="Taux fonds euros" value={tauxFE} onChange={setTauxFE} suffix="%" step={0.1} />
          <NumberInput label="Taux UC" value={tauxUC} onChange={setTauxUC} suffix="%" step={0.1} />
          <NumberInput label="Part fonds euros" value={repartitionFE} onChange={setRepartitionFE} suffix="%" min={0} max={100} />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Capital final</p><p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.capitalFinal)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Total versé</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.totalVersements)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Plus-value</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.plusValue)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Fiscalité après 8 ans</p><p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(resultat.fiscaliteApres8ans.impot)}</p></div>
      </div>

      <Card title="Projection du capital">
        <ProjectionLineChart
          data={resultat.projectionAnnuelle.map((p) => ({
            annee: p.annee,
            capital: p.capital,
            versements: resultat.versementInitial + resultat.versementsMensuels * 12 * p.annee,
          }))}
        />
      </Card>
    </div>
  );
}
