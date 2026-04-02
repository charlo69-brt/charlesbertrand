'use client';

import { SimulationRetraite } from '@/lib/types';
import { formatEuro, formatPercent } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

interface RetraiteResultProps {
  resultat: SimulationRetraite;
}

export default function RetraiteResult({ resultat }: RetraiteResultProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Pension totale</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{formatEuro(resultat.pensionTotale)}/mois</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Taux plein</p>
          <div className="mt-1">
            <Badge variant={resultat.tauxPlein ? 'green' : 'red'}>
              {resultat.tauxPlein ? 'Oui' : 'Non'}
            </Badge>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Gap mensuel</p>
          <p className={`text-2xl font-bold mt-1 ${resultat.gapMensuel > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {resultat.gapMensuel > 0 ? `-${formatEuro(resultat.gapMensuel)}` : 'Aucun'}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500 uppercase">Capital nécessaire</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatEuro(resultat.capitalNecessaire)}</p>
        </div>
      </div>

      <Card title="Détail de la pension estimée">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Âge de départ</span>
            <span className="font-medium">{resultat.ageDepart} ans</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Trimestres validés / requis</span>
            <span className="font-medium">{resultat.trimestresValides} / {resultat.trimestresRequis}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Décote / Surcote</span>
            <span className={`font-medium ${resultat.decoteSurcote < 0 ? 'text-red-600' : resultat.decoteSurcote > 0 ? 'text-green-600' : ''}`}>
              {resultat.decoteSurcote > 0 ? '+' : ''}{formatPercent(resultat.decoteSurcote)}
            </span>
          </div>
          <hr />
          <div className="flex justify-between">
            <span className="text-gray-500">Régime général</span>
            <span className="font-medium">{formatEuro(resultat.pensionRegimeGeneral)}/mois</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Complémentaire (AGIRC-ARRCO)</span>
            <span className="font-medium">{formatEuro(resultat.pensionComplementaire)}/mois</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Pension totale estimée</span>
            <span className="text-blue-900">{formatEuro(resultat.pensionTotale)}/mois</span>
          </div>
        </div>
      </Card>

      {resultat.gapMensuel > 0 && (
        <Card title="Analyse du gap">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Il manque <strong>{formatEuro(resultat.gapMensuel)}/mois</strong> pour atteindre le niveau de vie souhaité.
              Un capital de <strong>{formatEuro(resultat.capitalNecessaire)}</strong> serait nécessaire pour combler ce gap
              sur la durée estimée de la retraite (jusqu&apos;à 85 ans).
            </p>
            <p className="text-sm text-red-700 mt-2">
              Solutions possibles : PER, assurance-vie, investissement SCPI, épargne complémentaire.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
