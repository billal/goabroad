import * as M from './catalog';
import * as D from './decoder';

const localized = D.object<M.LocalizedText>({ en: D.text, bn: D.nullable(D.text) });
const ids = D.array(D.id);
const source = D.object<M.Source>({
  id: D.id,
  url: D.url,
  title: D.text,
  checkedAt: D.nullable(D.timestamp),
});
const base: D.Shape<M.CatalogRecord> = {
  id: D.id,
  slug: D.id,
  name: localized,
  publicationStatus: D.oneOf('draft', 'published', 'archived'),
  verificationStatus: D.oneOf('unverified', 'verified', 'needsReview'),
  lastCheckedAt: D.nullable(D.timestamp),
  updatedAt: D.timestamp,
  isDevelopmentSample: D.boolean,
  sources: D.array(source),
};
const claim = <T>(value: D.Decoder<T>): D.Decoder<M.Claim<T>> =>
  D.object({ value: D.nullable(value), sourceIds: ids });
const requirement = <T>(value: D.Decoder<T>): D.Decoder<M.Requirement<T>> =>
  D.object({ value: D.nullable(value), sourceIds: ids, mandatory: D.nullable(D.boolean) });
const money = D.object<M.Money>({
  amount: D.number,
  currency: D.pattern(/^[A-Z]{3}$/),
  period: D.oneOf('annual', 'semester', 'total', 'oneTime'),
});
const contacts = D.object<M.Contacts>({
  email: D.nullable(D.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  phone: D.nullable(D.text),
  website: D.nullable(D.url),
});
const country = D.object<M.Country>({ ...base, isoCode: D.pattern(/^[A-Z]{2}$/) });
const city = D.object<M.City>({ ...base, countryId: D.id });
const reference = D.object<M.ReferenceItem>({ ...base, description: D.nullable(localized) });
const institution = D.object<M.Institution>({
  ...base,
  shortName: D.nullable(D.text),
  countryId: D.id,
  cityId: D.nullable(D.id),
  institutionType: D.nullable(D.oneOf('public', 'private', 'other')),
  overview: D.nullable(localized),
  officialWebsite: D.nullable(D.url),
  admissionUrl: D.nullable(D.url),
  address: claim(localized),
  contacts: claim(contacts),
  recognition: claim(localized),
  logoUrl: D.nullable(D.url),
});
const gpa = D.object<M.GpaRequirement>({
  minimum: D.number,
  scale: D.number,
  qualificationId: D.nullable(D.id),
});
const language = D.object<M.LanguageRequirement>({
  test: D.oneOf('ielts', 'toefl', 'pte', 'duolingo', 'other'),
  testName: D.text,
  minimumOverall: D.nullable(D.number),
  minimumReading: D.nullable(D.number),
  minimumWriting: D.nullable(D.number),
  minimumListening: D.nullable(D.number),
  minimumSpeaking: D.nullable(D.number),
});
const requirements = D.object<M.ProgramRequirements>({
  educationLevelIds: requirement(ids),
  academicSubjectIds: requirement(ids),
  gpa: requirement(gpa),
  language: requirement(D.array(language)),
  maximumStudyGapYears: requirement(D.number),
  minimumWorkExperienceMonths: requirement(D.integer),
});
const intake = D.object<M.Intake>({
  id: D.id,
  label: localized,
  startsAt: D.nullable(D.timestamp),
  deadline: D.nullable(D.timestamp),
});
const program = D.object<M.Program>({
  ...base,
  institutionId: D.id,
  countryId: D.id,
  cityId: D.nullable(D.id),
  subjectId: D.id,
  degreeLevelId: D.id,
  description: D.nullable(localized),
  studyMode: D.nullable(D.oneOf('onCampus', 'online', 'hybrid')),
  teachingLanguages: D.nullable(D.array(D.text)),
  durationMonths: claim(D.positiveInteger),
  tuition: claim(money),
  applicationFee: claim(money),
  intakes: claim(D.array(intake)),
  requirements,
  requiredDocuments: claim(D.array(localized)),
  scholarships: claim(localized),
  officialApplicationUrl: D.nullable(D.url),
});
const countryGuide = D.object<M.CountryGuide>({
  ...base,
  countryId: D.id,
  overview: claim(localized),
  studyGuidance: claim(localized),
  livingCosts: claim(money),
  disclaimer: localized,
});
const visaGuide = D.object<M.VisaGuide>({
  ...base,
  countryId: D.id,
  applicantNationalityCode: D.nullable(D.pattern(/^[A-Z]{2}$/)),
  visaType: D.text,
  requirements: claim(D.array(localized)),
  requiredDocuments: claim(D.array(localized)),
  financialRequirement: claim(localized),
  processingTimeGuidance: claim(localized),
  workRules: claim(localized),
  dependentRules: claim(localized),
  effectiveAt: D.nullable(D.timestamp),
  disclaimer: localized,
});
const agency = D.object<M.Agency>({
  ...base,
  agencyType: D.nullable(D.oneOf('educationConsultancy', 'other')),
  countryId: D.id,
  cityId: D.nullable(D.id),
  address: claim(localized),
  destinationCountryIds: ids,
  services: claim(D.array(localized)),
  contacts: claim(contacts),
  registration: claim(localized),
  isSponsored: D.boolean,
});
const pagination = D.object<M.Collection<unknown>['pagination']>({
  page: D.positiveInteger,
  pageSize: D.positiveInteger,
  totalItems: D.integer,
  totalPages: D.integer,
});
const metadata = D.object<M.Collection<unknown>['metadata']>({
  version: D.oneOf('1.0'),
  lastUpdated: D.timestamp,
  isDevelopmentSample: D.boolean,
  notice: D.nullable(localized),
});

function unique(values: readonly string[], path: string): void {
  if (new Set(values).size !== values.length) D.fail(path, 'duplicate value');
}

/** Recursively verify claim source references without interpreting admission rules. */
function checkClaims(value: unknown, record: M.CatalogRecord, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((item: unknown, i) => checkClaims(item, record, `${path}[${i}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  const entry = value as Record<string, unknown>;
  if ('sourceIds' in entry) {
    const references = ids(entry['sourceIds'], `${path}.sourceIds`);
    unique(references, `${path}.sourceIds`);
    for (const ref of references)
      if (!record.sources.some((s) => s.id === ref)) D.fail(path, 'unknown source reference');
    if (
      record.publicationStatus === 'published' &&
      entry['value'] !== null &&
      references.length === 0
    )
      D.fail(path, 'published claims require sources');
  }
  for (const [key, child] of Object.entries(entry)) checkClaims(child, record, `${path}.${key}`);
}

const collection =
  <T extends M.CatalogRecord>(decode: D.Decoder<T>): D.Decoder<M.Collection<T>> =>
  (value, path) => {
    const result = D.object<M.Collection<T>>({ data: D.array(decode), pagination, metadata })(
      value,
      path,
    );
    const p = result.pagination;
    // A static file is a complete snapshot, not a partial API page.
    if (
      p.page !== 1 ||
      p.totalItems !== result.data.length ||
      p.pageSize < result.data.length ||
      p.totalPages !== (result.data.length ? 1 : 0)
    )
      D.fail(path, 'inconsistent static collection pagination');
    unique(
      result.data.map((item) => item.id),
      `${path}.id`,
    );
    unique(
      result.data.map((item) => item.slug),
      `${path}.slug`,
    );
    if (result.metadata.isDevelopmentSample && !result.metadata.notice)
      D.fail(path, 'development collection requires a notice');
    for (const item of result.data) {
      const itemPath = `${path}.${item.id}`;
      if (
        item.isDevelopmentSample &&
        (!result.metadata.isDevelopmentSample ||
          item.publicationStatus !== 'draft' ||
          item.verificationStatus === 'verified')
      )
        D.fail(itemPath, 'development samples must be draft and not verified');
      unique(
        item.sources.map((s) => s.id),
        `${itemPath}.sources`,
      );
      if (
        item.verificationStatus === 'verified' &&
        (!item.lastCheckedAt || !item.sources.length || item.sources.some((s) => !s.checkedAt))
      )
        D.fail(itemPath, 'verified record requires checked sources and a last-checked timestamp');
      if (item.publicationStatus === 'published' && !item.sources.length)
        D.fail(itemPath, 'published record requires sources');
      checkClaims(item, item, itemPath);
    }
    return result;
  };

export const catalogDecoder = D.object<M.Catalog>({
  countries: collection(country),
  cities: collection(city),
  educationLevels: collection(reference),
  degreeLevels: collection(reference),
  subjects: collection(reference),
  institutions: collection(institution),
  programs: collection(program),
  countryGuides: collection(countryGuide),
  visaGuides: collection(visaGuide),
  agencies: collection(agency),
});

export function validateCatalog(value: unknown): M.Catalog {
  const catalog = catalogDecoder(value, 'catalog');
  const has = (items: readonly M.CatalogRecord[], id: string | null, path: string) => {
    if (id !== null && !items.some((item) => item.id === id))
      D.fail(path, `unknown related ID: ${id}`);
  };
  const location = (item: {
    readonly countryId: string;
    readonly cityId: string | null;
    readonly id: string;
  }) => {
    has(catalog.countries.data, item.countryId, item.id);
    has(catalog.cities.data, item.cityId, item.id);
    if (
      item.cityId &&
      catalog.cities.data.find((city) => city.id === item.cityId)?.countryId !== item.countryId
    )
      D.fail(item.id, 'city belongs to a different country');
  };
  unique(
    catalog.countries.data.map((c) => c.isoCode),
    'countries.isoCode',
  );
  for (const city of catalog.cities.data) has(catalog.countries.data, city.countryId, city.id);
  for (const institution of catalog.institutions.data) location(institution);
  for (const program of catalog.programs.data) {
    location(program);
    has(catalog.institutions.data, program.institutionId, program.id);
    has(catalog.subjects.data, program.subjectId, program.id);
    has(catalog.degreeLevels.data, program.degreeLevelId, program.id);
    if (
      catalog.institutions.data.find((i) => i.id === program.institutionId)?.countryId !==
      program.countryId
    )
      D.fail(program.id, 'institution belongs to a different country');
    for (const id of program.requirements.educationLevelIds.value ?? [])
      has(catalog.educationLevels.data, id, program.id);
    for (const id of program.requirements.academicSubjectIds.value ?? [])
      has(catalog.subjects.data, id, program.id);
    const gpa = program.requirements.gpa.value;
    if (gpa) {
      if (gpa.scale <= 0 || gpa.minimum > gpa.scale) D.fail(program.id, 'invalid GPA scale');
      has(catalog.educationLevels.data, gpa.qualificationId, program.id);
    }
    unique(
      (program.intakes.value ?? []).map((i) => i.id),
      `${program.id}.intakes`,
    );
  }
  for (const guide of [...catalog.countryGuides.data, ...catalog.visaGuides.data])
    has(catalog.countries.data, guide.countryId, guide.id);
  for (const agency of catalog.agencies.data) {
    location(agency);
    if (catalog.countries.data.find((c) => c.id === agency.countryId)?.isoCode !== 'BD')
      D.fail(agency.id, 'agency location must be in Bangladesh');
    unique(agency.destinationCountryIds, `${agency.id}.destinations`);
    for (const id of agency.destinationCountryIds) has(catalog.countries.data, id, agency.id);
  }
  return catalog;
}
