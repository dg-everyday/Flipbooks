/**
 * Shared font registration for the Daily Grace web components.
 *
 * Browsers do not reliably load @font-face rules declared inside a shadow
 * root, so the fonts are registered once on the document instead. Font URLs
 * resolve against this file, not the page, and the call is idempotent.
 */

const font = (path) => new URL(path, import.meta.url).href;

export function registerFonts() {
  if (document.getElementById('daily-grace-fonts')) return;
  const style = document.createElement('style');
  style.id = 'daily-grace-fonts';
  style.textContent = `
    @font-face {
      font-family: 'Roboto';
      src: url('${font('../fonts/Roboto-Variable.woff2')}') format('woff2'),
           url('${font('../fonts/Roboto-Variable.ttf')}') format('truetype');
      font-weight: 100 900; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Germania One';
      src: url('${font('../fonts/GermaniaOne-Regular.woff2')}') format('woff2'),
           url('${font('../fonts/GermaniaOne-Regular.ttf')}') format('truetype');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Strait';
      src: url('${font('../fonts/Strait-Regular.woff2')}') format('woff2'),
           url('${font('../fonts/Strait-Regular.ttf')}') format('truetype');
      font-weight: 400; font-style: normal; font-display: swap;
    }`;
  document.head.append(style);
}
