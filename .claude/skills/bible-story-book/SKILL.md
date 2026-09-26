---
name: bible-story-book
description: Create or rebuild a DailyGrace scripture story book — story, characters, 6-panel comic script, scripture fidelity check, artist's script, image-prompt document, cover prompt and A4 reader's storybook — using tools/stories. Use when the user asks for a new Bible story, book or comic (from a passage, a subject, or a pasted retelling/transcript), or asks to regenerate, restyle or check any story PDF.
---

# Scripture story books

Every book is one content file, `tools/stories/content/<slug>.py`, turned into five PDFs in
`stories/<slug>/` by `tools/stories/build.py`. Read `tools/stories/README.md` for the file format and
commands. Use `tools/stories/content/how-much-more.py` as the model for a new file.

## Workflow for a new book

1. **Find the passage.** Work from one continuous King James passage and nothing else.
   - *A subject only* ("Jesus teaching the Our Father"): pick the account that has a scene, and name
     the parallel you did not use. If the choice changes the book materially, say which you chose
     and offer the other.
   - *A retelling or transcript*: find the fullest single passage it follows. List every detail it
     borrows from parallels or invents, with references, in the first fidelity note ("Measured
     against the source retelling"). If its ending comes from verses that are not continuous with
     the passage, keep the passage whole and say where the ending comes from and what lies between.
   - *A doctrinal teaching, not a retelling*: ask the user (AskUserQuestion) before writing whether
     the book follows the text alone (recommended) or presents the teaching, labelled. If text-only,
     measure the teaching's claims neutrally in the first fidelity note, including where it agrees.
   - Don't store long third-party transcripts in `stories/`; describe them in `PROMPT.md` and quote
     only short phrases. A short retelling the user pastes may be saved as the book's source.
2. **Read the text** from `assets/db/dailygrace.db` (`verses` joined to `books` on `book_id`), plus
   the parallels and every cross-reference you mean to cite. Count before you write: repeated words,
   who speaks and who never does, names that stop being used, lists that differ, question marks.
   Countable facts become captions; every one must be checked.
3. **Title.** A KJV phrase naming the hinge — the verse the passage turns on — not the subject.
   The subtitle carries the setting and people. Record the reasoning in `PROMPT.md` §3.
4. **Write the content file.** Story in 6–10 titled movements, 1,800–2,400 words, following the text
   verse by verse. Comic pages of exactly six panels, about 3–5 verses a page, in order, no verse
   skipped or repeated; the page the passage turns on may take one or two verses alone.
   Then write `NARRATIVE` — the same story as a novel for the storybook (see "The storybook voice").
5. **Add the story** to `tools/stories/lib/cast.py` (a fixed look for every recurring figure, and a
   NEVER SHOWN entry) and `tools/stories/lib/covers.py` (scene, why, light, title zone, avoid).
6. **Check:** `python tools/stories/check.py <slug>`. Fix every ERROR. Go through every REVIEW item:
   each must be a labelled quote of the source, a modern translation, or a gloss. Re-run until clean.
7. **Build:** `python tools/stories/build.py <slug>`. A "panel overflows" error means a panel's text
   is too long for its box — shorten it. Windows locks PDFs that are open in a viewer; if a write
   fails with "Permission denied", ask the user to close the file.
8. **Write `stories/<slug>/PROMPT.md`** by hand, following an existing one (e.g.
   `stories/too-many-for-me/PROMPT.md`): source, deliverables, request, passage choice and a table of
   differences, master-prompt additions, title brief, art direction, validation procedure.
9. **Look at the result.** Render a few pages (pypdfium2, if installed) and check them: the hinge
   page, a page with a parable or hard material, the fidelity check, the storybook title page.
10. **Write the speech** `stories/<slug>/<slug>-speech.txt` (see "The spoken story") and run
    `python tools/stories/check_speech.py <slug>`.

A very short passage (Mark 10:13–16, four verses) gets one verse to a page and fewer pages; grow the
study story from the book's own cross-references, and accept a WARN rather than pad.

## Fidelity rules (the series' standard)

- Quote the King James text exactly. Speech balloons must be verbatim. Indirect speech in the text
  ("he charged them that…", "asked what these things meant") is lettered as a CAPTION, never a balloon.
  Never give anyone words the text does not give them.
- Keep verse order within a verse: never split a verse across panels in reverse order.
- Take stated emotions at face value (Herod "exceeding sorry" is real). Don't soften what the text
  leaves hard (Lot's offer is quoted in full) and don't resolve what it leaves open.
- Don't import names, ages or details the passage withholds (no "Salome", no "rich young ruler", no
  apple, no 32,000). Say where a traditional detail comes from.
- The adaptation's own readings go in captions, never in anyone's mouth, and are flagged in the
  fidelity check. Cultural context and notes on Hebrew or Greek are flagged as such.
- Note manuscript differences behind modern translations; keep the King James reading.

## The storybook voice (`NARRATIVE`)

`STORY` is the study retelling: it explains, points at words, and argues ("notice…", "the text says…").
The user found that voice unnatural for reading. The storybook is set from `NARRATIVE` instead — the
same events told as a good novel would tell them. Model: `tools/stories/content/a-great-way-off.py`.

- Tell it; don't explain it. No "notice", "it is worth", "the text/parable/narrator says", "the
  hinge", verse numbers, or talk about the book or the reader. Let the ending stand without a moral;
  the storybook has no closing essay when `NARRATIVE` is present.
- Scene, weather, light, hands, faces, silence: concrete detail the period and the text allow (the
  style bible is the guide). Vary sentence length; short paragraphs for turns (“He ran.”).
- Every line a character speaks is verbatim KJV, quoted in full or split around "he said"; reported
  speech stays reported (v.26 "asked what these things meant" is never turned into a line).
- Keep every fidelity and depiction rule: no invented names, no added events, nothing the restraint
  list forbids. Interior thought only where the text gives it (the son "said" in the pig field) or as
  plain, modest inference from what the characters do.
- About 1,800–2,400 words, same chapter headings as `STORY`. A short passage (Luke 11:1–13,
  Mark 6:14–29) runs shorter, about 900–1,500; never pad it with invented events.
- Give no totals the text doesn't give (Judges 7 never says 32,000), and don't soften what it
  leaves hard (the heads of Oreb and Zeeb are named once, plainly, and not described).

## The spoken story (`<slug>-speech.txt`)

For telling the story aloud in an auditorium: the user speaks it as the book's author, not reading
the storybook word for word. Written by hand from `NARRATIVE`, saved as
`stories/<slug>/<slug>-speech.txt`. Model: `stories/a-great-way-off/a-great-way-off-speech.txt`.

- Plain text only: the title on the first line, then paragraphs separated by blank lines. No
  headings, stage directions, pause marks, notes or hints of any kind.
- Never name the time of the telling — no "good evening", "tonight", "this morning". Open with
  something like "Let me tell you a story…" / "Let me tell you about…". Times inside the story are
  fine.
- A storyteller's voice: present tense where it helps, short sentences, direct address ("Picture
  this", "Think about that", "Did you hear what he called him?"), plain glosses of hard KJV words
  (fuller, charger, importunity) said in passing.
- Quoted speech (in double quotes) is verbatim KJV; long speeches may be partly paraphrased
  *outside* the quote marks. Keep every fidelity rule — no invented events, names or totals.
- Close with a short, personal thought from the teller (two to four sentences, no sermon), then
  "Thank you."
- Check: `python tools/stories/check_speech.py <slug>` (quotes vs the passage, time references).

## Depiction rules

- Never draw God — the LORD, the Father, the voice from the cloud. Letter his words from off-panel
  (`THE LORD (off):`). Never depict the Holy Spirit with an image from another passage (no dove).
- Jesus is drawn: a first-century Galilean man, no halo, no glow, no European features.
- Angels the people see as men are drawn as men. The fourth man in the fire: presence and light.
- Unclean spirits are never drawn; show only their effect.
- Parables and "which of you" stories use a distinct *parable treatment* (different border and
  palette) so they never read as events.
- Children may read these: no gore, no one burning, no severed heads, no explicit nudity, nothing
  sexualised, no drawn execution or dance; the threat is shown through numbers, noise and posture.
- Carry motifs across pages by panel number (the ringed hand, the door, the hands full of lamps).

## Output formats (as approved by the user)

- **Storybook** (`make_reader_pdf.py`): A4. `assets/images/end-paper.svg` tiled as the paper (from the
  pre-rendered `tools/stories/assets/end-paper-tile.png`). Title page: `daily-grace-banner-02.webp` at
  60% of the page width, title in Germania One, subtitle and reference in Strait. Body text Strait
  16 pt, left-aligned, emphasis in rust colour (Strait has no italic). Chapters run on — no new page
  per chapter; headings are `<super>VI</super> – The Robe, the Ring, and the Shoes`, the numeral
  superscript and the dash set in Strait; a heading never sits at a page foot without three lines of
  its chapter. Closes with "The Heart of the Story" (THEME) and a KJV public-domain line. Footer on
  every page: `dg-icon-gold.webp` + "Grace for Today • Our Faith Tomorrow", Strait 11 pt, heading
  brown, not bold.
- **Image prompts** and **cover prompt**: portrait 9:16 (the site's story aspect); six equal panels
  in a 2 × 3 grid; "full-width" panels become KEY PANELs of the same size; the cover's only text is the
  title, spelled exactly.

## Gotchas

- Germania One has no "…"; the generators swap in "...". Strait has no bold; don't fake one unless
  asked (the user rejected a faux-bold footer).
- The database spells "Abed-nego" and has a stray space in "Abel- meholah"; the checker allows for both.
- Content text may use HTML entities or Unicode; the tools handle both.
- When editing content files, prefer the Edit tool: scripted `str.replace` patches with escaped
  dashes and quotes silently fail to match.
