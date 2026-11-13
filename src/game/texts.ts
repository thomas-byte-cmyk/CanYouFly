import type { LandingGrade } from '../sim/landing';
import type { EndReason, FlightResult, PilotState } from '../sim/session';

// Textes FR du prototype (un fichier par langue au MVP, décision D12).

export const GRADE_TITLE: Record<LandingGrade, string> = {
  PERFECT: 'ATTERRISSAGE PARFAIT !',
  GOOD: 'BON ATTERRISSAGE',
  ROUGH: 'ATTERRISSAGE BRUTAL',
  CRASH: 'CRASH !',
  WATER: 'WATER CRASH !',
};

export const GRADE_COLOR: Record<LandingGrade, string> = {
  PERFECT: '#3c9a3c',
  GOOD: '#2f7fb8',
  ROUGH: '#d98a1f',
  CRASH: '#d9573b',
  WATER: '#2f7fb8',
};

const PHRASES: Record<LandingGrade, string[]> = {
  PERFECT: ['Atterrissage parfait. Tu es officiellement un pilote !', 'Même les mouettes applaudissent.', 'Pas une goutte de café renversée.'],
  GOOD: ['Propre. Le café n\'a même pas débordé.', 'Joli ! Les passagers imaginaires sont ravis.', 'Bien posé. Le Coucou te remercie.'],
  ROUGH: ['Un peu brutal, mais on est vivants.', 'L\'avion a souffert. Le pilote aussi.', 'Les roues s\'en souviendront.'],
  CRASH: ['Techniquement, tu es arrivé au sol.', 'L\'avion a pris un raccourci… vers le bas.', 'Pip a besoin d\'une minute. Ou dix.'],
  WATER: ['L\'eau n\'était pas une piste d\'atterrissage !', 'Les poissons te mettent 2/10.', 'Plouf. Juste… plouf.'],
};

export function pickPhrase(r: FlightResult, seed: number): string {
  if (r.reason === 'takeoff-failed') return 'Le vol le plus court de l\'histoire.';
  if (r.fuelEmpty && !r.validated && r.grade !== 'WATER') return 'Il manquait juste… tout le carburant.';
  if (r.reason === 'obstacle') {
    const o = ['Cet arbre était là bien avant toi.', 'L\'obstacle a gagné ce round.'];
    return o[seed % o.length];
  }
  const list = PHRASES[r.grade];
  return list[seed % list.length];
}

export function narrative(r: FlightResult, from: string, to: string): string {
  const km = Math.round(r.remainingKm);
  const where = r.zone ? r.zone.name : r.surface === 'water' ? 'la Marne' : `${surfaceName(r.surface)}`;
  let end: string;
  if (r.grade === 'WATER') end = `Plouf dans ${where}, à ${km} km de ${to}.`;
  else if (r.validated && r.grade === 'CRASH') end = `Arrivée fracassante : ${where}.`;
  else if (r.validated) end = `${r.grade === 'PERFECT' ? 'Atterrissage parfait' : 'Atterrissage'} : ${where}.`;
  else if (r.reason === 'takeoff-failed') end = 'Le décollage n\'a pas eu lieu.';
  else if (r.grade === 'CRASH') end = `Crash dans ${where}, à ${km} km de ${to}.`;
  else end = `Tu voulais rejoindre ${to}. Tu as trouvé ${where === 'un champ' ? 'un champ' : where}, à ${km} km.`;
  return `Départ de ${from}. Destination ${to}. ${end}`;
}

function surfaceName(s: string): string {
  switch (s) {
    case 'field': return 'un champ';
    case 'vineyard': return 'les vignes';
    case 'grass': return 'une prairie';
    case 'park': return 'un parc';
    case 'runway': return 'une piste';
    case 'forest': return 'la forêt';
    case 'city': return 'la ville';
    default: return 'la nature';
  }
}

export const PILOT_LABEL: Record<PilotState, string> = {
  fresh: 'En pleine forme',
  ruffled: 'Décoiffé',
  shaken: 'Secoué',
  dazed: 'Sonné et noirci',
  soaked: 'Trempé',
};

export const PLANE_LABEL: Record<LandingGrade, string> = {
  PERFECT: 'Intact',
  GOOD: 'Quelques rayures',
  ROUGH: 'Abîmé',
  CRASH: 'En morceaux (réparé)',
  WATER: 'Repêché (réparé)',
};

export function advice(r: FlightResult): string {
  const reason: EndReason = r.reason;
  if (reason === 'water') return 'Conseil : vise une zone balisée par un drapeau. L\'eau n\'en est jamais une !';
  if (reason === 'obstacle') return 'Conseil : les obstacles sont visibles de loin. Passe au-dessus ou pose-toi avant.';
  if (reason === 'takeoff-failed') return 'Conseil : quand l\'avion a pris de la vitesse sur la piste, maintiens ▲ pour décoller.';
  if (reason === 'nose-first') return 'Conseil : ne pique pas au dernier moment, garde le nez légèrement relevé.';
  if (r.touchdown) {
    switch (r.touchdown.cause) {
      case 'sink': return 'Conseil : juste avant de toucher, relève un peu le nez pour adoucir la descente.';
      case 'speed': return 'Conseil : réduis les gaz plus tôt pour arriver moins vite.';
      case 'pitch': return 'Conseil : au contact, garde le nez à peine relevé (ni trop, ni trop peu).';
      case 'terrain': return 'Conseil : forêt et ville ne sont pas des pistes. Cherche les drapeaux.';
      default: break;
    }
  }
  if (!r.validated) return 'Conseil : les zones d\'arrivée de Reims sont marquées par des drapeaux.';
  if (r.grade === 'PERFECT') return 'Essaie le Parc de la cathédrale (★★★) pour plus de Boulons !';
  return 'Conseil : descente douce + nez légèrement relevé = PERFECT.';
}
