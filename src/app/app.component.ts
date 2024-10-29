import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DEFAULT_PALETTE_CONFIG, PaletteConfig } from './helpers/constants';
import { createDistributionValues, createHueScale, createSaturationScale } from './helpers/scales';
import { hexToHSL, luminanceFromHex, clamp, HSLToHex, unsignedModulo, output, isHex } from './helpers/helpers';
import * as hljs from 'highlight.js';
import { GoogleAnalyticsService } from 'ngx-google-analytics';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Tailwind Pallette';

  hexColor: string = '#17d2e1';
  baseShade: string = '500';
  colorName: string = 'Sample'
  exportFormat: 'hex' | 'p-3' | 'oklch' = 'hex';
  tailwindVersion: string = 'v3';
  shaped: any = {};

  credits: any = [
    {
      title: "Created By",
      name: "Oscar Morales Davis",
      description: "Made with lots of love and dedication for all the developers who use TailwindCSS",
      link: "https://www.linkedin.com/in/oscar-22/",
      year: this.getYear()
    },
    {
      title: "Web Framework",
      name: "Angular v18",
      description: "A web framework that empowers developers to build fast, reliable applications.",
      link: "https://angular.dev"
    },
    {
      title: "CSS framework",
      name: "Indeed TailwindCSS",
      description: "A utility-first CSS framework packed with classes like <code class='bg-zink-50/50 dark:bg-zink-500/40 px-2 py-1 rounded-lg border border-zink-100/50 dark:border-zink-600/50'>flex, pt-4, text-center</code> and <code class='bg-zink-50/50 dark:bg-zink-500/40 px-2 py-1 rounded-lg border border-zink-100/50 dark:border-zink-600/50'>rotate-90</code> that can be composed to build any design, directly in your markup",
      link: "https://tailwindcss.com/"
    },
    {
      title: "Color schemes and palette generation",
      name: "Tints.dev",
      description: "At Tailwind Color Palette, we draw inspiration from the extraordinary Tints.dev project to generate our color palettes.",
      link: "https://www.tints.dev/blue/17D2E1"
    },
    {
      title: "Icons",
      name: "Remix Icon",
      description: "Open-source neutral-style system symbols elaborately crafted for designers and developers. All of the icons are free for both personal and commercial use.",
      link: "https://remixicon.com/"
    },
    {
      title: "Images",
      name: "Unsplash",
      description: "The internet’s source for visuals",
      link: "https://unsplash.com/"
    }
  ]

  showModal: boolean = false;

  chartData: number[] = [40, 64, 75, 55, 96, 65, 20];;

  pallette: {
    '50': string;
    '100': string;
    '200': string;
    '300': string;
    '400': string;
    '500': string;
    '600': string;
    '700': string;
    '800': string;
    '900': string;
    '950': string;
  } | any = {
      "50": "#eafaf1",
      "100": "#d6f5e2",
      "200": "#abedc5",
      "300": "#80e5a8",
      "400": "#53df8b",
      "500": "#4de68a",
      "600": "#27a559",
      "700": "#1e7b43",
      "800": "#14522d",
      "900": "#0a2916",
      "950": "#05140b"
    };
  paletteConfig = {
    id: ``,
    name: this.colorName,
    value: ``,
    valueStop: 500,
    swatches: [],
    h: 0,
    s: 0,
    lMin: 0,
    lMax: 100,
    useLightness: true,
    mode: this.exportFormat
  }

  textCopied: boolean = false;

  constructor(private gaService: GoogleAnalyticsService) {
    this.checkColorScheme();
  }

  ngOnInit(): void {
    this.generatePallette("#17d2e1");
    this.shaped = output(this.paletteConfig, this.exportFormat);
  }

  ngAfterViewInit(): void { }

  checkColorScheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const html = document.querySelector('html');
    if (savedTheme) {
      html?.classList.toggle('dark', savedTheme === 'dark');
      html?.setAttribute('data-theme', savedTheme);
    } else {
      // Aplica el tema del sistema si no hay preferencia guardada
      html?.classList.toggle('dark', prefersDark);
      html?.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  toggleDarkMode() {
    const html = document.querySelector('html');

    if (html) {
      // Alterna la clase `dark`
      html.classList.toggle("dark");

      // Guarda la preferencia en `localStorage`
      const isDark = html.classList.contains("dark");
      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      // Opcional: establece el atributo `data-theme`
      html.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }
  }

  handleBaseShadeChange(value: string) {
    this.pallette = this.createSwatches(this.paletteConfig)
    this.setCSSVariables(this.pallette);
  }
  generatePallette(event: any) {
    if (!isHex(event)) {
      return;
    }
    this.pallette = this.createSwatches(this.paletteConfig);
    this.setCSSVariables(this.pallette);
  }

  createShaped() {
    this.shaped = output(this.paletteConfig, this.exportFormat);
  }

  createSwatches(palette: PaletteConfig | any) {
    const value = this.hexColor,
      valueStop = parseInt(this.baseShade);

    // Tweaks may be passed in, otherwise use defaults
    const useLightness = palette.useLightness ?? DEFAULT_PALETTE_CONFIG.useLightness
    const h = palette.h ?? DEFAULT_PALETTE_CONFIG.h
    const s = palette.s ?? DEFAULT_PALETTE_CONFIG.s
    const lMin = palette.lMin ?? DEFAULT_PALETTE_CONFIG.lMin
    const lMax = palette.lMax ?? DEFAULT_PALETTE_CONFIG.lMax

    // Create hue and saturation scales based on tweaks
    const hueScale = createHueScale(h, valueStop)
    const saturationScale = createSaturationScale(s, valueStop)

    // Get the base hex's H/S/L values
    const { h: valueH, s: valueS, l: valueL } = hexToHSL(value)

    // Create lightness scales based on tweak + lightness/luminance of current value
    const lightnessValue = useLightness ? valueL : luminanceFromHex(value)
    const distributionScale = createDistributionValues(lMin, lMax, lightnessValue, valueStop)

    // @ts-ignore
    const swatches = hueScale.map(({ stop }, stopIndex) => {
      // @ts-ignore
      const newH = unsignedModulo(valueH + hueScale[stopIndex].tweak, 360)
      const newS = clamp(valueS + saturationScale[stopIndex].tweak, 0, 100)
      let newL = useLightness
        // @ts-ignore
        ? distributionScale[stopIndex].tweak
        // @ts-ignore
        : lightnessFromHSLum(newH, newS, distributionScale[stopIndex].tweak)
      newL = clamp(newL, 0, 100)

      const newHex = HSLToHex(newH, newS, newL)

      return {
        stop,
        // Sometimes the initial value is changed slightly during conversion,
        // overriding that with the original value
        // @ts-ignore
        hex: stop === valueStop ? `#${value.toUpperCase()}` : newHex.toUpperCase(),
        // Used in graphs
        h: newH,
        hScale: ((unsignedModulo(hueScale[stopIndex].tweak + 180, 360) - 180) / 180) * 50,
        s: newS,
        // @ts-ignore
        sScale: newS - 50,
        l: newL,
      }
    })
    swatches.forEach(swatch => swatch.hex = swatch.hex.replace(/##/, "#"))
    // @ts-ignore
    this.paletteConfig.swatches = swatches;

    return swatches
  }

  setCSSVariables(palette: []) {
    palette.forEach((color: any) => {
      if (color.stop !== 0 && color.stop !== 1000)
        document.documentElement.style.setProperty(`--primary-${color.stop}`, color.hex.replace("##", "#"));
    })
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  createVersion3Config(colors: Record<string, string>) {
    return JSON.stringify({ colors }, null, 5).replace(/"+[0-9]+"/g, function (m) {
      return m.replace(/"/g, '')
    })
  }

  createVersion4Config(colors: Record<string, string>) {
    return [
      `@theme {`,
      ...Object.entries(colors).map(([colorName]) =>
        Object.entries(colors[colorName])
          .map(
            ([shade, value]) =>
              `  --color-${colorName}-${shade}: ${value.toLocaleLowerCase().replace(' / <alpha-value>', '')};`,
          )
          .join('\n'),
      ),
      `}`,
    ].join('\n')
  }

  highlightCode() {
    const codeElements = document.querySelectorAll('pre');
    if (codeElements) {
      // Establece la clase de lenguaje
      codeElements.forEach(codeElement => {
        codeElement.removeAttribute('data-highlighted');
        codeElement.classList.add("json", "!bg-transparent");
        hljs.default.highlightElement(codeElement);
      })
    }
  }

  copyToClipboard() {
    this.gaService.event('code-copied', 'copied', 'copied', 1);
    const text = this.tailwindVersion == 'v3' ? this.createVersion3Config(this.shaped) : this.createVersion4Config(this.shaped);
    navigator.clipboard.writeText(text)
      .then(() => {
        this.textCopied = true;
        setTimeout(() => {
          this.textCopied = false;
        }, 3000);
      })
      .catch(err => {
        console.error('Error al copiar el texto: ', err);
      });
  }

  getYear() {
    return new Date().getFullYear();
  }

}

