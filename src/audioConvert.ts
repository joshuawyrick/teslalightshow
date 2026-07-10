import lamejs from '@breezystack/lamejs';

export async function resampleTo44100(decoded: AudioBuffer): Promise<AudioBuffer> {
  const channels = decoded.numberOfChannels;
  const targetLength = Math.ceil(decoded.duration * 44100);
  const offline = new OfflineAudioContext(channels, targetLength, 44100);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start(0);
  return offline.startRendering();
}

export function encodeWav(buffer: AudioBuffer): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length;
  const bytesPerSample = 2;
  const dataSize = numSamples * numChannels * bytesPerSample;
  const headerSize = 44;
  const out = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(out);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      const s = Math.max(-1, Math.min(1, channels[c][i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Uint8Array(out);
}

export function encodeMp3(
  buffer: AudioBuffer,
  onProgress?: (fraction: number) => void
): Uint8Array {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const kbps = 192;
  const encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, kbps);
  const blockSize = 1152;
  const numSamples = buffer.length;

  const toInt16 = (floats: Float32Array): Int16Array => {
    const int16 = new Int16Array(floats.length);
    for (let i = 0; i < floats.length; i++) {
      const s = Math.max(-1, Math.min(1, floats[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16;
  };

  const left = toInt16(buffer.getChannelData(0));
  const right = numChannels > 1 ? toInt16(buffer.getChannelData(1)) : left;

  const chunks: Uint8Array[] = [];
  const totalBlocks = Math.ceil(numSamples / blockSize);

  for (let i = 0; i < numSamples; i += blockSize) {
    const end = Math.min(i + blockSize, numSamples);
    const leftChunk = left.subarray(i, end);
    const rightChunk = right.subarray(i, end);
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) chunks.push(new Uint8Array(mp3buf));
    if (onProgress) {
      const blockIdx = Math.floor(i / blockSize);
      if (blockIdx % 50 === 0) onProgress(blockIdx / totalBlocks);
    }
  }

  const flush = encoder.flush();
  if (flush.length > 0) chunks.push(new Uint8Array(flush));
  if (onProgress) onProgress(1);

  let totalLen = 0;
  for (const c of chunks) totalLen += c.length;
  const result = new Uint8Array(totalLen);
  let pos = 0;
  for (const c of chunks) { result.set(c, pos); pos += c.length; }
  return result;
}
