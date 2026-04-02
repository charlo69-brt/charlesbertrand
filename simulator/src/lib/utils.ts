export function formatEuro(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant);
}

export function formatEuroDetaille(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(montant);
}

export function formatPercent(taux: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(taux);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function calculateAge(dateNaissance: string): number {
  const today = new Date();
  const birth = new Date(dateNaissance);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getSituationLabel(situation: string): string {
  const labels: Record<string, string> = {
    celibataire: 'Célibataire',
    marie: 'Marié(e)',
    pacse: 'Pacsé(e)',
    divorce: 'Divorcé(e)',
    veuf: 'Veuf/Veuve',
  };
  return labels[situation] || situation;
}

export function getRegimeLabel(regime: string): string {
  const labels: Record<string, string> = {
    communaute_legale: 'Communauté légale',
    separation_biens: 'Séparation de biens',
    communaute_universelle: 'Communauté universelle',
    participation_acquets: 'Participation aux acquêts',
  };
  return labels[regime] || regime;
}

export function getTypeBienLabel(type: string): string {
  const labels: Record<string, string> = {
    residence_principale: 'Résidence principale',
    locatif: 'Bien locatif',
    scpi: 'SCPI',
  };
  return labels[type] || type;
}

export function getTypeActifFinancierLabel(type: string): string {
  const labels: Record<string, string> = {
    compte_courant: 'Compte courant',
    livret: 'Livret d\'épargne',
    assurance_vie: 'Assurance-vie',
    per: 'PER',
    pea: 'PEA',
    cto: 'CTO',
  };
  return labels[type] || type;
}

export function getTypeCreditLabel(type: string): string {
  const labels: Record<string, string> = {
    immobilier: 'Crédit immobilier',
    consommation: 'Crédit consommation',
    autre: 'Autre',
  };
  return labels[type] || type;
}
