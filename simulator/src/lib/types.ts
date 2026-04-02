// ============ ENUMS ============
export type SituationFamiliale = 'celibataire' | 'marie' | 'pacse' | 'divorce' | 'veuf';
export type RegimeMatrimonial = 'communaute_legale' | 'separation_biens' | 'communaute_universelle' | 'participation_acquets';
export type TypeBienImmobilier = 'residence_principale' | 'locatif' | 'scpi';
export type TypeActifFinancier = 'compte_courant' | 'livret' | 'assurance_vie' | 'per' | 'pea' | 'cto';

// ============ CLIENT ============
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance: string; // ISO date
  situationFamiliale: SituationFamiliale;
  regimeMatrimonial?: RegimeMatrimonial;
  nombreEnfants: number;
  enfantsACharge: number;
  email?: string;
  telephone?: string;
  adresse?: string;
  profession?: string;
  creeLe: string;
  modifieLe: string;
}

// ============ BILAN PATRIMONIAL ============
export interface BienImmobilier {
  id: string;
  label: string;
  type: TypeBienImmobilier;
  valeur: number;
  capitalRestantDu?: number;
  loyerAnnuel?: number;
  chargesAnnuelles?: number;
  dateAcquisition?: string;
  detenuEnSCI?: boolean;
}

export interface ActifFinancier {
  id: string;
  label: string;
  type: TypeActifFinancier;
  valeur: number;
  versementsMensuels?: number;
  tauxRendement?: number;
  dateOuverture?: string;
}

export interface ActifProfessionnel {
  id: string;
  label: string;
  valeur: number;
}

export interface Actifs {
  immobilier: BienImmobilier[];
  financier: ActifFinancier[];
  professionnel: ActifProfessionnel[];
}

export interface Credit {
  id: string;
  label: string;
  type: 'immobilier' | 'consommation' | 'autre';
  capitalRestant: number;
  mensualite: number;
  tauxInteret: number;
  dureeRestanteMois: number;
}

export interface AutreDette {
  id: string;
  label: string;
  montant: number;
}

export interface Passifs {
  credits: Credit[];
  autresDettes: AutreDette[];
}

export interface Revenus {
  salairesNets: number;
  bicBnc: number;
  revenusFonciers: number;
  revenusMobiliers: number;
  pensions: number;
  autresRevenus: number;
}

export interface Charges {
  chargesCourantes: number;
  impotRevenu: number;
  taxeFonciere: number;
  ifi: number;
  epargneAnnuelle: number;
}

export interface BilanPatrimonial {
  clientId: string;
  actifs: Actifs;
  passifs: Passifs;
  revenus: Revenus;
  charges: Charges;
  modifieLe: string;
}

// ============ TAX RESULTS ============
export interface DetailTranche {
  tranche: string;
  montant: number;
  taux: number;
}

export interface ResultatIR {
  revenuBrutGlobal: number;
  revenuNetImposable: number;
  nombreParts: number;
  impotBrut: number;
  decote: number;
  impotNet: number;
  tauxMarginalImposition: number;
  tauxMoyenImposition: number;
  detailParTranche: DetailTranche[];
  prelevementsSociaux: number;
  pfuCapital: number;
  totalFiscalite: number;
}

export interface ResultatIFI {
  patrimoineImmobilierBrut: number;
  abattementRP: number;
  patrimoineNetTaxable: number;
  ifiDu: number;
  decote: number;
  detailParTranche: DetailTranche[];
}

// ============ INVESTMENT SIMULATIONS ============
export interface ProjectionAnnuelle {
  annee: number;
  capital: number;
  plusValue?: number;
}

export interface SimulationAssuranceVie {
  versementInitial: number;
  versementsMensuels: number;
  tauxRendementFondsEuros: number;
  tauxRendementUC: number;
  repartitionFondsEuros: number;
  dureeAnnees: number;
  capitalFinal: number;
  totalVersements: number;
  plusValue: number;
  projectionAnnuelle: ProjectionAnnuelle[];
  fiscaliteAvant8ans: { pfu: number };
  fiscaliteApres8ans: { apresAbattement: number; impot: number };
}

export interface SimulationPER {
  versementAnnuel: number;
  tmi: number;
  economieImpot: number;
  plafondDeduction: number;
  dureeAnnees: number;
  tauxRendement: number;
  capitalEstime: number;
  projectionAnnuelle: ProjectionAnnuelle[];
}

export interface SimulationSCPI {
  montantInvesti: number;
  tauxDistribution: number;
  revenusAnnuels: number;
  fiscaliteRevenusFonciers: number;
  rendementNet: number;
}

export interface SimulationPinel {
  montantInvestissement: number;
  dureeEngagement: 6 | 9 | 12;
  tauxReduction: number;
  reductionTotale: number;
  reductionAnnuelle: number;
}

export interface SimulationDeficitFoncier {
  travauxDeductibles: number;
  revenusFonciers: number;
  deficitImputable: number;
  deficitReportable: number;
  economieImpot: number;
}

// ============ RETRAITE ============
export interface SimulationRetraite {
  ageDepart: number;
  trimestresValides: number;
  trimestresRequis: number;
  pensionRegimeGeneral: number;
  pensionComplementaire: number;
  pensionTotale: number;
  tauxPlein: boolean;
  decoteSurcote: number;
  gapMensuel: number;
  capitalNecessaire: number;
}

// ============ SUCCESSION ============
export interface Beneficiaire {
  lien: 'enfant' | 'conjoint' | 'frere_soeur' | 'neveu_niece' | 'autre';
  prenom: string;
  part: number;
  abattement: number;
  droitsDus: number;
  detailTranches: DetailTranche[];
}

export interface SimulationSuccession {
  patrimoineTransmis: number;
  beneficiaires: Beneficiaire[];
  assuranceVie: {
    montant: number;
    versementsAvant70: number;
    versementsApres70: number;
    fiscalite: number;
  } | null;
  totalDroits: number;
}

// ============ STORAGE ============
export interface AppData {
  version: number;
  clients: Client[];
  bilans: Record<string, BilanPatrimonial>;
}
