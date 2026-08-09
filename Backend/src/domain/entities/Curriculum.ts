/**
 * Core domain entities for the cohort curriculum. Framework-agnostic —
 * mirrors the shape of curriculum.json (the source of truth).
 */
export interface CurriculumDay {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

/** `days` is an inclusive [startDay, endDay] range covered by this module. */
export interface CurriculumModule {
  n: number;
  title: string;
  days: [number, number];
}

export interface Curriculum {
  cohort: string;
  modules: CurriculumModule[];
  days: CurriculumDay[];
}
