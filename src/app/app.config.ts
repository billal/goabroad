import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { LocalizedTitleStrategy } from './core/i18n/localized-title.strategy';
import { provideHttpClient } from '@angular/common/http';
import { provideJsonRepositories } from './core/repositories/json-repositories';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    ...provideJsonRepositories(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: LocalizedTitleStrategy },
  ],
};
