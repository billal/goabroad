import { Component } from '@angular/core';
@Component({
  selector: 'app-hero-shapes',
  standalone: true,
  template:
    '<span class="shape arch"></span><span class="shape tile"></span><span class="shape triangle"></span><span class="shape capsule"></span><span class="shape diamond"></span><span class="shape cross"></span><span class="shape pebble"></span><span class="shape dots"></span>',
  host: { 'aria-hidden': 'true' },
  styles: `
    :host {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 100vw;
      transform: translateX(-50%);
      z-index: -1;
      overflow: hidden;
      pointer-events: none;
      background:
        radial-gradient(ellipse at 5% 20%, #e4ecd85c, transparent 38%),
        radial-gradient(ellipse at 95% 80%, #f0e5c75c, transparent 35%);
    }
    .shape {
      position: absolute;
      display: block;
      animation: glide 22s ease-in-out infinite alternate;
    }
    .arch {
      width: clamp(7rem, 15vw, 17rem);
      height: 21rem;
      left: -3%;
      top: 12%;
      border: 1px solid #9db59750;
      border-radius: 10rem 10rem 2rem 2rem;
      background: #dce6d026;
      transform: rotate(-18deg);
    }
    .tile {
      width: 7rem;
      height: 7rem;
      left: 18%;
      top: 4%;
      background: #d8e4ca30;
      border-radius: 1.3rem;
      animation-delay: -9s;
    }
    .triangle {
      width: 6rem;
      height: 5rem;
      left: 45%;
      top: 12%;
      background: #d7bc7130;
      clip-path: polygon(50% 0, 100% 100%, 0 100%);
      animation-delay: -5s;
    }
    .capsule {
      width: 5rem;
      height: 13rem;
      right: 4%;
      top: 4%;
      border: 1px solid #a1b89955;
      border-radius: 5rem;
      background: #dde8d128;
      animation-delay: -12s;
    }
    .diamond {
      width: 9rem;
      height: 9rem;
      right: -2%;
      bottom: 10%;
      border: 1px solid #c1ab7350;
      border-radius: 1rem;
      animation-delay: -4s;
    }
    .cross {
      width: 2rem;
      height: 2rem;
      left: 8%;
      bottom: 17%;
      background: #a6ba9255;
      clip-path: polygon(
        40% 0,
        60% 0,
        60% 40%,
        100% 40%,
        100% 60%,
        60% 60%,
        60% 100%,
        40% 100%,
        40% 60%,
        0 60%,
        0 40%,
        40% 40%
      );
      animation-delay: -15s;
    }
    .pebble {
      width: 8rem;
      height: 5rem;
      left: 40%;
      bottom: 5%;
      border-radius: 65% 35% 40% 60%;
      background: #dfcc9830;
      animation-delay: -7s;
    }
    .dots {
      width: 5rem;
      height: 5rem;
      right: 11%;
      bottom: 4%;
      background: radial-gradient(#94ae8c55 1.5px, transparent 2px) 0 0 / 14px 14px;
      animation-delay: -10s;
    }
    @keyframes glide {
      from {
        translate: 0 0;
        rotate: -12deg;
      }
      to {
        translate: 1rem -2rem;
        rotate: 18deg;
      }
    }
    @media (max-width: 40rem) {
      .shape {
        opacity: 0.6;
      }
      .arch {
        left: -5rem;
      }
      .capsule {
        right: -2rem;
      }
      .tile {
        width: 4rem;
        height: 4rem;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .shape {
        animation: none;
      }
    }
  `,
})
export class HeroShapes {}
