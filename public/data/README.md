# Development sample catalog — not verified information

All ten JSON files are development snapshots. Every envelope has a bilingual notice
and `metadata.isDevelopmentSample: true`. Reference records are draft, unverified,
and explicitly marked `isDevelopmentSample: true`.

There are seven reference samples: Bangladesh, two broad education labels, two
degree labels, and two subjects. Education labels do not establish qualification
equivalence, ranking, or eligibility. Translations are development copy.

The Bangladesh record links to the ISO entry for later manual review. The entry
requires JavaScript and was not independently verified in this task. Both source
`checkedAt` and record `lastCheckedAt` remain null; it has no verification badge.

Cities, institutions, programs, country guides, visa guides, and agencies are empty
collections. No fictional listings, contacts, fees, requirements, or guidance are
supplied. Populate these only with manually reviewed, sourced records in a later
approved content task. Internal schema-test fixtures never ship in these files.

`metadata.lastUpdated` and record `updatedAt` are dataset revision timestamps, not
verification dates. The student questionnaire displays reference options with a
development-sample notice and accepts self-reported alternatives.

## Contract and validation

Contracts: `src/app/core/models/catalog.ts`.
Executable runtime schemas: `decoder.ts` and `catalog-validation.ts` in the same
directory. JSON is parsed as `unknown`, validated, and reconstructed before being
exposed to consumers. Additional object fields are ignored for additive API
compatibility; missing required fields, malformed known fields, and broken
relationships fail validation. Schema version 1.0 is currently supported.

All files use `{ data, pagination, metadata }`. A JSON file contains the complete
collection: page 1, totalItems equal to its length, pageSize at least its length,
and totalPages 0 for empty or 1 for nonempty snapshots. Repository `list()` returns
that envelope; lookup methods return a record or null. This milestone does not
add search, filtering, or an eligibility result type.

Unknown values use explicit null. Empty arrays mean known-empty. A claim stores
`value` plus `sourceIds` referring to its record's `sources`. Known claims on
published records require sources. Sample records cannot be published or verified.
Verification requires checked sources and a last-checked date, but validation
cannot establish the factual accuracy of a source; that needs human review.

IDs/slugs must be lowercase kebab-case and unique within a collection. References
use IDs. Country/currency codes are checked for ISO-style casing and length;
membership in ISO registries still requires content review. Money retains its
currency and period; no conversion is inferred. Dates are valid UTC ISO timestamps.
GPA stores its scale and optional qualification ID, with no equivalence conversion.

## Access and errors

Inject the abstract repositories from `core/repositories/repositories.ts`.
JSON URLs exist only in `json-repositories.ts`. `provideJsonRepositories()` maps
the abstractions to the JSON providers. Future API providers replace those mappings;
components should not depend on the JSON implementations.

The small Phase 1 catalog is loaded once on the first subscription, with all ten
files validated together to detect dangling relationships. A failure in any file
rejects the snapshot. Successful loads are shared for the application lifetime;
reload the application after editing data. Error subscriptions can be retried.
`RepositoryError.code` is `unavailable` for transport/JSON parse failures and
`invalidData` for schema/integrity failures; neither is converted into empty data.
Business/UI layers translate these codes. Draft/sample flags are preserved; future
public-facing features must deliberately select records suitable for display.

Run `npm test -- --watch=false` to validate actual shipped JSON plus malformed-data,
nested-contract, relationship, and repository cases. Run `npm run build` for the
production TypeScript/template check. Test-only JSON imports are excluded from the
application compilation; production access uses HttpClient.

## Language score scales

Language requirements may include `overallScale` and `componentScale`. These are
positive numeric maxima, supplied from reviewed source information. Missing or
null values decode to unknown for compatibility with existing snapshots; no test
scale is inferred. A supplied threshold cannot exceed its corresponding scale.
The matching engine compares only equal scales. Null thresholds remain unknown,
not confirmed exemptions. These optional fields do not change existing JSON data.

## Scholarship availability and public search

Programs may include `scholarshipAvailability: { value: true | false | null,
sourceIds: [...] }`. Omitted fields decode to an unknown claim for compatibility.
Known published claims require sources. Scholarship descriptions never imply
availability or personal eligibility. Search excludes draft/archived/development
programs and programs whose institution is not published or is a development
sample. Current public program and institution collections remain empty.
