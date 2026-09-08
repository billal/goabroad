/** Domain contracts shared by JSON and future API repository providers. */
export interface LocalizedText {
  readonly en: string;
  readonly bn: string | null;
}
export type PublicationStatus = 'draft' | 'published' | 'archived';
export type VerificationStatus = 'unverified' | 'verified' | 'needsReview';
export interface Source {
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly checkedAt: string | null;
}
export interface CatalogRecord {
  readonly id: string;
  readonly slug: string;
  readonly name: LocalizedText;
  readonly publicationStatus: PublicationStatus;
  readonly verificationStatus: VerificationStatus;
  readonly lastCheckedAt: string | null;
  readonly updatedAt: string;
  readonly isDevelopmentSample: boolean;
  readonly sources: readonly Source[];
}
export interface Collection<T> {
  readonly data: readonly T[];
  readonly pagination: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalItems: number;
    readonly totalPages: number;
  };
  readonly metadata: {
    readonly version: string;
    readonly lastUpdated: string;
    readonly isDevelopmentSample: boolean;
    readonly notice: LocalizedText | null;
  };
}
/** Values are explicitly unknown when null; an empty array means known to be empty. */
export interface Claim<T> {
  readonly value: T | null;
  readonly sourceIds: readonly string[];
}
export interface Money {
  readonly amount: number;
  readonly currency: string;
  readonly period: 'annual' | 'semester' | 'total' | 'oneTime';
}
export interface Country extends CatalogRecord {
  readonly isoCode: string;
}
export interface City extends CatalogRecord {
  readonly countryId: string;
}
export interface ReferenceItem extends CatalogRecord {
  readonly description: LocalizedText | null;
}
export type EducationLevel = ReferenceItem;
export type DegreeLevel = ReferenceItem;
export type Subject = ReferenceItem;
export interface Contacts {
  readonly email: string | null;
  readonly phone: string | null;
  readonly website: string | null;
}
export interface Institution extends CatalogRecord {
  readonly shortName: string | null;
  readonly countryId: string;
  readonly cityId: string | null;
  readonly institutionType: 'public' | 'private' | 'other' | null;
  readonly overview: LocalizedText | null;
  readonly officialWebsite: string | null;
  readonly admissionUrl: string | null;
  readonly address: Claim<LocalizedText>;
  readonly contacts: Claim<Contacts>;
  readonly recognition: Claim<LocalizedText>;
  readonly logoUrl: string | null;
}
export interface GpaRequirement {
  readonly minimum: number;
  readonly scale: number;
  readonly qualificationId: string | null;
}
export interface LanguageRequirement {
  readonly test: 'ielts' | 'toefl' | 'pte' | 'duolingo' | 'other';
  readonly testName: string;
  readonly minimumOverall: number | null;
  readonly minimumReading: number | null;
  readonly minimumWriting: number | null;
  readonly minimumListening: number | null;
  readonly minimumSpeaking: number | null;
}
export interface Requirement<T> extends Claim<T> {
  readonly mandatory: boolean | null;
}
export interface ProgramRequirements {
  readonly educationLevelIds: Requirement<readonly string[]>;
  readonly academicSubjectIds: Requirement<readonly string[]>;
  readonly gpa: Requirement<GpaRequirement>;
  readonly language: Requirement<readonly LanguageRequirement[]>;
  readonly maximumStudyGapYears: Requirement<number>;
  readonly minimumWorkExperienceMonths: Requirement<number>;
}
export interface Intake {
  readonly id: string;
  readonly label: LocalizedText;
  readonly startsAt: string | null;
  readonly deadline: string | null;
}
export interface Program extends CatalogRecord {
  readonly institutionId: string;
  readonly countryId: string;
  readonly cityId: string | null;
  readonly subjectId: string;
  readonly degreeLevelId: string;
  readonly description: LocalizedText | null;
  readonly studyMode: 'onCampus' | 'online' | 'hybrid' | null;
  readonly teachingLanguages: readonly string[] | null;
  readonly durationMonths: Claim<number>;
  readonly tuition: Claim<Money>;
  readonly applicationFee: Claim<Money>;
  readonly intakes: Claim<readonly Intake[]>;
  readonly requirements: ProgramRequirements;
  readonly requiredDocuments: Claim<readonly LocalizedText[]>;
  readonly scholarships: Claim<LocalizedText>;
  readonly officialApplicationUrl: string | null;
}
export interface CountryGuide extends CatalogRecord {
  readonly countryId: string;
  readonly overview: Claim<LocalizedText>;
  readonly studyGuidance: Claim<LocalizedText>;
  readonly livingCosts: Claim<Money>;
  readonly disclaimer: LocalizedText;
}
export interface VisaGuide extends CatalogRecord {
  readonly countryId: string;
  readonly applicantNationalityCode: string | null;
  readonly visaType: string;
  readonly requirements: Claim<readonly LocalizedText[]>;
  readonly requiredDocuments: Claim<readonly LocalizedText[]>;
  readonly financialRequirement: Claim<LocalizedText>;
  readonly processingTimeGuidance: Claim<LocalizedText>;
  readonly workRules: Claim<LocalizedText>;
  readonly dependentRules: Claim<LocalizedText>;
  readonly effectiveAt: string | null;
  readonly disclaimer: LocalizedText;
}
export interface Agency extends CatalogRecord {
  readonly agencyType: 'educationConsultancy' | 'other' | null;
  readonly countryId: string;
  readonly cityId: string | null;
  readonly address: Claim<LocalizedText>;
  readonly destinationCountryIds: readonly string[];
  readonly services: Claim<readonly LocalizedText[]>;
  readonly contacts: Claim<Contacts>;
  readonly registration: Claim<LocalizedText>;
  readonly isSponsored: boolean;
}
export interface Catalog {
  readonly countries: Collection<Country>;
  readonly cities: Collection<City>;
  readonly educationLevels: Collection<EducationLevel>;
  readonly degreeLevels: Collection<DegreeLevel>;
  readonly subjects: Collection<Subject>;
  readonly institutions: Collection<Institution>;
  readonly programs: Collection<Program>;
  readonly countryGuides: Collection<CountryGuide>;
  readonly visaGuides: Collection<VisaGuide>;
  readonly agencies: Collection<Agency>;
}
