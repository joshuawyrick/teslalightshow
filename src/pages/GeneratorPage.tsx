import { useState, useRef, useCallback } from 'react';
import { Upload, Zap, Download, Music, ChevronRight, AlertTriangle, CheckCircle2, Cpu, Lock, Scissors } from 'lucide-react';
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
  drops: 'Movements land right where the song hits hardest — at detected drops and chorus starts.',
  even: 'Movements are spaced out at equal intervals across the whole song.',
  finale: 'Movements cluster in the last third of the song for a big ending.',
};

// ---- Light bar ----
const LB_N = 60;
function LightBar({ progress, phase }: { progress: number; phase: 'idle' | 'analyzing' | 'done' }) {
  const half = LB_N / 2;
  return (
    <div className="flex items-center gap-px h-6" aria-hidden="true">
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
                  ? phase === 'analyzing' ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' : 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-white/10'
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
      className={`rounded-full border font-medium transition-all duration-150 cursor-pointer select-none
        ${small ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'}
        ${on
          ? 'bg-tesla-500 border-tesla-400 text-white shadow-[0_0_12px_rgba(232,33,39,0.35)]'
          : 'bg-white/5 border-white/15 text-white/60 hover:border-white/30 hover:text-white/90 hover:bg-white/10'
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
    // Free snippet available
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-colors duration-200">
        <div>
          <h3 className="text-white font-semibold text-base">{r.name}</h3>
          <p className="text-white/50 text-sm mt-1 leading-relaxed">{r.desc}</p>
        </div>
        <div className="flex flex-col gap-2 mt-auto pt-1">
          <button
            onClick={() => onDownloadFree(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-white/5 disabled:text-white/30 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors duration-150"
          >
            <Scissors size={14} />
            {isBusy ? 'Preparing…' : `Free ${SNIPPET_SECONDS}s Snippet`}
          </button>
          <button
            onClick={() => downloadLocal(output.fseq, '')}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-medium rounded-xl px-4 py-2 transition-colors duration-150 border border-white/8"
          >
            <Download size={12} />
            Preview full show (local only, no credit used)
          </button>
        </div>
      </div>
    );
  }

  // Snippet used — show credit/buy button
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-white/20 transition-colors duration-200">
      <div>
        <h3 className="text-white font-semibold text-base">{r.name}</h3>
        <p className="text-white/50 text-sm mt-1 leading-relaxed">{r.desc}</p>
      </div>
      <div className="flex gap-2 mt-auto pt-1">
        {credits > 0 ? (
          <button
            onClick={() => onDownloadPaid(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/30 text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors duration-150"
          >
            {isBusy ? <><Cpu size={14} className="animate-spin" /> Saving…</> : <><Download size={14} /> Use 1 Credit</>}
          </button>
        ) : (
          <button
            onClick={onBuyCredits}
            className="flex-1 flex items-center justify-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-tesla-500/50 text-white/70 hover:text-white text-sm font-semibold rounded-xl px-4 py-2.5 transition-colors duration-150"
          >
            <Lock size={14} />
            Use 1 Credit
          </button>
        )}
        <button
          onClick={() => downloadLocal(output.fseq, '')}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/12 text-white/50 hover:text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors duration-150 border border-white/10"
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
    setFileMeta('Reading file…');
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
    setBarLabel('Analyzing — isolating drums, bass, vocals…');
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
      setBarLabel('Building shows…');
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
      if (trunkMode !== 'none') artBits.push(`${trunkCount}× trunk ${trunkMode}`);
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
      const snippetBytes = output.snippetFseq;
      let snippetBinary = '';
      const chunkSize = 8192;
      for (let i = 0; i < snippetBytes.length; i += chunkSize) {
        snippetBinary += String.fromCharCode(...snippetBytes.subarray(i, i + chunkSize));
      }
      const fseqB64 = btoa(snippetBinary);
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
      // Convert fseq to base64 — use chunked approach to avoid stack overflow on large files
      const bytes = output.fseq;
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const fseqB64 = btoa(binary);
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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent leading-tight">
          Professional Tesla light shows,<br className="hidden sm:block" /> generated from any song.
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          Upload an MP3 or WAV — we isolate kick, snare, hi-hats, sub-bass, and vocal energy — and choreograph each element to its own light group. Output is the official 200-channel FSEQ format.
        </p>
        {!user && (
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2 text-emerald-300 text-sm">
            <CheckCircle2 size={14} />
            Sign up free and get a 20-second snippet to try on your Tesla
          </div>
        )}
        {user && !snippetUsed && (
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-2 text-emerald-300 text-sm">
            <Scissors size={14} />
            Your free {SNIPPET_SECONDS}s snippet is waiting — generate a show to claim it
          </div>
        )}
      </section>

      {/* Step 1 — Upload */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Step 1 — Upload your song</h2>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 select-none
            ${isDragOver ? 'border-tesla-400/60 bg-tesla-400/5' : audioFile ? 'border-white/20 bg-white/4' : 'border-white/12 bg-white/2 hover:border-white/25 hover:bg-white/4'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav"
            className="sr-only"
            onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
          />
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors duration-200
            ${audioFile ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/5 border-white/10'}`}>
            {audioFile ? <Music size={24} className="text-emerald-400" /> : <Upload size={24} className="text-white/40" />}
          </div>
          <div className="text-center">
            <p className="text-white font-medium text-base">{audioFile ? audioFile.name : 'Drop an MP3 or WAV here'}</p>
            <p className="text-white/40 text-sm mt-1">{audioFile ? fileMeta : 'or click to browse — up to 4 hours supported'}</p>
          </div>
          {srWarn && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-4 py-3 text-amber-300 text-sm max-w-lg text-left">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              {srWarn}
            </div>
          )}
        </div>
      </section>

      {/* Step 2 — Vehicle */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Step 2 — Your vehicle</h2>
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(MODEL_NAMES) as ModelId[]).map(m => (
              <Chip key={m} on={model === m} onClick={() => setModel(m)}>{MODEL_NAMES[m]}</Chip>
            ))}
          </div>
          <p className="text-white/40 text-sm">{modelNote[model]}</p>
        </div>
      </section>

      {/* Step 3 — Color theme */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Step 3 — Color theme</h2>
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(THEME_NOTES) as ThemeId[]).map(t => (
              <Chip key={t} on={themeId === t} onClick={() => setThemeId(t)} small>
                {t === 'dynamic' ? 'Dynamic' : t === 'usa' ? 'USA' : t === 'stpat' ? "St. Pat's" : t === 'valentine' ? 'Valentine' : t === 'halloween' ? 'Halloween' : t === 'christmas' ? 'Christmas' : 'Custom'}
              </Chip>
            ))}
          </div>
          <p className="text-white/40 text-sm">{THEME_NOTES[themeId]}</p>
          {themeId === 'custom' && (
            <div className="flex items-center gap-3 pt-1">
              {customColors.map((c, i) => (
                <label key={i} className="relative cursor-pointer">
                  <div className="w-9 h-9 rounded-full border-2 border-white/20 overflow-hidden" style={{ background: c }}>
                    <input
                      type="color"
                      value={c}
                      onChange={e => setCustomColors(prev => { const n = [...prev]; n[i] = e.target.value; return n; })}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </div>
                </label>
              ))}
              <span className="text-white/30 text-sm">Click a swatch to change</span>
            </div>
          )}
        </div>
      </section>

      {/* Step 4 — Articulation */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Step 4 — Articulation</h2>
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-white/60 text-sm font-medium">Movement timing</p>
            <div className="flex flex-wrap gap-2">
              {(['drops', 'even', 'finale'] as Placement[]).map(p => (
                <Chip key={p} on={placement === p} onClick={() => setPlacement(p)} small>
                  {p === 'drops' ? 'At drops' : p === 'even' ? 'Even spacing' : 'Grand finale'}
                </Chip>
              ))}
            </div>
            <p className="text-white/35 text-xs">{PLACE_HELP[placement]}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium block">Mirror flicks</label>
              <select value={mirrors} onChange={e => setMirrors(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 cursor-pointer">
                <option value={0}>Off</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>× {n}</option>))}
              </select>
              <p className="text-white/30 text-xs">One flick = both mirrors fold in, then back out (~2s each way). Max 10 flicks.</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium block">Window bounces</label>
              <select value={windows} onChange={e => setWindows(parseInt(e.target.value))} className="w-full bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 cursor-pointer">
                <option value={0}>Off</option>
                <option value={1}>× 1</option>
                <option value={2}>× 2</option>
              </select>
              <p className="text-white/30 text-xs">All four windows roll down at show start and stay down so music is heard outside.</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium block">Charge port</label>
              <select value={chargeMode} onChange={e => setChargeMode(e.target.value as ChargeMode)} className="w-full bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 cursor-pointer">
                <option value="none">Off</option>
                <option value="open">Open only</option>
                <option value="show">Open + rainbow + close</option>
              </select>
              <p className="text-white/30 text-xs">Rainbow show: opens early, LED flashes rainbow at final chorus, closes at end.</p>
            </div>
            <div className="space-y-2">
              <label className="text-white/60 text-sm font-medium block">
                Trunk / liftgate <span className="text-white/30">(powered frunk on Cybertruck)</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={trunkMode}
                  onChange={e => { const m = e.target.value as TrunkMode; setTrunkMode(m); if (m === 'dance' && trunkCount > 2) setTrunkCount(2); }}
                  className="flex-1 bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 cursor-pointer"
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
                  className="w-20 bg-white/5 border border-white/12 text-white rounded-xl px-3 py-2 text-sm outline-none focus:border-tesla-500/50 disabled:opacity-30 cursor-pointer disabled:cursor-default"
                >
                  {Array.from({ length: trunkCountMax }, (_, i) => i + 1).map(n => (<option key={n} value={n}>× {n}</option>))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Generate */}
      <section className="space-y-4">
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 space-y-3">
          <LightBar progress={progress} phase={phase} />
          <div className="flex items-center gap-2 min-h-5">
            {phase === 'analyzing' && <Cpu size={13} className="text-tesla-400 animate-pulse shrink-0" />}
            {phase === 'done' && <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />}
            <p className="text-white/50 text-xs">{barLabel || (decoded ? 'Ready to generate.' : 'Upload a song to begin.')}</p>
          </div>
        </div>
        <button
          disabled={!decoded || phase === 'analyzing'}
          onClick={generate}
          className="w-full flex items-center justify-center gap-3 bg-tesla-600 hover:bg-tesla-500 disabled:bg-white/5 disabled:text-white/20 disabled:cursor-not-allowed text-white font-semibold text-base rounded-2xl py-4 transition-all duration-150 cursor-pointer shadow-[0_0_30px_rgba(232,33,39,0.2)] hover:shadow-[0_0_40px_rgba(232,33,39,0.35)]"
        >
          <Zap size={18} />
          {user ? 'Generate light shows' : 'Sign up to generate'}
          {decoded && <ChevronRight size={18} className="ml-auto opacity-50" />}
        </button>
      </section>

      {/* Results */}
      {outputs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">Your shows</h2>
            <p className="text-white/30 text-xs">{songInfo}</p>
          </div>
          {downloadError && (
            <div className="flex items-start gap-2 bg-tesla-500/10 border border-tesla-500/20 rounded-xl px-4 py-3 text-tesla-300 text-sm">
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
      <section className="space-y-4 border-t border-white/8 pt-12">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">How to use your show</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { n: '1', title: 'Prepare the USB drive', body: "Format a USB flash drive as exFAT, FAT32, or MS-DOS FAT. NTFS won't work. The drive must not contain a TeslaCam folder or firmware files." },
            { n: '2', title: 'Copy the show', body: 'Download a show as a USB folder (.zip) and unzip it onto the drive. You\'ll get a LightShow folder containing lightshow.fseq and your song.' },
            { n: '3', title: 'Plug in and play', body: 'Plug the drive into a front USB / USB-C or glovebox port, wait a few seconds, then open Toybox → Light Show → Schedule Show.' },
            { n: '4', title: 'Multiple shows (2023.44.25+)', body: 'Rename each pair to match — e.g. bass.fseq + bass.mp3 — inside the same LightShow folder. The filename becomes the show\'s name in the menu.' },
          ].map(step => (
            <div key={step.n} className="bg-white/3 border border-white/8 rounded-2xl p-5 flex gap-4">
              <div className="w-7 h-7 rounded-full bg-tesla-500/15 border border-tesla-500/25 text-tesla-400 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
              <div>
                <p className="text-white font-medium text-sm">{step.title}</p>
                <p className="text-white/40 text-sm mt-1 leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compatibility */}
      <section className="bg-white/2 border border-white/8 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
        <div>
          <p className="text-white/50 font-medium mb-1">Supported vehicles</p>
          <p className="text-white/30 leading-relaxed">Model S (2021+), Model 3, Model X (2021+), Model Y, and Cybertruck on software v11.0+.</p>
        </div>
        <div>
          <p className="text-white/50 font-medium mb-1">Audio format</p>
          <p className="text-white/30 leading-relaxed">MP3 or WAV, 44.1 kHz recommended. 48 kHz files will drift — we warn you if detected. Shows up to 4 hours.</p>
        </div>
        <div>
          <p className="text-white/50 font-medium mb-1">Command limits</p>
          <p className="text-white/30 leading-relaxed">Closure motors have thermal limits; command counts are kept within Tesla's official caps automatically.</p>
        </div>
      </section>
    </main>
  );
}
