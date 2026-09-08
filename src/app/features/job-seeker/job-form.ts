import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import type { JobSeekerProfile } from '../../core/models/job-seeker-profile';

export const jobFields = [
  'education',
  'fieldOfStudy',
  'skills',
  'experienceMonths',
  'experienceRoles',
  'languages',
  'desiredRoles',
  'countries',
] as const;
export type JobField = (typeof jobFields)[number];
export type JobDraft = Record<JobField, string>;
export const jobSteps: readonly (readonly JobField[])[] = [
  ['education', 'fieldOfStudy', 'skills'],
  ['experienceMonths', 'experienceRoles', 'languages'],
  ['desiredRoles', 'countries'],
];
export type JobForm = FormGroup<Record<JobField, FormControl<string>>>;
export const normalizeMonths = (text: string): string =>
  text.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - 0x09e6)).trim();
export const splitAnswers = (text: string): string[] =>
  text
    .split(/[,،，\n]/)
    .map((value) => value.trim())
    .filter(Boolean);
const required: ValidatorFn = (control) =>
  String(control.value ?? '').trim() ? null : { required: true };
const list: ValidatorFn = (control) => {
  const text = String(control.value ?? '').trim();
  if (!text) return null;
  const values = splitAnswers(text);
  return values.length > 0 && values.length <= 10 && values.every((value) => value.length <= 100)
    ? null
    : { list: true };
};
const months: ValidatorFn = (control) => {
  const text = normalizeMonths(String(control.value ?? ''));
  return !text || (/^\d+$/.test(text) && Number(text) <= 1200) ? null : { months: true };
};
export function isRequired(field: JobField, draft: JobDraft): boolean {
  return (
    field === 'education' ||
    field === 'desiredRoles' ||
    (field === 'experienceRoles' && Number(normalizeMonths(draft.experienceMonths)) > 0)
  );
}
export function createJobForm(): JobForm {
  return new FormGroup(
    Object.fromEntries(
      jobFields.map((field) => [field, new FormControl('', { nonNullable: true })]),
    ) as Record<JobField, FormControl<string>>,
  );
}
export function validateJobForm(form: JobForm): void {
  const draft = form.getRawValue();
  for (const field of jobFields) {
    const validators: ValidatorFn[] = [Validators.maxLength(500)];
    if (isRequired(field, draft)) validators.push(required);
    if (['skills', 'experienceRoles', 'languages', 'desiredRoles', 'countries'].includes(field))
      validators.push(list);
    if (field === 'experienceMonths') validators.push(months);
    form.controls[field].setValidators(validators);
    form.controls[field].updateValueAndValidity({ emitEvent: false });
  }
  form.updateValueAndValidity({ emitEvent: false });
}
export function jobProfile(draft: JobDraft): JobSeekerProfile {
  const listOrUnknown = (text: string) => (text.trim() ? splitAnswers(text) : null);
  return {
    educationDescription: draft.education.trim(),
    fieldOfStudy: draft.fieldOfStudy.trim() || null,
    skillNames: listOrUnknown(draft.skills),
    workExperienceMonths: draft.experienceMonths.trim()
      ? Number(normalizeMonths(draft.experienceMonths))
      : null,
    experienceRoleNames: listOrUnknown(draft.experienceRoles),
    languageNames: listOrUnknown(draft.languages),
    desiredRoleNames: splitAnswers(draft.desiredRoles),
    preferredCountryNames: listOrUnknown(draft.countries),
  };
}
