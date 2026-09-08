import type { VerificationStatus } from './catalog';

export type RequirementStatus = 'met' | 'notMet' | 'unknown';
export type EligibilityClassification =
  | 'eligibleBasedOnAvailableInformation'
  | 'possiblyEligible'
  | 'actionRequired'
  | 'currentlyNotEligible';
export type MatchingRule =
  | 'education'
  | 'academicBackground'
  | 'gpa'
  | 'language'
  | 'tuitionBudget'
  | 'intake'
  | 'studyGap'
  | 'workExperience';
/** Stable codes for later bilingual presentation, never user-facing prose. */
export type MatchingReason =
  | 'satisfied'
  | 'notSatisfied'
  | 'programInformationMissing'
  | 'studentInformationMissing'
  | 'notComparable'
  | 'noRestriction'
  | 'deadlinePassed';
export interface RuleOutcome {
  readonly status: RequirementStatus;
  readonly reason: MatchingReason;
}
export interface RequirementResult extends RuleOutcome {
  readonly rule: MatchingRule;
  readonly mandatory: boolean | null;
  readonly sourceIds: readonly string[];
}
export interface EligibilityResult {
  readonly programId: string;
  readonly evaluatedAt: string;
  readonly classification: EligibilityClassification;
  readonly requirements: readonly RequirementResult[];
  readonly mandatoryFailures: readonly MatchingRule[];
  readonly verificationStatus: VerificationStatus;
  readonly lastCheckedAt: string | null;
  readonly isDevelopmentSample: boolean;
}
