// CalibrationPlayer: continuous pure tone generation for calibration
// Uses Web Audio API to generate a sine wave at a given frequency
// Supports left/right channel routing

import { dbToAmplitude } from "@/constants/audio";

export class CalibrationPlayer {
  private ctx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private panNode: StereoPannerNode | null = null;
  private isPlaying = false;

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /** Start playing a continuous tone at the given frequency and dB level */
  play(frequency: number, db: number, channel: "left" | "right" | "both" = "both"): void {
    this.stop();

    const ctx = this.ensureContext();
    this.oscillator = ctx.createOscillator();
    this.gainNode = ctx.createGain();
    this.panNode = ctx.createStereoPanner();

    this.oscillator.type = "sine";
    this.oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    const amplitude = dbToAmplitude(db);
    this.gainNode.gain.setValueAtTime(amplitude, ctx.currentTime);

    // Pan: -1 = left, 0 = both, 1 = right
    const panValue = channel === "left" ? -1 : channel === "right" ? 1 : 0;
    this.panNode.pan.setValueAtTime(panValue, ctx.currentTime);

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.panNode);
    this.panNode.connect(ctx.destination);

    this.oscillator.start();
    this.isPlaying = true;
  }

  /** Update volume in real-time */
  updateVolume(db: number): void {
    if (this.gainNode && this.ctx) {
      const amplitude = dbToAmplitude(db);
      this.gainNode.gain.setValueAtTime(amplitude, this.ctx.currentTime);
    }
  }

  /** Update frequency in real-time */
  updateFrequency(frequency: number): void {
    if (this.oscillator && this.ctx) {
      this.oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    }
  }

  /** Stop playing */
  stop(): void {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {
        // Already stopped
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.panNode) {
      this.panNode.disconnect();
      this.panNode = null;
    }
    this.isPlaying = false;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  dispose(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
    }
    this.ctx = null;
  }
}
