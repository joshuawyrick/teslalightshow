import { useState, useRef, useCallback } from 'react';
import { Upload, Zap, Download, Music, AlertTriangle, CheckCircle2, Cpu, Lock, Scissors, ArrowRight, Sparkles, Car, Palette, Sliders } from 'lucide-react';
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
import { resampleTo44100, encodeWav, encodeMp3 } from '../audioConvert';

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
  drops: 'Movements land right where the song hits hardest.',
  even: 'Movements are spaced out at equal intervals across the whole song.',
  finale: 'Movements cluster in the last third of the song for a big ending.',
};

// ---- Light bar ----
const LB_N = 60;
function LightBar({ progress, phase }: { progress: number; phase: 'idle' | 'analyzing' | 'done' }) {
  const half = LB_N / 2;
  return (
    <div className="flex items-center gap-[2px] h-5" aria-hidden="true">
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
            className={`flex-1 h-full rounded-[2px] transition-all duration-75 ${
              phase === 'idle'
                ? 'lightbar-idle'
                : lit
                  ? 'bg-electric-cyan shadow-[0_0_4px_#00E5FF]'
                  : 'bg-charcoal'
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
          ? 'bg-electric-cyan/15 border-electric-cyan text-white shadow-[0_0_10px_rgba(0,229,255,0.2)]'
          : 'bg-charcoal border-border text-text-secondary hover:border-electric-cyan/40 hover:text-text-primary'
        }`}
    >
      {children}
    </button>
  );
}

interface RenditionOutput {
  r: Rendition;
  fseq: Uint8Array;
  snippetFseq: Uint8Array;
}

interface ResultCardProps {
  output: RenditionOutput;
  snippetUsed: boolean;
  credits: number;
  onDownloadFree: (output: RenditionOutput) => void;
  onDownloadPaid: (output: RenditionOutput) => void;
  onBuyCredits: () => void;
  downloadingId: string | null;
}

function ResultCard({ output, snippetUsed, credits, onDownloadFree, onDownloadPaid, onBuyCredits, downloadingId }: ResultCardProps) {
  const { r } = output;
  const isBusy = downloadingId === r.id;

  if (!snippetUsed) {
    return (
      <div className="bg-charcoal border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-electric-cyan/30 transition-all duration-200 card-hover">
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold text-base">{r.name}</h3>
          <p className="text-text-secondary text-sm mt-1 leading-relaxed">{r.desc}</p>
        </div>
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onDownloadFree(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-electric-cyan hover:bg-electric-cyan/90 disabled:bg-charcoal disabled:text-text-secondary/50 text-midnight text-sm font-semibold rounded-xl px-3 py-2.5 transition-all duration-150 glow-cyan"
          >
            <Scissors size={13} />
            {isBusy ? 'Preparing...' : `Free ${SNIPPET_SECONDS}s`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-border rounded-2xl p-5 flex flex-col gap-3 hover:border-electric-cyan/30 transition-all duration-200 card-hover">
      <div className="flex-1">
        <h3 className="text-text-primary font-semibold text-base">{r.name}</h3>
        <p className="text-text-secondary text-sm mt-1 leading-relaxed">{r.desc}</p>
      </div>
      <div className="flex gap-2 mt-auto pt-2">
        {credits > 0 ? (
          <button
            onClick={() => onDownloadPaid(output)}
            disabled={isBusy || downloadingId !== null}
            className="flex-1 flex items-center justify-center gap-2 bg-electric-cyan hover:bg-electric-cyan/90 disabled:bg-charcoal disabled:text-text-secondary/50 text-midnight text-sm font-semibold rounded-xl px-3 py-2.5 transition-all duration-150 glow-cyan"
          >
            {isBusy ? <><Cpu size={13} className="animate-spin" /> Saving...</> : <>Purchase Credit</>}
          </button>
        ) : (
          <button
            onClick={onBuyCredits}
            className="flex-1 flex items-center justify-center gap-2 bg-electric-cyan hover:bg-electric-cyan/90 text-midnight text-sm font-semibold rounded-xl px-3 py-2.5 transition-all duration-150 glow-cyan"
          >
            <Lock size={13} />
            Purchase Credit
          </button>
        )}
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
  const [uploadConfirmed, setUploadConfirmed] = useState(false);
  const [showCheckReminder, setShowCheckReminder] = useState(false);
  const [convertingStatus, setConvertingStatus] = useState('');

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
    setSrWarn('');
    setConvertingStatus('');
    try {
      const buf = await f.arrayBuffer();
      let bytes = new Uint8Array(buf);
      const fileSR = sniffSampleRate(bytes);
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      let dec = await ctx.decodeAudioData(buf.slice(0));

      if (dec.sampleRate !== 44100) {
        const origRate = fileSR || dec.sampleRate;
        setConvertingStatus('Resampling to 44.1 kHz...');
        setFileMeta(`Converting ${origRate} Hz to 44.1 kHz for Tesla compatibility...`);
        dec = await resampleTo44100(dec);
        ctx.close();

        if (ext === 'wav') {
          setConvertingStatus('Encoding WAV...');
          bytes = encodeWav(dec);
        } else {
          setConvertingStatus('Encoding MP3...');
          bytes = await encodeMp3(dec, (p) => {
            setConvertingStatus(`Encoding MP3... ${Math.round(p * 100)}%`);
          });
        }
        setConvertingStatus('');
        setSrWarn(`${origRate} Hz detected — automatically converted to 44.1 kHz for Tesla compatibility.`);
      } else {
        ctx.close();
      }

      setAudioBytes(bytes);
      const mins = Math.floor(dec.duration / 60), secs = Math.round(dec.duration % 60);
      setFileMeta(`${mins}:${String(secs).padStart(2, '0')} · ${(bytes.length / 1048576).toFixed(1)} MB · 44100 Hz${fileSR && fileSR !== 44100 ? ` (converted from ${fileSR} Hz)` : ''}`);
      setDecoded(dec);
    } catch (err) {
      console.error('[TLS] loadFile error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('resample') || msg.toLowerCase().includes('offline') || msg.toLowerCase().includes('convert')) {
        setFileMeta('Conversion failed. Please convert your file to 44.1 kHz MP3 before uploading, or try a different file.');
      } else {
        setFileMeta('Could not decode that audio file. Try re-exporting it as a standard MP3 or WAV.');
      }
      setDecoded(null);
      setConvertingStatus('');
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
    if (!uploadConfirmed) { setShowCheckReminder(true); return; }

    setPhase('analyzing');
    setProgress(0);
    setOutputs([]);
    setDownloadError('');
    setBarLabel('Analyzing — isolating drums, bass, vocals...');
    const t0 = Date.now();
    try {
      await new Promise(r => setTimeout(r, 30));
      const n = decoded.length, chn = decoded.numberOfChannels;

      const mono = new Float32Array(n);
      for (let c = 0; c < chn; c++) { const ch = decoded.getChannelData(c); for (let i = 0; i < n; i++) mono[i] += ch[i]; }
      for (let i = 0; i < n; i++) mono[i] /= chn;

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
  }, [decoded, audioFile, audioBytes, model, currentTheme, placement, mirrors, windows, chargeMode, trunkMode, trunkCount, user, onOpenAuth, uploadConfirmed]);

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
    <main className="max-w-[1320px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal border border-border rounded-2xl">
        <div className="hero-glow" />
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left content */}
          <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 lg:w-[55%] flex flex-col items-center text-center space-y-4 sm:space-y-5">
            <div className="flex flex-col items-center">
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-[0.2em] font-medium">
                Turn your music into
              </p>
              <img
                src="/tesla-light-show-generator-920.webp"
                srcSet="/tesla-light-show-generator-220.webp 220w, /tesla-light-show-generator-440.webp 440w, /tesla-light-show-generator-640.webp 640w, /tesla-light-show-generator-800.webp 800w, /tesla-light-show-generator-920.webp 920w"
                sizes="(min-width: 1280px) 460px, (min-width: 1024px) 400px, (min-width: 640px) 320px, 220px"
                alt="EV Light Shows"
                width={460}
                height={259}
                fetchPriority="high"
                className="w-[220px] sm:w-[320px] lg:w-[400px] xl:w-[460px] h-auto mt-4"
              />
            </div>
            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              Upload any song. Our AI maps every beat, drop, and detail to a custom light show for your Tesla.
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 pt-2">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-electric-cyan shrink-0" />
                <div>
                  <p className="text-text-primary text-xs font-medium">AI Music Analysis</p>
                  <p className="text-text-secondary text-[10px]">Smart & Accurate</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car size={14} className="text-electric-cyan shrink-0" />
                <div>
                  <p className="text-text-primary text-xs font-medium">Tesla Compatible</p>
                  <p className="text-text-secondary text-[10px]">Designed for Light Show vehicles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-electric-cyan shrink-0" />
                <div>
                  <p className="text-text-primary text-xs font-medium">Fast & Secure</p>
                  <p className="text-text-secondary text-[10px]">Your Privacy Matters</p>
                </div>
              </div>
            </div>
            {!user && (
              <div className="flex items-center justify-center gap-2 bg-electric-cyan/10 border border-electric-cyan/25 rounded-full px-3 sm:px-4 py-2 text-electric-cyan text-xs sm:text-sm">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>Sign up free — get a 20-second snippet to try on your Tesla</span>
              </div>
            )}
            {user && !snippetUsed && (
              <div className="flex items-center justify-center gap-2 bg-electric-cyan/10 border border-electric-cyan/25 rounded-full px-3 sm:px-4 py-2 text-electric-cyan text-xs sm:text-sm">
                <Scissors size={14} className="shrink-0" />
                <span>Your free {SNIPPET_SECONDS}s snippet is waiting — generate a show to claim it</span>
              </div>
            )}
          </div>
          {/* Right - Tesla image */}
          <div className="relative lg:w-[45%] h-48 sm:h-80 lg:h-auto lg:min-h-[340px] w-full overflow-hidden">
            <img
              src="/tesla-model-y-light-show-hero-1200.webp"
              srcSet="/tesla-model-y-light-show-hero-400.webp 400w, /tesla-model-y-light-show-hero-800.webp 800w, /tesla-model-y-light-show-hero-1200.webp 1200w"
              sizes="(min-width: 1024px) 604px, (min-width: 640px) calc(100vw - 3rem), calc(100vw - 1rem)"
              alt="Tesla Model Y front view with red and cyan light show effects"
              width={1672}
              height={941}
              fetchPriority="high"
              className="absolute inset-y-0 left-0 right-4 sm:right-6 lg:right-8 w-[calc(100%-1rem)] sm:w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)] h-full object-cover object-center rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/60 to-transparent w-[35%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/70" />
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-transparent to-charcoal" />
          </div>
        </div>
      </section>

      {/* Step 1 — Upload */}
      <section id="upload" className="bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4 scroll-mt-24">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center shrink-0">
            <Upload size={14} className="text-accent-red" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Step 1 — Upload Your Song</h2>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragEnter={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-5 sm:p-8 flex flex-col items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-200 select-none
            ${isDragOver ? 'border-electric-cyan/60 bg-electric-cyan/5' : audioFile ? 'border-electric-cyan/30 bg-steel' : 'border-border bg-steel hover:border-electric-cyan/30'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav"
            aria-label="Upload MP3 or WAV audio file"
            className="sr-only"
            onChange={e => { if (e.target.files?.[0]) loadFile(e.target.files[0]); }}
          />
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-colors duration-200
            ${audioFile ? 'bg-electric-cyan/15 border-electric-cyan/30' : 'bg-electric-cyan/10 border-electric-cyan/25'}`}>
            {audioFile ? <Music size={20} className="text-electric-cyan" /> : <Upload size={20} className="text-electric-cyan" />}
          </div>
          <div className="text-center px-2">
            <p className="text-text-primary font-medium text-sm sm:text-base break-all sm:break-normal">{audioFile ? audioFile.name : 'Drag & drop your MP3 or WAV file here'}</p>
            <p className="text-text-secondary text-xs sm:text-sm mt-1">{audioFile ? fileMeta : 'or click to browse (up to 4 hours supported)'}</p>
          </div>
          {!audioFile && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-text-secondary/50 text-xs">
              <span>MP3, WAV, 44.1 kHz</span>
              <span>Up to 4 hours</span>
              <span>200-Channel FSEQ</span>
            </div>
          )}
          {audioFile && (
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="text-electric-cyan hover:text-electric-cyan/80 text-sm font-medium transition-colors"
            >
              Change File
            </button>
          )}
          {convertingStatus && (
            <div className="flex items-center gap-2 bg-electric-cyan/10 border border-electric-cyan/25 rounded-xl px-3 sm:px-4 py-3 text-electric-cyan text-xs sm:text-sm">
              <Cpu size={16} className="animate-pulse shrink-0" />
              {convertingStatus}
            </div>
          )}
          {srWarn && !convertingStatus && (
            <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 sm:px-4 py-3 text-emerald-300 text-xs sm:text-sm text-left">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              {srWarn}
            </div>
          )}
        </div>
      </section>

      {/* Step 2 — Vehicle */}
      <section className="bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center shrink-0">
            <Car size={14} className="text-accent-red" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Step 2 — Your Vehicle</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODEL_NAMES) as ModelId[]).map(m => (
            <Chip key={m} on={model === m} onClick={() => setModel(m)}>{MODEL_NAMES[m]}</Chip>
          ))}
        </div>
        <p className="text-text-secondary text-xs sm:text-sm">{modelNote[model]}</p>
      </section>

      {/* Step 3 — Color theme */}
      <section className="bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center shrink-0">
            <Palette size={14} className="text-accent-red" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Step 3 — Color Theme</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(THEME_NOTES) as ThemeId[]).map(t => (
            <Chip key={t} on={themeId === t} onClick={() => setThemeId(t)} small>
              {t === 'dynamic' ? 'Dynamic' : t === 'usa' ? 'USA' : t === 'stpat' ? "St. Pat's" : t === 'valentine' ? 'Valentine' : t === 'halloween' ? 'Halloween' : t === 'christmas' ? 'Christmas' : 'Custom'}
            </Chip>
          ))}
        </div>
        <p className="text-text-secondary text-xs sm:text-sm">{THEME_NOTES[themeId]}</p>
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
            <span className="text-text-secondary/60 text-xs sm:text-sm">Click a swatch to change</span>
          </div>
        )}
      </section>

      {/* Step 4 — Articulation */}
      <section className="bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-red/15 border border-accent-red/25 flex items-center justify-center shrink-0">
            <Sliders size={14} className="text-accent-red" />
          </div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">Step 4 — Articulation</h2>
        </div>
        <div className="space-y-2">
          <p className="text-text-secondary text-sm font-medium">Movement Timing</p>
          <div className="flex flex-wrap gap-2">
            {(['drops', 'even', 'finale'] as Placement[]).map(p => (
              <Chip key={p} on={placement === p} onClick={() => setPlacement(p)} small>
                {p === 'drops' ? 'At Drops' : p === 'even' ? 'Even Spacing' : 'Grand Finale'}
              </Chip>
            ))}
          </div>
          <p className="text-text-secondary/60 text-xs">{PLACE_HELP[placement]}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <label htmlFor="mirror-flicks" className="text-text-secondary text-xs sm:text-sm font-medium block">Mirror Flicks</label>
            <select id="mirror-flicks" value={mirrors} onChange={e => setMirrors(parseInt(e.target.value))} className="w-full bg-midnight border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-electric-cyan/50 cursor-pointer transition-colors">
              <option value={0}>Off</option>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (<option key={n} value={n}>x {n}</option>))}
            </select>
            <p className="text-text-secondary/50 text-[11px] hidden sm:block">Max 10 flicks.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="window-bounces" className="text-text-secondary text-xs sm:text-sm font-medium block">Window Bounces</label>
            <select id="window-bounces" value={windows} onChange={e => setWindows(parseInt(e.target.value))} className="w-full bg-midnight border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-electric-cyan/50 cursor-pointer transition-colors">
              <option value={0}>Off</option>
              <option value={1}>x 1</option>
              <option value={2}>x 2</option>
            </select>
            <p className="text-text-secondary/50 text-[11px] hidden sm:block">All windows roll.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="charge-port" className="text-text-secondary text-xs sm:text-sm font-medium block">Charge Port</label>
            <select id="charge-port" value={chargeMode} onChange={e => setChargeMode(e.target.value as ChargeMode)} className="w-full bg-midnight border border-border text-text-primary rounded-lg px-3 py-2.5 text-sm outline-none focus:border-electric-cyan/50 cursor-pointer transition-colors">
              <option value="none">Off</option>
              <option value="open">Open only</option>
              <option value="show">Open + Rainbow</option>
            </select>
            <p className="text-text-secondary/50 text-[11px] hidden sm:block">Rainbow opens early, flashes at chorus.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="trunk-mode" className="text-text-secondary text-xs sm:text-sm font-medium block">Trunk / Liftgate</label>
            <div className="flex gap-2">
              <select
                id="trunk-mode"
                aria-label="Trunk / Liftgate mode"
                value={trunkMode}
                onChange={e => { const m = e.target.value as TrunkMode; setTrunkMode(m); if (m === 'dance' && trunkCount > 2) setTrunkCount(2); }}
                className="flex-1 bg-midnight border border-border text-text-primary rounded-lg px-2 sm:px-3 py-2.5 text-sm outline-none focus:border-electric-cyan/50 cursor-pointer transition-colors"
              >
                <option value="none">Off</option>
                <option value="full">Full</option>
                <option value="half">Half</option>
                <option value="dance">Dance</option>
              </select>
              <select
                aria-label="Trunk / Liftgate repeat count"
                value={trunkCount}
                disabled={trunkMode === 'none'}
                onChange={e => setTrunkCount(parseInt(e.target.value))}
                className="w-14 sm:w-16 bg-midnight border border-border text-text-primary rounded-lg px-2 py-2.5 text-sm outline-none focus:border-electric-cyan/50 disabled:opacity-30 cursor-pointer transition-colors"
              >
                {Array.from({ length: trunkCountMax }, (_, i) => i + 1).map(n => (<option key={n} value={n}>x {n}</option>))}
              </select>
            </div>
            <p className="text-text-secondary/80 text-[11px] hidden sm:block">Powered trunk on Cybertruck.</p>
          </div>
        </div>
      </section>

      {/* Generate Bar */}
      <section className="space-y-3">
        <div className="bg-charcoal border border-border rounded-2xl p-4 space-y-3">
          <LightBar progress={progress} phase={phase} />
          <div className="flex items-center gap-2 min-h-5">
            {phase === 'analyzing' && <Cpu size={13} className="text-electric-cyan animate-pulse shrink-0" />}
            {phase === 'done' && <CheckCircle2 size={13} className="text-electric-cyan shrink-0" />}
            <p className="text-text-secondary text-xs">{barLabel || (decoded ? 'Ready to generate.' : 'Upload a song to begin.')}</p>
            {phase === 'analyzing' && <span className="text-electric-cyan text-xs ml-auto font-mono">{Math.round(progress * 100)}%</span>}
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none px-1">
          <input
            type="checkbox"
            checked={uploadConfirmed}
            onChange={e => { setUploadConfirmed(e.target.checked); if (e.target.checked) setShowCheckReminder(false); }}
            className="w-4 h-4 rounded border-border bg-midnight accent-electric-cyan shrink-0"
          />
          <span className="text-text-secondary text-xs leading-relaxed">
            I have the right to use this song and I know this site isn't made by Tesla
          </span>
        </label>
        {showCheckReminder && (
          <p className="text-amber-400 text-xs px-1 animate-pulse">
            Just check the box above and you're good to go!
          </p>
        )}
        <button
          disabled={!decoded || phase === 'analyzing' || !!convertingStatus}
          onClick={generate}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-accent-red to-accent-red/90 hover:from-accent-red hover:to-accent-red disabled:from-charcoal disabled:to-charcoal disabled:text-text-secondary/30 disabled:cursor-not-allowed text-white font-display font-bold text-sm sm:text-base uppercase tracking-wider rounded-2xl py-4 transition-all duration-150 cursor-pointer glow-red disabled:shadow-none"
        >
          <Zap size={18} />
          {user ? 'Generate Light Shows' : 'Sign up to generate'}
        </button>
        <p className="text-text-secondary/80 text-xs text-center">1 Credit per show &bull; .fseq format</p>
      </section>

      {/* Results */}
      {outputs.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-display font-bold uppercase tracking-wide text-text-primary">AI Show Presets</h2>
            <p className="text-text-secondary/80 text-xs leading-relaxed">{songInfo}</p>
          </div>
          {downloadError && (
            <div className="flex items-start gap-2 bg-accent-red/10 border border-accent-red/20 rounded-xl px-4 py-3 text-accent-red text-sm">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              {downloadError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {outputs.map((output) => (
              <ResultCard
                key={output.r.id}
                output={output}
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

      {/* How it works + Compatibility */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* How it works */}
        <div className="lg:col-span-2 bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">How to use your show</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { n: '1', title: 'Prepare USB', body: "Format as exFAT, FAT32, or MS-DOS FAT. No TeslaCam or firmware files." },
              { n: '2', title: 'Copy Show', body: "Download .zip, unzip it. You'll get a LightShow folder with .fseq + audio." },
              { n: '3', title: 'Plug In & Play', body: 'Insert into your Tesla USB port. Toybox > Light Show > Schedule Show.' },
              { n: '4', title: 'Multiple Shows', body: 'Rename each pair (bass.fseq + bass.mp3) inside the same LightShow folder.' },
            ].map(step => (
              <div key={step.n} className="flex gap-3">
                <div className="w-6 h-6 rounded bg-electric-cyan/15 border border-electric-cyan/25 text-electric-cyan font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">{step.n}</div>
                <div>
                  <p className="text-text-primary text-sm font-medium">{step.title}</p>
                  <p className="text-text-secondary text-xs mt-0.5 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Compatibility */}
        <div className="bg-charcoal border border-border rounded-2xl p-4 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-secondary">The details</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-text-primary font-medium text-xs">Supported Vehicles</p>
              <p className="text-text-secondary text-xs mt-0.5">Model S (2021+), Model 3, Model 3 Highland, Model Y, Model Y Juniper, Model X (2021+), Cybertruck</p>
            </div>
            <div>
              <p className="text-text-primary font-medium text-xs">Audio Format</p>
              <p className="text-text-secondary text-xs mt-0.5">MP3 or WAV, 44.1 kHz. 48 kHz drifts. Shows up to 4 hours.</p>
            </div>
            <div>
              <p className="text-text-primary font-medium text-xs">Command Limits</p>
              <p className="text-text-secondary text-xs mt-0.5">Thermal limits enforced automatically. Designed for Tesla-compatible Light Show file structure.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
