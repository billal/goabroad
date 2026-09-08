import {
  configureValidation,
  createAssessmentForm,
  toProfile,
  visible,
  FieldName,
} from './assessment-form';
import { validAnswers } from './assessment.spec-helper';
describe('Student profile validation', () => {
  const references = {
    nationality: [],
    residence: [],
    education: [],
    background: [],
    destination: [],
    degree: [],
  };
  function formWith(changes: Partial<ReturnType<typeof validAnswers>> = {}) {
    const form = createAssessmentForm();
    form.setValue({ ...validAnswers(), ...changes });
    configureValidation(form, references);
    return form;
  }
  it('requires missing fields before a new questionnaire can proceed', () => {
    const form = createAssessmentForm();
    configureValidation(form, references);
    expect(form.invalid).toBe(true);
    expect(form.controls.nationality.hasError('required')).toBe(true);
  });
  it('produces a typed profile, preserves zero and does not invent IDs for custom answers', () => {
    const form = formWith();
    expect(form.valid).toBe(true);
    const profile = toProfile(form.getRawValue());
    expect(profile.workExperienceMonths).toBe(0);
    expect(profile.languageTest).toBeNull();
    expect(profile.nationality).toEqual({ id: null, reportedLabel: 'Bangladesh' });
    expect(profile.additionalDestinationNames).toEqual(['Australia']);
    expect(profile.annualTuitionBudget).toEqual({ amount: 20000, currency: 'USD' });
  });
  it.each([
    ['gpa', '-1'],
    ['gpa', '5'],
    ['gpaScale', '0'],
    ['gpa', 'Infinity'],
    ['gpa', '3e2'],
    ['graduationYear', '3000'],
    ['graduationYear', '2020.5'],
    ['studyGapYears', '3'],
    ['workMonths', '1.5'],
    ['currency', 'BAD'],
    ['scholarship', 'maybe'],
    ['nationality', 'removed-id'],
    ['intake', '2020-01'],
    ['intake', '2030-13'],
    ['subjects', '  '],
    ['subjects', Array(11).fill('subject').join(',')],
  ])('rejects %s=%s', (field, value) => {
    const form = formWith({ [field]: value });
    expect(form.controls[field as FieldName].invalid).toBe(true);
  });
  it('accepts Bengali numbers without altering the stated scale', () => {
    const form = formWith({ gpa: '৩.৫', gpaScale: '৪', budget: '২০০০০' });
    expect(form.valid).toBe(true);
    expect(toProfile(form.getRawValue()).academicResult).toEqual({ value: 3.5, scale: 4 });
  });
  it('keeps unknown academic result and optional experience as null', () => {
    const form = formWith({
      resultKnown: 'unknown',
      gpa: 'nonsense',
      gpaScale: '',
      studyGapYears: '',
      workMonths: '',
    });
    expect(form.valid).toBe(true);
    const profile = toProfile(form.getRawValue());
    expect(profile.academicResult).toBeNull();
    expect(profile.workExperienceMonths).toBeNull();
    expect(visible('gpa', form.getRawValue())).toBe(false);
  });
  it('requires an overall result and explicit scale when a test is selected', () => {
    const form = formWith({ test: 'ielts' });
    expect(form.controls.overall.hasError('required')).toBe(true);
    expect(form.controls.overallScale.hasError('required')).toBe(true);
  });
  it('validates component scores using their separate supplied scale', () => {
    const form = formWith({
      test: 'toefl',
      overall: '100',
      overallScale: '120',
      reading: '25',
      componentScale: '30',
    });
    expect(form.valid).toBe(true);
    expect(toProfile(form.getRawValue()).languageTest?.reading).toBe(25);
    form.controls.reading.setValue('31');
    configureValidation(form, references);
    expect(form.controls.reading.hasError('scale')).toBe(true);
  });
  it('requires component scale only when components are entered', () => {
    expect(formWith({ test: 'ielts', overall: '7', overallScale: '9' }).valid).toBe(true);
    expect(
      formWith({
        test: 'ielts',
        overall: '7',
        overallScale: '9',
        reading: '7',
      }).controls.componentScale.hasError('required'),
    ).toBe(true);
  });
  it('drops scores from the output when no test is selected', () => {
    const form = formWith({ test: 'none', overall: 'bad', overallScale: 'bad' });
    expect(form.valid).toBe(true);
    expect(toProfile(form.getRawValue()).languageTest).toBeNull();
  });
  it('requires custom text and rejects empty lists', () => {
    expect(formWith({ nationalityOther: ' ' }).invalid).toBe(true);
    expect(formWith({ destinationOther: ', ,' }).invalid).toBe(true);
  });
});
