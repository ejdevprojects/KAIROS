import { AlarmTone } from '../types';

let audioCtx: AudioContext | null = null;
let activeAlarmInterval: number | null = null;
let isAlarmCurrentlyPlaying = false;

// Initialize or get the AudioContext safely after user gesture
export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Single tone generators
function playBellTone(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const frequencies = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6 harmonics
  const gains = [0.4, 0.3, 0.2, 0.1];

  frequencies.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gains[idx] * volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.8);
  });
}

function playDigitalTone(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  // Wristwatch style beep-beep-beep
  [0, 0.12, 0.24, 0.36].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(2048, now + offset);

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.18 * volume, now + offset + 0.008);
    gain.gain.setValueAtTime(0.18 * volume, now + offset + 0.06);
    gain.gain.linearRampToValueAtTime(0, now + offset + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.08);
  });
}

function playGongTone(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  const freqs = [146.83, 220.0, 293.66, 440.0, 587.33]; // D3 chord deep gong

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq + (Math.random() * 2 - 1), now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime((0.35 / (i + 1)) * volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.8);
  });
}

function playRadarTone(ctx: AudioContext, volume: number) {
  const now = ctx.currentTime;
  [0, 0.16].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now + offset);
    osc.frequency.exponentialRampToValueAtTime(800, now + offset + 0.12);

    gain.gain.setValueAtTime(0, now + offset);
    gain.gain.linearRampToValueAtTime(0.25 * volume, now + offset + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + offset);
    osc.stop(now + offset + 0.14);
  });
}

export function playToneOnce(tone: AlarmTone, volume = 0.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  switch (tone) {
    case 'digital':
      playDigitalTone(ctx, volume);
      break;
    case 'gong':
      playGongTone(ctx, volume);
      break;
    case 'radar':
      playRadarTone(ctx, volume);
      break;
    case 'bell':
    default:
      playBellTone(ctx, volume);
      break;
  }
}

// Start continuous alarm loop until stopped
export function startAlarm(tone: AlarmTone = 'bell', volume = 0.8) {
  stopAlarm();
  const ctx = getAudioContext();
  if (!ctx) return;

  isAlarmCurrentlyPlaying = true;
  playToneOnce(tone, volume);

  const loopCadence = tone === 'gong' ? 3000 : tone === 'digital' ? 1200 : 1800;

  activeAlarmInterval = window.setInterval(() => {
    if (!isAlarmCurrentlyPlaying) {
      stopAlarm();
      return;
    }
    const currentCtx = getAudioContext();
    if (currentCtx) {
      playToneOnce(tone, volume);
    }
  }, loopCadence);
}

export function stopAlarm() {
  isAlarmCurrentlyPlaying = false;
  if (activeAlarmInterval !== null) {
    clearInterval(activeAlarmInterval);
    activeAlarmInterval = null;
  }
}

export function isAlarmPlaying(): boolean {
  return isAlarmCurrentlyPlaying;
}

// Subtle short feedback click for buttons
export function playSoftClick() {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}
