'use client';

import { useState, useMemo } from 'react';
import { calculerDemembrement } from '@/lib/calculs/demembrement';
import { formatEuro, formatPercent } from '@/lib/utils';
import { BAREME_USUFRUIT_FISCAL } from '@/lib/constants';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

export default function DemembrementTable() {
  const [valeurBien, setValeurBien] = useState(300000);
  const [age, setAge] = useState(65);

  const resultat = useMemo(() => calculerDemembrement(valeurBien, age), [valeurBien, age]);

  return (
    <div className="space-y-6">
      <Card title="Calcul de démembrement">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <NumberInput label="Valeur du bien" value={valeurBien} onChange={setValeurBien} />
          <NumberInput label="Âge de l'usufruitier" value={age} onChange={setAge} suffix="ans" min={0} max={100} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 uppercase">Usufruit ({formatPercent(resultat.partUsufruit)})</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.valeurUsufruit)}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-xs text-green-600 uppercase">Nue-propriété ({formatPercent(resultat.partNuePropriete)})</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatEuro(resultat.valeurNuePropriete)}</p>
          </div>
        </div>
      </Card>

      <Card title="Barème fiscal du démembrement (Art. 669 CGI)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-gray-500 font-medium">Âge de l&apos;usufruitier</th>
              <th className="text-right py-2 text-gray-500 font-medium">Usufruit</th>
              <th className="text-right py-2 text-gray-500 font-medium">Nue-propriété</th>
            </tr>
          </thead>
          <tbody>
            {BAREME_USUFRUIT_FISCAL.map((t, i) => (
              <tr key={i} className={`border-b border-gray-100 ${age >= t.ageMin && age < t.ageMax ? 'bg-blue-50 font-medium' : ''}`}>
                <td className="py-2">{t.ageMin} - {t.ageMax === Infinity ? '...' : t.ageMax} ans</td>
                <td className="text-right">{formatPercent(t.usufruit)}</td>
                <td className="text-right">{formatPercent(1 - t.usufruit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
