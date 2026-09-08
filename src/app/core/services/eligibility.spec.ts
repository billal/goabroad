import { classifyRequirements, evaluateProgram } from './eligibility';
import {
  claim,
  languageFixture,
  profileFixture,
  programFixture,
  requirement,
} from './eligibility.spec-helper';
import type { Program, ProgramRequirements } from '../models/catalog';
import type { StudentProfile } from '../models/student-profile';
import type { MatchingRule } from '../models/eligibility';

const now = '2026-09-08T00:00:00Z';
const run = (program = programFixture(), profile = profileFixture(), at = now) =>
  evaluateProgram(program, profile, at);
const rule = (name: MatchingRule, program = programFixture(), profile = profileFixture()) =>
  run(program, profile).requirements.find((value) => value.rule === name)!;
const requirements = (patch: Partial<ProgramRequirements>): Program => ({
  ...programFixture(),
  requirements: { ...programFixture().requirements, ...patch },
});

describe('Deterministic matching (synthetic fixtures only)', () => {
  it.each(['invalid', '2026-02-30T00:00:00Z', '2026-09-08', '2026-09-08T00:00:00+00:00'])(
    'rejects a noncanonical UTC evaluation instant %s',
    (at) => {
      expect(() => run(programFixture(), profileFixture(), at)).toThrow(RangeError);
    },
  );
  it('meets all eight rules at exact thresholds and preserves provenance', () => {
    const result = run();
    expect(result.requirements).toHaveLength(8);
    expect(result.requirements.every((value) => value.status === 'met')).toBe(true);
    expect(result.classification).toBe('eligibleBasedOnAvailableInformation');
    expect(result.mandatoryFailures).toEqual([]);
    expect(result.isDevelopmentSample).toBe(true);
    expect(result.verificationStatus).toBe('unverified');
    expect(result.lastCheckedAt).toBeNull();
  });
  it.each([
    ['education', 'educationLevelIds'],
    ['academicBackground', 'academicSubjectIds'],
    ['gpa', 'gpa'],
    ['language', 'language'],
    ['studyGap', 'maximumStudyGapYears'],
    ['workExperience', 'minimumWorkExperienceMonths'],
  ] as const)('%s never infers success from a missing program requirement', (name, key) => {
    expect(rule(name, requirements({ [key]: requirement(null) })).status).toBe('unknown');
  });
  it.each(['tuitionBudget', 'intake'] as const)('%s treats absent claims as unknown', (name) => {
    const program =
      name === 'intake'
        ? { ...programFixture(), intakes: claim(null) }
        : { ...programFixture(), tuition: claim(null) };
    expect(rule(name, program).status).toBe('unknown');
  });
  it.each(['education', 'academicBackground'] as const)(
    '%s compares IDs, never labels or level ordering',
    (name) => {
      expect(
        rule(name, programFixture(), {
          ...profileFixture(),
          [name]: { id: 'different', reportedLabel: null },
        }).status,
      ).toBe('notMet');
      expect(
        rule(name, programFixture(), {
          ...profileFixture(),
          [name]: { id: null, reportedLabel: 'fixture-reference' },
        }).status,
      ).toBe('unknown');
    },
  );
  it('distinguishes empty accepted sets from absent requirements', () => {
    expect(rule('education', requirements({ educationLevelIds: requirement([]) })).status).toBe(
      'notMet',
    );
    expect(
      rule('academicBackground', requirements({ academicSubjectIds: requirement([]) })).status,
    ).toBe('notMet');
    expect(rule('language', requirements({ language: requirement([]) })).reason).toBe(
      'noRestriction',
    );
    expect(rule('intake', { ...programFixture(), intakes: claim([]) }).status).toBe('notMet');
  });
  it.each([
    [{ value: 2.99, scale: 4 }, 'notMet'],
    [null, 'unknown'],
    [{ value: 75, scale: 100 }, 'unknown'],
    [{ value: NaN, scale: 4 }, 'unknown'],
    [{ value: 5, scale: 4 }, 'unknown'],
  ] as const)('handles GPA %j without converting scales', (academicResult, status) => {
    expect(rule('gpa', programFixture(), { ...profileFixture(), academicResult }).status).toBe(
      status,
    );
  });
  it('does not compare a GPA from a different qualification', () => {
    expect(
      rule('gpa', programFixture(), {
        ...profileFixture(),
        education: { id: 'different', reportedLabel: null },
      }).reason,
    ).toBe('notComparable');
  });
  it.each(['reading', 'writing', 'listening', 'speaking', 'overall'] as const)(
    'independently enforces language %s',
    (part) => {
      const test = profileFixture().languageTest!;
      expect(
        rule('language', programFixture(), {
          ...profileFixture(),
          languageTest: { ...test, [part]: 4 },
        }).status,
      ).toBe('notMet');
    },
  );
  it('keeps known component failures despite another unknown component', () => {
    expect(
      rule('language', programFixture(), {
        ...profileFixture(),
        languageTest: { ...profileFixture().languageTest!, reading: null, writing: 4 },
      }).status,
    ).toBe('notMet');
  });
  it.each([
    null,
    { ...profileFixture().languageTest!, reading: null },
    { ...profileFixture().languageTest!, overallScale: 120 },
    { ...profileFixture().languageTest!, componentScale: null },
  ])('keeps missing or incomparable test scores unknown', (languageTest) => {
    expect(rule('language', programFixture(), { ...profileFixture(), languageTest }).status).toBe(
      'unknown',
    );
  });
  it('does not guess legacy scales or infer missing component thresholds', () => {
    for (const patch of [
      { overallScale: null },
      { componentScale: undefined },
      { minimumReading: null },
    ]) {
      expect(
        rule(
          'language',
          requirements({ language: requirement([{ ...languageFixture, ...patch }]) }),
        ).status,
      ).toBe('unknown');
    }
  });
  it('accepts any fully met alternative and rejects an unaccepted test', () => {
    expect(
      rule(
        'language',
        requirements({ language: requirement([{ ...languageFixture, test: 'pte' }]) }),
      ).status,
    ).toBe('notMet');
    expect(
      rule(
        'language',
        requirements({
          language: requirement([{ ...languageFixture, test: 'pte' }, languageFixture]),
        }),
      ).status,
    ).toBe('met');
    expect(
      rule(
        'language',
        requirements({
          language: requirement([
            { ...languageFixture, minimumOverall: 7 },
            { ...languageFixture, overallScale: null },
          ]),
        }),
      ).status,
    ).toBe('unknown');
  });
  it('does not equate free-text test identities', () => {
    const program = requirements({
      language: requirement([{ ...languageFixture, test: 'other' }]),
    });
    expect(
      rule('language', program, {
        ...profileFixture(),
        languageTest: {
          ...profileFixture().languageTest!,
          type: 'other',
          reportedName: languageFixture.testName,
        },
      }).reason,
    ).toBe('notComparable');
  });
  it.each([
    [{ amount: 101, currency: 'USD', period: 'annual' }, 'notMet'],
    [{ amount: 0, currency: 'USD', period: 'annual' }, 'met'],
    [{ amount: 100, currency: 'BDT', period: 'annual' }, 'unknown'],
    [{ amount: 100, currency: 'USD', period: 'total' }, 'unknown'],
    [{ amount: 100, currency: 'USD', period: 'semester' }, 'unknown'],
  ] as const)('compares annual tuition without currency/period conversions %j', (value, status) => {
    expect(rule('tuitionBudget', { ...programFixture(), tuition: claim(value) }).status).toBe(
      status,
    );
  });
  it.each([
    ['studyGap', { studyGapYears: 2.1 }, 'notMet'],
    ['studyGap', { studyGapYears: null }, 'unknown'],
    ['studyGap', { studyGapYears: 0 }, 'met'],
    ['workExperience', { workExperienceMonths: 11 }, 'notMet'],
    ['workExperience', { workExperienceMonths: null }, 'unknown'],
    ['workExperience', { workExperienceMonths: 13 }, 'met'],
  ] satisfies readonly [MatchingRule, Partial<StudentProfile>, string][])(
    'evaluates %s %j',
    (name, patch, status) => {
      expect(rule(name, programFixture(), { ...profileFixture(), ...patch }).status).toBe(status);
    },
  );
  it('respects explicit zero work requirements', () => {
    expect(
      rule('workExperience', requirements({ minimumWorkExperienceMonths: requirement(0) }), {
        ...profileFixture(),
        workExperienceMonths: 0,
      }).status,
    ).toBe('met');
  });
  it('checks exact intake month and explicit deadline boundary', () => {
    expect(
      rule('intake', programFixture(), { ...profileFixture(), preferredIntake: '2027-08' }).status,
    ).toBe('notMet');
    const atDeadline = run(programFixture(), profileFixture(), '2027-08-01T00:00:00Z');
    expect(atDeadline.requirements.find((value) => value.rule === 'intake')?.status).toBe('met');
    expect(
      run(programFixture(), profileFixture(), '2027-08-01T00:00:00.001Z').requirements.find(
        (value) => value.rule === 'intake',
      )?.reason,
    ).toBe('deadlinePassed');
  });
  it('preserves uncertainty for undated intakes and missing deadlines', () => {
    const entry = programFixture().intakes.value![0];
    for (const patch of [{ startsAt: null }, { deadline: null }]) {
      expect(
        rule('intake', { ...programFixture(), intakes: claim([{ ...entry, ...patch }]) }).status,
      ).toBe('unknown');
    }
    expect(
      rule('intake', { ...programFixture(), intakes: claim([{ ...entry, startsAt: null }, entry]) })
        .status,
    ).toBe('met');
  });
  it('keeps mandatory failures visible even with other unknowns', () => {
    const result = run(
      requirements({ educationLevelIds: requirement(['different']), language: requirement(null) }),
    );
    expect(result.classification).toBe('currentlyNotEligible');
    expect(result.mandatoryFailures).toEqual(['education']);
    expect(result.requirements.find((value) => value.rule === 'language')?.status).toBe('unknown');
  });
  it.each([false, null])(
    'does not call an uncertain/nonmandatory failure mandatory (%j)',
    (mandatory) => {
      const result = run(
        requirements({ educationLevelIds: requirement(['different'], mandatory) }),
      );
      expect(result.classification).toBe('actionRequired');
      expect(result.mandatoryFailures).toEqual([]);
    },
  );
  it('separates action needed from program uncertainty', () => {
    expect(run(requirements({ gpa: requirement(null) })).classification).toBe('possiblyEligible');
    expect(run(programFixture(), { ...profileFixture(), languageTest: null }).classification).toBe(
      'actionRequired',
    );
    expect(classifyRequirements([])).toBe('possiblyEligible');
  });
  it('is deterministic and leaves inputs and provenance arrays unchanged', () => {
    const program = requirements({
      gpa: { ...programFixture().requirements.gpa, sourceIds: ['fixture-source'] },
    });
    const profile = profileFixture();
    const before = JSON.stringify({ program, profile });
    const first = run(program, profile);
    expect(run(program, profile)).toEqual(first);
    expect(JSON.stringify({ program, profile })).toBe(before);
    expect(first.requirements.find((value) => value.rule === 'gpa')?.sourceIds).toEqual([
      'fixture-source',
    ]);
    expect(first.requirements.find((value) => value.rule === 'gpa')?.sourceIds).not.toBe(
      program.requirements.gpa.sourceIds,
    );
    expect(() => run(program, profile, 'invalid')).toThrow(RangeError);
  });
});
