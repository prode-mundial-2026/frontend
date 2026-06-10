import { Match } from './types';

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programado',
  TIMED: 'Programado',
  IN_PLAY: 'En juego',
  PAUSED: 'Entretiempo',
  FINISHED: 'Finalizado',
  POSTPONED: 'Postergado',
};

export const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  SCHEDULED: 'default',
  TIMED: 'default',
  IN_PLAY: 'warning',
  PAUSED: 'warning',
  FINISHED: 'success',
  POSTPONED: 'error',
};

export function isMatchLocked(match: Match): boolean {
  if (match.status !== 'SCHEDULED' && match.status !== 'TIMED') return true;
  return new Date(match.utcDate).getTime() - Date.now() < 15 * 60 * 1000;
}
