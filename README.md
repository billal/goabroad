# Go Abroad

Angular-only Phase 1 application for Bangladeshi students. The Angular workspace lives directly in this repository root. Read AGENTS.md and PROJECT_BRIEF.md before making changes.

## Current milestone

The Angular foundation, bilingual shell, and data foundation are implemented. The student questionnaire milestone adds a typed, multi-step Reactive Form at `/en/student` and `/bn/student`, with validation, review/edit, and temporary draft restoration. Eligibility matching remains for the next milestone.

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

The foundation and data-access milestones are implemented. Content population is limited to unverified reference samples; real institution/program/agency and guide collections remain empty.

## Milestone 2 behavior

The responsive shell, bilingual home preview, lazy route previews, and localized not-found page are implemented. All routes in PROJECT_BRIEF.md resolve under /en and /bn. The student route now contains the questionnaire; matching, search, and comparison remain previews.

English (/en) is the default. Missing language prefixes are added while preserving the path. Unsupported locale-shaped prefixes such as /fr or /en-US are replaced with /en. Unknown paths display a localized not-found page. Language switching preserves the current path, slug, query parameters, and fragment. Language selection is URL-based and is not persisted in browser storage.

UI translations live in core/i18n/translations.ts with compile-time key parity. The document language, page title, and description follow the route. Development pages carry noindex/nofollow metadata. The mobile menu supports Escape, active navigation is identified in text styling and aria-current, and a skip link and main-content focus support keyboard navigation. Loading and route-load failure states include a retry action.

Static hosting will need SPA deep-link fallback when deployment is approved. The matching engine has not started.

## Data foundation

Strongly typed contracts and runtime decoders live in `src/app/core/models`. Injectable repository abstractions and JSON providers live in `src/app/core/repositories`. Components access data through these abstractions and do not fetch JSON directly. No new runtime dependencies were added.

Tests import and validate the actual public JSON files, exercise malformed data and relationships, and verify HTTP failures, retry, shared loading, and provider replacement. Seven draft reference records are supplied; no institution, program, agency, contact, fee, admission requirement, or visa claim was invented. Empty entity collections are intentional and are not a completed content seed milestone.

## Student questionnaire

Implementation and tests live in `src/app/features/student-assessment/`. Four input steps cover background, academics, language tests, and study preferences, followed by review and editing. Budget includes an explicit currency; work experience uses months. Academic and language scores retain their entered scales, including a separate scale for optional language components. No score conversion or eligibility inference occurs. Bengali and Latin numeric input are accepted.

Reference options come from repository abstractions and carry a development-sample notice. “Not listed” accepts self-reported names without treating them as verified references or equivalent qualifications. Multiple destination names, cities, and subject interests can be entered as comma-separated lists. No new catalog records are added.

An unfinished draft uses only the `go-abroad.assessment.v1` sessionStorage key and expires after 24 hours without activity. Invalid or expired drafts are discarded; unavailable storage falls back to memory with a visible notice. Review completion clears the draft and retains the typed profile only in the current component's memory. Nothing is submitted, and no eligibility results are produced. Clearing an unfinished draft requires an inline confirmation.

Questionnaire tests cover conditional validation, original score scales, Bengali digits, unknown and zero values, invalid inputs, storage expiry/corruption/unavailability, progression, review/edit, language changes, restoration, and repository loading failures.
