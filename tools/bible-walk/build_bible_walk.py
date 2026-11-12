# -*- coding: utf-8 -*-
"""Build The Living Voice (worked on as "Bible Walk", the name its files keep): the narration texts for text-to-speech, and the data the app reads.

Reads every episode script in tools/bible-walk/scripts/<folder>/<id>.txt and the plans
in plans.py, and writes:

  tools/bible-walk/narration/text/<id>.txt   the words exactly as they are to be spoken
                                             (pronounce.txt respellings applied), to paste
                                             into the TTS tool;
  assets/bible-walk/walk.json                the plans and episodes for the page and the
                                             home card (apps/pages/bible-walk.html);
  assets/bible-walk/transcripts/<id>.txt     each episode's words, as the reader sees them.

    python tools/bible-walk/build_bible_walk.py            # all scripts
    python tools/bible-walk/build_bible_walk.py mark-01    # check and write one or more ids
    python tools/bible-walk/build_bible_walk.py --dry-run  # check only
    python tools/bible-walk/build_bible_walk.py --probe    # also look for new recordings

An episode plays in the app once its recording is on R2 at
audio/bible-walk/<folder>/<id>.webm and its length is in recorded.json. --probe asks
ffprobe for the length of every episode not in recorded.json yet (and, with ids, of
those episodes again, after a re-recording). recorded.json is kept by hand otherwise.

There are two kinds of episode.

A chapter episode (mark-01, or bp-genesis-01 for a plan's own telling of a
chapter; the book comes from the id) walks through one chapter in seven parts:

    # Mark 1: notes for the writer (ignored)
    TITLE: Prepare Ye the Way
    HOOK: ...
    WHERE: ...
    STORY: ...
    KEY 1:15: ...      three of these, one per verse explained
    THREAD: ...
    TODAY: ...
    QUESTION: ...
    PRAYER: ...
    NEXT: ...

An intro episode (walk-00, mark-00) introduces the walk, a plan or a book:

    TITLE, HOOK, BODY, QUESTION, PRAYER, NEXT

A field runs on over the following lines until the next FIELD: line; a blank line
starts a new paragraph. 'Single quotes' mark Scripture and are checked word for word
against the KJV in assets/db/dailygrace.db. Use ’ for apostrophes in ordinary words.

Checks (nothing is written if any script fails one):
  * every field present, each KEY verse in that chapter;
  * every 'quote' word for word in the KJV;
  * no written references (1:15) outside quotes: speak them, "verse 15";
  * no time of day, weekday, month or present-day holiday outside quotes,
    since an episode plays on any day at any hour;
  * the length: chapter episodes 1,050-1,350 words, intros 500-850 (the voice reads
    about 175 a minute, so a chapter runs 6 to 8 minutes).
"""
import argparse, json, os, re, sqlite3, subprocess, sys
from urllib.parse import quote

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools"))
sys.path.insert(0, HERE)
from kjv_quotes import QUOTE, Quotes  # noqa: E402
from plans import EPISODE_ART, EPISODE_LABELS, PLANS  # noqa: E402

BIBLE_DB = os.path.join(ROOT, "assets", "db", "dailygrace.db")
SETTINGS = os.path.join(ROOT, "apps", "settings", "appsettings.json")
SCRIPTS = os.path.join(HERE, "scripts")
OUT_DIR = os.path.join(HERE, "narration", "text")
PRONOUNCE = os.path.join(HERE, "pronounce.txt")
RECORDED = os.path.join(HERE, "recorded.json")
APP_DIR = os.path.join(ROOT, "assets", "bible-walk")
APP_JSON = os.path.join(APP_DIR, "walk.json")
TRANSCRIPTS = os.path.join(APP_DIR, "transcripts")

WORDS_PER_MINUTE = 175  # measured: Mark 1, 1,341 words in 7:37
CHAPTER_WORDS = (1050, 1350)
INTRO_WORDS = (500, 850)
CHAPTER_FIELDS = ["TITLE", "HOOK", "WHERE", "STORY", "THREAD", "TODAY", "QUESTION", "PRAYER", "NEXT"]
INTRO_FIELDS = ["TITLE", "HOOK", "BODY", "QUESTION", "PRAYER", "NEXT"]
KEYS_PER_CHAPTER = 3
NAME = "The Living Voice"  # the module's name, spoken first and last in every episode
CLOSING = f"This has been {NAME}, in Daily Grace. Grace for Today. Our Faith Tomorrow."

TIME_WORDS = re.compile(
    r"\b(morning|mornings|evening|evenings|tonight|night|nights|noon|midnight|afternoon|"
    r"sunrise|sunset|dawn|dusk|yesterday|tomorrow|weekend|"
    r"monday|tuesday|wednesday|thursday|friday|saturday|sunday|"
    r"january|february|april|june|july|august|september|october|november|december|"
    r"christmas|easter|lent|lenten|advent|holy week|good friday|new year)\b",
    re.IGNORECASE)
WRITTEN_REF = re.compile(r"\b\d+:\d+")
FIELD = re.compile(r"^(KEY (\d+):(\d+)|[A-Z]+):\s?(.*)$")
EPISODE_ID = re.compile(r"(.+)-(\d+)")
# A plan's own version of a chapter carries the plan's prefix: bp-genesis-01 is
# Genesis 1 as told in The Big Picture, apart from the genesis-01 of a Genesis plan.
PLAN_PREFIXES = ("bp-",)


def book_slug(slug):
    """genesis for genesis or bp-genesis."""
    for prefix in PLAN_PREFIXES:
        if slug.startswith(prefix):
            return slug[len(prefix):]
    return slug


# ---------------------------------------------------------------- reading

def read_script(path):
    fields, keys, current, problems = {}, [], None, []
    for n, raw in enumerate(open(path, encoding="utf-8"), 1):
        line = raw.rstrip()
        if line.startswith("#"):
            continue
        m = FIELD.match(line)
        if m:
            if m.group(2):
                current = {"chapter": int(m.group(2)), "verse": int(m.group(3)), "text": [m.group(4)]}
                keys.append(current)
            else:
                name = m.group(1)
                if name in fields:
                    problems.append(f"line {n}: {name} appears twice")
                current = {"text": [m.group(4)]}
                fields[name] = current
            continue
        if current is None:
            if line.strip():
                problems.append(f"line {n}: text before the first field")
            continue
        current["text"].append(line)
    join = lambda parts: re.sub(r"\n{3,}", "\n\n", "\n".join(parts)).strip()
    out = {name: join(f["text"]) for name, f in fields.items()}
    for k in keys:
        k["text"] = join(k["text"])
    return out, keys, problems


def paragraphs(text):
    """Join wrapped lines; keep blank-line paragraph breaks."""
    return "\n\n".join(re.sub(r"\s*\n\s*", " ", p).strip() for p in re.split(r"\n\s*\n", text) if p.strip())


def book_for(slug, books):
    key = slug.replace("-", "")
    for book_id, name in books:
        if name.lower().replace(" ", "") == key:
            return book_id, name
    return None, None


def read_pronounce():
    pairs = []
    if os.path.exists(PRONOUNCE):
        for line in open(PRONOUNCE, encoding="utf-8"):
            line = line.split("#", 1)[0].strip()
            if "=" in line:
                word, say = (p.strip() for p in line.split("=", 1))
                pairs.append((re.compile(rf"\b{re.escape(word)}\b"), say))
    return pairs


def read_recorded():
    if os.path.exists(RECORDED):
        with open(RECORDED, encoding="utf-8") as f:
            return json.load(f)
    return {}


# ---------------------------------------------------------------- building

def chapter_name(book_name, chapter):
    return f"Psalm {chapter}" if book_name == "Psalms" else f"{book_name} {chapter}"


def assemble(kind, fields, keys, book_name, chapter):
    p = lambda name: paragraphs(fields[name])
    if kind == "chapter":
        heading = f"Psalm {chapter}" if book_name == "Psalms" else f"{book_name}, chapter {chapter}"
        parts = [f"{NAME}. {heading}. {fields['TITLE']}.", p("HOOK"), p("WHERE"), p("STORY"),
                 "Now, three verses to hold on to."]
        parts += [f"Verse {k['verse']}. {paragraphs(k['text'])}" for k in keys]
        parts += [p("THREAD"), p("TODAY"), f"Here is today’s question. {p('QUESTION')}"]
    else:
        parts = [f"{NAME}. {fields['TITLE']}.", p("HOOK"), p("BODY"),
                 f"Here is a question to carry with you. {p('QUESTION')}"]
    parts += [f"Let us pray. {p('PRAYER')}", p("NEXT"), CLOSING]
    return "\n\n".join(parts) + "\n"


def outside_quotes(text):
    return QUOTE.sub(" ", text)


def check(kind, fields, keys, text, quotes, db, book_id, chapter):
    problems = []
    need = CHAPTER_FIELDS if kind == "chapter" else INTRO_FIELDS
    for name in fields:
        if name not in need:
            problems.append(f"{name} is not a field of a {kind} episode")
    if kind == "chapter":
        if len(keys) != KEYS_PER_CHAPTER:
            problems.append(f"{len(keys)} KEY verses; a chapter episode explains {KEYS_PER_CHAPTER}")
        for k in keys:
            found = db.execute("select 1 from verses where book=? and chapter=? and verse=?",
                               (book_id, k["chapter"], k["verse"])).fetchone()
            if k["chapter"] != chapter or not found:
                problems.append(f"KEY {k['chapter']}:{k['verse']} is not a verse of this chapter")
    elif keys:
        problems.append("an intro episode has no KEY verses")
    problems += [f"quote: {p}" for p in quotes.problems(text)]
    plain = outside_quotes(text.replace(CLOSING, ""))  # the tagline's "Tomorrow" is not a time
    for m in WRITTEN_REF.finditer(plain):
        problems.append(f"written reference '{m.group(0)}': speak it (chapter 1, verse 15)")
    for m in TIME_WORDS.finditer(plain):
        problems.append(f"'{m.group(0)}' names a time or a day; the episode plays at any hour")
    lo, hi = CHAPTER_WORDS if kind == "chapter" else INTRO_WORDS
    count = len(text.split())
    if not lo <= count <= hi:
        problems.append(f"{count} words; aim for {lo}-{hi}")
    return problems


def probe(url):
    """The recording's length in seconds, or None if it isn't there."""
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", url],
            capture_output=True, text=True, timeout=60)
    except (OSError, subprocess.TimeoutExpired):
        return None
    try:
        return round(float(out.stdout.strip()), 1)
    except ValueError:
        return None


def label_for(eid, books):
    """How a plan names an episode: "Mark 1", "Mark" for its intro, or EPISODE_LABELS."""
    if eid in EPISODE_LABELS:
        return EPISODE_LABELS[eid]
    m = EPISODE_ID.fullmatch(eid)
    _, book_name = book_for(book_slug(m.group(1)), books) if m else (None, None)
    if not book_name:
        return eid
    chapter = int(m.group(2))
    return f"Meet {book_name}" if chapter == 0 else chapter_name(book_name, chapter)


def art_for(eid, books):
    if eid in EPISODE_ART:
        return EPISODE_ART[eid]
    m = EPISODE_ID.fullmatch(eid)
    _, book_name = book_for(book_slug(m.group(1)), books) if m else (None, None)
    return symbol_art(book_name) if book_name else None


def symbol_art(book_name):
    return f"media:images/symbols/{quote(book_name)}-symbol.svg"


def app_data(built, recorded, books):
    episodes = {}
    for e in built:
        seconds = recorded.get(e["id"])
        if not seconds:
            continue
        episodes[e["id"]] = {
            "title": e["title"],
            "label": label_for(e["id"], books),
            "book": e["book"],
            "chapter": e["chapter"] or None,
            "art": art_for(e["id"], books),
            # R2 lets browsers keep a file for a day: a recording made again under
            # the same name gets a new link from its new length (tenths of a second).
            "audio": f"media:audio/bible-walk/{e['folder']}/{e['id']}.webm?v={round(seconds * 10)}",
            "seconds": seconds,
            "question": paragraphs(e["fields"]["QUESTION"]),
            "keys": [f"{k['chapter']}:{k['verse']}" for k in e["keys"]],
        }
    plans = []
    for plan in PLANS:
        cover = plan["cover"]
        plans.append({
            "id": plan["id"],
            "title": plan["title"],
            "subtitle": plan["subtitle"],
            "about": plan["about"],
            "cover": symbol_art(cover["symbol"]) if "symbol" in cover else cover["image"],
            "episodes": [{"id": eid, "label": label_for(eid, books)} for eid in plan["episodes"]],
        })
    return {"plans": plans, "episodes": episodes}


def transcript(text):
    """The spoken words without the opening and closing lines, one paragraph per line."""
    parts = text.strip().split("\n\n")
    return "\n".join(parts[1:-1]) + "\n"


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("ids", nargs="*", help="episode ids (default: all)")
    ap.add_argument("--dry-run", action="store_true", help="check only; write nothing")
    ap.add_argument("--probe", action="store_true", help="look for recordings on R2 (see above)")
    args = ap.parse_args()

    db = sqlite3.connect(BIBLE_DB)
    quotes = Quotes(db)
    books = list(db.execute("select book_id, book_name from books"))
    pronounce = read_pronounce()
    plan_ids = {eid for plan in PLANS for eid in plan["episodes"]}

    scripts = []
    for folder in sorted(os.listdir(SCRIPTS)):
        for name in sorted(os.listdir(os.path.join(SCRIPTS, folder))):
            if name.endswith(".txt"):
                scripts.append((folder, name[:-4], os.path.join(SCRIPTS, folder, name)))
    if args.ids:
        unknown = set(args.ids) - {eid for _, eid, _ in scripts}
        if unknown:
            sys.exit(f"No script for: {', '.join(sorted(unknown))}")

    built, failed = [], False
    for folder, eid, path in scripts:
        m = EPISODE_ID.fullmatch(eid)
        if not m:
            print(f"{eid}: the id must end in -NN (mark-01, mark-00, walk-00)")
            failed = True
            continue
        chapter = int(m.group(2))
        kind = "intro" if chapter == 0 else "chapter"
        fields, keys, problems = read_script(path)
        book_id, book_name = book_for(book_slug(m.group(1)), books)
        if kind == "chapter" and not book_id:
            problems.append(f"'{m.group(1)}' is not a book of the Bible")
        if eid not in plan_ids:
            problems.append("no plan in plans.py includes this episode")
        missing = [f for f in (CHAPTER_FIELDS if kind == "chapter" else INTRO_FIELDS) if not fields.get(f)]
        problems += [f"{f} is missing" for f in missing]
        text = ""
        if not problems:
            text = assemble(kind, fields, keys, book_name, chapter)
            problems = check(kind, fields, keys, text, quotes, db, book_id, chapter)
        if problems:
            failed = True
            print(f"{eid}:")
            for p in problems:
                print(f"  - {p}")
            continue
        spoken = text
        for pattern, say in pronounce:
            spoken = pattern.sub(say, spoken)
        built.append({"id": eid, "folder": folder, "book": book_name, "chapter": chapter,
                      "title": fields["TITLE"], "fields": fields, "keys": keys,
                      "text": text, "spoken": spoken})

    if failed:
        sys.exit("Nothing written: fix the problems above.")

    recorded = read_recorded()
    if args.probe:
        with open(SETTINGS, encoding="utf-8") as f:
            media = json.load(f)["media_base_url"]
        for e in built:
            if e["id"] in recorded and e["id"] not in args.ids:
                continue
            seconds = probe(f"{media}audio/bible-walk/{e['folder']}/{e['id']}.webm")
            if seconds:
                print(f"{e['id']}: recorded, {int(seconds // 60)}:{round(seconds % 60):02d}")
                recorded[e["id"]] = seconds
            else:
                print(f"{e['id']}: no recording on R2 yet")
                recorded.pop(e["id"], None)

    if not args.dry_run:
        os.makedirs(OUT_DIR, exist_ok=True)
        os.makedirs(TRANSCRIPTS, exist_ok=True)
        for e in built:
            if args.ids and e["id"] not in args.ids:
                continue
            with open(os.path.join(OUT_DIR, f"{e['id']}.txt"), "w", encoding="utf-8", newline="\n") as f:
                f.write(e["spoken"])
            with open(os.path.join(TRANSCRIPTS, f"{e['id']}.txt"), "w", encoding="utf-8", newline="\n") as f:
                f.write(transcript(e["text"]))
        with open(RECORDED, "w", encoding="utf-8", newline="\n") as f:
            json.dump(dict(sorted(recorded.items())), f, indent=2)
            f.write("\n")
        with open(APP_JSON, "w", encoding="utf-8", newline="\n") as f:
            json.dump(app_data(built, recorded, books), f, ensure_ascii=False, indent=1)
            f.write("\n")

    for e in built:
        if args.ids and e["id"] not in args.ids:
            continue
        words = len(e["spoken"].split())
        mins, secs = divmod(round(words / WORDS_PER_MINUTE * 60), 60)
        state = "recorded" if e["id"] in recorded else "to record"
        print(f"{e['id']:<12} {words:>5} words  ~{mins}:{secs:02d}  {state:<9}  {e['title']}")
    if args.dry_run:
        print("Checked.")
    else:
        print(f"Wrote {os.path.relpath(OUT_DIR, ROOT)}, {os.path.relpath(APP_DIR, ROOT)}.")


if __name__ == "__main__":
    main()
