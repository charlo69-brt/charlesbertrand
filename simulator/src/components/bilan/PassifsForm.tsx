'use client';

import { Passifs, Credit, AutreDette } from '@/lib/types';
import { generateId } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import NumberInput from '@/components/ui/NumberInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface PassifsFormProps {
  passifs: Passifs;
  onChange: (passifs: Passifs) => void;
}

const typeCreditOptions = [
  { value: 'immobilier', label: 'Crédit immobilier' },
  { value: 'consommation', label: 'Crédit consommation' },
  { value: 'autre', label: 'Autre' },
];

export default function PassifsForm({ passifs, onChange }: PassifsFormProps) {
  const addCredit = () => {
    onChange({
      ...passifs,
      credits: [...passifs.credits, {
        id: generateId(), label: '', type: 'immobilier', capitalRestant: 0,
        mensualite: 0, tauxInteret: 0, dureeRestanteMois: 0,
      }],
    });
  };

  const updateCredit = (id: string, updates: Partial<Credit>) => {
    onChange({
      ...passifs,
      credits: passifs.credits.map((c) => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const removeCredit = (id: string) => {
    onChange({ ...passifs, credits: passifs.credits.filter((c) => c.id !== id) });
  };

  const addDette = () => {
    onChange({
      ...passifs,
      autresDettes: [...passifs.autresDettes, { id: generateId(), label: '', montant: 0 }],
    });
  };

  const updateDette = (id: string, updates: Partial<AutreDette>) => {
    onChange({
      ...passifs,
      autresDettes: passifs.autresDettes.map((d) => d.id === id ? { ...d, ...updates } : d),
    });
  };

  const removeDette = (id: string) => {
    onChange({ ...passifs, autresDettes: passifs.autresDettes.filter((d) => d.id !== id) });
  };

  return (
    <div className="space-y-6">
      <Card title="Crédits en cours" action={<Button size="sm" onClick={addCredit}>+ Ajouter</Button>}>
        {passifs.credits.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun crédit en cours</p>
        ) : (
          <div className="space-y-4">
            {passifs.credits.map((credit) => (
              <div key={credit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Crédit</span>
                  <button onClick={() => removeCredit(credit.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Libellé" value={credit.label} onChange={(e) => updateCredit(credit.id, { label: e.target.value })} />
                  <Select label="Type" value={credit.type} onChange={(e) => updateCredit(credit.id, { type: e.target.value as Credit['type'] })} options={typeCreditOptions} />
                  <NumberInput label="Capital restant" value={credit.capitalRestant} onChange={(v) => updateCredit(credit.id, { capitalRestant: v })} />
                  <NumberInput label="Mensualité" value={credit.mensualite} onChange={(v) => updateCredit(credit.id, { mensualite: v })} />
                  <NumberInput label="Taux d'intérêt" value={credit.tauxInteret} onChange={(v) => updateCredit(credit.id, { tauxInteret: v })} suffix="%" />
                  <NumberInput label="Durée restante (mois)" value={credit.dureeRestanteMois} onChange={(v) => updateCredit(credit.id, { dureeRestanteMois: v })} suffix="mois" />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Autres dettes" action={<Button size="sm" onClick={addDette}>+ Ajouter</Button>}>
        {passifs.autresDettes.length === 0 ? (
          <p className="text-sm text-gray-500">Aucune autre dette</p>
        ) : (
          <div className="space-y-4">
            {passifs.autresDettes.map((dette) => (
              <div key={dette.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Dette</span>
                  <button onClick={() => removeDette(dette.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Libellé" value={dette.label} onChange={(e) => updateDette(dette.id, { label: e.target.value })} />
                  <NumberInput label="Montant" value={dette.montant} onChange={(v) => updateDette(dette.id, { montant: v })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
