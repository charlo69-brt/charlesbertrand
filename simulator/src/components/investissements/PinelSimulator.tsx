'use client';

import { useState, useMemo } from 'react';
import { simulerPinel } from '@/lib/calculs/pinel';
import { formatEuro, formatPercent } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';

const dureeOptions = [
  { value: '6', label: '6 ans' },
  { value: '9', label: '9 ans' },
  { value: '12', label: '12 ans' },
];

export default function PinelSimulator() {
  const [montant, setMontant] = useState(200000);
  const [duree, setDuree] = useState<6 | 9 | 12>(9);

  const resultat = useMemo(
    () => simulerPinel(montant, duree),
    [montant, duree]
  );

  return (
    <div className="space-y-6">
      <Card title="Paramètres Pinel">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput label="Montant investissement" value={montant} onChange={setMontant} />
          <Select
            label="Durée d'engagement"
            value={String(duree)}
            onChange={(e) => setDuree(Number(e.target.value) as 6 | 9 | 12)}
            options={dureeOptions}
          />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Taux réduction</p><p className="text-2xl font-bold text-blue-900 mt-1">{formatPercent(resultat.tauxReduction)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Réduction totale</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.reductionTotale)}</p></div>
        <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500 uppercase">Réduction annuelle</p><p className="text-2xl font-bold text-green-600 mt-1">{formatEuro(resultat.reductionAnnuelle)}</p></div>
      </div>

      <Card title="Information">
        <p className="text-sm text-gray-600">
          Le dispositif Pinel post-2023 offre une réduction d&apos;impôt de {formatPercent(resultat.tauxReduction)} sur {duree} ans,
          soit {formatEuro(resultat.reductionAnnuelle)} par an. Le montant retenu est plafonné à 300 000 € et 5 500 €/m².
        </p>
      </Card>
    </div>
  );
}
