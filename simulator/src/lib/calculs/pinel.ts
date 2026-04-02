import { SimulationPinel } from '../types';
import { PINEL_TAUX, PINEL_PLAFOND_INVESTISSEMENT } from '../constants';

export function simulerPinel(
  montantInvestissement: number,
  dureeEngagement: 6 | 9 | 12
): SimulationPinel {
  const montantRetenu = Math.min(montantInvestissement, PINEL_PLAFOND_INVESTISSEMENT);
  const tauxReduction = PINEL_TAUX[dureeEngagement] || 0;
  const reductionTotale = Math.round(montantRetenu * tauxReduction);
  const reductionAnnuelle = Math.round(reductionTotale / dureeEngagement);

  return {
    montantInvestissement,
    dureeEngagement,
    tauxReduction,
    reductionTotale,
    reductionAnnuelle,
  };
}
