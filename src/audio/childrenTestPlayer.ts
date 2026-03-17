// ChildrenTestPlayer: plays WAV files for children's hearing tests
// Uses pre-recorded animal tones per frequency, with stereo panning
// Falls back to synthesized tones if WAV files are unavailable

import {
  dbToAmplitude,
  ATTACK_TIME,
  HOLD_TIME,
  RELEASE_TIME,
  NUM_OF_PULSE_CHILDREN,
  PULSE_TIME_CHILDREN,
  PLAY_GAP_TIME,
  PLAYER_STOP_DELAY,
  Z_FACTORS,
} from "@/constants/audio";

export class ChildrenTestPlayer {
  private ctx: AudioContext | null = null;
  private currentFrequency = 1000;
  private currentDb = 50;
  private isLeft = true;
  private correctionLeft = 0;
  private correctionRight = 0;
  private audioBuffers: Map<number, AudioBuffer> = new Map();

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  updateFreq(freq: number): void {
    this.currentFrequency = freq;
  }

  updateVolume(db: number, isLeft: boolean): void {
    this.currentDb = db;
    this.isLeft = isLeft;
  }

  setCorrection(left: number, right: number): void {
    this.correctionLeft = left;
    this.correctionRight = right;
  }

  /** Attempt to load WAV file for a frequency. Falls back to synthesis. */
  async preloadFrequency(freq: number): Promise<void> {
    if (this.audioBuffers.has(freq)) return;

    try {
      const ctx = this.ensureContext();
      const response = await fetch(`/Animal_Tones/${freq}Hz.wav`);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(freq, audioBuffer);
      }
    } catch {
      // WAV not available, will use synthesis fallback
      console.warn(`Animal tone for ${freq}Hz not available, using synthesis`);
    }
  }

  /** Play an interval using WAV or synthesized fallback */
  private async playInterval(): Promise<void> {
    const ctx = this.ensureContext();
    const correction = this.isLeft ? this.correctionLeft : this.correctionRight;
    const zFactor = Z_FACTORS[this.currentFrequency] ?? 0;
    const effectiveDb = this.currentDb + correction + zFactor;
    const amplitude = dbToAmplitude(effectiveDb);

    const buffer = this.audioBuffers.get(this.currentFrequency);

    if (buffer) {
      // Play from buffer
      return this.playFromBuffer(ctx, buffer, amplitude);
    }

    // Fallback: synthesized pulsed tone (similar to adult but with children params)
    return this.playSynthesized(ctx, amplitude);
  }

  private async playFromBuffer(ctx: AudioContext, buffer: AudioBuffer, amplitude: number): Promise<void> {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    source.buffer = buffer;
    gain.gain.setValueAtTime(amplitude, ctx.currentTime);
    panner.pan.setValueAtTime(this.isLeft ? -1 : 1, ctx.currentTime);

    source.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    source.start();

    return new Promise((resolve) => {
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
        panner.disconnect();
        resolve();
      };
    });
  }

  private async playSynthesized(ctx: AudioContext, amplitude: number): Promise<void> {
    const pulseDuration = ATTACK_TIME + HOLD_TIME + RELEASE_TIME;
    const totalDuration = NUM_OF_PULSE_CHILDREN * pulseDuration + (NUM_OF_PULSE_CHILDREN - 1) * PULSE_TIME_CHILDREN;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(this.currentFrequency, ctx.currentTime);
    panner.pan.setValueAtTime(this.isLeft ? -1 : 1, ctx.currentTime);

    oscillator.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    let t = ctx.currentTime;

    for (let i = 0; i < NUM_OF_PULSE_CHILDREN; i++) {
      gain.gain.linearRampToValueAtTime(amplitude, t + ATTACK_TIME);
      gain.gain.setValueAtTime(amplitude, t + ATTACK_TIME + HOLD_TIME);
      gain.gain.linearRampToValueAtTime(0, t + pulseDuration);
      t += pulseDuration;
      if (i < NUM_OF_PULSE_CHILDREN - 1) {
        gain.gain.setValueAtTime(0, t);
        t += PULSE_TIME_CHILDREN;
      }
    }

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + totalDuration + PLAYER_STOP_DELAY);

    return new Promise((resolve) => {
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        panner.disconnect();
        resolve();
      };
    });
  }

  async playFirstInterval(): Promise<void> {
    return this.playInterval();
  }

  async playSecondInterval(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, PLAY_GAP_TIME * 1000));
    return this.playInterval();
  }

  stop(): void {
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
      this.ctx = null;
    }
    this.audioBuffers.clear();
  }

  dispose(): void {
    this.stop();
  }
}
