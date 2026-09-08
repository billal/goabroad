import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Provider } from '@angular/core';
import { catchError, forkJoin, map, Observable, shareReplay, throwError } from 'rxjs';
import * as M from '../models/catalog';
import { validateCatalog } from '../models/catalog-validation';
import { DataValidationError } from '../models/decoder';
import * as R from './repositories';

/** Fetch the small Phase 1 snapshot together so dangling relationships fail before exposure. */
@Injectable({ providedIn: 'root' })
export class JsonCatalog {
  private readonly http = inject(HttpClient);
  readonly snapshot: Observable<M.Catalog> = forkJoin({
    countries: this.http.get<unknown>('data/countries.json'),
    cities: this.http.get<unknown>('data/cities.json'),
    educationLevels: this.http.get<unknown>('data/education-levels.json'),
    degreeLevels: this.http.get<unknown>('data/degree-levels.json'),
    subjects: this.http.get<unknown>('data/subjects.json'),
    institutions: this.http.get<unknown>('data/institutions.json'),
    programs: this.http.get<unknown>('data/programs.json'),
    countryGuides: this.http.get<unknown>('data/country-guides.json'),
    visaGuides: this.http.get<unknown>('data/visa-guides.json'),
    agencies: this.http.get<unknown>('data/agencies.json'),
  }).pipe(
    map(validateCatalog),
    catchError((error: unknown) =>
      throwError(
        () =>
          new R.RepositoryError(
            error instanceof DataValidationError ? 'invalidData' : 'unavailable',
            error,
          ),
      ),
    ),
    // RxJS resets on errors, allowing a later subscription to retry the HTTP requests.
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}

abstract class JsonRepository<T extends M.CatalogRecord> extends R.ReadRepository<T> {
  private readonly catalog = inject(JsonCatalog);
  protected abstract select(catalog: M.Catalog): M.Collection<T>;
  override list(): Observable<M.Collection<T>> {
    return this.catalog.snapshot.pipe(map((catalog) => this.select(catalog)));
  }
  override getById(id: string): Observable<T | null> {
    return this.list().pipe(
      map((collection) => collection.data.find((item) => item.id === id) ?? null),
    );
  }
  override getBySlug(slug: string): Observable<T | null> {
    return this.list().pipe(
      map((collection) => collection.data.find((item) => item.slug === slug) ?? null),
    );
  }
}
@Injectable()
export class JsonCountryRepository extends JsonRepository<M.Country> {
  protected override select(c: M.Catalog) {
    return c.countries;
  }
}
@Injectable()
export class JsonCityRepository extends JsonRepository<M.City> {
  protected override select(c: M.Catalog) {
    return c.cities;
  }
}
@Injectable()
export class JsonEducationLevelRepository extends JsonRepository<M.EducationLevel> {
  protected override select(c: M.Catalog) {
    return c.educationLevels;
  }
}
@Injectable()
export class JsonDegreeLevelRepository extends JsonRepository<M.DegreeLevel> {
  protected override select(c: M.Catalog) {
    return c.degreeLevels;
  }
}
@Injectable()
export class JsonSubjectRepository extends JsonRepository<M.Subject> {
  protected override select(c: M.Catalog) {
    return c.subjects;
  }
}
@Injectable()
export class JsonInstitutionRepository extends JsonRepository<M.Institution> {
  protected override select(c: M.Catalog) {
    return c.institutions;
  }
}
@Injectable()
export class JsonProgramRepository extends JsonRepository<M.Program> {
  protected override select(c: M.Catalog) {
    return c.programs;
  }
}
@Injectable()
export class JsonCountryGuideRepository extends JsonRepository<M.CountryGuide> {
  protected override select(c: M.Catalog) {
    return c.countryGuides;
  }
}
@Injectable()
export class JsonVisaGuideRepository extends JsonRepository<M.VisaGuide> {
  protected override select(c: M.Catalog) {
    return c.visaGuides;
  }
}
@Injectable()
export class JsonAgencyRepository extends JsonRepository<M.Agency> {
  protected override select(c: M.Catalog) {
    return c.agencies;
  }
}

export function provideJsonRepositories(): Provider[] {
  return [
    { provide: R.CountryRepository, useClass: JsonCountryRepository },
    { provide: R.CityRepository, useClass: JsonCityRepository },
    { provide: R.EducationLevelRepository, useClass: JsonEducationLevelRepository },
    { provide: R.DegreeLevelRepository, useClass: JsonDegreeLevelRepository },
    { provide: R.SubjectRepository, useClass: JsonSubjectRepository },
    { provide: R.InstitutionRepository, useClass: JsonInstitutionRepository },
    { provide: R.ProgramRepository, useClass: JsonProgramRepository },
    { provide: R.CountryGuideRepository, useClass: JsonCountryGuideRepository },
    { provide: R.VisaGuideRepository, useClass: JsonVisaGuideRepository },
    { provide: R.AgencyRepository, useClass: JsonAgencyRepository },
  ];
}
