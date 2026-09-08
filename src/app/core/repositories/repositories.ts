import { Observable } from 'rxjs';
import * as M from '../models/catalog';

/** Consumers inject these abstract classes; provider selection is the only storage-specific step. */
export abstract class ReadRepository<T extends M.CatalogRecord> {
  abstract list(): Observable<M.Collection<T>>;
  abstract getById(id: string): Observable<T | null>;
  abstract getBySlug(slug: string): Observable<T | null>;
}
export abstract class CountryRepository extends ReadRepository<M.Country> {}
export abstract class CityRepository extends ReadRepository<M.City> {}
export abstract class EducationLevelRepository extends ReadRepository<M.EducationLevel> {}
export abstract class DegreeLevelRepository extends ReadRepository<M.DegreeLevel> {}
export abstract class SubjectRepository extends ReadRepository<M.Subject> {}
export abstract class InstitutionRepository extends ReadRepository<M.Institution> {}
export abstract class ProgramRepository extends ReadRepository<M.Program> {}
export abstract class CountryGuideRepository extends ReadRepository<M.CountryGuide> {}
export abstract class VisaGuideRepository extends ReadRepository<M.VisaGuide> {}
export abstract class AgencyRepository extends ReadRepository<M.Agency> {}

export class RepositoryError extends Error {
  constructor(
    readonly code: 'unavailable' | 'invalidData',
    readonly originalError: unknown,
  ) {
    super(code);
    this.name = 'RepositoryError';
  }
}
