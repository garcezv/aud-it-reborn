// AdultTestPlayer: pulsed pure tone generation for adult hearing tests
// Generates sine wave with attack-hold-release envelope, pulsed presentation

import {
  dbToAmplitude,
  ATTACK_TIME,
  HOLD_TIME,
  RELEASE_TIME,
  NUM_OF_PULSE_ADULT,
  PULSE_TIME_ADULT,
  PLAY_GAP_TIME,
  PLAYER_STOP_DELAY,
} from "@/constants/audio";

export class AdultTestPlayer {
  private ctx: AudioContext | null = null;
  private currentFrequency = 1000;
  private currentDb = 50;
  private isLeft = true;
  private correctionLeft = 0;
  private correctionRight = 0;

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

  /** Play a pulsed tone interval. Returns a promise that resolves when done. */
  private async playInterval(): Promise<void> {
    const ctx = this.ensureContext();
    const correction = this.isLeft ? this.correctionLeft : this.correctionRight;
    const effectiveDb = this.currentDb + correction;
    const amplitude = dbToAmplitude(effectiveDb);

    const pulseDuration = ATTACK_TIME + HOLD_TIME + RELEASE_TIME;
    const totalDuration = NUM_OF_PULSE_ADULT * pulseDuration + (NUM_OF_PULSE_ADULT - 1) * PULSE_TIME_ADULT;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(this.currentFrequency, ctx.currentTime);
    panner.pan.setValueAtTime(this.isLeft ? -1 : 1, ctx.currentTime);

    oscillator.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);

    // Schedule pulsed envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    let t = ctx.currentTime;

    for (let i = 0; i < NUM_OF_PULSE_ADULT; i++) {
      // Attack
      gain.gain.linearRampToValueAtTime(amplitude, t + ATTACK_TIME);
      // Hold
      gain.gain.setValueAtTime(amplitude, t + ATTACK_TIME + HOLD_TIME);
      // Release
      gain.gain.linearRampToValueAtTime(0, t + pulseDuration);

      t += pulseDuration;
      if (i < NUM_OF_PULSE_ADULT - 1) {
        gain.gain.setValueAtTime(0, t);
        t += PULSE_TIME_ADULT;
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
    // Wait for gap between intervals
    await new Promise((resolve) => setTimeout(resolve, PLAY_GAP_TIME * 1000));
    return this.playInterval();
  }

  stop(): void {
    // The oscillator self-stops; this is for emergency stop
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close();
      this.ctx = null;
    }
  }

  dispose(): void {
    this.stop();
  }
}
