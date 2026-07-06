import { useState, useRef, useCallback } from 'react';
import { Upload, Zap, Download, Music, AlertTriangle, CheckCircle2, Cpu, Lock, Scissors, ArrowRight, Play } from 'lucide-react';
import {
  analyzeAudio,
  renditionsFor,
  writeFseq,
  makeZip,
  type ArtOptions,
  type AnalysisResult,
  type Rendition,
} from '../engine';
import { SNIPPET_SECONDS } from '../config';
import { useAuth } from '../contexts/AuthContext';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

function uint8ToBase64(bytes: Uint8Array): string {
  const chars = new Array<string>(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    chars[i] = String.fromCharCode(bytes[i]);
  }
  return btoa(chars.join(''));
}

// ---- Types ----
type ModelId = 'model3' | 'highland' | 'modely' | 'juniper' | 'models' | 'modelx' | 'cybertruck';
type ThemeId = 'dynamic' | 'usa' | 'stpat' | 'valentine' | 'halloween' | 'christmas' | 'custom';
type Placement = 'drops' | 'even' | 'finale';
type TrunkMode = 'none' | 'full' | 'half' | 'dance';
type ChargeMode = 'none' | 'open' | 'show';

const MODEL_KEY: Record<ModelId, string> = {
  model3: 'model3', highland: 'model3', modely: 'model3',
  juniper: 'juniper', models: 'models', modelx: 'modelx', cybertruck: 'cybertruck',
};
const MODEL_NAMES: Record<ModelId, string> = {
  model3: 'Model 3', highland: 'Model 3 Highland', modely: 'Model Y',
  juniper: 'Model Y Juniper', models: 'Model S', modelx: 'Model X', cybertruck: 'Cybertruck',
};

const THEMES: Record<ThemeId, [number, number, number][] | null> = {
  dynamic: null,
  usa: [[255, 32, 32], [255, 255, 255], [40, 80, 255]],
  stpat: [[0, 205, 70], [255, 255, 255]],
  valentine: [[255, 20, 60], [255, 105, 180]],
  halloween: [[150, 0, 220], [255, 110, 0]],
  christmas: [[220, 0, 35], [0, 190, 70]],
  custom: null,
};

const THEME_NOTES: Record<ThemeId, string> = {
  dynamic: 'Each rendition picks its own colors to match its style — rainbow drifts, red bass pumps, amber-to-ice fades.',
  usa: 'Red, white, and blue cycling across the screen and interior accent zones.',
  stpat: 'Green and white — perfect for March 17th.',
  valentine: 'Red and pink for date night.',
  halloween: 'Purple and orange, spooky season approved.',
  christmas: 'Classic red and green holiday rotation.',
  custom: 'Pick your own 3 colors below — they rotate across the interior zones and screen.',
};

const PLACE_HELP: Record<Placement, string> = {
  drops: 'Lights hit hardest at detected drops and chorus.',
  even: 'Movements are spaced out at equal intervals across the whole song.',
  finale: 'Movements cluster in the last third of the song for a big ending.',
};

// ---- Step Badge ----
function StepBadge({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-full bg-electric-blue flex items-center justify-center shrink-0">
      <span className="text-white text-xs font-bold">{n}</span>
    </div>
  );
}

// ---- Light bar ----
const LB_N = 60;
function LightBar({ progress, phase }: { progress: number; phase: 'idle' | 'analyzing' | 'done' }) {
  const half = LB_N / 2;
  return (
    <div className="flex items-center gap-[2px] h-6" aria-hidden="true">
      {Array.from({ length: LB_N }, (_, i) => {
        let lit = false;
        if (phase === 'analyzing') {
          const distFromCenter = Math.abs(i - (LB_N / 2 - 0.5));
          lit = distFromCenter >= half - Math.round(progress * half);
        } else if (phase === 'done') {
          lit = true;
        }
        return (
          <span
            key={i}
            className={`flex-1 h-full rounded-sm transition-all duration-75 ${
              phase === 'idle'
                ? 'lightbar-idle'
                : lit
                  ? phase === 'analyzing' ? 'bg-electric-blue shadow-[0_0_6px_#2D8CFF]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-steel'
            }`}
            style={phase === 'idle' ? { '--lb-i': i } as React.CSSProperties : undefined}
          />
        );
      })}
    </div>
  );
}

function Chip({ on, onClick, children, small }: { on: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border font-medium transition-all duration-150 cursor-pointer select-none
        ${small ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'}
        ${on
          ? 'bg-electric-blue/15 border-electric-blue text-white shadow-[0_0_12px_rgba(45,140,255,0.25)]'
          : 'bg-charcoal border-border text-text-secondary hover:border-electric-blue/50 hover:text-text-primary'
        }`}
    >
      {children}
    </button>
  );
}

interface RenditionOutput {
  r: Rendition;
  fseq: Uint8Array;        // full-length
  snippetFseq: Uint8Array; // 20-second snippet
}

interface ResultCardProps {
  output: RenditionOutput;
  audioFile: File;
  audioBytes: Uint8Array;
  snippetUsed: boolean;
  credits: number;
  onDownloadFree: (output: RenditionOutput) => void;
  onDownloadPaid: (output: RenditionOutput) => void;
  onBuyCredits: () => void;
  downloadingId: string | null;
}

function ResultCard({ output, audioFile, audioBytes, snippetUsed, credits, onDownloadFree, onDownloadPaid, onBuyCredits, downloadingId }: ResultCardProps) {
  const { r } = output;
  const isBusy = downloadingId === r.id;

  const downloadLocal = (bytes: Uint8Array, suffix: string) => {
    const slug = audioFile.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
    const ext = audioFile.name.toLowerCase().split('.').pop() || 'mp3';
    const zip = makeZip([
      { name: 'LightShow/lightshow.fseq', data: bytes },
      { name: `LightShow/lightshow.${ext}`, data: audioBytes },
    ]);
    const blob = new Blob([zip], { type: 'application/zip' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${slug}_${r.id}${suffix}_lightshow.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };

  if (!snippetUsed) {
    return (
      <div className="bg-steel border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-electric-blue/30 transition-all duration-200 card-hover">
        <div>
          <h3 className="text-text-primary font-semibold text-base">{r.name}</h3>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">{r.desc}</p>
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <button
            onClick={() => onDownloadFree(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-steel disabled:text-text-secondary/50 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors duration-150"
          >
            <Scissors size={14} />
            {isBusy ? 'Preparing...' : `Free ${SNIPPET_SECONDS}s Snippet`}
          </button>
          <button
            onClick={() => downloadLocal(output.fseq, '')}
            className="flex items-center justify-center gap-2 bg-charcoal hover:bg-slate text-text-secondary hover:text-text-primary text-xs font-medium rounded-xl px-4 py-2 transition-colors duration-150 border border-border"
          >
            <Download size={12} />
            Preview full show (local only, no credit used)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-steel border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-electric-blue/30 transition-all duration-200 card-hover">
      <div>
        <h3 className="text-text-primary font-semibold text-base">{r.name}</h3>
        <p className="text-text-secondary text-sm mt-1 leading-relaxed">{r.desc}</p>
      </div>
      <div className="flex gap-2 mt-auto pt-1">
        {credits > 0 ? (
          <button
            onClick={() => onDownloadPaid(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary/50 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-150 glow-red"
          >
            {isBusy ? <><Cpu size={14} className="animate-spin" /> Saving...</> : <><Download size={14} /> Use 1 Credit</>}
          </button>
        ) : (
          <button
            onClick={onBuyCredits}
            className="flex-1 flex items-center justify-center gap-2 bg-steel hover:bg-slate border border-border hover:border-accent-red/50 text-text-secondary hover:text-text-primary text-sm font-semibold rounded-xl px-4 py-2.5 transition-all duration-150"
          >
            <Lock size={14} />
            Use 1 Credit
          </button>
        )}
        <button
          onClick={() => downloadLocal(output.fseq, '')}
          className="flex items-center justify-center gap-2 bg-charcoal hover:bg-slate text-text-secondary hover:text-text-primary text-sm font-medium rounded-xl px-4 py-2.5 transition-colors duration-150 border border-border"
        >
          .fseq only
        </button>
      </div>
    </div>
  );
}

function sniffSampleRate(bytes: Uint8Array): number | null {
  if (bytes.length > 44 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    for (let i = 12; i < bytes.length - 24; i += 2) {
      if (bytes[i] === 0x66 && bytes[i + 1] === 0x6D && bytes[i + 2] === 0x74 && bytes[i + 3] === 0x20) {
        return bytes[i + 12] | (bytes[i + 13] << 8) | (bytes[i + 14] << 16) | (bytes[i + 15] << 24);
      }
    }
  }
  const MPEG1 = [44100, 48000, 32000], MPEG2 = [22050, 24000, 16000], MPEG25 = [11025, 12000, 8000];
  for (let i = 0; i < Math.min(bytes.length - 4, 131072); i++) {
    if (bytes[i] === 0xFF && (bytes[i + 1] & 0xE0) === 0xE0) {
      const ver = (bytes[i + 1] >> 3) & 3, srIdx = (bytes[i + 2] >> 2) & 3;
      if (srIdx === 3) continue;
      if (ver === 3) return MPEG1[srIdx];
      if (ver === 2) return MPEG2[srIdx];
      if (ver === 0) return MPEG25[srIdx];
    }
  }
  return null;
}

interface GeneratorPageProps {
  onOpenAuth: () => void;
  onOpenPricing: () => void;
}

export default function GeneratorPage({ onOpenAuth, onOpenPricing }: GeneratorPageProps) {
  const { user, profile, refreshProfile } = useAuth();

  const [model, setModel] = useState<ModelId>('model3');
  const [themeId, setThemeId] = useState<ThemeId>('dynamic');
  const [placement, setPlacement] = useState<Placement>('drops');
  const [mirrors, setMirrors] = useState(4);
  const [windows, setWindows] = useState(0);
  const [chargeMode, setChargeMode] = useState<ChargeMode>('show');
  const [trunkMode, setTrunkMode] = useState<TrunkMode>('none');
  const [trunkCount, setTrunkCount] = useState(1);
  const [customColors, setCustomColors] = useState(['#ff2244', '#ffffff', '#2244ff']);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBytes, setAudioBytes] = useState<Uint8Array | null>(null);
  const [decoded, setDecoded] = useState<AudioBuffer | null>(null);
  const [fileMeta, setFileMeta] = useState('');
  const [srWarn, setSrWarn] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [barLabel, setBarLabel] = useState('');
  const [songInfo, setSongInfo] = useState('');
  const [outputs, setOutputs] = useState<RenditionOutput[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTheme = useCallback((): [number, number, number][] | null => {
    if (themeId === 'custom') {
      const hexToRgb = (h: string): [number, number, number] => [
        parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16),
      ];
      return customColors.map(hexToRgb) as [number, number, number][];
    }
    return THEMES[themeId];
  }, [themeId, customColors]);

  const loadFile = useCallback(async (f: File) => {
    const ext = f.name.toLowerCase().split('.').pop();
    if (!['mp3', 'wav'].includes(ext || '')) {
      setFileMeta(`That file is a .${ext} — Tesla shows need .mp3 or .wav.`);
      return;
    }
    setAudioFile(f);
    setFileMeta('Reading file...');
    setDecoded(null);
    setOutputs([]);
    setPhase('idle');
    try {
      const buf = await f.arrayBuffer();
      const bytes = new Uint8Array(buf);
      setAudioBytes(bytes);
      const fileSR = sniffSampleRate(bytes);
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const dec = await ctx.decodeAudioData(buf.slice(0));
      ctx.close();
      const mins = Math.floor(dec.duration / 60), secs = Math.round(dec.duration % 60);
      const warn = fileSR === 48000 ? ' — 48 kHz detected: Tesla requires 44.1 kHz or lights will drift out of sync.' : '';
      setSrWarn(warn);
      setFileMeta(`${mins}:${String(secs).padStart(2, '0')} · ${(f.size / 1048576).toFixed(1)} MB · ${fileSR ? fileSR + ' Hz' : 'sample rate unknown'}${warn}`);
      setDecoded(dec);
    } catch {
      setFileMeta('Could not decode that audio file. Try re-exporting it as a standard MP3 or WAV.');
      setDecoded(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) loadFile(f);
  }, [loadFile]);

  const generate = useCallback(async () => {
    if (!decoded || !audioFile || !audioBytes) return;
    if (!user) { onOpenAuth(); return; }

    setPhase('analyzing');
    setProgress(0);
    setOutputs([]);
    setDownloadError('');
    setBarLabel('Analyzing — isolating drums, bass, vocals...');
    const t0 = Date.now();
    try {
      await new Promise(r => setTimeout(r, 30));
      const n = decoded.length, chn = decoded.numberOfChannels;

      // Full mono mix
      const mono = new Float32Array(n);
      for (let c = 0; c < chn; c++) { const ch = decoded.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += ch[i]; }
      for (let i = 0; i < n; i++) mono[i] /= chn;

      // 20-second snippet mono
      const snippetSamples = Math.min(mono.length, Math.round(decoded.sampleRate * SNIPPET_SECONDS));
      const snippetMono = mono.slice(0, snippetSamples);

      const A: AnalysisResult = await new Promise(resolve => {
        resolve(analyzeAudio(mono.slice(0), decoded.sampleRate, p => setProgress(p)));
      });
      const snippetA: AnalysisResult = analyzeAudio(snippetMono, decoded.sampleRate, () => {});

      setProgress(1);
      setBarLabel('Building shows...');
      await new Promise(r => setTimeout(r, 10));

      const ext = audioFile.name.toLowerCase().split('.').pop() || 'mp3';
      const opts = { model: MODEL_KEY[model], theme: currentTheme(), art: { placement, mirrors, windows, chargeMode, trunkMode, trunkCount } };
      const rends = renditionsFor(MODEL_KEY[model]);
      const built: RenditionOutput[] = [];
      for (const r of rends) {
        const grid = r.build(A, opts);
        const fseq = writeFseq(grid, `lightshow.${ext}`);
        const snippetGrid = r.build(snippetA, opts);
        const snippetFseq = writeFseq(snippetGrid, `lightshow.${ext}`);
        built.push({ r, fseq, snippetFseq });
        await new Promise(rs => setTimeout(rs, 10));
      }

      setOutputs(built);
      const artBits: string[] = [];
      if (mirrors) artBits.push(`${mirrors} mirror flick${mirrors > 1 ? 's' : ''}`);
      if (windows) artBits.push(`${windows} window bounce${windows > 1 ? 's' : ''}`);
      if (chargeMode !== 'none') artBits.push(`charge port ${chargeMode === 'show' ? 'rainbow show' : 'open'}`);
      if (trunkMode !== 'none') artBits.push(`${trunkCount}x trunk ${trunkMode}`);
      setSongInfo(`Detected ${A.bpm} BPM · ${A.onsets.kick.length} kicks · ${A.onsets.snare.length} snares · ${A.drops.length} drop${A.drops.length === 1 ? '' : 's'} · built for ${MODEL_NAMES[model]}${artBits.length ? ' · ' + artBits.join(' · ') : ''}`);
      setPhase('done');
      setBarLabel(`Ready — ${rends.length} shows generated in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    } catch (err) {
      setPhase('idle');
      setBarLabel(`Error — ${(err as Error).message || err}. Check the browser console for details.`);
    }
  }, [decoded, audioFile, audioBytes, model, currentTheme, placement, mirrors, windows, chargeMode, trunkMode, trunkCount, user, onOpenAuth]);

  const handleDownloadFree = useCallback(async (output: RenditionOutput) => {
    if (!user || !profile || !audioFile) return;
    setDownloadingId(output.r.id);
    setDownloadError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');
      const fseqB64 = uint8ToBase64(output.snippetFseq);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/use-snippet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          fseqB64,
          songName: audioFile.name,
          renditionId: output.r.id,
          renditionName: output.r.name,
          vehicleModel: MODEL_KEY[model],
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`);

      // Download the snippet locally
      const blob = new Blob([output.snippetFseq], { type: 'application/octet-stream' });
      const slug = audioFile.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
      const ext = audioFile.name.toLowerCase().split('.').pop() || 'mp3';
      const zipData = makeZip([
        { name: 'LightShow/lightshow.fseq', data: output.snippetFseq },
        { name: `LightShow/lightshow.${ext}`, data: audioBytes! },
      ]);
      const zipBlob = new Blob([zipData], { type: 'application/zip' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${slug}_${output.r.id}_snippet.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      void blob;

      await refreshProfile();
    } catch (err) {
      setDownloadError((err as Error).message);
    } finally {
      setDownloadingId(null);
    }
  }, [user, profile, audioFile, audioBytes, model, refreshProfile]);

  const handleDownloadPaid = useCallback(async (output: RenditionOutput) => {
    if (!user || !profile || !audioFile) return;
    setDownloadingId(output.r.id);
    setDownloadError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated.');
      const fseqB64 = uint8ToBase64(output.fseq);
      const res = await fetch(`${SUPABASE_URL}/functions/v1/spend-credit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          fseqB64,
          songName: audioFile.name,
          renditionId: output.r.id,
          renditionName: output.r.name,
          vehicleModel: MODEL_KEY[model],
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || `Failed (${res.status})`);

      // Download the full show
      const ext = audioFile.name.toLowerCase().split('.').pop() || 'mp3';
      const slug = audioFile.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 40);
      const zipData = makeZip([
        { name: 'LightShow/lightshow.fseq', data: output.fseq },
        { name: `LightShow/lightshow.${ext}`, data: audioBytes! },
      ]);
      const zipBlob = new Blob([zipData], { type: 'application/zip' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zipBlob);
      a.download = `${slug}_${output.r.id}_lightshow.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);

      await refreshProfile();
    } catch (err) {
      setDownloadError((err as Error).message);
    } finally {
      setDownloadingId(null);
    }
  }, [user, profile, audioFile, audioBytes, model, refreshProfile]);

  const modelNote: Record<ModelId, string> = {
    model3: 'Standard Model 3 — all lights, no Falcon wings.',
    highland: 'Model 3 Highland — updated front light bar.',
    modely: 'Model Y (pre-Juniper) — same core channels as Model 3.',
    juniper: 'Model Y Juniper — 5-segment front light bar, wave show included.',
    models: 'Model S — door handles pop open on strong snare hits.',
    modelx: 'Model X — Falcon Wing doors open at the last chorus.',
    cybertruck: 'Cybertruck — full 60-LED front bar VU meter + rear bar chase.',
  };
  const trunkCountMax = trunkMode === 'dance' ? 2 : 3;

  const snippetUsed = profile?.snippet_used ?? false;
  const credits = profile?.credits ?? 0;

  const artOpts: ArtOptions = { placement, mirrors, windows, chargeMode, trunkMode, trunkCount };
  void artOpts;

  return (
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal border border-border rounded-2xl p-8 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-electric-blue/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/2 right-12 -translate-y-1/2 w-64 h-40">
            <div className="absolute inset-0 bg-gradient-to-b from-slate/50 to-midnight rounded-xl" />
            <div className="absolute top-[45%] left-[10%] w-[80%] h-[2px] bg-accent-red/60 rounded-full shadow-[0_0_8px_rgba(255,59,48,0.4)]" />
            <div className="absolute top-[35%] left-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
            <div className="absolute top-[35%] right-[20%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" />
            <div className="absolute bottom-0 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
        <div className="relative max-w-2xl space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold tracking-tight leading-tight text-text-primary">
            Turn your music into<br />a <span className="bg-gradient-to-r from-accent-red to-electric-blue bg-clip-text text-transparent">Tesla light show.</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-lg">
            Upload a song. Fine-tune your show. Generate.<br className="hidden sm:block" />It's that simple.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold text-sm rounded-xl px-5 py-2.5 transition-all duration-150 glow-red"
            >
              Start Your Show <ArrowRight size={16} />
            </button>
            <button
              onClick={() => document.getElementById('step-upload')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 bg-transparent border border-border hover:border-electric-blue/50 text-text-secondary hover:text-text-primary font-medium text-sm rounded-xl px-5 py-2.5 transition-all duration-150"
            >
              <Play size={14} className="text-electric-blue" /> How It Works
            </button>
          </div>
          <p className="text-text-secondary/60 text-xs pt-1">200-channel FSEQ &bull; Official format &bull; Built for Tesla</p>
        </div>
        {!user && (
          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2 text-emerald-300 text-sm">
            <CheckCircle2 size={14} />
            Sign up free and get a 20-second snippet to try on your Tesla
          </div>
        )}
        {user && !snippetUsed && (
          <div className="mt-6 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2 text-emerald-300 text-sm">
            <Scissors size={14} />
            Your free {SNIPPET_SECONDS}s snippet is waiting — generate a show to claim it
          </div>
        )}
      </section>

      {/* Step 1 — Upload */}
      <section id="step-upload" className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={1} />
          <h2 className="text-text-primary font-heading font-semibold text-lg">Upload Your Song</h2>
        </div>
        <div className="bg-charcoal border border-border rounded-2xl p-6">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 select-none
              ${isDragOver ? 'border-electric-blue/60 bg-electric-blue/5' : audioFile ? 'border-emerald-500/30 bg-steel' : 'border-border bg-steel hover:border-electric-blue/30'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav"
              className="sr-only"
              onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
            />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors duration-200
              ${audioFile ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-electric-blue/10 border-electric-blue/25'}`}>
              {audioFile ? <Music size={24} className="text-emerald-400" /> : <Upload size={24} className="text-electric-blue" />}
            </div>
            <div className="text-center">
              <p className="text-text-primary font-medium text-base">{audioFile ? audioFile.name : 'Drag & drop an MP3 or WAV file here'}</p>
              <p className="text-text-secondary text-sm mt-1">{audioFile ? fileMeta : 'or click to browse'}</p>
            </div>
            {!audioFile && (
              <p className="text-text-secondary/50 text-xs">MP3, WAV &bull; Up to 4 hours &bull; Max 500MB</p>
            )}
            {audioFile && (
              <button
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="text-electric-blue hover:text-electric-blue/80 text-sm font-medium transition-colors"
              >
                Replace File
              </button>
            )}
            {srWarn && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-amber-300 text-sm max-w-lg text-left">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                {srWarn}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Step 2 — Vehicle */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={2} />
          <h2 className="text-text-primary font-heading font-semibold text-lg">Select Your Vehicle</h2>
        </div>
        <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODEL_NAMES) as ModelId[]).map(m => (
              <Chip key={m} on={model === m} onClick={() => setModel(m)}>{MODEL_NAMES[m]}</Chip>
            ))}
          </div>
          <p className="text-text-secondary text-sm">{modelNote[model]}</p>
        </div>
      </section>

      {/* Step 3 — Color theme */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={3} />
          <h2 className="text-text-primary font-heading font-semibold text-lg">Choose Your Color Theme</h2>
        </div>
        <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(THEME_NOTES) as ThemeId[]).map(t => (
              <Chip key={t} on={themeId === t} onClick={() => setThemeId(t)} small>
                {t === 'dynamic' ? 'Dynamic' : t === 'usa' ? 'USA' : t === 'stpat' ? "St. Pat's" : t === 'valentine' ? 'Valentine' : t === 'halloween' ? 'Halloween' : t === 'christmas' ? 'Christmas' : 'Custom'}
              </Chip>
            ))}
          </div>
          <p className="text-text-secondary text-sm">{THEME_NOTES[themeId]}</p>
          {themeId === 'custom' && (
            <div className="flex items-center gap-3 pt-1">
              {customColors.map((c, i) => (
                <label key={i} className="relative cursor-pointer">
                  <div className="w-9 h-9 rounded-full border-2 border-border overflow-hidden" style={{ background: c }}>
                    <input
                      type="color"
                      value={c}
                      onChange={e => setCustomColors(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </label>
              ))}
              <span className="text-text-secondary/60 text-sm">Click a swatch to change</span>
            </div>
          )}
        </div>
      </section>

      {/* Step 4 — Articulation */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={4} />
          <h2 className="text-text-primary font-heading font-semibold text-lg">Articulation & Behavior</h2>
        </div>
        <div className="bg-charcoal border border-border rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-text-secondary text-sm font-medium">Movement Timing</p>
            <div className="flex flex-wrap gap-2">
              {(['drops', 'even', 'finale'] as Placement[]).map(p => (
                <Chip key={p} on={placement === p} onClick={() => setPlacement(p)} small>
                  {p === 'drops' ? 'At drops' : p === 'even' ? 'Even spacing' : 'Grand finale'}
                </Chip>
              ))}
            </div>
            <p className="text-text-secondary/60 text-xs">{PLACE_HELP[placement]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-text-secondary text-sm font-medium block">Mirror Flicks</label>
              <select value={mirrors} onChange={e => setMirrors(parseInt(e.target.value))} className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:border-electric-blue/50 cursor-pointer transition-colors">
                <option value={0}>Off</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>&times; {n}</option>))}
              </select>
              <p className="text-text-secondary/50 text-xs">One flick = both mirrors fold in, then back out (~2s each way). Max 10 flicks.</p>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm font-medium block">Window Bounces</label>
              <select value={windows} onChange={e => setWindows(parseInt(e.target.value))} className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:border-electric-blue/50 cursor-pointer transition-colors">
                <option value={0}>Off</option>
                <option value={1}>&times; 1</option>
                <option value={2}>&times; 2</option>
              </select>
              <p className="text-text-secondary/50 text-xs">All four windows roll down at show start and stay down.</p>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm font-medium block">Charge Port</label>
              <select value={chargeMode} onChange={e => setChargeMode(e.target.value as ChargeMode)} className="w-full bg-midnight border border-border text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:border-electric-blue/50 cursor-pointer transition-colors">
                <option value="none">Off</option>
                <option value="open">Open only</option>
                <option value="show">Open + rainbow + close</option>
              </select>
              <p className="text-text-secondary/50 text-xs">Rainbow opens early, LED flashes at chorus, closes at end.</p>
            </div>
            <div className="space-y-2">
              <label className="text-text-secondary text-sm font-medium block">
                Trunk / Liftgate <span className="text-text-secondary/40">(powered frunk on Cybertruck)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={trunkMode}
                  onChange={e => { const m = e.target.value as TrunkMode; setTrunkMode(m); if (m === 'dance' && trunkCount > 2) setTrunkCount(2); }}
                  className="flex-1 bg-midnight border border-border text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:border-electric-blue/50 cursor-pointer transition-colors"
                >
                  <option value="none">Off</option>
                  <option value="full">Full open/close (~14s open)</option>
                  <option value="half">Half open/close (~3.5s)</option>
                  <option value="dance">Dance oscillate</option>
                </select>
                <select
                  value={trunkCount}
                  disabled={trunkMode === 'none'}
                  onChange={e => setTrunkCount(parseInt(e.target.value))}
                  className="w-20 bg-midnight border border-border text-text-primary rounded-xl px-3 py-2.5 text-sm outline-none focus:border-electric-blue/50 disabled:opacity-30 cursor-pointer disabled:cursor-default transition-colors"
                >
                  {Array.from({ length: trunkCountMax }, (_, i) => i + 1).map(n => (<option key={n} value={n}>&times; {n}</option>))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5 — Generate */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <StepBadge n={5} />
          <h2 className="text-text-primary font-heading font-semibold text-lg">Generate Your Show</h2>
        </div>
        <div className="bg-charcoal border border-border rounded-2xl p-5 space-y-4">
          <LightBar progress={progress} phase={phase} />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-h-5">
              {phase === 'analyzing' && <Cpu size={13} className="text-electric-blue animate-pulse shrink-0" />}
              {phase === 'done' && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
              <p className="text-text-secondary text-xs">{barLabel || (decoded ? 'Ready to generate.' : 'Upload a song to begin.')}</p>
            </div>
            <button
              disabled={!decoded || phase === 'analyzing'}
              onClick={generate}
              className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:bg-steel disabled:text-text-secondary/40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl px-6 py-3 transition-all duration-150 cursor-pointer glow-red disabled:shadow-none"
            >
              <Zap size={16} />
              {user ? 'Generate Light Show' : 'Sign up to generate'}
              <ArrowRight size={14} />
            </button>
          </div>
          <p className="text-text-secondary/50 text-xs text-right">1 credit per show</p>
        </div>
      </section>

      {/* Results */}
      {outputs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary/60">Your shows</h2>
            <p className="text-text-secondary/50 text-xs">{songInfo}</p>
          </div>
          {downloadError && (
            <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {downloadError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {outputs.map((output) => (
              <ResultCard
                key={output.r.id}
                output={output}
                audioFile={audioFile!}
                audioBytes={audioBytes!}
                snippetUsed={snippetUsed}
                credits={credits}
                onDownloadFree={handleDownloadFree}
                onDownloadPaid={handleDownloadPaid}
                onBuyCredits={onOpenPricing}
                downloadingId={downloadingId}
              />
            ))}
          </div>
        </section>
      )}

      {/* How to use */}
      <section className="space-y-4 border-t border-border pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-secondary/60">How to use your show</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { n: '1', title: 'Prepare USB', body: "Format as exFAT, FAT32, or MS-DOS FAT. No TeslaCam or firmware files." },
            { n: '2', title: 'Copy Show', body: "Download the .zip and unzip it. You'll get a LightShow folder with .fseq + audio." },
            { n: '3', title: 'Plug In & Play', body: 'Insert into your Tesla USB port. Open Toybox → Light Show → Schedule Show.' },
            { n: '4', title: 'Multiple Shows', body: 'Rename each set (e.g. bass.fseq + bass.mp3) inside the same LightShow folder.' },
          ].map(step => (
            <div key={step.n} className="bg-steel border border-border rounded-2xl p-5 flex flex-col gap-3 card-hover">
              <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/25 text-electric-blue font-bold text-sm flex items-center justify-center">{step.n}</div>
              <div>
                <p className="text-text-primary font-medium text-sm">{step.title}</p>
                <p className="text-text-secondary text-sm mt-1 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compatibility */}
      <section className="bg-charcoal border border-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="text-text-primary font-medium mb-1.5">Supported Vehicles</p>
          <p className="text-text-secondary leading-relaxed">Model S (2021+), Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model X (2021+), Cybertruck (v11.0+).</p>
        </div>
        <div>
          <p className="text-text-primary font-medium mb-1.5">Audio Format</p>
          <p className="text-text-secondary leading-relaxed">MP3 or WAV, 44.1 kHz recommended. 48 kHz files will drift. Shows up to 4 hours.</p>
        </div>
        <div>
          <p className="text-text-primary font-medium mb-1.5">Command Limits</p>
          <p className="text-text-secondary leading-relaxed">Thermal limits enforced automatically. Commands are kept within Tesla's official caps.</p>
        </div>
      </section>
    </main>
  );
}
