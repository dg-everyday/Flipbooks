# Questions We All Ask data

Builds `assets/guidance-for-life.json`, which `apps/pages/guidance-for-life.html` reads.

1. Edit `content/topics.py`.
2. Run from the repo root:

   ```
   python tools/guidance/build_guidance.py
   ```

   It gives each topic an id from its name (or use an explicit `id`), checks the section and
   each teaching's voice, checks every reference and fills in the exact KJV text, checks that
   `hero` ids exist on the Heroes and Villains page, and checks that every 'single-quoted'
   phrase is word for word in the KJV (`tools/kjv_quotes.py`). A teaching given to Jesus must
   be his own words: every verse in its reference must carry red letters in
   `assets/red-letter.json`. Mark something he did rather than said (John 11:35) with
   `"example": True`. It exits non-zero on any problem.

Quote Scripture in 'single quotes', exactly as `assets/db/dailygrace.db` has it. Put anything
that is not Scripture in “double quotes”.

## Narration

After a build, run:

```
python tools/guidance/build_narration.py
```

It writes the scripts for the play button on "Today's Question" to `narration/`:
`questions-we-all-ask-narration.pdf` (one script per page, with a contents table) and
`text/<id>.txt` (the same scripts as plain text, to paste into the text-to-speech tool). Each
script reads the question, the short answer, the guidance, two or three passages in the KJV
words with their references spoken out, the thing to try and the prayer, in about two minutes.
Save each recording as `<id>.webm`. If a topic's text changes, rebuild and record that topic
again. It exits non-zero if a script names a time of day, since the audio plays at any hour.

## Topic fields

| Field | Meaning |
|---|---|
| `name`, `question` | The topic, and how a reader would ask it ("What do I do with my anger?"). |
| `section` | Heart and mind, Relationships, Work and money, Walking with God, Hard times, The future. |
| `summary`, `guidance` | The short answer; the guidance in plain words. |
| `teachings` | `[{voice, who, hero?, reference, note, example?}]`. `voice` is Jesus, The prophets, The apostles, Wisdom, or Law and history; `note` says what it means in plain words. The build adds `text` and `testament`. |
| `practice`, `prayer` | One thing to do; a short prayer. |
