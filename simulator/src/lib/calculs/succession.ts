import { Beneficiaire, SimulationSuccession, DetailTranche } from '../types';
import {
  BAREME_SUCCESSION_LIGNE_DIRECTE,
  BAREME_SUCCESSION_FRERE_SOEUR,
  ABATTEMENT_SUCCESSION,
  AV_ABATTEMENT_AVANT_70,
  AV_ABATTEMENT_APRES_70,
  AV_TAUX_APRES_ABATTEMENT_AVANT_70,
  AV_TAUX_HAUT_AVANT_70,
  AV_SEUIL_HAUT_AVANT_70,
} from '../constants';

function appliquerBaremeSuccession(
  montantTaxable: number,
  bareme: { min: number; max: number; taux: number }[]
): { droits: number; tranches: DetailTranche[] } {
  let droits = 0;
  const tranches: DetailTranche[] = [];

  for (const tranche of bareme) {
    if (montantTaxable <= tranche.min) break;

    const montantDansTranche = Math.min(montantTaxable, tranche.max) - tranche.min;
    const impotTranche = montantDansTranche * tranche.taux;

    if (montantDansTranche > 0) {
      tranches.push({
        tranche: `${tranche.min.toLocaleString('fr-FR')} € - ${tranche.max === Infinity ? '...' : tranche.max.toLocaleString('fr-FR') + ' €'}`,
        montant: Math.round(impotTranche),
        taux: tranche.taux,
      });
    }

    droits += impotTranche;
  }

  return { droits: Math.round(droits), tranches };
}

function getBareme(lien: string) {
  switch (lien) {
    case 'enfant':
      return BAREME_SUCCESSION_LIGNE_DIRECTE;
    case 'frere_soeur':
      return BAREME_SUCCESSION_FRERE_SOEUR;
    default:
      return [{ min: 0, max: Infinity, taux: 0.60 }]; // 60% for others
  }
}

export function calculerSuccession(
  patrimoineTransmis: number,
  beneficiairesInput: { lien: Beneficiaire['lien']; prenom: string; part: number }[],
  assuranceVie?: { montant: number; versementsAvant70: number; versementsApres70: number } | null
): SimulationSuccession {
  const beneficiaires: Beneficiaire[] = beneficiairesInput.map((b) => {
    // Conjoint/PACS: exonéré
    if (b.lien === 'conjoint') {
      return {
        ...b,
        abattement: 0,
        droitsDus: 0,
        detailTranches: [],
      };
    }

    const partSuccession = patrimoineTransmis * (b.part / 100);
    const abattement = ABATTEMENT_SUCCESSION[b.lien] || 1594;
    const montantTaxable = Math.max(0, partSuccession - abattement);
    const bareme = getBareme(b.lien);
    const { droits, tranches } = appliquerBaremeSuccession(montantTaxable, bareme);

    return {
      ...b,
      abattement,
      droitsDus: droits,
      detailTranches: tranches,
    };
  });

  // Assurance-vie
  let fiscaliteAV = 0;
  if (assuranceVie && assuranceVie.montant > 0) {
    // Avant 70 ans: 152 500€ abattement par bénéficiaire
    const nbBeneficiaires = beneficiaires.filter((b) => b.lien !== 'conjoint').length || 1;
    const partAvant70 = assuranceVie.versementsAvant70 / nbBeneficiaires;

    for (let i = 0; i < nbBeneficiaires; i++) {
      const taxableAvant70 = Math.max(0, partAvant70 - AV_ABATTEMENT_AVANT_70);
      if (taxableAvant70 > 0) {
        const trancheBasse = Math.min(taxableAvant70, AV_SEUIL_HAUT_AVANT_70 - AV_ABATTEMENT_AVANT_70);
        const trancheHaute = Math.max(0, taxableAvant70 - trancheBasse);
        fiscaliteAV += trancheBasse * AV_TAUX_APRES_ABATTEMENT_AVANT_70 + trancheHaute * AV_TAUX_HAUT_AVANT_70;
      }
    }

    // Après 70 ans: 30 500€ abattement global, puis barème succession
    const taxableApres70 = Math.max(0, assuranceVie.versementsApres70 - AV_ABATTEMENT_APRES_70);
    if (taxableApres70 > 0) {
      const { droits } = appliquerBaremeSuccession(taxableApres70, BAREME_SUCCESSION_LIGNE_DIRECTE);
      fiscaliteAV += droits;
    }
  }

  const totalDroits = beneficiaires.reduce((sum, b) => sum + b.droitsDus, 0) + Math.round(fiscaliteAV);

  return {
    patrimoineTransmis,
    beneficiaires,
    assuranceVie: assuranceVie ? {
      ...assuranceVie,
      fiscalite: Math.round(fiscaliteAV),
    } : null,
    totalDroits,
  };
}
