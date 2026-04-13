'use client';

import { Client, MembreFamille, LienParente } from '@/lib/types';
import { generateId, calculateAge, getLienParenteLabel } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface FamilleManagerProps {
  client: Client;
  onUpdate: (membres: MembreFamille[]) => void;
}

const lienOptions = [
  { value: 'conjoint', label: 'Conjoint' },
  { value: 'enfant', label: 'Enfant' },
  { value: 'parent', label: 'Parent' },
  { value: 'frere_soeur', label: 'Frère / Soeur' },
];

export default function FamilleManager({ client, onUpdate }: FamilleManagerProps) {
  const membres = client.membres || [];
  const isCouple = client.situationFamiliale === 'marie' || client.situationFamiliale === 'pacse';
  const hasConjoint = membres.some(m => m.lien === 'conjoint');
  const enfants = membres.filter(m => m.lien === 'enfant');
  const autres = membres.filter(m => m.lien !== 'conjoint' && m.lien !== 'enfant');
  const conjoint = membres.find(m => m.lien === 'conjoint');

  const addMembre = (lien: LienParente) => {
    const nouveau: MembreFamille = {
      id: generateId(),
      prenom: '',
      dateNaissance: '',
      lien,
      estACharge: lien === 'enfant' ? true : undefined,
    };
    onUpdate([...membres, nouveau]);
  };

  const updateMembre = (id: string, updates: Partial<MembreFamille>) => {
    onUpdate(membres.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const removeMembre = (id: string) => {
    onUpdate(membres.filter(m => m.id !== id));
  };

  const filteredLienOptions = lienOptions.filter(opt => {
    if (opt.value === 'conjoint' && hasConjoint) return false;
    if (opt.value === 'conjoint' && !isCouple) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Conjoint */}
      {isCouple && (
        <Card
          title="Conjoint"
          action={
            !hasConjoint ? (
              <Button size="sm" onClick={() => addMembre('conjoint')}>+ Ajouter le conjoint</Button>
            ) : undefined
          }
        >
          {conjoint ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💍</span>
                  <span className="text-sm font-medium text-gray-700">
                    {client.situationFamiliale === 'marie' ? 'Époux(se)' : 'Partenaire PACS'}
                  </span>
                </div>
                <button onClick={() => removeMembre(conjoint.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  label="Prénom"
                  value={conjoint.prenom}
                  onChange={(e) => updateMembre(conjoint.id, { prenom: e.target.value })}
                />
                <Input
                  label="Nom"
                  value={conjoint.nom || ''}
                  onChange={(e) => updateMembre(conjoint.id, { nom: e.target.value })}
                />
                <Input
                  label="Date de naissance"
                  type="date"
                  value={conjoint.dateNaissance}
                  onChange={(e) => updateMembre(conjoint.id, { dateNaissance: e.target.value })}
                />
              </div>
              {conjoint.dateNaissance && (
                <p className="text-xs text-gray-500 mt-2">Âge : {calculateAge(conjoint.dateNaissance)} ans</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {isCouple ? 'Aucun conjoint renseigné. Ajoutez les informations du conjoint.' : 'Non applicable'}
            </p>
          )}
        </Card>
      )}

      {/* Enfants */}
      <Card
        title={`Enfants (${enfants.length})`}
        action={<Button size="sm" onClick={() => addMembre('enfant')}>+ Ajouter un enfant</Button>}
      >
        {enfants.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun enfant renseigné</p>
        ) : (
          <div className="space-y-3">
            {enfants.map((enfant, index) => (
              <div key={enfant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👶</span>
                    <span className="text-sm font-medium text-gray-700">Enfant {index + 1}</span>
                  </div>
                  <button onClick={() => removeMembre(enfant.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    label="Prénom"
                    value={enfant.prenom}
                    onChange={(e) => updateMembre(enfant.id, { prenom: e.target.value })}
                  />
                  <Input
                    label="Nom"
                    value={enfant.nom || ''}
                    onChange={(e) => updateMembre(enfant.id, { nom: e.target.value })}
                  />
                  <Input
                    label="Date de naissance"
                    type="date"
                    value={enfant.dateNaissance}
                    onChange={(e) => updateMembre(enfant.id, { dateNaissance: e.target.value })}
                  />
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-gray-700 pb-2">
                      <input
                        type="checkbox"
                        checked={enfant.estACharge ?? false}
                        onChange={(e) => updateMembre(enfant.id, { estACharge: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      À charge fiscalement
                    </label>
                  </div>
                </div>
                {enfant.dateNaissance && (
                  <p className="text-xs text-gray-500 mt-2">Âge : {calculateAge(enfant.dateNaissance)} ans</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Autres membres */}
      <Card
        title="Autres membres de la famille"
        action={
          <Select
            label=""
            value=""
            onChange={(e) => {
              if (e.target.value) addMembre(e.target.value as LienParente);
            }}
            options={[{ value: '', label: '+ Ajouter...' }, ...filteredLienOptions.filter(o => o.value !== 'conjoint' && o.value !== 'enfant')]}
          />
        }
      >
        {autres.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun autre membre renseigné</p>
        ) : (
          <div className="space-y-3">
            {autres.map((membre) => (
              <div key={membre.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">👪</span>
                    <span className="text-sm font-medium text-gray-700">{getLienParenteLabel(membre.lien)}</span>
                  </div>
                  <button onClick={() => removeMembre(membre.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Prénom"
                    value={membre.prenom}
                    onChange={(e) => updateMembre(membre.id, { prenom: e.target.value })}
                  />
                  <Input
                    label="Nom"
                    value={membre.nom || ''}
                    onChange={(e) => updateMembre(membre.id, { nom: e.target.value })}
                  />
                  <Input
                    label="Date de naissance"
                    type="date"
                    value={membre.dateNaissance}
                    onChange={(e) => updateMembre(membre.id, { dateNaissance: e.target.value })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
