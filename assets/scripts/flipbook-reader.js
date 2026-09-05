let images = [];
const book = document.getElementById('book');
const stage = document.getElementById('stage');
const loading = document.getElementById('loading');
const desktopSpread = document.getElementById('desktopSpread');

let current = 0;       // number of pages turned
let zoom = 1;
let panX = 0, panY = 0;
let pointerStart = null;
let pinchStart = null;
let animating = false;
let gesturePinched = false;
const singlePageQuery = window.matchMedia("(max-width: 600px), (orientation: portrait)");
const isSinglePage = () => singlePageQuery.matches;
const visibleBook = () => isSinglePage() ? book : desktopSpread;
const pageAudio = new Audio();


function getCurrentWeekDates(today = new Date()) {

    // Start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Generate filenames
    const dates = [];

    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        const formattedDate = date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        dates.push(`${formattedDate}.webp`);
        dates.push(`${formattedDate} - Comic.webp`);
    }

    return dates;
}


// Sunday-based calendar weeks, matching getCurrentWeekDates(). UTC arithmetic avoids DST shifts.
function coverPaths(today = new Date()) {
  const year = today.getFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const day = Date.UTC(year, today.getMonth(), today.getDate());
  const week = Math.floor(((day - start.getTime()) / 86400000 + start.getUTCDay()) / 7) + 1;
  return [`images/coverpages/${year}/${year}-WEEK${week}.webp`,
    `images/coverpages/${year}/${year}-404.webp`];
}

function loadImage(path) {
  const src = new URL(path, window.location.href).href;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function hasNarration(src) {
  return !isComicImage(src) && !/\/coverpages\//.test(src);
}

function imageFileName(src) {
  try {
    return decodeURIComponent(new URL(src, window.location.href).pathname.split('/').pop() || '');
  } catch {
    return decodeURIComponent((src.split('/').pop() || '').split('?')[0]);
  }
}

function isComicImage(src) {
  return / - Comic\.[^.]+$/i.test(imageFileName(src));
}

function audioUrlForImage(src) {
  const fileName = imageFileName(src);
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const month = (baseName.match(/^([A-Za-z]+)\b/) || [])[1]
    || new Date().toLocaleString('en-US', { month: 'long' });
  return new URL(`audio/${month}/mp3/${baseName}.mp3`, window.location.href).href;
}

const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';

function sameAudioUrl(a, b) {
  if (!a || !b) return false;
  try { return decodeURI(a) === decodeURI(b); }
  catch { return a === b; }
}

function playPageAudio(src) {
  if (!hasNarration(src)) return false;
  const url = audioUrlForImage(src);
  if (sameAudioUrl(pageAudio.src, url) && !pageAudio.paused) {
    stopPageAudio();
    return true;
  }
  pageAudio.src = url;
  pageAudio.play().catch(() => {});
  return true;
}

function stopPageAudio() {
  pageAudio.pause();
  pageAudio.currentTime = 0;
  syncPlayButtons();
}

function syncPlayButtons() {
  const playingUrl = !pageAudio.paused && pageAudio.src ? pageAudio.src : '';
  document.querySelectorAll('.audio-play').forEach(btn => {
    const on = playingUrl && sameAudioUrl(playingUrl, audioUrlForImage(btn.dataset.src));
    btn.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Pause narration' : 'Play narration');
    btn.innerHTML = on ? pauseIcon : playIcon;
  });
}

function createPlayButton(src) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'audio-play';
  btn.dataset.src = src;
  btn.setAttribute('aria-label', 'Play narration');
  btn.innerHTML = playIcon;
  const stopStageGesture = e => e.stopPropagation();
  btn.addEventListener('pointerdown', stopStageGesture);
  btn.addEventListener('pointerup', stopStageGesture);
  btn.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    playPageAudio(src);
  });
  return btn;
}

function containedImageBox(img) {
  const frameW = img.clientWidth;
  const frameH = img.clientHeight;
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;
  if (!natW || !natH || !frameW || !frameH) {
    return { left: 0, top: 0, width: frameW, height: frameH };
  }
  const scale = Math.min(frameW / natW, frameH / natH);
  const width = natW * scale;
  const height = natH * scale;
  return {
    left: (frameW - width) / 2,
    top: (frameH - height) / 2,
    width,
    height
  };
}

function positionPlayButton(btn) {
  const img = btn.parentElement && btn.parentElement.querySelector('img');
  if (!img || !img.naturalWidth) return;
  const box = containedImageBox(img);
  const size = btn.offsetWidth || 44;
  const inset = 12;
  btn.style.top = `${box.top + inset}px`;
  btn.style.left = `${box.left + box.width - inset - size}px`;
  btn.classList.add('is-placed');
}

function positionPlayButtons() {
  document.querySelectorAll('.audio-play').forEach(positionPlayButton);
}

function handlePageTap(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el || el.closest('.audio-play')) return;
  if (!el.closest('.page, .spread-page')) return;
  const rect = visibleBook().getBoundingClientRect();
  if (x < rect.left + rect.width / 2) goPrev(); else goNext();
}


function fitBookToViewport() {
  const stageRect = stage.getBoundingClientRect();
  const availableW = Math.max(1, stageRect.width - 16);
  const availableH = Math.max(1, stageRect.height - 16);

  // Daily Grace artwork is portrait. Use the actual first image ratio when loaded.
  const firstImg = book.querySelector('img');
  const ratio = firstImg && firstImg.naturalWidth && firstImg.naturalHeight
    ? firstImg.naturalWidth / firstImg.naturalHeight
    : 9 / 16;

  let h = availableH;
  let w = h * ratio;

  if (w > availableW) {
    w = availableW;
    h = w / ratio;
  }

  book.style.width = `${Math.floor(w)}px`;
  book.style.height = `${Math.floor(h)}px`;

  const spreadH = Math.min(availableH, (availableW - 16) / (2 * ratio));
  desktopSpread.style.width = `${Math.floor(spreadH * ratio * 2 + 16)}px`;
  desktopSpread.style.height = `${Math.floor(spreadH)}px`;

  // Keep zoom/pan independent of the fit calculation.
  if (zoom === 1) {
    panX = 0;
    panY = 0;
    updateZoom();
  }
  requestAnimationFrame(positionPlayButtons);
}

function buildPages() {
  images.forEach((src, i) => {
    const page = document.createElement('div');
    page.className = 'page flip';
    page.style.zIndex = String(images.length - i);

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Daily Grace page ${i + 1}`;
    img.draggable = false;
    page.appendChild(img);
    if (hasNarration(src)) page.appendChild(createPlayButton(src));
    img.addEventListener('load', positionPlayButtons);
    book.appendChild(page);
  });
}

function render() {
  [...book.children].forEach((page, i) => {
    page.classList.toggle('flipped', i < current);
    // Turned pages sit above unturned pages.
    page.style.zIndex = i < current ? (20 + i) : (images.length - i);
  });
  renderDesktopSpread();
  updateZoom();
}

function renderDesktopSpread() {
  desktopSpread.replaceChildren();
  [images[current], images[current + 1]].filter(Boolean).forEach((src, offset) => {
    const wrap = document.createElement('div');
    wrap.className = 'spread-page';
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Daily Grace page ${current + offset + 1}`;
    img.draggable = false;
    wrap.appendChild(img);
    if (hasNarration(src)) wrap.appendChild(createPlayButton(src));
    img.addEventListener('load', positionPlayButtons);
    desktopSpread.appendChild(wrap);
  });
  syncPlayButtons();
  requestAnimationFrame(positionPlayButtons);
}

async function animateSpreadHalf(page, from, to, origin) {
  if (!page) return;
  const animation = page.animate([
    { transform: `perspective(1600px) rotateY(${from}deg)`, filter: 'brightness(1)' },
    { transform: `perspective(1600px) rotateY(${to}deg)`,
      filter: to === 0 ? 'brightness(1)' : 'brightness(.65)' }
  ], {
    duration: 340,
    easing: 'cubic-bezier(.4, 0, .2, 1)',
    fill: 'forwards'
  });
  page.style.transformOrigin = origin;
  page.style.zIndex = '2';
  try {
    await animation.finished;
  } finally {
    animation.cancel();
    page.style.transformOrigin = '';
    page.style.zIndex = '';
  }
}

async function turnPage(direction) {
  const next = current + direction;
  if (animating || next < 0 || next >= images.length) return;
  stopPageAudio();
  animating = true;
  const animateSpread = !isSinglePage()
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    if (animateSpread) {
      // Fold the outgoing page toward the spine, then unfold the new page away from it.
      const outgoing = direction > 0 ? desktopSpread.lastElementChild : desktopSpread.firstElementChild;
      await animateSpreadHalf(outgoing, 0, direction > 0 ? -90 : 90,
        direction > 0 ? 'left center' : 'right center');
    }
    current = next;
    render();
    if (animateSpread && !isSinglePage()) {
      const incoming = direction > 0 ? desktopSpread.firstElementChild : desktopSpread.lastElementChild;
      await animateSpreadHalf(incoming, direction > 0 ? 90 : -90, 0,
        direction > 0 ? 'right center' : 'left center');
    } else if (!animateSpread) {
      await new Promise(resolve => setTimeout(resolve, 740));
    }
  } finally {
    animating = false;
  }
}

function goNext() {
  turnPage(1);
}

function goPrev() {
  turnPage(-1);
}

function updateZoom() {
  const target = visibleBook();
  target.style.transformOrigin = 'center center';
  target.style.transform = `translate3d(${panX}px,${panY}px,0) scale(${zoom})`;
}

function clampPan() {
  const stageRect = stage.getBoundingClientRect();
  const bookRect = visibleBook().getBoundingClientRect();
  const maxX = Math.max(0, (bookRect.width - stageRect.width) / 2);
  const maxY = Math.max(0, (bookRect.height - stageRect.height) / 2);
  panX = Math.max(-maxX, Math.min(maxX, panX));
  panY = Math.max(-maxY, Math.min(maxY, panY));
}

function setZoom(z, centerX=null, centerY=null) {
  const old = zoom;
  zoom = Math.max(1, Math.min(3.5, z));
  if (centerX !== null && centerY !== null && zoom !== old) {
    // Keep the point under the user's fingers/mouse roughly stationary.
    const r = zoom / old;
    panX = centerX - (centerX - panX) * r;
    panY = centerY - (centerY - panY) * r;
  }
  if (zoom === 1) { panX = 0; panY = 0; }
  updateZoom();
  clampPan();
  updateZoom();
}

function resetFit() {
  zoom = 1;
  panX = 0;
  panY = 0;
  fitBookToViewport();
  updateZoom();
}

document.getElementById('home').addEventListener('click', () => {
  window.location.href = '../index.html';
});
pageAudio.addEventListener('play', syncPlayButtons);
pageAudio.addEventListener('pause', syncPlayButtons);
pageAudio.addEventListener('ended', stopPageAudio);

// Mouse wheel zoom (trackpads and desktop mice).
stage.addEventListener('wheel', e => {
  e.preventDefault();
  const rect = stage.getBoundingClientRect();
  const x = e.clientX - rect.left - rect.width/2;
  const y = e.clientY - rect.top - rect.height/2;
  setZoom(zoom * Math.exp(-e.deltaY * .001), x, y);
}, {passive:false});

// Pointer gestures: swipe to turn pages; drag when zoomed.
stage.addEventListener('pointerdown', e => {
  if (activePointers.size === 0) gesturePinched = false;
  stage.setPointerCapture(e.pointerId);
  pointerStart = {x:e.clientX, y:e.clientY, lastX:e.clientX, lastY:e.clientY, t:performance.now()};
  stage.classList.add('dragging');
});
stage.addEventListener('pointermove', e => {
  if (!pointerStart) return;
  if (zoom > 1 && activePointers.size < 2) {
    panX += e.clientX - pointerStart.lastX;
    panY += e.clientY - pointerStart.lastY;
    pointerStart.lastX = e.clientX;
    pointerStart.lastY = e.clientY;
    clampPan();
    updateZoom();
  }
});
stage.addEventListener('pointerup', e => {
  stage.classList.remove('dragging');
  if (!pointerStart) return;
  const dx = e.clientX - pointerStart.x;
  const dy = e.clientY - pointerStart.y;
  const dt = performance.now() - pointerStart.t;
  pointerStart = null;

  const isSwipe = Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.25 && dt < 700;
  if (gesturePinched || zoom > 1) return;
  if (isSwipe) {
    if (dx < 0) goNext(); else goPrev();
    return;
  }
  if (zoom > 1) return;
  handlePageTap(e.clientX, e.clientY);
});
stage.addEventListener('pointercancel', () => {
  stage.classList.remove('dragging');
  pointerStart = null;
});

// Native pinch-to-zoom using Pointer Events.
const activePointers = new Map();
stage.addEventListener('pointerdown', e => {
  activePointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
  if (activePointers.size === 2) {
    gesturePinched = true;
    const a=[...activePointers.values()];
    pinchStart = Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
  }
});
stage.addEventListener('pointermove', e => {
  if (!activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, {x:e.clientX,y:e.clientY});
  if (activePointers.size === 2) {
    gesturePinched = true;
    const a=[...activePointers.values()];
    const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
    if (pinchStart) setZoom(zoom * d/pinchStart);
    pinchStart=d;
  }
});
function clearPointer(e) {
  activePointers.delete(e.pointerId);
  if (activePointers.size < 2) pinchStart=null;
}

stage.addEventListener('pointerup', clearPointer);
stage.addEventListener('pointercancel', clearPointer);

// Keyboard controls.
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') goPrev();
  if (e.key === 'ArrowRight') goNext();
  if (e.key === '+' || e.key === '=') setZoom(zoom + .25);
  if (e.key === '-') setZoom(zoom - .25);
  if (e.key === '0') resetFit();
});

async function loadFlipbook() {
  try {
    const today = new Date();
    const dates = getCurrentWeekDates(today);
    const [cover, fallback] = coverPaths(today);
    const coverPromise = loadImage(cover).then(src => src || loadImage(fallback));
    const [coverImage, availableImages] = await Promise.all([
      coverPromise,
      Promise.all(dates.map(fileName => {
        const month = fileName.split(' ')[0].toLowerCase();
        return loadImage(`images/sources/${month}/${fileName}`);
      }))
    ]);
    images = [coverImage, ...availableImages].filter(Boolean);
    if (images.length === 0) {
      loading.textContent = 'No pages are available for this week yet.';
      return;
    }

    buildPages();
    await Promise.all([...book.querySelectorAll('img')].map(img => new Promise(resolve => {
      if (img.complete) resolve(); else { img.onload=resolve; img.onerror=resolve; }
    })));

    loading.style.display='none';
    resetFit();
    render();
    requestAnimationFrame(positionPlayButtons);
    new ResizeObserver(resetFit).observe(stage);
    singlePageQuery.addEventListener("change", resetFit);
  } catch (error) {
    loading.textContent = `Unable to prepare flipbook: ${error.message}`;
  }
}

loadFlipbook();
