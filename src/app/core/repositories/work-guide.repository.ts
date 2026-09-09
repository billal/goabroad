import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Collection } from '../models/catalog';
import { decodeWorkGuides, WorkGuide } from '../models/work-guide';

@Injectable({ providedIn: 'root', useFactory: () => inject(JsonWorkGuideRepository) })
export abstract class WorkGuideRepository {
  abstract list(): Observable<Collection<WorkGuide>>;
}
@Injectable({ providedIn: 'root' })
export class JsonWorkGuideRepository extends WorkGuideRepository {
  private readonly http = inject(HttpClient);
  list(): Observable<Collection<WorkGuide>> {
    return this.http.get<unknown>('data/work-guides.json').pipe(map(decodeWorkGuides));
  }
}
