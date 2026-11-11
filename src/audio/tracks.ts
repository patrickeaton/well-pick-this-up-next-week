/**
 * The soundtrack: short looping chiptune pieces, one per kind of place.
 *
 * Each track is a chord per bar plus a hand-written melody. The bass and
 * arpeggio are built from the chords. Melody tokens, one per step:
 *   'C5'  play a note (sharps 'F#4', flats 'Bb4')
 *   '-'   keep holding the previous note
 *   '.'   rest
 * Drum tokens: 'k' kick, 's' snare, 'h' hi-hat, '.' nothing.
 */
export interface Track {
  /** Steps per minute ÷ stepsPerBeat = tempo. */
  bpm: number;
  stepsPerBeat: number;
  stepsPerBar: number;
  /** One chord per bar: 'C', 'Am', 'F#', 'Bb', 'Bdim'. */
  chords: string[];
  melody: string;
  /** Which wave the melody uses. */
  lead: 'square' | 'pulse' | 'triangle';
  /** Bass notes on these steps of each bar: 'r' root, 'f' fifth, 'o' octave. */
  bass: string;
  /** Arpeggio over the chord: chord-tone indexes per step ('.' for none), or omit. */
  arp?: string;
  /** Hold the chord as a soft pad for the whole bar. */
  pad?: boolean;
  /** One bar of drums, repeated. */
  drums?: string;
  /** Overall loudness, roughly 0–1. */
  volume: number;
  /** Soften the treble above this frequency (Hz). Lower is mellower. */
  tone?: number;
}

const bars = (...b: string[]): string => b.join(' ');

export const TRACKS = {
  /** Title, cupboard and endings: wistful, a little hopeful. */
  title: {
    bpm: 92, stepsPerBeat: 2, stepsPerBar: 8, lead: 'pulse', volume: 0.8,
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'F', 'G'],
    melody: bars(
      'E5 - G5 - E5 D5 C5 -',
      'A4 - C5 - E5 - - .',
      'F5 - E5 D5 C5 - A4 -',
      'B4 - D5 - G5 - - .',
      'E5 - G5 - C6 - B5 A5',
      'G5 - E5 - A5 - G5 E5',
      'F5 E5 D5 C5 A4 - C5 D5',
      'B4 - D5 - C5 - - .',
    ),
    bass: 'r . . . f . . .',
    arp: '0 . 1 . 2 . 1 .',
  },
  /** The Rusty Lantern and the shops: a cozy jig. */
  inn: {
    bpm: 100, stepsPerBeat: 3, stepsPerBar: 6, lead: 'triangle', volume: 0.9, tone: 1800,
    chords: ['G', 'C', 'G', 'D', 'G', 'C', 'D', 'G'],
    melody: bars(
      'D5 G5 B5 A5 G5 D5',
      'E5 G5 C6 B5 A5 G5',
      'D5 G5 B5 D6 B5 G5',
      'A5 F#5 D5 E5 F#5 A5',
      'B5 - G5 A5 - F#5',
      'G5 E5 C5 E5 G5 C6',
      'B5 A5 G5 F#5 E5 F#5',
      'G5 - - G4 - .',
    ),
    bass: 'r . . f . .',
    drums: 'k . . h . .',
  },
  /** Streets, market, lanes and the pond: a sleepy town. */
  town: {
    bpm: 72, stepsPerBeat: 2, stepsPerBar: 8, lead: 'pulse', volume: 0.75,
    chords: ['F', 'Dm', 'Bb', 'C', 'F', 'Dm', 'Bb', 'C'],
    melody: bars(
      'A4 - - C5 F5 - - E5',
      'D5 - - A4 F4 - - .',
      'D5 - - F5 Bb5 - A5 G5',
      'E5 - - - G4 - - .',
      'C5 - A4 - F5 - E5 -',
      'F5 - - E5 D5 - A4 -',
      'Bb4 - D5 - F5 - G5 -',
      'E5 - - - - - . .',
    ),
    bass: 'r . . . f . . .',
    arp: '0 1 2 1 0 1 2 1',
  },
  /** The chapel and the graveyard: slow and solemn, like a little organ. */
  chapel: {
    bpm: 60, stepsPerBeat: 2, stepsPerBar: 8, lead: 'triangle', volume: 0.9,
    chords: ['Dm', 'Bb', 'Gm', 'A', 'Dm', 'F', 'Gm', 'A'],
    melody: bars(
      'A4 - - - D5 - - -',
      'F5 - - - D5 - - -',
      'G4 - Bb4 - D5 - - -',
      'C#5 - - - E5 - - -',
      'F5 - E5 - D5 - - -',
      'C5 - A4 - F4 - - -',
      'G4 - A4 - Bb4 - - -',
      'A4 - - - - - . .',
    ),
    bass: 'r . . . . . . .',
    pad: true,
  },
  /** The cellar: dark and drippy. */
  cellar: {
    bpm: 64, stepsPerBeat: 2, stepsPerBar: 8, lead: 'triangle', volume: 0.85,
    chords: ['Em', 'Em', 'C', 'B'],
    melody: bars(
      '. . B4 - . . G4 -',
      '. . A4 - G4 - F#4 -',
      '. . G4 - . . E4 -',
      'D#4 - - - B3 - - .',
    ),
    bass: 'r . . . . . . .',
    pad: true,
  },
  /** The tower and the winding stair: tense, climbing. */
  tower: {
    bpm: 112, stepsPerBeat: 2, stepsPerBar: 8, lead: 'square', volume: 0.65,
    chords: ['Am', 'F', 'G', 'E', 'Am', 'F', 'G', 'E'],
    melody: bars(
      'A4 - C5 - E5 - D5 C5',
      'A4 - - - F4 - - .',
      'B4 - D5 - G5 - F5 E5',
      'G#4 - - - E4 - - .',
      'E5 - A5 - G5 - E5 -',
      'F5 - E5 - C5 - A4 -',
      'D5 - G5 - F5 - D5 -',
      'E5 - - - G#4 - B4 -',
    ),
    bass: 'r r r r r r r r',
    drums: 'k . h . k . h .',
  },
  /** The belfry: the Night Warden. A boss fight. */
  boss: {
    bpm: 150, stepsPerBeat: 2, stepsPerBar: 8, lead: 'square', volume: 0.6,
    chords: ['Cm', 'Ab', 'Bb', 'G', 'Cm', 'Ab', 'Bb', 'G'],
    melody: bars(
      'C5 Eb5 G5 C6 G5 Eb5 C5 Eb5',
      'Ab4 C5 Eb5 Ab5 Eb5 C5 Ab4 C5',
      'Bb4 D5 F5 Bb5 F5 D5 Bb4 D5',
      'B4 D5 G5 B5 G5 F5 D5 B4',
      'G5 - - Eb5 - - C5 -',
      'Ab5 - - G5 - - Eb5 -',
      'F5 - - D5 - - Bb4 -',
      'B4 - D5 - G5 - - .',
    ),
    bass: 'r o r o r o r o',
    drums: 'k h s h k k s h',
  },
} satisfies Record<string, Track>;

export type TrackId = keyof typeof TRACKS;
