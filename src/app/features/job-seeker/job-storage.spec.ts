import { JobStorage, JOB_DRAFT_KEY, JOB_DRAFT_TTL, parseJobDraft } from './job-storage';
import { createJobForm } from './job-form';
describe('Independent job-seeker drafts', () => {
  afterEach(() => {
    sessionStorage.removeItem(JOB_DRAFT_KEY);
    sessionStorage.removeItem('go-abroad.assessment.v1');
    vi.restoreAllMocks();
  });
  const saved = () => ({
    version: 1,
    expiresAt: Date.now() + JOB_DRAFT_TTL,
    step: 2,
    answers: createJobForm().getRawValue(),
  });
  it('restores only its own draft and leaves the student draft untouched', () => {
    sessionStorage.setItem('go-abroad.assessment.v1', 'student draft');
    const storage = new JobStorage();
    storage.save({ ...createJobForm().getRawValue(), skills: 'Cooking' }, 1);
    expect(new JobStorage().load()?.answers.skills).toBe('Cooking');
    storage.clear();
    expect(sessionStorage.getItem('go-abroad.assessment.v1')).toBe('student draft');
    expect(new JobStorage().load()).toBeNull();
  });
  it.each([
    null,
    [],
    {},
    { ...saved(), version: 2 },
    { ...saved(), step: 4 },
    { ...saved(), step: 1.5 },
    { ...saved(), answers: {} },
    { ...saved(), answers: { ...saved().answers, skills: 5 } },
    { ...saved(), answers: { ...saved().answers, education: 'a'.repeat(501) } },
  ])('rejects corrupt shape %j', (value) => {
    expect(parseJobDraft(JSON.stringify(value), Date.now())).toBeNull();
  });
  it('discards expired or corrupt drafts without affecting the student key', () => {
    sessionStorage.setItem(JOB_DRAFT_KEY, JSON.stringify({ ...saved(), expiresAt: Date.now() }));
    expect(new JobStorage().load()).toBeNull();
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).toBeNull();
    expect(parseJobDraft('broken', Date.now())).toBeNull();
    expect(
      parseJobDraft(
        JSON.stringify({ ...saved(), expiresAt: Date.now() + 2 * JOB_DRAFT_TTL }),
        Date.now(),
      ),
    ).toBeNull();
  });
  it('falls back to memory when writes fail and clears memory safely', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const storage = new JobStorage();
    storage.save(createJobForm().getRawValue(), 1);
    expect(storage.unavailable()).toBe(true);
    expect(storage.load()?.step).toBe(1);
    storage.clear();
    expect(storage.load()).toBeNull();
  });
  it('handles completely unavailable storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const storage = new JobStorage();
    expect(storage.load()).toBeNull();
    expect(storage.unavailable()).toBe(true);
  });
});
