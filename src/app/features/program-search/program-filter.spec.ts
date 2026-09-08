import { convertToParamMap } from '@angular/router';
import {
  emptyFilters,
  filterProgram,
  parseFilters,
  searchPrograms,
  validFilters,
  ProgramFilters,
} from './program-filter';
import { searchInstitution, searchProgram } from './search.spec-helper';
import { claim, profileFixture, requirement } from '../../core/services/eligibility.spec-helper';

describe('Program search filtering and ranking', () => {
  const now = '2026-09-08T00:00:00Z';
  it.each([
    [{ q: 'SYNTHETIC' }, true],
    [{ q: 'not present' }, false],
    [{ country: 'fixture-country' }, true],
    [{ country: 'different' }, false],
    [{ city: 'different' }, false],
    [{ degree: 'fixture-reference' }, true],
    [{ degree: 'different' }, false],
    [{ subject: 'fixture-reference' }, true],
    [{ subject: 'different' }, false],
    [{ min: '100', max: '100', currency: 'USD' }, true],
    [{ min: '101', currency: 'USD' }, false],
    [{ max: '99', currency: 'USD' }, false],
    [{ max: '100', currency: 'BDT' }, false],
    [{ intake: '2027-09' }, true],
    [{ intake: '2026-09' }, false],
    [{ language: 'ielts' }, true],
    [{ language: 'pte' }, false],
    [{ language: 'none' }, false],
    [{ language: 'required' }, true],
    [{ language: 'unknown' }, false],
    [{ scholarship: 'yes' }, true],
    [{ scholarship: 'no' }, false],
    [{ scholarship: 'unknown' }, false],
    [{ institutionType: 'public' }, true],
    [{ institutionType: 'private' }, false],
  ] satisfies [Partial<ProgramFilters>, boolean][])('applies filter %j', (filter, expected) => {
    expect(
      filterProgram(searchProgram(), searchInstitution(), { ...emptyFilters(), ...filter }),
    ).toBe(expected);
  });
  it.each([
    { min: '-1' },
    { max: 'NaN' },
    { min: '10', max: '1', currency: 'USD' },
    { max: '100' },
    { intake: '2027-13' },
    { language: 'invented' },
    { scholarship: 'maybe' },
    { institutionType: 'invented' },
    { q: 'a'.repeat(101) },
  ])('rejects invalid filters %j', (patch) => {
    const filters = { ...emptyFilters(), ...patch };
    expect(validFilters(filters)).toBe(false);
    expect(filterProgram(searchProgram(), searchInstitution(), filters)).toBe(false);
  });
  it('restores supported query parameters and ignores unrelated parameters', () => {
    expect(
      parseFilters(
        convertToParamMap({ country: 'fixture-country', q: '  test  ', profile: 'private' }),
      ),
    ).toEqual({ ...emptyFilters(), country: 'fixture-country', q: 'test' });
  });
  it('handles zero, city matches, Bengali institution searches, and combined filters', () => {
    expect(
      filterProgram(
        {
          ...searchProgram(),
          cityId: 'fixture-city',
          tuition: claim({ amount: 0, currency: 'USD', period: 'annual' }),
        },
        searchInstitution(),
        { ...emptyFilters(), city: 'fixture-city', max: '0', currency: 'USD', q: 'পরীক্ষার' },
      ),
    ).toBe(true);
    expect(
      filterProgram(searchProgram(), searchInstitution(), {
        ...emptyFilters(),
        country: 'fixture-country',
        subject: 'different',
      }),
    ).toBe(false);
  });
  it('never treats unknown tuition, scholarships, or test requirements as known', () => {
    const program = {
      ...searchProgram(),
      tuition: claim(null),
      scholarshipAvailability: undefined,
      scholarships: claim({ en: 'Scholarships described without availability', bn: null }),
      requirements: { ...searchProgram().requirements, language: requirement(null) },
    };
    expect(
      filterProgram(program, searchInstitution(), { ...emptyFilters(), currency: 'USD' }),
    ).toBe(false);
    expect(
      filterProgram(program, searchInstitution(), { ...emptyFilters(), scholarship: 'yes' }),
    ).toBe(false);
    expect(
      filterProgram(program, searchInstitution(), {
        ...emptyFilters(),
        scholarship: 'unknown',
        language: 'unknown',
      }),
    ).toBe(true);
    expect(
      filterProgram(
        { ...program, requirements: { ...program.requirements, language: requirement([]) } },
        searchInstitution(),
        { ...emptyFilters(), language: 'none' },
      ),
    ).toBe(true);
  });
  it('does not convert nonannual tuition or confuse false scholarship availability with unknown', () => {
    expect(
      filterProgram(
        { ...searchProgram(), tuition: claim({ amount: 100, currency: 'USD', period: 'total' }) },
        searchInstitution(),
        { ...emptyFilters(), currency: 'USD' },
      ),
    ).toBe(false);
    expect(
      filterProgram(
        { ...searchProgram(), scholarshipAvailability: claim(false) },
        searchInstitution(),
        { ...emptyFilters(), scholarship: 'no' },
      ),
    ).toBe(true);
  });
  it('hides draft, archived, sample, and orphaned listings', () => {
    for (const program of [
      { ...searchProgram(), publicationStatus: 'draft' as const },
      { ...searchProgram(), publicationStatus: 'archived' as const },
      { ...searchProgram(), isDevelopmentSample: true },
      { ...searchProgram(), institutionId: 'missing' },
    ]) {
      expect(searchPrograms([program], [searchInstitution()], emptyFilters(), null, now)).toEqual(
        [],
      );
    }
    expect(
      searchPrograms(
        [searchProgram()],
        [{ ...searchInstitution(), isDevelopmentSample: true }],
        emptyFilters(),
        null,
        now,
      ),
    ).toEqual([]);
  });
  it('ranks by transparent classification and retains mandatory failures', () => {
    const passing = { ...searchProgram(), id: 'passing' };
    const failing = {
      ...searchProgram(),
      id: 'failing',
      requirements: {
        ...searchProgram().requirements,
        educationLevelIds: requirement(['different']),
      },
    };
    const possible = {
      ...searchProgram(),
      id: 'possible',
      requirements: { ...searchProgram().requirements, gpa: requirement(null) },
    };
    const action = {
      ...searchProgram(),
      id: 'action',
      tuition: claim({ amount: 101, currency: 'USD', period: 'annual' as const }),
    };
    const result = searchPrograms(
      [failing, action, possible, passing],
      [searchInstitution()],
      emptyFilters(),
      profileFixture(),
      now,
    );
    expect(result.map((item) => item.program.id)).toEqual([
      'passing',
      'possible',
      'action',
      'failing',
    ]);
    expect(result[3].eligibility?.mandatoryFailures).toEqual(['education']);
  });
  it('supports browsing without an assessment and stable name/ID ordering', () => {
    const programs = [
      { ...searchProgram(), id: 'z' },
      { ...searchProgram(), id: 'a' },
    ];
    const result = searchPrograms(programs, [searchInstitution()], emptyFilters(), null, now);
    expect(result.map((item) => item.program.id)).toEqual(['a', 'z']);
    expect(result.every((item) => item.eligibility === null)).toBe(true);
    expect(programs[0].id).toBe('z');
  });
});
