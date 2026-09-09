import type { Country, Program } from '../../core/models/catalog';
import type { StudentProfile } from '../../core/models/student-profile';
import type { EligibilityResult } from '../../core/models/eligibility';
import { classifyRequirements, evaluateProgram } from '../../core/services/eligibility';

/** Only explicit destination/degree IDs narrow the pilot. Free text is never inferred. */
export function selectPilotPrograms(
  programs: readonly Program[],
  profile: StudentProfile,
  all = false,
): readonly Program[] {
  return programs
    .filter(
      (p) =>
        p.isDevelopmentSample &&
        p.publicationStatus === 'draft' &&
        p.research?.kind === 'official-source-pilot',
    )
    .filter(
      (p) =>
        all ||
        ((!profile.destination.id || p.countryId === profile.destination.id) &&
          (!profile.degree.id || p.degreeLevelId === profile.degree.id)),
    )
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id, 'en'));
}

/** Tuition is applicable only to the explicitly researched year and applicant group.
 * Textual admissions notes never become machine rules or inferred equivalences.
 */
export function evaluatePilot(
  program: Program,
  profile: StudentProfile,
  countries: readonly Country[],
  at: string,
): EligibilityResult {
  const r = program.research;
  const nationality = countries.find((c) => c.id === profile.nationality.id)?.isoCode;
  const validFeeScope =
    !!r?.tuitionAcademicYear &&
    !!r.tuitionNationalityCode &&
    nationality === r.tuitionNationalityCode &&
    profile.preferredIntake === r.tuitionAcademicYear.slice(0, 4) + '-09';
  const result = evaluateProgram(program, profile, at);
  if (program.tuition.value && !validFeeScope) {
    const requirements = result.requirements.map((item) =>
      item.rule === 'tuitionBudget'
        ? { ...item, status: 'unknown' as const, reason: 'notComparable' as const }
        : item,
    );
    return {
      ...result,
      classification: classifyRequirements(requirements),
      requirements,
    };
  }
  return result;
}
