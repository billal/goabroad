import { TestBed } from '@angular/core/testing';
import { Router, NavigationError, NavigationStart } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { App } from './app';
import { appConfig } from './app.config';
import { LanguageService } from './core/i18n/language.service';
import { bn, en } from './core/i18n/translations';
import { of } from 'rxjs';
import {
  CountryRepository,
  EducationLevelRepository,
  DegreeLevelRepository,
  SubjectRepository,
  ProgramRepository,
  InstitutionRepository,
  CityRepository,
} from './core/repositories/repositories';
import { validateCatalog } from './core/models/catalog-validation';
import { sampleCatalog } from './core/models/sample-catalog.spec-helper';

describe('Milestone 2 shell and routes', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        ...appConfig.providers,
        {
          provide: ProgramRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).programs) },
        },
        {
          provide: InstitutionRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).institutions) },
        },
        {
          provide: CityRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).cities) },
        },
        {
          provide: CountryRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).countries) },
        },
        {
          provide: EducationLevelRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).educationLevels) },
        },
        {
          provide: DegreeLevelRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).degreeLevels) },
        },
        {
          provide: SubjectRepository,
          useValue: { list: () => of(validateCatalog(sampleCatalog).subjects) },
        },
      ],
    }),
  );

  async function open(url: string) {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it.each([
    ['/', '/en'],
    ['/student?step=2#main-content', '/en/student?step=2#main-content'],
    [
      '/fr/programs/example?country=CA#main-content',
      '/en/programs/example?country=CA#main-content',
    ],
    ['/xx', '/en'],
    ['/en/missing', '/en/missing'],
  ])('normalizes %s to %s', async (input, expected) => {
    await open(input);
    expect(TestBed.inject(Router).url).toBe(expected);
  });

  it.each(['en', 'bn'])('renders every specified route in %s', async (lang) => {
    const fixture = await open('/' + lang);
    const router = TestBed.inject(Router);
    const cases = [
      ['', 'home'],
      ['student', 'student'],
      ['job-seeker', 'jobSeeker'],
      ['programs', 'notFound'],
      ['programs/example', 'notFound'],
      ['institutions/example', 'institution'],
      ['countries/example', 'country'],
      ['countries/example/visa', 'visa'],
      ['agencies', 'notFound'],
      ['agencies/example', 'notFound'],
      ['compare', 'notFound'],
    ] as const;
    const text = lang === 'bn' ? bn : en;
    for (const [path, key] of cases) {
      await router.navigateByUrl('/' + lang + (path ? '/' + path : ''));
      await fixture.whenStable();
      fixture.detectChanges();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector('h1')?.textContent).toContain(path ? text[key] : text.headline);
      expect(TestBed.inject(Title).getTitle()).toBe(text[key] + ' | Go Abroad');
      expect(document.documentElement.lang).toBe(lang);
    }
  });

  it('switches language while preserving details, query parameters and fragment', async () => {
    const fixture = await open('/en/programs/example?country=CA&subject=engineering#main-content');
    const router = TestBed.inject(Router);
    const language = TestBed.inject(LanguageService);
    await router.navigateByUrl(language.urlFor('bn'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/bn/programs/example?country=CA&subject=engineering#main-content');
    expect(language.text()).toBe(bn);
    expect((fixture.nativeElement as HTMLElement).querySelector('h1')?.textContent).toBe(
      bn.notFound,
    );
    await router.navigateByUrl(language.urlFor('en'));
    expect(language.text()).toBe(en);
  });

  it('renders localized not-found recovery and development metadata', async () => {
    const fixture = await open('/bn/not-a-page');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(bn.missingText);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });

  it('supports menu toggling, Escape recovery and navigation closure', async () => {
    const fixture = await open('/en');
    const element = fixture.nativeElement as HTMLElement;
    const button = element.querySelector<HTMLButtonElement>('.menu-toggle')!;
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await TestBed.inject(Router).navigateByUrl('/en/student');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.navigation a[aria-current="page"]')?.textContent).toContain(
      en.student,
    );
  });

  it('announces loading and navigation failures with retry', async () => {
    const fixture = await open('/en');
    const router = TestBed.inject(Router);
    const events = router.events as import('rxjs').Subject<import('@angular/router').Event>;
    events.next(new NavigationStart(100, '/en/programs'));
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="status"]')?.textContent,
    ).toContain(en.loading);
    events.next(new NavigationError(100, '/en/programs', new Error('Chunk unavailable')));
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain(en.navigationError);
    fixture.componentInstance.retry();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe('/en/programs');
    expect(fixture.componentInstance.failedUrl()).toBeNull();
  });

  it('has complete Bengali translations', () => {
    expect(Object.keys(bn).sort()).toEqual(Object.keys(en).sort());
    expect(Object.values(bn).every((value) => value.trim().length > 0)).toBe(true);
  });
  it.each(['en', 'bn'])('keeps redesigned homepage actions on the %s route', async (lang) => {
    const fixture = await open('/' + lang);
    const element = fixture.nativeElement as HTMLElement;
    const callsToAction = element.querySelectorAll<HTMLAnchorElement>('a[fragment="pathways"]');
    expect(callsToAction.length).toBe(2);
    for (const link of callsToAction) {
      expect(link.getAttribute('href')).toBe('/' + lang + '#pathways');
    }
    expect(element.querySelector('#pathways')).not.toBeNull();
    expect(element.querySelector('.path-card a')?.getAttribute('href')).toBe(
      '/' + lang + '/student',
    );
    expect(element.querySelector('.path-card.work a')?.getAttribute('href')).toBe(
      '/' + lang + '/job-seeker',
    );
    expect(element.querySelectorAll('h1').length).toBe(1);
  });
  it.each(['en', 'bn'])(
    'shows Home and both questionnaire links in %s navigation',
    async (lang) => {
      const fixture = await open('/' + lang);
      const element = fixture.nativeElement as HTMLElement;
      expect(
        Array.from(element.querySelectorAll('.navigation a')).map((link) =>
          link.getAttribute('href'),
        ),
      ).toEqual(['/' + lang, '/' + lang + '/student', '/' + lang + '/job-seeker']);
      expect(
        element.querySelector('a[href*="programs"], a[href*="agencies"], a[href*="compare"]'),
      ).toBeNull();
    },
  );
});
