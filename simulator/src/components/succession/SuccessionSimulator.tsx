'use client';

import { useState, useMemo } from 'react';
import { calculerSuccession } from '@/lib/calculs/succession';
import { formatEuro, formatPercent } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const lienOptions = [
  { value: 'enfant', label: 'Enfant' },
  { value: 'conjoint', label: 'Conjoint / Partenaire PACS' },
  { value: 'frere_soeur', label: 'Frère / Soeur' },
  { value: 'neveu_niece', label: 'Neveu / Nièce' },
  { value: 'autre', label: 'Autre' },
];

interface BeneficiaireInput {
  id: number;
  lien: 'enfant' | 'conjoint' | 'frere_soeur' | 'neveu_niece' | 'autre';
  prenom: string;
  part: number;
}

export default function SuccessionSimulator({ patrimoine }: { patrimoine: number }) {
  const [patrimoineTransmis, setPatrimoineTransmis] = useState(patrimoine || 500000);
  const [beneficiaires, setBeneficiaires] = useState<BeneficiaireInput[]>([
    { id: 1, lien: 'enfant', prenom: 'Enfant 1', part: 50 },
    { id: 2, lien: 'enfant', prenom: 'Enfant 2', part: 50 },
  ]);
  const [avMontant, setAvMontant] = useState(0);
  const [avAvant70, setAvAvant70] = useState(0);
  const [avApres70, setAvApres70] = useState(0);

  const addBeneficiaire = () => {
    setBeneficiaires([...beneficiaires, {
      id: Date.now(), lien: 'enfant', prenom: `Bénéficiaire ${beneficiaires.length + 1}`, part: 0,
    }]);
  };

  const updateBeneficiaire = (id: number, updates: Partial<BeneficiaireInput>) => {
    setBeneficiaires(beneficiaires.map((b) => b.id === id ? { ...b, ...updates } : b));
  };

  const removeBeneficiaire = (id: number) => {
    setBeneficiaires(beneficiaires.filter((b) => b.id !== id));
  };

  const resultat = useMemo(() => {
    const av = avMontant > 0 ? { montant: avMontant, versementsAvant70: avAvant70, versementsApres70: avApres70 } : null;
    return calculerSuccession(
      patrimoineTransmis,
      beneficiaires.map((b) => ({ lien: b.lien, prenom: b.prenom, part: b.part })),
      av
    );
  }, [patrimoineTransmis, beneficiaires, avMontant, avAvant70, avApres70]);

  return (
    <div className="space-y-6">
      <Card title="Patrimoine transmis">
        <NumberInput label="Patrimoine total transmissible" value={patrimoineTransmis} onChange={setPatrimoineTransmis} />
      </Card>

      <Card title="Bénéficiaires" action={<Button size="sm" onClick={addBeneficiaire}>+ Ajouter</Button>}>
        {beneficiaires.map((b) => (
          <div key={b.id} className="border border-gray-200 rounded-lg p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-700">Bénéficiaire</span>
              <button onClick={() => removeBeneficiaire(b.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input label="Prénom" value={b.prenom} onChange={(e) => updateBeneficiaire(b.id, { prenom: e.target.value })} />
              <Select label="Lien" value={b.lien} onChange={(e) => updateBeneficiaire(b.id, { lien: e.target.value as BeneficiaireInput['lien'] })} options={lienOptions} />
              <NumberInput label="Part" value={b.part} onChange={(v) => updateBeneficiaire(b.id, { part: v })} suffix="%" min={0} max={100} />
            </div>
          </div>
        ))}
      </Card>

      <Card title="Assurance-vie (optionnel)">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput label="Montant total AV" value={avMontant} onChange={setAvMontant} />
          <NumberInput label="Versements avant 70 ans" value={avAvant70} onChange={setAvAvant70} />
          <NumberInput label="Versements après 70 ans" value={avApres70} onChange={setAvApres70} />
        </div>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Patrimoine transmis</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(patrimoineTransmis)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Total droits de succession</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{formatEuro(resultat.totalDroits)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Taux effectif</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {patrimoineTransmis > 0 ? formatPercent(resultat.totalDroits / patrimoineTransmis) : '0 %'}
          </p>
        </div>
      </div>

      <Card title="Détail par bénéficiaire">
        <div className="space-y-4">
          {resultat.beneficiaires.map((b, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">{b.prenom}</h4>
                {b.lien === 'conjoint' ? (
                  <span className="text-green-600 font-medium text-sm">Exonéré</span>
                ) : (
                  <span className="text-red-600 font-bold">{formatEuro(b.droitsDus)}</span>
                )}
              </div>
              {b.lien !== 'conjoint' && (
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Part reçue : {formatEuro(patrimoineTransmis * b.part / 100)}</span>
                    <span>Abattement : {formatEuro(b.abattement)}</span>
                  </div>
                  {b.detailTranches.map((t, j) => (
                    <div key={j} className="flex justify-between text-xs">
                      <span>{t.tranche} ({formatPercent(t.taux)})</span>
                      <span>{formatEuro(t.montant)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {resultat.assuranceVie && resultat.assuranceVie.fiscalite > 0 && (
        <Card title="Fiscalité Assurance-vie">
          <p className="text-sm text-gray-600">
            Fiscalité AV : <span className="font-bold text-red-600">{formatEuro(resultat.assuranceVie.fiscalite)}</span>
          </p>
        </Card>
      )}
    </div>
  );
}
