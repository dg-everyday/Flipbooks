const today = new Date();
const monthFolder = today.toLocaleString('en-US', { month: 'long' });
const month = monthFolder.toLowerCase();
const dateName = today.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});
document.getElementById('current-date').textContent = dateName;

const posterCard = document.getElementById('poster-card');
const dailyPoster = document.getElementById('daily-poster');
const posterPath = `reader/images/sources/${month}/${dateName}`;
const todayAudioUrl = `reader/audio/${monthFolder}/mp3/${dateName}.mp3`;
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
const pauseIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
const verseAudioButton = document.getElementById('verse-audio-play');
const verseAudio = new Audio(todayAudioUrl);
let showingComic = false;

function syncVerseAudioButton() {
  const playing = !verseAudio.paused;
  const label = playing ? "Pause today's narration" : "Play today's narration";
  verseAudioButton.classList.toggle('is-playing', playing);
  verseAudioButton.setAttribute('aria-pressed', String(playing));
  verseAudioButton.setAttribute('aria-label', label);
  verseAudioButton.title = label;
  verseAudioButton.innerHTML = playing ? pauseIcon : playIcon;
}

verseAudioButton.addEventListener('click', event => {
  event.stopPropagation();
  if (verseAudio.paused) {
    verseAudio.play().catch(() => {});
  } else {
    verseAudio.pause();
    verseAudio.currentTime = 0;
  }
});
verseAudio.addEventListener('play', syncVerseAudioButton);
verseAudio.addEventListener('pause', syncVerseAudioButton);
verseAudio.addEventListener('ended', () => {
  verseAudio.currentTime = 0;
  syncVerseAudioButton();
});

function togglePoster() {
  showingComic = !showingComic;
  dailyPoster.src = `${posterPath}${showingComic ? ' - Comic' : ''}.webp`;
  posterCard.setAttribute(
    'aria-label',
    showingComic ? "Show today's regular poster" : "Show comic version of today's poster"
  );
}

dailyPoster.src = `${posterPath}.webp`;
posterCard.addEventListener('click', togglePoster);
posterCard.addEventListener('keydown', event => {
  if (event.target !== posterCard) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    togglePoster();
  }
});
fetch('assets/verses.json')
  .then(response => {
    if (!response.ok) throw new Error(`Unable to load assets/verses.json (${response.status})`);
    return response.json();
  })
  .then(verses => {
    const currentVerse = verses.find(item => item.id === dateName);
    if (!currentVerse) throw new Error(`No verse found for ${dateName}`);

    document.getElementById('verse-text').textContent = currentVerse.text;
    document.getElementById('verse-reference').textContent = currentVerse.verse;
    document.getElementById('reflection-text').textContent = currentVerse.reflection;
    document.getElementById('hero-verse-text').textContent = currentVerse.text;
    document.getElementById('hero-verse-reference').textContent = currentVerse.verse;
  })
  .catch(error => {
    document.getElementById('verse-text').textContent = error.message;
    document.getElementById('reflection-text').textContent = 'Please check the daily devotional data.';
  });
