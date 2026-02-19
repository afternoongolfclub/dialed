// ─── User ───────────────────────────────────────────────────────────────────

export interface User {
  email: string;
  name: string;
}

// ─── Wedge / Club ────────────────────────────────────────────────────────────

export interface Wedge {
  id: string;
  userId: string;
  club: string;       // e.g. "Cleveland RTX6"
  loft: number;       // degrees, e.g. 50
  fullSwing: number;  // yards at full (12 o'clock) swing
  threeQuarter: number; // yards at 3/4 (9 o'clock) swing
  half: number;       // yards at 1/2 (7:30 o'clock) swing
  quarter: number;    // yards at 1/4 (6 o'clock) swing
  createdAt: number;  // Unix timestamp ms
  updatedAt: number;
}

export type WedgeInput = Omit<Wedge, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

// ─── Combine ─────────────────────────────────────────────────────────────────

export type SwingLength = 'fullSwing' | 'threeQuarter' | 'half' | 'quarter';

export const SWING_LABELS: Record<SwingLength, string> = {
  fullSwing: 'Full',
  threeQuarter: '¾',
  half: '½',
  quarter: '¼',
};

export const SWING_CLOCK: Record<SwingLength, string> = {
  fullSwing: '12:00',
  threeQuarter: '9:00',
  half: '7:30',
  quarter: '6:00',
};

export interface CombineShot {
  swingLength: SwingLength;
  distance: number; // yards
}

export interface CombineSession {
  wedgeId: string;
  shots: CombineShot[];
  averages: Partial<Record<SwingLength, number>>;
}

// ─── App View ────────────────────────────────────────────────────────────────

export type AppView = 'matrix' | 'bag' | 'combine';
