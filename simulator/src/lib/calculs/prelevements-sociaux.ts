import { TAUX_PRELEVEMENTS_SOCIAUX, TAUX_CSG_DEDUCTIBLE } from '../constants';

export function calculerPrelevementsSociaux(montant: number): number {
  return Math.round(montant * TAUX_PRELEVEMENTS_SOCIAUX);
}

export function calculerCSGDeductible(montant: number): number {
  return Math.round(montant * TAUX_CSG_DEDUCTIBLE);
}
