'use client';

import { formatEuro, getDetentionLabel, getDetentionEmoji } from '@/lib/utils';
import { Actifs, Passifs, BienImmobilier, ActifFinancier, ActifProfessionnel } from '@/lib/types';

interface PatrimoineMapProps {
  actifs: Actifs;
  passifs: Passifs;
  totalActifs: number;
  totalPassifs: number;
  patrimoineNet: number;
  totalRevenus: number;
  totalCharges: number;
}

interface AssetTile {
  emoji: string;
  label: string;
  montant: number;
  color: string;
  bgColor: string;
  borderColor: string;
  detail?: string;
  items?: { label: string; montant: number; detention?: string; detentionDetail?: string }[];
}

function getHealthIndicator(ratio: number): { emoji: string; color: string; label: string } {
  if (ratio >= 0.7) return { emoji: '🟢', color: 'text-green-600', label: 'Excellent' };
  if (ratio >= 0.4) return { emoji: '🟡', color: 'text-amber-500', label: 'Correct' };
  if (ratio >= 0.1) return { emoji: '🟠', color: 'text-orange-500', label: 'À surveiller' };
  return { emoji: '🔴', color: 'text-red-600', label: 'Attention' };
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function DetentionBadge({ detention, detail }: { detention?: string; detail?: string }) {
  if (!detention) return null;
  const emoji = getDetentionEmoji(detention);
  const label = getDetentionLabel(detention);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-white/80 border border-gray-300 rounded-full px-2 py-0.5">
      {emoji} {label}{detail ? ` · ${detail}` : ''}
    </span>
  );
}

function Tile({ tile, maxMontant }: { tile: AssetTile; maxMontant: number }) {
  return (
    <div className={`${tile.bgColor} ${tile.borderColor} border-2 rounded-xl p-4 transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{tile.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${tile.color}`}>{tile.label}</p>
          <p className="text-lg font-bold text-gray-900">{formatEuro(tile.montant)}</p>
        </div>
      </div>
      {tile.detail && <p className="text-xs text-gray-500 mb-2">{tile.detail}</p>}
      {/* Item list with detention badges */}
      {tile.items && tile.items.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {tile.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs text-gray-600 truncate">{item.label || '(sans nom)'}</span>
                <DetentionBadge detention={item.detention} detail={item.detentionDetail} />
              </div>
              <span className="text-xs font-semibold text-gray-700 shrink-0">{formatEuro(item.montant)}</span>
            </div>
          ))}
        </div>
      )}
      <ProgressBar value={Math.abs(tile.montant)} max={maxMontant} color={tile.color.replace('text-', 'bg-')} />
    </div>
  );
}

function buildImmoItems(biens: BienImmobilier[], type: string) {
  return biens.filter(b => b.type === type).map(b => ({
    label: b.label, montant: b.valeur, detention: b.detention, detentionDetail: b.detentionDetail,
  }));
}

function buildFinItems(actifs: ActifFinancier[], type: string) {
  return actifs.filter(a => a.type === type).map(a => ({
    label: a.label, montant: a.valeur, detention: a.detention, detentionDetail: a.detentionDetail,
  }));
}

function buildProItems(actifs: ActifProfessionnel[]) {
  return actifs.map(a => ({
    label: a.label, montant: a.valeur, detention: a.detention, detentionDetail: a.detentionDetail,
  }));
}

export default function PatrimoineMap(props: PatrimoineMapProps) {
  const {
    actifs, passifs,
    totalActifs, totalPassifs, patrimoineNet,
    totalRevenus, totalCharges,
  } = props;

  const capaciteEpargne = totalRevenus - totalCharges;
  const ratioEndettement = totalActifs > 0 ? 1 - (totalPassifs / totalActifs) : 0;
  const ratioEpargne = totalRevenus > 0 ? capaciteEpargne / totalRevenus : 0;
  const health = getHealthIndicator(ratioEndettement);

  const totalPro = actifs.professionnel.reduce((s, a) => s + a.valeur, 0);
  const totalCredits = passifs.credits.reduce((s, c) => s + c.capitalRestant, 0);
  const totalDettes = passifs.autresDettes.reduce((s, d) => s + d.montant, 0);

  const detailFinancier = actifs.financier.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.valeur;
    return acc;
  }, {} as Record<string, number>);

  const detailImmo = actifs.immobilier.reduce((acc, b) => {
    acc[b.type] = (acc[b.type] || 0) + b.valeur;
    return acc;
  }, {} as Record<string, number>);

  const actifTiles: AssetTile[] = [];

  if (detailImmo.residence_principale > 0) {
    actifTiles.push({
      emoji: '🏡', label: 'Résidence principale', montant: detailImmo.residence_principale,
      color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
      items: buildImmoItems(actifs.immobilier, 'residence_principale'),
    });
  }
  if (detailImmo.residence_secondaire > 0) {
    actifTiles.push({
      emoji: '🏖️', label: 'Résidence secondaire', montant: detailImmo.residence_secondaire,
      color: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200',
      items: buildImmoItems(actifs.immobilier, 'residence_secondaire'),
    });
  }
  if (detailImmo.locatif > 0) {
    actifTiles.push({
      emoji: '🏢', label: 'Immobilier locatif', montant: detailImmo.locatif,
      color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200',
      items: buildImmoItems(actifs.immobilier, 'locatif'),
    });
  }
  if (detailImmo.scpi > 0) {
    actifTiles.push({
      emoji: '🏗️', label: 'SCPI', montant: detailImmo.scpi,
      color: 'text-violet-700', bgColor: 'bg-violet-50', borderColor: 'border-violet-200',
      items: buildImmoItems(actifs.immobilier, 'scpi'),
    });
  }

  const finEmojis: Record<string, { emoji: string; label: string; color: string; bgColor: string; borderColor: string }> = {
    assurance_vie: { emoji: '🛡️', label: 'Assurance-vie', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    per: { emoji: '🏖️', label: 'PER', color: 'text-teal-700', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
    pea: { emoji: '📈', label: 'PEA', color: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    cto: { emoji: '📊', label: 'CTO', color: 'text-cyan-700', bgColor: 'bg-cyan-50', borderColor: 'border-cyan-200' },
    livret: { emoji: '🐷', label: 'Livrets', color: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
    compte_courant: { emoji: '💳', label: 'Comptes courants', color: 'text-gray-700', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  };

  for (const [type, montant] of Object.entries(detailFinancier)) {
    if (montant > 0 && finEmojis[type]) {
      const e = finEmojis[type];
      actifTiles.push({ ...e, montant, items: buildFinItems(actifs.financier, type) });
    }
  }

  if (totalPro > 0) {
    actifTiles.push({
      emoji: '💼', label: 'Actifs professionnels', montant: totalPro,
      color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
      items: buildProItems(actifs.professionnel),
    });
  }

  const passifTiles: AssetTile[] = [];
  if (totalCredits > 0) {
    passifTiles.push({
      emoji: '🏦', label: 'Crédits', montant: totalCredits,
      color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200',
      detail: `${passifs.credits.length} crédit(s) en cours`,
    });
  }
  if (totalDettes > 0) {
    passifTiles.push({
      emoji: '📋', label: 'Autres dettes', montant: totalDettes,
      color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200',
    });
  }

  const maxMontant = Math.max(
    ...actifTiles.map(t => t.montant),
    ...passifTiles.map(t => t.montant),
    1
  );

  const noData = actifTiles.length === 0 && passifTiles.length === 0;

  // Detention breakdown
  const allAssets: { label: string; montant: number; detention?: string }[] = [
    ...actifs.immobilier.map(b => ({ label: b.label || 'Immo', montant: b.valeur, detention: b.detention })),
    ...actifs.financier.map(a => ({ label: a.label || 'Financier', montant: a.valeur, detention: a.detention })),
    ...actifs.professionnel.map(a => ({ label: a.label || 'Pro', montant: a.valeur, detention: a.detention })),
  ];
  const detentionBreakdown = allAssets.reduce((acc, a) => {
    const key = a.detention || 'non_renseigne';
    acc[key] = (acc[key] || 0) + a.montant;
    return acc;
  }, {} as Record<string, number>);

  const detentionColors: Record<string, string> = {
    propre: 'bg-blue-500',
    commun: 'bg-purple-500',
    sci: 'bg-amber-500',
    demembrement_np: 'bg-teal-500',
    demembrement_usu: 'bg-cyan-500',
    indivision: 'bg-pink-500',
    non_renseigne: 'bg-gray-300',
  };

  const hasDetention = Object.keys(detentionBreakdown).some(k => k !== 'non_renseigne');

  return (
    <div className="space-y-6">
      {/* Health Score Header */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{patrimoineNet >= 0 ? '💰' : '⚠️'}</div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Patrimoine net</p>
              <p className={`text-3xl font-bold ${patrimoineNet >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                {formatEuro(patrimoineNet)}
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Santé</p>
              <p className="text-2xl">{health.emoji}</p>
              <p className={`text-xs font-semibold ${health.color}`}>{health.label}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Endettement</p>
              <p className="text-lg font-bold text-gray-800">
                {totalActifs > 0 ? `${Math.round((totalPassifs / totalActifs) * 100)}%` : '0%'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 uppercase">Épargne</p>
              <p className={`text-lg font-bold ${ratioEpargne >= 0.15 ? 'text-green-600' : ratioEpargne >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {totalRevenus > 0 ? `${Math.round(ratioEpargne * 100)}%` : '-'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Actifs {formatEuro(totalActifs)}</span>
            <span>Passifs {formatEuro(totalPassifs)}</span>
          </div>
          <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${totalActifs > 0 ? Math.min(((totalActifs - totalPassifs) / totalActifs) * 100, 100) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {noData ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <span className="text-5xl block mb-4">🗺️</span>
          <h3 className="text-lg font-semibold text-gray-700">Cartographie vide</h3>
          <p className="text-sm text-gray-500 mt-1">
            Ajoutez des actifs et passifs dans les onglets correspondants pour voir la carte du patrimoine
          </p>
        </div>
      ) : (
        <>
          {/* Actifs Section */}
          {actifTiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>📦</span> Actifs — {formatEuro(totalActifs)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {actifTiles
                  .sort((a, b) => b.montant - a.montant)
                  .map((tile, i) => (
                    <Tile key={i} tile={tile} maxMontant={maxMontant} />
                  ))}
              </div>
            </div>
          )}

          {/* Passifs Section */}
          {passifTiles.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>⚖️</span> Passifs — {formatEuro(totalPassifs)}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {passifTiles
                  .sort((a, b) => b.montant - a.montant)
                  .map((tile, i) => (
                    <Tile key={i} tile={tile} maxMontant={maxMontant} />
                  ))}
              </div>
            </div>
          )}

          {/* Detention Breakdown */}
          {hasDetention && totalActifs > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>🔐</span> Répartition par mode de détention
              </h3>
              <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
                {/* Stacked bar */}
                <div className="w-full h-8 rounded-full overflow-hidden flex">
                  {Object.entries(detentionBreakdown)
                    .filter(([, v]) => v > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, val]) => (
                      <div
                        key={key}
                        className={`${detentionColors[key] || 'bg-gray-400'} h-full transition-all duration-500`}
                        style={{ width: `${(val / totalActifs) * 100}%` }}
                        title={`${key !== 'non_renseigne' ? getDetentionLabel(key) : 'Non renseigné'}: ${formatEuro(val)}`}
                      />
                    ))}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {Object.entries(detentionBreakdown)
                    .filter(([, v]) => v > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([key, val]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${detentionColors[key] || 'bg-gray-400'}`} />
                        <span className="text-sm text-gray-700">
                          {key !== 'non_renseigne' ? `${getDetentionEmoji(key)} ${getDetentionLabel(key)}` : '📎 Non renseigné'}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{formatEuro(val)}</span>
                        <span className="text-xs text-gray-400">
                          ({Math.round((val / totalActifs) * 100)}%)
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Flux Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span>🔄</span> Flux annuels
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">💵</span>
              <span className="text-sm font-semibold text-green-700">Revenus</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatEuro(totalRevenus)}</p>
            <p className="text-xs text-gray-500">{formatEuro(Math.round(totalRevenus / 12))}/mois</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🧾</span>
              <span className="text-sm font-semibold text-red-700">Charges</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatEuro(totalCharges)}</p>
            <p className="text-xs text-gray-500">{formatEuro(Math.round(totalCharges / 12))}/mois</p>
          </div>
          <div className={`${capaciteEpargne >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border-2 rounded-xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{capaciteEpargne >= 0 ? '🐷' : '⚠️'}</span>
              <span className={`text-sm font-semibold ${capaciteEpargne >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                Capacité d&apos;épargne
              </span>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatEuro(capaciteEpargne)}</p>
            <p className="text-xs text-gray-500">{formatEuro(Math.round(capaciteEpargne / 12))}/mois</p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📊</span>
              <span className="text-sm font-semibold text-purple-700">Taux d&apos;épargne</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {totalRevenus > 0 ? `${Math.round(ratioEpargne * 100)}%` : '-'}
            </p>
            <p className="text-xs text-gray-500">{ratioEpargne >= 0.15 ? '🟢 Bon' : ratioEpargne >= 0.05 ? '🟡 Moyen' : '🔴 Faible'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
