export interface ReferenceAnswer {
  readonly id: string | null;
  readonly reportedLabel: string | null;
}
export interface StudentProfile {
  readonly nationality: ReferenceAnswer;
  readonly residence: ReferenceAnswer;
  readonly education: ReferenceAnswer;
  readonly academicBackground: ReferenceAnswer;
  readonly academicResult: { readonly value: number; readonly scale: number } | null;
  readonly graduationYear: number;
  readonly studyGapYears: number | null;
  readonly workExperienceMonths: number | null;
  readonly languageTest: {
    readonly type: string;
    readonly reportedName: string | null;
    readonly overall: number;
    readonly overallScale: number;
    readonly reading: number | null;
    readonly writing: number | null;
    readonly listening: number | null;
    readonly speaking: number | null;
    readonly componentScale: number | null;
  } | null;
  readonly destination: ReferenceAnswer;
  readonly additionalDestinationNames: readonly string[];
  readonly preferredCityNames: readonly string[];
  readonly degree: ReferenceAnswer;
  readonly intendedSubjectNames: readonly string[];
  readonly annualTuitionBudget: { readonly amount: number; readonly currency: string };
  readonly preferredIntake: string;
  readonly scholarshipRequired: boolean;
}
