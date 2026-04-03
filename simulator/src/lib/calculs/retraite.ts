import { SimulationRetraite } from '../types';
import {
  RETRAITE_AGE_LEGAL,
  RETRAITE_TRIMESTRES_REQUIS,
  RETRAITE_TAUX_PLEIN,
  RETRAITE_DECOTE_PAR_TRIMESTRE,
  RETRAITE_SURCOTE_PAR_TRIMESTRE,
  PASS_2026,
} from '../constants';

export function simulerRetraite(
  dateNaissance: string,
  salaireAnnuelBrut: number,
  trimestresValides: number,
  ageDepart: number,
  besoinMensuel: number
): SimulationRetraite {
  const trimestresRequis = RETRAITE_TRIMESTRES_REQUIS;
  const tauxPlein = trimestresValides >= trimestresRequis;

  // Décote/surcote
  let decoteSurcote = 0;
  const trimestresManquants = trimestresRequis - trimestresValides;

  if (trimestresManquants > 0) {
    // Décote: -0.625% par trimestre manquant (max 20 trimestres)
    const trimestresDecote = Math.min(trimestresManquants, 20);
    decoteSurcote = -(trimestresDecote * RETRAITE_DECOTE_PAR_TRIMESTRE);
  } else if (trimestresManquants < 0 && ageDepart > RETRAITE_AGE_LEGAL) {
    // Surcote: +1.25% par trimestre au-delà du taux plein
    const trimestresSupp = Math.abs(trimestresManquants);
    decoteSurcote = trimestresSupp * RETRAITE_SURCOTE_PAR_TRIMESTRE;
  }

  const taux = RETRAITE_TAUX_PLEIN + decoteSurcote;

  // SAM (Salaire Annuel Moyen) - simplifié: basé sur le salaire actuel
  // Plafonné au PASS
  const salairePlafonne = Math.min(salaireAnnuelBrut, PASS_2026);
  const sam = salairePlafonne; // Simplified: using current salary as SAM approximation

  // Pension régime général
  const coefficientProrata = Math.min(trimestresValides / trimestresRequis, 1);
  const pensionAnnuelle = sam * taux * coefficientProrata;
  const pensionRegimeGeneral = Math.round(pensionAnnuelle / 12);

  // Pension complémentaire AGIRC-ARRCO (estimation simplifiée)
  // Hypothèse: ~25-30% du salaire brut en points par an, valeur point ~1.4€
  const pointsAnnuels = salaireAnnuelBrut * 0.06; // Simplified: 6% of gross salary
  const totalPoints = pointsAnnuels * (trimestresValides / 4);
  const pensionComplementaire = Math.round((totalPoints * 1.4) / 12);

  const pensionTotale = pensionRegimeGeneral + pensionComplementaire;

  // Gap analysis
  const gapMensuel = Math.max(0, besoinMensuel - pensionTotale);

  // Capital nécessaire pour combler le gap (espérance de vie ~85 ans)
  const anneesRetraite = Math.max(0, 85 - ageDepart);
  const capitalNecessaire = Math.round(gapMensuel * 12 * anneesRetraite);

  return {
    ageDepart,
    trimestresValides,
    trimestresRequis,
    pensionRegimeGeneral,
    pensionComplementaire,
    pensionTotale,
    tauxPlein,
    decoteSurcote,
    gapMensuel,
    capitalNecessaire,
  };
}
