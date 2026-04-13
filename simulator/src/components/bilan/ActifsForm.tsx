'use client';

import { Actifs, BienImmobilier, ActifFinancier, ActifProfessionnel, ModeDetention, SituationFamiliale, RegimeMatrimonial } from '@/lib/types';
import { generateId, getRegimeLabel } from '@/lib/utils';
import { getDefaultDetention } from '@/lib/calculs/regime-matrimonial';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import NumberInput from '@/components/ui/NumberInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ActifsFormProps {
  actifs: Actifs;
  onChange: (actifs: Actifs) => void;
  situationFamiliale?: SituationFamiliale;
  regimeMatrimonial?: RegimeMatrimonial;
}

const typeBienOptions = [
  { value: 'residence_principale', label: 'Résidence principale' },
  { value: 'residence_secondaire', label: 'Résidence secondaire' },
  { value: 'locatif', label: 'Bien locatif' },
  { value: 'scpi', label: 'SCPI' },
];

const typeFinancierOptions = [
  { value: 'compte_courant', label: 'Compte courant' },
  { value: 'livret', label: "Livret d'épargne" },
  { value: 'assurance_vie', label: 'Assurance-vie' },
  { value: 'per', label: 'PER' },
  { value: 'pea', label: 'PEA' },
  { value: 'cto', label: 'CTO' },
];

const detentionOptions = [
  { value: '', label: '— Mode de détention —' },
  { value: 'propre', label: '👤 Bien propre' },
  { value: 'commun', label: '👫 Communauté' },
  { value: 'sci', label: '🏛️ SCI' },
  { value: 'demembrement_np', label: '📜 Nue-propriété' },
  { value: 'demembrement_usu', label: '🔑 Usufruit' },
  { value: 'indivision', label: '🤝 Indivision' },
];

export default function ActifsForm({ actifs, onChange, situationFamiliale, regimeMatrimonial }: ActifsFormProps) {
  const defaultDetention = getDefaultDetention(regimeMatrimonial, situationFamiliale);
  const isCouple = situationFamiliale === 'marie' || situationFamiliale === 'pacse';

  const addImmobilier = () => {
    onChange({
      ...actifs,
      immobilier: [...actifs.immobilier, {
        id: generateId(), label: '', type: 'residence_principale', valeur: 0,
        detention: isCouple ? defaultDetention : undefined,
      }],
    });
  };

  const updateImmobilier = (id: string, updates: Partial<BienImmobilier>) => {
    onChange({
      ...actifs,
      immobilier: actifs.immobilier.map((b) => b.id === id ? { ...b, ...updates } : b),
    });
  };

  const removeImmobilier = (id: string) => {
    onChange({ ...actifs, immobilier: actifs.immobilier.filter((b) => b.id !== id) });
  };

  const addFinancier = () => {
    onChange({
      ...actifs,
      financier: [...actifs.financier, {
        id: generateId(), label: '', type: 'compte_courant', valeur: 0,
        detention: isCouple ? defaultDetention : undefined,
      }],
    });
  };

  const updateFinancier = (id: string, updates: Partial<ActifFinancier>) => {
    onChange({
      ...actifs,
      financier: actifs.financier.map((a) => a.id === id ? { ...a, ...updates } : a),
    });
  };

  const removeFinancier = (id: string) => {
    onChange({ ...actifs, financier: actifs.financier.filter((a) => a.id !== id) });
  };

  const addProfessionnel = () => {
    onChange({
      ...actifs,
      professionnel: [...actifs.professionnel, { id: generateId(), label: '', valeur: 0 }],
    });
  };

  const updateProfessionnel = (id: string, updates: Partial<ActifProfessionnel>) => {
    onChange({
      ...actifs,
      professionnel: actifs.professionnel.map((a) => a.id === id ? { ...a, ...updates } : a),
    });
  };

  const removeProfessionnel = (id: string) => {
    onChange({ ...actifs, professionnel: actifs.professionnel.filter((a) => a.id !== id) });
  };

  return (
    <div className="space-y-6">
      {isCouple && regimeMatrimonial && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-center gap-2">
          <span>👫</span>
          <span>
            Régime : <strong>{getRegimeLabel(regimeMatrimonial)}</strong> — les nouveaux biens sont automatiquement en mode <strong>{defaultDetention === 'commun' ? 'communauté' : 'bien propre'}</strong>. Vous pouvez modifier individuellement.
          </span>
        </div>
      )}
      {/* Immobilier */}
      <Card title="Actifs immobiliers" action={<Button size="sm" onClick={addImmobilier}>+ Ajouter</Button>}>
        {actifs.immobilier.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun bien immobilier</p>
        ) : (
          <div className="space-y-4">
            {actifs.immobilier.map((bien) => (
              <div key={bien.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Bien immobilier</span>
                  <button onClick={() => removeImmobilier(bien.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Libellé" value={bien.label} onChange={(e) => updateImmobilier(bien.id, { label: e.target.value })} />
                  <Select label="Type" value={bien.type} onChange={(e) => updateImmobilier(bien.id, { type: e.target.value as BienImmobilier['type'] })} options={typeBienOptions} />
                  <NumberInput label="Valeur estimée" value={bien.valeur} onChange={(v) => updateImmobilier(bien.id, { valeur: v })} />
                  <NumberInput label="Capital restant dû" value={bien.capitalRestantDu || 0} onChange={(v) => updateImmobilier(bien.id, { capitalRestantDu: v })} />
                  <Select label="Mode de détention" value={bien.detention || ''} onChange={(e) => updateImmobilier(bien.id, { detention: (e.target.value || undefined) as ModeDetention | undefined })} options={detentionOptions} />
                  <Input label="Détail détention" value={bien.detentionDetail || ''} onChange={(e) => updateImmobilier(bien.id, { detentionDetail: e.target.value })} placeholder="Ex: SCI Invest, 50% indivision..." />
                  {bien.type === 'locatif' && (
                    <>
                      <NumberInput label="Loyer annuel" value={bien.loyerAnnuel || 0} onChange={(v) => updateImmobilier(bien.id, { loyerAnnuel: v })} />
                      <NumberInput label="Charges annuelles" value={bien.chargesAnnuelles || 0} onChange={(v) => updateImmobilier(bien.id, { chargesAnnuelles: v })} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Financier */}
      <Card title="Actifs financiers" action={<Button size="sm" onClick={addFinancier}>+ Ajouter</Button>}>
        {actifs.financier.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun actif financier</p>
        ) : (
          <div className="space-y-4">
            {actifs.financier.map((actif) => (
              <div key={actif.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Actif financier</span>
                  <button onClick={() => removeFinancier(actif.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Libellé" value={actif.label} onChange={(e) => updateFinancier(actif.id, { label: e.target.value })} />
                  <Select label="Type" value={actif.type} onChange={(e) => updateFinancier(actif.id, { type: e.target.value as ActifFinancier['type'] })} options={typeFinancierOptions} />
                  <NumberInput label="Valeur" value={actif.valeur} onChange={(v) => updateFinancier(actif.id, { valeur: v })} />
                  <NumberInput label="Taux rendement" value={actif.tauxRendement || 0} onChange={(v) => updateFinancier(actif.id, { tauxRendement: v })} suffix="%" />
                  <Select label="Mode de détention" value={actif.detention || ''} onChange={(e) => updateFinancier(actif.id, { detention: (e.target.value || undefined) as ModeDetention | undefined })} options={detentionOptions} />
                  <Input label="Détail détention" value={actif.detentionDetail || ''} onChange={(e) => updateFinancier(actif.id, { detentionDetail: e.target.value })} placeholder="Ex: Co-titulaire, démembré..." />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Professionnel */}
      <Card title="Actifs professionnels" action={<Button size="sm" onClick={addProfessionnel}>+ Ajouter</Button>}>
        {actifs.professionnel.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun actif professionnel</p>
        ) : (
          <div className="space-y-4">
            {actifs.professionnel.map((actif) => (
              <div key={actif.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-700">Actif professionnel</span>
                  <button onClick={() => removeProfessionnel(actif.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Libellé" value={actif.label} onChange={(e) => updateProfessionnel(actif.id, { label: e.target.value })} />
                  <NumberInput label="Valeur" value={actif.valeur} onChange={(v) => updateProfessionnel(actif.id, { valeur: v })} />
                  <Select label="Mode de détention" value={actif.detention || ''} onChange={(e) => updateProfessionnel(actif.id, { detention: (e.target.value || undefined) as ModeDetention | undefined })} options={detentionOptions} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
