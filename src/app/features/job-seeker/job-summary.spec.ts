import { summarizeJobProfile } from './job-summary';
import { createJobForm, jobProfile } from './job-form';

describe('Job-seeker profile summary', () => {
  const profile = () =>
    jobProfile({
      ...createJobForm().getRawValue(),
      education: 'No formal qualification',
      desiredRoles: 'Cook, Baker',
    });
  it('preserves self-reported answers and identifies omissions without scoring them', () => {
    const input = profile();
    const before = JSON.stringify(input);
    const summary = summarizeJobProfile(input);
    expect(summary).toHaveLength(8);
    expect(summary.find((row) => row.field === 'education')?.value).toBe('No formal qualification');
    expect(summary.find((row) => row.field === 'desiredRoles')?.value).toEqual(['Cook', 'Baker']);
    expect(summary.filter((row) => row.missing).map((row) => row.field)).toEqual([
      'fieldOfStudy',
      'skills',
      'experienceMonths',
      'experienceRoles',
      'languages',
      'countries',
    ]);
    expect(JSON.stringify(input)).toBe(before);
  });
  it('distinguishes zero experience and inapplicable roles from missing answers', () => {
    const rows = summarizeJobProfile({ ...profile(), workExperienceMonths: 0 });
    expect(rows.find((row) => row.field === 'experienceMonths')).toMatchObject({
      value: 0,
      missing: false,
    });
    expect(rows.find((row) => row.field === 'experienceRoles')).toMatchObject({
      missing: false,
      notApplicable: true,
    });
  });
  it('retains role information when it was supplied with zero full months', () => {
    expect(
      summarizeJobProfile({
        ...profile(),
        workExperienceMonths: 0,
        experienceRoleNames: ['Trainee'],
      }).find((row) => row.field === 'experienceRoles'),
    ).toMatchObject({ value: ['Trainee'], notApplicable: false });
  });
  it('reports no omissions for a fully answered profile without inferring eligibility', () => {
    const rows = summarizeJobProfile({
      ...profile(),
      fieldOfStudy: 'Hospitality',
      skillNames: ['Cooking'],
      workExperienceMonths: 12,
      experienceRoleNames: ['Cook'],
      languageNames: ['বাংলা'],
      preferredCountryNames: ['Canada'],
    });
    expect(rows.every((row) => !row.missing)).toBe(true);
    expect(rows.every((row) => !('score' in row) && !('eligibility' in row))).toBe(true);
  });
});
