import { BAREME_USUFRUIT_FISCAL } from '../constants';

export interface ResultatDemembrement {
  valeurBien: number;
  ageUsufruitier: number;
  partUsufruit: number;
  partNuePropriete: number;
  valeurUsufruit: number;
  valeurNuePropriete: number;
}

export function calculerDemembrement(
  valeurBien: number,
  ageUsufruitier: number
): ResultatDemembrement {
  // Find the applicable bracket from article 669 CGI
  const tranche = BAREME_USUFRUIT_FISCAL.find(
    (t) => ageUsufruitier >= t.ageMin && ageUsufruitier < t.ageMax
  );

  const partUsufruit = tranche ? tranche.usufruit : 0.10;
  const partNuePropriete = 1 - partUsufruit;

  return {
    valeurBien,
    ageUsufruitier,
    partUsufruit,
    partNuePropriete,
    valeurUsufruit: Math.round(valeurBien * partUsufruit),
    valeurNuePropriete: Math.round(valeurBien * partNuePropriete),
  };
}
