# Job-seeker country guides

The user approved country guidance as an extension to the existing job-seeker questionnaire. No backend, live vacancies, account persistence or automated visa eligibility calculation was added.

## Coverage and research

Three introductory routes were researched from official sources on 9 September 2026:

- United Kingdom: Skilled Worker visa; GOV.UK job search and overseas application instructions.
- Germany: work visa for qualified professionals; Make it in Germany job applications and route instructions.
- Canada: employer-specific work permit; Job Bank foreign-candidate listings and IRCC instructions.

Every step retains a source reference; each source URL and check date is present in `public/data/work-guides.json` and visible beside the relevant text. Records remain draft development examples with `needsReview` status pending independent review, including Bengali translation review. These routes are illustrative, not exhaustive. No fee, salary threshold, processing time or eligibility result is inferred.

The cards link to official guides rather than collecting visa documents or submitting applications. Users must follow the relevant authority's current instructions for their circumstances.

## Behavior

The existing preferred-country input accepts comma-separated country names. Completion shows guides for exact English/Bengali names, country codes or documented aliases (UK, Great Britain, Deutschland). Unknown country names do not silently become matches. With no preference, all three examples appear. A country selector allows viewing each destination or all available guides, without changing submitted answers. Unsupported preferences show a distinct empty state.

Guide data is loaded and validated through `WorkGuideRepository` and `JsonWorkGuideRepository`. Components never fetch JSON directly. The collection uses the existing API-compatible envelope and source/record metadata conventions. Country codes identify the destination independently from the student-reference catalog; no array-index relationships are used.

## Modified files

- `public/data/work-guides.json`: bilingual, sourced examples.
- `src/app/core/models/work-guide.ts`: typed contracts, runtime validation, country selection.
- `src/app/core/repositories/work-guide.repository.ts`: repository abstraction and JSON implementation.
- `src/app/features/job-seeker/work-results.{ts,html,scss,spec.ts}`: responsive country cards, dropdown, error/retry and tests.
- `src/app/features/job-seeker/job-seeker.{ts,html,spec.ts}`: completion integration and isolated HTTP test setup.
- `README.md` and this document: behavior and scope notes.

Validation tests cover actual JSON, duplicate identifiers, malformed data, missing evidence, unsafe URLs, date requirements, exact country selection, loading/retry, language changes and preserving questionnaire answers.
