import { Injectable, signal } from '@angular/core';
import { jobFields, JobDraft } from './job-form';
export const JOB_DRAFT_KEY = 'go-abroad.job-seeker.v1';
export const JOB_DRAFT_TTL = 24 * 60 * 60 * 1000;
export interface JobSavedDraft {
  readonly version: 1;
  readonly expiresAt: number;
  readonly step: number;
  readonly answers: JobDraft;
}
export function parseJobDraft(raw: string, now: number): JobSavedDraft | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    const expires = record['expiresAt'];
    const step = record['step'];
    const answers = record['answers'];
    if (
      record['version'] !== 1 ||
      typeof expires !== 'number' ||
      !Number.isFinite(expires) ||
      expires <= now ||
      expires > now + JOB_DRAFT_TTL ||
      typeof step !== 'number' ||
      !Number.isInteger(step) ||
      step < 0 ||
      step > 3 ||
      !answers ||
      typeof answers !== 'object' ||
      Array.isArray(answers)
    )
      return null;
    const fields = answers as Record<string, unknown>;
    if (
      Object.keys(fields).length !== jobFields.length ||
      jobFields.some(
        (field) => typeof fields[field] !== 'string' || (fields[field] as string).length > 500,
      )
    )
      return null;
    return {
      version: 1,
      expiresAt: expires,
      step,
      answers: Object.fromEntries(jobFields.map((field) => [field, fields[field]])) as JobDraft,
    };
  } catch {
    return null;
  }
}
@Injectable({ providedIn: 'root' })
export class JobStorage {
  readonly unavailable = signal(false);
  private memory: JobSavedDraft | null = null;
  load(): JobSavedDraft | null {
    try {
      const raw = sessionStorage.getItem(JOB_DRAFT_KEY);
      if (!this.unavailable()) this.memory = raw ? parseJobDraft(raw, Date.now()) : null;
      if (raw && !this.memory) sessionStorage.removeItem(JOB_DRAFT_KEY);
    } catch {
      this.unavailable.set(true);
    }
    if (this.memory && this.memory.expiresAt <= Date.now()) this.memory = null;
    return this.memory;
  }
  save(answers: JobDraft, step: number): void {
    this.memory = {
      version: 1,
      expiresAt: Date.now() + JOB_DRAFT_TTL,
      step,
      answers: { ...answers },
    };
    try {
      sessionStorage.setItem(JOB_DRAFT_KEY, JSON.stringify(this.memory));
    } catch {
      this.unavailable.set(true);
    }
  }
  clear(): void {
    this.memory = null;
    try {
      sessionStorage.removeItem(JOB_DRAFT_KEY);
    } catch {
      this.unavailable.set(true);
    }
  }
}
