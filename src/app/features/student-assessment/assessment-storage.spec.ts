import { TestBed } from '@angular/core/testing';
import { AssessmentStorage, DRAFT_KEY, DRAFT_TTL, parseDraft } from './assessment-storage';
import { validAnswers } from './assessment.spec-helper';
describe('Unfinished assessment persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });
  it('restores draft and step and clears only its own key', () => {
    sessionStorage.setItem('unrelated', 'keep');
    const storage = TestBed.inject(AssessmentStorage);
    storage.save(validAnswers(), 2);
    expect(storage.load()?.step).toBe(2);
    storage.clear();
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(sessionStorage.getItem('unrelated')).toBe('keep');
  });
  it('expires after 24 hours', () => {
    const storage = TestBed.inject(AssessmentStorage);
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    storage.save(validAnswers(), 1);
    vi.mocked(Date.now).mockReturnValue(now + DRAFT_TTL);
    expect(storage.load()).toBeNull();
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
  });
  it.each(['garbage', 'null', '[]', '{}', '{"version":2}'])(
    'ignores corrupt or incompatible storage %s',
    (raw) => {
      sessionStorage.setItem(DRAFT_KEY, raw);
      expect(TestBed.inject(AssessmentStorage).load()).toBeNull();
    },
  );
  it('rejects wrong field types, missing fields and impossible steps', () => {
    const now = Date.now();
    const base = { version: 1, expiresAt: now + DRAFT_TTL, step: 2, answers: validAnswers() };
    for (const change of [
      { step: 5 },
      { expiresAt: now - 1 },
      { answers: { ...base.answers, gpa: 3 } },
      { answers: {} },
    ])
      expect(parseDraft(JSON.stringify({ ...base, ...change }), now)).toBeNull();
  });
  it('continues in memory if browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const storage = TestBed.inject(AssessmentStorage);
    storage.save(validAnswers(), 3);
    expect(storage.unavailable()).toBe(true);
    expect(storage.load()?.step).toBe(3);
    storage.clear();
    expect(storage.load()).toBeNull();
  });
});
