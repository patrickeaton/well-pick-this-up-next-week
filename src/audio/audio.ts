/**
 * Chiptune music and sound effects, made live with Web Audio: square, pulse
 * and triangle waves plus noise drums. No audio files.
 *
 * Browsers only allow sound after the player has clicked or pressed a key,
 * so nothing plays until `unlock()` runs from a user gesture.
 */
import { TRACKS, type Track, type TrackId } from './tracks';
import { settings } from '../ui/settings';

const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 } as const;

/** 'C#5' → frequency in Hz. */
function freq(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Bad note: ${name}`);
  const semitone = NOTE[m[1] as keyof typeof NOTE] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = (Number(m[3]) + 1) * 12 + semitone;
  return 440 * 2 ** ((midi - 69) / 12);
}

/** 'Am' → the chord's three notes in the given octave (root first). */
function chordNotes(chord: string, octave: number): number[] {
  const m = /^([A-G][#b]?)(m|dim)?$/.exec(chord);
  if (!m) throw new Error(`Bad chord: ${chord}`);
  const root = freq(`${m[1]}${octave}`);
  const shape = m[2] === 'm' ? [0, 3, 7] : m[2] === 'dim' ? [0, 3, 6] : [0, 4, 7];
  return shape.map((s) => root * 2 ** (s / 12));
}

const LOOKAHEAD = 0.15; // seconds of music scheduled ahead
const TICK_MS = 40;
const FADE = 0.8; // crossfade time, seconds

let ctx: AudioContext | null = null;
let musicBus: GainNode;
let sfxBus: GainNode;
let pulseWave: PeriodicWave;
let noise: AudioBuffer;

interface Playing {
  id: TrackId;
  track: Track;
  out: GainNode;
  step: number;
  next: number;
  melody: string[];
  timer: number;
}
let playing: Playing | null = null;
let wanted: TrackId | null = null;

/** Call from a click or key press: browsers block audio until then. */
export function unlock(): void {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(ctx.destination);
    sfxBus.connect(ctx.destination);
    // A 25% pulse wave: the classic thin, nasal chiptune lead.
    const n = 32;
    const real = new Float32Array(n);
    const imag = new Float32Array(n);
    for (let k = 1; k < n; k++) imag[k] = (2 / (k * Math.PI)) * Math.sin(k * Math.PI * 0.25);
    pulseWave = ctx.createPeriodicWave(real, imag);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    applyVolumes();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  if (wanted && (!playing || playing.id !== wanted)) start(wanted);
}

/** Match the buses to the settings (call after settings change). */
export function applyVolumes(): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  const music = settings.muted ? 0 : (settings.musicVolume / 100) * 0.22;
  const sfx = settings.muted ? 0 : (settings.sfxVolume / 100) * 0.35;
  musicBus.gain.setTargetAtTime(music, now, 0.05);
  sfxBus.gain.setTargetAtTime(sfx, now, 0.05);
}

/** Play this track (crossfading from whatever's on). `null` fades to silence. */
export function playMusic(id: TrackId | null): void {
  if (id === wanted) return;
  wanted = id;
  if (!ctx) return; // starts once unlocked
  start(id);
}

/** Pause everything while the tab is hidden. */
export function setPaused(paused: boolean): void {
  if (!ctx) return;
  if (paused) void ctx.suspend();
  else void ctx.resume();
}

function start(id: TrackId | null): void {
  if (!ctx) return;
  const now = ctx.currentTime;
  if (playing) {
    const old = playing;
    window.clearInterval(old.timer);
    old.out.gain.setTargetAtTime(0, now, FADE / 4);
    window.setTimeout(() => old.out.disconnect(), FADE * 2000); // (its filter goes with it)
    playing = null;
  }
  if (!id) return;
  const track: Track = TRACKS[id];
  const out = ctx.createGain();
  out.gain.setValueAtTime(0, now);
  out.gain.setTargetAtTime(track.volume, now + 0.05, FADE / 4);
  // A gentle low-pass takes the harsh edge off the square waves.
  const soften = ctx.createBiquadFilter();
  soften.type = 'lowpass';
  soften.frequency.value = track.tone ?? 4500;
  soften.Q.value = 0.5;
  out.connect(soften).connect(musicBus);
  const p: Playing = {
    id, track, out, step: 0, next: now + 0.1,
    melody: track.melody.split(/\s+/),
    timer: 0,
  };
  p.timer = window.setInterval(() => schedule(p), TICK_MS);
  playing = p;
  schedule(p);
}

function schedule(p: Playing): void {
  if (!ctx || playing !== p) return;
  const stepDur = 60 / p.track.bpm / p.track.stepsPerBeat;
  while (p.next < ctx.currentTime + LOOKAHEAD) {
    playStep(p, p.step, p.next, stepDur);
    p.step = (p.step + 1) % p.melody.length;
    p.next += stepDur;
  }
}

function playStep(p: Playing, step: number, t: number, stepDur: number): void {
  const tr = p.track;
  const inBar = step % tr.stepsPerBar;
  const chord = tr.chords[Math.floor(step / tr.stepsPerBar) % tr.chords.length];

  // Melody: a note plus however many '-' follow it.
  const tok = p.melody[step];
  if (tok && tok !== '-' && tok !== '.') {
    let len = 1;
    while (p.melody[(step + len) % p.melody.length] === '-' && len < p.melody.length) len++;
    tone(p.out, tr.lead, freq(tok), t, len * stepDur * 0.92, 0.32);
  }

  // Bass, from the chord's root.
  const b = tr.bass.split(' ')[inBar];
  if (b && b !== '.') {
    const [root, , fifth] = chordNotes(chord, 2);
    const f = b === 'f' ? fifth : b === 'o' ? root * 2 : root;
    const held = tr.bass.split(' ').every((x, i) => i === 0 || x === '.');
    tone(p.out, 'triangle', f, t, (held ? tr.stepsPerBar : 1) * stepDur * 0.9, 0.5);
  }

  // Arpeggio: quiet pulse notes from the chord.
  if (tr.arp) {
    const a = tr.arp.split(' ')[inBar];
    if (a && a !== '.') tone(p.out, 'pulse', chordNotes(chord, 4)[Number(a)], t, stepDur * 0.6, 0.09);
  }

  // Pad: the whole chord, held softly for the bar.
  if (tr.pad && inBar === 0) {
    for (const f of chordNotes(chord, 3)) tone(p.out, 'triangle', f, t, tr.stepsPerBar * stepDur, 0.12, 0.15);
  }

  // Drums.
  if (tr.drums) {
    const d = tr.drums.split(' ')[inBar];
    if (d === 'k') kick(p.out, t, 0.5);
    else if (d === 's') hiss(p.out, t, 0.12, 1800, 0.22);
    else if (d === 'h') hiss(p.out, t, 0.03, 7000, 0.08);
  }
}

/** One note with a quick, plucky envelope. */
function tone(dest: AudioNode, wave: Track['lead'], f: number, t: number, dur: number, vol: number, attack = 0.005): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  if (wave === 'pulse') osc.setPeriodicWave(pulseWave);
  else osc.type = wave;
  osc.frequency.setValueAtTime(f, t);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.setTargetAtTime(vol * 0.6, t + attack, dur * 0.3);
  g.gain.setTargetAtTime(0, t + dur, 0.03);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.2);
}

function kick(dest: AudioNode, t: number, vol: number): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + 0.2);
}

/** A burst of filtered noise: snares, hats, dice clatter. */
function hiss(dest: AudioNode, t: number, dur: number, cutoff: number, vol: number): void {
  if (!ctx) return;
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.connect(filter).connect(g).connect(dest);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

// ── Sound effects ────────────────────────────────────────────
export type Sfx = 'dice' | 'land' | 'page' | 'achieve';

export function playSfx(name: Sfx): void {
  if (!ctx || ctx.state !== 'running') return;
  const t = ctx.currentTime + 0.01;
  switch (name) {
    case 'dice':
      // The d20 clattering across the table.
      for (let i = 0; i < 7; i++) hiss(sfxBus, t + i * 0.08 + Math.random() * 0.03, 0.04, 2500 + Math.random() * 2000, 0.5 - i * 0.05);
      break;
    case 'land':
      hiss(sfxBus, t, 0.05, 1500, 0.5);
      tone(sfxBus, 'square', freq('G5'), t + 0.03, 0.08, 0.25);
      tone(sfxBus, 'square', freq('C6'), t + 0.11, 0.14, 0.25);
      break;
    case 'page':
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(sfxBus, 'pulse', freq(n), t + i * 0.07, 0.12, 0.3));
      break;
    case 'achieve':
      ['G5', 'C6', 'E6', 'G6'].forEach((n, i) => tone(sfxBus, 'square', freq(n), t + i * 0.09, i === 3 ? 0.35 : 0.1, 0.25));
      break;
  }
}

/** For testing: what the audio is doing right now. */
export function audioState(): { context: string; wanted: TrackId | null; playing: TrackId | null; step: number } {
  return { context: ctx?.state ?? 'not started', wanted, playing: playing?.id ?? null, step: playing?.step ?? 0 };
}
