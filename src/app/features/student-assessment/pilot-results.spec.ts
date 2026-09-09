import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { validateCatalog } from '../../core/models/catalog-validation';
import { shippedCatalog } from '../../core/models/sample-catalog.spec-helper';
import { profileFixture, requirement } from '../../core/services/eligibility.spec-helper';
import {
  CountryRepository,
  InstitutionRepository,
  ProgramRepository,
} from '../../core/repositories/repositories';
import { LanguageService } from '../../core/i18n/language.service';
import { PilotResults } from './pilot-results';
import { evaluatePilot, selectPilotPrograms } from './pilot-results.logic';

const catalog = validateCatalog(shippedCatalog);
const programs = catalog.programs.data;
const profile = {
  ...profileFixture(),
  nationality: { id: 'country-bd', reportedLabel: null },
  destination: { id: 'country-nl', reportedLabel: null },
  degree: { id: 'degree-master', reportedLabel: null },
  annualTuitionBudget: { amount: 25000, currency: 'EUR' },
};
const program = programs.find((p) => p.tuition.value?.amount === 22320)!;
const at = '2026-09-09T00:00:00Z';

describe('Official-source student pilot', () => {
  it('validates all ten real draft records and their relationships', () => {
    expect(programs).toHaveLength(10);
    expect(new Set(programs.map((p) => p.countryId)).size).toBe(3);
    for (const p of programs) {
      expect(p.publicationStatus).toBe('draft');
      expect(p.isDevelopmentSample).toBe(true);
      expect(p.verificationStatus).toBe('needsReview');
      expect(p.sources.length).toBeGreaterThan(0);
      expect(p.research?.academic.value?.bn).toBeTruthy();
      expect(p.requirements.gpa.value).toBeNull();
      expect(p.requirements.language.value).toBeNull();
    }
  });
  it('narrows by explicit IDs and allows viewing the whole pilot', () => {
    expect(selectPilotPrograms(programs, profile)).toHaveLength(4);
    expect(selectPilotPrograms(programs, profile, true)).toHaveLength(10);
    expect(
      selectPilotPrograms(programs, {
        ...profile,
        destination: { id: 'missing', reportedLabel: null },
      }),
    ).toEqual([]);
    expect(
      selectPilotPrograms(programs, {
        ...profile,
        destination: { id: null, reportedLabel: 'Canada' },
        degree: { id: null, reportedLabel: 'Bachelor' },
      }),
    ).toHaveLength(10);
  });
  it.each([
    [22320, 'met'],
    [22319, 'notMet'],
    [25000, 'met'],
  ] as const)('compares sourced annual tuition at budget %s', (amount, status) => {
    const result = evaluatePilot(
      program,
      { ...profile, annualTuitionBudget: { amount, currency: 'EUR' } },
      catalog.countries.data,
      at,
    );
    expect(result.requirements.find((r) => r.rule === 'tuitionBudget')?.status).toBe(status);
    expect(
      result.requirements
        .filter((r) => r.rule !== 'tuitionBudget')
        .every((r) => r.status === 'unknown'),
    ).toBe(true);
  });
  it.each([
    { preferredIntake: '2026-09' },
    { preferredIntake: '2027-02' },
    { nationality: { id: null, reportedLabel: 'Bangladesh' } },
    { annualTuitionBudget: { amount: 25000, currency: 'USD' } },
  ])('does not infer fee applicability %j', (changes) => {
    expect(
      evaluatePilot(
        program,
        { ...profile, ...changes },
        catalog.countries.data,
        at,
      ).requirements.find((r) => r.rule === 'tuitionBudget')?.status,
    ).toBe('unknown');
  });
  it('preserves mandatory failures when tuition is not comparable', () => {
    const modified = {
      ...program,
      requirements: { ...program.requirements, minimumWorkExperienceMonths: requirement(100) },
    };
    expect(
      evaluatePilot(
        modified,
        { ...profile, preferredIntake: '2026-09' },
        catalog.countries.data,
        at,
      ).classification,
    ).toBe('currentlyNotEligible');
  });
  it('rejects invalid research kind and broken evidence references', () => {
    for (const research of [
      { ...program.research, kind: 'verified' },
      {
        ...program.research,
        academic: { value: { en: 'Claim', bn: null }, sourceIds: ['missing-source'] },
      },
    ]) {
      expect(() =>
        validateCatalog({
          ...shippedCatalog,
          programs: {
            ...shippedCatalog.programs,
            data: programs.map((p) => (p.id === program.id ? { ...p, research } : p)),
          },
        }),
      ).toThrow();
    }
  });
  it('renders sources, language changes, country selection, and retry', () => {
    const list = vi.fn().mockReturnValue(of(catalog.programs));
    TestBed.configureTestingModule({
      providers: [
        { provide: ProgramRepository, useValue: { list } },
        { provide: InstitutionRepository, useValue: { list: () => of(catalog.institutions) } },
        { provide: CountryRepository, useValue: { list: () => of(catalog.countries) } },
      ],
    });
    const fixture = TestBed.createComponent(PilotResults);
    fixture.componentRef.setInput('profile', profile);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('article')).toHaveLength(4);
    expect(root.querySelector('a')?.getAttribute('href')).toMatch(/^https:\/\//);
    const country = root.querySelector<HTMLSelectElement>('#result-country')!;
    expect(country.selectedOptions[0].textContent).toBe('Netherlands');
    expect(
      Array.from(country.options).filter((option) => option.textContent === 'Netherlands'),
    ).toHaveLength(1);
    country.value = 'country-gb';
    country.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.profile()).toEqual(profile);
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(3);
    country.value = 'country-ca';
    country.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(0);
    expect(root.textContent).toContain('No pilot programs cover');
    country.value = '';
    country.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(4);
    country.value = 'country-gb';
    country.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    TestBed.inject(LanguageService).setLanguage('bn');
    fixture.detectChanges();
    expect(root.textContent).toContain('অজানা');
    list.mockReturnValue(throwError(() => new Error('network')));
    fixture.componentInstance.load();
    fixture.detectChanges();
    expect(root.querySelector('[role="alert"]')).not.toBeNull();
    list.mockReturnValue(of(catalog.programs));
    root.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(3);
  });
});
