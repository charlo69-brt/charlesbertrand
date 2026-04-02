'use client';

import { useState } from 'react';
import { Client, SituationFamiliale, RegimeMatrimonial } from '@/lib/types';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import NumberInput from '@/components/ui/NumberInput';
import Button from '@/components/ui/Button';

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: Omit<Client, 'id' | 'creeLe' | 'modifieLe'>) => void;
  onCancel?: () => void;
}

const situationOptions = [
  { value: 'celibataire', label: 'Célibataire' },
  { value: 'marie', label: 'Marié(e)' },
  { value: 'pacse', label: 'Pacsé(e)' },
  { value: 'divorce', label: 'Divorcé(e)' },
  { value: 'veuf', label: 'Veuf/Veuve' },
];

const regimeOptions = [
  { value: 'communaute_legale', label: 'Communauté légale' },
  { value: 'separation_biens', label: 'Séparation de biens' },
  { value: 'communaute_universelle', label: 'Communauté universelle' },
  { value: 'participation_acquets', label: 'Participation aux acquêts' },
];

export default function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [nom, setNom] = useState(initialData?.nom || '');
  const [prenom, setPrenom] = useState(initialData?.prenom || '');
  const [dateNaissance, setDateNaissance] = useState(initialData?.dateNaissance || '');
  const [situationFamiliale, setSituationFamiliale] = useState<SituationFamiliale>(initialData?.situationFamiliale || 'celibataire');
  const [regimeMatrimonial, setRegimeMatrimonial] = useState<RegimeMatrimonial | undefined>(initialData?.regimeMatrimonial);
  const [nombreEnfants, setNombreEnfants] = useState(initialData?.nombreEnfants || 0);
  const [enfantsACharge, setEnfantsACharge] = useState(initialData?.enfantsACharge || 0);
  const [email, setEmail] = useState(initialData?.email || '');
  const [telephone, setTelephone] = useState(initialData?.telephone || '');
  const [adresse, setAdresse] = useState(initialData?.adresse || '');
  const [profession, setProfession] = useState(initialData?.profession || '');

  const showRegime = situationFamiliale === 'marie' || situationFamiliale === 'pacse';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nom,
      prenom,
      dateNaissance,
      situationFamiliale,
      regimeMatrimonial: showRegime ? regimeMatrimonial : undefined,
      nombreEnfants,
      enfantsACharge,
      email: email || undefined,
      telephone: telephone || undefined,
      adresse: adresse || undefined,
      profession: profession || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
        <Input label="Prénom" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Date de naissance" type="date" value={dateNaissance} onChange={(e) => setDateNaissance(e.target.value)} required />
        <Input label="Profession" value={profession} onChange={(e) => setProfession(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Situation familiale"
          value={situationFamiliale}
          onChange={(e) => setSituationFamiliale(e.target.value as SituationFamiliale)}
          options={situationOptions}
        />
        {showRegime && (
          <Select
            label="Régime matrimonial"
            value={regimeMatrimonial || ''}
            onChange={(e) => setRegimeMatrimonial(e.target.value as RegimeMatrimonial)}
            options={regimeOptions}
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumberInput label="Nombre d'enfants" value={nombreEnfants} onChange={setNombreEnfants} suffix="" min={0} max={20} />
        <NumberInput label="Enfants à charge" value={enfantsACharge} onChange={setEnfantsACharge} suffix="" min={0} max={20} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Téléphone" value={telephone} onChange={(e) => setTelephone(e.target.value)} />
      </div>

      <Input label="Adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} />

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>}
        <Button type="submit">{initialData ? 'Modifier' : 'Créer le client'}</Button>
      </div>
    </form>
  );
}
