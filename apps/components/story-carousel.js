/**
 * <story-carousel> — a looping, swipeable row of story covers.
 *
 * Reads a list of stories and shows each as a tall cover with its title and
 * description underneath. One card fills most of the row and the next one
 * peeks in beside it. Swipe with a finger or drag with the mouse to move one
 * card at a time; the row wraps around endlessly in both directions. A folded
 * corner at the bottom right of each cover links to the story reader; the
 * rest of the cover is not a link.
 *
 * Usage
 *   <story-carousel></story-carousel>
 *   <script type="module" src="./apps/components/story-carousel.js"></script>
 *
 * Attributes
 *   src       URL of the stories list, relative to the page.
 *             Default: assets/stories.json
 *   reader    URL of the story reader, relative to the page. The story id is
 *             added as ?story=<id>. Default: apps/pages/stories.html
 *   heading   Text beside the icon above the row. Default: Stories
 *
 * Each story in the list is { id, cover_page, title, description }, plus
 * optional "audio" and "story-book" URLs. Each one given shows as a pill over
 * the cover. AUDIO plays the story right here, turning into a pause button
 * while it plays; moving on to another story stops it. PDF opens the book in a
 * new tab.
 *
 * Methods      next(), previous()  scroll one card along
 * Properties   stories (read-only)
 * Events       storiesload  detail: { stories }
 *
 * The element hides itself when the list is empty or cannot be loaded.
 *
 * CSS custom properties
 *   --story-card-width   share of the row the current card takes. Default: 75%
 *   --story-card-gap, --story-carousel-gutter, --story-carousel-ink,
 *   --story-carousel-radius
 *   --story-card-glow, --story-card-glow-hover   drop-shadow() filters, so the
 *                        glow follows the folded corner
 *   --story-dog-ear      size of the folded corner. Default: 48px
 */

const DEFAULT_SRC = 'assets/stories.json';
const DEFAULT_READER = 'apps/pages/stories.html';
// Fewer cards than this and the row is repeated, so one lap is always wider
// than the viewport and the wrap-around jump never shows.
const MIN_LAP_CARDS = 6;
const LAPS = 3;
// A mouse drag shorter than this is still a click.
const DRAG_THRESHOLD = 6;
// A drag moves on a card once it covers this share of a card, or is flicked.
const DRAG_COMMIT = 0.15;
const FLICK_SPEED = 0.4; // px per ms

// A clapperboard with a play mark, filled like the heading text.
const STORIES_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
  <path fill-rule="evenodd" d="M6 2h12a4 4 0 0 1 4 4v1H2V6a4 4 0 0 1 4-4Zm1.2 1.6L9 6.4h2.4L9.6 3.6H7.2Zm5 0L14 6.4h2.4l-1.8-2.8h-2.4Zm5 0L19 6.4h1.3A2.5 2.5 0 0 0 18 3.6h-.8ZM2 8.6h20V18a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8.6Zm8 3.2v6.8l5.6-3.4L10 11.8Z"/>
</svg>`;

// The AUDIO pill carries both marks; CSS shows the one that fits.
const PLAY_ICON = `<svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>`;
const PAUSE_ICON = `<svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.2"/><rect x="14" y="4" width="5" height="16" rx="1.2"/></svg>`;
// An arrow into a tray, for the PDF pill.
const DOWNLOAD_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/></svg>`;

const STYLES = /* css */ `
  :host {
    --story-card-width: 75%;
    --story-card-gap: 18px;
    --story-carousel-gutter: 24px;
    --story-carousel-ink: var(--ink, #10253b);
    --story-carousel-radius: 18px;
    --story-card-glow: drop-shadow(0 0 6px rgb(198 146 46 / 85%)) drop-shadow(0 2px 4px rgb(0 27 52 / 10%));
    --story-card-glow-hover: drop-shadow(0 0 8px rgb(198 146 46 / 100%)) drop-shadow(0 3px 5px rgb(0 27 52 / 12%));
    --story-dog-ear: 48px;
    /* Room inside the scroller for the glow, which it would otherwise clip.
       Keep it narrower than the card gap so no neighbouring card reaches it. */
    --story-glow-room: 14px;

    display: block;
    padding: 16px var(--story-carousel-gutter) 18px;
    color: var(--story-carousel-ink);
  }
  :host([hidden]) { display: none; }
  * { box-sizing: border-box; }

  .heading {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    color: #111;
    /* Same type as the page's "Your Daily Grace Today" heading. */
    font: 400 clamp(1.0625rem, .95rem + .5vw, 1.25rem)/1.3 'Strait', 'Roboto', Arial, sans-serif;
  }
  .heading svg { flex: none; width: 1.3em; height: 1.3em; }

  /* The gutter sits outside the scroller, so cards never reach the page edge. */
  .track {
    position: relative;
    display: flex;
    gap: var(--story-card-gap);
    margin: calc(-1 * var(--story-glow-room));
    padding: var(--story-glow-room);
    list-style: none;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scroll-padding-inline: var(--story-glow-room);
    /* The glow room reaches into the page gutter; fade it out at the sides so
       neighbouring cards and their glow never show there as hard slivers. */
    --edge-fade: linear-gradient(to right, transparent, #000 var(--story-glow-room), #000 calc(100% - var(--story-glow-room)), transparent);
    -webkit-mask-image: var(--edge-fade);
    mask-image: var(--edge-fade);
    scrollbar-width: none;
    touch-action: pan-x pan-y;
  }
  .track::-webkit-scrollbar { display: none; }
  .track.dragging { scroll-snap-type: none; cursor: grabbing; user-select: none; }
  @media (hover: hover) and (pointer: fine) {
    .track { cursor: grab; }
  }

  .item {
    position: relative;
    flex: 0 0 var(--story-card-width);
    scroll-snap-align: start;
    /* One card per swipe, however hard the flick. */
    scroll-snap-stop: always;
  }

  /* The glow is a filter on the wrapper, not a box-shadow on the image, so
     it traces the folded corner instead of the square it was cut from. */
  .cover-wrap {
    position: relative;
    filter: var(--story-card-glow);
    transition: filter .25s ease;
  }
  .cover-wrap:has(.dog-ear:hover, .dog-ear:focus-visible) { filter: var(--story-card-glow-hover); }

  .cover {
    display: block;
    width: 100%;
    aspect-ratio: 9 / 16;
    object-fit: cover;
    border-radius: var(--story-carousel-radius);
    background: rgb(0 0 0 / 8%);
    /* Cut away the corner the dog-ear is folded from. */
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--story-dog-ear)), calc(100% - var(--story-dog-ear)) 100%, 0 100%);
    pointer-events: none;
    -webkit-user-drag: none;
  }

  /* The corner of the cover folded back over it: the link to the flipbook.
     The whole corner square takes taps; only its upper half is drawn. */
  .dog-ear {
    position: absolute;
    right: 0;
    bottom: 0;
    width: var(--story-dog-ear);
    height: var(--story-dog-ear);
    cursor: pointer;
    -webkit-user-drag: none;
    filter: drop-shadow(-2px -2px 3px rgb(0 0 0 / 35%));
  }
  .dog-ear::before {
    content: '';
    position: absolute;
    inset: 0;
    border-top-left-radius: 6px;
    background: linear-gradient(135deg, #fffaf0 0%, #efe3c8 60%, #d9c49b 100%);
    clip-path: polygon(0 0, 100% 0, 0 100%);
    transition: filter .25s ease;
  }
  .dog-ear:hover::before { filter: brightness(1.06); }
  .dog-ear:focus-visible { outline: 2px solid var(--story-carousel-ink); outline-offset: 2px; border-radius: 4px; }

  /* Links to the story's audio and book, over the cover's top-right corner.
     They sit outside the cover's wrapper so its glow does not ring them. */
  .pills {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 6px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border: 0;
    border-radius: 6px;
    background: #c8102e;
    color: #fff;
    font: 700 .8125rem/1.2 'Roboto', Arial, sans-serif;
    letter-spacing: .06em;
    text-decoration: none;
    box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
    -webkit-user-drag: none;
    cursor: pointer;
  }
  .pill svg { flex: none; width: 1em; height: 1em; }
  .pill .icon-pause,
  .pill.playing .icon-play { display: none; }
  .pill.playing .icon-pause { display: block; }
  .pill:hover { background: #a50d26; }
  .pill:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }

  .text {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
    margin: 10px 2px 0;
    font: 400 1rem/1.45 'Roboto', Arial, sans-serif;
  }
  .title { font-weight: 700; font-size: 1.125rem; }

  @media (max-width: 650px) {
    :host { --story-carousel-gutter: 16px; --story-card-gap: 16px; --story-glow-room: 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .cover-wrap, .dog-ear::before { transition: none; }
  }
`;

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
}

export class StoryCarousel extends HTMLElement {
  static observedAttributes = ['src', 'reader', 'heading'];

  #root;
  #heading;
  #track;
  #stories = [];
  #lapWidth = 0;
  #loadId = 0;
  #loadPending = false;
  #scrollTimer = 0;
  #drag = null;
  #settling = false;
  #suppressClick = false;
  #audio = null;
  #audioStory = -1;
  #resizeObserver = new ResizeObserver(() => this.#measure());
  #reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.innerHTML = `
      <style>${STYLES}</style>
      <h2 class="heading">${STORIES_ICON}<span></span></h2>
      <ul class="track" role="list"></ul>`;
    this.#heading = this.#root.querySelector('.heading span');
    this.#track = this.#root.querySelector('.track');

    // Wrap around once the scroll settles, so momentum and snapping finish first.
    if ('onscrollend' in window) {
      this.#track.addEventListener('scrollend', () => this.#settled());
    } else {
      this.#track.addEventListener('scroll', () => {
        clearTimeout(this.#scrollTimer);
        this.#scrollTimer = setTimeout(() => this.#settled(), 150);
      }, { passive: true });
    }

    // Fingers and trackpads scroll natively; a mouse needs dragging by hand.
    this.#track.addEventListener('pointerdown', (event) => this.#dragStart(event));
    this.#track.addEventListener('pointermove', (event) => this.#dragMove(event));
    this.#track.addEventListener('pointerup', (event) => this.#dragEnd(event));
    this.#track.addEventListener('pointercancel', (event) => this.#dragEnd(event));
    this.#track.addEventListener('dragstart', (event) => event.preventDefault());
    // A drag that ends over a card must not open it.
    this.#track.addEventListener('click', (event) => {
      if (!this.#suppressClick) return;
      this.#suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    this.#track.addEventListener('click', (event) => {
      const pill = event.target.closest('.pill-audio');
      if (pill) this.#toggleAudio(Number(pill.dataset.story));
    });

    this.#syncHeading();
  }

  connectedCallback() {
    this.#resizeObserver.observe(this.#track);
    this.#scheduleLoad();
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect();
    clearTimeout(this.#scrollTimer);
    this.#stopAudio();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === 'heading') this.#syncHeading();
    else if (this.isConnected) this.#scheduleLoad();
  }

  get stories() {
    return this.#stories.slice();
  }

  next() {
    this.#goTo(this.#index() + 1);
  }

  previous() {
    this.#goTo(this.#index() - 1);
  }

  #syncHeading() {
    const text = this.getAttribute('heading') || 'Stories';
    this.#heading.textContent = text;
    this.#track.setAttribute('aria-label', text);
  }

  // Upgrade fires attributeChangedCallback per attribute, then connectedCallback;
  // coalesce them into a single load.
  #scheduleLoad() {
    if (this.#loadPending) return;
    this.#loadPending = true;
    queueMicrotask(() => {
      this.#loadPending = false;
      this.#load();
    });
  }

  async #load() {
    const loadId = ++this.#loadId;
    const src = new URL(this.getAttribute('src') || DEFAULT_SRC, document.baseURI);
    let stories = [];
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      stories = (Array.isArray(data) ? data : []).filter((story) => story?.id && story?.cover_page);
    } catch (error) {
      console.error(`Unable to load stories from ${src}:`, error);
    }
    // A newer load (the src changed meanwhile) owns the element now.
    if (loadId !== this.#loadId) return;

    this.#stories = stories;
    this.hidden = stories.length === 0;
    this.#render();
    this.dispatchEvent(new CustomEvent('storiesload', { detail: { stories: this.stories } }));
  }

  #cardHtml(story, index, isCopy) {
    const reader = new URL(this.getAttribute('reader') || DEFAULT_READER, document.baseURI);
    reader.searchParams.set('story', story.id);
    const title = escapeHtml(story.title);
    const description = escapeHtml(story.description);
    // Copies exist only to make the loop seamless. They stay clickable, since
    // they are on screen near the wrap point, but are kept out of the tab order
    // and away from screen readers so each story is announced once.
    const tabindex = isCopy ? ' tabindex="-1"' : '';
    // Every copy of a story shares its index, so they all show the same state.
    const audio = story.audio
      ? `<button type="button" class="pill pill-audio" data-story="${index}" aria-pressed="false" aria-label="Listen to ${title}"${tabindex}>${PLAY_ICON}${PAUSE_ICON}AUDIO</button>`
      : '';
    const book = story['story-book']
      ? `<a class="pill" href="${escapeHtml(story['story-book'])}" target="_blank" rel="noopener" draggable="false" aria-label="Read ${title} (PDF)"${tabindex}>${DOWNLOAD_ICON}PDF</a>`
      : '';
    const pills = audio + book;
    return `
      <li class="item"${isCopy ? ' aria-hidden="true"' : ''}>
        <div class="cover-wrap">
          <img class="cover" src="${escapeHtml(story.cover_page)}" alt="" loading="lazy" decoding="async" draggable="false" />
          <a class="dog-ear" href="${escapeHtml(reader.href)}" draggable="false" aria-label="Open the ${title} flipbook" title="Open the flipbook"${tabindex}></a>
        </div>
        <p class="text"><span class="title">${title}</span>${description ? ` - ${description}` : ''}</p>${pills ? `
        <div class="pills">${pills}</div>` : ''}
      </li>`;
  }

  #render() {
    this.#stopAudio();
    const stories = this.#stories;
    const looping = stories.length > 1;
    this.toggleAttribute('looping', looping);

    if (!looping) {
      this.#track.innerHTML = stories.map((story, i) => this.#cardHtml(story, i, false)).join('');
      this.#lapWidth = 0;
      return;
    }

    // One lap is the list, repeated if short. Three laps side by side, with
    // the real cards at the start of the middle lap, leave a full lap of
    // runway on each side before the scroll is quietly moved back.
    const repeats = Math.ceil(MIN_LAP_CARDS / stories.length);
    const lap = Array.from({ length: repeats }, () => stories).flat();
    const html = [];
    for (let l = 0; l < LAPS; l++) {
      lap.forEach((story, i) => html.push(this.#cardHtml(story, i % stories.length, !(l === 1 && i < stories.length))));
    }
    this.#track.innerHTML = html.join('');
    this.#measure();
    this.#track.scrollLeft = this.#lapWidth;
  }

  #measure() {
    if (!this.hasAttribute('looping')) return;
    const items = this.#track.children;
    const lapLength = items.length / LAPS;
    this.#lapWidth = items[lapLength].offsetLeft - items[0].offsetLeft;
    this.#wrap();
  }

  /** Distance from one card's start to the next. */
  #cardStep() {
    const items = this.#track.children;
    return items.length < 2 ? 0 : items[1].offsetLeft - items[0].offsetLeft;
  }

  /** The card currently snapped to the left edge. */
  #index() {
    const step = this.#cardStep();
    return step ? Math.round(this.#track.scrollLeft / step) : 0;
  }

  #goTo(index) {
    const step = this.#cardStep();
    if (!step) return;
    const left = index * step;
    // Already there: no scroll happens, so no scrollend would arrive to settle.
    if (Math.abs(this.#track.scrollLeft - left) < 1) {
      this.#settling = true;
      this.#track.scrollLeft = left;
      this.#settled();
      return;
    }
    this.#settling = true;
    this.#track.scrollTo({
      left,
      behavior: this.#reducedMotion.matches ? 'auto' : 'smooth',
    });
  }

  #settled() {
    if (this.#drag) return;
    if (this.#settling) {
      this.#settling = false;
      this.#track.classList.remove('dragging');
    }
    this.#wrap();
    // Moving on to another story stops the one playing.
    if (this.#audioStory >= 0 && this.#currentStory() !== this.#audioStory) this.#stopAudio();
  }

  /** The story whose card is snapped to the left edge. */
  #currentStory() {
    const count = this.#stories.length;
    return count ? ((this.#index() % count) + count) % count : -1;
  }

  #toggleAudio(index) {
    const url = this.#stories[index]?.audio;
    if (!url) return;
    if (!this.#audio) {
      this.#audio = new Audio();
      this.#audio.preload = 'none';
      this.#audio.addEventListener('play', () => this.#syncAudioPills(true));
      for (const type of ['pause', 'ended', 'error']) {
        this.#audio.addEventListener(type, () => this.#syncAudioPills(false));
      }
    }
    const audio = this.#audio;
    if (index === this.#audioStory && !audio.paused) {
      audio.pause();
      return;
    }
    if (index !== this.#audioStory) {
      this.#stopAudio();
      this.#audioStory = index;
      audio.src = url;
    }
    audio.play().catch((error) => {
      // A newer tap or a stop cut this one short; nothing went wrong.
      if (error.name === 'AbortError') return;
      console.error(`Unable to play ${url}:`, error);
      this.#syncAudioPills(false);
    });
  }

  /** Stop and rewind, so the story starts over next time. */
  #stopAudio() {
    if (!this.#audio || this.#audioStory < 0) return;
    this.#audio.pause();
    this.#audio.removeAttribute('src');
    this.#audio.load();
    this.#audioStory = -1;
    this.#syncAudioPills(false);
  }

  #syncAudioPills(playing) {
    for (const pill of this.#track.querySelectorAll('.pill-audio')) {
      const on = playing && Number(pill.dataset.story) === this.#audioStory;
      pill.classList.toggle('playing', on);
      pill.setAttribute('aria-pressed', String(on));
    }
  }

  /** Keep the scroll inside the middle lap by jumping one lap, which looks identical. */
  #wrap() {
    const lap = this.#lapWidth;
    if (!lap || this.#drag || this.#settling) return;
    // Jumping now would carry a keyboard-focused card out of view.
    if (this.#root.activeElement?.matches(':focus-visible')) return;
    const x = this.#track.scrollLeft;
    if (x < lap * 0.5) this.#track.scrollLeft = x + lap;
    else if (x >= lap * 1.5) this.#track.scrollLeft = x - lap;
  }

  #dragStart(event) {
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    this.#wrap();
    this.#drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: this.#track.scrollLeft,
      startIndex: this.#index(),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  }

  #dragMove(event) {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Only now take the pointer, so a plain click still reaches the card.
      drag.moved = true;
      this.#track.setPointerCapture(event.pointerId);
      this.#track.classList.add('dragging');
    }
    const dt = event.timeStamp - drag.lastTime;
    if (dt > 0) drag.velocity = (event.clientX - drag.lastX) / dt;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    this.#track.scrollLeft = drag.startScroll - dx;
  }

  #dragEnd(event) {
    const drag = this.#drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    this.#drag = null;
    if (!drag.moved) return;
    this.#suppressClick = true;
    // The click, if any, fires right after pointerup; never let a stale flag
    // swallow a later, genuine click.
    setTimeout(() => { this.#suppressClick = false; }, 0);

    // Like a swipe: a short, deliberate drag or a flick moves exactly one card.
    const dx = event.clientX - drag.startX;
    const flicked = Math.abs(drag.velocity) > FLICK_SPEED;
    const far = Math.abs(dx) > this.#cardStep() * DRAG_COMMIT;
    let target = drag.startIndex;
    if (event.type === 'pointerup' && (flicked || far)) target += dx < 0 ? 1 : -1;
    this.#goTo(target);
  }
}

if (!customElements.get('story-carousel')) {
  customElements.define('story-carousel', StoryCarousel);
}
