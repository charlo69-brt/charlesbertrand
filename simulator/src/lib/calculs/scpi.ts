import { SimulationSCPI } from '../types';
import { TAUX_PRELEVEMENTS_SOCIAUX } from '../constants';

export function simulerSCPI(
  montantInvesti: number,
  tauxDistribution: number, // e.g. 4.5 for 4.5%
  tmi: number // e.g. 0.30
): SimulationSCPI {
  const revenusAnnuels = Math.round(montantInvesti * tauxDistribution / 100);

  // Revenus fonciers taxés au barème IR + PS
  const fiscaliteRevenusFonciers = Math.round(revenusAnnuels * (tmi + TAUX_PRELEVEMENTS_SOCIAUX));

  const rendementNet = montantInvesti > 0
    ? ((revenusAnnuels - fiscaliteRevenusFonciers) / montantInvesti) * 100
    : 0;

  return {
    montantInvesti,
    tauxDistribution,
    revenusAnnuels,
    fiscaliteRevenusFonciers,
    rendementNet: Math.round(rendementNet * 100) / 100,
  };
}
