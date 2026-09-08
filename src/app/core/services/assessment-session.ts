import { Injectable, signal } from '@angular/core';
import type { StudentProfile } from '../models/student-profile';

/** Completed answers are deliberately memory-only, never URL or browser storage data. */
@Injectable({ providedIn: 'root' })
export class AssessmentSession {
  private readonly current = signal<StudentProfile | null>(null);
  readonly profile = this.current.asReadonly();
  set(profile: StudentProfile): void {
    this.current.set(structuredClone(profile));
  }
  clear(): void {
    this.current.set(null);
  }
}
