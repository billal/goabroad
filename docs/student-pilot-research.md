# Student results research pilot

Researched 9 September 2026. These are real programs, manually researched from official university pages, but the records are **draft development samples awaiting independent review**. No independent verification, admission recommendation, open-intake guarantee, or comprehensive country coverage is implied.

## Coverage

| Institution             | Country        | Programs                                                                                                  |
| ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------- |
| University of Twente    | Netherlands    | Computer Science MSc; Business Administration MSc; Mechanical Engineering MSc; Electrical Engineering MSc |
| University of Sheffield | United Kingdom | Computer Science MSc; Advanced Computer Science MSc; Data Science MSc                                     |
| University of Manitoba  | Canada         | Computer Science BSc (Major); Mathematics BSc (Major); Statistics BSc (Major)                             |

Every program in `public/data/programs.json` retains its specific official course URL, source IDs, UTC check date, bilingual research notes, institution/country/city relationships, and review status. Official names remain untranslated. Supporting official sources include [Twente tuition](https://www.utwente.nl/en/education/master/tuition-fees/), [Sheffield Bangladesh entry guidance](https://sheffield.ac.uk/international/entry-requirements/bangladesh), and [Manitoba English requirements](https://umanitoba.ca/explore/undergraduate-admissions/requirements/english-language-proficiency-requirements).

## Result behavior

Completing the student questionnaire loads the pilot through existing repository abstractions. Explicit destination and degree IDs narrow the examples. A visible button reveals all ten, including examples outside the student's preferences. Free-text names, subjects, additional destinations, cities, and scholarship preferences are not inferred as matches. Missing coverage is distinct from having no study options.

Admission notes and machine-readable requirements are separate. The eight existing deterministic checks are displayed, without an overall admission classification. Unsupported academic equivalences, test validity, exemptions and prerequisite coursework remain unknown. Notes never become automated rules.

Tuition comparisons use only the researched annual EUR benchmark, for a Bangladeshi-nationality profile selecting September 2027. This compares the budget with a fee benchmark; it does not establish personal fee status or total affordability. Different nationality, year, intake month or currency is not comparable. The visible fee notes exclude living costs and direct the student to confirm their fee category. There is no currency conversion.

Sheffield records explicitly refer to historical 2026 pages and their closed application period. They must not appear as current open offers. Manitoba major-entry requirements require university coursework; degree-completion GPAs must never be interpreted as school-entry thresholds.

## Missing information and review queue

- Independently review course facts, applicant-specific academic equivalences, accepted tests and exemptions.
- Research current international application fees, document lists, scholarships, and missing tuition amounts. These fields remain null rather than inferred.
- Recheck current intake availability and exact deadline times before publishing actionable deadlines.
- Confirm qualification recognition, degree duration and prerequisite modules before adding executable academic rules.
- Review Bengali translations with a fluent reviewer, particularly consequential admission conditions.

The pilot does not restore Programs, Agencies or Compare navigation. Existing public-search publication filters continue to exclude these draft records. No automated collection, runtime AI, API, new persistence or dependency was introduced.

## Files affected

- Data: `public/data/{countries,cities,subjects,institutions,programs}.json`.
- Contract and validation: `src/app/core/models/{catalog,catalog-validation}.ts`.
- Fixtures: `src/app/core/models/sample-catalog.spec-helper.ts`; minimal-fixture suite label in `catalog-validation.spec.ts`. Actual shipped data is validated by the pilot tests, independently of the intentionally minimal legacy fixtures.
- Results: new `src/app/features/student-assessment/pilot-results.{ts,html,scss}`, `pilot-results.logic.ts`, `pilot-results.text.ts`, and `pilot-results.spec.ts`.
- Integration: `student-assessment.{ts,html,spec.ts}` and `assessment-text.ts` in that feature directory.
- Documentation: `README.md` and this research manifest.

Instruction files and Angular workspace location are preserved.
