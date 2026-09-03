const today = new Date();
const month = today.toLocaleString('en-US', { month: 'long' }).toLowerCase();
const dateName = today.toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric'
});
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
const weekNumber = Math.ceil((today.getDate() + firstDayOfMonth) / 7);

const posterCard = document.getElementById('poster-card');
const dailyPoster = document.getElementById('daily-poster');
const posterPath = `reader/images/sources/${month}/${dateName}`;
let showingComic = false;

function togglePoster() {
  showingComic = !showingComic;
  dailyPoster.src = `${posterPath}${showingComic ? ' - Comic' : ''}.png`;
  posterCard.setAttribute(
    'aria-label',
    showingComic ? "Show today's regular poster" : "Show comic version of today's poster"
  );
}

dailyPoster.src = `${posterPath}.png`;
posterCard.addEventListener('click', togglePoster);
posterCard.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    togglePoster();
  }
});
document.getElementById('weekly-flipbook-link').href =
  `reader/flipbook-reader.html?${month}-week${weekNumber}.json`;
document.getElementById('hero-weekly-flipbook-link').href =
  `reader/flipbook-reader.html?${month}-week${weekNumber}.json`;

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
