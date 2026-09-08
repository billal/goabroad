import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

export const fieldNames = [
  'nationality',
  'nationalityOther',
  'residence',
  'residenceOther',
  'education',
  'educationOther',
  'background',
  'backgroundOther',
  'resultKnown',
  'gpa',
  'gpaScale',
  'graduationYear',
  'studyGapYears',
  'workMonths',
  'test',
  'testOther',
  'overall',
  'overallScale',
  'reading',
  'writing',
  'listening',
  'speaking',
  'componentScale',
  'destination',
  'destinationOther',
  'cities',
  'degree',
  'degreeOther',
  'subjects',
  'budget',
  'currency',
  'intake',
  'scholarship',
] as const;
export type FieldName = (typeof fieldNames)[number];
/** Draft controls keep raw text so unfinished and invalid input can be resumed faithfully. */
export type AssessmentDraft = { [K in FieldName]: string };
export type AssessmentForm = FormGroup<{ [K in FieldName]: FormControl<string> }>;
import type { ReferenceAnswer, StudentProfile } from '../../core/models/student-profile';
export type { ReferenceAnswer, StudentProfile } from '../../core/models/student-profile';
export const steps: readonly (readonly FieldName[])[] = [
  [
    'nationality',
    'nationalityOther',
    'residence',
    'residenceOther',
    'education',
    'educationOther',
    'background',
    'backgroundOther',
  ],
  ['resultKnown', 'gpa', 'gpaScale', 'graduationYear', 'studyGapYears', 'workMonths'],
  [
    'test',
    'testOther',
    'overall',
    'overallScale',
    'reading',
    'writing',
    'listening',
    'speaking',
    'componentScale',
  ],
  [
    'destination',
    'destinationOther',
    'cities',
    'degree',
    'degreeOther',
    'subjects',
    'budget',
    'currency',
    'intake',
    'scholarship',
  ],
];
export const currencies = [
  'BDT',
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'NZD',
  'JPY',
  'INR',
  'MYR',
  'SGD',
] as const;
export const tests = ['none', 'ielts', 'toefl', 'pte', 'duolingo', 'other'] as const;
export const optionalFields = new Set<FieldName>([
  'studyGapYears',
  'workMonths',
  'reading',
  'writing',
  'listening',
  'speaking',
  'cities',
]);
export const numericFields = new Set<FieldName>([
  'gpa',
  'gpaScale',
  'graduationYear',
  'studyGapYears',
  'workMonths',
  'overall',
  'overallScale',
  'reading',
  'writing',
  'listening',
  'speaking',
  'componentScale',
  'budget',
]);
export function visible(field: FieldName, draft: AssessmentDraft): boolean {
  const pairs: Partial<Record<FieldName, FieldName>> = {
    nationalityOther: 'nationality',
    residenceOther: 'residence',
    educationOther: 'education',
    backgroundOther: 'background',
    destinationOther: 'destination',
    degreeOther: 'degree',
    testOther: 'test',
  };
  const parent = pairs[field];
  if (parent) return draft[parent] === 'other';
  if (field === 'gpa' || field === 'gpaScale') return draft.resultKnown === 'yes';
  if (
    [
      'overall',
      'overallScale',
      'reading',
      'writing',
      'listening',
      'speaking',
      'componentScale',
    ].includes(field)
  )
    return draft.test !== '' && draft.test !== 'none';
  return true;
}
export const normalizedNumber = (value: string): string =>
  value.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6)).trim();
const numeric =
  (min: number, max: number, integer = false): ValidatorFn =>
  (control) => {
    if (!control.value) return null;
    const raw = normalizedNumber(String(control.value));
    const value = Number(raw);
    return /^\d+(?:\.\d+)?$/.test(raw) &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max &&
      (!integer || Number.isInteger(value))
      ? null
      : { number: true };
  };
const choice =
  (options: readonly string[]): ValidatorFn =>
  (control) =>
    !control.value || options.includes(control.value) ? null : { choice: true };
const trimmedRequired: ValidatorFn = (control) =>
  String(control.value ?? '').trim() ? null : { required: true };
export const splitList = (value: string): string[] =>
  value
    .split(/[,،，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
const list: ValidatorFn = (control) => {
  if (!control.value) return null;
  const values = splitList(control.value);
  return values.length > 0 && values.length <= 10 && values.every((item) => item.length <= 100)
    ? null
    : { list: true };
};
export function createAssessmentForm(): AssessmentForm {
  const controls = {} as { [K in FieldName]: FormControl<string> };
  for (const field of fieldNames) controls[field] = new FormControl('', { nonNullable: true });
  return new FormGroup(controls);
}
export type ReferenceChoices = Partial<Record<FieldName, readonly string[]>>;
/** Form validation only. No eligibility, test conversion, or qualification equivalence rules. */
export function configureValidation(
  form: AssessmentForm,
  references: ReferenceChoices,
  now = new Date(),
): void {
  const draft = form.getRawValue();
  for (const field of fieldNames) {
    const control = form.controls[field];
    const validators: ValidatorFn[] = [Validators.maxLength(500)];
    if (!visible(field, draft)) {
      control.clearValidators();
      control.updateValueAndValidity({ emitEvent: false });
      continue;
    }
    if (!optionalFields.has(field) && field !== 'componentScale') validators.push(trimmedRequired);
    if (numericFields.has(field)) validators.push(numeric(0, 1_000_000_000));
    if (['gpaScale', 'overallScale', 'componentScale'].includes(field))
      validators.push(numeric(Number.MIN_VALUE, 1_000_000));
    if (field === 'graduationYear') validators.push(numeric(1900, now.getUTCFullYear(), true));
    if (field === 'studyGapYears') validators.push(numeric(0, now.getUTCFullYear() - 1900));
    if (field === 'workMonths')
      validators.push(numeric(0, (now.getUTCFullYear() - 1900) * 12, true));
    if (field === 'resultKnown') validators.push(choice(['yes', 'unknown']));
    if (field === 'test') validators.push(choice(tests));
    if (field === 'currency') validators.push(choice(currencies));
    if (field === 'scholarship') validators.push(choice(['yes', 'no']));
    if (references[field]) validators.push(choice([...references[field], 'other']));
    if (['destinationOther', 'cities', 'subjects'].includes(field)) validators.push(list);
    if (field === 'intake')
      validators.push((control) => {
        const value = normalizedNumber(control.value);
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return { intake: true };
        return value >= now.toISOString().slice(0, 7) &&
          Number(value.slice(0, 4)) <= now.getUTCFullYear() + 10
          ? null
          : { intake: true };
      });
    if (
      field === 'componentScale' &&
      ['reading', 'writing', 'listening', 'speaking'].some((key) => draft[key as FieldName].trim())
    )
      validators.push(trimmedRequired);
    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }
  const addError = (field: FieldName, key: string) =>
    form.controls[field].setErrors(
      { ...form.controls[field].errors, [key]: true },
      { emitEvent: false },
    );
  for (const [value, scale] of [
    ['gpa', 'gpaScale'],
    ['overall', 'overallScale'],
    ['reading', 'componentScale'],
    ['writing', 'componentScale'],
    ['listening', 'componentScale'],
    ['speaking', 'componentScale'],
  ] as const) {
    if (
      visible(value, draft) &&
      draft[value].trim() &&
      draft[scale].trim() &&
      Number(normalizedNumber(draft[value])) > Number(normalizedNumber(draft[scale]))
    )
      addError(value, 'scale');
  }
  if (
    draft.studyGapYears.trim() &&
    draft.graduationYear.trim() &&
    Number(normalizedNumber(draft.studyGapYears)) >
      now.getUTCFullYear() - Number(normalizedNumber(draft.graduationYear))
  )
    addError('studyGapYears', 'gap');
  form.updateValueAndValidity({ emitEvent: false });
}
export function toProfile(draft: AssessmentDraft): StudentProfile {
  const number = (field: FieldName) =>
    draft[field].trim() ? Number(normalizedNumber(draft[field])) : null;
  const ref = (field: FieldName, other: FieldName): ReferenceAnswer =>
    draft[field] === 'other'
      ? { id: null, reportedLabel: draft[other].trim() }
      : { id: draft[field], reportedLabel: null };
  const destinations = splitList(draft.destinationOther);
  return {
    nationality: ref('nationality', 'nationalityOther'),
    residence: ref('residence', 'residenceOther'),
    education: ref('education', 'educationOther'),
    academicBackground: ref('background', 'backgroundOther'),
    academicResult:
      draft.resultKnown === 'yes' ? { value: number('gpa')!, scale: number('gpaScale')! } : null,
    graduationYear: number('graduationYear')!,
    studyGapYears: number('studyGapYears'),
    workExperienceMonths: number('workMonths'),
    languageTest:
      draft.test === 'none'
        ? null
        : {
            type: draft.test,
            reportedName: draft.test === 'other' ? draft.testOther.trim() : null,
            overall: number('overall')!,
            overallScale: number('overallScale')!,
            reading: number('reading'),
            writing: number('writing'),
            listening: number('listening'),
            speaking: number('speaking'),
            componentScale: number('componentScale'),
          },
    destination:
      draft.destination === 'other'
        ? { id: null, reportedLabel: destinations[0] }
        : ref('destination', 'destinationOther'),
    additionalDestinationNames: draft.destination === 'other' ? destinations.slice(1) : [],
    preferredCityNames: splitList(draft.cities),
    degree: ref('degree', 'degreeOther'),
    intendedSubjectNames: splitList(draft.subjects),
    annualTuitionBudget: { amount: number('budget')!, currency: draft.currency },
    preferredIntake: normalizedNumber(draft.intake),
    scholarshipRequired: draft.scholarship === 'yes',
  };
}
