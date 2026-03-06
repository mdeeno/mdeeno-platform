export const BETA_END_DATE = new Date('2026-06-15T00:00:00+09:00');

export function isBetaMode(): boolean {
  return new Date() < BETA_END_DATE;
}
