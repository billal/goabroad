import type { Institution, Program } from '../../core/models/catalog';
import type { EligibilityClassification, EligibilityResult } from '../../core/models/eligibility';
import type { StudentProfile } from '../../core/models/student-profile';
import { evaluateProgram } from '../../core/services/eligibility';

export const filterKeys = [
  'q',
  'country',
  'city',
  'degree',
  'subject',
  'min',
  'max',
  'currency',
  'intake',
  'language',
  'scholarship',
  'institutionType',
] as const;
export type FilterKey = (typeof filterKeys)[number];
export type ProgramFilters = Record<FilterKey, string>;
export const emptyFilters = (): ProgramFilters =>
  Object.fromEntries(filterKeys.map((key) => [key, ''])) as ProgramFilters;
export function validFilters(filters: ProgramFilters): boolean {
  const amount = (value: string) =>
    value === '' || (/^\d+(\.\d{1,2})?$/.test(value) && Number(value) <= 1e9);
  return (
    filterKeys.every((key) => filters[key].length <= 100) &&
    amount(filters.min) &&
    amount(filters.max) &&
    (!filters.min || !filters.max || Number(filters.min) <= Number(filters.max)) &&
    (!(filters.min || filters.max) || /^[A-Z]{3}$/.test(filters.currency)) &&
    (!filters.currency || /^[A-Z]{3}$/.test(filters.currency)) &&
    (!filters.intake || /^\d{4}-(0[1-9]|1[0-2])$/.test(filters.intake)) &&
    ['', 'none', 'required', 'ielts', 'toefl', 'pte', 'duolingo', 'other', 'unknown'].includes(
      filters.language,
    ) &&
    ['', 'yes', 'no', 'unknown'].includes(filters.scholarship) &&
    ['', 'public', 'private', 'other', 'unknown'].includes(filters.institutionType)
  );
}
export function parseFilters(params: { get(name: string): string | null }): ProgramFilters {
  return Object.fromEntries(
    filterKeys.map((key) => [key, (params.get(key) ?? '').trim()]),
  ) as ProgramFilters;
}
export function filterProgram(
  program: Program,
  institution: Institution | undefined,
  filters: ProgramFilters,
): boolean {
  if (!validFilters(filters)) return false;
  if (
    filters.q &&
    ![program.name.en, program.name.bn, institution?.name.en, institution?.name.bn].some((value) =>
      value?.toLowerCase().includes(filters.q.toLowerCase()),
    )
  )
    return false;
  for (const [filter, actual] of [
    [filters.country, program.countryId],
    [filters.city, program.cityId],
    [filters.degree, program.degreeLevelId],
    [filters.subject, program.subjectId],
  ] as const) {
    if (filter && filter !== actual) return false;
  }
  if (filters.currency || filters.min || filters.max) {
    const tuition = program.tuition.value;
    if (!tuition || tuition.period !== 'annual' || tuition.currency !== filters.currency)
      return false;
    if (filters.min && tuition.amount < Number(filters.min)) return false;
    if (filters.max && tuition.amount > Number(filters.max)) return false;
  }
  if (
    filters.intake &&
    !program.intakes.value?.some((intake) => intake.startsAt?.slice(0, 7) === filters.intake)
  )
    return false;
  if (filters.language) {
    const languages = program.requirements.language.value;
    if (filters.language === 'unknown') {
      if (languages !== null) return false;
    } else if (filters.language === 'none') {
      if (languages?.length !== 0) return false;
    } else if (filters.language === 'required') {
      if (!languages?.length) return false;
    } else if (!languages?.some((item) => item.test === filters.language)) return false;
  }
  if (filters.scholarship) {
    const value = program.scholarshipAvailability?.value ?? null;
    if (
      filters.scholarship === 'unknown' ? value !== null : value !== (filters.scholarship === 'yes')
    )
      return false;
  }
  if (
    filters.institutionType &&
    (institution?.institutionType ?? 'unknown') !== filters.institutionType
  )
    return false;
  return true;
}
export interface SearchResult {
  readonly program: Program;
  readonly institution: Institution;
  readonly eligibility: EligibilityResult | null;
}
const rank: Record<EligibilityClassification, number> = {
  eligibleBasedOnAvailableInformation: 0,
  possiblyEligible: 1,
  actionRequired: 2,
  currentlyNotEligible: 3,
};
/** Public results exclude draft/archived and development listings; no inferred relevance filters. */
export function searchPrograms(
  programs: readonly Program[],
  institutions: readonly Institution[],
  filters: ProgramFilters,
  profile: StudentProfile | null,
  evaluatedAt: string,
): readonly SearchResult[] {
  const publicInstitutions = new Map(
    institutions
      .filter((item) => item.publicationStatus === 'published' && !item.isDevelopmentSample)
      .map((item) => [item.id, item]),
  );
  const results: SearchResult[] = [];
  for (const program of programs) {
    const institution = publicInstitutions.get(program.institutionId);
    if (
      program.publicationStatus !== 'published' ||
      program.isDevelopmentSample ||
      !institution ||
      !filterProgram(program, institution, filters)
    )
      continue;
    results.push({
      program,
      institution,
      eligibility: profile ? evaluateProgram(program, profile, evaluatedAt) : null,
    });
  }
  return results.sort((a, b) => {
    const difference =
      (a.eligibility ? rank[a.eligibility.classification] : 0) -
      (b.eligibility ? rank[b.eligibility.classification] : 0);
    return (
      difference ||
      (a.program.name.en < b.program.name.en
        ? -1
        : a.program.name.en > b.program.name.en
          ? 1
          : a.program.id < b.program.id
            ? -1
            : a.program.id > b.program.id
              ? 1
              : 0)
    );
  });
}
