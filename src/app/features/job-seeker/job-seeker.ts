import { Component, computed, ElementRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LanguageService } from '../../core/i18n/language.service';
import type { JobSeekerProfile } from '../../core/models/job-seeker-profile';
import {
  createJobForm,
  isRequired,
  JobField,
  jobProfile,
  jobSteps,
  validateJobForm,
} from './job-form';
import { JobStorage } from './job-storage';
import { jobText, JobTextKey } from './job-text';
import { JobSummaryRow, summarizeJobProfile } from './job-summary';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './job-seeker.html',
  styleUrl: './job-seeker.scss',
})
export class JobSeeker {
  readonly i18n = inject(LanguageService);
  readonly storage = inject(JobStorage);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly form = createJobForm();
  readonly step = signal(0);
  readonly attempted = signal(false);
  readonly restored = signal(false);
  readonly confirming = signal(false);
  readonly completed = signal<JobSeekerProfile | null>(null);
  readonly summary = computed(() => {
    const profile = this.completed();
    return profile ? summarizeJobProfile(profile) : [];
  });
  readonly missing = computed(() => this.summary().filter((row) => row.missing));
  readonly steps = jobSteps;
  readonly titles = ['educationStep', 'experienceStep', 'preferencesStep', 'review'] as const;
  readonly hints = ['educationHint', 'experienceHint', 'preferencesHint'] as const;
  constructor() {
    const draft = this.storage.load();
    if (draft) {
      this.form.setValue(draft.answers);
      this.step.set(draft.step);
      this.restored.set(true);
    }
    validateJobForm(this.form);
    const invalid = this.firstInvalid();
    if (invalid >= 0 && invalid < this.step()) this.step.set(invalid);
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      validateJobForm(this.form);
      this.storage.save(this.form.getRawValue(), this.step());
    });
  }
  t(key: JobTextKey): string {
    return jobText[key][this.i18n.language() === 'bn' ? 1 : 0];
  }
  summaryValue(row: JobSummaryRow): string {
    if (row.notApplicable) return this.t('noExperienceRoles');
    if (row.missing) return this.t('unknown');
    if (typeof row.value === 'number')
      return new Intl.NumberFormat(this.i18n.language()).format(row.value);
    return typeof row.value === 'string' ? row.value : (row.value?.join(', ') ?? this.t('unknown'));
  }
  editSummary(field: JobField): void {
    const step = this.steps.findIndex((fields) => fields.includes(field));
    this.completed.set(null);
    this.restored.set(false);
    this.confirming.set(false);
    this.go(step);
  }
  required(field: JobField): boolean {
    return isRequired(field, this.form.getRawValue());
  }
  error(field: JobField): string | null {
    const control = this.form.controls[field];
    if (!control.errors || (!control.touched && !this.attempted())) return null;
    return this.t(
      control.hasError('required')
        ? 'required'
        : control.hasError('months')
          ? 'months'
          : control.hasError('list')
            ? 'list'
            : 'maxlength',
    );
  }
  private firstInvalid(): number {
    return this.steps.findIndex((fields) =>
      fields.some((field) => this.form.controls[field].invalid),
    );
  }
  private focus(selector = '[data-step-heading]'): void {
    setTimeout(() => this.element.nativeElement.querySelector<HTMLElement>(selector)?.focus(), 0);
  }
  go(step: number): void {
    this.step.set(step);
    this.attempted.set(false);
    this.storage.save(this.form.getRawValue(), step);
    this.focus();
  }
  next(): void {
    validateJobForm(this.form);
    this.attempted.set(true);
    if (this.steps[this.step()].some((field) => this.form.controls[field].invalid)) {
      this.focus('[aria-invalid="true"]');
      return;
    }
    this.go(this.step() + 1);
  }
  finish(): void {
    validateJobForm(this.form);
    const invalid = this.firstInvalid();
    if (invalid >= 0) {
      this.go(invalid);
      this.attempted.set(true);
      this.focus('[aria-invalid="true"]');
      return;
    }
    this.completed.set(jobProfile(this.form.getRawValue()));
    this.storage.clear();
    this.focus();
  }
  reset(): void {
    this.storage.clear();
    this.form.reset(undefined, { emitEvent: false });
    validateJobForm(this.form);
    this.step.set(0);
    this.completed.set(null);
    this.attempted.set(false);
    this.restored.set(false);
    this.confirming.set(false);
    this.focus();
  }
}
