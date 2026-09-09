import type { CatalogRecord, Collection, LocalizedText } from './catalog';
import * as D from './decoder';

export interface WorkGuide extends CatalogRecord {
  readonly countryCode: string;
  readonly aliases: readonly string[];
  readonly route: LocalizedText;
  readonly steps: readonly { readonly text: LocalizedText; readonly sourceId: string }[];
  readonly jobSourceId: string;
  readonly visaSourceId: string;
}
const localized = D.object<LocalizedText>({ en: D.text, bn: D.nullable(D.text) });
const guide = D.object<WorkGuide>({
  id: D.id,
  slug: D.id,
  name: localized,
  countryCode: D.pattern(/^[A-Z]{2}$/),
  aliases: D.array(D.text),
  route: localized,
  publicationStatus: D.oneOf('draft', 'published', 'archived'),
  verificationStatus: D.oneOf('unverified', 'needsReview', 'verified'),
  isDevelopmentSample: D.boolean,
  lastCheckedAt: D.nullable(D.timestamp),
  updatedAt: D.timestamp,
  sources: D.array(
    D.object({ id: D.id, title: D.text, url: D.url, checkedAt: D.nullable(D.timestamp) }),
  ),
  steps: D.array(D.object({ text: localized, sourceId: D.id })),
  jobSourceId: D.id,
  visaSourceId: D.id,
});
export function decodeWorkGuides(value: unknown): Collection<WorkGuide> {
  const result = D.object<Collection<WorkGuide>>({
    data: D.array(guide),
    pagination: D.object({
      page: D.positiveInteger,
      pageSize: D.positiveInteger,
      totalItems: D.integer,
      totalPages: D.integer,
    }),
    metadata: D.object({
      version: D.text,
      lastUpdated: D.timestamp,
      isDevelopmentSample: D.boolean,
      notice: D.nullable(localized),
    }),
  })(value, 'workGuides');
  for (const field of ['id', 'slug', 'countryCode'] as const) {
    if (new Set(result.data.map((g) => g[field])).size !== result.data.length)
      D.fail(field, 'duplicate');
  }
  if (
    result.pagination.totalItems !== result.data.length ||
    result.pagination.page !== 1 ||
    result.pagination.pageSize < result.data.length ||
    result.pagination.totalPages !== (result.data.length ? 1 : 0)
  )
    D.fail('pagination', 'expected complete static collection');
  for (const g of result.data) {
    const ids = new Set(g.sources.map((s) => s.id));
    if (ids.size !== g.sources.length || !g.steps.length)
      D.fail(g.id, 'invalid sources or empty steps');
    for (const id of [g.jobSourceId, g.visaSourceId, ...g.steps.map((s) => s.sourceId)])
      if (!ids.has(id)) D.fail(g.id, 'missing source');
    if (!g.lastCheckedAt || g.sources.some((s) => !s.checkedAt)) D.fail(g.id, 'missing check date');
    if (
      g.isDevelopmentSample &&
      (g.publicationStatus !== 'draft' || g.verificationStatus === 'verified')
    )
      D.fail(g.id, 'sample must remain a draft');
  }
  return result;
}

/** Exact editorial country aliases only; this never evaluates work/visa eligibility. */
export function selectWorkGuides(
  guides: readonly WorkGuide[],
  country: string,
  preferences: readonly string[] | null,
): readonly WorkGuide[] {
  const visible = guides.filter((g) => g.publicationStatus !== 'archived');
  if (country === 'all') return visible;
  if (country) return visible.filter((g) => g.countryCode === country);
  if (!preferences?.length) return visible;
  const names = preferences.map((p) => p.trim().toLocaleLowerCase('en'));
  return visible.filter((g) =>
    [g.name.en, g.name.bn ?? '', g.countryCode, ...g.aliases].some((n) =>
      names.includes(n.toLocaleLowerCase('en')),
    ),
  );
}
