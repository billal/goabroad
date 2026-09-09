import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { WorkGuideRepository } from '../../core/repositories/work-guide.repository';
import { selectWorkGuides, WorkGuide } from '../../core/models/work-guide';
import { LocalizedText } from '../../core/models/catalog';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon } from '../../shared/components/icon';

const copy = {
  title: ['Explore work destinations', 'কাজের গন্তব্য দেখুন'],
  intro: [
    'Choose a country to see how to find jobs and where to start a work-visa application. These guides do not assess your eligibility or show live vacancies.',
    'চাকরি খোঁজা ও কর্মভিসার আবেদন শুরুর নির্দেশনা দেখতে দেশ বাছুন। এগুলো আপনার যোগ্যতা যাচাই বা সরাসরি চাকরির বিজ্ঞপ্তি প্রদর্শন করে না।',
  ],
  country: ['Country of interest', 'আগ্রহের দেশ'],
  preferred: ['My preferred countries', 'আমার পছন্দের দেশগুলো'],
  all: ['All available countries', 'সব উপলব্ধ দেশ'],
  count: ['Country guides', 'দেশের নির্দেশিকা'],
  review: ['Research draft · needs review', 'গবেষণার খসড়া · পর্যালোচনা প্রয়োজন'],
  steps: ['How to apply', 'যেভাবে আবেদন করবেন'],
  jobs: ['Find jobs on the official portal', 'সরকারি পোর্টালে চাকরি খুঁজুন'],
  visa: ['Official work-visa guide', 'কর্মভিসার সরকারি নির্দেশিকা'],
  source: ['Source', 'উৎস'],
  checked: ['Last checked', 'সর্বশেষ পরীক্ষা'],
  empty: [
    'No guide covers your selected countries yet. Choose another country or view all available guides. This is not an eligibility decision.',
    'আপনার বাছাই করা দেশের নির্দেশিকা এখনো নেই। অন্য দেশ বা সব নির্দেশিকা বাছুন। এটি যোগ্যতার সিদ্ধান্ত নয়।',
  ],
  disclaimer: [
    'These are introductory guides for selected routes, not a complete visa checklist. Confirm current rules, fees and documents with the official authority before applying. Employment and visas are not guaranteed.',
    'এগুলো নির্দিষ্ট পথের প্রাথমিক নির্দেশনা, সম্পূর্ণ ভিসা তালিকা নয়। আবেদনের আগে সরকারি কর্তৃপক্ষের কাছে বর্তমান নিয়ম, ফি ও নথি নিশ্চিত করুন। চাকরি বা ভিসার নিশ্চয়তা নেই।',
  ],
} as const;
@Component({
  selector: 'app-work-results',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, Icon],
  templateUrl: './work-results.html',
  styleUrl: './work-results.scss',
})
export class WorkResults {
  readonly preferences = input<readonly string[] | null>(null);
  readonly i18n = inject(LanguageService);
  private readonly repository = inject(WorkGuideRepository);
  private readonly destroyRef = inject(DestroyRef);
  readonly guides = signal<readonly WorkGuide[]>([]);
  readonly loading = signal(true);
  readonly failed = signal(false);
  readonly country = new FormControl('', { nonNullable: true });
  readonly selection = toSignal(this.country.valueChanges, { initialValue: '' });
  readonly rows = computed(() =>
    selectWorkGuides(this.guides(), this.selection(), this.preferences()),
  );
  constructor() {
    effect(() => {
      const preferences = this.preferences();
      const guides = this.guides();
      if (!guides.length) return;
      const matched = selectWorkGuides(guides, '', preferences);
      this.country.setValue(preferences?.length === 1 && matched.length === 1 ? matched[0].countryCode : '');
    });
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.failed.set(false);
    this.guides.set([]);
    this.repository
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (r) => {
          this.guides.set(r.data);
          this.loading.set(false);
        },
        error: () => {
          this.failed.set(true);
          this.loading.set(false);
        },
      });
  }
  t(key: keyof typeof copy): string {
    return copy[key][this.i18n.language() === 'bn' ? 1 : 0];
  }
  name(value: LocalizedText): string {
    return this.i18n.language() === 'bn' ? (value.bn ?? value.en) : value.en;
  }
  source(guide: WorkGuide, id: string) {
    return guide.sources.find((s) => s.id === id)!;
  }
}
