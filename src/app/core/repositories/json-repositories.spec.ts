import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { sampleCatalog } from '../models/sample-catalog.spec-helper';
import { validateCatalog } from '../models/catalog-validation';
import { provideJsonRepositories } from './json-repositories';
import * as R from './repositories';

const files = {
  countries: 'countries',
  cities: 'cities',
  educationLevels: 'education-levels',
  degreeLevels: 'degree-levels',
  subjects: 'subjects',
  institutions: 'institutions',
  programs: 'programs',
  countryGuides: 'country-guides',
  visaGuides: 'visa-guides',
  agencies: 'agencies',
} as const;
describe('JSON repository providers', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ...provideJsonRepositories()],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function flush(invalid = false) {
    const http = TestBed.inject(HttpTestingController);
    for (const key of Object.keys(files) as (keyof typeof files)[]) {
      http
        .expectOne('data/' + files[key] + '.json')
        .flush(invalid && key === 'programs' ? { broken: true } : sampleCatalog[key]);
    }
  }
  it('loads, validates and shares a snapshot across all repository providers', async () => {
    const pending = [
      firstValueFrom(TestBed.inject(R.CountryRepository).list()),
      firstValueFrom(TestBed.inject(R.CityRepository).list()),
      firstValueFrom(TestBed.inject(R.EducationLevelRepository).list()),
      firstValueFrom(TestBed.inject(R.DegreeLevelRepository).list()),
      firstValueFrom(TestBed.inject(R.SubjectRepository).list()),
      firstValueFrom(TestBed.inject(R.InstitutionRepository).list()),
      firstValueFrom(TestBed.inject(R.ProgramRepository).list()),
      firstValueFrom(TestBed.inject(R.CountryGuideRepository).list()),
      firstValueFrom(TestBed.inject(R.VisaGuideRepository).list()),
      firstValueFrom(TestBed.inject(R.AgencyRepository).list()),
    ];
    flush();
    const result = await Promise.all(pending);
    expect(result.map((c) => c.data.length)).toEqual([1, 0, 2, 2, 2, 0, 0, 0, 0, 0]);
    const repository = TestBed.inject(R.CountryRepository);
    expect((await firstValueFrom(repository.getById('country-bd')))?.slug).toBe('country-bd');
    expect((await firstValueFrom(repository.getBySlug('country-bd')))?.id).toBe('country-bd');
    expect(await firstValueFrom(repository.getById('missing'))).toBeNull();
    expect(await firstValueFrom(repository.getBySlug('missing'))).toBeNull();
    TestBed.inject(HttpTestingController).expectNone('data/countries.json');
  });
  it('reports invalid data and retries on the next subscription', async () => {
    const repo = TestBed.inject(R.ProgramRepository);
    const failure = firstValueFrom(repo.list());
    const assertion = expect(failure).rejects.toMatchObject({ code: 'invalidData' });
    flush(true);
    await assertion;
    const retry = firstValueFrom(repo.list());
    flush();
    expect((await retry).data).toEqual([]);
  });
  it('reports HTTP failures without turning them into an empty success', async () => {
    const pending = firstValueFrom(TestBed.inject(R.CountryRepository).list());
    const assertion = expect(pending).rejects.toMatchObject({ code: 'unavailable' });
    const requests = TestBed.inject(HttpTestingController).match((request) =>
      request.url.startsWith('data/'),
    );
    requests[0].flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    await assertion;
  });
  it('permits replacement by a non-JSON implementation through DI', async () => {
    const countries = validateCatalog(sampleCatalog).countries;
    const replacement: R.CountryRepository = {
      list: () => of(countries),
      getById: () => of(null),
      getBySlug: () => of(null),
    };
    TestBed.overrideProvider(R.CountryRepository, { useValue: replacement });
    expect(await firstValueFrom(TestBed.inject(R.CountryRepository).list())).toBe(countries);
    TestBed.inject(HttpTestingController).expectNone((request) => request.url.startsWith('data/'));
  });
});
