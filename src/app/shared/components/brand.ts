import { Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  standalone: true,
  template: `
    <svg viewBox="0 0 56 56" fill="none" aria-hidden="true" focusable="false">
      <circle cx="25" cy="30" r="20" stroke="currentColor" stroke-width="1.2" />
      <path
        d="M5 30h36M25 10c-11 11-11 29 0 40M25 10c6 6 9 15 8 24M10 18c7 5 18 6 26 2M10 42c8-5 19-5 28-1"
        stroke="currentColor"
        stroke-width="1.2"
        opacity=".5"
      />
      <path d="M20 37c9 0 17-5 23-14" stroke="#e9c87f" stroke-width="2" stroke-linecap="round" />
      <path
        d="m32 15 20-9-7 22-5-9-8-4Z"
        fill="#e9c87f"
        stroke="#123e32"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path d="m40 19 6-6" stroke="#123e32" stroke-width="1.3" stroke-linecap="round" />
    </svg>
    <span class="wordmark">Go<span class="abroad">Abroad</span></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      color: #e0eacb;
    }
    svg {
      width: 3rem;
      height: 3rem;
      flex-shrink: 0;
    }
    .wordmark {
      display: flex;
      gap: 0.28em;
      align-items: baseline;
      color: #fffdf4;
      font-size: 1.45rem;
      font-weight: 750;
      letter-spacing: -0.045em;
      line-height: 1.1;
    }
    .abroad {
      color: #dbe7c5;
      font-weight: 550;
    }
    @media (max-width: 25rem) {
      svg {
        width: 2.3rem;
        height: 2.3rem;
      }
      .wordmark {
        font-size: 1.15rem;
      }
      :host {
        gap: 0.4rem;
      }
    }
  `,
})
export class Brand {}
