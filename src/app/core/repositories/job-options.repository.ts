import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import * as D from '../models/decoder';
export interface JobOption {
  readonly id: string;
  readonly en: string;
  readonly bn: string;
}
export interface JobOptions {
  readonly countries: readonly JobOption[];
  readonly education: readonly JobOption[];
  readonly fieldOfStudy: readonly JobOption[];
}
export function decodeJobOptions(value: unknown): JobOptions {
  const option = D.object<JobOption>({ id: D.id, en: D.text, bn: D.text });
  const result = D.object<JobOptions>({
    countries: D.array(option),
    education: D.array(option),
    fieldOfStudy: D.array(option),
  })(value, 'jobOptions');
  for (const options of [result.education, result.fieldOfStudy, result.countries]) {
    if (
      !options.length ||
      new Set(options.map((o) => o.id)).size !== options.length ||
      new Set(options.map((o) => o.en)).size !== options.length
    )
      D.fail('jobOptions', 'empty or duplicate options');
  }
  return result;
}
@Injectable({ providedIn: 'root', useFactory: () => inject(JsonJobOptionsRepository) })
export abstract class JobOptionsRepository {
  abstract load(): Observable<JobOptions>;
}
@Injectable({ providedIn: 'root' })
export class JsonJobOptionsRepository extends JobOptionsRepository {
  private readonly http = inject(HttpClient);
  load(): Observable<JobOptions> {
    return this.http.get<unknown>('data/job-options.json').pipe(map(decodeJobOptions));
  }
}
