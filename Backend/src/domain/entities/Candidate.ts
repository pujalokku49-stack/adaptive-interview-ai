/**
 * Core domain entity. Framework-agnostic — no Express, no HTTP concerns.
 *
 * Shape matches the cohort's `candidates.json` source of truth: a flat
 * candidate identity plus per-day mission history and aggregate signals.
 * Ids are cohort-issued strings (e.g. "CAND-001"), not UUIDs.
 */
export interface CandidateMission {
  day: number;
  title: string;
  /** Present when the mission was attempted (omitted when skipped). */
  passed?: boolean;
  /** True when the candidate skipped this mission entirely. */
  skipped?: boolean;
  /** Number of attempts taken to pass (absent for skipped missions). */
  attempts?: number;
}

export interface CandidateSignals {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
}

export interface Candidate {
  id: string;
  fullName: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
  missions: CandidateMission[];
  signals: CandidateSignals;
}
