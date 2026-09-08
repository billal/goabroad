# Go Abroad — Project Brief

## 1. Document status

- Product: Go Abroad
- Current delivery: Phase 1 MVP
- Frontend: Angular 22
- Phase 1 data source: Static JSON
- Repository model: Angular application directly in the repository root
- Future backend: Separate ASP.NET Core API repository
- Future database: PostgreSQL, with Amazon RDS for PostgreSQL as the preferred AWS service

## 2. Product overview

Go Abroad is an information platform for Bangladeshi students and, in a later phase, job seekers who want to study or work abroad. Users provide their education and preferences, and the platform presents relevant institutions, programs, admission requirements, visa guidance, official contacts, and local agencies.

The platform provides informational guidance only. It must never guarantee admission, employment, scholarships, visas, or agency outcomes.

## 3. Target users

### Phase 1

- Bangladeshi students researching overseas study
- Parents helping students compare options
- Visitors looking for verified institutions, programs, visa guidance, and agencies

### Future phases

- Job seekers researching overseas employment
- Education and recruitment agencies
- Content researchers and verification staff

## 4. Phase 1 goals

Phase 1 will validate the product idea using an Angular-only static application. It must:

1. Help a student describe their academic profile and study preferences.
2. Match that profile against structured program requirements.
3. Explain which requirements are met, not met, or unknown.
4. Provide filterable institution and program information.
5. Display official sources and last-verified dates.
6. List relevant local agencies without implying that paid listings are verified.
7. Support English and Bengali.
8. preserve a data contract that can later be served by a separate .NET API.

## 5. Phase 1 scope

### Included

- Responsive Angular website
- English and Bengali routes and content
- Home page
- Multi-step student questionnaire
- Program search and filtering
- Deterministic eligibility matching
- Program detail pages
- Institution detail pages
- Country study guides
- Visa guidance pages
- Agency directory and agency detail pages
- Program comparison
- Browser-based temporary persistence for assessment and comparison
- Static JSON datasets under `public/data`
- Visible data sources, verification status, and last-checked dates
- Error, empty, loading, and no-match states
- Accessibility and search-engine basics

### Excluded

- ASP.NET Core or any other backend
- PostgreSQL, SQL Server, or any database
- User registration and login
- Admin panel
- Server-side saved programs
- Document upload or assessment
- Direct university applications
- Online payments
- AI chatbot
- Runtime AI calls
- Automated crawling or daily updates
- Live job listings
- Job-seeker module
- AWS database infrastructure

## 6. Repository architecture

This repository contains the Angular application only. The Angular workspace and application must be created directly in the repository root.

Do not create a `frontend`, `client`, `web`, or similar wrapper directory.

Expected structure:

```text
GoAbroad/
├── AGENTS.md
├── PROJECT_BRIEF.md
├── README.md
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── public/
│   ├── data/
│   └── images/
└── src/
    ├── app/
    ├── environments/
    ├── index.html
    ├── main.ts
    └── styles.scss
```

The future API will live in a separate repository, tentatively named `GoAbroad.Api`. It may contain ASP.NET Core, Entity Framework Core, a Worker Service, PostgreSQL, and AWS infrastructure. None of those belong in this Phase 1 repository.

## 7. Technology decisions

- Angular 22
- Standalone components
- Angular Router with lazy-loaded features
- Strict TypeScript
- Angular Reactive Forms
- SCSS
- Angular signals for local UI state where appropriate
- Angular `HttpClient` for loading JSON
- RxJS for asynchronous data access
- `sessionStorage` for an unfinished student assessment
- `localStorage` for program comparison, with graceful fallback
- No state-management library unless later justified
- No runtime AI dependency

## 8. Proposed Angular structure

```text
src/app/
├── core/
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── constants/
├── shared/
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   └── validators/
├── features/
│   ├── home/
│   ├── student-assessment/
│   ├── program-search/
│   ├── program-details/
│   ├── institutions/
│   ├── countries/
│   ├── visa-guides/
│   ├── agencies/
│   └── comparison/
└── app.routes.ts
```

Static datasets:

```text
public/data/
├── countries.json
├── cities.json
├── education-levels.json
├── degree-levels.json
├── subjects.json
├── institutions.json
├── programs.json
├── country-guides.json
├── visa-guides.json
└── agencies.json
```

## 9. Main user journey

1. User selects “I am a student.”
2. User completes education, language, country, subject, budget, and intake questions.
3. The application queries the static program dataset.
4. The matching service evaluates each relevant program.
5. Results are classified and ranked.
6. User opens a program or institution.
7. User sees requirements, costs, deadlines, sources, and relevant agencies.
8. User may compare up to three programs.

## 10. Student assessment

Collect:

- Nationality and current country
- Last completed education level
- Academic subject/background
- GPA or equivalent result and scale
- Graduation year and study gap
- Language test type and score, or no test yet
- Preferred destination countries
- Preferred cities, optionally
- Intended degree level
- Intended subjects
- Maximum annual tuition budget
- Preferred intake
- Scholarship requirement

Avoid collecting passports, bank statements, national IDs, or academic documents in Phase 1.

## 11. Matching rules

Matching must be deterministic TypeScript logic, not AI.

Evaluate independently:

- Education level
- Accepted academic background
- GPA
- Language score
- Tuition budget
- Intake availability
- Study gap when an official limit exists
- Work experience when a program explicitly requires it

Every requirement returns one of:

- `met`
- `notMet`
- `unknown`

Missing program information must produce `unknown`, not `met` or `notMet`.

Overall classifications:

- `eligibleBasedOnAvailableInformation`
- `possiblyEligible`
- `actionRequired`
- `currentlyNotEligible`

Mandatory failures must remain visible. A percentage or score must not hide a failed mandatory requirement.

Display this disclaimer with eligibility results:

> This is a preliminary informational assessment based on the information available. It does not guarantee admission, a scholarship, or visa approval.

## 12. JSON data contract

Collections should follow a future API-compatible envelope:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 0,
    "totalPages": 0
  },
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2026-09-07T00:00:00Z"
  }
}
```

All records must use:

- Stable string IDs
- Unique slugs
- ISO 8601 UTC timestamps
- ISO country codes
- ISO currency codes
- Explicit relationships through IDs
- Publication status
- Verification metadata
- Source URLs for important claims

Do not use array positions as identifiers.

## 13. Core data models

### Program

- ID and slug
- Institution, country, city, subject, and degree IDs
- Name and description
- Study mode and language
- Duration
- Tuition and application fees
- Intakes and deadlines
- Academic requirements
- Language requirements
- Required documents
- Scholarship availability
- Official application URL
- Verification information
- Sources
- Publication status

### Institution

- ID and slug
- Name and short name
- Country and city
- Institution type
- Overview
- Official website and admission link
- Address and official contacts
- Accreditation or recognition information
- Logo
- Verification information
- Sources
- Publication status

### Visa guide

- Destination country
- Applicant nationality when relevant
- Visa type
- Requirements and documents
- Financial requirement
- Processing-time guidance
- Work and dependent rules
- Official sources
- Effective and last-checked dates
- Disclaimer

Do not publish a “visa ratio” unless it is supported by a reliable, nationality-specific source and identified by year.

### Agency

- ID and slug
- Name and type
- Bangladesh location
- Destination countries
- Services
- Contact information
- Registration/licence details when available
- Verification status
- Last-checked date
- Sponsorship status

`verificationStatus` and `isSponsored` must be separate fields. Payment must never create a verification badge.

## 14. Data access architecture

Components must not load JSON directly. They must depend on repository abstractions such as:

- `ProgramRepository`
- `InstitutionRepository`
- `CountryRepository`
- `VisaGuideRepository`
- `AgencyRepository`

Phase 1 implementations will be JSON-backed, for example `JsonProgramRepository`. A future API-backed implementation, such as `ApiProgramRepository`, should be replaceable through dependency injection without rewriting feature components.

## 15. Routes

Use language-prefixed public routes:

```text
/:lang
/:lang/student
/:lang/programs
/:lang/programs/:slug
/:lang/institutions/:slug
/:lang/countries/:slug
/:lang/countries/:slug/visa
/:lang/agencies
/:lang/agencies/:slug
/:lang/compare
```

Supported language codes in Phase 1:

- `en`
- `bn`

Invalid or missing languages should redirect to the default language determined by the agreed product behavior.

## 16. Search and filtering

Program filters should include:

- Country
- City
- Degree level
- Subject
- Tuition range
- Intake
- Language-test requirement
- Scholarship availability
- Institution type

Filters should be represented in the URL where practical so results can be shared and restored.

## 17. Comparison

Allow comparison of up to three programs. Compare:

- Institution and city
- Degree and subject
- Duration
- Tuition and application fee
- GPA requirement
- Language requirement
- Intake and deadline
- Scholarship availability
- Last verification date

Store comparison IDs locally for Phase 1. Do not treat browser storage as permanent user data.

## 18. Content integrity

- Official government, embassy, university, accreditation, and employer sources take priority.
- AI may help researchers collect or format information outside the website, but AI output must not be published without verification.
- Every material admission, fee, deadline, or visa claim must link to a source.
- Display last-verified dates.
- Represent unknown values honestly.
- Never generate fictional institutions, agencies, contacts, statistics, fees, or requirements.
- Clearly label sample data during development.

## 19. Accessibility and quality

- Mobile-first responsive layout
- Keyboard-accessible forms and controls
- Proper labels, headings, focus states, and validation messages
- Sufficient color contrast
- No meaning conveyed by color alone
- Loading, error, no-data, and no-match states
- Semantic HTML
- Page titles and metadata
- Fast static delivery
- No console errors in production

## 20. Testing requirements

Test at minimum:

- JSON parsing and required fields
- Unique IDs and slugs
- Relationship integrity
- Questionnaire validation
- Matching outcomes for `met`, `notMet`, and `unknown`
- Mandatory requirement failures
- Program filtering
- Language switching
- Route handling
- Comparison limit and persistence
- Empty and malformed data handling
- Production build

Maintain fixed eligibility fixtures where expected results are known.

## 21. Phase 1 milestones

1. Angular workspace at repository root
2. Application shell, layout, routes, and language foundation
3. TypeScript domain models and JSON schemas
4. Seed reference data, institutions, and programs
5. Repository abstractions and JSON implementations
6. Student questionnaire
7. Deterministic matching engine
8. Program search and results
9. Program and institution details
10. Country and visa guides
11. Agency directory
12. Program comparison
13. Bengali content and responsive refinement
14. Automated tests, accessibility checks, and production build
15. Static deployment

## 22. Future API and AWS direction

The future backend will be maintained in a separate repository. The expected direction is:

- ASP.NET Core Web API on .NET 10 LTS
- Entity Framework Core
- PostgreSQL
- Background Worker Service
- Amazon RDS for PostgreSQL
- Amazon S3 and CloudFront for the Angular build
- S3 for source snapshots and documents
- EventBridge and SQS for scheduled source checks
- Secrets Manager for credentials
- CloudWatch for monitoring

The JSON files should later be imported using a dedicated .NET data-import utility. The API should initially reproduce the Phase 1 response contracts so Angular needs only a repository-provider change.

## 23. Phase 1 acceptance criteria

Phase 1 is complete when:

- The Angular application lives directly at the repository root.
- No frontend wrapper or backend project exists in this repository.
- English and Bengali routes work.
- A student can complete the questionnaire.
- Relevant programs are loaded from JSON and matched deterministically.
- Each requirement is shown as met, not met, or unknown.
- Programs can be searched, filtered, opened, and compared.
- Institution, country, visa, and agency pages work.
- Important information displays sources and verification dates.
- Development placeholders are clearly identified.
- Tests pass and a production build completes successfully.

