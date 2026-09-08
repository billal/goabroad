import {
  Catalog,
  CatalogRecord,
  Claim,
  Collection,
  Institution,
  Program,
  Requirement,
  VisaGuide,
  Agency,
  CountryGuide,
} from './catalog';
import { validateCatalog } from './catalog-validation';
import { sampleCatalog } from './sample-catalog.spec-helper';

// Structural test fixtures only. These are not real entities, research, or public seed data.
const record = (id: string): CatalogRecord => ({
  id,
  slug: id,
  name: { en: 'Schema fixture only — not a real listing', bn: null },
  publicationStatus: 'draft',
  verificationStatus: 'unverified',
  lastCheckedAt: null,
  updatedAt: '2026-09-08T00:00:00Z',
  isDevelopmentSample: true,
  sources: [],
});
const unknownClaim = <T>(): Claim<T> => ({ value: null, sourceIds: [] });
const unknownRequirement = <T>(): Requirement<T> => ({ ...unknownClaim<T>(), mandatory: null });
const collection = <T>(data: readonly T[]): Collection<T> => ({
  ...validateCatalog(sampleCatalog).programs,
  data,
  pagination: { page: 1, pageSize: 20, totalItems: data.length, totalPages: data.length ? 1 : 0 },
});

function fixture(): Catalog {
  const institution: Institution = {
    ...record('schema-institution'),
    countryId: 'country-bd',
    cityId: null,
    shortName: null,
    institutionType: null,
    overview: null,
    officialWebsite: null,
    admissionUrl: null,
    address: unknownClaim(),
    contacts: unknownClaim(),
    recognition: unknownClaim(),
    logoUrl: null,
  };
  const program: Program = {
    ...record('schema-program'),
    institutionId: institution.id,
    countryId: 'country-bd',
    cityId: null,
    subjectId: 'subject-mathematics',
    degreeLevelId: 'degree-bachelor',
    description: null,
    studyMode: null,
    teachingLanguages: null,
    durationMonths: unknownClaim(),
    tuition: unknownClaim(),
    applicationFee: unknownClaim(),
    intakes: unknownClaim(),
    requirements: {
      educationLevelIds: unknownRequirement(),
      academicSubjectIds: unknownRequirement(),
      gpa: unknownRequirement(),
      language: unknownRequirement(),
      maximumStudyGapYears: unknownRequirement(),
      minimumWorkExperienceMonths: unknownRequirement(),
    },
    requiredDocuments: unknownClaim(),
    scholarships: unknownClaim(),
    officialApplicationUrl: null,
  };
  const disclaimer = { en: 'Schema fixture only. No guidance.', bn: null };
  const countryGuide: CountryGuide = {
    ...record('schema-country-guide'),
    countryId: 'country-bd',
    overview: unknownClaim(),
    studyGuidance: unknownClaim(),
    livingCosts: unknownClaim(),
    disclaimer,
  };
  const visaGuide: VisaGuide = {
    ...record('schema-visa-guide'),
    countryId: 'country-bd',
    applicantNationalityCode: null,
    visaType: 'Schema fixture only',
    requirements: unknownClaim(),
    requiredDocuments: unknownClaim(),
    financialRequirement: unknownClaim(),
    processingTimeGuidance: unknownClaim(),
    workRules: unknownClaim(),
    dependentRules: unknownClaim(),
    effectiveAt: null,
    disclaimer,
  };
  const agency: Agency = {
    ...record('schema-agency'),
    agencyType: null,
    countryId: 'country-bd',
    cityId: null,
    address: unknownClaim(),
    destinationCountryIds: ['country-bd'],
    services: unknownClaim(),
    contacts: unknownClaim(),
    registration: unknownClaim(),
    isSponsored: false,
  };
  return {
    ...validateCatalog(sampleCatalog),
    institutions: collection([institution]),
    programs: collection([program]),
    countryGuides: collection([countryGuide]),
    visaGuides: collection([visaGuide]),
    agencies: collection([agency]),
  };
}

describe('Nested entity contracts (test-only schema fixtures)', () => {
  it('preserves explicit unknowns across all entity types without fabricating defaults', () => {
    const result = validateCatalog(fixture());
    expect(result.programs.data[0].requirements.language.value).toBeNull();
    expect(result.programs.data[0].tuition.value).toBeNull();
    expect(result.visaGuides.data[0].workRules.value).toBeNull();
    expect(result.agencies.data[0].contacts.value).toBeNull();
  });
  it.each([
    { tuition: { value: { amount: -10, currency: 'USD', period: 'annual' }, sourceIds: [] } },
    { tuition: { value: { amount: 10, currency: 'usd', period: 'annual' }, sourceIds: [] } },
    { durationMonths: { value: 0, sourceIds: [] } },
    { tuition: { value: null, sourceIds: ['missing-source'] } },
    { officialApplicationUrl: 'javascript:void(0)' },
    { institutionId: 'missing' },
    { subjectId: 'missing' },
    { degreeLevelId: 'missing' },
  ])('rejects malformed program values %j', (fields) => {
    const catalog = fixture();
    expect(() =>
      validateCatalog({
        ...catalog,
        programs: collection([{ ...catalog.programs.data[0], ...fields }]),
      }),
    ).toThrow();
  });
  it.each([
    { minimum: 5, scale: 4, qualificationId: null },
    { minimum: 0, scale: 0, qualificationId: null },
    { minimum: 3, scale: 4, qualificationId: 'missing' },
  ])('rejects invalid GPA structures %j', (value) => {
    const catalog = fixture();
    const program = catalog.programs.data[0];
    expect(() =>
      validateCatalog({
        ...catalog,
        programs: collection([
          {
            ...program,
            requirements: {
              ...program.requirements,
              gpa: { value, mandatory: true, sourceIds: [] },
            },
          },
        ]),
      }),
    ).toThrow();
  });
  it('rejects education and subject requirement IDs that do not exist', () => {
    const catalog = fixture();
    const program = catalog.programs.data[0];
    for (const key of ['educationLevelIds', 'academicSubjectIds']) {
      expect(() =>
        validateCatalog({
          ...catalog,
          programs: collection([
            {
              ...program,
              requirements: {
                ...program.requirements,
                [key]: { value: ['missing'], mandatory: true, sourceIds: [] },
              },
            },
          ]),
        }),
      ).toThrow(/related ID/);
    }
  });
  it('keeps sponsorship independent of verification', () => {
    const catalog = fixture();
    const sponsored = { ...catalog.agencies.data[0], isSponsored: true };
    expect(
      validateCatalog({ ...catalog, agencies: collection([sponsored]) }).agencies.data[0]
        .verificationStatus,
    ).toBe('unverified');
    expect(() =>
      validateCatalog({
        ...catalog,
        agencies: collection([{ ...sponsored, verificationStatus: 'verified' }]),
      }),
    ).toThrow();
  });
  it('rejects city and institution country mismatches', () => {
    const catalog = fixture();
    const countries = collection([
      ...catalog.countries.data,
      { ...record('schema-country'), isoCode: 'CA' },
    ]);
    const cities = collection([{ ...record('schema-city'), countryId: 'schema-country' }]);
    expect(() =>
      validateCatalog({
        ...catalog,
        countries,
        cities,
        institutions: collection([{ ...catalog.institutions.data[0], cityId: 'schema-city' }]),
      }),
    ).toThrow(/different country/);
    expect(() =>
      validateCatalog({
        ...catalog,
        countries,
        programs: collection([{ ...catalog.programs.data[0], countryId: 'schema-country' }]),
      }),
    ).toThrow(/different country/);
  });
  it('requires source IDs for known published claims', () => {
    const catalog = fixture();
    const program = {
      ...catalog.programs.data[0],
      isDevelopmentSample: false,
      publicationStatus: 'published',
      sources: [
        { id: 'schema-source', url: 'https://example.com', title: 'Test only', checkedAt: null },
      ],
      durationMonths: { value: 12, sourceIds: [] },
    };
    expect(() => validateCatalog({ ...catalog, programs: collection([program]) })).toThrow(
      /published claims require sources/,
    );
  });
});
