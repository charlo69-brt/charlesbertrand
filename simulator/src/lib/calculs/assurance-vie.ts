import { SimulationAssuranceVie, ProjectionAnnuelle } from '../types';
import {
  AV_ABATTEMENT_RACHAT_8ANS_SOLO,
  AV_ABATTEMENT_RACHAT_8ANS_COUPLE,
  TAUX_PFU,
} from '../constants';

export function simulerAssuranceVie(
  versementInitial: number,
  versementsMensuels: number,
  tauxFondsEuros: number,
  tauxUC: number,
  repartitionFondsEuros: number, // 0-100 %
  dureeAnnees: number,
  isCouple: boolean = false
): SimulationAssuranceVie {
  const ratioFE = repartitionFondsEuros / 100;
  const ratioUC = 1 - ratioFE;
  const tauxAnnuel = ratioFE * (tauxFondsEuros / 100) + ratioUC * (tauxUC / 100);

  const projectionAnnuelle: ProjectionAnnuelle[] = [];
  let capital = versementInitial;
  let totalVersements = versementInitial;

  for (let annee = 1; annee <= dureeAnnees; annee++) {
    // Monthly compounding
    for (let mois = 0; mois < 12; mois++) {
      capital += versementsMensuels;
      totalVersements += versementsMensuels;
      capital *= (1 + tauxAnnuel / 12);
    }

    projectionAnnuelle.push({
      annee,
      capital: Math.round(capital),
      plusValue: Math.round(capital - totalVersements),
    });
  }

  const capitalFinal = Math.round(capital);
  const plusValue = capitalFinal - totalVersements;

  // Fiscalité en cas de rachat total
  const fiscaliteAvant8ans = {
    pfu: Math.round(plusValue * TAUX_PFU),
  };

  const abattement = isCouple ? AV_ABATTEMENT_RACHAT_8ANS_COUPLE : AV_ABATTEMENT_RACHAT_8ANS_SOLO;
  const plusValueApresAbattement = Math.max(0, plusValue - abattement);
  const fiscaliteApres8ans = {
    apresAbattement: plusValueApresAbattement,
    impot: Math.round(plusValueApresAbattement * 0.248), // 7.5% IR + 17.2% PS
  };

  return {
    versementInitial,
    versementsMensuels,
    tauxRendementFondsEuros: tauxFondsEuros,
    tauxRendementUC: tauxUC,
    repartitionFondsEuros,
    dureeAnnees,
    capitalFinal,
    totalVersements,
    plusValue,
    projectionAnnuelle,
    fiscaliteAvant8ans,
    fiscaliteApres8ans,
  };
}
