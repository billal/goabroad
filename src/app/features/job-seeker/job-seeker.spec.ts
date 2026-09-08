import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JobSeeker } from './job-seeker';
import { JOB_DRAFT_KEY, JobStorage } from './job-storage';
import { LanguageService } from '../../core/i18n/language.service';
describe('Job-seeker journey', () => {
  beforeEach(() => {
    sessionStorage.removeItem(JOB_DRAFT_KEY);
    TestBed.configureTestingModule({ imports: [JobSeeker], providers: [provideRouter([])] });
  });
  afterEach(() => sessionStorage.removeItem(JOB_DRAFT_KEY));
  async function create() {
    const fixture = TestBed.createComponent(JobSeeker);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('validates, reviews, edits, and completes without leaving a draft', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.next();
    await fixture.whenStable();
    expect(page.step()).toBe(0);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[aria-invalid="true"]'),
    ).not.toBeNull();
    page.form.patchValue({
      education: 'Diploma',
      desiredRoles: 'Technician',
      experienceMonths: '12',
      experienceRoles: 'Technician',
      languages: 'Bangla',
    });
    page.next();
    page.next();
    page.next();
    fixture.detectChanges();
    expect(page.step()).toBe(3);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Diploma');
    page.go(0);
    page.form.controls.education.setValue('Technical diploma');
    page.next();
    page.next();
    page.next();
    page.finish();
    fixture.detectChanges();
    expect(page.completed()?.educationDescription).toBe('Technical diploma');
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Nothing has been submitted',
    );
  });
  it('restores the draft after recreation and preserves it when language changes', async () => {
    const first = await create();
    first.componentInstance.form.patchValue({ education: 'Diploma', skills: 'রান্না' });
    first.componentInstance.next();
    first.destroy();
    const second = await create();
    expect(second.componentInstance.step()).toBe(1);
    TestBed.inject(LanguageService).setLanguage('bn');
    second.detectChanges();
    expect((second.nativeElement as HTMLElement).textContent).toContain('অভিজ্ঞতা ও ভাষা');
    expect(second.componentInstance.form.controls.skills.value).toBe('রান্না');
  });
  it('revalidates restored review drafts and refuses invalid completion', async () => {
    const storage = TestBed.inject(JobStorage);
    const empty = (await create()).componentInstance.form.getRawValue();
    storage.save(empty, 3);
    const fixture = await create();
    expect(fixture.componentInstance.step()).toBe(0);
    fixture.componentInstance.go(3);
    fixture.componentInstance.finish();
    expect(fixture.componentInstance.completed()).toBeNull();
  });
  it('confirms clearing via the UI and resets only job answers', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.controls.education.setValue('Diploma');
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLButtonElement>('.reset button')!.click();
    fixture.detectChanges();
    expect(page.form.controls.education.value).toBe('Diploma');
    expect(element.textContent).toContain('Clear this job-seeker draft?');
    element.querySelector<HTMLButtonElement>('.reset button')!.click();
    fixture.detectChanges();
    expect(page.form.controls.education.value).toBe('');
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).toBeNull();
  });
  it('renders the completed profile and highlights only missing information', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.patchValue({
      education: 'Diploma',
      desiredRoles: 'Cook, Baker',
      experienceMonths: '0',
    });
    page.finish();
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('[data-summary-field]')).toHaveLength(8);
    expect(element.querySelector('[data-summary-field="education"]')?.textContent).toBe('Diploma');
    expect(element.querySelector('[data-summary-field="experienceMonths"]')?.textContent).toBe('0');
    expect(element.querySelector('[data-summary-field="experienceRoles"]')?.textContent).toContain(
      'Not applicable',
    );
    expect(element.querySelector('.missing-fields')?.textContent).not.toContain(
      'Total work experience',
    );
    expect(element.querySelector('.missing-fields')?.textContent).toContain('Languages');
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).toBeNull();
  });
  it('reopens a draft from the summary, revalidates edits, and replaces the completed snapshot', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.patchValue({ education: 'Diploma', desiredRoles: 'Cook' });
    page.finish();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    element
      .querySelector<HTMLButtonElement>(
        'button[aria-label="Add information: Languages you can use (comma-separated)"]',
      )!
      .click();
    fixture.detectChanges();
    expect(page.step()).toBe(1);
    expect(page.completed()).toBeNull();
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).not.toBeNull();
    page.form.patchValue({ languages: 'বাংলা, English', experienceMonths: '12' });
    page.finish();
    expect(page.completed()).toBeNull();
    expect(page.form.controls.experienceRoles.hasError('required')).toBe(true);
    page.form.controls.experienceRoles.setValue('Cook');
    page.finish();
    fixture.detectChanges();
    expect(page.completed()?.languageNames).toEqual(['বাংলা', 'English']);
    expect(element.querySelector('[data-summary-field="languages"]')?.textContent).toBe(
      'বাংলা, English',
    );
    expect(sessionStorage.getItem(JOB_DRAFT_KEY)).toBeNull();
  });
  it('localizes summary labels and numeric experience without translating supplied names', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.patchValue({
      education: 'Diploma',
      desiredRoles: 'Cook',
      experienceMonths: '১২',
      experienceRoles: 'Cook',
    });
    page.finish();
    TestBed.inject(LanguageService).setLanguage('bn');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('আপনার চাকরিপ্রার্থী প্রোফাইল');
    expect(element.querySelector('[data-summary-field="experienceMonths"]')?.textContent).toBe(
      '১২',
    );
    expect(element.querySelector('[data-summary-field="education"]')?.textContent).toBe('Diploma');
  });
  it('clears the summary on reset and does not restore completed profiles after recreation', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.patchValue({ education: 'Diploma', desiredRoles: 'Cook' });
    page.finish();
    page.reset();
    fixture.detectChanges();
    expect(page.summary()).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).querySelector('.profile-summary')).toBeNull();
    page.form.patchValue({ education: 'Diploma', desiredRoles: 'Cook' });
    page.finish();
    fixture.destroy();
    expect((await create()).componentInstance.completed()).toBeNull();
  });
  it('shows a neutral message when no fields are missing', async () => {
    const fixture = await create();
    const page = fixture.componentInstance;
    page.form.patchValue({
      education: 'Diploma',
      fieldOfStudy: 'Hospitality',
      skills: 'Cooking',
      experienceMonths: '0',
      languages: 'Bangla',
      desiredRoles: 'Cook',
      countries: 'Canada',
    });
    page.finish();
    fixture.detectChanges();
    expect(page.missing()).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'This does not establish job readiness',
    );
  });
});
