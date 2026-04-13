'use client';

import { useState, useMemo } from 'react';
import { Client, OptionConjoint } from '@/lib/types';
import { calculerDMTG, comparerOptionsDMTG, DMTGEnfantInput } from '@/lib/calculs/dmtg';
import { formatEuro, formatPercent, calculateAge } from '@/lib/utils';
import NumberInput from '@/components/ui/NumberInput';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface DMTGCalculatorProps {
  client: Client;
  patrimoine: number;
  passifs: number;
  actifs?: { valeur: number; detention?: string }[];
}

const optionLabels: Record<OptionConjoint, { label: string; description: string }> = {
  usufruit_totalite: {
    label: 'Usufruit de la totalité',
    description: 'Le conjoint reçoit l\'usufruit de l\'ensemble de la succession (art. 757 C. civ.)',
  },
  quart_pleine_propriete: {
    label: '1/4 en pleine propriété',
    description: 'Le conjoint reçoit le quart de la succession en pleine propriété (art. 757 C. civ.)',
  },
  quotite_disponible_pp: {
    label: 'Quotité disponible en PP',
    description: 'Donation au dernier vivant : le conjoint reçoit la quotité disponible en pleine propriété',
  },
  quart_pp_trois_quarts_usu: {
    label: '1/4 PP + 3/4 usufruit',
    description: 'Donation au dernier vivant : 1/4 en pleine propriété et 3/4 en usufruit',
  },
  usufruit_totalite_ddv: {
    label: 'Usufruit totalité (DDV)',
    description: 'Donation au dernier vivant : usufruit de la totalité de la succession',
  },
};

export default function DMTGCalculator({ client, patrimoine, passifs, actifs }: DMTGCalculatorProps) {
  const membres = client.membres || [];
  const conjoint = membres.find(m => m.lien === 'conjoint');
  const enfantsMembres = membres.filter(m => m.lien === 'enfant');
  const isCouple = client.situationFamiliale === 'marie' || client.situationFamiliale === 'pacse';

  const [patrimoineTotal, setPatrimoineTotal] = useState(patrimoine || 500000);
  const [totalPassifs, setTotalPassifs] = useState(passifs || 0);
  const [optionConjoint, setOptionConjoint] = useState<OptionConjoint>('usufruit_totalite');
  const [clauseAttribution, setClauseAttribution] = useState(false);
  const [ageConjoint, setAgeConjoint] = useState(
    conjoint?.dateNaissance ? calculateAge(conjoint.dateNaissance) : 65
  );
  const [showComparison, setShowComparison] = useState(false);

  const [enfants, setEnfants] = useState<DMTGEnfantInput[]>(
    enfantsMembres.length > 0
      ? enfantsMembres.map(e => ({ prenom: e.prenom || 'Enfant' }))
      : client.nombreEnfants > 0
        ? Array.from({ length: client.nombreEnfants }, (_, i) => ({ prenom: `Enfant ${i + 1}` }))
        : [{ prenom: 'Enfant 1' }, { prenom: 'Enfant 2' }]
  );

  const addEnfant = () => setEnfants([...enfants, { prenom: `Enfant ${enfants.length + 1}` }]);
  const removeEnfant = (i: number) => setEnfants(enfants.filter((_, idx) => idx !== i));
  const updateEnfant = (i: number, prenom: string) => setEnfants(enfants.map((e, idx) => idx === i ? { ...e, prenom } : e));

  const dmtgInput = useMemo(() => ({
    patrimoineTotal,
    passifs: totalPassifs,
    actifs: actifs as { valeur: number; detention?: import('@/lib/types').ModeDetention }[] | undefined,
    regimeMatrimonial: client.regimeMatrimonial,
    situationFamiliale: client.situationFamiliale,
    clauseAttributionIntegrale: clauseAttribution,
    ageConjoint,
    enfants,
  }), [patrimoineTotal, totalPassifs, actifs, client.regimeMatrimonial, client.situationFamiliale, clauseAttribution, ageConjoint, enfants]);

  const resultat = useMemo(() => calculerDMTG({ ...dmtgInput, optionConjoint }), [dmtgInput, optionConjoint]);
  const comparaison = useMemo(() => showComparison ? comparerOptionsDMTG(dmtgInput) : [], [dmtgInput, showComparison]);

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card title="Paramètres de la succession">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NumberInput label="Patrimoine total" value={patrimoineTotal} onChange={setPatrimoineTotal} />
          <NumberInput label="Passifs déductibles" value={totalPassifs} onChange={setTotalPassifs} />
        </div>

        {isCouple && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput label="Âge du conjoint survivant" value={ageConjoint} onChange={setAgeConjoint} suffix="ans" min={0} max={120} />
              <div>
                <p className="text-xs text-gray-500 mb-1">Régime matrimonial</p>
                <p className="text-sm font-medium text-gray-900">
                  {client.regimeMatrimonial === 'communaute_legale' ? 'Communauté légale' :
                    client.regimeMatrimonial === 'separation_biens' ? 'Séparation de biens' :
                      client.regimeMatrimonial === 'communaute_universelle' ? 'Communauté universelle' :
                        client.regimeMatrimonial === 'participation_acquets' ? 'Participation aux acquêts' : 'Non renseigné'}
                </p>
              </div>
            </div>

            {client.regimeMatrimonial === 'communaute_universelle' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={clauseAttribution}
                  onChange={(e) => setClauseAttribution(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                Clause d&apos;attribution intégrale au survivant
              </label>
            )}
          </div>
        )}
      </Card>

      {/* Option conjoint */}
      {isCouple && enfants.length > 0 && (
        <Card title="Choix du conjoint survivant">
          <div className="space-y-3">
            {(Object.entries(optionLabels) as [OptionConjoint, { label: string; description: string }][]).map(([key, val]) => (
              <label key={key} className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${optionConjoint === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <input
                  type="radio"
                  name="optionConjoint"
                  value={key}
                  checked={optionConjoint === key}
                  onChange={() => setOptionConjoint(key)}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{val.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{val.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
      )}

      {/* Enfants */}
      <Card title={`Enfants héritiers (${enfants.length})`} action={<Button size="sm" onClick={addEnfant}>+ Ajouter</Button>}>
        {enfants.map((e, i) => (
          <div key={i} className="flex items-center gap-3 mb-2">
            <span className="text-sm text-gray-500 w-6">{i + 1}.</span>
            <input
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={e.prenom}
              onChange={(ev) => updateEnfant(i, ev.target.value)}
              placeholder="Prénom"
            />
            {enfants.length > 1 && (
              <button onClick={() => removeEnfant(i)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
            )}
          </div>
        ))}
      </Card>

      {/* Résultats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Masse successorale</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatEuro(resultat.masseSuccessorale)}</p>
          {resultat.partConjointRegime > 0 && (
            <p className="text-xs text-gray-500 mt-1">Part conjoint (régime) : {formatEuro(resultat.partConjointRegime)}</p>
          )}
        </div>
        <div className="bg-white rounded-xl border-2 border-green-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Part conjoint</p>
          <p className="text-xl font-bold text-green-600 mt-1">Exonéré</p>
          <p className="text-xs text-gray-500 mt-1">
            {resultat.partConjoint.pp > 0 && `PP: ${formatEuro(resultat.partConjoint.pp)}`}
            {resultat.partConjoint.pp > 0 && resultat.partConjoint.usufruit > 0 && ' + '}
            {resultat.partConjoint.usufruit > 0 && `Usufruit: ${formatEuro(resultat.partConjoint.usufruit)}`}
          </p>
        </div>
        <div className="bg-white rounded-xl border-2 border-red-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Total DMTG</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatEuro(resultat.totalDroits)}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase">Taux effectif</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{formatPercent(resultat.tauxEffectif)}</p>
        </div>
      </div>

      {/* Détail par enfant */}
      {resultat.enfantsResults.length > 0 && (
        <Card title="Détail par enfant">
          <div className="space-y-4">
            {resultat.enfantsResults.map((e, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">👶 {e.prenom}</h4>
                  <span className="text-red-600 font-bold">{formatEuro(e.droits)}</span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Valeur fiscale reçue</span>
                    <span>{formatEuro(e.valeurFiscale)}</span>
                  </div>
                  {e.partNP > 0 && (
                    <div className="flex justify-between text-xs">
                      <span>dont nue-propriété (art. 669)</span>
                      <span>{formatEuro(e.partNP)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Abattement</span>
                    <span className="text-green-600">- {formatEuro(e.abattement)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Taxable</span>
                    <span>{formatEuro(e.taxable)}</span>
                  </div>
                  {e.detailTranches.map((t, j) => (
                    <div key={j} className="flex justify-between text-xs">
                      <span>{t.tranche} ({formatPercent(t.taux)})</span>
                      <span>{formatEuro(t.montant)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comparaison */}
      {isCouple && enfants.length > 0 && (
        <div>
          <Button
            variant="secondary"
            onClick={() => setShowComparison(!showComparison)}
            className="mb-4"
          >
            {showComparison ? 'Masquer la comparaison' : 'Comparer toutes les options'}
          </Button>

          {showComparison && comparaison.length > 0 && (
            <Card title="Comparaison des options du conjoint survivant">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 pr-4 text-gray-500 font-medium">Option</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Total DMTG</th>
                      <th className="text-right py-2 px-3 text-gray-500 font-medium">Taux effectif</th>
                      <th className="text-right py-2 pl-3 text-gray-500 font-medium">Économie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparaison.map(({ option, result }, i) => {
                      const isBest = i === 0;
                      const economie = comparaison[comparaison.length - 1].result.totalDroits - result.totalDroits;
                      return (
                        <tr key={option} className={`border-b border-gray-50 ${isBest ? 'bg-green-50' : ''}`}>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              {isBest && <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Optimal</span>}
                              <span className={`${option === optionConjoint ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
                                {optionLabels[option].label}
                              </span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-3 font-semibold text-gray-900">{formatEuro(result.totalDroits)}</td>
                          <td className="text-right py-2 px-3 text-gray-600">{formatPercent(result.tauxEffectif)}</td>
                          <td className="text-right py-2 pl-3 text-green-600 font-medium">
                            {economie > 0 ? `- ${formatEuro(economie)}` : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
