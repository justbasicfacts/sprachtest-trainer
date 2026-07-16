/* Wandelt eine Browser-Aufnahme (MediaRecorder-Blob: webm/opus in Chrome,
   mp4/aac in Safari, ogg/opus in Firefox) in 16-kHz-Mono-WAV um.

   Warum: Gemini unterstützt offiziell WAV/MP3/AAC/OGG/FLAC - aber nicht jedes
   Container-Format, das MediaRecorder je nach Browser liefert. Da jeder Browser
   sein eigenes Aufnahmeformat auch dekodieren kann (Web Audio API), ist
   "dekodieren → auf 16 kHz mono heruntermischen → als WAV kodieren" der
   deterministische Weg, der überall funktioniert. 16 kHz mono reicht für
   Sprachanalyse völlig und hält die Datei klein (~2 MB/Minute als Base64). */

export async function blobToWavBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer()

  // Mit einem normalen AudioContext dekodieren (OfflineAudioContext kann in
  // Safari kein decodeAudioData mit komprimierten Formaten).
  const decodeCtx = new AudioContext()
  let decoded: AudioBuffer
  try {
    decoded = await decodeCtx.decodeAudioData(arrayBuffer)
  } finally {
    void decodeCtx.close()
  }

  // Auf 16 kHz mono neu abtasten
  const targetRate = 16000
  const length = Math.ceil((decoded.duration || 0) * targetRate)
  if (length === 0) throw new Error('Die Aufnahme ist leer.')
  const offline = new OfflineAudioContext(1, length, targetRate)
  const source = offline.createBufferSource()
  source.buffer = decoded
  source.connect(offline.destination)
  source.start()
  const rendered = await offline.startRendering()
  const samples = rendered.getChannelData(0)

  // Als 16-bit-PCM-WAV kodieren
  const wav = encodeWavPcm16(samples, targetRate)

  // Base64 (chunk-weise, um Callstack-Limits bei großen Aufnahmen zu vermeiden)
  let binary = ''
  const bytes = new Uint8Array(wav)
  const CHUNK = 0x8000
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(binary)
}

function encodeWavPcm16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const dataSize = samples.length * 2
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i))
  }

  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true) // fmt-Chunk-Größe
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // Byte-Rate
  view.setUint16(32, 2, true) // Block-Align
  view.setUint16(34, 16, true) // Bits pro Sample
  writeStr(36, 'data')
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  return buffer
}
