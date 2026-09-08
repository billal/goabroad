import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/i18n/language.service';
import { PageKey } from '../../../core/i18n/translations';

@Component({
  standalone: true,
  imports: [RouterLink],
  templateUrl: './route-preview.html',
  styleUrl: './route-preview.scss',
})
export class RoutePreview {
  readonly i18n = inject(LanguageService);
  private readonly route = inject(ActivatedRoute);
  private readonly data = toSignal(this.route.data, { initialValue: this.route.snapshot.data });
  readonly page = computed(() => this.data()['page'] as PageKey);
}
