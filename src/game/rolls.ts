import type { Band, CheckDef } from './types';

export const rollD20 = (): number => 1 + Math.floor(Math.random() * 20);

export function bandFor(check: CheckDef, value: number): Band {
  const band = check.bands.find((b) => value >= b.from && value <= b.to);
  if (!band) throw new Error(`No band for ${value} on ${check.id}`);
  return band;
}

export interface Segment {
  from: number;
  to: number;
  /** null means unknown ("?"). */
  band: Band | null;
}

/**
 * What the player knows about a check's table.
 * Landing on a result reveals that result's whole range: roll a 9 and lose
 * to Old Moss, and you know every number that loses to him. Results you've
 * never landed on stay unknown ("?") until a roll lands there, or a page
 * reveals the whole table.
 */
export function knownSegments(check: CheckDef, values: number[], full: boolean): Segment[] {
  const seen = new Set(values.map((v) => bandFor(check, v)));
  const cells: (Band | null)[] = Array.from({ length: 20 }, (_, i) => {
    const band = bandFor(check, i + 1);
    return full || seen.has(band) ? band : null;
  });

  const segments: Segment[] = [];
  cells.forEach((band, i) => {
    const last = segments[segments.length - 1];
    if (last && last.band === band) last.to = i + 1;
    else segments.push({ from: i + 1, to: i + 1, band });
  });
  return segments;
}
