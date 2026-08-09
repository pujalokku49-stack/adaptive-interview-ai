import { Candidate, CandidateMission, CandidateSignals } from '@domain/entities/Candidate';

/**
 * Public shape returned by the API. The real candidate dataset has no
 * internal-only fields to strip (unlike the old placeholder model's
 * resumeStoragePath), so this is currently a 1:1 mirror of the domain
 * entity — kept as a distinct type so the API contract can diverge from
 * the domain model later without a breaking change to callers.
 */
export interface CandidateDTO {
  id: string;
  fullName: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
  missions: CandidateMission[];
  signals: CandidateSignals;
}

export function toCandidateDTO(candidate: Candidate): CandidateDTO {
  return {
    id: candidate.id,
    fullName: candidate.fullName,
    jobRole: candidate.jobRole,
    yearsExperience: candidate.yearsExperience,
    education: candidate.education,
    status: candidate.status,
    missions: candidate.missions,
    signals: candidate.signals,
  };
}
