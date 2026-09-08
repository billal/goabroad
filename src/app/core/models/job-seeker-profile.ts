/** Self-reported planning information, not verified qualifications or job eligibility. */
export interface JobSeekerProfile {
  readonly educationDescription: string;
  readonly fieldOfStudy: string | null;
  readonly skillNames: readonly string[] | null;
  readonly workExperienceMonths: number | null;
  readonly experienceRoleNames: readonly string[] | null;
  readonly languageNames: readonly string[] | null;
  readonly desiredRoleNames: readonly string[];
  readonly preferredCountryNames: readonly string[] | null;
}
