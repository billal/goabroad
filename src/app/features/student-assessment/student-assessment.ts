import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { CatalogRecord } from '../../core/models/catalog';
import {
  CountryRepository,
  DegreeLevelRepository,
  EducationLevelRepository,
  SubjectRepository,
} from '../../core/repositories/repositories';
import { LanguageService } from '../../core/i18n/language.service';
import {
  configureValidation,
  createAssessmentForm,
  currencies,
  FieldName,
  numericFields,
  optionalFields,
  ReferenceChoices,
  steps,
  StudentProfile,
  tests,
  toProfile,
  visible,
} from './assessment-form';
import { AssessmentStorage } from './assessment-storage';
import { assessmentBengali, assessmentEnglish, labels } from './assessment-text';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './student-assessment.html',
  styleUrl: './student-assessment.scss',
})
export class StudentAssessment {
  readonly i18n = inject(LanguageService);
  readonly storage = inject(AssessmentStorage);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('stepHeading');
  private readonly countries = inject(CountryRepository);
  private readonly education = inject(EducationLevelRepository);
  private readonly degrees = inject(DegreeLevelRepository);
  private readonly subjects = inject(SubjectRepository);
  readonly text = computed(() =>
    this.i18n.language() === 'bn' ? assessmentBengali : assessmentEnglish,
  );
  readonly form = createAssessmentForm();
  readonly step = signal(0);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly resumed = signal(false);
  readonly attempted = signal(false);
  readonly confirmingReset = signal(false);
  readonly completed = signal<StudentProfile | null>(null);
  readonly revision = signal(0);
  readonly referenceOptions = signal<Partial<Record<FieldName, readonly CatalogRecord[]>>>({});
  readonly steps = steps;
  readonly fields = computed(() => {
    this.revision();
    return (steps[this.step()] ?? []).filter((field) => visible(field, this.form.getRawValue()));
  });
  constructor() {
    const saved = this.storage.load();
    if (saved) {
      this.form.setValue(saved.answers);
      this.step.set(saved.step);
      this.resumed.set(true);
    }
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.refresh();
      this.storage.save(this.form.getRawValue(), this.step());
    });
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.loadError.set(false);
    forkJoin({
      countries: this.countries.list(),
      education: this.education.list(),
      degrees: this.degrees.list(),
      subjects: this.subjects.list(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.referenceOptions.set({
            nationality: result.countries.data,
            residence: result.countries.data,
            destination: result.countries.data,
            education: result.education.data,
            degree: result.degrees.data,
            background: result.subjects.data,
          });
          this.loading.set(false);
          this.refresh();
          // Never resume beyond a step whose current reference choices or answers are invalid.
          const first = steps.findIndex((fields) =>
            fields.some(
              (field) =>
                visible(field, this.form.getRawValue()) && this.form.controls[field].invalid,
            ),
          );
          if (first >= 0 && first < this.step()) this.step.set(first);
        },
        error: () => {
          this.loading.set(false);
          this.loadError.set(true);
        },
      });
  }
  private refresh(): void {
    const choices: ReferenceChoices = {};
    for (const [field, items] of Object.entries(this.referenceOptions()))
      choices[field as FieldName] = items.map((item) => item.id);
    configureValidation(this.form, choices);
    this.revision.update((value) => value + 1);
  }
  label(field: FieldName): string {
    return labels[field][this.i18n.language() === 'bn' ? 1 : 0];
  }
  optional(field: FieldName): boolean {
    return (
      optionalFields.has(field) ||
      (field === 'componentScale' &&
        !['reading', 'writing', 'listening', 'speaking'].some((key) =>
          this.form.controls[key as FieldName].value.trim(),
        ))
    );
  }
  numeric(field: FieldName): boolean {
    return numericFields.has(field);
  }
  options(field: FieldName): readonly { value: string; label: string }[] | null {
    const records = this.referenceOptions()[field];
    if (records)
      return [
        ...records.map((item) => ({
          value: item.id,
          label: this.i18n.language() === 'bn' ? (item.name.bn ?? item.name.en) : item.name.en,
        })),
        { value: 'other', label: this.text().other },
      ];
    if (field === 'test')
      return tests.map((value) => ({
        value,
        label:
          value === 'none'
            ? this.text().none
            : value === 'other'
              ? this.text().other
              : value.toUpperCase(),
      }));
    if (field === 'resultKnown')
      return [
        { value: 'yes', label: this.text().yes },
        { value: 'unknown', label: this.text().unknown },
      ];
    if (field === 'scholarship')
      return [
        { value: 'yes', label: this.text().yes },
        { value: 'no', label: this.text().no },
      ];
    if (field === 'currency') return currencies.map((value) => ({ value, label: value }));
    return null;
  }
  error(field: FieldName): string | null {
    const control = this.form.controls[field];
    if (!control.errors || (!control.touched && !this.attempted())) return null;
    const e = control.errors,
      t = this.text();
    return e['required']
      ? t.required
      : e['scale']
        ? t.scale
        : e['gap']
          ? t.gap
          : e['choice']
            ? t.choice
            : e['intake']
              ? t.intakeError
              : e['list']
                ? t.listError
                : e['maxlength']
                  ? t.long
                  : t.number;
  }
  private focus(): void {
    setTimeout(() => this.heading()?.nativeElement.focus(), 0);
  }
  next(): void {
    if (this.loading() || this.loadError()) return;
    this.refresh();
    this.attempted.set(true);
    if (this.fields().some((field) => this.form.controls[field].invalid)) {
      for (const field of this.fields()) this.form.controls[field].markAsTouched();
      setTimeout(
        () =>
          this.element.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        0,
      );
      return;
    }
    this.step.update((value) => Math.min(value + 1, 4));
    this.attempted.set(false);
    this.storage.save(this.form.getRawValue(), this.step());
    this.focus();
  }
  go(step: number): void {
    this.step.set(step);
    this.attempted.set(false);
    this.storage.save(this.form.getRawValue(), step);
    this.focus();
  }
  reviewFields(step: number): readonly FieldName[] {
    return steps[step].filter((field) => visible(field, this.form.getRawValue()));
  }
  answer(field: FieldName): string {
    const value = this.form.controls[field].value;
    return (
      this.options(field)?.find((option) => option.value === value)?.label ??
      (value.trim() || this.text().notProvided)
    );
  }
  finish(): void {
    this.refresh();
    if (this.form.invalid) {
      const first = steps.findIndex((fields) =>
        fields.some((field) => this.form.controls[field].invalid),
      );
      this.go(Math.max(first, 0));
      this.attempted.set(true);
      return;
    }
    this.completed.set(toProfile(this.form.getRawValue()));
    this.storage.clear();
    this.focus();
  }
  reset(): void {
    this.storage.clear();
    this.form.reset(undefined, { emitEvent: false });
    this.completed.set(null);
    this.step.set(0);
    this.resumed.set(false);
    this.attempted.set(false);
    this.confirmingReset.set(false);
    this.refresh();
    this.focus();
  }
}
