import { Component, input } from '@angular/core';
const paths = {
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z',
  study: 'm2 9 10-5 10 5-10 5-10-5Zm4 2v6c4 3 8 3 12 0v-6m4-2v7',
  work: 'M8 7V4h8v3M3 7h18v13H3V7Zm0 5c6 4 12 4 18 0M10 13h4v3h-4v-3Z',
  check: 'm5 12 4 4L19 6',
  document: 'M14 3H5v18h14V8l-5-5Zm0 0v5h5M8 12h8m-8 4h6',
  compass: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-6-3-2 4-4 2 2-4 4-2Z',
  lock: 'M6 10h12v11H6V10Zm2 0V6a4 4 0 0 1 8 0v4m-4 5v2',
} as const;
@Component({
  selector: 'app-icon',
  standalone: true,
  template:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path [attr.d]="paths[name()]" /></svg>',
  styles:
    ':host { display:inline-flex; width:1.5rem; height:1.5rem; flex-shrink:0; } svg { width:100%; height:100%; }',
})
export class Icon {
  readonly name = input.required<keyof typeof paths>();
  protected readonly paths = paths;
}
