import { SimulationPER, ProjectionAnnuelle } from '../types';
import { PLAFOND_PER_DEDUCTION_TAUX, PASS_2026 } from '../constants';

export function simulerPER(
  versementAnnuel: number,
  tmi: number, // e.g. 0.30
  revenuProfessionnel: number,
  tauxRendement: number, // e.g. 3 for 3%
  dureeAnnees: number
): SimulationPER {
  // Plafond déduction: 10% des revenus professionnels, plafonné à 10% de 8*PASS
  const plafondDeduction = Math.min(
    revenuProfessionnel * PLAFOND_PER_DEDUCTION_TAUX,
    8 * PASS_2026 * PLAFOND_PER_DEDUCTION_TAUX
  );

  const versementDeductible = Math.min(versementAnnuel, plafondDeduction);
  const economieImpot = Math.round(versementDeductible * tmi);

  const tauxAnnuel = tauxRendement / 100;
  const projectionAnnuelle: ProjectionAnnuelle[] = [];
  let capital = 0;

  for (let annee = 1; annee <= dureeAnnees; annee++) {
    capital += versementAnnuel;
    capital *= (1 + tauxAnnuel);
    projectionAnnuelle.push({
      annee,
      capital: Math.round(capital),
    });
  }

  return {
    versementAnnuel,
    tmi,
    economieImpot,
    plafondDeduction: Math.round(plafondDeduction),
    dureeAnnees,
    tauxRendement,
    capitalEstime: Math.round(capital),
    projectionAnnuelle,
  };
}
