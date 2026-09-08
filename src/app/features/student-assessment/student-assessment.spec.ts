import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StudentAssessment } from './student-assessment';
import {
  CountryRepository,
  EducationLevelRepository,
  DegreeLevelRepository,
  SubjectRepository,
} from '../../core/repositories/repositories';
import { validateCatalog } from '../../core/models/catalog-validation';
import { sampleCatalog } from '../../core/models/sample-catalog.spec-helper';
import { LanguageService } from '../../core/i18n/language.service';
import { DRAFT_KEY } from './assessment-storage';
import { validAnswers } from './assessment.spec-helper';
import { AssessmentSession } from '../../core/services/assessment-session';
import { profileFixture } from '../../core/services/eligibility.spec-helper';
describe('Student questionnaire', () => {
  const catalog = validateCatalog(sampleCatalog);
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [StudentAssessment],
      providers: [
        provideRouter([]),
        { provide: CountryRepository, useValue: { list: () => of(catalog.countries) } },
        {
          provide: EducationLevelRepository,
          useValue: { list: () => of(catalog.educationLevels) },
        },
        { provide: DegreeLevelRepository, useValue: { list: () => of(catalog.degreeLevels) } },
        { provide: SubjectRepository, useValue: { list: () => of(catalog.subjects) } },
      ],
    });
  });
  afterEach(() => sessionStorage.clear());
  async function create() {
    const fixture = TestBed.createComponent(StudentAssessment);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('validates next, reviews all steps, supports editing and clears storage on completion', async () => {
    const fixture = await create();
    const app = fixture.componentInstance;
    app.next();
    expect(app.step()).toBe(0);
    app.form.setValue(validAnswers());
    for (let i = 0; i < 4; i++) app.next();
    fixture.detectChanges();
    expect(app.step()).toBe(4);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('20000');
    app.go(1);
    expect(app.form.controls.gpa.value).toBe('3.5');
    app.go(4);
    app.finish();
    fixture.detectChanges();
    expect(app.completed()?.annualTuitionBudget.currency).toBe('USD');
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Your questionnaire is complete',
    );
    expect(TestBed.inject(AssessmentSession).profile()?.annualTuitionBudget.currency).toBe('USD');
    expect((fixture.nativeElement as HTMLElement).querySelector('a[href*="programs"]')).toBeNull();
  });
  it('resumes after recreation and preserves answers when the language changes', async () => {
    const fixture = await create();
    fixture.componentInstance.form.setValue(validAnswers());
    fixture.componentInstance.go(2);
    fixture.destroy();
    const resumed = await create();
    expect(resumed.componentInstance.step()).toBe(2);
    TestBed.inject(LanguageService).setLanguage('bn');
    resumed.detectChanges();
    expect(resumed.componentInstance.form.controls.gpa.value).toBe('3.5');
    expect((resumed.nativeElement as HTMLElement).textContent).toContain('ভাষা পরীক্ষা');
  });
  it('clears the draft and returns to empty controls on reset', async () => {
    const fixture = await create();
    fixture.componentInstance.form.setValue(validAnswers());
    fixture.componentInstance.reset();
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(fixture.componentInstance.form.controls.gpa.value).toBe('');
  });
  it('clears a previous completed profile when a new questionnaire is opened', async () => {
    TestBed.inject(AssessmentSession).set(profileFixture());
    await create();
    expect(TestBed.inject(AssessmentSession).profile()).toBeNull();
  });
  it('does not finish invalid answers even from review', async () => {
    const fixture = await create();
    fixture.componentInstance.go(4);
    fixture.componentInstance.finish();
    expect(fixture.componentInstance.completed()).toBeNull();
    expect(fixture.componentInstance.step()).toBe(0);
  });
  it('shows a recoverable reference loading error', async () => {
    const list = vi
      .fn()
      .mockReturnValueOnce(throwError(() => new Error('offline')))
      .mockReturnValue(of(catalog.countries));
    TestBed.overrideProvider(CountryRepository, { useValue: { list } });
    const fixture = await create();
    expect(fixture.componentInstance.loadError()).toBe(true);
    fixture.componentInstance.load();
    expect(fixture.componentInstance.loadError()).toBe(false);
  });
  it('allows manual answers with an empty country list', async () => {
    TestBed.overrideProvider(CountryRepository, {
      useValue: { list: () => of({ ...catalog.countries, data: [] }) },
    });
    const fixture = await create();
    expect(fixture.componentInstance.options('nationality')).toHaveLength(1);
    fixture.componentInstance.form.setValue(validAnswers());
    fixture.componentInstance.next();
    expect(fixture.componentInstance.step()).toBe(1);
  });
});
