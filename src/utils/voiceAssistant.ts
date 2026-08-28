// Voice Assistant Utility for Text-to-Speech (TTS), Speech-to-Text (STT) and Audio Cues

// Audio Cues using Web Audio API
class SoundFX {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playMicStart() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  }

  playMicStop() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (_) {}
  }

  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch (_) {}
  }
}

export const soundFX = new SoundFX();

// Text to Speech
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const isSpeechSynthesisSupported = (): boolean => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
};

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
      currentUtterance = null;
    } catch (_) {}
  }
};

export const isSpeaking = (): boolean => {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
};

export const speakText = (
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (e: any) => void;
    rate?: number;
    pitch?: number;
  }
) => {
  if (!isSpeechSynthesisSupported()) {
    options?.onEnd?.();
    return;
  }

  stopSpeaking();

  try {
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance = utterance;

    utterance.lang = 'es-CO'; // Colombian Spanish
    utterance.rate = options?.rate || 0.95; // Slightly slower for clarity
    utterance.pitch = options?.pitch || 1.0;

    // Pick best Spanish voice available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      v =>
        v.lang === 'es-CO' ||
        v.lang.startsWith('es-419') ||
        v.lang.startsWith('es-US') ||
        v.lang.startsWith('es-MX') ||
        v.lang.startsWith('es')
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      options?.onError?.(e);
      options?.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    options?.onEnd?.();
  }
};

// Speech Recognition (Speech to Text)
export class VoiceRecognizer {
  private recognition: any = null;
  private isListeningState: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-CO';
      }
    }
  }

  isSupported(): boolean {
    return this.recognition !== null;
  }

  isListening(): boolean {
    return this.isListeningState;
  }

  start(callbacks: {
    onResult: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }) {
    if (!this.recognition) {
      callbacks.onError?.(new Error('Speech recognition not supported in this browser.'));
      return;
    }

    if (this.isListeningState) {
      this.stop();
    }

    stopSpeaking(); // Stop any reading so mic doesn't catch own voice
    soundFX.playMicStart();
    this.isListeningState = true;

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const combined = (finalTranscript || interimTranscript).trim();
      callbacks.onResult(combined, Boolean(finalTranscript));
    };

    this.recognition.onerror = (event: any) => {
      console.warn('Speech recognition event error:', event.error);
      this.isListeningState = false;
      soundFX.playMicStop();
      callbacks.onError?.(event);
    };

    this.recognition.onend = () => {
      this.isListeningState = false;
      soundFX.playMicStop();
      callbacks.onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      this.isListeningState = false;
      callbacks.onError?.(err);
    }
  }

  stop() {
    if (this.recognition && this.isListeningState) {
      try {
        this.recognition.stop();
      } catch (_) {}
      this.isListeningState = false;
      soundFX.playMicStop();
    }
  }
}

export const defaultVoiceRecognizer = new VoiceRecognizer();

// Helper to detect option index from natural spoken Spanish
export const matchOptionFromVoice = (
  spokenText: string,
  options: { label: string; skillTag: string }[]
): number => {
  const text = spokenText.toLowerCase();

  // Explicit numbering words
  if (text.includes('primera') || text.includes('primero') || text.includes('opción 1') || text.includes('opcion 1') || text.includes('la 1') || text.includes('número 1') || text.includes('numero 1') || text.includes('uno')) {
    return 0;
  }
  if (text.includes('segunda') || text.includes('segundo') || text.includes('opción 2') || text.includes('opcion 2') || text.includes('la 2') || text.includes('número 2') || text.includes('numero 2') || text.includes('dos')) {
    return options.length > 1 ? 1 : 0;
  }
  if (text.includes('tercera') || text.includes('tercero') || text.includes('opción 3') || text.includes('opcion 3') || text.includes('la 3') || text.includes('número 3') || text.includes('numero 3') || text.includes('tres')) {
    return options.length > 2 ? 2 : 0;
  }
  if (text.includes('cuarta') || text.includes('cuarto') || text.includes('opción 4') || text.includes('opcion 4') || text.includes('la 4') || text.includes('número 4') || text.includes('numero 4') || text.includes('cuatro')) {
    return options.length > 3 ? 3 : 0;
  }

  // Keyword match in option label or skillTag
  for (let i = 0; i < options.length; i++) {
    const opt = options[i];
    const optLabel = opt.label.toLowerCase();
    const words = optLabel.split(/\s+/).filter(w => w.length > 4);
    for (const w of words) {
      if (text.includes(w)) {
        return i;
      }
    }
    if (text.includes(opt.skillTag.toLowerCase())) {
      return i;
    }
  }

  return -1; // No clear match
};
