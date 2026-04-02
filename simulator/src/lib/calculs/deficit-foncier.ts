import { SimulationDeficitFoncier } from '../types';
import { DEFICIT_FONCIER_PLAFOND } from '../constants';

export function simulerDeficitFoncier(
  travauxDeductibles: number,
  revenusFonciers: number,
  tmi: number
): SimulationDeficitFoncier {
  // Le déficit foncier s'impute d'abord sur les revenus fonciers
  const deficitSurFonciers = Math.min(travauxDeductibles, revenusFonciers);
  const deficitRestant = travauxDeductibles - deficitSurFonciers;

  // Puis sur le revenu global dans la limite de 10 700€
  const deficitImputable = Math.min(deficitRestant, DEFICIT_FONCIER_PLAFOND);
  const deficitReportable = Math.max(0, deficitRestant - deficitImputable);

  const economieImpot = Math.round((deficitSurFonciers + deficitImputable) * tmi);

  return {
    travauxDeductibles,
    revenusFonciers,
    deficitImputable,
    deficitReportable,
    economieImpot,
  };
}
