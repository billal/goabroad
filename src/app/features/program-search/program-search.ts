import { Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import * as R from '../../core/repositories/repositories';
import type {
  CatalogRecord,
  City,
  Country,
  DegreeLevel,
  EducationLevel,
  Institution,
  LocalizedText,
  Program,
  Source,
  Subject,
} from '../../core/models/catalog';
import type { MatchingRule } from '../../core/models/eligibility';
import { AssessmentSession } from '../../core/services/assessment-session';
import { LanguageService } from '../../core/i18n/language.service';
import {
  emptyFilters,
  filterKeys,
  FilterKey,
  parseFilters,
  ProgramFilters,
  searchPrograms,
  validFilters,
} from './program-filter';
import { searchText, SearchTextKey } from './search-text';

interface SearchData {
  programs: readonly Program[];
  institutions: readonly Institution[];
  countries: readonly Country[];
  cities: readonly City[];
  degrees: readonly DegreeLevel[];
  subjects: readonly Subject[];
  education: readonly EducationLevel[];
  notice: LocalizedText | null;
}
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './program-search.html',
  styleUrl: './program-search.scss',
})
export class ProgramSearch {
  readonly i18n = inject(LanguageService);
  readonly session = inject(AssessmentSession);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly repositories = {
    programs: inject(R.ProgramRepository),
    institutions: inject(R.InstitutionRepository),
    countries: inject(R.CountryRepository),
    cities: inject(R.CityRepository),
    degrees: inject(R.DegreeLevelRepository),
    subjects: inject(R.SubjectRepository),
    education: inject(R.EducationLevelRepository),
  };
  readonly data = signal<SearchData | null>(null);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly invalid = signal(false);
  readonly filters = signal(emptyFilters());
  readonly keys = filterKeys;
  readonly form = new FormGroup(
    Object.fromEntries(
      filterKeys.map((key) => [key, new FormControl('', { nonNullable: true })]),
    ) as Record<FilterKey, FormControl<string>>,
  );
  readonly evaluatedAt = signal(new Date().toISOString());
  readonly results = computed(() => {
    const data = this.data();
    return data
      ? searchPrograms(
          data.programs,
          data.institutions,
          this.filters(),
          this.session.profile(),
          this.evaluatedAt(),
        )
      : [];
  });
  readonly available = computed(() => {
    const data = this.data();
    return data
      ? searchPrograms(data.programs, data.institutions, emptyFilters(), null, this.evaluatedAt())
          .length
      : 0;
  });
  readonly noEligible = computed(
    () =>
      this.session.profile() &&
      this.results().length > 0 &&
      !this.results().some(
        (result) => result.eligibility?.classification === 'eligibleBasedOnAvailableInformation',
      ),
  );
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const filters = parseFilters(params);
      this.filters.set(filters);
      this.form.setValue(filters, { emitEvent: false });
      this.invalid.set(!validFilters(filters));
    });
    this.load();
  }
  t(key: SearchTextKey): string {
    return searchText[key][this.i18n.language() === 'bn' ? 1 : 0];
  }
  name(value: LocalizedText): string {
    return this.i18n.language() === 'bn' ? (value.bn ?? value.en) : value.en;
  }
  load(): void {
    if (!this.loading()) this.loading.set(true);
    this.failed.set(false);
    forkJoin({
      programs: this.repositories.programs.list(),
      institutions: this.repositories.institutions.list(),
      countries: this.repositories.countries.list(),
      cities: this.repositories.cities.list(),
      degrees: this.repositories.degrees.list(),
      subjects: this.repositories.subjects.list(),
      education: this.repositories.education.list(),
    })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (value) => {
          this.data.set({
            programs: value.programs.data,
            institutions: value.institutions.data,
            countries: value.countries.data,
            cities: value.cities.data,
            degrees: value.degrees.data,
            subjects: value.subjects.data,
            education: value.education.data,
            notice: value.programs.metadata.notice,
          });
          this.evaluatedAt.set(new Date().toISOString());
          this.loading.set(false);
        },
        error: () => {
          this.data.set(null);
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
  async apply(): Promise<void> {
    const filters = Object.fromEntries(
      filterKeys.map((key) => [key, this.form.controls[key].value.trim()]),
    ) as ProgramFilters;
    this.invalid.set(!validFilters(filters));
    if (this.invalid()) {
      setTimeout(
        () => this.element.nativeElement.querySelector<HTMLElement>('#filter-error')?.focus(),
        0,
      );
      return;
    }
    await this.router.navigate([], {
      relativeTo: this.route,
      queryParams: Object.fromEntries(
        filterKeys.filter((key) => filters[key]).map((key) => [key, filters[key]]),
      ),
    });
    setTimeout(
      () => this.element.nativeElement.querySelector<HTMLElement>('#search-results')?.focus(),
      0,
    );
  }
  async clear(): Promise<void> {
    this.form.setValue(emptyFilters());
    await this.apply();
  }
  options(key: FilterKey): readonly { value: string; label: string }[] | null {
    const data = this.data();
    const references: Partial<Record<FilterKey, readonly CatalogRecord[]>> = {
      country: data?.countries ?? [],
      city: data?.cities ?? [],
      degree: data?.degrees ?? [],
      subject: data?.subjects ?? [],
    };
    let options: { value: string; label: string }[];
    const records = references[key];
    if (records) options = records.map((item) => ({ value: item.id, label: this.name(item.name) }));
    else if (key === 'language')
      options = ['none', 'required', 'ielts', 'toefl', 'pte', 'duolingo', 'other', 'unknown'].map(
        (value) => ({
          value,
          label: value in searchText ? this.t(value as SearchTextKey) : value.toUpperCase(),
        }),
      );
    else if (key === 'scholarship')
      options = ['yes', 'no', 'unknown'].map((value) => ({
        value,
        label: this.t(value as SearchTextKey),
      }));
    else if (key === 'institutionType')
      options = ['public', 'private', 'other', 'unknown'].map((value) => ({
        value,
        label: this.t(value as SearchTextKey),
      }));
    else return null;
    const selected = this.form.controls[key].value;
    if (selected && !options.some((item) => item.value === selected))
      options.push({ value: selected, label: this.t('unavailable') + ': ' + selected });
    return options;
  }
  reference(
    id: string | null,
    kind: 'countries' | 'cities' | 'degrees' | 'subjects' | 'education',
  ): string {
    const record = this.data()?.[kind].find((item) => item.id === id);
    return record ? this.name(record.name) : this.t('unknown');
  }
  sourceList(program: Program, ids: readonly string[]): readonly Source[] {
    return program.sources.filter((source) => ids.includes(source.id));
  }
  money(program: Program): string {
    const value = program.tuition.value;
    return value
      ? `${value.amount} ${value.currency} (${this.t(value.period)})`
      : this.t('unknown');
  }
  scholarship(program: Program): string {
    const value = program.scholarshipAvailability?.value;
    return this.t(value == null ? 'unknown' : value ? 'yes' : 'no');
  }
  requirement(program: Program, rule: MatchingRule): string {
    const r = program.requirements;
    const unknown = this.t('unknown');
    if (rule === 'education' || rule === 'academicBackground') {
      const value = rule === 'education' ? r.educationLevelIds.value : r.academicSubjectIds.value;
      return value === null
        ? unknown
        : value.length
          ? value
              .map((id) => this.reference(id, rule === 'education' ? 'education' : 'subjects'))
              .join(', ')
          : this.t('noAccepted');
    }
    if (rule === 'gpa') {
      const value = r.gpa.value;
      return value
        ? `${this.t('minimum')} ${value.minimum} / ${value.scale}${value.qualificationId ? ' · ' + this.reference(value.qualificationId, 'education') : ''}`
        : unknown;
    }
    if (rule === 'studyGap')
      return r.maximumStudyGapYears.value === null
        ? unknown
        : `${this.t('maximum')} ${r.maximumStudyGapYears.value} ${this.t('years')}`;
    if (rule === 'workExperience')
      return r.minimumWorkExperienceMonths.value === null
        ? unknown
        : `${this.t('minimum')} ${r.minimumWorkExperienceMonths.value} ${this.t('months')}`;
    if (rule === 'tuitionBudget') return this.money(program);
    if (rule === 'intake')
      return program.intakes.value === null
        ? unknown
        : program.intakes.value
            .map(
              (item) =>
                `${this.name(item.label)} · ${this.t('starts')}: ${item.startsAt ?? unknown} · ${this.t('deadline')}: ${item.deadline ?? unknown}`,
            )
            .join('; ') || this.t('noAccepted');
    const languages = r.language.value;
    return languages === null
      ? unknown
      : languages.length === 0
        ? this.t('none')
        : languages
            .map((item) => {
              const parts = [
                ['overall', item.minimumOverall, item.overallScale],
                ['reading', item.minimumReading, item.componentScale],
                ['writing', item.minimumWriting, item.componentScale],
                ['listening', item.minimumListening, item.componentScale],
                ['speaking', item.minimumSpeaking, item.componentScale],
              ] as const;
              return (
                `${item.testName}: ` +
                parts
                  .map(
                    ([key, value, scale]) =>
                      `${this.t(key)} ${value ?? unknown} / ${scale ?? unknown}`,
                  )
                  .join(', ')
              );
            })
            .join('; ');
  }
}
