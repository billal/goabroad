# AGENTS.md — Go Abroad Angular Repository

## 1. Read first

Read `PROJECT_BRIEF.md` completely before planning or modifying the application. Treat it as the product and architecture specification for this repository.

If a user request conflicts with `PROJECT_BRIEF.md`, follow the user’s latest explicit instruction and update the brief when requested. If a missing decision would materially alter the product, ask before implementing it.

## 2. Repository boundary

- This repository contains only the Go Abroad Angular application.
- The Angular workspace and application live directly at the repository root.
- Never create a `frontend`, `client`, `web`, `ui`, or similar wrapper directory.
- Never move the Angular application into a nested folder.
- The future ASP.NET Core API is a separate repository.
- Do not create .NET projects, backend folders, database code, migrations, worker services, or AWS infrastructure here unless the user explicitly changes the scope.

## 3. Current phase

Implement Phase 1 only:

- Angular 22
- Static JSON data under `public/data`
- English and Bengali
- Student questionnaire and deterministic matching
- Programs, institutions, country/visa guidance, agencies, and comparison

Do not add:

- Authentication or user accounts
- Admin panel
- Runtime AI calls
- Automated crawling
- Database integration
- Job-seeker functionality
- Direct application or payment processing

## 4. Root setup

When initializing an empty repository, create Angular in the current directory, not a child directory. Preserve `AGENTS.md` and `PROJECT_BRIEF.md`.

The intended Angular options are:

- Routing enabled
- SCSS
- Strict TypeScript
- Standalone components

Before initializing, inspect existing files and avoid overwriting user work.

## 5. Angular conventions

- Use standalone components and lazy-loaded feature routes.
- Use strict TypeScript and do not use `any`.
- Prefer typed interfaces, unions, and readonly data.
- Use Reactive Forms for the assessment.
- Use signals for local synchronous state when appropriate.
- Use RxJS for HTTP and asynchronous data flows.
- Keep components focused on presentation and orchestration.
- Put matching and business rules in pure, testable services or functions.
- Do not add a state-management package without a demonstrated need and user approval.
- Do not add major dependencies when Angular platform features are sufficient.

## 6. Data rules

- Store Phase 1 datasets in `public/data`.
- Components must not fetch JSON files directly.
- Access data through repository abstractions and injectable JSON implementations.
- Keep response envelopes compatible with the future API contract in `PROJECT_BRIEF.md`.
- Use stable string IDs, unique slugs, UTC ISO timestamps, ISO country codes, and ISO currency codes.
- Model relationships through IDs, never array positions.
- Retain sources, verification status, and last-checked dates.
- Keep `verificationStatus` independent from advertising or sponsorship fields.
- Mark development fixtures and placeholder records clearly.

## 7. Information integrity

- Never invent institutions, programs, agencies, contacts, fees, deadlines, visa requirements, approval rates, or sources.
- Prefer official government, embassy, university, accreditation, and employer sources.
- Treat AI-assisted research as draft information until verified.
- Use `null` or an explicit unknown state when a source does not provide a value.
- Never infer eligibility from missing data.
- Never promise admission, scholarships, employment, or visa approval.
- Display the required disclaimer with eligibility results.

## 8. Matching behavior

- Matching must be deterministic and independent of AI.
- Evaluate each requirement separately.
- Return `met`, `notMet`, or `unknown`.
- Keep mandatory failures visible.
- Do not replace transparent requirements with an unexplained score.
- Add unit tests for every matching rule and edge case.

## 9. Internationalization

- Support `en` and `bn` language-prefixed routes.
- Do not hard-code user-facing copy in business logic.
- Ensure Bengali layout, wrapping, punctuation, and fonts remain readable.
- Preserve untranslated official names when translation could create ambiguity.

## 10. UX and accessibility

- Design mobile first.
- Use semantic HTML.
- Provide accessible labels, keyboard operation, focus states, and validation messages.
- Do not communicate status through color alone.
- Implement loading, error, empty, and no-match states.
- Keep filters and assessment progress understandable on small screens.
- Show sources and last-verified dates near consequential information.

## 11. Browser persistence

- Use `sessionStorage` only for an unfinished assessment.
- Use `localStorage` only for Phase 1 conveniences such as comparison IDs.
- Handle unavailable, corrupt, or expired browser storage safely.
- Do not treat browser storage as permanent account data.

## 12. Testing and verification

After meaningful changes:

1. Run relevant unit tests.
2. Run the Angular production build.
3. Check TypeScript and template errors.
4. Verify affected routes and responsive states.
5. Report failures clearly rather than hiding them.

Test JSON schema assumptions, relationship integrity, questionnaire validation, matching outcomes, filtering, routes, language changes, comparison behavior, and malformed data.

## 13. Work discipline

- Inspect the existing repository before editing.
- Preserve unrelated user changes.
- Make small, coherent changes.
- Do not silently expand the agreed scope.
- Explain significant architectural decisions.
- Update documentation when behavior or structure changes.
- Do not claim a feature is complete until it has been verified.
- Do not commit secrets, credentials, API keys, or private data.

## 14. Future API compatibility

The future API belongs to another repository. Prepare for it by:

- Keeping TypeScript domain models explicit.
- Using repository interfaces.
- Isolating JSON URLs inside JSON repository implementations.
- Avoiding JSON-specific behavior in components.
- Keeping collection envelopes and identifiers API-compatible.

When the API arrives, the intended change is to replace JSON repository providers with HTTP API repository providers while retaining feature components and matching presentation.

## 15. Initial implementation sequence

Unless the user requests a different order:

1. Inspect `PROJECT_BRIEF.md` and existing files.
2. Propose a milestone plan before broad implementation.
3. Initialize Angular at the repository root if it is not already initialized.
4. Build the application shell and routes.
5. Define typed models and JSON contracts.
6. Add validated sample datasets.
7. Implement repository abstractions.
8. Implement the student assessment.
9. Implement and test deterministic matching.
10. Build results, details, guides, agencies, and comparison.
11. Complete Bengali, accessibility, responsive QA, tests, and production build.

