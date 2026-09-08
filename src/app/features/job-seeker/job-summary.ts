import type { JobSeekerProfile } from '../../core/models/job-seeker-profile';
import type { JobField } from './job-form';

export interface JobSummaryRow {
  readonly field: JobField;
  readonly value: string | number | readonly string[] | null;
  readonly missing: boolean;
  readonly notApplicable: boolean;
}
/** Reports only supplied values and omissions. No readiness score or eligibility inference. */
export function summarizeJobProfile(profile: JobSeekerProfile): readonly JobSummaryRow[] {
  const values: Record<JobField, JobSummaryRow['value']> = {
    education: profile.educationDescription,
    fieldOfStudy: profile.fieldOfStudy,
    skills: profile.skillNames,
    experienceMonths: profile.workExperienceMonths,
    experienceRoles: profile.experienceRoleNames,
    languages: profile.languageNames,
    desiredRoles: profile.desiredRoleNames,
    countries: profile.preferredCountryNames,
  };
  return (Object.keys(values) as JobField[]).map((field) => {
    const value = values[field];
    const empty =
      value === null ||
      (typeof value === 'string' && !value.trim()) ||
      (Array.isArray(value) && value.length === 0);
    const notApplicable =
      field === 'experienceRoles' && profile.workExperienceMonths === 0 && empty;
    return { field, value, missing: empty && !notApplicable, notApplicable };
  });
}
