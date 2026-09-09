import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { JobSeeker } from './job-seeker';
import { JOB_DRAFT_KEY, JobStorage } from './job-storage';
import { LanguageService } from '../../core/i18n/language.service';
describe('Job-seeker journey', () => {
  beforeEach(() => {
    sessionStorage.removeItem(JOB_DRAFT_KEY);
    TestBed.configureTestingModule({
      imports: [JobSeeker],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  afterEach(() => sessionStorage.removeItem(JOB_DRAFT_KEY));
  async function create() {
    const fixture = TestBed.createComponent(JobSeeker);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }
  it('submits the form from the aligned footer and retains validation', async () => {
    const fixture = await create();
    const element = fixture.nativeElement as HTMLElement;
    const next = element.querySelector<HTMLButtonElement>(
      '.assessment-footer button[type="submit"]',
    )!;
    expect(next.form).toBe(element.querySelector('form'));
    next.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.step()).toBe(0);
    expect(element.querySelector('[aria-invalid="true"]')).not.toBeNull();
  });
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
      'Assessment result',
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
  it('shows the result heading and save popup without profile summary cards', async () => {
    const fixture = await create();
    fixture.componentInstance.form.patchValue({education: 'Diploma', desiredRoles: 'Cook', countries: 'Canada'});
    fixture.componentInstance.finish(); fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Assessment result');
    expect(element.querySelector('.profile-summary')).toBeNull();
    expect(element.querySelector('.consultancy')).toBeNull();
    expect(element.querySelector('.results-heading button')?.textContent).toContain('Save');
    expect(element.querySelector('dialog')).not.toBeNull();
    TestBed.inject(LanguageService).setLanguage('bn'); fixture.detectChanges();
    expect(element.querySelector('h1')?.textContent).not.toContain('Assessment result');
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
    expect((fixture.nativeElement as HTMLElement).querySelector('.missing-fields')).toBeNull();
  });
});
