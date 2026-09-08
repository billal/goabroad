import type { Institution, Program } from '../../core/models/catalog';
import { programFixture, claim } from '../../core/services/eligibility.spec-helper';

/** Synthetic fixtures only. Published flags exercise the visibility policy; never shipped. */
export function searchProgram(): Program {
  return {
    ...programFixture(),
    publicationStatus: 'published',
    isDevelopmentSample: false,
    scholarshipAvailability: claim(true),
  };
}
export function searchInstitution(): Institution {
  return {
    id: 'fixture-institution',
    slug: 'fixture-institution',
    name: { en: 'Synthetic institution for tests only', bn: 'শুধু পরীক্ষার প্রতিষ্ঠান' },
    publicationStatus: 'published',
    isDevelopmentSample: false,
    verificationStatus: 'unverified',
    lastCheckedAt: null,
    updatedAt: '2026-09-08T00:00:00Z',
    sources: [],
    shortName: null,
    countryId: 'fixture-country',
    cityId: null,
    institutionType: 'public',
    overview: null,
    officialWebsite: null,
    admissionUrl: null,
    address: claim(null),
    contacts: claim(null),
    recognition: claim(null),
    logoUrl: null,
  };
}
