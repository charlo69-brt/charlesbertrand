import { SituationFamiliale } from '../types';
import { PARTS_FISCALES } from '../constants';

export function calculerNombreParts(
  situation: SituationFamiliale,
  enfantsACharge: number
): number {
  let parts = PARTS_FISCALES[situation] || 1;

  // Add parts for children
  if (enfantsACharge >= 1) parts += 0.5; // 1st child
  if (enfantsACharge >= 2) parts += 0.5; // 2nd child
  if (enfantsACharge >= 3) {
    parts += (enfantsACharge - 2) * 1; // 3rd+ children: 1 part each
  }

  // Parent isolé: +0.5 part for the first child
  if ((situation === 'celibataire' || situation === 'divorce' || situation === 'veuf') && enfantsACharge > 0) {
    parts += 0.5;
  }

  return parts;
}

export function calculerDemiPartsSupplementaires(
  situation: SituationFamiliale,
  enfantsACharge: number
): number {
  const partsBase = situation === 'marie' || situation === 'pacse' ? 2 : 1;
  const partsTotal = calculerNombreParts(situation, enfantsACharge);
  return (partsTotal - partsBase) * 2; // number of half-parts
}
