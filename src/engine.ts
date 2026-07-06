/* ============================================================
   TESLA LIGHT SHOW GENERATION ENGINE
   Based on the official teslamotors/light-show repo (FSEQ v2.0,
   uncompressed, 200-channel format, 20ms frames).
   ============================================================ */

// ---------- Channel map (1-indexed per official xLights project) ----------
export const CH = {
  L_OUTER_BEAM: 1, R_OUTER_BEAM: 2,
  L_INNER_BEAM: 3, R_INNER_BEAM: 4,
  L_SIGNATURE: 5, R_SIGNATURE: 6,
  L_CH4: 7, R_CH4: 8, L_CH5: 9, R_CH5: 10, L_CH6: 11, R_CH6: 12,
  L_FRONT_TURN: 13, R_FRONT_TURN: 14,
  L_FOG: 15, R_FOG: 16,
  L_AUX_PARK: 17, R_AUX_PARK: 18,
  L_SIDE_MARKER: 19, R_SIDE_MARKER: 20,
  L_REPEATER: 21, R_REPEATER: 22,
  L_REAR_TURN: 23, R_REAR_TURN: 24,
  BRAKE: 25,
  L_TAIL: 26, R_TAIL: 27,
  REVERSE: 28,
  REAR_FOG: 29,
  LICENSE: 30,
  L_FALCON: 31, R_FALCON: 32,
  L_FRONT_DOOR: 33, R_FRONT_DOOR: 34,
  L_MIRROR: 35, R_MIRROR: 36,
  LF_WINDOW: 37, LR_WINDOW: 38, RF_WINDOW: 39, RR_WINDOW: 40,
  LIFTGATE: 41,
  LF_HANDLE: 42, LR_HANDLE: 43, RF_HANDLE: 44, RR_HANDLE: 45,
  CHARGE_PORT: 46,
  FRONT_BAR_START: 47, FRONT_BAR_LEN: 60,
  REAR_BAR_START: 111, REAR_BAR_LEN: 52,
  OFFROAD_START: 167, OFFROAD_LEN: 6,
  SUSPENSION: 175,
  RGB_DISPLAY: 176,
  RGB_RR: 179, RGB_RF: 182, RGB_CF: 185, RGB_LF: 188, RGB_LR: 191,
} as const;

export const V = {
  OFF: 0,
  OFF_500: 25, OFF_1000: 51, OFF_2000: 76,
  ON_500: 178, ON_1000: 204, ON_2000: 229,
  ON: 255,
} as const;

const CL = { IDLE: 0, OPEN: 63, DANCE: 127, CLOSE: 191, STOP: 255 } as const;

const CLOSURE_LIMITS: Record<number, number> = {
  [CH.LIFTGATE]: 6,
  [CH.L_MIRROR]: 20, [CH.R_MIRROR]: 20,
  [CH.CHARGE_PORT]: 3,
  [CH.LF_WINDOW]: 6, [CH.LR_WINDOW]: 6, [CH.RF_WINDOW]: 6, [CH.RR_WINDOW]: 6,
  [CH.LF_HANDLE]: 20, [CH.LR_HANDLE]: 20, [CH.RF_HANDLE]: 20, [CH.RR_HANDLE]: 20,
  [CH.L_FRONT_DOOR]: 6, [CH.R_FRONT_DOOR]: 6,
  [CH.L_FALCON]: 6, [CH.R_FALCON]: 6,
};

export const CHANNEL_COUNT = 200;
export const FRAME_MS = 20;

// ============================================================
// FFT (radix-2, in-place, real input via complex transform)
// ============================================================
function makeFFT(n: number) {
  const levels = Math.log2(n) | 0;
  if (1 << levels !== n) throw new Error('FFT size must be power of 2');
  const cosT = new Float32Array(n / 2), sinT = new Float32Array(n / 2);
  for (let i = 0; i < n / 2; i++) {
    cosT[i] = Math.cos(2 * Math.PI * i / n);
    sinT[i] = Math.sin(2 * Math.PI * i / n);
  }
  return function fft(re: Float32Array, im: Float32Array) {
    for (let i = 0; i < n; i++) {
      let j = 0, x = i;
      for (let k = 0; k < levels; k++) { j = (j << 1) | (x & 1); x >>= 1; }
      if (j > i) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let size = 2; size <= n; size *= 2) {
      const half = size / 2, step = n / size;
      for (let i = 0; i < n; i += size) {
        for (let j = i, k = 0; j < i + half; j++, k += step) {
          const l = j + half;
          const tre = re[l] * cosT[k] + im[l] * sinT[k];
          const tim = im[l] * cosT[k] - re[l] * sinT[k];
          re[l] = re[j] - tre; im[l] = im[j] - tim;
          re[j] += tre; im[j] += tim;
        }
      }
    }
  };
}

export interface AnalysisResult {
  nFrames: number;
  energies: Record<string, Float32Array>;
  onsets: Record<string, Array<{ frame: number; strength: number }>>;
  env: Float32Array;
  vu: Float32Array;
  isHigh: Uint8Array;
  drops: number[];
  bpm: number;
}

export function analyzeAudio(
  samples: Float32Array,
  sampleRate: number,
  onProgress: (p: number) => void
): AnalysisResult {
  const hop = Math.round(sampleRate * FRAME_MS / 1000);
  const fftSize = 2048;
  const fft = makeFFT(fftSize);
  const nFrames = Math.max(1, Math.floor((samples.length - fftSize) / hop) + 1);
  const hann = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) hann[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (fftSize - 1));
  const binHz = sampleRate / fftSize;
  const bin = (hz: number) => Math.min(fftSize / 2 - 1, Math.max(0, Math.round(hz / binHz)));
  const BANDS: Record<string, [number, number][]> = {
    sub: [[20, 60]],
    kick: [[55, 130]],
    snare: [[160, 400], [1800, 4200]],
    vocal: [[300, 3000]],
    hats: [[6000, 15500]],
    full: [[20, 16000]],
  };
  const bandNames = Object.keys(BANDS);
  const energies: Record<string, Float32Array> = {};
  bandNames.forEach(b => energies[b] = new Float32Array(nFrames));
  const re = new Float32Array(fftSize), im = new Float32Array(fftSize);
  const mag = new Float32Array(fftSize / 2);
  const prevMag = new Float32Array(fftSize / 2);
  const flux: Record<string, Float32Array> = {};
  bandNames.forEach(b => flux[b] = new Float32Array(nFrames));
  for (let f = 0; f < nFrames; f++) {
    const off = f * hop;
    for (let i = 0; i < fftSize; i++) { re[i] = (samples[off + i] || 0) * hann[i]; im[i] = 0; }
    fft(re, im);
    for (let i = 0; i < fftSize / 2; i++) mag[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
    for (const b of bandNames) {
      let e = 0, fl = 0;
      for (const [lo, hi] of BANDS[b]) {
        const b0 = bin(lo), b1 = bin(hi);
        for (let i = b0; i <= b1; i++) { e += mag[i] * mag[i]; const d = mag[i] - prevMag[i]; if (d > 0) fl += d; }
      }
      energies[b][f] = Math.sqrt(e); flux[b][f] = fl;
    }
    prevMag.set(mag);
    if (onProgress && (f & 31) === 0) onProgress(f / nFrames);
  }
  function detectOnsets(fluxArr: Float32Array, minGapMs: number, sensitivity: number) {
    const onsets: Array<{ frame: number; strength: number }> = [];
    const w = Math.round(1000 / FRAME_MS);
    const minGap = Math.round(minGapMs / FRAME_MS);
    let last = -minGap;
    for (let f = 2; f < nFrames - 1; f++) {
      const a = Math.max(0, f - w), bnd = Math.min(nFrames, f + w / 4);
      let mean = 0, cnt = 0;
      for (let i = a; i < bnd; i++) { mean += fluxArr[i]; cnt++; }
      mean /= cnt;
      let sd = 0;
      for (let i = a; i < bnd; i++) { const d = fluxArr[i] - mean; sd += d * d; }
      sd = Math.sqrt(sd / cnt);
      const th = mean + sensitivity * sd;
      if (fluxArr[f] > th && fluxArr[f] >= fluxArr[f - 1] && fluxArr[f] > fluxArr[f + 1] && f - last >= minGap) {
        const strength = Math.min(1, (fluxArr[f] - mean) / (4 * sd + 1e-9));
        onsets.push({ frame: f, strength });
        last = f;
      }
    }
    return onsets;
  }
  const onsets = {
    sub: detectOnsets(flux.sub, 240, 1.2),
    kick: detectOnsets(flux.kick, 200, 1.1),
    snare: detectOnsets(flux.snare, 160, 1.2),
    vocal: detectOnsets(flux.vocal, 300, 1.5),
    hats: detectOnsets(flux.hats, 90, 1.0),
  };
  const env = new Float32Array(nFrames);
  const smoothW = Math.round(1500 / FRAME_MS);
  let maxE = 1e-9;
  for (let f = 0; f < nFrames; f++) {
    let s = 0, c = 0;
    for (let i = Math.max(0, f - smoothW); i <= Math.min(nFrames - 1, f + smoothW); i += 4) { s += energies.full[i]; c++; }
    env[f] = s / c;
    if (env[f] > maxE) maxE = env[f];
  }
  for (let f = 0; f < nFrames; f++) env[f] /= maxE;
  const vu = new Float32Array(nFrames);
  let vuMax = 1e-9;
  for (let f = 0; f < nFrames; f++) { vu[f] = energies.full[f]; if (vu[f] > vuMax) vuMax = vu[f]; }
  for (let f = 0; f < nFrames; f++) vu[f] = Math.min(1, vu[f] / (vuMax * 0.7));
  const sorted = Array.from(env).sort((a, b) => a - b);
  const p70 = sorted[Math.floor(sorted.length * 0.70)] || 0.5;
  const isHigh = new Uint8Array(nFrames);
  for (let f = 0; f < nFrames; f++) isHigh[f] = env[f] >= p70 ? 1 : 0;
  const drops: number[] = [];
  const lookBack = Math.round(2500 / FRAME_MS), lookFwd = Math.round(1500 / FRAME_MS);
  for (let f = lookBack; f < nFrames - lookFwd; f++) {
    if (!isHigh[f] || isHigh[f - 1]) continue;
    let lowCnt = 0, highCnt = 0;
    for (let i = f - lookBack; i < f; i++) if (!isHigh[i]) lowCnt++;
    for (let i = f; i < f + lookFwd; i++) if (isHigh[i]) highCnt++;
    if (lowCnt > lookBack * 0.7 && highCnt > lookFwd * 0.7) {
      if (!drops.length || f - drops[drops.length - 1] > Math.round(8000 / FRAME_MS)) drops.push(f);
    }
  }
  const onsetEnv = new Float32Array(nFrames);
  [...onsets.kick, ...onsets.sub].forEach(o => { onsetEnv[o.frame] += 0.5 + o.strength; });
  let bestBpm = 120, bestScore = -1;
  for (let bpm = 70; bpm <= 180; bpm++) {
    const lag = Math.round(60000 / bpm / FRAME_MS);
    let s = 0;
    for (let f = 0; f + lag < nFrames; f++) s += onsetEnv[f] * onsetEnv[f + lag];
    if (s > bestScore) { bestScore = s; bestBpm = bpm; }
  }
  return { nFrames, energies, onsets, env, vu, isHigh, drops, bpm: bestBpm };
}

// ============================================================
// SHOW BUILDER
// ============================================================
interface Grid {
  nFrames: number;
  data: Uint8Array;
  set(ch: number, frame: number, val: number): void;
  hold(ch: number, startFrame: number, durFrames: number, val: number): void;
  get(ch: number, frame: number): number;
}

function createGrid(nFrames: number): Grid {
  const data = new Uint8Array(nFrames * CHANNEL_COUNT);
  return {
    nFrames, data,
    set(ch, frame, val) { if (frame >= 0 && frame < nFrames) data[frame * CHANNEL_COUNT + (ch - 1)] = val; },
    hold(ch, startFrame, durFrames, val) {
      const end = Math.min(nFrames, startFrame + durFrames);
      for (let f = Math.max(0, startFrame); f < end; f++) data[f * CHANNEL_COUNT + (ch - 1)] = val;
    },
    get(ch, frame) { return data[frame * CHANNEL_COUNT + (ch - 1)]; },
  };
}

const ms2f = (ms: number) => Math.round(ms / FRAME_MS);

function makeClosures(grid: Grid) {
  const counts: Record<number, number> = {};
  return {
    command(ch: number, frame: number, val: number, holdMs = 300) {
      const limit = CLOSURE_LIMITS[ch];
      counts[ch] = counts[ch] || 0;
      if (limit !== undefined && val !== CL.IDLE && val !== CL.STOP) {
        if (counts[ch] >= limit) return false;
        counts[ch]++;
      }
      grid.hold(ch, frame, ms2f(holdMs), val);
      return true;
    },
    dance(ch: number, frame: number, durMs: number) {
      const limit = CLOSURE_LIMITS[ch];
      counts[ch] = counts[ch] || 0;
      if (limit !== undefined && counts[ch] >= limit) return false;
      counts[ch]++;
      grid.hold(ch, frame, ms2f(durMs), CL.DANCE);
      return true;
    },
    used(ch: number) { return counts[ch] || 0; },
  };
}

function rgbHold(grid: Grid, baseCh: number, startFrame: number, durFrames: number, r: number, g: number, b: number) {
  grid.hold(baseCh, startFrame, durFrames, r);
  grid.hold(baseCh + 1, startFrame, durFrames, g);
  grid.hold(baseCh + 2, startFrame, durFrames, b);
}

function hsv(h: number, s: number, v: number): [number, number, number] {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0]; else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x]; else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
  return [(r + m) * 255 | 0, (g + m) * 255 | 0, (b + m) * 255 | 0];
}

const ALL_RGB_ZONES = [CH.RGB_DISPLAY, CH.RGB_RR, CH.RGB_RF, CH.RGB_CF, CH.RGB_LF, CH.RGB_LR];

function scaleColor(c: [number, number, number], v: number): [number, number, number] {
  return [c[0] * v | 0, c[1] * v | 0, c[2] * v | 0];
}
function palColor(pal: [number, number, number][], i: number, v: number): [number, number, number] {
  return scaleColor(pal[((i % pal.length) + pal.length) % pal.length], v);
}

export interface ArtOptions {
  placement: 'drops' | 'even' | 'finale';
  mirrors: number;
  windows: number;
  chargeMode: 'none' | 'open' | 'show';
  trunkMode: 'none' | 'full' | 'half' | 'dance';
  trunkCount: number;
}

export interface ShowOptions {
  model: string;
  theme: [number, number, number][] | null;
  art: ArtOptions;
}

export function defaultArt(style: string): ArtOptions {
  return {
    placement: 'drops',
    mirrors: style === 'chaos' ? 8 : 4,
    windows: (style === 'bass' || style === 'chaos') ? 1 : 0,
    chargeMode: 'show',
    trunkMode: 'none',
    trunkCount: 0,
  };
}

function pickAnchors(
  n: number,
  placement: string,
  A: AnalysisResult,
  padStartMs: number,
  padEndMs: number,
  minGapMs: number
): number[] {
  if (n <= 0) return [];
  const N = A.nFrames;
  const startF = ms2f(padStartMs);
  const endF = Math.max(startF + 1, N - ms2f(padEndMs));
  const span = endF - startF;
  let pts: number[] = [];
  if (placement === 'drops') {
    const raw = [...A.drops];
    for (let f = 1; f < N; f++) if (A.isHigh[f] && !A.isHigh[f - 1]) raw.push(f);
    raw.sort((a, b) => a - b);
    for (const p of raw) {
      if (p < startF || p > endF) continue;
      if (!pts.length || p - pts[pts.length - 1] > ms2f(4000)) pts.push(p);
    }
    let k = 0;
    while (pts.length && pts.length < n && k < n) {
      const extra = pts[k % pts.length] + ms2f(3200) * (Math.floor(k / pts.length) + 1);
      if (extra < endF) pts.push(extra);
      k++;
    }
    pts.sort((a, b) => a - b);
    pts = pts.slice(0, n);
  }
  if (placement === 'finale') {
    const fs = Math.max(startF, Math.floor(N * 0.62));
    const sp = Math.max(1, endF - fs);
    for (let i = 0; i < n; i++) pts.push(fs + Math.floor(sp * (i + 0.5) / n));
  }
  if (!pts.length) {
    for (let i = 0; i < n; i++) pts.push(startF + Math.floor(span * (i + 1) / (n + 1)));
  }
  const gap = ms2f(minGapMs);
  const out: number[] = [];
  for (const p of pts) {
    const shifted = out.length ? Math.max(p, out[out.length - 1] + gap) : p;
    if (shifted <= endF) out.push(shifted);
  }
  return out;
}

function choreographClosures(grid: Grid, A: AnalysisResult, opts: ShowOptions, style: string) {
  const model = opts.model || 'model3';
  const art = opts.art || defaultArt(style);
  const c = makeClosures(grid);
  const N = A.nFrames;
  const showMs = N * FRAME_MS;
  const endF = N - 1;
  const flicks = Math.min(10, Math.max(0, art.mirrors | 0));
  for (const a of pickAnchors(flicks, art.placement, A, 2000, 5500, 5200)) {
    c.command(CH.L_MIRROR, a, CL.OPEN, 400);
    c.command(CH.R_MIRROR, a, CL.OPEN, 400);
    c.command(CH.L_MIRROR, a + ms2f(2400), CL.CLOSE, 400);
    c.command(CH.R_MIRROR, a + ms2f(2400), CL.CLOSE, 400);
  }
  const bounces = Math.min(2, Math.max(0, art.windows | 0));
  if (bounces > 0) {
    const winCh = [CH.LF_WINDOW, CH.RF_WINDOW, CH.LR_WINDOW, CH.RR_WINDOW];
    winCh.forEach(w => c.command(w, ms2f(1500), CL.OPEN, 500));
    for (const a of pickAnchors(bounces, art.placement, A, 8000, 8000, 9000)) {
      winCh.forEach(w => c.command(w, a, CL.CLOSE, 400));
      winCh.forEach(w => grid.hold(w, a + ms2f(1600), ms2f(300), CL.STOP));
      winCh.forEach(w => c.command(w, a + ms2f(2600), CL.OPEN, 500));
    }
  }
  if (art.chargeMode !== 'none') {
    const openAt = A.drops.length ? A.drops[0] : Math.round(N * 0.25);
    c.command(CH.CHARGE_PORT, openAt, CL.OPEN, 400);
    if (art.chargeMode === 'show') {
      let lastChorus = -1;
      for (let f = N - 1; f > 0; f--) { if (A.isHigh[f] && !A.isHigh[f - 1]) { lastChorus = f; break; } }
      const danceStart = (lastChorus > openAt + ms2f(3000)) ? lastChorus : openAt + ms2f(3000);
      const danceMs = Math.min(20000, (endF - ms2f(2500) - danceStart) * FRAME_MS);
      if (danceMs > 2000) c.dance(CH.CHARGE_PORT, danceStart, danceMs);
      if (showMs < 110000) c.command(CH.CHARGE_PORT, endF - ms2f(1800), CL.CLOSE, 400);
    }
  }
  if (art.trunkMode && art.trunkMode !== 'none') {
    const OPEN_MS = 14000, CLOSE_MS = 4000;
    const slotMs = art.trunkMode === 'full' ? OPEN_MS + 2500 + CLOSE_MS
      : art.trunkMode === 'half' ? 3500 + 3000 + CLOSE_MS
        : OPEN_MS + 1000 + 10000 + CLOSE_MS;
    const cmdsPerSet = art.trunkMode === 'dance' ? 3 : 2;
    const cmdMax = Math.floor(CLOSURE_LIMITS[CH.LIFTGATE] / cmdsPerSet);
    const fitMax = Math.max(0, Math.floor((showMs - 10000) / (slotMs + 3000)));
    const sets = Math.min(Math.max(1, art.trunkCount | 0), cmdMax, fitMax);
    const anchorsT = pickAnchors(sets, art.placement, A, 2500, slotMs + 2000, slotMs + 3000);
    for (const a of anchorsT) {
      if (art.trunkMode === 'full') {
        c.command(CH.LIFTGATE, a, CL.OPEN, 500);
        c.command(CH.LIFTGATE, a + ms2f(OPEN_MS + 2500), CL.CLOSE, 500);
      } else if (art.trunkMode === 'half') {
        c.command(CH.LIFTGATE, a, CL.OPEN, 500);
        grid.hold(CH.LIFTGATE, a + ms2f(3500), ms2f(300), CL.STOP);
        c.command(CH.LIFTGATE, a + ms2f(6500), CL.CLOSE, 500);
      } else {
        c.command(CH.LIFTGATE, a, CL.OPEN, 500);
        c.dance(CH.LIFTGATE, a + ms2f(OPEN_MS + 1000), 10000);
        c.command(CH.LIFTGATE, a + ms2f(OPEN_MS + 1000 + 10000 + 500), CL.CLOSE, 500);
      }
    }
  }
  if (model === 'models' && style !== 'elegant') {
    let used = 0;
    for (const o of A.onsets.snare) {
      if (used >= 8) break;
      if (!A.isHigh[o.frame] || o.strength < 0.7) continue;
      [CH.LF_HANDLE, CH.RF_HANDLE, CH.LR_HANDLE, CH.RR_HANDLE].forEach(h => c.command(h, o.frame, CL.OPEN, 300));
      [CH.LF_HANDLE, CH.RF_HANDLE, CH.LR_HANDLE, CH.RR_HANDLE].forEach(h => c.command(h, o.frame + ms2f(1200), CL.CLOSE, 300));
      used += 2;
    }
  }
  if (model === 'modelx' && showMs > 90000 && style !== 'elegant') {
    let lastChorus = -1;
    for (let f = N - 1; f > 0; f--) { if (A.isHigh[f] && !A.isHigh[f - 1]) { lastChorus = f; break; } }
    if (lastChorus > 0 && lastChorus * FRAME_MS + 21000 < showMs) {
      c.command(CH.L_FALCON, lastChorus, CL.OPEN, 600);
      c.command(CH.R_FALCON, lastChorus, CL.OPEN, 600);
      c.command(CH.L_FALCON, endF - ms2f(9000), CL.CLOSE, 600);
      c.command(CH.R_FALCON, endF - ms2f(9000), CL.CLOSE, 600);
    }
  }
  return c;
}

// ============================================================
// RENDITION BUILDERS
// ============================================================
function blink(grid: Grid, ch: number, frame: number, onMs: number, val = V.ON) {
  grid.hold(ch, frame, Math.max(1, ms2f(onMs)), val);
}
function blinkLR(grid: Grid, chL: number, chR: number, frame: number, onMs: number, side: number, val = V.ON) {
  if (side !== 2) blink(grid, chL, frame, onMs, val);
  if (side !== 1) blink(grid, chR, frame, onMs, val);
}

function buildClassic(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  let flip = 0;
  for (const o of A.onsets.kick) {
    flip ^= 1;
    blinkLR(g, CH.L_SIGNATURE, CH.R_SIGNATURE, o.frame, 140, flip ? 1 : 2);
    if (o.strength > 0.5) blinkLR(g, CH.L_INNER_BEAM, CH.R_INNER_BEAM, o.frame, 120, flip ? 2 : 1);
  }
  for (const o of A.onsets.sub) {
    blinkLR(g, CH.L_OUTER_BEAM, CH.R_OUTER_BEAM, o.frame, 200, 0);
    blink(g, CH.BRAKE, o.frame, 200);
  }
  let sflip = 0;
  for (const o of A.onsets.snare) {
    sflip ^= 1;
    blinkLR(g, CH.L_FRONT_TURN, CH.R_FRONT_TURN, o.frame, 120, sflip ? 1 : 2);
    blinkLR(g, CH.L_REAR_TURN, CH.R_REAR_TURN, o.frame, 120, sflip ? 2 : 1);
  }
  let hflip = 0;
  for (const o of A.onsets.hats) {
    hflip ^= 1;
    blinkLR(g, CH.L_SIDE_MARKER, CH.R_SIDE_MARKER, o.frame, 60, hflip ? 1 : 2);
    blinkLR(g, CH.L_REPEATER, CH.R_REPEATER, o.frame, 60, hflip ? 2 : 1);
  }
  for (const o of A.onsets.vocal) {
    const durF = ms2f(700);
    g.hold(CH.L_CH4, o.frame, durF, V.ON_500); g.hold(CH.R_CH4, o.frame, durF, V.ON_500);
    g.hold(CH.L_CH5, o.frame + ms2f(120), durF, V.ON); g.hold(CH.R_CH5, o.frame + ms2f(120), durF, V.ON);
    g.hold(CH.L_CH6, o.frame + ms2f(240), durF, V.ON); g.hold(CH.R_CH6, o.frame + ms2f(240), durF, V.ON);
    g.hold(CH.L_CH4, o.frame + durF, ms2f(400), V.OFF_500); g.hold(CH.R_CH4, o.frame + durF, ms2f(400), V.OFF_500);
  }
  for (const o of A.onsets.kick) { if (!A.isHigh[o.frame]) continue; blinkLR(g, CH.L_TAIL, CH.R_TAIL, o.frame, 150, 0); }
  for (const o of A.onsets.snare) {
    if (!A.isHigh[o.frame]) continue;
    blinkLR(g, CH.L_FOG, CH.R_FOG, o.frame, 100, 0);
    blink(g, CH.LICENSE, o.frame, 100);
  }
  for (let f = 0, ci = 0; f < A.nFrames; f += ms2f(400), ci++) {
    const bright = A.isHigh[f] ? 1 : 0.35;
    ALL_RGB_ZONES.forEach((z, zi) => {
      const col = pal ? palColor(pal, ci + zi, bright) : hsv((f * FRAME_MS * 0.01) % 360, 0.9, bright);
      rgbHold(g, z, f, ms2f(400), col[0], col[1], col[2]);
    });
  }
  for (const o of A.onsets.kick) for (let i = 0; i < CH.FRONT_BAR_LEN; i++) blink(g, CH.FRONT_BAR_START + i, o.frame, 120);
  for (const o of A.onsets.snare) for (let i = 0; i < CH.REAR_BAR_LEN; i++) blink(g, CH.REAR_BAR_START + i, o.frame, 100);
  choreographClosures(g, A, opts, 'classic');
  return g;
}

function buildBass(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  for (const o of A.onsets.kick) {
    const dur = 100 + o.strength * 150;
    blinkLR(g, CH.L_OUTER_BEAM, CH.R_OUTER_BEAM, o.frame, dur, 0);
    blinkLR(g, CH.L_INNER_BEAM, CH.R_INNER_BEAM, o.frame, dur, 0);
    blinkLR(g, CH.L_SIGNATURE, CH.R_SIGNATURE, o.frame, dur, 0);
    blink(g, CH.BRAKE, o.frame, dur); blinkLR(g, CH.L_TAIL, CH.R_TAIL, o.frame, dur, 0);
    for (let i = 0; i < CH.FRONT_BAR_LEN; i++) blink(g, CH.FRONT_BAR_START + i, o.frame, dur);
  }
  for (const o of A.onsets.sub) {
    blink(g, CH.REVERSE, o.frame, 250); blinkLR(g, CH.L_FOG, CH.R_FOG, o.frame, 250, 0);
    for (let i = 0; i < CH.REAR_BAR_LEN; i++) blink(g, CH.REAR_BAR_START + i, o.frame, 220);
  }
  let sflip = 0;
  for (const o of A.onsets.snare) {
    sflip ^= 1;
    blinkLR(g, CH.L_FRONT_TURN, CH.R_FRONT_TURN, o.frame, 90, sflip ? 1 : 2);
    blinkLR(g, CH.L_REAR_TURN, CH.R_REAR_TURN, o.frame, 90, sflip ? 2 : 1);
  }
  for (let f = 0; f < A.nFrames; f += ms2f(200)) {
    const level = A.vu[f];
    const col = pal ? palColor(pal, Math.floor(f * FRAME_MS / 2000), 0.3 + 0.7 * level) : [(80 + 175 * level) | 0, 0, 20] as [number, number, number];
    for (const z of ALL_RGB_ZONES) rgbHold(g, z, f, ms2f(200), col[0], col[1], col[2]);
  }
  choreographClosures(g, A, opts, 'bass');
  return g;
}

function buildElegant(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  let flip = 0;
  for (const o of A.onsets.vocal) {
    flip ^= 1;
    const L = flip ? CH.L_OUTER_BEAM : CH.L_INNER_BEAM;
    const R = flip ? CH.R_INNER_BEAM : CH.R_OUTER_BEAM;
    g.hold(L, o.frame, ms2f(1100), V.ON_1000); g.hold(R, o.frame, ms2f(1100), V.ON_1000);
    g.hold(L, o.frame + ms2f(1100), ms2f(1100), V.OFF_1000); g.hold(R, o.frame + ms2f(1100), ms2f(1100), V.OFF_1000);
  }
  for (const o of A.onsets.kick) {
    if (o.strength < 0.4) continue;
    g.hold(CH.L_SIGNATURE, o.frame, ms2f(550), V.ON_500); g.hold(CH.R_SIGNATURE, o.frame, ms2f(550), V.ON_500);
    g.hold(CH.L_SIGNATURE, o.frame + ms2f(550), ms2f(550), V.OFF_500); g.hold(CH.R_SIGNATURE, o.frame + ms2f(550), ms2f(550), V.OFF_500);
  }
  for (const o of A.onsets.snare) {
    if (!A.isHigh[o.frame]) continue;
    g.hold(CH.L_CH4, o.frame, ms2f(600), V.ON_500); g.hold(CH.R_CH4, o.frame, ms2f(600), V.ON_500);
    g.hold(CH.L_CH5, o.frame + ms2f(150), ms2f(450), V.ON); g.hold(CH.R_CH5, o.frame + ms2f(150), ms2f(450), V.ON);
    g.hold(CH.L_CH6, o.frame + ms2f(300), ms2f(300), V.ON); g.hold(CH.R_CH6, o.frame + ms2f(300), ms2f(300), V.ON);
    g.hold(CH.L_CH4, o.frame + ms2f(600), ms2f(500), V.OFF_500); g.hold(CH.R_CH4, o.frame + ms2f(600), ms2f(500), V.OFF_500);
  }
  for (let f = 0; f < A.nFrames; f++) { if (A.isHigh[f]) { g.set(CH.L_TAIL, f, V.ON); g.set(CH.R_TAIL, f, V.ON); } }
  let h = 0;
  for (const o of A.onsets.hats) { if (++h % 3) continue; blinkLR(g, CH.L_AUX_PARK, CH.R_AUX_PARK, o.frame, 120, 0); }
  for (let f = 0; f < A.nFrames; f += ms2f(500)) {
    const t = A.env[f];
    const col = pal ? palColor(pal, Math.floor(f * FRAME_MS / 3000), 0.25 + 0.75 * t) : hsv(35 + t * 175, 0.75, 0.25 + 0.75 * t);
    for (const z of ALL_RGB_ZONES) rgbHold(g, z, f, ms2f(500), col[0], col[1], col[2]);
  }
  const half = CH.FRONT_BAR_LEN / 2;
  if (opts.model !== 'juniper') {
    for (let f = 0; f < A.nFrames; f += 2) {
      const lit = Math.round(A.env[f] * half);
      for (let i = 0; i < lit; i++) {
        g.set(CH.FRONT_BAR_START + half - 1 - i, f, 255); g.set(CH.FRONT_BAR_START + half + i, f, 255);
        g.set(CH.FRONT_BAR_START + half - 1 - i, f + 1, 255); g.set(CH.FRONT_BAR_START + half + i, f + 1, 255);
      }
    }
  } else {
    for (const o of A.onsets.vocal) {
      const lit = Math.max(4, Math.round(A.env[o.frame] * half));
      for (let i = 0; i < lit; i++) {
        g.hold(CH.FRONT_BAR_START + half - 1 - i, o.frame, ms2f(180), 255);
        g.hold(CH.FRONT_BAR_START + half + i, o.frame, ms2f(180), 255);
      }
    }
  }
  choreographClosures(g, A, opts, 'elegant');
  return g;
}

function buildChaos(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  let beat = 0;
  for (const o of A.onsets.kick) {
    beat++;
    const side = beat % 2 ? 1 : 2;
    blinkLR(g, CH.L_OUTER_BEAM, CH.R_OUTER_BEAM, o.frame, 110, side);
    blinkLR(g, CH.L_INNER_BEAM, CH.R_INNER_BEAM, o.frame, 110, side === 1 ? 2 : 1);
    blinkLR(g, CH.L_SIGNATURE, CH.R_SIGNATURE, o.frame, 110, side);
    blink(g, CH.BRAKE, o.frame, 110);
    if (beat % 4 === 0) blink(g, CH.LICENSE, o.frame, 110);
  }
  let s = 0;
  for (const o of A.onsets.snare) {
    s++;
    const side = s % 2 ? 2 : 1;
    blinkLR(g, CH.L_FRONT_TURN, CH.R_FRONT_TURN, o.frame, 90, side);
    blinkLR(g, CH.L_REAR_TURN, CH.R_REAR_TURN, o.frame, 90, side === 1 ? 2 : 1);
    blinkLR(g, CH.L_FOG, CH.R_FOG, o.frame, 90, side);
    blinkLR(g, CH.L_TAIL, CH.R_TAIL, o.frame, 90, side === 1 ? 2 : 1);
  }
  let hh = 0;
  for (const o of A.onsets.hats) {
    hh++;
    const side = hh % 2 ? 1 : 2;
    blinkLR(g, CH.L_SIDE_MARKER, CH.R_SIDE_MARKER, o.frame, 50, side);
    blinkLR(g, CH.L_REPEATER, CH.R_REPEATER, o.frame, 50, side === 1 ? 2 : 1);
    blinkLR(g, CH.L_AUX_PARK, CH.R_AUX_PARK, o.frame, 50, side);
  }
  for (const o of A.onsets.sub) {
    blink(g, CH.REVERSE, o.frame, 180); blink(g, CH.REAR_FOG, o.frame, 180);
    g.hold(CH.L_CH4, o.frame, ms2f(300), V.ON); g.hold(CH.R_CH4, o.frame, ms2f(300), V.ON);
    g.hold(CH.L_CH5, o.frame, ms2f(300), V.ON); g.hold(CH.R_CH5, o.frame, ms2f(300), V.ON);
    g.hold(CH.L_CH6, o.frame, ms2f(300), V.ON); g.hold(CH.R_CH6, o.frame, ms2f(300), V.ON);
  }
  let hue = 0, ki = 0;
  for (const o of A.onsets.kick) {
    hue = (hue + 47) % 360; ki++;
    const bright = A.isHigh[o.frame] ? 1 : 0.5;
    ALL_RGB_ZONES.forEach((z, zi) => {
      const col = pal ? palColor(pal, ki + zi, bright) : hsv(hue, 1, bright);
      rgbHold(g, z, o.frame, ms2f(180), col[0], col[1], col[2]);
    });
  }
  let lb = 0;
  for (const o of A.onsets.kick) {
    lb ^= 1;
    const start = lb ? 0 : CH.FRONT_BAR_LEN / 2;
    for (let i = start; i < start + CH.FRONT_BAR_LEN / 2; i++) blink(g, CH.FRONT_BAR_START + i, o.frame, 110);
    for (let i = 0; i < CH.REAR_BAR_LEN; i += 2) blink(g, CH.REAR_BAR_START + i + (lb ? 0 : 1), o.frame, 110);
  }
  let seed = 12345;
  const rand = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (const o of A.onsets.hats) {
    for (let k = 0; k < 6; k++) blink(g, CH.FRONT_BAR_START + (rand() * CH.FRONT_BAR_LEN | 0), o.frame, 60);
  }
  choreographClosures(g, A, opts, 'chaos');
  return g;
}

function buildLightbar(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  const half = CH.FRONT_BAR_LEN / 2;
  const beatF = Math.max(4, Math.round(60000 / A.bpm / FRAME_MS));
  for (let f = 0; f < A.nFrames; f++) {
    const lit = Math.round(Math.pow(A.vu[f], 0.8) * half);
    for (let i = 0; i < lit; i++) {
      g.set(CH.FRONT_BAR_START + half - 1 - i, f, 255);
      g.set(CH.FRONT_BAR_START + half + i, f, 255);
    }
  }
  for (let f = 0; f < A.nFrames; f++) {
    const pos = Math.floor((f % beatF) / beatF * CH.REAR_BAR_LEN);
    const width = A.isHigh[f] ? 8 : 4;
    for (let w = 0; w < width; w++) { const i = (pos + w) % CH.REAR_BAR_LEN; g.set(CH.REAR_BAR_START + i, f, 255); }
  }
  let flip = 0;
  for (const o of A.onsets.kick) {
    flip ^= 1;
    blinkLR(g, CH.L_OUTER_BEAM, CH.R_OUTER_BEAM, o.frame, 130, 0);
    blinkLR(g, CH.L_SIGNATURE, CH.R_SIGNATURE, o.frame, 130, flip ? 1 : 2);
    blink(g, CH.BRAKE, o.frame, 130);
  }
  let sflip = 0;
  for (const o of A.onsets.snare) {
    sflip ^= 1;
    blinkLR(g, CH.L_FRONT_TURN, CH.R_FRONT_TURN, o.frame, 100, sflip ? 1 : 2);
    blinkLR(g, CH.L_REAR_TURN, CH.R_REAR_TURN, o.frame, 100, sflip ? 2 : 1);
    blinkLR(g, CH.L_TAIL, CH.R_TAIL, o.frame, 100, 0);
  }
  let hflip = 0;
  for (const o of A.onsets.hats) {
    hflip ^= 1;
    blinkLR(g, CH.L_SIDE_MARKER, CH.R_SIDE_MARKER, o.frame, 60, hflip ? 1 : 2);
    blinkLR(g, CH.L_REPEATER, CH.R_REPEATER, o.frame, 60, hflip ? 2 : 1);
  }
  for (const d of A.drops) for (let i = 0; i < CH.OFFROAD_LEN; i++) g.hold(CH.OFFROAD_START + i, d, ms2f(2000), 255);
  for (const o of A.onsets.sub) blink(g, CH.REVERSE, o.frame, 300);
  for (let f = 0; f < A.nFrames; f += ms2f(300)) {
    const col = pal ? palColor(pal, Math.floor(f * FRAME_MS / 1500), 0.3 + 0.7 * A.vu[f]) : hsv(190 + A.vu[f] * 90, 1, 0.3 + 0.7 * A.vu[f]);
    for (const z of ALL_RGB_ZONES) rgbHold(g, z, f, ms2f(300), col[0], col[1], col[2]);
  }
  choreographClosures(g, A, opts, 'lightbar');
  return g;
}

function buildWave(A: AnalysisResult, opts: ShowOptions): Grid {
  const pal = opts.theme || null;
  const g = createGrid(A.nFrames);
  const STEP = ms2f(120);
  let dir = 0;
  for (const o of A.onsets.kick) {
    dir ^= 1;
    const zones: [number[], number][] = [
      [[CH.L_OUTER_BEAM, CH.R_OUTER_BEAM, CH.L_INNER_BEAM, CH.R_INNER_BEAM, CH.L_SIGNATURE, CH.R_SIGNATURE], 160],
      [[CH.L_SIDE_MARKER, CH.R_SIDE_MARKER, CH.L_REPEATER, CH.R_REPEATER], 140],
      [[CH.L_TAIL, CH.R_TAIL, CH.BRAKE, CH.L_REAR_TURN, CH.R_REAR_TURN], 160],
    ];
    if (dir) zones.reverse();
    zones.forEach((z, zi) => z[0].forEach(ch => blink(g, ch, o.frame + zi * STEP, z[1])));
    const barAt = dir ? o.frame + 2 * STEP : o.frame;
    for (let i = 0; i < CH.FRONT_BAR_LEN; i++) blink(g, CH.FRONT_BAR_START + i, barAt, 140);
  }
  let sdir = 0;
  for (const o of A.onsets.snare) {
    sdir ^= 1;
    const seq = sdir
      ? [CH.L_OUTER_BEAM, CH.L_FRONT_TURN, CH.R_FRONT_TURN, CH.R_OUTER_BEAM]
      : [CH.R_OUTER_BEAM, CH.R_FRONT_TURN, CH.L_FRONT_TURN, CH.L_OUTER_BEAM];
    seq.forEach((ch, i) => blink(g, ch, o.frame + i * ms2f(60), 110));
    const start = sdir ? 0 : CH.REAR_BAR_LEN / 2;
    for (let i = start; i < start + CH.REAR_BAR_LEN / 2; i++) blink(g, CH.REAR_BAR_START + i, o.frame + ms2f(120), 120);
  }
  let hflip = 0;
  for (const o of A.onsets.hats) { hflip ^= 1; blinkLR(g, CH.L_AUX_PARK, CH.R_AUX_PARK, o.frame, 60, hflip ? 1 : 2); }
  for (const o of A.onsets.sub) { blinkLR(g, CH.L_FOG, CH.R_FOG, o.frame, 220, 0); blink(g, CH.LICENSE, o.frame, 220); }
  for (const o of A.onsets.vocal) {
    g.hold(CH.L_CH4, o.frame, ms2f(500), V.ON_500); g.hold(CH.R_CH4, o.frame, ms2f(500), V.ON_500);
    g.hold(CH.L_CH5, o.frame + ms2f(100), ms2f(400), V.ON); g.hold(CH.R_CH5, o.frame + ms2f(100), ms2f(400), V.ON);
    g.hold(CH.L_CH6, o.frame + ms2f(200), ms2f(300), V.ON); g.hold(CH.R_CH6, o.frame + ms2f(200), ms2f(300), V.ON);
    g.hold(CH.L_CH4, o.frame + ms2f(500), ms2f(400), V.OFF_500); g.hold(CH.R_CH4, o.frame + ms2f(500), ms2f(400), V.OFF_500);
  }
  const frontZones = [CH.RGB_LF, CH.RGB_CF, CH.RGB_RF, CH.RGB_DISPLAY];
  const rearZones = [CH.RGB_LR, CH.RGB_RR];
  let wi = 0;
  for (const o of A.onsets.kick) {
    wi++;
    const bright = A.isHigh[o.frame] ? 1 : 0.5;
    const cF = pal ? palColor(pal, wi, bright) : hsv((wi * 43) % 360, 1, bright);
    const cR = pal ? palColor(pal, wi + 1, bright) : hsv((wi * 43 + 120) % 360, 1, bright);
    frontZones.forEach(z => rgbHold(g, z, o.frame, ms2f(200), cF[0], cF[1], cF[2]));
    rearZones.forEach(z => rgbHold(g, z, o.frame + STEP, ms2f(200), cR[0], cR[1], cR[2]));
  }
  choreographClosures(g, A, opts, 'wave');
  return g;
}

export interface Rendition {
  id: string;
  name: string;
  desc: string;
  build: (A: AnalysisResult, opts: ShowOptions) => Grid;
}

export const RENDITIONS: Rendition[] = [
  { id: 'classic', name: 'Balanced Classic', desc: 'Every element of the song mapped across all lights. The safest all-model show.', build: buildClassic },
  { id: 'bass', name: 'Bass Cannon', desc: 'Kick and sub-bass slam every major light at once. Windows drop at the first big drop.', build: buildBass },
  { id: 'elegant', name: 'Elegant Flow', desc: 'Smooth ramping fades and sweeps, no strobing. Great for slower or cinematic songs.', build: buildElegant },
  { id: 'chaos', name: 'Full Chaos', desc: 'Maximum activity: every band strobes its own light group with left/right ping-pong.', build: buildChaos },
  { id: 'lightbar', name: 'Light Bar Special', desc: 'Front bar becomes a live VU meter, rear bar chases the tempo. Best on Cybertruck.', build: buildLightbar },
  { id: 'wave', name: 'Wave Rider', desc: 'Beat-synced waves of light roll front-to-back and side-to-side across the whole car.', build: buildWave },
];

export function renditionsFor(model: string): Rendition[] {
  return RENDITIONS.filter(r => model === 'cybertruck' ? r.id !== 'wave' : r.id !== 'lightbar');
}

// ============================================================
// FSEQ v2.0 WRITER
// ============================================================
export function writeFseq(grid: Grid, mediaName: string): Uint8Array {
  const nFrames = grid.nFrames;
  function varHeader(code: string, str: string): number[] {
    const b: number[] = [];
    const strBytes: number[] = [];
    for (let i = 0; i < str.length; i++) strBytes.push(str.charCodeAt(i) & 0xff);
    strBytes.push(0);
    const len = 4 + strBytes.length;
    b.push(len & 0xff, (len >> 8) & 0xff, code.charCodeAt(0), code.charCodeAt(1), ...strBytes);
    return b;
  }
  const vh = [...varHeader('mf', mediaName), ...varHeader('sp', 'LightForge for Tesla')];
  let dataOffset = 32 + vh.length;
  const pad = (4 - (dataOffset % 4)) % 4;
  dataOffset += pad;
  const out = new Uint8Array(dataOffset + nFrames * CHANNEL_COUNT);
  const dv = new DataView(out.buffer);
  out[0] = 0x50; out[1] = 0x53; out[2] = 0x45; out[3] = 0x51;
  dv.setUint16(4, dataOffset, true);
  out[6] = 0; out[7] = 2;
  dv.setUint16(8, 32, true);
  dv.setUint32(10, CHANNEL_COUNT, true);
  dv.setUint32(14, nFrames, true);
  out[18] = FRAME_MS; out[19] = 0; out[20] = 0; out[21] = 0; out[22] = 0; out[23] = 0;
  const ts = BigInt(Date.now()) * 1000n;
  dv.setBigUint64(24, ts, true);
  out.set(vh, 32);
  out.set(grid.data, dataOffset);
  return out;
}

// ============================================================
// Minimal ZIP writer (STORE method, no compression)
// ============================================================
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

export function makeZip(files: Array<{ name: string; data: Uint8Array }>): Uint8Array {
  const chunks: Uint8Array[] = [], central: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const nameBytes = new TextEncoder().encode(f.name);
    const crc = crc32(f.data);
    const local = new Uint8Array(30 + nameBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true);
    dv.setUint32(14, crc, true); dv.setUint32(18, f.data.length, true); dv.setUint32(22, f.data.length, true);
    dv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    chunks.push(local, f.data);
    const cd = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(cd.buffer);
    cdv.setUint32(0, 0x02014b50, true); cdv.setUint16(4, 20, true); cdv.setUint16(6, 20, true);
    cdv.setUint32(16, crc, true); cdv.setUint32(20, f.data.length, true); cdv.setUint32(24, f.data.length, true);
    cdv.setUint16(28, nameBytes.length, true); cdv.setUint32(42, offset, true);
    cd.set(nameBytes, 46);
    central.push(cd);
    offset += local.length + f.data.length;
  }
  const cdStart = offset;
  let cdSize = 0;
  for (const c of central) { chunks.push(c); cdSize += c.length; }
  const end = new Uint8Array(22);
  const edv = new DataView(end.buffer);
  edv.setUint32(0, 0x06054b50, true);
  edv.setUint16(8, files.length, true); edv.setUint16(10, files.length, true);
  edv.setUint32(12, cdSize, true); edv.setUint32(16, cdStart, true);
  chunks.push(end);
  let total = 0;
  for (const c of chunks) total += c.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const c of chunks) { out.set(c, p); p += c.length; }
  return out;
}
