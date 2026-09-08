import { computed, inject, Injectable, Injector, signal } from '@angular/core';
import { PRIMARY_OUTLET, Router, UrlSegment } from '@angular/router';
import { bn, DEFAULT_LANGUAGE, en, Language } from './translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly injector = inject(Injector);
  private readonly current = signal<Language>(DEFAULT_LANGUAGE);
  readonly language = this.current.asReadonly();
  readonly text = computed(() => (this.language() === 'bn' ? bn : en));
  setLanguage(language: Language): void {
    this.current.set(language);
  }
  urlFor(language: Language) {
    const router = this.injector.get(Router);
    const tree = router.parseUrl(router.url);
    const group = tree.root.children[PRIMARY_OUTLET];
    if (!group?.segments.length)
      return router.createUrlTree(['/', language], {
        queryParams: tree.queryParams,
        fragment: tree.fragment ?? undefined,
      });
    group.segments[0] = new UrlSegment(language, group.segments[0].parameters);
    return tree;
  }
}
