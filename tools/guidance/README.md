# Guidance for Life data

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

## Topic fields

| Field | Meaning |
|---|---|
| `name`, `question` | The topic, and how a reader would ask it ("What do I do with my anger?"). |
| `section` | Heart and mind, Relationships, Work and money, Walking with God, Hard times, The future. |
| `summary`, `guidance` | The short answer; the guidance in plain words. |
| `teachings` | `[{voice, who, hero?, reference, note, example?}]`. `voice` is Jesus, The prophets, The apostles, Wisdom, or Law and history; `note` says what it means in plain words. The build adds `text` and `testament`. |
| `practice`, `prayer` | One thing to do; a short prayer. |
