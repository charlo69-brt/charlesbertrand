import { ModeDetention, SituationFamiliale, RegimeMatrimonial } from '../types';

/**
 * Détermine le mode de détention par défaut en fonction du régime matrimonial.
 */
export function getDefaultDetention(
  regime: RegimeMatrimonial | undefined,
  situation: SituationFamiliale | undefined
): ModeDetention {
  if (!situation || (situation !== 'marie' && situation !== 'pacse')) return 'propre';

  switch (regime) {
    case 'communaute_legale':
    case 'communaute_universelle':
      return 'commun';
    case 'separation_biens':
      return 'propre';
    case 'participation_acquets':
      return 'propre';
    default:
      return 'propre';
  }
}

/**
 * Calcule la part du patrimoine revenant au conjoint selon le mode de détention.
 * Retourne les parts en valeur absolue.
 */
export function calculerPartConjoint(
  valeurBien: number,
  detention: ModeDetention | undefined,
): { partClient: number; partConjoint: number } {
  switch (detention) {
    case 'commun':
      return { partClient: valeurBien / 2, partConjoint: valeurBien / 2 };
    case 'indivision':
      return { partClient: valeurBien / 2, partConjoint: valeurBien / 2 };
    case 'propre':
    case 'sci':
    case 'demembrement_np':
    case 'demembrement_usu':
    default:
      return { partClient: valeurBien, partConjoint: 0 };
  }
}

/**
 * Calcule la masse successorale en tenant compte du régime matrimonial.
 * Seuls les biens propres + la moitié des biens communs entrent dans la succession.
 */
export function calculerMasseSuccessorale(
  actifs: { valeur: number; detention?: ModeDetention }[],
  passifs: number,
  regime: RegimeMatrimonial | undefined,
  situation: SituationFamiliale | undefined,
  clauseAttributionIntegrale?: boolean,
): { masseBrute: number; partConjointRegime: number; masseSuccessorale: number } {
  const isCouple = situation === 'marie' || situation === 'pacse';

  // Communauté universelle avec clause d'attribution intégrale : tout va au conjoint
  if (isCouple && regime === 'communaute_universelle' && clauseAttributionIntegrale) {
    const total = actifs.reduce((s, a) => s + a.valeur, 0);
    return { masseBrute: total, partConjointRegime: total, masseSuccessorale: 0 };
  }

  let totalClient = 0;
  let totalConjoint = 0;

  for (const actif of actifs) {
    if (!isCouple) {
      totalClient += actif.valeur;
    } else {
      const { partClient, partConjoint } = calculerPartConjoint(actif.valeur, actif.detention);
      totalClient += partClient;
      totalConjoint += partConjoint;
    }
  }

  const masseBrute = totalClient + totalConjoint;
  // La part du conjoint au titre du régime (hors succession) : ses biens propres + sa moitié de communauté
  const masseSuccessorale = Math.max(0, totalClient - passifs / (isCouple ? 2 : 1));

  return { masseBrute, partConjointRegime: totalConjoint, masseSuccessorale };
}
