import { Revenus, SituationFamiliale, ResultatIR, DetailTranche } from '../types';
import {
  BAREME_IR_2026,
  PLAFOND_QF_DEMI_PART,
  ABATTEMENT_10_POURCENT_MIN,
  ABATTEMENT_10_POURCENT_MAX,
  DECOTE_SEUIL_CELIBATAIRE,
  DECOTE_SEUIL_COUPLE,
  DECOTE_COEFFICIENT,
  DECOTE_MONTANT_CELIBATAIRE,
  DECOTE_MONTANT_COUPLE,
  TAUX_PRELEVEMENTS_SOCIAUX,
  TAUX_PRELEVEMENTS_SOCIAUX_FONCIER,
  TAUX_PFU,
} from '../constants';
import { calculerNombreParts, calculerDemiPartsSupplementaires } from './quotient-familial';

function appliquerBareme(quotient: number): { impot: number; detailParTranche: DetailTranche[] } {
  let impot = 0;
  const detailParTranche: DetailTranche[] = [];

  for (const tranche of BAREME_IR_2026) {
    if (quotient <= tranche.min) break;

    const montantDansTranche = Math.min(quotient, tranche.max) - tranche.min;
    const impotTranche = montantDansTranche * tranche.taux;

    if (montantDansTranche > 0) {
      detailParTranche.push({
        tranche: `${tranche.min.toLocaleString('fr-FR')} € - ${tranche.max === Infinity ? '...' : tranche.max.toLocaleString('fr-FR') + ' €'}`,
        montant: Math.round(impotTranche),
        taux: tranche.taux,
      });
    }

    impot += impotTranche;
  }

  return { impot: Math.round(impot), detailParTranche };
}

function getTMI(quotient: number): number {
  let tmi = 0;
  for (const tranche of BAREME_IR_2026) {
    if (quotient > tranche.min) {
      tmi = tranche.taux;
    }
  }
  return tmi;
}

export function calculerIR(
  revenus: Revenus,
  situation: SituationFamiliale,
  enfantsACharge: number
): ResultatIR {
  // 1. Revenu brut global (hors revenus mobiliers si PFU)
  const revenuBrutGlobal =
    revenus.salairesNets +
    revenus.bicBnc +
    revenus.revenusFonciers +
    revenus.pensions +
    revenus.autresRevenus;

  // 2. Abattement 10% sur salaires et pensions
  const abattementSalaires = Math.max(
    ABATTEMENT_10_POURCENT_MIN,
    Math.min(revenus.salairesNets * 0.10, ABATTEMENT_10_POURCENT_MAX)
  );
  const abattementPensions = Math.max(
    ABATTEMENT_10_POURCENT_MIN,
    Math.min((revenus.pensions || 0) * 0.10, ABATTEMENT_10_POURCENT_MAX)
  );

  const salairesApresAbattement = Math.max(0, revenus.salairesNets - abattementSalaires);
  const pensionsApresAbattement = Math.max(0, (revenus.pensions || 0) - abattementPensions);

  // 3. Revenu net imposable
  const revenuNetImposable =
    salairesApresAbattement +
    revenus.bicBnc +
    revenus.revenusFonciers +
    pensionsApresAbattement +
    revenus.autresRevenus;

  // 4. Quotient familial
  const nombreParts = calculerNombreParts(situation, enfantsACharge);
  const quotient = revenuNetImposable / nombreParts;

  // 5. Impôt avec quotient familial
  const { impot: impotParPartQF, detailParTranche } = appliquerBareme(quotient);
  let impotAvecQF = impotParPartQF * nombreParts;

  // 6. Plafonnement du quotient familial
  const demiPartsSupp = calculerDemiPartsSupplementaires(situation, enfantsACharge);
  if (demiPartsSupp > 0) {
    const partsBase = situation === 'marie' || situation === 'pacse' ? 2 : 1;
    const quotientBase = revenuNetImposable / partsBase;
    const { impot: impotParPartBase } = appliquerBareme(quotientBase);
    const impotSansQF = impotParPartBase * partsBase;
    const avantageQF = impotSansQF - impotAvecQF;
    const plafond = demiPartsSupp * PLAFOND_QF_DEMI_PART;

    if (avantageQF > plafond) {
      impotAvecQF = impotSansQF - plafond;
    }
  }

  const impotBrut = Math.round(impotAvecQF);

  // 7. Décote
  let decote = 0;
  const isCouple = situation === 'marie' || situation === 'pacse';
  const seuilDecote = isCouple ? DECOTE_SEUIL_COUPLE : DECOTE_SEUIL_CELIBATAIRE;

  if (impotBrut > 0 && impotBrut < seuilDecote) {
    const montantDecote = isCouple ? DECOTE_MONTANT_COUPLE : DECOTE_MONTANT_CELIBATAIRE;
    decote = Math.round(montantDecote - DECOTE_COEFFICIENT * impotBrut);
    decote = Math.max(0, Math.min(decote, impotBrut));
  }

  const impotNet = Math.max(0, impotBrut - decote);

  // 8. TMI
  const tauxMarginalImposition = getTMI(quotient);
  const tauxMoyenImposition = revenuNetImposable > 0 ? impotNet / revenuNetImposable : 0;

  // 9. Prélèvements sociaux (taux différenciés 2026)
  // Revenus fonciers : 17,2% / Revenus mobiliers : 18,6%
  const psFoncier = Math.round(revenus.revenusFonciers * TAUX_PRELEVEMENTS_SOCIAUX_FONCIER);
  const psMobilier = Math.round(revenus.revenusMobiliers * TAUX_PRELEVEMENTS_SOCIAUX);
  const prelevementsSociaux = psFoncier + psMobilier;

  // 10. PFU sur revenus mobiliers
  const pfuCapital = Math.round(revenus.revenusMobiliers * TAUX_PFU);

  // Total
  const totalFiscalite = impotNet + prelevementsSociaux + pfuCapital;

  return {
    revenuBrutGlobal,
    revenuNetImposable,
    nombreParts,
    impotBrut,
    decote,
    impotNet,
    tauxMarginalImposition,
    tauxMoyenImposition,
    detailParTranche,
    prelevementsSociaux,
    pfuCapital,
    totalFiscalite,
  };
}
