import { Component, input } from '@angular/core';
import { Icon } from '../../shared/components/icon';
interface HorizonText {
  readonly graphicCaption: string;
  readonly graphicTitle: string;
  readonly graphicNote: string;
}
@Component({
  selector: 'app-horizon',
  standalone: true,
  imports: [Icon],
  templateUrl: './horizon.html',
  styleUrl: './horizon.scss',
})
export class Horizon {
  readonly text = input.required<HorizonText>();
}
