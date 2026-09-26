# Story book tooling

Everything behind the scripture story books in `stories/<slug>/` (that folder is git-ignored; this
one is not). Each story is one content file; four generators turn it into five PDFs.

```sh
python tools/stories/check.py <slug>            # check against the KJV first — fix every ERROR
python tools/stories/build.py <slug>            # all five PDFs
python tools/stories/build.py <slug> --only storybook,cover
python tools/stories/check.py --all && python tools/stories/build.py --all
```

`<slug>` is a file name in `content/` without `.py`, and the name of its output folder.

| Output | What it is |
| --- | --- |
| `<slug>.pdf` | story, characters, comic script (six panels a page), scripture fidelity check |
| `<slug>-script.pdf` | the artist's script: how-to-read, cast, page breakdown, script pages, style bible, one prompt per panel |
| `<slug>-image-prompts.pdf` | one document for a multi-page comic generator: instructions, art direction, fixed character looks, every panel with its lettering |
| `<slug>-cover-prompt.pdf` | one 9:16 cover image whose only text is the title |
| `<slug>-storybook.pdf` | the story text set as an A4 reader's book on the site's end paper |
| `<slug>-speech.txt` | the story as the author tells it aloud to an audience; plain text, written by hand from `NARRATIVE` |
| `<slug>-speech-part-<n>.txt` | the speech cut at paragraph breaks into parts of about three minutes aloud (`chunk_speech.py <slug>` or `--all`) |

`stories/<slug>/PROMPT.md` records how each book was made (request, passage choice, title, art
direction, validation). It is written by hand, not generated.

## Layout

```
tools/stories/
  build.py              builds the PDFs
  check.py              checks quotations, balloons, verse coverage and length against the KJV
  check_speech.py       checks a speech's quotations against the KJV and flags time-of-day words
  chunk_speech.py       splits each speech into parts of about three minutes read aloud (140 wpm)
  content/<slug>.py     one story: the text, characters, pages, fidelity notes, style bible
  lib/bookgen.py        <slug>.pdf and <slug>-script.pdf
  lib/make_prompt_pdf.py    <slug>-image-prompts.pdf
  lib/make_cover_pdf.py     <slug>-cover-prompt.pdf
  lib/make_reader_pdf.py    <slug>-storybook.pdf
  lib/cast.py           fixed character looks per story (image prompts and cover)
  lib/covers.py         one cover concept per story
  assets/end-paper-tile.png   assets/images/end-paper.svg rendered by Chrome at 4x
```

## A content file

Copy an existing file (`content/how-much-more.py` is a good model) and keep every name.

| Name | Holds |
| --- | --- |
| `TITLE`, `SUBTITLE`, `REFERENCE`, `LOGLINE` | the title names the passage's hinge; `REFERENCE` is `"Book c:v–v (King James Version)"` |
| `HEADER_L`, `HEADER_R` | running headers |
| `MOVEMENT_WORD`, `PANEL_WORD`, `PAGE_WORDS` | "Six", "thirty-six", `["One", …]` |
| `STORY` | `[(heading, [paragraph, …]), …]` — headings like `"VI. The Robe, the Ring, and the Shoes"` |
| `THEME` | the closing "hinge" paragraph of the study retelling |
| `NARRATIVE` | the story told as a novel for the storybook, same shape as `STORY`. Plain narrative prose, no commentary; every line a character speaks is verbatim KJV. Without it the storybook falls back to `STORY` + `THEME` |
| `CHARACTERS` | `[(name, role, profile, verses), …]` |
| `PAGES` | `[("Page One — Title", "Book c:v–v", [(shot, action, lettering) × 6]), …]` |
| `VALIDATION_INTRO`, `VALIDATION_MAP`, `VALIDATION_NOTES`, `FOOTER_NOTE` | the fidelity check |
| `PROMPT_TAIL`, `SCRIPT_FOOTER`, `BEATS`, `KEYS`, `HOWTO`, `STYLE_BIBLE`, `PAGE_LIGHT` | the artist's script |

Text uses ReportLab's mini-markup (`<i>`, `<b>`) and either Unicode punctuation or HTML entities.
Lettering lines, one per line inside a panel's third field:

```
CAPTION: “…”  (v.12)          a caption box
CAPTION (lower): …            a second box at the bottom
JESUS: “…”  (11:2)            a speech balloon — must be verbatim KJV
THE LORD (off): “…”           balloon whose tail runs off the panel
JESUS (caption): “…”          words set in a caption, not a balloon
NO LETTERING.
```

Add the story to `lib/cast.py` (`CAST[slug]`) and `lib/covers.py` (`COVERS[slug]`) for the image and
cover prompts; `build.py` skips those two outputs if either is missing.

## Requirements

Python with `reportlab`, `Pillow` (with WebP) and, for the checks below, `fontTools`. The storybook
uses the site's own fonts and images from `assets/`. If `assets/images/end-paper.svg` changes,
re-render the tile with Chrome (`--headless=new --force-device-scale-factor=4 --window-size=240,240
--screenshot=…`), since ReportLab cannot draw SVG filters.

Font gaps the generators already work around: Germania One has no ellipsis; Strait has no italic or
bold (emphasis is set in a rust colour instead).
