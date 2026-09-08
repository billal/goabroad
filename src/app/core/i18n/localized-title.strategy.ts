import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE, isLanguage, PageKey } from './translations';

@Injectable()
export class LocalizedTitleStrategy extends TitleStrategy {
  private readonly language = inject(LanguageService);
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    let route = snapshot.root;
    let lang = DEFAULT_LANGUAGE;
    while (route.firstChild) {
      route = route.firstChild;
      const value = route.paramMap.get('lang');
      if (isLanguage(value)) lang = value;
    }
    this.language.setLanguage(lang);
    this.document.documentElement.lang = lang;
    const page = (route.data['page'] ?? 'notFound') as PageKey;
    this.title.setTitle(`${this.language.text()[page]} | Go Abroad`);
    this.meta.updateTag({ name: 'description', content: this.language.text().intro });
    // Development previews must not appear as published information in search results.
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }
}
