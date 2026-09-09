import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { Icon } from '../../shared/components/icon';
import { DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  CountryRepository,
  InstitutionRepository,
  ProgramRepository,
} from '../../core/repositories/repositories';
import type { Country, Institution, LocalizedText, Program } from '../../core/models/catalog';
import type { StudentProfile } from '../../core/models/student-profile';
import { LanguageService } from '../../core/i18n/language.service';
import { searchText, SearchTextKey } from '../program-search/search-text';
import { pilotText, PilotTextKey } from './pilot-results.text';
import { evaluatePilot, selectPilotPrograms } from './pilot-results.logic';

@Component({
  selector: 'app-pilot-results',
  standalone: true,
  imports: [DatePipe, Icon, ReactiveFormsModule],
  templateUrl: './pilot-results.html',
  styleUrl: './pilot-results.scss',
})
export class PilotResults {
  readonly profile = input.required<StudentProfile>();
  readonly i18n = inject(LanguageService);
  private readonly programs = inject(ProgramRepository);
  private readonly institutions = inject(InstitutionRepository);
  private readonly countries = inject(CountryRepository);
  private readonly destroyRef = inject(DestroyRef);
  readonly data = signal<{
    programs: readonly Program[];
    institutions: readonly Institution[];
    countries: readonly Country[];
    notice: LocalizedText | null;
  } | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly destination = new FormControl('', { nonNullable: true });
  readonly selectedDestination = toSignal(this.destination.valueChanges, { initialValue: '' });
  readonly submittedDestinationName = computed(() => {
    const id = this.profile().destination.id;
    return id ? this.country(id) : this.t('allCountries');
  });
  readonly destinationOptions = computed(() => {
    const data = this.data();
    return (
      data?.countries.filter((country) =>
        data.programs.some(
          (program) =>
            country.id !== this.profile().destination.id &&
            program.countryId === country.id &&
            program.research?.kind === 'official-source-pilot',
        ),
      ) ?? []
    );
  });
  readonly evaluatedAt = signal(new Date().toISOString());
  readonly rows = computed(() => {
    const data = this.data();
    return data
      ? selectPilotPrograms(data.programs, {
          ...this.profile(),
          destination: this.selectedDestination()
            ? { id: this.selectedDestination(), reportedLabel: null }
            : this.profile().destination,
        }).map((program) => ({
          program,
          result: evaluatePilot(program, this.profile(), data.countries, this.evaluatedAt()),
        }))
      : [];
  });
  readonly notes = ['academic', 'language', 'intake', 'fees'] as const;
  constructor() {
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.data.set(null);
    forkJoin({
      programs: this.programs.list(),
      institutions: this.institutions.list(),
      countries: this.countries.list(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.data.set({
            programs: r.programs.data,
            institutions: r.institutions.data,
            countries: r.countries.data,
            notice: r.programs.metadata.notice,
          });
          this.evaluatedAt.set(new Date().toISOString());
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }
  t(key: PilotTextKey): string {
    return pilotText[key][this.i18n.language() === 'bn' ? 1 : 0];
  }
  s(key: SearchTextKey): string {
    return searchText[key][this.i18n.language() === 'bn' ? 1 : 0];
  }
  name(value: LocalizedText | null | undefined): string {
    return value
      ? this.i18n.language() === 'bn'
        ? (value.bn ?? value.en)
        : value.en
      : this.s('unknown');
  }
  institution(id: string): string {
    return this.name(this.data()?.institutions.find((i) => i.id === id)?.name);
  }
  country(id: string): string {
    return this.name(this.data()?.countries.find((i) => i.id === id)?.name);
  }
  number(n: number): string {
    return new Intl.NumberFormat(this.i18n.language()).format(n);
  }
  money(p: Program): string {
    const m = p.tuition.value;
    return m ? `${this.number(m.amount)} ${m.currency} (${this.s(m.period)})` : this.s('unknown');
  }
}
