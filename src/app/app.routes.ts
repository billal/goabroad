import { inject } from '@angular/core';
import { RedirectFunction, Router, Routes } from '@angular/router';
import { DEFAULT_LANGUAGE, isLanguage, PageKey } from './core/i18n/translations';

const preview = (path: string, page: PageKey) => ({
  path,
  data: { page },
  loadComponent: () =>
    import('./shared/components/route-preview/route-preview').then((m) => m.RoutePreview),
});

const defaultLanguageRedirect: RedirectFunction = ({ url, queryParams, fragment }) => {
  const paths = url.map((segment) => segment.path);
  const first = paths[0] ?? '';
  // Replace unsupported locale-shaped prefixes; retain unprefixed paths.
  if (/^[a-z]{2}(?:-[a-z]{2})?$/i.test(first)) paths.shift();
  return inject(Router).createUrlTree(['/', DEFAULT_LANGUAGE, ...paths], {
    queryParams,
    fragment: fragment ?? undefined,
  });
};

export const routes: Routes = [
  {
    path: ':lang',
    canMatch: [(_route, segments) => isLanguage(segments[0]?.path)],
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { page: 'home' },
        loadComponent: () => import('./features/home/home').then((m) => m.Home),
      },
      {
        path: 'student',
        data: { page: 'student' },
        loadComponent: () =>
          import('./features/student-assessment/student-assessment').then(
            (m) => m.StudentAssessment,
          ),
      },
      {
        path: 'job-seeker',
        data: { page: 'jobSeeker' },
        loadComponent: () => import('./features/job-seeker/job-seeker').then((m) => m.JobSeeker),
      },
      preview('institutions/:slug', 'institution'),
      preview('countries/:slug/visa', 'visa'),
      preview('countries/:slug', 'country'),
      preview('**', 'notFound'),
    ],
  },
  { path: '**', redirectTo: defaultLanguageRedirect },
];
