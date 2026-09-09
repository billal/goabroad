import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { LanguageService } from './core/i18n/language.service';
import { Brand } from './shared/components/brand';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Brand],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  readonly i18n = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly main = viewChild<ElementRef<HTMLElement>>('main');
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  readonly menuOpen = signal(false);
  readonly loading = signal(false);
  readonly failedUrl = signal<string | null>(null);
  readonly navigation = [
    { path: '', key: 'home' },
    { path: 'student', key: 'student' },
    { path: 'job-seeker', key: 'jobSeeker' },
  ] as const;
  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loading.set(true);
        this.failedUrl.set(null);
      } else if (event instanceof NavigationEnd) {
        this.loading.set(false);
        this.menuOpen.set(false);
        this.main()?.nativeElement.focus({ preventScroll: true });
      } else if (event instanceof NavigationError) {
        this.loading.set(false);
        this.failedUrl.set(event.url);
      } else if (event instanceof NavigationCancel) {
        this.loading.set(false);
      }
    });
  }
  closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.menuButton()?.nativeElement.focus();
    }
  }
  retry(): void {
    const url = this.failedUrl();
    if (url) void this.router.navigateByUrl(url);
  }
}
