import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../core/i18n/language.service';
import { Horizon } from './horizon';
import { Icon } from '../../shared/components/icon';
import { homeText } from './home-text';
@Component({
  standalone: true,
  imports: [RouterLink, Icon, Horizon],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly i18n = inject(LanguageService);
  readonly copy = computed(() => homeText[this.i18n.language()]);
}
