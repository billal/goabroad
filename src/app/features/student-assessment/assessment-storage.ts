import { Injectable, signal } from '@angular/core';
import { AssessmentDraft, fieldNames } from './assessment-form';

export const DRAFT_KEY = 'go-abroad.assessment.v1';
export const DRAFT_TTL = 24 * 60 * 60 * 1000;
export interface SavedAssessment {
  readonly version: 1;
  readonly expiresAt: number;
  readonly step: number;
  readonly answers: AssessmentDraft;
}
/** Validates only serialized draft shape; business validation runs again after restoring. */
export function parseDraft(raw: string, now: number): SavedAssessment | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const data = value as Record<string, unknown>;
    if (
      data['version'] !== 1 ||
      typeof data['expiresAt'] !== 'number' ||
      !Number.isFinite(data['expiresAt']) ||
      data['expiresAt'] <= now ||
      data['expiresAt'] > now + DRAFT_TTL ||
      !Number.isInteger(data['step']) ||
      Number(data['step']) < 0 ||
      Number(data['step']) > 4
    )
      return null;
    const answers = data['answers'];
    if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return null;
    const record = answers as Record<string, unknown>;
    if (
      Object.keys(record).length !== fieldNames.length ||
      fieldNames.some(
        (field) => typeof record[field] !== 'string' || (record[field] as string).length > 500,
      )
    )
      return null;
    return {
      version: 1,
      expiresAt: data['expiresAt'],
      step: Number(data['step']),
      answers: Object.fromEntries(
        fieldNames.map((field) => [field, record[field]]),
      ) as AssessmentDraft,
    };
  } catch {
    return null;
  }
}
@Injectable({ providedIn: 'root' })
export class AssessmentStorage {
  readonly unavailable = signal(false);
  private memory: SavedAssessment | null = null;
  load(): SavedAssessment | null {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const result = parseDraft(raw, Date.now());
        if (result) {
          this.memory = result;
          return result;
        }
        this.memory = null;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    } catch {
      this.unavailable.set(true);
    }
    if (this.memory && this.memory.expiresAt <= Date.now()) this.memory = null;
    return this.memory;
  }
  save(answers: AssessmentDraft, step: number): void {
    this.memory = { version: 1, expiresAt: Date.now() + DRAFT_TTL, step, answers: { ...answers } };
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(this.memory));
    } catch {
      this.unavailable.set(true);
    }
  }
  clear(): void {
    this.memory = null;
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {
      this.unavailable.set(true);
    }
  }
}
