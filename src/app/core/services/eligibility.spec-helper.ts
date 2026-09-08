import type { Claim, LanguageRequirement, Program, Requirement } from '../models/catalog';
import type { StudentProfile } from '../models/student-profile';

// Synthetic arithmetic fixtures only: not real institutions or admission information.
export function claim(value: null): Claim<never>;
export function claim<T>(value: T): Claim<T>;
export function claim<T>(value: T | null): Claim<T> {
  return { value, sourceIds: [] };
}
export function requirement(value: null, mandatory?: boolean | null): Requirement<never>;
export function requirement<T>(value: T, mandatory?: boolean | null): Requirement<T>;
export function requirement<T>(value: T | null, mandatory: boolean | null = true): Requirement<T> {
  return { value, sourceIds: [], mandatory };
}
export const languageFixture: LanguageRequirement = {
  test: 'ielts',
  testName: 'Synthetic test requirement',
  overallScale: 9,
  componentScale: 9,
  minimumOverall: 6,
  minimumReading: 5,
  minimumWriting: 5,
  minimumListening: 5,
  minimumSpeaking: 5,
};
export function profileFixture(): StudentProfile {
  const reference = { id: 'fixture-reference', reportedLabel: null };
  return {
    nationality: reference,
    residence: reference,
    education: reference,
    academicBackground: reference,
    academicResult: { value: 3, scale: 4 },
    graduationYear: 2024,
    studyGapYears: 2,
    workExperienceMonths: 12,
    languageTest: {
      type: 'ielts',
      reportedName: null,
      overall: 6,
      overallScale: 9,
      reading: 5,
      writing: 5,
      listening: 5,
      speaking: 5,
      componentScale: 9,
    },
    destination: reference,
    additionalDestinationNames: [],
    preferredCityNames: [],
    degree: reference,
    intendedSubjectNames: [],
    annualTuitionBudget: { amount: 100, currency: 'USD' },
    preferredIntake: '2027-09',
    scholarshipRequired: false,
  };
}
export function programFixture(): Program {
  return {
    id: 'matching-fixture',
    slug: 'matching-fixture',
    name: { en: 'Synthetic matching fixture only', bn: null },
    publicationStatus: 'draft',
    verificationStatus: 'unverified',
    lastCheckedAt: null,
    updatedAt: '2026-09-08T00:00:00Z',
    isDevelopmentSample: true,
    sources: [],
    institutionId: 'fixture-institution',
    countryId: 'fixture-country',
    cityId: null,
    subjectId: 'fixture-reference',
    degreeLevelId: 'fixture-reference',
    description: null,
    studyMode: null,
    teachingLanguages: null,
    durationMonths: claim(null),
    tuition: claim({ amount: 100, currency: 'USD', period: 'annual' }),
    applicationFee: claim(null),
    intakes: claim([
      {
        id: 'fixture-intake',
        label: { en: 'Fixture', bn: null },
        startsAt: '2027-09-01T00:00:00Z',
        deadline: '2027-08-01T00:00:00Z',
      },
    ]),
    requirements: {
      educationLevelIds: requirement(['fixture-reference']),
      academicSubjectIds: requirement(['fixture-reference']),
      gpa: requirement({ minimum: 3, scale: 4, qualificationId: 'fixture-reference' }),
      language: requirement([languageFixture]),
      maximumStudyGapYears: requirement(2),
      minimumWorkExperienceMonths: requirement(12),
    },
    requiredDocuments: claim(null),
    scholarships: claim(null),
    officialApplicationUrl: null,
  };
}
