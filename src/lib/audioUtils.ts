
/**
 * Converts raw PCM 16-bit audio data (base64) into a playable WAV Blob.
 * Default sample rate for Gemini TTS is 24000Hz.
 */
export function pcmToWav(base64Pcm: string, sampleRate: number = 24000): Blob {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const buffer = new ArrayBuffer(44 + len);
  const view = new DataView(buffer);

  function writeString(offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, len, true);

  for (let i = 0; i < len; i++) {
    view.setUint8(44 + i, binaryString.charCodeAt(i));
  }

  return new Blob([buffer], { type: 'audio/wav' });
}
