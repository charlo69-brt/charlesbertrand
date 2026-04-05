'use client';

import { useState, useMemo } from 'react';
import { Revenus, SituationFamiliale } from '@/lib/types';
import { formatEuro, formatPercent } from '@/lib/utils';
import { comparerRCM } from '@/lib/calculs/comparateur-rcm';
import NumberInput from '@/components/ui/NumberInput';
import Card from '@/components/ui/Card';

interface ComparateurRCMProps {
  revenus: Revenus;
  situation: SituationFamiliale;
  enfantsACharge: number;
}

export default function ComparateurRCM({ revenus, situation, enfantsACharge }: ComparateurRCMProps) {
  const [rcmBrut, setRcmBrut] = useState(revenus.revenusMobiliers || 5000);
  const [dividendes, setDividendes] = useState(revenus.revenusMobiliers || 5000);
  const [isAV, setIsAV] = useState(false);

  const result = useMemo(
    () => comparerRCM(revenus, rcmBrut, dividendes, situation, enfantsACharge, isAV),
    [revenus, rcmBrut, dividendes, situation, enfantsACharge, isAV]
  );

  const recommended = result.optionRecommandee;

  return (
    <Card title="⚖️ Comparateur RCM : PFU vs Barème IR">
      <div className="space-y-6">
        {/* Inputs */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Paramètres des revenus mobiliers</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NumberInput
              label="RCM bruts totaux"
              value={rcmBrut}
              onChange={setRcmBrut}
            />
            <NumberInput
              label="Dont dividendes (abattement 40%)"
              value={dividendes}
              onChange={(v) => setDividendes(Math.min(v, rcmBrut))}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <div className="flex gap-3 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isAV}
                    onChange={() => setIsAV(false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">CTO / Dividendes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isAV}
                    onChange={() => setIsAV(true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Assurance-vie</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Side by side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PFU Card */}
          <div className={`rounded-xl border-2 p-5 ${recommended === 'pfu' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-gray-900">
                PFU (Flat Tax)
              </h4>
              {recommended === 'pfu' && (
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMANDÉ</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IR forfaitaire (12,8%)</span>
                <span className="text-sm font-semibold">{formatEuro(result.pfuIR)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Prélèvements sociaux ({isAV ? '17,2%' : '18,6%'})</span>
                <span className="text-sm font-semibold">{formatEuro(result.pfuPS)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total PFU</span>
                <span className="text-xl font-bold text-gray-900">{formatEuro(result.pfuTotal)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Taux effectif : {rcmBrut > 0 ? formatPercent(result.pfuTotal / rcmBrut) : '0%'}
              </div>
            </div>
          </div>

          {/* Barème Card */}
          <div className={`rounded-xl border-2 p-5 ${recommended === 'bareme' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-gray-900">
                Barème progressif
              </h4>
              {recommended === 'bareme' && (
                <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">RECOMMANDÉ</span>
              )}
            </div>
            <div className="space-y-3">
              {result.abattement40 > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Abattement 40% dividendes</span>
                  <span className="text-sm font-semibold text-green-600">-{formatEuro(result.abattement40)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">CSG déductible (6,8%)</span>
                <span className="text-sm font-semibold text-green-600">-{formatEuro(result.csgDeductible)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">IR supplémentaire (TMI {formatPercent(result.tmiAvecRCM)})</span>
                <span className="text-sm font-semibold">{formatEuro(result.irSupplementaire)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Prélèvements sociaux ({isAV ? '17,2%' : '18,6%'})</span>
                <span className="text-sm font-semibold">{formatEuro(result.psBareme)}</span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total barème</span>
                <span className="text-xl font-bold text-gray-900">{formatEuro(result.baremeTotal)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Taux effectif : {rcmBrut > 0 ? formatPercent(result.baremeTotal / rcmBrut) : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={`rounded-xl p-5 ${result.economie > 0 ? 'bg-blue-50 border-2 border-blue-200' : result.economie < 0 ? 'bg-amber-50 border-2 border-amber-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{result.economie > 0 ? '📊' : result.economie < 0 ? '🏷️' : '🤝'}</span>
            <div>
              {result.economie !== 0 ? (
                <>
                  <p className="font-bold text-gray-900">
                    {recommended === 'bareme'
                      ? `Le barème progressif est plus avantageux de ${formatEuro(Math.abs(result.economie))}`
                      : `Le PFU est plus avantageux de ${formatEuro(Math.abs(result.economie))}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {recommended === 'bareme'
                      ? `Avec une TMI à ${formatPercent(result.tmiAvecRCM)} et l'abattement 40% sur les dividendes, le barème est préférable.`
                      : `Avec une TMI à ${formatPercent(result.tmiAvecRCM)}, le prélèvement forfaitaire est plus intéressant.`}
                  </p>
                </>
              ) : (
                <p className="font-bold text-gray-900">Les deux options sont équivalentes</p>
              )}
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            💡 En règle générale : TMI ≤ 11% → barème avantageux | TMI ≥ 30% → PFU avantageux | TMI entre les deux → à calculer au cas par cas.
            {isAV && ' Pour l\'assurance-vie, les PS restent à 17,2% (non impactés par la hausse CSG 2026).'}
          </div>
        </div>

        {/* Detail table */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900">
            Voir le détail du calcul
          </summary>
          <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              <span className="text-gray-500">RCM bruts</span>
              <span className="font-medium text-right">{formatEuro(rcmBrut)}</span>
              <span className="text-gray-500">Dont dividendes</span>
              <span className="font-medium text-right">{formatEuro(dividendes)}</span>
              <span className="text-gray-500">Abattement 40%</span>
              <span className="font-medium text-right text-green-600">-{formatEuro(result.abattement40)}</span>
              <span className="text-gray-500">CSG déductible</span>
              <span className="font-medium text-right text-green-600">-{formatEuro(result.csgDeductible)}</span>
              <span className="text-gray-500">TMI sans RCM</span>
              <span className="font-medium text-right">{formatPercent(result.tmiSansRCM)}</span>
              <span className="text-gray-500">TMI avec RCM</span>
              <span className="font-medium text-right">{formatPercent(result.tmiAvecRCM)}</span>
              <span className="text-gray-500">IR sans RCM</span>
              <span className="font-medium text-right">{formatEuro(result.irSansRCM)}</span>
              <span className="text-gray-500">IR avec RCM au barème</span>
              <span className="font-medium text-right">{formatEuro(result.irAvecRCM)}</span>
            </div>
          </div>
        </details>
      </div>
    </Card>
  );
}
