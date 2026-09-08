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
      ['programs', 'programs'],
      ['programs/example', 'program'],
      ['institutions/example', 'institution'],
      ['countries/example', 'country'],
      ['countries/example/visa', 'visa'],
      ['agencies', 'agencies'],
      ['agencies/example', 'agency'],
      ['compare', 'compare'],
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
      bn.program,
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
    await TestBed.inject(Router).navigateByUrl('/en/programs');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('.navigation a[aria-current="page"]')?.textContent).toContain(
      en.programs,
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
});
