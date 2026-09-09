import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WorkGuideRepository } from '../../core/repositories/work-guide.repository';
import { decodeWorkGuides, selectWorkGuides } from '../../core/models/work-guide';
import { WorkResults } from './work-results';
import { LanguageService } from '../../core/i18n/language.service';
import data from '../../../../public/data/work-guides.json';

describe('Work destination guides', () => {
  it('validates the actual three-country dataset and keeps research status explicit', () => {
    const catalog = decodeWorkGuides(data);
    expect(catalog.data.map((g) => g.countryCode)).toEqual(['GB', 'DE', 'CA']);
    for (const guide of catalog.data) {
      expect(guide.verificationStatus).toBe('needsReview');
      expect(guide.steps).toHaveLength(3);
      expect(guide.steps.every((s) => !!s.text.bn)).toBe(true);
    }
  });
  it('uses exact country aliases, preserves unmatched preferences and supports explicit overrides', () => {
    const guides = decodeWorkGuides(data).data;
    expect(selectWorkGuides(guides, '', ['uk', 'জার্মানি'])).toHaveLength(2);
    expect(selectWorkGuides(guides, '', ['Australia'])).toEqual([]);
    expect(selectWorkGuides(guides, '', ['Can'])).toEqual([]);
    expect(selectWorkGuides(guides, '', null)).toHaveLength(3);
    expect(selectWorkGuides(guides, 'all', ['Australia'])).toHaveLength(3);
    expect(selectWorkGuides(guides, 'CA', ['UK'])[0].countryCode).toBe('CA');
  });
  it.each([
    { countryCode: 'invalid' },
    { jobSourceId: 'missing' },
    { steps: [] },
    {
      sources: [
        {
          id: 'jobs',
          title: 'Invalid URL',
          url: 'javascript:alert(1)',
          checkedAt: '2026-09-09T00:00:00Z',
        },
      ],
    },
    { lastCheckedAt: null },
    { verificationStatus: 'verified' },
  ])('rejects unsafe or incomplete guide contracts %j', (changes) => {
    expect(() =>
      decodeWorkGuides({ ...data, data: [{ ...data.data[0], ...changes }, ...data.data.slice(1)] }),
    ).toThrow();
  });
  it('rejects duplicate countries and inconsistent envelopes', () => {
    expect(() =>
      decodeWorkGuides({ ...data, data: [data.data[0], data.data[0], data.data[2]] }),
    ).toThrow();
    expect(() =>
      decodeWorkGuides({ ...data, pagination: { ...data.pagination, totalItems: 9 } }),
    ).toThrow();
  });
  it('loads through the repository and presents retry, filtering and Bengali states', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const http = TestBed.inject(HttpTestingController);
    expect(TestBed.inject(WorkGuideRepository)).toBeTruthy();
    const fixture = TestBed.createComponent(WorkResults);
    fixture.componentRef.setInput('preferences', ['Canada']);
    fixture.detectChanges();
    expect(fixture.componentInstance.loading()).toBe(true);
    http
      .expectOne('data/work-guides.json')
      .flush('unavailable', { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('button')!.click();
    http.expectOne('data/work-guides.json').flush(data);
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(1);
    expect(root.querySelector('h3')?.textContent).toBe('Canada');
    expect(root.querySelector('a')?.href).toContain('jobbank.gc.ca');
    const select = root.querySelector('select')!;
    select.value = 'all';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(root.querySelectorAll('article')).toHaveLength(3);
    select.value = 'DE';
    select.dispatchEvent(new Event('change'));
    TestBed.inject(LanguageService).setLanguage('bn');
    fixture.detectChanges();
    expect(root.querySelector('h3')?.textContent).toBe('জার্মানি');
    expect(fixture.componentInstance.preferences()).toEqual(['Canada']);
    http.verify();
  });
});
