/**
 * Shared font registration for the Daily Grace web components.
 *
 * Browsers do not reliably load @font-face rules declared inside a shadow
 * root, so the fonts are registered once on the document instead. Font URLs
 * resolve against this file, not the page, and the call is idempotent.
 */

const font = (path) => new URL(path, import.meta.url).href;

export function registerFonts() {
    if (document.getElementById("daily-grace-fonts")) {
        return;
    }
    const style = document.createElement("style");
    style.id = "daily-grace-fonts";
    // Roboto's Latin subset, and the full font only for the letters beyond it
    // that Roboto has (see assets/styles/styles.css; keep the two in step).
    style.textContent = `
    @font-face {
      font-family: 'Roboto';
      src: url('${font("../fonts/Roboto-Variable.woff2")}') format('woff2'),
           url('${font("../fonts/Roboto-Variable.ttf")}') format('truetype');
      font-weight: 100 900; font-style: normal; font-display: swap;
      unicode-range: U+0100-01B0, U+01F0-01FF, U+0218-021B, U+0237, U+0259,
        U+02C7-02DD, U+02F3-030F, U+0323, U+0384-03D6, U+0400-0513,
        U+1E00-1E01, U+1E3E-1E3F, U+1E80-1E85, U+1E9E-1EF9, U+1F4D,
        U+2070-208E, U+20A3-20C1, U+2105-212E, U+215B-215E, U+2202-222B,
        U+2248, U+2260-2265, U+25A0, U+25CA-25CF, U+FB01-FB04;
    }
    @font-face {
      font-family: 'Roboto';
      src: url('${font("../fonts/Roboto-Variable-Latin.woff2")}') format('woff2');
      font-weight: 100 900; font-style: normal; font-display: swap;
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
        U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
        U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Germania One';
      src: url('${font("../fonts/GermaniaOne-Regular.woff2")}') format('woff2'),
           url('${font("../fonts/GermaniaOne-Regular.ttf")}') format('truetype');
      font-weight: 400; font-style: normal; font-display: swap;
    }
    @font-face {
      font-family: 'Strait';
      src: url('${font("../fonts/Strait-Regular.woff2")}') format('woff2'),
           url('${font("../fonts/Strait-Regular.ttf")}') format('truetype');
      font-weight: 400; font-style: normal; font-display: swap;
    }`;
    document.head.append(style);
}
