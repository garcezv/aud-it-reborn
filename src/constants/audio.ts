// Audio and test configuration constants for the audiometry system

export const DEFAULT_FREQUENCIES = [250, 500, 750, 1000, 1500, 2000, 3000, 4000, 6000, 8000] as const;

export const DB_SYSTEM_MAX = 105;
export const DB_SYSTEM_MIN = 0;
export const DB_DEFAULT = 70;
export const DB_START = 50;

// Audio envelope parameters
export const RAMP_TIME = 0.1;
export const RAMP_TIMESTEP = 0.01;
export const ATTACK_TIME = 0.035;
export const HOLD_TIME = 0.25;
export const RELEASE_TIME = 0.035;
export const PLAY_GAP_TIME = 0.7;
export const PLAYER_STOP_DELAY = 0.04;

// Pulse parameters
export const NUM_OF_PULSE_ADULT = 3;
export const PULSE_TIME_ADULT = 0.37;
export const NUM_OF_PULSE_CHILDREN = 2;
export const PULSE_TIME_CHILDREN = 0.5;

// Visual
export const ANIMATE_SCALE = 0.8;

// Threshold algorithm step sizes
export const STEP_INITIAL_DOWN = 20;
export const STEP_INITIAL_UP = 20;
export const STEP_FINE_DOWN = 10;
export const STEP_FINE_UP = 5;

// Termination criteria
export const MAX_FAILURES_AT_MAX = 3;

// Spam detection
export const SPAM_THRESHOLD = 5; // consecutive same-button presses

// Default expected levels per frequency (reference equivalent threshold sound pressure levels)
export const DEFAULT_EXPECTED_LEVELS: Record<number, number> = {
  250: 84,
  500: 75.5,
  750: 72,
  1000: 70,
  1500: 72,
  2000: 73,
  3000: 73.5,
  4000: 75.5,
  6000: 72,
  8000: 70,
};

// Default presentation levels
export const DEFAULT_PRESENTATION_LEVELS: Record<number, number> = {
  250: 70,
  500: 70,
  750: 70,
  1000: 70,
  1500: 70,
  2000: 70,
  3000: 50,
  4000: 70,
  6000: 70,
  8000: 70,
};

// Z-factors for children's mode frequency correction
export const Z_FACTORS: Record<number, number> = {
  250: 0,
  500: 0,
  750: 0,
  1000: 0,
  1500: 0,
  2000: 0,
  3000: 0,
  4000: 0,
  6000: 0,
  8000: 0,
};

/**
 * Convert dB level to amplitude (0..1)
 * ampDB = dB - DB_SYSTEM_MAX
 * amplitude = 10^(ampDB / 20)
 * clamp max at 1.0
 */
export function dbToAmplitude(db: number): number {
  const ampDB = db - DB_SYSTEM_MAX;
  const amplitude = Math.pow(10, ampDB / 20);
  return Math.min(amplitude, 1.0);
}
