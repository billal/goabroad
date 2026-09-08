import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import * as R from '../../core/repositories/repositories';
import { ProgramSearch } from './program-search';
import { searchInstitution, searchProgram } from './search.spec-helper';
import { sampleCatalog } from '../../core/models/sample-catalog.spec-helper';
import { validateCatalog } from '../../core/models/catalog-validation';
import { AssessmentSession } from '../../core/services/assessment-session';
import { profileFixture, requirement } from '../../core/services/eligibility.spec-helper';
import { LanguageService } from '../../core/i18n/language.service';
import { searchText } from './search-text';
import type { Collection, Program } from '../../core/models/catalog';

describe('Program search and eligibility presentation', () => {
  const catalog = validateCatalog(sampleCatalog);
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: ':lang/programs', component: ProgramSearch }]),
        {
          provide: R.ProgramRepository,
          useValue: { list: () => of({ ...catalog.programs, data: [searchProgram()] }) },
        },
        {
          provide: R.InstitutionRepository,
          useValue: { list: () => of({ ...catalog.institutions, data: [searchInstitution()] }) },
        },
        { provide: R.CountryRepository, useValue: { list: () => of(catalog.countries) } },
        { provide: R.CityRepository, useValue: { list: () => of(catalog.cities) } },
        { provide: R.DegreeLevelRepository, useValue: { list: () => of(catalog.degreeLevels) } },
        { provide: R.SubjectRepository, useValue: { list: () => of(catalog.subjects) } },
        {
          provide: R.EducationLevelRepository,
          useValue: { list: () => of(catalog.educationLevels) },
        },
      ],
    });
  });
  async function open(url = '/en/programs') {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(url, ProgramSearch);
    harness.detectChanges();
    return { harness, page, element: harness.routeNativeElement! };
  }
  it('browses without exposing eligibility and restores/applies filters in the URL', async () => {
    const { page, element, harness } = await open('/en/programs?q=Synthetic');
    expect(page.form.controls.q.value).toBe('Synthetic');
    expect(element.querySelectorAll('article')).toHaveLength(1);
    expect(element.textContent).toContain(searchText.noProfile[0]);
    expect(element.textContent).not.toContain(searchText.eligibleBasedOnAvailableInformation[0]);
    page.form.controls.country.setValue('different');
    await page.apply();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toContain('country=different');
    expect(element.textContent).toContain(searchText.noMatch[0]);
    await page.clear();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/en/programs');
    expect(page.results()).toHaveLength(1);
  });
  it('shows mandatory failures, every rule, verification metadata, sources, and disclaimer', async () => {
    const program = {
      ...searchProgram(),
      sources: [
        {
          id: 'fixture-source',
          title: 'Synthetic source only',
          url: 'https://example.com/test-only',
          checkedAt: null,
        },
      ],
      requirements: {
        ...searchProgram().requirements,
        educationLevelIds: { ...requirement(['different']), sourceIds: ['fixture-source'] },
      },
    };
    TestBed.overrideProvider(R.ProgramRepository, {
      useValue: { list: () => of({ ...catalog.programs, data: [program] }) },
    });
    TestBed.inject(AssessmentSession).set(profileFixture());
    const { page, element } = await open();
    expect(element.textContent).toContain(searchText.currentlyNotEligible[0]);
    expect(element.querySelector('.failure')?.textContent).toContain(searchText.education[0]);
    expect(element.querySelectorAll('.requirements li')).toHaveLength(8);
    expect(element.textContent).toContain(searchText.disclaimer[0]);
    expect(element.textContent).toContain(searchText.unverified[0]);
    expect(element.querySelector('a[href="https://example.com/test-only"]')).not.toBeNull();
    expect(page.noEligible()).toBe(true);
  });
  it('keeps filter/profile state across language navigation and supports removing answers', async () => {
    const session = TestBed.inject(AssessmentSession);
    session.set(profileFixture());
    const { harness, page } = await open('/en/programs?q=Synthetic');
    TestBed.inject(LanguageService).setLanguage('bn');
    await harness.navigateByUrl('/bn/programs?q=Synthetic');
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(searchText.disclaimer[1]);
    expect(page.form.controls.q.value).toBe('Synthetic');
    expect(session.profile()).not.toBeNull();
    session.clear();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(searchText.noProfile[1]);
  });
  it('distinguishes empty catalog and no match without fabricating listings', async () => {
    TestBed.overrideProvider(R.ProgramRepository, {
      useValue: { list: () => of(catalog.programs) },
    });
    const { element } = await open();
    expect(element.textContent).toContain(searchText.empty[0]);
    expect(element.querySelectorAll('article')).toHaveLength(0);
  });
  it('handles loading and a recoverable repository failure', async () => {
    const pending = new Subject<Collection<Program>>();
    const list = vi.fn().mockReturnValueOnce(pending).mockReturnValue(of(catalog.programs));
    TestBed.overrideProvider(R.ProgramRepository, { useValue: { list } });
    const { page, element, harness } = await open();
    expect(element.textContent).toContain(searchText.loading[0]);
    pending.error(new Error('offline'));
    harness.detectChanges();
    expect(element.textContent).toContain(searchText.error[0]);
    page.load();
    harness.detectChanges();
    expect(element.textContent).toContain(searchText.empty[0]);
  });
  it('does not treat malformed data errors as an empty catalog', async () => {
    TestBed.overrideProvider(R.ProgramRepository, {
      useValue: { list: () => throwError(() => new R.RepositoryError('invalidData', null)) },
    });
    expect((await open()).element.textContent).toContain(searchText.error[0]);
  });
  it('rejects malformed URL and form filters until corrected', async () => {
    const { page, harness, element } = await open('/en/programs?min=200&max=1&currency=USD');
    expect(page.invalid()).toBe(true);
    expect(page.results()).toHaveLength(0);
    await page.apply();
    harness.detectChanges();
    expect(element.querySelector('#filter-error')?.hasAttribute('hidden')).toBe(false);
    await page.clear();
    harness.detectChanges();
    expect(page.invalid()).toBe(false);
    expect(page.results()).toHaveLength(1);
  });
  it('focuses the newly displayed validation message after rendering', async () => {
    const { page, harness, element } = await open();
    const error = element.querySelector<HTMLElement>('#filter-error')!;
    const focus = vi.spyOn(error, 'focus');
    page.form.controls.min.setValue('-1');
    await page.apply();
    harness.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(error.hidden).toBe(false);
    expect(focus).toHaveBeenCalled();
  });
});
