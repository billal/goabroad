import type { Claim, Intake, LanguageRequirement, Program, Requirement } from '../models/catalog';
import type { StudentProfile } from '../models/student-profile';
import type {
  EligibilityClassification,
  EligibilityResult,
  MatchingReason,
  MatchingRule,
  RequirementResult,
  RuleOutcome,
} from '../models/eligibility';

const unknown = (reason: MatchingReason = 'programInformationMissing'): RuleOutcome => ({
  status: 'unknown',
  reason,
});
const outcome = (met: boolean): RuleOutcome => ({
  status: met ? 'met' : 'notMet',
  reason: met ? 'satisfied' : 'notSatisfied',
});
const unrestricted = (): RuleOutcome => ({ status: 'met', reason: 'noRestriction' });
const validNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;
const validScore = (value: number | null | undefined, scale: number | null | undefined): boolean =>
  validNumber(value) && validNumber(scale) && scale > 0 && value <= scale;

function accepted(ids: readonly string[] | null, id: string | null): RuleOutcome {
  if (ids === null) return unknown();
  // In the catalog an empty array means a known empty accepted set, not a waiver.
  if (!ids.length) return outcome(false);
  return id ? outcome(ids.includes(id)) : unknown('studentInformationMissing');
}
function numericLimit(limit: number | null, actual: number | null, maximum = false): RuleOutcome {
  if (!validNumber(limit)) return unknown();
  if (!validNumber(actual)) return unknown('studentInformationMissing');
  return outcome(maximum ? actual <= limit : actual >= limit);
}
function gpa(program: Program, profile: StudentProfile): RuleOutcome {
  const required = program.requirements.gpa.value;
  if (!required || !validScore(required.minimum, required.scale)) return unknown();
  const actual = profile.academicResult;
  if (!actual || !validScore(actual.value, actual.scale))
    return unknown('studentInformationMissing');
  if (
    required.scale !== actual.scale ||
    (required.qualificationId !== null && required.qualificationId !== profile.education.id)
  )
    return unknown('notComparable');
  return outcome(actual.value >= required.minimum);
}
function combineAll(values: readonly RuleOutcome[]): RuleOutcome {
  return (
    values.find((value) => value.status === 'notMet') ??
    values.find((value) => value.status === 'unknown') ??
    outcome(true)
  );
}
function languageAlternative(required: LanguageRequirement, profile: StudentProfile): RuleOutcome {
  const actual = profile.languageTest;
  if (!actual) return unknown('studentInformationMissing');
  if (required.test !== actual.type) return outcome(false);
  // Free-text test identities cannot establish equivalence.
  if (required.test === 'other') return unknown('notComparable');
  const checks: RuleOutcome[] = [];
  for (const [minimum, score, requiredScale, actualScale] of [
    [required.minimumOverall, actual.overall, required.overallScale, actual.overallScale],
    [required.minimumReading, actual.reading, required.componentScale, actual.componentScale],
    [required.minimumWriting, actual.writing, required.componentScale, actual.componentScale],
    [required.minimumListening, actual.listening, required.componentScale, actual.componentScale],
    [required.minimumSpeaking, actual.speaking, required.componentScale, actual.componentScale],
  ] as const) {
    // Null thresholds are missing information, not a confirmed waiver.
    if (minimum === null) checks.push(unknown());
    else if (!validScore(minimum, requiredScale)) checks.push(unknown('notComparable'));
    else if (!validScore(score, actualScale)) checks.push(unknown('studentInformationMissing'));
    else if (requiredScale !== actualScale) checks.push(unknown('notComparable'));
    else checks.push(outcome(score! >= minimum));
  }
  return combineAll(checks);
}
function language(program: Program, profile: StudentProfile): RuleOutcome {
  const alternatives = program.requirements.language.value;
  if (alternatives === null) return unknown();
  // A known empty list explicitly has no language-test requirements.
  if (!alternatives.length) return unrestricted();
  if (!profile.languageTest) return unknown('studentInformationMissing');
  const results = alternatives.map((required) => languageAlternative(required, profile));
  return (
    results.find((result) => result.status === 'met') ??
    results.find((result) => result.status === 'unknown') ??
    outcome(false)
  );
}
function tuition(program: Program, profile: StudentProfile): RuleOutcome {
  const required = program.tuition.value;
  if (!required || !validNumber(required.amount)) return unknown();
  if (!validNumber(profile.annualTuitionBudget.amount)) return unknown('studentInformationMissing');
  if (required.period !== 'annual' || required.currency !== profile.annualTuitionBudget.currency)
    return unknown('notComparable');
  return outcome(required.amount <= profile.annualTuitionBudget.amount);
}
function intake(entries: readonly Intake[] | null, month: string, now: number): RuleOutcome {
  if (entries === null) return unknown();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return unknown('studentInformationMissing');
  const results = entries.map((entry): RuleOutcome => {
    if (!entry.startsAt || !Number.isFinite(Date.parse(entry.startsAt))) return unknown();
    if (entry.startsAt.slice(0, 7) !== month) return outcome(false);
    if (Date.parse(entry.startsAt) < now) return outcome(false);
    if (!entry.deadline || !Number.isFinite(Date.parse(entry.deadline))) return unknown();
    return Date.parse(entry.deadline) < now
      ? { status: 'notMet', reason: 'deadlinePassed' }
      : outcome(true);
  });
  return (
    results.find((result) => result.status === 'met') ??
    results.find((result) => result.status === 'unknown') ??
    results.find((result) => result.reason === 'deadlinePassed') ??
    outcome(false)
  );
}
/** Mandatory failures win, then known failures/actionable missing student answers, then uncertainty. */
export function classifyRequirements(
  requirements: readonly RequirementResult[],
): EligibilityClassification {
  if (requirements.some((value) => value.status === 'notMet' && value.mandatory === true))
    return 'currentlyNotEligible';
  if (
    requirements.some(
      (value) => value.status === 'notMet' || value.reason === 'studentInformationMissing',
    )
  )
    return 'actionRequired';
  if (!requirements.length || requirements.some((value) => value.status === 'unknown'))
    return 'possiblyEligible';
  return 'eligibleBasedOnAvailableInformation';
}
/** Pure evaluation: callers supply a validated catalog/profile and an explicit UTC instant.
 * No I/O, implicit clock, ranking, conversion, inferred equivalence, or eligibility guarantee.
 */
export function evaluateProgram(
  program: Program,
  profile: StudentProfile,
  evaluatedAt: string,
): EligibilityResult {
  const now = Date.parse(evaluatedAt);
  if (
    !Number.isFinite(now) ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(evaluatedAt) ||
    new Date(now).toISOString() !== evaluatedAt.replace(/(?<!\.\d{3})Z$/, '.000Z')
  )
    throw new RangeError('Expected UTC evaluation timestamp');
  const r = program.requirements;
  const result = (
    rule: MatchingRule,
    claim: Claim<unknown>,
    value: RuleOutcome,
    mandatory: boolean | null,
  ): RequirementResult => ({ rule, ...value, mandatory, sourceIds: [...claim.sourceIds] });
  const requirement = (rule: MatchingRule, claim: Requirement<unknown>, value: RuleOutcome) =>
    result(rule, claim, value, claim.mandatory);
  const requirements: readonly RequirementResult[] = [
    requirement(
      'education',
      r.educationLevelIds,
      accepted(r.educationLevelIds.value, profile.education.id),
    ),
    requirement(
      'academicBackground',
      r.academicSubjectIds,
      accepted(r.academicSubjectIds.value, profile.academicBackground.id),
    ),
    requirement('gpa', r.gpa, gpa(program, profile)),
    requirement('language', r.language, language(program, profile)),
    result('tuitionBudget', program.tuition, tuition(program, profile), false),
    result(
      'intake',
      program.intakes,
      intake(program.intakes.value, profile.preferredIntake, now),
      false,
    ),
    requirement(
      'studyGap',
      r.maximumStudyGapYears,
      numericLimit(r.maximumStudyGapYears.value, profile.studyGapYears, true),
    ),
    requirement(
      'workExperience',
      r.minimumWorkExperienceMonths,
      numericLimit(r.minimumWorkExperienceMonths.value, profile.workExperienceMonths),
    ),
  ];
  return {
    programId: program.id,
    evaluatedAt,
    classification: classifyRequirements(requirements),
    requirements,
    mandatoryFailures: requirements
      .filter((value) => value.status === 'notMet' && value.mandatory === true)
      .map((value) => value.rule),
    verificationStatus: program.verificationStatus,
    lastCheckedAt: program.lastCheckedAt,
    isDevelopmentSample: program.isDevelopmentSample,
  };
}
