// Barème IR 2025 (revenus 2024)
export const BAREME_IR_2025 = [
  { min: 0, max: 11497, taux: 0 },
  { min: 11497, max: 29315, taux: 0.11 },
  { min: 29315, max: 83823, taux: 0.30 },
  { min: 83823, max: 180294, taux: 0.41 },
  { min: 180294, max: Infinity, taux: 0.45 },
];

// Quotient familial
export const PLAFOND_QF_DEMI_PART = 1759;
export const ABATTEMENT_10_POURCENT_MIN = 495;
export const ABATTEMENT_10_POURCENT_MAX = 14171;

// Décote IR
export const DECOTE_SEUIL_CELIBATAIRE = 1929;
export const DECOTE_SEUIL_COUPLE = 3191;

// Prélèvements sociaux
export const TAUX_PRELEVEMENTS_SOCIAUX = 0.172;
export const TAUX_CSG_DEDUCTIBLE = 0.068;
export const TAUX_PFU = 0.30;
export const TAUX_PFU_IR = 0.128;

// IFI
export const IFI_SEUIL = 1300000;
export const IFI_DECOTE_SEUIL = 1400000;
export const ABATTEMENT_RP_IFI = 0.30;

export const BAREME_IFI = [
  { min: 0, max: 800000, taux: 0 },
  { min: 800000, max: 1300000, taux: 0.005 },
  { min: 1300000, max: 2570000, taux: 0.007 },
  { min: 2570000, max: 5000000, taux: 0.01 },
  { min: 5000000, max: 10000000, taux: 0.0125 },
  { min: 10000000, max: Infinity, taux: 0.015 },
];

// Succession - Ligne directe
export const BAREME_SUCCESSION_LIGNE_DIRECTE = [
  { min: 0, max: 8072, taux: 0.05 },
  { min: 8072, max: 12109, taux: 0.10 },
  { min: 12109, max: 15932, taux: 0.15 },
  { min: 15932, max: 552324, taux: 0.20 },
  { min: 552324, max: 902838, taux: 0.30 },
  { min: 902838, max: 1805677, taux: 0.40 },
  { min: 1805677, max: Infinity, taux: 0.45 },
];

export const BAREME_SUCCESSION_FRERE_SOEUR = [
  { min: 0, max: 24430, taux: 0.35 },
  { min: 24430, max: Infinity, taux: 0.45 },
];

export const ABATTEMENT_SUCCESSION = {
  enfant: 100000,
  conjoint: Infinity, // exonéré
  frere_soeur: 15932,
  neveu_niece: 7967,
  autre: 1594,
};

export const RAPPEL_FISCAL_ANNEES = 15;

// Assurance-vie
export const AV_ABATTEMENT_AVANT_70 = 152500;
export const AV_ABATTEMENT_APRES_70 = 30500;
export const AV_TAUX_APRES_ABATTEMENT_AVANT_70 = 0.20;
export const AV_TAUX_HAUT_AVANT_70 = 0.3125;
export const AV_SEUIL_HAUT_AVANT_70 = 700000;
export const AV_ABATTEMENT_RACHAT_8ANS_SOLO = 4600;
export const AV_ABATTEMENT_RACHAT_8ANS_COUPLE = 9200;

// Pinel (post-2023)
export const PINEL_TAUX: Record<number, number> = {
  6: 0.09,
  9: 0.12,
  12: 0.14,
};
export const PINEL_PLAFOND_INVESTISSEMENT = 300000;
export const PINEL_PLAFOND_M2 = 5500;

// Déficit foncier
export const DEFICIT_FONCIER_PLAFOND = 10700;

// Retraite
export const RETRAITE_AGE_LEGAL = 64;
export const RETRAITE_TRIMESTRES_REQUIS = 172; // Génération 1965+
export const RETRAITE_TAUX_PLEIN = 0.50;
export const RETRAITE_DECOTE_PAR_TRIMESTRE = 0.00625; // 0.625%
export const RETRAITE_SURCOTE_PAR_TRIMESTRE = 0.0125; // 1.25%
export const PASS_2025 = 46368;
export const PLAFOND_PER_DEDUCTION_TAUX = 0.10;

// Démembrement - Barème fiscal article 669 CGI
export const BAREME_USUFRUIT_FISCAL = [
  { ageMin: 0, ageMax: 21, usufruit: 0.90 },
  { ageMin: 21, ageMax: 31, usufruit: 0.80 },
  { ageMin: 31, ageMax: 41, usufruit: 0.70 },
  { ageMin: 41, ageMax: 51, usufruit: 0.60 },
  { ageMin: 51, ageMax: 61, usufruit: 0.50 },
  { ageMin: 61, ageMax: 71, usufruit: 0.40 },
  { ageMin: 71, ageMax: 81, usufruit: 0.30 },
  { ageMin: 81, ageMax: 91, usufruit: 0.20 },
  { ageMin: 91, ageMax: Infinity, usufruit: 0.10 },
];

// Parts fiscales
export const PARTS_FISCALES = {
  celibataire: 1,
  divorce: 1,
  veuf: 1,
  marie: 2,
  pacse: 2,
};

export const PARTS_PAR_ENFANT = [0, 0.5, 0.5, 1]; // 1st child: 0.5, 2nd: 0.5, 3rd+: 1 each
