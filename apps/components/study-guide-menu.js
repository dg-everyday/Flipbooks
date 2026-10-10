/**
 * <study-guide-menu> — the Bible Study Guides menu, with its Help and About
 * popups, as a web component.
 *
 * The menu is a drawer that slides in from the left edge of the page column:
 * the screen's edge on a phone, the top left of the centred page on a desktop
 * or wide tablet. The study guide pages sit at the top; Help and About sit at
 * the foot, under a rule. It has no close button: a swipe to the left, a tap
 * on the page beside it, or Escape closes it.
 *
 * Help and About replace the menu rather than stacking on top of it.
 *   Help     A guide to the page's taps, holds and swipes. It slides in from
 *            the right edge and back out the way it came. It is read, and
 *            scrolled, so only its close button, the backdrop or Escape
 *            closes it. Its icons echo the real controls, red for the round
 *            banner buttons, so they are easy to spot on the page.
 *   About    The story of Daily Grace. It grows out of the opener and shrinks
 *            back into it. Each section rises into view as it is scrolled to,
 *            the gold line along the top fills as the reader goes, and a
 *            compact header takes over from the big title, as the Help
 *            header does. Its reference opens the passage in <verse-popup>.
 *
 * Usage
 *   <button id="menu-open" aria-haspopup="dialog" aria-expanded="false"
 *           aria-controls="site-menu">…</button>
 *   <study-guide-menu id="site-menu" opener="menu-open"></study-guide-menu>
 *   <script type="module" src="./apps/components/study-guide-menu.js"></script>
 *
 * Attributes
 *   opener   id of the button that opens the menu. A click on it opens the
 *            menu, its aria-expanded follows the menu, focus returns to it on
 *            close, and About grows out of it. Its focus ring is kept only
 *            when the menu was opened from the keyboard.
 *   open     Set by the component while the menu, Help or About is open
 *            (read-only); the page uses it to stop the page behind scrolling.
 *
 * Methods      open()       slide the menu in
 *              close()      slide it out; resolves once it has closed
 *              showHelp()   open Help
 *              showAbout()  open About
 * Events       begin        About's "Begin today's reading" was tapped; About
 *                           has already closed
 *
 * Adding a guide: add an entry to GUIDES below, with its page in apps/pages
 * and its icon in assets/images/study-guide-icons. Describe it in HELP_HTML's
 * "The menu" too.
 *
 * Fonts: Germania One (titles) and Roboto (text) are registered on the
 * document by assets/scripts/fonts.js, because browsers do not reliably load
 * @font-face rules declared inside a shadow root.
 *
 * Colours: the page's --navy, --ink, --cream, --gold, --gold-light, --action
 * and --action-ink (assets/styles/styles.css), which inherit into the shadow
 * root. The drawer is placed against the page's --page-width.
 */

import { registerFonts } from '../../assets/scripts/fonts.js';
import { PILL_STYLES, linkScripture } from './scripture-refs.js?v=20261002-1';

const asset = (path) => new URL(path, import.meta.url).href;

const EMBLEM_URL = asset('../../assets/images/dg-icon-gold-256.webp');
// GUIDES' pages and icons sit under these. assets/scripts/check-assets.mjs reads
// both lines to check every guide's files, so keep their form.
const PAGES = '../pages/';
const ICONS = '../../assets/images/study-guide-icons/';

// The study guides, in menu order: page in apps/pages, icon in
// assets/images/study-guide-icons.
const GUIDES = [
  {
    page: 'bible-books.html',
    icon: 'books-of-the-bible.webp',
    title: 'Books of the Bible',
    text: 'All 66 books: who wrote them, when, and why',
  },
  {
    page: 'bible-characters.html',
    icon: 'bible-characters.webp',
    title: 'Bible Characters',
    text: 'The people of the Bible, from Adam to the first church, and why they matter',
  },
  {
    page: 'peoples.html',
    icon: 'peoples-of-the-bible.webp',
    title: 'Peoples of the Bible',
    text: 'The nations of Scripture and where they lived',
  },
  {
    page: 'bible-prayers.html',
    icon: 'prayers-in-the-bible.webp',
    title: 'Prayers in the Bible',
    text: 'The prayers Jesus taught and prayed, and how to pray them today',
  },
  {
    page: 'poems-songs-and-wisdom.html',
    icon: 'poems-songs-and-wisdom.webp',
    title: 'Poems, Songs and Wisdom',
    text: "The Bible's poems, songs and proverbs, and what they mean for daily life",
  },
  {
    page: 'red-lettered-quotes.html',
    icon: 'red-lettered-quotes.webp',
    title: 'Red-Lettered Quotes',
    text: 'The words of Jesus, explained in plain words',
  },
  {
    page: 'heroes-and-villains.html',
    icon: 'heroes-and-villains.webp',
    title: 'Heroes and Villains',
    text: 'The people who stood for God, and against him',
  },
  {
    page: 'flora-and-fauna.html',
    icon: 'flora-and-fauna.webp',
    title: 'Flora and Fauna',
    text: 'The plants and animals of the Bible, and why they matter',
  },
  {
    page: 'did-you-know.html',
    icon: 'did-you-know.svg',
    title: 'Did You Know',
    text: 'Surprising facts from every book of the Bible, with the verse behind each one',
  },
  {
    page: 'bible-sayings.html',
    icon: 'bible-sayings.svg',
    title: 'Bible Sayings',
    text: 'Everyday phrases that come from the Bible, and what they mean',
  },
  {
    page: 'supernaturals.html',
    icon: 'supernaturals-and-prophecies.webp',
    title: 'Supernaturals and Prophecies',
    text: 'Miracles, healings, demons cast out, prophecies fulfilled, and special topics on angels and demons',
  },
  {
    page: 'commandments-of-god.html',
    icon: 'commandments-of-god.webp',
    title: 'Commandments of God',
    text: 'The Ten Commandments, and the commands of Jesus and the apostles for daily life',
  },
  {
    page: 'guidance-for-life.html',
    icon: 'guidance-for-life.webp',
    title: 'Questions We All Ask',
    text: 'From worry to what comes after, answered by Jesus, the prophets, the apostles, the wisdom books and the Law',
  },
  {
    page: 'following-gods-blueprint.html',
    icon: 'following-gods-blueprint.webp',
    title: "Following God's Blueprint",
    text: "God's plan to build on: salvation, every day, solving problems his way, and getting ready for Christ's return",
  },
];

const STYLES = /* css */ `
  :host { display: contents; }
  * { box-sizing: border-box; }

  /* ---------------------------------------------------------------- menu */

  /* Menu: the DG icon opens a drawer from the left edge of the page column, which
     is the screen's edge on a phone and the top left of the centred page on a
     desktop or wide tablet. The study pages sit at the top; Help and About sit at
     the foot, under a rule. It reuses Help's emblem, eyebrow and round icons.
     While it is open the page has no scrollbar, so 100vw is the width the page
     is centred in. */
  .menu-dialog {
    position: fixed;
    inset: 0 auto 0 max(0px, (100vw - var(--page-width, 720px)) / 2);
    width: min(340px, 86vw);
    height: 100vh;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0 20px 20px 0;
    background:
      radial-gradient(120% 60% at 0% 0%, #fffaf0 0%, transparent 60%),
      var(--cream);
    color: var(--ink);
    box-shadow: 18px 0 50px rgb(0 27 52 / 35%);
    font-family: 'Roboto', Arial, sans-serif;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* Horizontal moves are the swipe that closes it. */
    touch-action: pan-y;
  }
  .menu-dialog[open] { display: flex; flex-direction: column; }
  .menu-dialog::backdrop {
    background: rgb(0 27 52 / 55%);
    backdrop-filter: blur(3px);
  }
  .menu-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 12px 16px 20px;
    border-bottom: 1px solid rgb(198 146 46 / 45%);
  }
  .menu-header h2 {
    margin: 0;
    color: var(--navy);
    font: 400 1.75rem/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  /* In the menu the eyebrow sits under the title, so it needs space above, not below. */
  .menu-header .help-eyebrow { margin: 6px 0 0; }
  .menu-nav {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 14px 12px calc(18px + env(safe-area-inset-bottom));
  }
  /* Items sit close, so the list reads as one menu; each stays a comfortable tap target. */
  .menu-list { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
  /* Help and About sit at the foot of the drawer, under a rule. */
  .menu-foot {
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid rgb(0 27 52 / 22%);
  }
  .menu-item {
    display: flex;
    /* The icon sits beside the title, not halfway down the description. */
    align-items: flex-start;
    gap: 14px;
    width: 100%;
    padding: 7px 12px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: var(--navy);
    font: inherit;
    text-align: left;
    text-decoration: none;
    cursor: pointer;
    transition: background-color .15s ease;
  }
  /* Help and About are a single line, so they stay centred on the icon. */
  .menu-foot .menu-item { align-items: center; }
  /* Menu icons are pictures of their own (assets/images/study-guide-icons),
     so they sit straight on the drawer without the white circle; About keeps
     the DG emblem at its own size. */
  .menu-item .help-icon { border: 0; background: none; }
  .help-icon .menu-icon { width: 36px; height: 36px; }
  .menu-item:hover { background: rgb(255 255 255 / 70%); }
  .menu-item:focus-visible { outline: 2px solid var(--navy); outline-offset: 1px; }
  .menu-text { display: grid; gap: 2px; min-width: 0; }
  .menu-text strong { font-size: 1rem; font-weight: 700; }
  /* Tight leading, so a description that wraps to two or three lines reads as one block. */
  .menu-text small { color: rgb(16 37 59 / 72%); font-size: .8125rem; line-height: 1.15; }

  /* ---------------------------------------------------------------- help */

  /* Help: "Help" in the menu opens a guide to the page's taps, holds and
     swipes. Its icons echo the real controls, red for the round banner buttons,
     so they are easy to spot on the page. */
  .help-dialog {
    width: min(580px, 94vw);
    max-height: 90vh;
    max-height: 90dvh;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 28px 70px rgb(0 27 52 / 45%);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .help-dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(4px);
  }
  .help-body {
    padding: 0 22px 30px;
    font-family: 'Roboto', Arial, sans-serif;
  }
  /* The title stays put while the list scrolls under it. It wears the About
     page's colours: the emblem on the same lit paper, the name in Germania One. */
  .help-header {
    position: sticky;
    top: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 -22px;
    padding: 16px 12px 14px 20px;
    background:
      radial-gradient(90% 140% at 30% 0%, #fffaf0 0%, transparent 70%),
      linear-gradient(180deg, #f8efdd, var(--cream));
    border-bottom: 1px solid rgb(198 146 46 / 45%);
    box-shadow: 0 6px 12px -8px rgb(0 27 52 / 18%);
  }
  .help-emblem {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    object-fit: contain;
    filter: drop-shadow(0 4px 8px rgb(198 146 46 / 35%));
  }
  .help-heading { flex: 1; min-width: 0; }
  .help-eyebrow {
    margin: 0 0 3px;
    color: #805b18;
    font: 700 .625rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .24em;
    text-transform: uppercase;
  }
  .help-header h2 {
    margin: 0;
    color: var(--navy);
    font: 400 clamp(1.5rem, 1.3rem + 1vw, 1.875rem)/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .help-close {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(243 231 210 / 82%);
    color: var(--navy);
    box-shadow: 0 2px 10px rgb(0 27 52 / 18%);
    cursor: pointer;
    transition: background-color .15s ease, transform .2s ease;
  }
  .help-close:hover { background: #fff; transform: rotate(90deg); }
  .help-close:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
  .help-close svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }
  .help-body h3 {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 22px 0 4px;
    color: #805b18;
    font-size: .75rem;
    font-weight: 700;
    letter-spacing: .14em;
    text-transform: uppercase;
  }
  /* A gold rule trailing each heading out to the edge, as on the About page. */
  .help-body h3::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgb(198 146 46 / 65%), transparent);
  }
  .help-list { margin: 0; padding: 0; list-style: none; }
  .help-list li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 11px 0;
  }
  .help-list li + li { border-top: 1px solid rgb(0 27 52 / 8%); }
  .help-list p {
    margin: 0;
    font-size: .9375rem;
    line-height: 1.5;
  }
  .help-list strong { color: var(--navy); }
  .help-icon {
    display: grid;
    flex: 0 0 auto;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1.5px solid rgb(0 27 52 / 22%);
    border-radius: 50%;
    background: #fff;
    color: var(--navy);
  }
  /* The round banner buttons: the Flipbook link, the poster's play, the refresh. */
  .help-icon.action {
    border-color: transparent;
    background: var(--action);
    color: var(--action-ink);
    box-shadow: 0 3px 8px rgb(0 0 0 / 22%);
  }
  /* A bookmarked verse's gold ribbon. */
  .help-icon.gold { border-color: var(--gold); color: var(--gold); }
  .help-icon svg {
    width: 18px;
    height: 18px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .help-icon.gold svg { fill: var(--gold-light); }
  .help-icon .help-fill { fill: currentColor; stroke: none; }
  .help-icon img { width: 26px; height: 26px; object-fit: contain; }

  /* --------------------------------------------------------------- about */

  .about-dialog {
    width: min(600px, 94vw);
    max-height: 90vh;
    max-height: 90dvh;
    padding: 0;
    border: 0;
    border-radius: 20px;
    background: var(--cream);
    color: var(--ink);
    box-shadow: 0 28px 70px rgb(0 27 52 / 45%);
    overflow: auto;
    overscroll-behavior: contain;
  }
  .about-dialog::backdrop {
    background: rgb(0 27 52 / 62%);
    backdrop-filter: blur(4px);
  }
  /* A zero-height bar that sticks to the top while the story scrolls under it,
     carrying the compact header, the reading progress line and the close button. */
  .about-bar {
    position: sticky;
    top: 0;
    z-index: 2;
    height: 0;
  }
  /* Once the big title has scrolled away, a compact one slides down in its
     place, laid out like the Help header, and the story scrolls beneath it. */
  .about-mini {
    position: absolute;
    inset: 0 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 64px 14px 20px;
    background:
      radial-gradient(90% 140% at 30% 0%, #fffaf0 0%, transparent 70%),
      linear-gradient(180deg, #f8efdd, var(--cream));
    border-bottom: 1px solid rgb(198 146 46 / 45%);
    box-shadow: 0 6px 12px -8px rgb(0 27 52 / 18%);
    opacity: 0;
    transform: translateY(-100%);
    transition: transform .4s cubic-bezier(.22, 1, .36, 1), opacity .25s ease;
    pointer-events: none;
  }
  .about-dialog.condensed .about-mini {
    opacity: 1;
    transform: none;
    pointer-events: auto;
  }
  .about-mini-title {
    margin: 0;
    color: var(--navy);
    font: 400 clamp(1.5rem, 1.3rem + 1vw, 1.875rem)/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .about-progress {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    transform: scaleX(var(--read, 0));
    transform-origin: left;
  }
  .about-close {
    position: absolute;
    top: 15px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgb(243 231 210 / 82%);
    color: var(--navy);
    box-shadow: 0 2px 10px rgb(0 27 52 / 18%);
    backdrop-filter: blur(4px);
    cursor: pointer;
    transition: background-color .15s ease, transform .2s ease;
  }
  .about-close:hover { background: #fff; transform: rotate(90deg); }
  .about-close:focus-visible { outline: 2px solid var(--navy); outline-offset: 2px; }
  .about-close svg {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .about-hero {
    display: grid;
    justify-items: center;
    padding: 40px 24px 18px;
    background:
      radial-gradient(90% 70% at 50% 0%, #fffaf0 0%, transparent 70%),
      linear-gradient(180deg, #f8efdd, var(--cream));
    border-bottom: 1px solid rgb(198 146 46 / 45%);
    text-align: center;
  }
  .about-hero img {
    width: 84px;
    height: 84px;
    object-fit: contain;
    filter: drop-shadow(0 8px 16px rgb(198 146 46 / 35%));
  }
  .about-eyebrow {
    margin: 14px 0 2px;
    color: #805b18;
    font: 700 .6875rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .28em;
    text-transform: uppercase;
  }
  .about-hero h2 {
    margin: 0;
    color: var(--navy);
    font: 400 clamp(2.5rem, 2.1rem + 2vw, 3.25rem)/1.05 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .about-tagline {
    margin: 6px 0 0;
    color: var(--ink);
    font: italic 1.0625rem/1.4 Georgia, 'Times New Roman', serif;
  }

  .about-body {
    padding: 6px 26px 34px;
    font: 1.0625rem/1.75 Georgia, 'Times New Roman', serif;
  }
  .about-body p { margin: 0 0 14px; }
  .about-body strong { color: var(--navy); }
  .about-section { padding-top: 26px; }
  .about-section h3 {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 0 12px;
    color: var(--navy);
    font: 500 1.375rem/1.25 Georgia, 'Times New Roman', serif;
  }
  /* A gold rule trailing each heading out to the edge. */
  .about-section h3::after {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgb(198 146 46 / 65%), transparent);
  }
  /* The one-line answer to "What is Daily Grace?" is the point of the whole
     page, so it sits in a lit, gold-edged card of its own. Two classes, to win
     over the plain paragraph margins of .about-body p. */
  .about-body .about-lead {
    margin: 4px -6px 22px;
    padding: 18px 20px;
    border: 1.5px solid rgb(198 146 46 / 55%);
    border-radius: 16px;
    background:
      radial-gradient(120% 90% at 0% 0%, #fffaf0 0%, transparent 65%),
      linear-gradient(180deg, #fbf3e3, #f6ead3);
    box-shadow: 0 12px 26px -14px rgb(0 27 52 / 35%), inset 0 1px 0 rgb(255 255 255 / 70%);
    color: var(--navy);
    font-size: 1.25rem;
    line-height: 1.55;
  }
  .about-lead::first-letter {
    float: left;
    margin: 6px 10px 0 0;
    color: var(--gold);
    font: 400 3.9rem/.8 'Germania One', Georgia, serif;
  }

  /* The pocket Bible is the heart of the story, so it gets the navy card. */
  .about-pocket {
    position: relative;
    margin: 30px -6px 4px;
    padding: 26px 22px 20px;
    border-radius: 16px;
    background:
      radial-gradient(120% 80% at 100% 0%, rgb(225 182 93 / 18%), transparent 60%),
      var(--navy);
    color: var(--cream);
    box-shadow: 0 14px 30px rgb(0 27 52 / 28%);
  }
  .about-pocket h3 {
    margin: 0 0 12px;
    color: var(--gold-light);
    font: 400 1.75rem/1.1 'Germania One', Georgia, serif;
    letter-spacing: .02em;
  }
  .about-pocket strong { color: var(--gold-light); }
  .about-pocket-icon {
    position: absolute;
    top: -20px;
    right: 22px;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--gold);
    color: var(--navy);
    box-shadow: 0 6px 14px rgb(0 0 0 / 30%);
  }
  .about-pocket-icon svg {
    width: 22px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  /* Each point hangs from a gold bookmark ribbon. */
  .about-ribbons { margin: 4px 0 16px; padding: 0; list-style: none; }
  .about-ribbons li {
    position: relative;
    padding: 10px 0 10px 34px;
  }
  .about-ribbons li + li { border-top: 1px solid rgb(243 231 210 / 12%); }
  .about-ribbons li::before {
    content: "";
    position: absolute;
    top: 14px;
    left: 4px;
    width: 14px;
    height: 20px;
    background: linear-gradient(180deg, var(--gold-light), var(--gold));
    clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%);
  }
  .about-ribbons strong { display: block; }
  .about-body .about-heirloom {
    margin: 0;
    padding-top: 16px;
    border-top: 1px dashed rgb(225 182 93 / 45%);
    color: rgb(243 231 210 / 88%);
    font-style: italic;
  }

  .about-list { margin: 0; padding: 0; list-style: none; }
  .about-list li {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 10px 0;
  }
  .about-list li + li { border-top: 1px solid rgb(0 27 52 / 8%); }
  .about-list p { margin: 0; }
  .about-list .help-icon { margin-top: 2px; }

  .about-steps {
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
    counter-reset: step;
  }
  .about-steps li {
    position: relative;
    margin-bottom: 18px;
    padding-left: 52px;
    counter-increment: step;
  }
  .about-steps li::before {
    content: counter(step);
    position: absolute;
    top: 0;
    left: 0;
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1.5px solid var(--gold);
    border-radius: 50%;
    background: #fff;
    color: #805b18;
    font: 400 1.125rem/1 Georgia, 'Times New Roman', serif;
  }
  .about-steps strong { display: block; }

  .about-verse {
    position: relative;
    margin: 40px 0 8px;
    padding: 30px 12px 22px;
    border-block: 1px solid rgb(198 146 46 / 55%);
    text-align: center;
  }
  .about-verse::before {
    content: "\\201C";
    position: absolute;
    top: -.55em;
    left: 50%;
    padding: 0 12px;
    background: var(--cream);
    color: var(--gold);
    font: 4rem/1 Georgia, 'Times New Roman', serif;
    transform: translateX(-50%);
  }
  .about-verse p {
    margin: 0;
    color: var(--navy);
    font: italic 1.4375rem/1.45 Georgia, 'Times New Roman', serif;
  }
  .about-verse cite {
    display: block;
    margin-top: 12px;
    color: #805b18;
    font: normal 700 .75rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .about-closing { text-align: center; }
  .about-closing h3::before {
    content: "";
    flex: 1;
    height: 1px;
    background: linear-gradient(270deg, rgb(198 146 46 / 65%), transparent);
  }
  .about-body .about-welcome {
    text-wrap: balance;
    margin: 20px 0 22px;
    color: var(--gold);
    font: 400 2.125rem/1.1 'Germania One', Georgia, serif;
  }
  .about-begin {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 26px;
    border: 0;
    border-radius: 999px;
    background: var(--navy);
    color: var(--gold-light);
    box-shadow: 0 8px 18px rgb(0 27 52 / 28%);
    font: 600 .9375rem/1 'Roboto', Arial, sans-serif;
    letter-spacing: .04em;
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .about-begin span { transition: transform .2s ease; }
  .about-begin:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgb(0 27 52 / 32%); }
  .about-begin:hover span { transform: translateX(4px); }
  .about-begin:focus-visible { outline: 2px solid var(--navy); outline-offset: 3px; }

  @media (prefers-reduced-motion: no-preference) {
    /* The title block settles in, one line after another, as the dialog opens. */
    .about-dialog[open] .about-hero > * {
      animation: about-rise .8s cubic-bezier(.22, 1, .36, 1) both;
    }
    .about-dialog[open] .about-hero > :nth-child(1) { animation-delay: .18s; }
    .about-dialog[open] .about-hero > :nth-child(2) { animation-delay: .28s; }
    .about-dialog[open] .about-hero > :nth-child(3) { animation-delay: .36s; }
    .about-dialog[open] .about-hero > :nth-child(4) { animation-delay: .46s; }
    /* The script adds .revealing; without it every section simply shows. */
    .about-dialog.revealing .about-reveal {
      opacity: 0;
      transform: translateY(22px);
      transition: opacity .8s ease, transform .8s cubic-bezier(.22, 1, .36, 1);
    }
    .about-dialog.revealing .about-reveal.is-visible { opacity: 1; transform: none; }
  }
  @keyframes about-rise {
    from { opacity: 0; transform: translateY(14px); }
  }

  /* Help and About are read and scrolled, and share their edges with the
     page's Bookmarks and verse popups. A slim gold scrollbar on a clear track,
     held off the rounded corners, in place of the grey system bar that
     squared off the dialog's right edge. The thumb's transparent border leaves
     a thin pill floating inside the gutter. */
  .about-dialog::-webkit-scrollbar,
  .help-dialog::-webkit-scrollbar { width: 10px; }
  .about-dialog::-webkit-scrollbar-track,
  .help-dialog::-webkit-scrollbar-track { margin-block: 20px; background: transparent; }
  .about-dialog::-webkit-scrollbar-thumb,
  .help-dialog::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 999px;
    background: rgb(198 146 46 / 40%) padding-box;
  }
  .about-dialog::-webkit-scrollbar-thumb:hover,
  .help-dialog::-webkit-scrollbar-thumb:hover { background-color: rgb(198 146 46 / 75%); }
  /* Firefox has no ::-webkit-scrollbar. Chrome would drop the rules above if it
     saw these, so only browsers without them get the standard properties. */
  @supports not selector(::-webkit-scrollbar) {
    .about-dialog,
    .help-dialog {
      scrollbar-width: thin;
      scrollbar-color: rgb(198 146 46 / 50%) transparent;
    }
  }
  /* Text scrolling out of view fades into the paper a little short of the
     rounded edge rather than running into it. The band sticks to the bottom and
     its negative margin lays it over the closing padding, so it takes no room. */
  .about-dialog::after,
  .help-dialog::after {
    content: "";
    position: sticky;
    bottom: 0;
    z-index: 1;
    display: block;
    height: 30px;
    margin-top: -30px;
    background: linear-gradient(rgb(243 231 210 / 0%), var(--cream) 70%);
    pointer-events: none;
  }

  @media (max-width: 650px) {
    .about-body { padding-inline: 20px; }
    .about-hero { padding-top: 34px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .menu-item { transition: none; }
    .about-close, .about-begin, .about-begin span, .help-close { transition: none; }
  }
`;

const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

const guideItem = ({ page, icon, title, text }) => `
            <li>
                <a class="menu-item" href="${asset(PAGES + page)}">
                    <span class="help-icon">
                        <img class="menu-icon" src="${asset(ICONS + icon)}" alt="" width="36" height="36" />
                    </span>
                    <span class="menu-text">
                        <strong>${escapeHtml(title)}</strong>
                        <small>${escapeHtml(text)}</small>
                    </span>
                </a>
            </li>`;

const MENU_HTML = /* html */ `
<dialog class="menu-dialog" aria-labelledby="menu-title">
    <header class="menu-header">
        <img class="help-emblem" src="${EMBLEM_URL}" alt="" width="40" height="40" />
        <div class="help-heading">
            <h2 id="menu-title">Daily Grace</h2>
            <p class="help-eyebrow">Bible Study Guides</p>
        </div>
    </header>
    <nav class="menu-nav" aria-label="Daily Grace">
        <ul class="menu-list">${GUIDES.map(guideItem).join('')}
        </ul>
        <ul class="menu-list menu-foot">
            <li>
                <button class="menu-item" type="button" aria-haspopup="dialog" data-show="help">
                    <span class="help-icon">
                        <img class="menu-icon" src="${asset('../../assets/images/study-guide-icons/help.webp')}" alt="" width="36" height="36" />
                    </span>
                    <span class="menu-text"><strong>Help</strong></span>
                </button>
            </li>
            <li>
                <button class="menu-item" type="button" aria-haspopup="dialog" data-show="about">
                    <span class="help-icon">
                        <img src="${EMBLEM_URL}" alt="" width="26" height="26" />
                    </span>
                    <span class="menu-text"><strong>About</strong></span>
                </button>
            </li>
        </ul>
    </nav>
</dialog>`;

// Keep this up to date with the page: each control it explains, and each
// guide in the menu.
const HELP_HTML = /* html */ `
<dialog class="help-dialog" aria-labelledby="help-title">
    <div class="help-body">
        <header class="help-header">
            <img
                class="help-emblem"
                src="${EMBLEM_URL}"
                alt=""
                width="40"
                height="40"
            />
            <div class="help-heading">
                <p class="help-eyebrow">Guide</p>
                <h2 id="help-title">How to use Daily Grace</h2>
            </div>
            <button
                id="help-close"
                class="help-close"
                type="button"
                aria-label="Close help"
                title="Close"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 6 12 12M18 6 6 18" />
                </svg>
            </button>
        </header>

        <h3>Today's devotional</h3>
        <ul class="help-list">
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="7 4 20 12 7 20" /></svg>
                </span>
                <p><strong>Take today's Moment.</strong> Tap "Start today's Moment with God" below the poster for about five minutes, one screen at a time: pause, read the verse, listen, reflect, answer the day's question, and pray. Your answer stays on this device. Once you reach Amen, the card shows that today's Moment is done.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" /></svg>
                </span>
                <p><strong>Learn this week's verse.</strong> The "This Week’s Memory Verse Challenge" card, just below today's Moment, gives you one verse a week to learn by heart, about a minute a day. Each day you come back, the practice gets a little harder: read it, phrase by phrase, fill the blanks, first letters, put it in order, and on the last day say it from memory. You can also start it from the end of today's Moment. Your progress stays on this device.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7 2 12l5 5M17 7l5 5-5 5M2 12h20" /></svg>
                </span>
                <p><strong>Swipe through the week.</strong> Swipe the banner right to go back a day, up to a week. Swipe left to come forward again.</p>
            </li>
            <li>
                <span class="help-icon action">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </span>
                <p><strong>Open the Flipbook.</strong> Tap the round book button at the top right of the banner. An earlier day opens on that day's week.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5 2-1.5 5-2 9-1.5V5c-4-.5-7 0-9 1.5zM12 6.5v13" /></svg>
                </span>
                <p><strong>Turn the Flipbook's pages.</strong> Swipe, or tap the left or right edge of the page. Pinch, or use the mouse wheel, to zoom in on a page.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" /></svg>
                </span>
                <p><strong>Read the whole reflection.</strong> Tap the reflection under the banner to show all of it.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>
                </span>
                <p><strong>Today's guiding question.</strong> Further down the page, "Today's Guiding Question" answers one of life's questions from Scripture, with a verse and one thing to try. A different one appears each time you open the page. Tap the play button in its corner to hear it read aloud, tap "Read the full answer" to open it on the Questions We All Ask page, or press and hold the card to bookmark it.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 21 3v18z" /><path d="M8 21v-2M12 21v-3M16 21v-2M21 16h-2M21 12h-3M21 8h-2" /></svg>
                </span>
                <p><strong>Following Today's God Blueprint.</strong> Near the bottom of the page, "Following Today's God Blueprint" shows one part of God's plan from Following God's Blueprint, with a verse, one step to build it and a question to ask yourself. A different one appears each time you open the page. Tap "Open the full plan" to read it on the Following God's Blueprint page, or the red download button at the top right to open it in full as a PDF, ready to save, print or share. Press and hold the card to bookmark it.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v9M9 12v9" /></svg>
                </span>
                <p><strong>See the comic strip.</strong> Tap the day's verse poster and it turns like a page to the comic. Tap it again to turn back.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></svg>
                </span>
                <p><strong>Share the poster.</strong> Tap the share button beside the play button to send the poster, or the comic if it is showing, as a picture to Messenger, Viber, Facebook or any app on your phone. To copy its link instead, press and hold the poster for half a second.</p>
            </li>
            <li>
                <span class="help-icon action">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l13 8-13 8z" /></svg>
                </span>
                <p><strong>Listen.</strong> Tap the play button on the poster to hear the day's narration.</p>
            </li>
        </ul>

        <h3>Bible search</h3>
        <ul class="help-list">
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
                </span>
                <p><strong>Look up a passage.</strong> Type a reference such as <em>Ephesians 2:8-9</em> in the search box at the top. Start typing a book's name and pick it from the list that appears. To use a reference you copied somewhere else, press and hold the search box and choose Paste.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.5" width="15" height="11" rx="2.5" /><path d="M8 10.5V5.5a4 4 0 0 1 8 0v1" /></svg>
                </span>
                <p><strong>Search by words.</strong> Tap the padlock to unlock it, then type words. You get every verse that has all of them.</p>
            </li>
            <li>
                <span class="help-icon gold">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
                </span>
                <p><strong>Bookmark a verse.</strong> Press and hold a verse for half a second. It glows gold and gets a ribbon. Hold it again to remove the bookmark. You can keep up to 100.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="10" rx="5" /><circle class="help-fill" cx="8" cy="12" r="1.8" /></svg>
                </span>
                <p><strong>Show your bookmarks.</strong> Press and hold the DG emblem at the top left for half a second; it glows gold, then your bookmarks open. Tap Bible Verses, Did You Know, Bible Sayings, Questions or Blueprint at the top to switch between them. Hold a bookmark there to remove it, which makes room when a list is full. Bookmarks are saved on this device. Tap the red PDF button beside the title to open all of them as one PDF, ready to save, print or share.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h11l5 5v13H4zM15 3v5h5" /></svg>
                </span>
                <p><strong>Understand a verse.</strong> Tap the folded corner of a verse to read its explanation. The words of Jesus are printed in red.</p>
            </li>
        </ul>

        <h3>The menu</h3>
        <ul class="help-list">
            <li>
                <span class="help-icon">
                    <img src="${EMBLEM_URL}" alt="" width="26" height="26" />
                </span>
                <p><strong>Open the menu.</strong> Tap the DG emblem at the top left of the page (holding it opens your bookmarks instead). The menu slides in from the left. To close it, swipe it to the left, tap the page beside it or press Escape.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </span>
                <p><strong>Books of the Bible.</strong> All 66 books, grouped as the Law, History, Poetry, the Prophets, the Gospels and the Letters, with the number of chapters and verses in each. Tap a book to open its details right below it: who wrote it, when, what it contains and its key verses. Tap another book to switch, or search by book, author or theme.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18 13.8c2 .9 3.5 3.1 3.5 6.2" /></svg>
                </span>
                <p><strong>Bible Characters.</strong> Over a hundred people of the Bible, from Adam to the first church, grouped by era. Tap anyone to read their story, why they matter, what they are known for and where to read about them. Tap a family member or companion to go straight to that person, and follow the link to Heroes and Villains where there is one. Use the buttons to show one era, or only the Old or New Testament.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9h8M8 12h5" /></svg>
                </span>
                <p><strong>Red-Lettered Quotes.</strong> The words of Jesus, printed in red as in a red-letter Bible. "Best-known sayings" explains his most famous words in plain words, grouped by theme: the "I am" sayings, the Sermon on the Mount, the parables, the words from the cross and more. "Every red-letter word" lists everything he says in the Bible, book by book; open a passage to read it, with a plain explanation where there is one and the older commentary on its verses.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
                </span>
                <p><strong>Peoples of the Bible.</strong> The nations of Scripture, from the Moabites to the Romans, on a map. Tap a dot on the map or a card to read where a people came from, where they lived, their history, and who they are today.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c-1.4 1.8-2 4-2 6.5V17l-4 4M12 4c1.4 1.8 2 4 2 6.5V17l4 4" /><path d="M10 11 6.5 14.5M14 11l3.5 3.5" /></svg>
                </span>
                <p><strong>Prayers in the Bible.</strong> The Lord's Prayer and what Jesus taught about prayer, Jesus' own prayers, and the prayers of Abraham, Moses, Hannah, David, Daniel, the psalmists and the first Christians. Tap any one to read its words and the story behind it, what it teaches, how it fits into daily life, and a short prayer to pray today. Use the buttons to show one kind, or only the Old or New Testament.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l11-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="17.5" cy="16" r="2.5" /></svg>
                </span>
                <p><strong>Poems, Songs and Wisdom.</strong> The poetry of the Bible in three parts. Poems: the prophets' poems of comfort and peace, and the New Testament's poems on the Word made flesh, love and the victory over death. Songs: from Moses at the Red Sea to the new song of heaven, with the best-loved psalms. Wisdom: Proverbs for every day, Job and Ecclesiastes on life's hard questions, and the wisdom of Jesus and the apostles. Tap any one to read its words, the story behind it, why it matters and what it means for your daily life. Use the buttons to show poems, songs or wisdom, one group, or only the Old or New Testament.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></svg>
                </span>
                <p><strong>Heroes and Villains.</strong> The people who stood for God and those who stood against him. Tap anyone to read their story, their defining moment and its lesson. Tap a name under "Stood against" to go straight to the other person.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21h14M12 21v-9" /><path d="M12 12c0-4 2.7-7 7-7 0 4-2.7 7-7 7zM12 15c0-3.3-2.4-5.5-6-5.5 0 3.3 2.4 5.5 6 5.5z" /></svg>
                </span>
                <p><strong>Flora and Fauna.</strong> The plants and animals of the Bible, from the olive and the fig to the lamb and the lion. Tap any one to read what it was used for, why it is in the Bible, who used it and why it matters, with how often the King James Bible mentions it and where it first appears.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21.5h4" /><path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.1.9 1.8v.5h6V16c0-.7.3-1.3.9-1.8A6.5 6.5 0 0 0 12 2.5z" /><path d="M12 6v6M9.8 8.2h4.4" /></svg>
                </span>
                <p><strong>Did You Know.</strong> Every fact from the "Did you know?" card, book by book, from Genesis to Revelation. Open a book to see its questions, and tap one to read the answer, the verse it comes from and the books to read more in. Search them all at once, or use the buttons to show one Testament or one group of books. Hold a question for half a second to bookmark it, as on the home page.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 5.5a2.5 2.5 0 0 1 2.5-2.5h8a2.5 2.5 0 0 1 2.5 2.5v4.5a2.5 2.5 0 0 1-2.5 2.5H8l-3.5 3v-3.1a2.5 2.5 0 0 1-2-2.4z" /><path d="M15.5 8H19a2.5 2.5 0 0 1 2.5 2.5V15a2.5 2.5 0 0 1-2 2.4v3.1L16 17.5h-3.5a2.5 2.5 0 0 1-2.5-2.5v-.5" /></svg>
                </span>
                <p><strong>Bible Sayings.</strong> Everyday phrases that come from the Bible, like "the writing on the wall" and "a drop in the bucket", grouped by theme. Tap any one to read what it means, where it comes from and the King James words behind it. Use the buttons to show one theme, or only the Old or New Testament. Hold a saying for half a second to bookmark it, as on the home page.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22c3.9 0 6.5-2.8 6.5-6.5 0-3.4-2.3-5.4-3.5-8-1 1.8-1.8 2.6-2.8 2.8.2-2.4-.6-4.6-2.7-6.8-.8 3.1-4 5.9-4 10.2C5.5 19.2 8.1 22 12 22z" /></svg>
                </span>
                <p><strong>Supernaturals and Prophecies.</strong> The miracles of the Bible, from the Red Sea to the empty tomb: power over nature, food and plenty, healings, the dead raised, demons cast out, signs and angels, and the magic and sorcery Scripture warns against. Then the prophecies: what God foretold, from the first promise in Eden to the return of Jesus, and how it came true. Last come two special topics, Angels and Demons: what the whole Bible teaches about each, from Michael and Gabriel to the armour of God, with links to the events that show it; tap the buttons at the top to go straight to them. Tap any one to read what happened, who was there, why it matters and where to read it. Use the buttons to show one kind, or only the Old or New Testament.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V8a3.5 3.5 0 0 1 7 0v12zM12 20V8a3.5 3.5 0 0 1 7 0v12z" /><path d="M7.5 10.5h2M7.5 13.5h2M14.5 10.5h2M14.5 13.5h2" /></svg>
                </span>
                <p><strong>Commandments of God.</strong> The Ten Commandments first, one card for each, then the two Jesus called the greatest, the commands he gave his followers, wisdom for daily life from the law, the prophets and Proverbs, and what the apostles taught the first churches. Tap any one to read its words in the King James Bible, where it comes from, what it means and how it fits your daily life, with one step to take today. Use the buttons to show one kind, or only the Old or New Testament.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></svg>
                </span>
                <p><strong>Questions We All Ask.</strong> Life's questions, from worry, anger and money to marriage, grief and what happens when we die, each answered by the voices of Scripture: Jesus (in red), the prophets, the apostles, the wisdom books and the Law. Tap a question to read what they say, in the King James words and in plain words, with one thing to try and a short prayer. Use the buttons to show one part of life, or only one voice.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21 21 3v18z" /><path d="M8 21v-2M12 21v-3M16 21v-2M21 16h-2M21 12h-3M21 8h-2" /></svg>
                </span>
                <p><strong>Following God's Blueprint.</strong> The plan God has drawn for his people, sheet by sheet: the foundation of salvation, the heart of his law beyond the Ten Commandments, what to do every day, how to solve problems his way, how to understand the times, and how to be ready when Jesus comes. Tap any part of the plan to read it in the King James words and in plain words, with steps to build it and a question to ask yourself. At the end, the blueprint test helps you check whether a decision or a resolution follows the Lord's plan.</p>
            </li>
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7" /><circle class="help-fill" cx="12" cy="17" r="1.1" /></svg>
                </span>
                <p><strong>Help and About.</strong> At the foot of the menu. Help opens this guide; About tells what Daily Grace is and how it can help you each day.</p>
            </li>
        </ul>

        <h3>More to explore</h3>
        <ul class="help-list">
            <li>
                <span class="help-icon action">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3.5v5h-5M20.5 12a8.5 8.5 0 1 1-2.6-6.1L21 8.5" /></svg>
                </span>
                <p><strong>Facts and sayings.</strong> Tap the refresh button on "Did you know?" or the Bible sayings for a new set. Tap a saying to see all of it, or a Bible reference to read the passage. "More from…" under an open fact, or "More sayings like this" in a saying, opens it on the Did You Know or Bible Sayings page among the others like it, and the link under each list opens the whole collection.</p>
            </li>
            <li>
                <span class="help-icon gold">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
                </span>
                <p><strong>Bookmark facts, sayings, questions and blueprints.</strong> Press and hold a fact, a saying, "Today's Guiding Question" or "Following Today's God Blueprint" for half a second to bookmark it; on the Questions We All Ask and Following God's Blueprint pages, hold a tile or tap its Bookmark button. They are kept with your verses: press and hold the DG emblem to see them. You can keep up to 50 of each.</p>
            </li>
            <li>
                <span class="help-icon gold">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>
                </span>
                <p><strong>Bible trivia.</strong> Now and then, up to three times a day, a quiz pops up with a Bible fact. Pick the book it comes from and see if you are right.</p>
            </li>
            <!-- Stories are hidden on the homepage for now; bring this back with the carousel.
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="11" height="18" rx="2" /><path d="M19 6v12M2 6v12" /></svg>
                </span>
                <p><strong>Stories.</strong> Swipe the row of covers and tap one to start reading.</p>
            </li>
            -->
            <li>
                <span class="help-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM21 14v.01M21 21h-4M14 21v.01" /></svg>
                </span>
                <p><strong>Get in touch.</strong> Tap the QR code to see a bigger one to scan, and how to sponsor or donate.</p>
            </li>
        </ul>
    </div>
</dialog>`;

const ABOUT_HTML = /* html */ `
<dialog class="about-dialog" aria-labelledby="about-title">
    <div class="about-bar">
        <div class="about-mini" aria-hidden="true">
            <img
                class="help-emblem"
                src="${EMBLEM_URL}"
                alt=""
                width="40"
                height="40"
            />
            <div>
                <p class="help-eyebrow">About</p>
                <p class="about-mini-title">Daily Grace</p>
            </div>
        </div>
        <span class="about-progress" aria-hidden="true"></span>
        <button
            id="about-close"
            class="about-close"
            type="button"
            aria-label="Close About Daily Grace"
            title="Close"
        >
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m6 6 12 12M18 6 6 18" />
            </svg>
        </button>
    </div>

    <header class="about-hero">
        <img
            src="${EMBLEM_URL}"
            alt=""
            width="84"
            height="84"
        />
        <p class="about-eyebrow">About</p>
        <h2 id="about-title">Daily Grace</h2>
        <p class="about-tagline">Grace for today. Our Faith Tomorrow.</p>
    </header>

    <div class="about-body">
        <section class="about-section about-reveal">
            <h3>What is Daily Grace?</h3>
            <p class="about-lead">
                Daily Grace is a small daily habit: a few quiet minutes
                with God's Word, wherever you happen to be.
            </p>
            <p>
                Most of us mean to read the Bible more. Then the alarm
                goes off, the kids need breakfast, work piles up, and the
                Bible stays on the shelf at home.
            </p>
            <p>
                Daily Grace doesn't ask you to set aside an hour or find
                a quiet room. It meets you in the five spare minutes you
                already have: on the bus, in the break room, in line at
                the store, or before you fall asleep.
            </p>
        </section>

        <section class="about-pocket about-reveal">
            <span class="about-pocket-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10 8h4M12 6v6M10 18.5h4" /></svg>
            </span>
            <h3>Your Pocket Bible</h3>
            <p>
                Daily Grace is your <strong>Digital Pocket Bible</strong>.
                The whole Bible is on the phone that's already in your
                pocket, so you don't need to carry anything extra.
            </p>
            <p>It's more than a Bible to read. It's one you can make your own:</p>
            <ul class="about-ribbons">
                <li>
                    <strong>Keep the verses that speak to you.</strong>
                    When a verse stops you in your tracks, save it. Next
                    time you need it, on a hard day or when a friend is
                    hurting, it's right there. You won't have to remember
                    "it was somewhere in Psalms."
                </li>
                <li>
                    <strong>Hold onto what you learn.</strong>
                    The fascinating Bible facts, the old sayings that turn
                    out to come from Scripture, and the thoughts that come
                    to you while reading can all be kept and come back to
                    later.
                </li>
                <li>
                    <strong>Look anything up in seconds.</strong>
                    If a pastor mentions a passage or a friend quotes a
                    verse, you can find it right away.
                </li>
            </ul>
            <p class="about-heirloom">
                Think of it like the well-worn Bible your grandmother
                kept, with its underlined verses, notes in the margins,
                and slips of paper marking favorite pages. It's the same
                idea, but it goes everywhere with you.
            </p>
        </section>

        <section class="about-section about-reveal">
            <h3>What you'll find each day</h3>
            <p>Every day brings something new:</p>
            <ul class="about-list">
                <li>
                    <span class="help-icon gold">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /><circle cx="12" cy="12" r="3.2" /></svg>
                    </span>
                    <p><strong>A verse for the day</strong>, with a short, honest reflection on what it means for ordinary life.</p>
                </li>
                <li>
                    <span class="help-icon action">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4l13 8-13 8z" /></svg>
                    </span>
                    <p><strong>A picture to go with it</strong>: a poster, a comic strip, and a voice that reads it aloud when your eyes are tired.</p>
                </li>
                <li>
                    <span class="help-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><circle class="help-fill" cx="12" cy="7.6" r="1.15" /></svg>
                    </span>
                    <p><strong>"Did you know?"</strong>: surprising facts from the Bible that you can share over dinner.</p>
                </li>
                <li>
                    <span class="help-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>
                    </span>
                    <p><strong>Bible sayings</strong>: everyday phrases like <em>"the writing on the wall"</em> or <em>"a drop in the bucket"</em> that turn out to come from Scripture.</p>
                </li>
                <li>
                    <span class="help-icon">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                    </span>
                    <p><strong>A weekly flipbook</strong> to page through, like a little magazine for your faith.</p>
                </li>
            </ul>
        </section>

        <section class="about-section about-reveal">
            <h3>How it can change your life</h3>
            <p>
                Real change rarely comes from one big moment. It comes
                from small things done faithfully, day after day.
            </p>
            <ol class="about-steps">
                <li>
                    <strong>You'll start your day on the right foot.</strong>
                    A single verse in the morning can change how you
                    handle a tough meeting, a traffic jam, or a hard
                    conversation.
                </li>
                <li>
                    <strong>God's Word will be close when you need it most.</strong>
                    Fear, grief, temptation and worry don't wait until
                    you're home with your Bible. When they come, the
                    verses you've saved are one tap away.
                </li>
                <li>
                    <strong>You'll understand your faith better.</strong>
                    Little by little you'll learn who wrote what, where
                    familiar sayings come from, and why a passage matters.
                    The Bible starts to feel less like an old book and more
                    like a letter written to you.
                </li>
                <li>
                    <strong>You'll have something to share.</strong>
                    A verse for a friend who's struggling, a fun fact for
                    your kids, or a comic for the family group chat. Faith
                    grows when it's shared.
                </li>
                <li>
                    <strong>You'll build a habit that lasts.</strong>
                    A few minutes a day adds up to a whole year of time
                    spent with God, and that time changes a person.
                </li>
            </ol>
        </section>

        <blockquote class="about-verse about-reveal">
            <p>Your word is a lamp to my feet and a light to my path.</p>
            <cite>Psalm 119:105</cite>
        </blockquote>

        <section class="about-section about-reveal">
            <h3>Who is it for?</h3>
            <p>
                It's for everyone: the new believer who doesn't know
                where to start, the lifelong Christian who wants to go
                deeper, the busy parent, the student, and the
                grandparent.
            </p>
            <p>
                You don't need theology training or a lot of free time,
                just a willingness to open it each day.
            </p>
        </section>

        <section class="about-section about-closing about-reveal">
            <h3>Our hope for you</h3>
            <p>
                We made Daily Grace so that no one has to go through a
                day without a word from God. We hope this little pocket
                Bible becomes a faithful companion that encourages you,
                teaches you and draws you closer to Him, one day at a
                time.
            </p>
            <p class="about-welcome">Welcome to Daily Grace.</p>
            <button id="about-begin" class="about-begin" type="button">
                Begin today's reading
                <span aria-hidden="true">→</span>
            </button>
        </section>
    </div>
</dialog>`;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// On a wide screen the drawer rests at the page column's left edge, not the
// screen's, so the slide is clipped at that edge: the drawer comes out from
// behind the page rather than across the space beside it. The clip leaves room
// for the drawer's shadow on the other three sides.
const MENU_HIDDEN = { transform: 'translateX(-100%)', clipPath: 'inset(-80px -80px -80px 100%)' };
const MENU_SHOWN = { transform: 'none', clipPath: 'inset(-80px -80px -80px 0)' };

// Swipe left to close: once a touch moves mostly leftward, the drawer and its
// backdrop follow the finger. On release it slides the rest of the way out if
// it was dragged past a third of its width or flicked, and springs back
// otherwise. Vertical moves are left to the browser so the menu still scrolls.
const SWIPE_SLOP = 10;          // px before a touch counts as a swipe
const SWIPE_DISTANCE = 1 / 3;   // of the drawer's width
const SWIPE_FLICK = 0.5;        // px/ms leftward
const SWIPE_SETTLE = 240;       // ms for a full width, as in drawerDialog()

const ABOUT_TIMING = { open: 560, close: 300 };

/** Fades the backdrop with the dialog's own animation; resolves when both end. */
function animateDialog(dialog, opening, frames, options) {
  dialog.animate(opening ? frames : [...frames].reverse(), options);
  const backdrop = dialog.animate(
    opening ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }],
    { ...options, easing: 'ease', pseudoElement: '::backdrop' },
  );
  return backdrop.finished.catch(() => {});
}

// The menu slides in from the left.
function drawerDialog(dialog, direction) {
  const opening = direction === 'open';
  return animateDialog(dialog, opening, [MENU_HIDDEN, MENU_SHOWN], {
    duration: opening ? 380 : 240,
    easing: opening ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.4, 0, 1, 1)',
    fill: 'forwards',
  });
}

// Help slides in from the right edge, moving left into place, and slides back
// out the way it came.
function slideDialog(dialog, direction) {
  const opening = direction === 'open';
  // Half the viewport plus half the dialog puts it just past the right edge.
  const offscreen = { transform: 'translateX(calc(50vw + 50%))', opacity: .6 };
  return animateDialog(dialog, opening, [offscreen, { transform: 'none', opacity: 1 }], {
    duration: opening ? 420 : 260,
    easing: opening ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.4, 0, 1, 1)',
    fill: 'forwards',
  });
}

// About grows out of the small control that opened it, and shrinks back in.
function growDialog(thumb, dialog, direction, { open = 380, close = 240 } = {}) {
  const opening = direction === 'open';
  const from = thumb.getBoundingClientRect();
  const to = dialog.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  const shrunk = { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width})`, opacity: 0 };
  return animateDialog(dialog, opening, [shrunk, { transform: 'none', opacity: 1 }], {
    duration: opening ? open : close,
    easing: opening ? 'cubic-bezier(.2, .9, .25, 1)' : 'cubic-bezier(.4, 0, 1, 1)',
    fill: 'forwards',
  });
}

function finishClose(dialog) {
  dialog.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
  dialog.close();
}

export class StudyGuideMenu extends HTMLElement {
  #menu;
  #help;
  #about;
  #opener = null;
  // The dialogs part-way through their closing animation.
  #closing = new Set();
  // Closing the menu hands focus back to the opener, and Chrome then draws its
  // focus ring. Keep the ring only when the menu was opened from the keyboard;
  // a menu opened by a click or tap leaves no ring, however it is closed.
  #openedByKeyboard = false;
  #swipe = null;
  #swallowClick = false;
  #aboutObserver;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${STYLES}${PILL_STYLES}</style>${MENU_HTML}${HELP_HTML}${ABOUT_HTML}`;

    const menu = root.querySelector('.menu-dialog');
    const help = root.querySelector('.help-dialog');
    const about = root.querySelector('.about-dialog');
    this.#menu = menu;
    this.#help = help;
    this.#about = about;

    const closers = [
      [menu, () => this.close()],
      [help, () => this.#closeHelp()],
      [about, () => this.#closeAbout()],
    ];
    for (const [dialog, close] of closers) {
      // Escape would close instantly; route it through the closing animation instead.
      dialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        close();
      });
      // The dialog has no padding, so a click that lands on it rather than its
      // contents came from the backdrop.
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) close();
      });
    }

    // A swipe that ends over a link or the backdrop must not also count as a tap.
    menu.addEventListener('click', (event) => {
      if (!this.#swallowClick) return;
      this.#swallowClick = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    menu.addEventListener('pointerdown', (event) => this.#swipeStart(event));
    menu.addEventListener('pointermove', (event) => this.#swipeMove(event));
    menu.addEventListener('pointerup', (event) => this.#swipeEnd(event));
    menu.addEventListener('pointercancel', (event) => this.#swipeEnd(event));
    // Help and About replace the menu rather than stacking on top of it.
    for (const button of menu.querySelectorAll('[data-show]')) {
      button.addEventListener('click', async () => {
        await this.close();
        if (button.dataset.show === 'help') this.showHelp();
        else this.showAbout();
      });
    }

    root.getElementById('help-close').addEventListener('click', () => this.#closeHelp());

    this.#aboutObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        this.#aboutObserver.unobserve(entry.target);
      }
    }, { root: about, rootMargin: '0px 0px -10% 0px' });
    about.addEventListener('scroll', () => this.#updateAboutScroll(), { passive: true });
    root.getElementById('about-close').addEventListener('click', () => this.#closeAbout());
    // The closing call to action: fold the story away, and let the page take
    // the reader to today.
    root.getElementById('about-begin').addEventListener('click', async () => {
      await this.#closeAbout();
      this.dispatchEvent(new Event('begin'));
    });
    linkScripture(about.querySelector('.about-verse cite'));
  }

  connectedCallback() {
    registerFonts();
    this.#opener?.removeEventListener('click', this.#onOpenerClick);
    this.#opener = document.getElementById(this.getAttribute('opener') ?? '');
    this.#opener?.addEventListener('click', this.#onOpenerClick);
  }

  disconnectedCallback() {
    this.#opener?.removeEventListener('click', this.#onOpenerClick);
    this.#opener = null;
  }

  // A click from Enter or Space has no pointer behind it, so its detail is 0.
  #onOpenerClick = (event) => {
    this.#openedByKeyboard = event.detail === 0;
    this.open();
  };

  // The page's scroll lock follows whichever dialog is open.
  #syncOpen() {
    this.toggleAttribute('open', [this.#menu, this.#help, this.#about].some((dialog) => dialog.open));
  }

  #show(dialog) {
    if (dialog.open) return false;
    dialog.showModal();
    this.#syncOpen();
    return true;
  }

  /** Runs the closing animation, unless motion is reduced, then closes. */
  async #hide(dialog, animate) {
    if (!dialog.open || this.#closing.has(dialog)) return false;
    this.#closing.add(dialog);
    if (!reducedMotion.matches) await animate();
    finishClose(dialog);
    this.#closing.delete(dialog);
    this.#syncOpen();
    return true;
  }

  // ------------------------------------------------------------------ menu

  open() {
    if (!this.#show(this.#menu)) return;
    this.#opener?.setAttribute('aria-expanded', 'true');
    if (!reducedMotion.matches) drawerDialog(this.#menu, 'open');
  }

  async close() {
    if (await this.#hide(this.#menu, () => drawerDialog(this.#menu, 'close'))) this.#menuClosed();
  }

  #menuClosed() {
    if (!this.#openedByKeyboard) this.#opener?.blur();
    this.#opener?.setAttribute('aria-expanded', 'false');
  }

  #scrub(keyframes, pseudoElement) {
    const animation = this.#menu.animate(keyframes, {
      duration: 1000, easing: 'linear', fill: 'forwards', pseudoElement,
    });
    animation.pause();
    return animation;
  }

  #swipeStart(event) {
    this.#swallowClick = false;
    if (event.pointerType === 'mouse' || !event.isPrimary || this.#closing.has(this.#menu)) return;
    this.#swipe = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, t: event.timeStamp, v: 0 };
  }

  #swipeMove(event) {
    const swipe = this.#swipe;
    if (!swipe || event.pointerId !== swipe.id) return;
    const menu = this.#menu;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (!swipe.animations) {
      if (Math.abs(dx) < SWIPE_SLOP && Math.abs(dy) < SWIPE_SLOP) return;
      if (dx >= 0 || Math.abs(dy) >= Math.abs(dx)) {
        this.#swipe = null;
        return;
      }
      menu.setPointerCapture(swipe.id);
      // The opening animation holds its end state; replace it with ones the
      // finger can scrub.
      menu.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      swipe.width = menu.getBoundingClientRect().width;
      swipe.animations = [
        this.#scrub([MENU_SHOWN, MENU_HIDDEN]),
        this.#scrub([{ opacity: 1 }, { opacity: 0 }], '::backdrop'),
      ];
    }
    const elapsed = event.timeStamp - swipe.t;
    if (elapsed > 0) swipe.v = (dx - swipe.dx) / elapsed;
    swipe.dx = dx;
    swipe.t = event.timeStamp;
    const progress = Math.min(1, Math.max(0, -dx / swipe.width));
    swipe.animations.forEach((animation) => { animation.currentTime = progress * 1000; });
  }

  async #swipeEnd(event) {
    const swipe = this.#swipe;
    if (!swipe || event.pointerId !== swipe.id) return;
    this.#swipe = null;
    if (!swipe.animations) return;
    this.#swallowClick = true;
    const progress = swipe.animations[0].currentTime / 1000;
    const close = event.type === 'pointerup'
      && (progress > SWIPE_DISTANCE || swipe.v < -SWIPE_FLICK);
    if (!close) {
      const rate = 1000 / SWIPE_SETTLE;
      swipe.animations.forEach((animation) => {
        animation.playbackRate = -rate;
        animation.play();
      });
      await Promise.all(swipe.animations.map((animation) => animation.finished.catch(() => {})));
      swipe.animations.forEach((animation) => animation.cancel());
      return;
    }
    // Slide the rest of the way out from where the finger left it.
    const closed = await this.#hide(this.#menu, async () => {
      const rate = 1000 / SWIPE_SETTLE;
      swipe.animations.forEach((animation) => {
        animation.playbackRate = rate;
        animation.play();
      });
      await Promise.all(swipe.animations.map((animation) => animation.finished.catch(() => {})));
    });
    if (closed) this.#menuClosed();
  }

  // ------------------------------------------------------------------ help

  showHelp() {
    if (!this.#show(this.#help)) return;
    this.#help.scrollTop = 0;
    if (!reducedMotion.matches) slideDialog(this.#help, 'open');
  }

  #closeHelp() {
    return this.#hide(this.#help, () => slideDialog(this.#help, 'close'));
  }

  // ----------------------------------------------------------------- about

  /** About grows out of the opener; with none, it slides in as Help does. */
  #aboutMotion(direction) {
    return this.#opener
      ? growDialog(this.#opener, this.#about, direction, ABOUT_TIMING)
      : slideDialog(this.#about, direction);
  }

  // Fills the progress line, and swaps in the compact header once the big
  // title has slid up under where it sits.
  #updateAboutScroll() {
    const about = this.#about;
    const { scrollTop, scrollHeight, clientHeight } = about;
    const scrollable = scrollHeight - clientHeight;
    const read = scrollable > 0 ? scrollTop / scrollable : 1;
    about.style.setProperty('--read', Math.min(1, read).toFixed(3));
    const title = about.querySelector('#about-title');
    const mini = about.querySelector('.about-mini');
    const titleGone = title.offsetTop + title.offsetHeight - mini.offsetHeight;
    about.classList.toggle('condensed', scrollTop > titleGone);
  }

  showAbout() {
    const about = this.#about;
    if (!this.#show(about)) return;
    about.scrollTop = 0;
    this.#updateAboutScroll();
    const animate = !reducedMotion.matches;
    // Hide the sections afresh each time, so the story unfolds again on every visit.
    about.classList.toggle('revealing', animate);
    for (const section of about.querySelectorAll('.about-reveal')) {
      section.classList.remove('is-visible');
      if (animate) this.#aboutObserver.observe(section);
    }
    if (animate) this.#aboutMotion('open');
  }

  async #closeAbout() {
    const closed = await this.#hide(this.#about, () => this.#aboutMotion('close'));
    if (closed) this.#aboutObserver.disconnect();
    return closed;
  }
}

if (!customElements.get('study-guide-menu')) {
  customElements.define('study-guide-menu', StudyGuideMenu);
}
