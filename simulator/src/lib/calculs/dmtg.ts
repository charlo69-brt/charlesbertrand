import { OptionConjoint, DetailTranche, RegimeMatrimonial, SituationFamiliale, ModeDetention } from '../types';
import {
  BAREME_SUCCESSION_LIGNE_DIRECTE,
  ABATTEMENT_SUCCESSION,
  BAREME_USUFRUIT_FISCAL,
  RESERVE_HEREDITAIRE,
} from '../constants';

export interface DMTGEnfantInput {
  prenom: string;
  abattementUtilise?: number;
}

export interface DMTGInput {
  patrimoineTotal: number;
  passifs: number;
  actifs?: { valeur: number; detention?: ModeDetention }[];
  regimeMatrimonial?: RegimeMatrimonial;
  situationFamiliale?: SituationFamiliale;
  clauseAttributionIntegrale?: boolean;
  optionConjoint: OptionConjoint;
  ageConjoint: number;
  enfants: DMTGEnfantInput[];
  assuranceVie?: {
    montant: number;
    versementsAvant70: number;
    versementsApres70: number;
  };
}

export interface DMTGEnfantResult {
  prenom: string;
  partPP: number;
  partNP: number;
  valeurFiscale: number;
  abattement: number;
  taxable: number;
  droits: number;
  detailTranches: DetailTranche[];
}

export interface DMTGResult {
  masseBrute: number;
  partConjointRegime: number;
  masseSuccessorale: number;
  partConjoint: { pp: number; usufruit: number };
  valeurFiscaleConjoint: number;
  droitsConjoint: number;
  enfantsResults: DMTGEnfantResult[];
  totalDroits: number;
  tauxEffectif: number;
  optionChoisie: OptionConjoint;
}

function getValeurUsufruit(age: number): number {
  for (const tranche of BAREME_USUFRUIT_FISCAL) {
    if (age < tranche.ageMax) return tranche.usufruit;
  }
  return 0.10;
}

function appliquerBareme(
  montantTaxable: number,
  bareme: { min: number; max: number; taux: number }[]
): { droits: number; tranches: DetailTranche[] } {
  let droits = 0;
  const tranches: DetailTranche[] = [];

  for (const tranche of bareme) {
    if (montantTaxable <= tranche.min) break;
    const montantDansTranche = Math.min(montantTaxable, tranche.max) - tranche.min;
    const impot = montantDansTranche * tranche.taux;
    if (montantDansTranche > 0) {
      tranches.push({
        tranche: `${tranche.min.toLocaleString('fr-FR')} € - ${tranche.max === Infinity ? '...' : tranche.max.toLocaleString('fr-FR') + ' €'}`,
        montant: Math.round(impot),
        taux: tranche.taux,
      });
    }
    droits += impot;
  }

  return { droits: Math.round(droits), tranches };
}

function getQuotiteDisponible(nbEnfants: number): number {
  if (nbEnfants <= 0) return 1;
  const entry = RESERVE_HEREDITAIRE.find(r => r.enfants >= nbEnfants) ||
    RESERVE_HEREDITAIRE[RESERVE_HEREDITAIRE.length - 1];
  return entry.quotiteDisponible;
}

function calculerMasseSuccessorale(
  input: DMTGInput
): { masseBrute: number; partConjointRegime: number; masseSuccessorale: number } {
  const isCouple = input.situationFamiliale === 'marie' || input.situationFamiliale === 'pacse';

  if (isCouple && input.regimeMatrimonial === 'communaute_universelle' && input.clauseAttributionIntegrale) {
    return { masseBrute: input.patrimoineTotal, partConjointRegime: input.patrimoineTotal, masseSuccessorale: 0 };
  }

  if (input.actifs && input.actifs.length > 0 && isCouple) {
    let totalClient = 0;
    let totalConjoint = 0;
    for (const actif of input.actifs) {
      if (actif.detention === 'commun' || actif.detention === 'indivision') {
        totalClient += actif.valeur / 2;
        totalConjoint += actif.valeur / 2;
      } else {
        totalClient += actif.valeur;
      }
    }
    const masse = Math.max(0, totalClient - input.passifs / 2);
    return { masseBrute: totalClient + totalConjoint, partConjointRegime: totalConjoint, masseSuccessorale: masse };
  }

  // Fallback : si pas de détail actifs, on utilise le régime pour estimer
  if (isCouple && (input.regimeMatrimonial === 'communaute_legale' || input.regimeMatrimonial === 'communaute_universelle')) {
    const moitie = input.patrimoineTotal / 2;
    return { masseBrute: input.patrimoineTotal, partConjointRegime: moitie, masseSuccessorale: Math.max(0, moitie - input.passifs / 2) };
  }

  return { masseBrute: input.patrimoineTotal, partConjointRegime: 0, masseSuccessorale: Math.max(0, input.patrimoineTotal - input.passifs) };
}

export function calculerDMTG(input: DMTGInput): DMTGResult {
  const { masseSuccessorale, masseBrute, partConjointRegime } = calculerMasseSuccessorale(input);
  const nbEnfants = input.enfants.length;
  const tauxUsufruit = getValeurUsufruit(input.ageConjoint);
  const tauxNP = 1 - tauxUsufruit;
  const qd = getQuotiteDisponible(nbEnfants);

  let partConjointPP = 0;
  let partConjointUsufruit = 0;
  let partEnfantsTotale = masseSuccessorale;

  const hasConjoint = input.situationFamiliale === 'marie' || input.situationFamiliale === 'pacse';

  if (hasConjoint && nbEnfants > 0) {
    switch (input.optionConjoint) {
      case 'usufruit_totalite':
        // Conjoint reçoit l'usufruit de la totalité, enfants la nue-propriété
        partConjointUsufruit = masseSuccessorale;
        partConjointPP = 0;
        partEnfantsTotale = masseSuccessorale; // enfants en NP
        break;

      case 'quart_pleine_propriete':
        // Conjoint reçoit 1/4 en PP, enfants 3/4 en PP
        partConjointPP = masseSuccessorale * 0.25;
        partConjointUsufruit = 0;
        partEnfantsTotale = masseSuccessorale * 0.75;
        break;

      case 'quotite_disponible_pp':
        // Donation dernier vivant : PP de la QD
        partConjointPP = masseSuccessorale * qd;
        partConjointUsufruit = 0;
        partEnfantsTotale = masseSuccessorale * (1 - qd);
        break;

      case 'quart_pp_trois_quarts_usu':
        // Donation dernier vivant : 1/4 PP + 3/4 usufruit
        partConjointPP = masseSuccessorale * 0.25;
        partConjointUsufruit = masseSuccessorale * 0.75;
        partEnfantsTotale = masseSuccessorale * 0.75; // enfants en NP sur 3/4
        break;

      case 'usufruit_totalite_ddv':
        // Donation dernier vivant : usufruit totalité
        partConjointUsufruit = masseSuccessorale;
        partConjointPP = 0;
        partEnfantsTotale = masseSuccessorale;
        break;
    }
  } else if (hasConjoint && nbEnfants === 0) {
    // Sans enfant, le conjoint hérite de tout en PP
    partConjointPP = masseSuccessorale;
    partEnfantsTotale = 0;
  }

  // Valeur fiscale conjoint (usufruit valorisé via art. 669)
  const valeurFiscaleConjoint = partConjointPP + (partConjointUsufruit * tauxUsufruit);

  // Calcul DMTG par enfant
  const enfantsResults: DMTGEnfantResult[] = [];

  if (nbEnfants > 0) {
    const partParEnfant = partEnfantsTotale / nbEnfants;

    // Déterminer si les enfants reçoivent en NP ou PP
    const isNP = input.optionConjoint === 'usufruit_totalite' ||
      input.optionConjoint === 'usufruit_totalite_ddv' ||
      input.optionConjoint === 'quart_pp_trois_quarts_usu';

    for (const enfant of input.enfants) {
      let partPP = 0;
      let partNP = 0;

      if (input.optionConjoint === 'quart_pp_trois_quarts_usu') {
        // Enfants: NP sur 3/4 de la masse
        partNP = partParEnfant;
        partPP = 0;
      } else if (isNP) {
        partNP = partParEnfant;
        partPP = 0;
      } else {
        partPP = partParEnfant;
        partNP = 0;
      }

      // Valeur fiscale : PP + NP valorisée (art 669)
      const valeurFiscale = Math.round(partPP + partNP * tauxNP);
      const abattement = ABATTEMENT_SUCCESSION.enfant - (enfant.abattementUtilise || 0);
      const taxable = Math.max(0, valeurFiscale - abattement);
      const { droits, tranches } = appliquerBareme(taxable, BAREME_SUCCESSION_LIGNE_DIRECTE);

      enfantsResults.push({
        prenom: enfant.prenom,
        partPP: Math.round(partPP),
        partNP: Math.round(partNP),
        valeurFiscale,
        abattement: Math.max(0, abattement),
        taxable,
        droits,
        detailTranches: tranches,
      });
    }
  }

  const totalDroits = enfantsResults.reduce((s, e) => s + e.droits, 0);
  const tauxEffectif = masseSuccessorale > 0 ? totalDroits / masseSuccessorale : 0;

  return {
    masseBrute,
    partConjointRegime,
    masseSuccessorale,
    partConjoint: { pp: Math.round(partConjointPP), usufruit: Math.round(partConjointUsufruit) },
    valeurFiscaleConjoint: Math.round(valeurFiscaleConjoint),
    droitsConjoint: 0,
    enfantsResults,
    totalDroits,
    tauxEffectif,
    optionChoisie: input.optionConjoint,
  };
}

export function comparerOptionsDMTG(input: Omit<DMTGInput, 'optionConjoint'>): { option: OptionConjoint; result: DMTGResult }[] {
  const options: OptionConjoint[] = [
    'usufruit_totalite',
    'quart_pleine_propriete',
    'quotite_disponible_pp',
    'quart_pp_trois_quarts_usu',
    'usufruit_totalite_ddv',
  ];

  return options
    .map(option => ({
      option,
      result: calculerDMTG({ ...input, optionConjoint: option }),
    }))
    .sort((a, b) => a.result.totalDroits - b.result.totalDroits);
}
