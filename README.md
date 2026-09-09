# Go Abroad

Angular-only application for people in Bangladesh planning overseas study or work. The Angular workspace lives directly in this repository root. Read AGENTS.md and PROJECT_BRIEF.md before making changes.

## Current milestone

Current scope override: Programs (including search/results and program detail routes), Agencies, and Compare programs are removed from the active application at the user's request. Navigation contains Home, Student assessment, and the separately approved Job-seeker questionnaire, in both languages. Removed URLs display the localized not-found page. Related home links and the student questionnaire results link are removed. Existing implementation files and data contracts are retained as deferred work, not active features. The historical milestone descriptions below record earlier work and do not authorize re-enabling these features. AGENTS.md and PROJECT_BRIEF.md remain preserved; the latest explicit user approval permits the job-seeker questionnaire despite their earlier student-only restriction.

## Job-seeker questionnaire

The completed questionnaire now displays a bilingual profile summary with every supplied field and a separate list of unanswered information. Blank optional answers remain unknown; zero experience is a known answer, and absent roles with zero experience are marked not applicable. No readiness percentage, job recommendation, or eligibility classification is generated. Summary sections and missing-information buttons reopen the appropriate input step with existing answers, creating an unfinished draft again. Finishing revalidates the entire form, replaces the summary, and clears that draft. The summary itself remains memory-only and is cleared on reset or page recreation.

The approved first job-seeker milestone is available at `/en/job-seeker` and `/bn/job-seeker`. It is a separate standalone Reactive Forms feature in `src/app/features/job-seeker/`, with its profile contract in `core/models/job-seeker-profile.ts`.

Three input steps collect education, optional field of study and skills, optional total experience in whole months, previous/current roles, optional languages, desired roles, and optional preferred countries. A fourth step supports review and editing before completion. Education and desired roles are required. A qualification may be explicitly described as “No formal qualification”. Positive experience requires role descriptions. Blank experience means unknown; zero means no experience. Numeric input accepts English/Bengali digits. Lists accept up to ten items, each up to 100 characters, within 500 characters per field.

All answers are self-reported text, not verified reference records or inferred qualifications. No JSON catalog is read because this questionnaire does not present reference options. No job listings, work-visa rules, matching, application submission, accounts, employer contacts, salaries, or document collection are added.

Unfinished answers use only `go-abroad.job-seeker.v1` in sessionStorage with a 24-hour inactivity expiry. The separate student draft is unaffected. Malformed/expired drafts are discarded and resumed drafts are revalidated. Unavailable storage falls back to memory with a visible notice. Completing or confirming a reset removes the draft. The completed typed profile stays only in the page component's memory and disappears when the page is left or refreshed. English/Bengali route changes preserve unfinished answers through the draft.

Tests cover validation, Bengali digits, required role descriptions, unknown/zero values, review/edit/completion, localization, reset confirmation, independent storage, corruption, expiry, and unavailable storage. Existing disabled-feature route checks remain in place.

The Angular foundation, bilingual shell, data foundation, student questionnaire, matching engine, and program search/results are implemented. Complete the questionnaire at `/en/student` or `/bn/student`, then open Programs. Program and institution details remain the next milestone.

## Prerequisites

- Node.js 22.22.3 (pinned in .nvmrc), or another version accepted by package.json engines.
- npm 11.19.1 or newer (npm 10.9.3 encountered a dependency resolver crash during setup).
- No global Angular CLI is required; npm scripts use the local CLI.

Check `node --version` before installing. The previously installed Node 22.19.0 is too old for Angular 22. On Windows, use `npm.cmd` if PowerShell blocks npm.ps1; do not change execution policy for this project.

## Commands

Run from the repository root with a supported Node runtime:

```sh
npm ci
npm start
npm test -- --watch=false
npm run build -- --configuration production
```

The development server uses http://localhost:4200. Production static files are emitted to dist/go-abroad/browser. Build output, dependencies, and caches are ignored by Git. The build checks application TypeScript and templates; the test command also compiles test sources.

### Existing local verification runtime (Windows)

Milestone 1 was verified with the official Node 22.22.3 Windows executable, checked against Node's SHA-256 manifest, in ignored `.tools/node/`. This is a machine-local convenience, not a committed dependency or a replacement for installing a supported Node version. It is not present in a fresh clone.

On this machine, while the system Node is still 22.19.0, use:

```powershell
$env:PATH = "$PWD\.tools\node;$env:PATH"
& .\.tools\node\node.exe 'C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js' exec --yes --package=npm@11.19.1 -- npm ci
& .\.tools\node\node.exe .\node_modules\@angular\cli\bin\ng.js serve
& .\.tools\node\node.exe .\node_modules\@angular\cli\bin\ng.js test --watch=false
& .\.tools\node\node.exe .\node_modules\@angular\cli\bin\ng.js build --configuration production
```

## Layout

- `src/app/`: standalone root component, bootstrap providers, language-prefixed routes, bilingual previews, and shell/routing tests.
- `src/styles.scss`: minimal global SCSS.
- `src/environments/`: reserved for future non-secret build configuration.
- `public/data/`: ten validated development JSON collections; see [the data contract and sample limitations](public/data/README.md).
- `public/images/`: reserved for image assets.
- `angular.json`, `tsconfig*.json`: root workspace and compiler/test configuration.

Empty directories use .gitkeep files. Future features must access JSON through injectable repository abstractions. There is no backend, database, authentication, admin panel, runtime AI, crawler, job-seeker functionality, or infrastructure in this milestone.

The foundation and data-access milestones are implemented. The student completion page now includes ten official-source draft program examples. Agencies and guides remain empty. See docs/student-pilot-research.md for scope and limitations.

## Milestone 2 behavior

The responsive shell, bilingual home preview, lazy route previews, and localized not-found page are implemented. All routes in PROJECT_BRIEF.md resolve under /en and /bn. Student and program-search routes are functional; details, guides, agencies, and comparison remain previews.

English (/en) is the default. Missing language prefixes are added while preserving the path. Unsupported locale-shaped prefixes such as /fr or /en-US are replaced with /en. Unknown paths display a localized not-found page. Language switching preserves the current path, slug, query parameters, and fragment. Language selection is URL-based and is not persisted in browser storage.

UI translations live in core/i18n/translations.ts with compile-time key parity. The document language, page title, and description follow the route. Development pages carry noindex/nofollow metadata. The mobile menu supports Escape, active navigation is identified in text styling and aria-current, and a skip link and main-content focus support keyboard navigation. Loading and route-load failure states include a retry action.

Static hosting will need SPA deep-link fallback when deployment is approved. The matching engine is implemented independently of the UI.

## Data foundation

Strongly typed contracts and runtime decoders live in `src/app/core/models`. Injectable repository abstractions and JSON providers live in `src/app/core/repositories`. Components access data through these abstractions and do not fetch JSON directly. No new runtime dependencies were added.

Tests import and validate the actual public JSON files, exercise malformed data and relationships, and verify HTTP failures, retry, shared loading, and provider replacement. Reference fixtures and an official-source program pilot are supplied. Pilot records remain development samples awaiting independent review; absent facts remain null.

## Student questionnaire

Implementation and tests live in `src/app/features/student-assessment/`. Four input steps cover background, academics, language tests, and study preferences, followed by review and editing. Budget includes an explicit currency; work experience uses months. Academic and language scores retain their entered scales, including a separate scale for optional language components. No score conversion or eligibility inference occurs. Bengali and Latin numeric input are accepted.

Reference options come from repository abstractions and carry a development-sample notice. “Not listed” accepts self-reported names without treating them as verified references or equivalent qualifications. Multiple destination names, cities, and subject interests can be entered as comma-separated lists. No new catalog records are added.

An unfinished draft uses only the `go-abroad.assessment.v1` sessionStorage key and expires after 24 hours without activity. Invalid or expired drafts are discarded; unavailable storage falls back to memory with a visible notice. Review completion clears the draft and copies the typed profile into a memory-only service for results. Nothing is submitted. Refresh, opening a new questionnaire, or removing completed answers clears that profile. Clearing an unfinished draft requires an inline confirmation.

Questionnaire tests cover conditional validation, original score scales, Bengali digits, unknown and zero values, invalid inputs, storage expiry/corruption/unavailability, progression, review/edit, language changes, restoration, and repository loading failures.

## Deterministic matching engine

`core/services/eligibility.ts` exports `evaluateProgram(program, profile, evaluatedAt)` and `classifyRequirements`. The shared profile contract lives in `core/models/student-profile.ts`; the assessment module re-exports it for compatibility. Inputs are validated domain records, a completed profile, and an explicit UTC timestamp. The engine performs no HTTP, storage, clock reads, AI calls, ranking, or filtering.

Eight outcomes cover education, academic background, GPA, language, annual tuition budget, intake, study gap, and work experience. Each includes `met`, `notMet`, or `unknown`, a presentation-independent reason code, mandatory status, and source IDs. The result retains program verification metadata and a separate list of mandatory failures. It does not certify source accuracy.

Classification precedence is explicit:

1. A known failure marked mandatory is `currentlyNotEligible`.
2. Other known failures or missing student information require `actionRequired`.
3. Remaining missing/incomparable program information is `possiblyEligible`.
4. All evaluated rules met is `eligibleBasedOnAvailableInformation`.

Tuition and intake are preference checks, not mandatory admission requirements. Missing mandatory flags are never promoted to true. All individual outcomes remain available regardless of classification; there is no percentage score. An empty set of outcomes cannot produce an eligible classification.

Reference matching uses exact IDs, without qualification ordering or free-text equivalence. GPA requires the same scale and, when specified, qualification ID. Tuition requires annual amounts in the same currency. Language alternatives use OR logic and each alternative checks overall and four component thresholds; a known component failure takes precedence over unknown components within that alternative. Optional `overallScale` and `componentScale` metadata are decoded as unknown when absent in legacy JSON. Missing thresholds/scales and self-reported test identities never imply a pass. No test scale or currency conversion is inferred.

Null requirement values remain unknown. Empty accepted education/background sets accept no IDs; an explicitly empty language-requirement list imposes no test requirement. Null language component thresholds are unknown, not waivers. Study-gap and work-experience limits are evaluated only when a numeric limit is supplied. Unknown student values differ from known zero.

Intakes require the preferred year/month, a known start date that has not passed, and a known application deadline. The exact deadline instant is included; later instants fail. An undated possible intake preserves uncertainty unless another intake is confirmed available. No deadline or intake is inferred from labels.

The tests use synthetic fixtures excluded from production compilation. Public JSON includes ten real program examples, kept separate from synthetic arithmetic test fixtures. Results show sources, last-checked dates, and the exact brief disclaimer: “This is a preliminary informational assessment based on the information available. It does not guarantee admission, a scholarship, or visa approval.”

## Program search and results

`features/program-search/` contains the lazy bilingual search page, pure filters, presentation translations, and tests. The page loads programs, institutions, and reference labels through repository abstractions. Only published, non-development programs with published, non-development institutions are displayed; publication never creates a verification badge.

Apply/Clear controls update URL query parameters: `q`, `country`, `city`, `degree`, `subject`, `min`, `max`, `currency`, `intake`, `language`, `scholarship`, and `institutionType`. Links and browser navigation restore these filters. Invalid URL/form filters produce an accessible error rather than silently broadening the search. Tuition ranges require annual amounts and the same explicit currency; intake filters select the start month, while matching separately evaluates deadlines. Unknown tuition is excluded from a numeric range.

The completed questionnaire now embeds the limited pilot directly, narrowing examples by known destination/degree IDs. The older search feature remains disabled. Self-reported destinations, cities, and subjects are not guessed or mapped to IDs. Other preferences can be selected using the visible filters. Completed answers never enter URLs, sessionStorage, or localStorage; URL filters are shareable but personalized outcomes require an in-memory completed questionnaire.

When a profile is present, every displayed program receives all eight matching outcomes. Results sort by the four documented classifications, then English program name and stable ID. Mandatory failures remain visible outside the expandable requirement explanation. Outcomes, thresholds, source links, verification status, last-checked dates, and the disclaimer are translated for English/Bengali. Browsing without a profile shows listings without eligibility claims.

Scholarship filtering uses optional `scholarshipAvailability: { value: boolean | null, sourceIds: string[] }`. Older datasets decode to unknown. Descriptive scholarship text is never interpreted as availability or personal eligibility. Known published availability needs a source under the existing claim-validation rules.

Loading, retryable errors, empty public catalog, no filter matches, and no all-requirements-met states are distinct. The current shipped catalog correctly displays no published programs. The student pilot uses real draft records; these are deliberately excluded from the disabled public search. Tests validate both minimal fixtures and the actual shipped catalog. No new dependency or browser persistence mechanism was introduced.

## Visual design

The site uses an emerald and warm ivory visual system, a custom decorative SVG globe, and a small shared outline-icon component. The homepage presents separate student and job-seeker paths, the questionnaire process, and factual explanations of privacy and service limits. English and Bengali copy are supported throughout. No endorsements, success statistics, or company credentials are implied by the artwork.

Shared questionnaire presentation lives in `src/_assessment-design.scss`; form validation, matching, repositories, and draft storage behavior are unchanged. The homepage illustration is isolated in the `Horizon` component to keep component styles within the existing size budgets. Graphics and fonts require no external requests or new dependencies. Programs, Agencies, and Compare remain disabled.

Layout refinement: removed the redundant homepage information strip, standardized process and principles icon tiles, and consolidated questionnaire actions into one responsive footer. The step grid now uses equal columns and shared styling without conflicting feature overrides. External form-associated submit buttons preserve native form validation and keyboard submission behavior, covered by regression tests.

Results presentation: removed the global development-preview banner and the redundant completion introduction. Student results use one heading, a compact sample label, expandable selection notes, and university cards with consistent icons and a grouped cost/duration panel. The required disclaimer remains below the list; fee context, sources and review status remain available. Desktop questionnaire steps now have subtle connectors, hidden when the layout wraps on mobile.

Results controls update: the Assessment result page shows selection explanations directly. A reactive country dropdown replaces the all-examples toggle; changing country preserves the submitted degree and profile, including tuition inputs. The default option restores the submitted destination. Missing country/degree coverage remains an explicit empty state. The informational guidance notice is displayed directly beneath the header in both languages.

Save popup: the completed student assessment includes a native modal dialog with typed reactive email/password/confirmation fields. This is a UI-only registration preview; it explicitly states that no account or saved assessment is created. Credentials are not transmitted or persisted and are cleared on closing the dialog. Two labelled consultancy layout placeholders appear below the results; they are not real agencies or endorsements.

Results presentation refinement: the final questionnaire action is Show result. Save opens the existing popup from the right side of the results title. The detailed calculated requirement-check list is temporarily omitted from the results UI at product request; source-backed admission notes remain available and the matching engine is unchanged. Agency placeholders now include a responsibility notice in English and Bengali.

Footer redesign: stronger brand headline, subtle decorative rings, navigation cards with arrow accents and keyboard focus styles, and a quieter disclaimer divider. The two-column desktop composition stacks on small screens and uses existing bilingual content without introducing new services or links.

Header refresh: deep emerald header and guidance strip now coordinate with the footer, using a pale logo mark, light navigation text, a visible active-page underline, matching language controls and high-contrast keyboard focus indicators.

Brand identity: the header and footer share a vector globe-and-paper-plane emblem with a two-tone Go Abroad wordmark, implemented in shared/components/brand.ts. The mark is decorative within the existing accessible home links and requires no image downloads or external fonts.

Homepage closing section: a sage panel now pairs a decorative vector travel illustration with the existing headline and Choose your path link. It stacks on small screens and retains the English/Bengali copy and pathways anchor behavior.

Hero refinement: the guidance banner uses light sage with dark text. The decorative globe panel's top label and compass icon are removed. A separate lightweight decorative component adds slow CSS shape movement behind the hero, ignores pointer events and disables animation for reduced-motion preferences.

Job-seeker country guides: questionnaire completion now displays a small official-source research pilot for the UK, Germany and Canada. Country selection uses submitted preferences and an explicit results dropdown. Each card explains a job-application and work-visa route with source links, review status and check dates. This is introductory guidance, not personal visa eligibility or live vacancies. See docs/work-country-guides.md for the file list, data contract and research limitations.

Job education fields: populated dropdowns now use public/data/job-options.json through an injectable, validating JobOptionsRepository. Nine generic education categories and thirteen study fields have English/Bengali labels. Other supports custom answers, including existing free-text drafts. Values retain their original English category labels in the existing self-reported profile contract; no qualification equivalence is inferred. Loading errors offer retry and manual entry.

Job experience: the questionnaire offers no experience and 1-50 years, plus exact-month entry for partial years or longer experience. Existing month-based drafts and profile values are preserved; English and Bengali labels are supported.

Job country selection: Work preferences now uses a localized country dropdown backed by job-options.json, covering Canada, Germany, Netherlands and United Kingdom. Other supports unlisted destinations and preserves older multi-country drafts. Selection remains optional and does not imply work eligibility or guide availability.

Job results now show Assessment result with a concise introduction, the submitted country selected (or its original name when no guide exists), and a top-right Save popup shared with student results. Profile summary cards are removed. Save remains UI-only: no account creation or permanent profile storage is implemented.
