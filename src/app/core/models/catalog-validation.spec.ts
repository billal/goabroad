import { validateCatalog } from './catalog-validation';
import { sampleCatalog } from './sample-catalog.spec-helper';
import { DataValidationError, timestamp, url, number } from './decoder';

describe('Minimal catalog fixtures', () => {
  it('validates every sample file with consistent envelopes and relationships', () => {
    const catalog = validateCatalog(sampleCatalog);
    expect(catalog.countries.data[0].isoCode).toBe('BD');
    for (const collection of Object.values(catalog)) {
      expect(collection.metadata.isDevelopmentSample).toBe(true);
      expect(collection.metadata.notice?.bn).toBeTruthy();
      for (const item of collection.data) {
        expect(item.isDevelopmentSample).toBe(true);
        expect(item.verificationStatus).toBe('unverified');
        expect(item.publicationStatus).toBe('draft');
        expect(item.lastCheckedAt).toBeNull();
      }
    }
    expect(catalog.programs.data).toEqual([]);
    expect(catalog.institutions.data).toEqual([]);
    expect(catalog.agencies.data).toEqual([]);
  });

  it.each([null, [], {}, { countries: null }])('rejects malformed catalog %j', (value) => {
    expect(() => validateCatalog(value)).toThrow(DataValidationError);
  });
  it.each([
    'id',
    'slug',
    'name',
    'publicationStatus',
    'verificationStatus',
    'lastCheckedAt',
    'updatedAt',
    'sources',
    'isDevelopmentSample',
    'isoCode',
  ])('requires country field %s', (field) => {
    const country: Record<string, unknown> = { ...sampleCatalog.countries.data[0] };
    delete country[field];
    expect(() =>
      validateCatalog({
        ...sampleCatalog,
        countries: { ...sampleCatalog.countries, data: [country] },
      }),
    ).toThrow(DataValidationError);
  });
  it.each(['id', 'slug'])('rejects duplicate %s', (field) => {
    const original = sampleCatalog.countries.data[0];
    const duplicate = {
      ...original,
      id: 'different-id',
      slug: 'different-slug',
      isoCode: 'CA',
      [field]: original[field as 'id' | 'slug'],
    };
    const countries = {
      ...sampleCatalog.countries,
      data: [original, duplicate],
      pagination: { ...sampleCatalog.countries.pagination, totalItems: 2 },
    };
    expect(() => validateCatalog({ ...sampleCatalog, countries })).toThrow(/duplicate/);
  });
  it.each([
    { isoCode: 'bd' },
    { verificationStatus: 'trusted' },
    { publicationStatus: 'live' },
    { isDevelopmentSample: 'true' },
    { verificationStatus: 'verified' },
    { publicationStatus: 'published' },
    { updatedAt: '2026-02-30T00:00:00Z' },
    { name: { en: '', bn: null } },
  ])('rejects invalid country fields %j', (fields) => {
    expect(() =>
      validateCatalog({
        ...sampleCatalog,
        countries: {
          ...sampleCatalog.countries,
          data: [{ ...sampleCatalog.countries.data[0], ...fields }],
        },
      }),
    ).toThrow(DataValidationError);
  });
  it('rejects inconsistent pagination and missing sample labels', () => {
    expect(() =>
      validateCatalog({
        ...sampleCatalog,
        countries: {
          ...sampleCatalog.countries,
          pagination: { page: 2, pageSize: 20, totalItems: 1, totalPages: 1 },
        },
      }),
    ).toThrow(/pagination/);
    expect(() =>
      validateCatalog({
        ...sampleCatalog,
        countries: {
          ...sampleCatalog.countries,
          metadata: { ...sampleCatalog.countries.metadata, notice: null },
        },
      }),
    ).toThrow(/notice/);
  });
  it('rejects dangling country relationships', () => {
    const cities = {
      ...sampleCatalog.cities,
      data: [{ ...sampleCatalog.countries.data[0], countryId: 'missing-country' }],
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
    };
    expect(() => validateCatalog({ ...sampleCatalog, cities })).toThrow(/unknown related ID/);
  });
  it.each(['institutions', 'programs', 'countryGuides', 'visaGuides', 'agencies'])(
    'rejects incomplete %s records rather than trusting TypeScript casts',
    (key) => {
      const empty = sampleCatalog.programs;
      expect(() =>
        validateCatalog({
          ...sampleCatalog,
          [key]: {
            ...empty,
            data: [{}],
            pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          },
        }),
      ).toThrow(DataValidationError);
    },
  );
  it.each(['2026-01-01T00:00:00Z', '2026-01-01T00:00:00.123Z'])(
    'accepts UTC timestamps %s',
    (value) => expect(timestamp(value, 'time')).toBe(value),
  );
  it.each(['2026-01-01', '2026-02-30T00:00:00Z', '2026-01-01T00:00:00+06:00'])(
    'rejects invalid timestamps %s',
    (value) => expect(() => timestamp(value, 'time')).toThrow(),
  );
  it.each([-1, Infinity, NaN, '10'])('rejects invalid numeric values %s', (value) =>
    expect(() => number(value, 'amount')).toThrow(),
  );
  it.each(['javascript:alert(1)', 'https://name:secret@example.com', 'not-a-url'])(
    'rejects unsafe source URLs %s',
    (value) => expect(() => url(value, 'source')).toThrow(),
  );
});
