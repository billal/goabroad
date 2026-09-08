import { createJobForm, validateJobForm, jobProfile, JobDraft, JobField } from './job-form';
export const answers = (): JobDraft => ({
  ...createJobForm().getRawValue(),
  education: 'No formal qualification',
  desiredRoles: 'Cook, Baker',
});
describe('Job-seeker questionnaire validation', () => {
  function form(patch: Partial<JobDraft> = {}) {
    const result = createJobForm();
    result.setValue({ ...answers(), ...patch });
    validateJobForm(result);
    return result;
  }
  it('supports beginners and preserves unknown values', () => {
    const result = form();
    expect(result.valid).toBe(true);
    expect(jobProfile(result.getRawValue())).toEqual({
      educationDescription: 'No formal qualification',
      fieldOfStudy: null,
      skillNames: null,
      workExperienceMonths: null,
      experienceRoleNames: null,
      languageNames: null,
      desiredRoleNames: ['Cook', 'Baker'],
      preferredCountryNames: null,
    });
  });
  it.each([
    ['education', ' '],
    ['desiredRoles', ', ,'],
    ['experienceMonths', '-1'],
    ['experienceMonths', '1.5'],
    ['experienceMonths', '1e2'],
    ['experienceMonths', '1201'],
    ['experienceMonths', 'Infinity'],
    ['skills', Array(11).fill('skill').join(',')],
    ['languages', 'a'.repeat(101)],
    ['education', 'a'.repeat(501)],
  ])('rejects %s=%s', (field, value) => {
    expect(form({ [field]: value }).controls[field as JobField].invalid).toBe(true);
  });
  it('requires roles for reported work experience and removes that requirement when cleared', () => {
    const result = form({ experienceMonths: '২৪' });
    expect(result.controls.experienceRoles.hasError('required')).toBe(true);
    result.controls.experienceRoles.setValue('Technician');
    validateJobForm(result);
    expect(result.valid).toBe(true);
    expect(jobProfile(result.getRawValue()).workExperienceMonths).toBe(24);
    result.patchValue({ experienceRoles: '', experienceMonths: '' });
    validateJobForm(result);
    expect(result.valid).toBe(true);
  });
  it('keeps zero experience distinct from unknown and splits Bengali text lists', () => {
    const result = form({
      experienceMonths: '০',
      skills: 'রান্না, বেকিং',
      languages: 'বাংলা, English',
    });
    expect(result.valid).toBe(true);
    expect(jobProfile(result.getRawValue()).workExperienceMonths).toBe(0);
    expect(jobProfile(result.getRawValue()).skillNames).toEqual(['রান্না', 'বেকিং']);
  });
});
