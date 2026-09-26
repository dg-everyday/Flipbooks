# Bible peoples data

One JSON file per people group of the Bible (Moabites, Philistines, Hittites …) in
`assets/peoples/`, plus a generated `assets/peoples/index.json` listing them all.

## Workflow

1. Edit or add `assets/peoples/<id>.json` by hand (the file name must equal `id`).
2. Run from the repo root:

   ```
   python tools/people/build_people.py
   ```

   This checks every `reference` / `references` entry against the KJV in
   `assets/db/dailygrace.db`, fills `key_verses[].text` with the exact KJV wording,
   checks `related_peoples` ids, and rewrites `index.json`. It exits non-zero on any
   bad reference, so never hand-type verse text — let the script fill it.

Reference format: `Book C:V`, `Book C:V-V`, `Book C:V-C:V`, `Book C` or `Book C-C`,
using the book names in the `books` table (`Psalms`, `Song of Solomon`, `1 Kings` …).

## Fields

| Field | Meaning |
|---|---|
| `id`, `name`, `kjv_names`, `also_known_as` | Identity; `kjv_names` are the spellings the KJV uses. |
| `category`, `group`, `testaments` | Kind of people (e.g. "Empire", "Canaanite nation"); the filter group on peoples.html (Israel, Peoples of Canaan, Neighbours & kin, Empires & kingdoms, Before Israel); which testaments name them. |
| `summary`, `name_meaning` | Short overview; what the name means. |
| `origin` | How they came to be, with references. |
| `lineage` | `ancestor`, `line` (ancestor chain from Noah where the Bible gives it), `notes`. |
| `tribes` | Israelites only: the twelve tribes. |
| `homeland` | `region`, `description`, `modern_location`, `modern_countries`, `center` {lat, lon} and `places` [{name, modern_name, lat, lon, note, references}] for maps. Coordinates are approximate. |
| `timeline` | [{date, event, references}] — dates are conventional and approximate ("c."); debated dates say so. |
| `religion` | Gods and practices. |
| `importance` | Their significance in the Bible. |
| `impact` | [{who, how, references}] — how they affected other people's lives. |
| `notable_people`, `key_verses` | Named individuals; key KJV verses (text filled by the script). |
| `fate`, `today` | What became of them, and who they are now (`descendants`, `modern_legacy`). |
| `archaeology` | Extra-biblical evidence: inscriptions, sites, where objects are held. |
| `related_peoples`, `stories` | Links to other people ids and to story ids in `tools/stories/content`. |
| `sources` | Bibliography: `type` is scripture, primary, dictionary, scholarship, archaeology, genetics, demography, atlas, tradition, news or reference. |
