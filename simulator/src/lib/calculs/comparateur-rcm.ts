import { SituationFamiliale, Revenus } from '../types';
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
  TAUX_PFU_IR,
  TAUX_PRELEVEMENTS_SOCIAUX,
  TAUX_PRELEVEMENTS_SOCIAUX_AV,
  TAUX_CSG_DEDUCTIBLE,
} from '../constants';
import { calculerNombreParts } from './quotient-familial';

export interface ComparateurRCMResult {
  // Option PFU
  pfuIR: number;
  pfuPS: number;
  pfuTotal: number;

  // Option Barème IR
  irSansRCM: number;
  irAvecRCM: number;
  irSupplementaire: number;
  csgDeductible: number;
  psBareme: number;
  baremeTotal: number;

  // Comparaison
  economie: number; // positif = barème avantageux, négatif = PFU avantageux
  optionRecommandee: 'pfu' | 'bareme';

  // Détail
  tmiSansRCM: number;
  tmiAvecRCM: number;
  abattement40: number;
}

function calculerIRSimple(
  revenuNetImposable: number,
  nombreParts: number,
  situation: SituationFamiliale,
): { impot: number; tmi: number } {
  const quotient = revenuNetImposable / nombreParts;

  let impotParPart = 0;
  let tmi = 0;
  for (const tranche of BAREME_IR_2026) {
    if (quotient <= tranche.min) break;
    const montantDansTranche = Math.min(quotient, tranche.max) - tranche.min;
    impotParPart += montantDansTranche * tranche.taux;
    if (quotient > tranche.min) tmi = tranche.taux;
  }

  let impot = Math.round(impotParPart * nombreParts);

  // Plafonnement QF
  const partsBase = situation === 'marie' || situation === 'pacse' ? 2 : 1;
  if (nombreParts > partsBase) {
    const quotientBase = revenuNetImposable / partsBase;
    let impotBase = 0;
    for (const tranche of BAREME_IR_2026) {
      if (quotientBase <= tranche.min) break;
      impotBase += (Math.min(quotientBase, tranche.max) - tranche.min) * tranche.taux;
    }
    impotBase = Math.round(impotBase * partsBase);
    const demiPartsSupp = (nombreParts - partsBase) * 2;
    const plafond = demiPartsSupp * PLAFOND_QF_DEMI_PART;
    if (impotBase - impot > plafond) {
      impot = impotBase - plafond;
    }
  }

  // Décote
  const isCouple = situation === 'marie' || situation === 'pacse';
  const seuilDecote = isCouple ? DECOTE_SEUIL_COUPLE : DECOTE_SEUIL_CELIBATAIRE;
  if (impot > 0 && impot < seuilDecote) {
    const montantDecote = isCouple ? DECOTE_MONTANT_COUPLE : DECOTE_MONTANT_CELIBATAIRE;
    const decote = Math.max(0, Math.min(Math.round(montantDecote - DECOTE_COEFFICIENT * impot), impot));
    impot = Math.max(0, impot - decote);
  }

  return { impot, tmi };
}

export function comparerRCM(
  revenus: Revenus,
  rcmBrut: number,
  dividendes: number, // portion des RCM qui sont des dividendes (abattement 40%)
  situation: SituationFamiliale,
  enfantsACharge: number,
  isAssuranceVie: boolean = false
): ComparateurRCMResult {
  const nombreParts = calculerNombreParts(situation, enfantsACharge);

  // ======== OPTION PFU ========
  const tauxPS = isAssuranceVie ? TAUX_PRELEVEMENTS_SOCIAUX_AV : TAUX_PRELEVEMENTS_SOCIAUX;
  const pfuIR = Math.round(rcmBrut * TAUX_PFU_IR);
  const pfuPS = Math.round(rcmBrut * tauxPS);
  const pfuTotal = pfuIR + pfuPS;

  // ======== OPTION BARÈME ========
  // Base imposable hors RCM (salaires après abattement 10% + autres revenus)
  const abattementSalaires = Math.max(
    ABATTEMENT_10_POURCENT_MIN,
    Math.min(revenus.salairesNets * 0.10, ABATTEMENT_10_POURCENT_MAX)
  );
  const abattementPensions = Math.max(
    ABATTEMENT_10_POURCENT_MIN,
    Math.min((revenus.pensions || 0) * 0.10, ABATTEMENT_10_POURCENT_MAX)
  );

  const revenuSansRCM =
    Math.max(0, revenus.salairesNets - abattementSalaires) +
    revenus.bicBnc +
    revenus.revenusFonciers +
    Math.max(0, (revenus.pensions || 0) - abattementPensions) +
    revenus.autresRevenus;

  // Abattement 40% sur dividendes
  const abattement40 = Math.round(dividendes * 0.40);
  const rcmImposable = rcmBrut - abattement40;

  // CSG déductible
  const csgDeductible = Math.round(rcmBrut * TAUX_CSG_DEDUCTIBLE);

  // Revenu imposable avec RCM au barème (RCM - abattement 40% dividendes - CSG déductible)
  const rcmNetImposable = Math.max(0, rcmImposable - csgDeductible);
  const revenuAvecRCM = revenuSansRCM + rcmNetImposable;

  // IR sans RCM
  const { impot: irSansRCM, tmi: tmiSansRCM } = calculerIRSimple(
    revenuSansRCM, nombreParts, situation
  );

  // IR avec RCM
  const { impot: irAvecRCM, tmi: tmiAvecRCM } = calculerIRSimple(
    revenuAvecRCM, nombreParts, situation
  );

  const irSupplementaire = irAvecRCM - irSansRCM;

  // PS au barème (même taux)
  const psBareme = pfuPS;

  const baremeTotal = irSupplementaire + psBareme;

  // Comparaison
  const economie = pfuTotal - baremeTotal; // positif = barème moins cher

  return {
    pfuIR,
    pfuPS,
    pfuTotal,
    irSansRCM,
    irAvecRCM,
    irSupplementaire,
    csgDeductible,
    psBareme,
    baremeTotal,
    economie,
    optionRecommandee: economie > 0 ? 'bareme' : 'pfu',
    tmiSansRCM,
    tmiAvecRCM,
    abattement40,
  };
}
