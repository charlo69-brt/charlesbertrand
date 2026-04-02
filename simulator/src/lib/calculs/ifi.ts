import { BienImmobilier, ResultatIFI, DetailTranche } from '../types';
import { BAREME_IFI, IFI_SEUIL, IFI_DECOTE_SEUIL, ABATTEMENT_RP_IFI } from '../constants';

export function calculerIFI(biens: BienImmobilier[]): ResultatIFI {
  // 1. Patrimoine immobilier brut
  const patrimoineImmobilierBrut = biens.reduce((sum, b) => sum + b.valeur, 0);

  // 2. Abattement 30% résidence principale
  const rp = biens.find((b) => b.type === 'residence_principale');
  const abattementRP = rp ? Math.round(rp.valeur * ABATTEMENT_RP_IFI) : 0;

  // 3. Déduction du capital restant dû
  const totalCapitalRestant = biens.reduce((sum, b) => sum + (b.capitalRestantDu || 0), 0);

  // 4. Patrimoine net taxable
  const patrimoineNetTaxable = Math.max(0, patrimoineImmobilierBrut - abattementRP - totalCapitalRestant);

  // 5. Vérification seuil
  if (patrimoineNetTaxable < IFI_SEUIL) {
    return {
      patrimoineImmobilierBrut,
      abattementRP,
      patrimoineNetTaxable,
      ifiDu: 0,
      decote: 0,
      detailParTranche: [],
    };
  }

  // 6. Application du barème (depuis 800K)
  let ifi = 0;
  const detailParTranche: DetailTranche[] = [];

  for (const tranche of BAREME_IFI) {
    if (patrimoineNetTaxable <= tranche.min) break;

    const montantDansTranche = Math.min(patrimoineNetTaxable, tranche.max) - tranche.min;
    const impotTranche = montantDansTranche * tranche.taux;

    if (montantDansTranche > 0 && tranche.taux > 0) {
      detailParTranche.push({
        tranche: `${tranche.min.toLocaleString('fr-FR')} € - ${tranche.max === Infinity ? '...' : tranche.max.toLocaleString('fr-FR') + ' €'}`,
        montant: Math.round(impotTranche),
        taux: tranche.taux,
      });
    }

    ifi += impotTranche;
  }

  // 7. Décote (entre 1.3M et 1.4M)
  let decote = 0;
  if (patrimoineNetTaxable >= IFI_SEUIL && patrimoineNetTaxable <= IFI_DECOTE_SEUIL) {
    decote = Math.round(17500 - 0.0125 * patrimoineNetTaxable);
    decote = Math.max(0, decote);
  }

  const ifiDu = Math.max(0, Math.round(ifi) - decote);

  return {
    patrimoineImmobilierBrut,
    abattementRP,
    patrimoineNetTaxable,
    ifiDu,
    decote,
    detailParTranche,
  };
}
