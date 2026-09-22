# -*- coding: utf-8 -*-
"""
Derive the Similar_books column (4 comma-separated books) for a Did You Know row
by analysing its Title + Fact text.

The four books are DISTRACTORS: the row's own Book is always excluded, because the
trivia question uses Book as the correct answer and draws wrong options from here.
"""
import re, hashlib

BOOKS = [
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
    "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
    "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah",
    "Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians",
    "2 Corinthians","Galatians","Ephesians","Philippians","Colossians",
    "1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon",
    "Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation",
]
BOOKSET = set(BOOKS)

TORAH       = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy"]
HISTORY     = ["Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings",
               "1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther"]
WISDOM      = ["Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon"]
MAJOR_PROPH = ["Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel"]
MINOR_PROPH = ["Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk",
               "Zephaniah","Haggai","Zechariah","Malachi"]
GOSPELS     = ["Matthew","Mark","Luke","John"]
PAULINE     = ["Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
               "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
               "1 Timothy","2 Timothy","Titus","Philemon"]
GENERAL     = ["Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude"]

GROUP_OF = {}
for grp in (TORAH, HISTORY, WISDOM, MAJOR_PROPH, MINOR_PROPH, GOSPELS, PAULINE, GENERAL):
    for b in grp:
        GROUP_OF[b] = grp
GROUP_OF["Acts"] = ["Luke","John","Romans","1 Corinthians"]
GROUP_OF["Revelation"] = ["Daniel","Ezekiel","Zechariah","1 John"]

# Neighbouring group, used to round out the pool when a group is small.
NEIGHBOURS = {
    id(TORAH):       HISTORY + ["Psalms","Isaiah"],
    id(HISTORY):     TORAH + ["Psalms","Isaiah","Jeremiah"],
    id(WISDOM):      ["Isaiah","Jeremiah","James","Deuteronomy","1 Kings"],
    id(MAJOR_PROPH): MINOR_PROPH + ["Psalms","Deuteronomy"],
    id(MINOR_PROPH): MAJOR_PROPH + ["Psalms","Deuteronomy"],
    id(GOSPELS):     ["Acts","Romans","Hebrews","1 John","Isaiah"],
    id(PAULINE):     ["Acts","Hebrews","James","1 Peter"] + GOSPELS,
    id(GENERAL):     PAULINE[:6] + ["Acts","Revelation"],
}

# ---------------------------------------------------------------------------
# Themes: (regex over Title + Fact) -> books that plausibly carry the same theme
# ---------------------------------------------------------------------------
THEMES = [
    (r"creat(e|ed|ion|or)|heavens? and (the )?earth|garden of eden|let there be",
     ["Genesis","Psalms","John","Job","Isaiah","Colossians","Hebrews","Revelation"]),
    (r"\bflood\b|\bnoah\b|\brainbow\b",
     ["Genesis","1 Peter","2 Peter","Matthew","Hebrews"]),
    (r"\babraham\b|covenant|promised? to|circumcis",
     ["Genesis","Romans","Galatians","Hebrews","Deuteronomy","Jeremiah"]),
    (r"\bexodus\b|pharaoh|plague|red sea|passover|manna|wilderness|sinai",
     ["Exodus","Numbers","Deuteronomy","Psalms","1 Corinthians","Hebrews","Joshua"]),
    (r"\blaw\b|commandment|\btorah\b|statute|ten commandments",
     ["Exodus","Leviticus","Deuteronomy","Romans","Galatians","Matthew","Psalms"]),
    (r"sacrific|\baltar\b|priest|atone|tabernacle|blood of|holy of holies|offering",
     ["Leviticus","Hebrews","Exodus","Numbers","Romans","1 Peter","Malachi"]),
    (r"\btemple\b|ark of the covenant|solomon|dedicat",
     ["1 Kings","2 Chronicles","Ezra","Haggai","Ezekiel","John","1 Corinthians"]),
    (r"\bking\b|throne|reign|dynast|crown|royal",
     ["1 Samuel","2 Samuel","1 Kings","2 Kings","Psalms","Daniel","Revelation","Isaiah"]),
    (r"\bexile\b|babylon|captiv|deport|return(ed)? to jerusalem|rebuil",
     ["Jeremiah","Ezekiel","Daniel","Ezra","Nehemiah","Lamentations","Isaiah","2 Kings"]),
    (r"prophe(t|cy|sied|tic)|oracle|thus says the lord",
     ["Isaiah","Jeremiah","Ezekiel","Amos","Hosea","Micah","Malachi","Zechariah"]),
    (r"wisdom|foolish|proverb|fear of the lord|discipline|prudent",
     ["Proverbs","Ecclesiastes","Job","James","Psalms","1 Corinthians"]),
    (r"suffer|lament|grief|mourn|afflict|sorrow|\btrial",
     ["Job","Lamentations","Psalms","1 Peter","2 Corinthians","James","Hebrews"]),
    (r"pray(er|ed|ing)?\b|fast(ing|ed)?\b|intercess",
     ["Psalms","Luke","Acts","Daniel","James","1 Thessalonians","Nehemiah"]),
    (r"\bsing|\bsong|music|worship|praise|hymn|psalm",
     ["Psalms","1 Chronicles","Revelation","Ephesians","Colossians","2 Chronicles"]),
    (r"messiah|messianic|servant song|virgin|bethlehem|born of",
     ["Isaiah","Micah","Matthew","Luke","Psalms","Zechariah","John"]),
    (r"parable|kingdom of (heaven|god)|sermon on the mount|beatitude",
     ["Matthew","Mark","Luke","John","James"]),
    (r"crucif|\bcross\b|calvary|golgotha|pilate|crown of thorns",
     ["Matthew","Mark","Luke","John","Isaiah","Psalms","Hebrews","Philippians"]),
    (r"resurrect|risen|empty tomb|firstfruits|ascen(d|sion)",
     ["1 Corinthians","Luke","John","Acts","Matthew","Mark","Romans","1 Peter"]),
    (r"miracle|heal(ed|ing|s)?\b|cast out|demon|\bblind\b|leper|fed .*thousand",
     ["Mark","Matthew","Luke","John","Acts","2 Kings"]),
    (r"discipl(e|es|eship)\b|apostle|\bpeter\b|follow me",
     ["Matthew","Mark","Luke","John","Acts","1 Peter","Galatians"]),
    (r"mission|preach|evangel|gentile|the nations",
     ["Acts","Romans","Isaiah","Luke","Galatians","Jonah","Matthew"]),
    (r"\bchurch\b|congregation|believers (met|gathered)|fellowship|body of christ",
     ["Acts","1 Corinthians","Ephesians","Colossians","Hebrews","1 Timothy","Philippians"]),
    (r"\bgrace\b|faith alone|justif|salvation|saved by|redempt",
     ["Romans","Galatians","Ephesians","Titus","Hebrews","Acts","2 Corinthians"]),
    (r"holy spirit|pentecost|spirit came|tongues|spiritual gifts",
     ["Acts","1 Corinthians","John","Romans","Galatians","Ephesians","Joel"]),
    (r"\blove\b|kind(ness)?\b|forgiv|mercy|compassion|neighbour|neighbor",
     ["1 Corinthians","1 John","Luke","Romans","Ephesians","Colossians","Hosea","Matthew"]),
    (r"marriage|\bwife\b|husband|family|children|parent|widow",
     ["Ephesians","Genesis","Proverbs","1 Peter","1 Timothy","Ruth","1 Corinthians","Colossians"]),
    (r"money|wealth|\brich\b|\bpoor\b|generos|possession|tithe",
     ["Luke","Proverbs","James","2 Corinthians","1 Timothy","Ecclesiastes","Malachi","Acts"]),
    (r"justice|oppress|widow and orphan|\bbrib|honest weight",
     ["Amos","Micah","Isaiah","James","Proverbs","Deuteronomy","Jeremiah","Zechariah"]),
    (r"end times?|second coming|return of christ|judgment day|new heaven|day of the lord",
     ["Revelation","1 Thessalonians","2 Thessalonians","2 Peter","Daniel","Matthew","Joel","Zephaniah"]),
    (r"angel|vision|dream|apocalyp|heavenly",
     ["Daniel","Revelation","Ezekiel","Zechariah","Luke","Matthew","Acts"]),
    (r"persecut|prison|martyr|beat(en|ing)\b|stoned|arrest",
     ["Acts","1 Peter","2 Timothy","Revelation","Hebrews","Philippians","2 Corinthians"]),
    (r"scripture|scroll|manuscript|copied|read aloud|\bletter\b",
     ["2 Timothy","Nehemiah","Jeremiah","Psalms","Luke","Revelation","2 Peter","Deuteronomy"]),
    (r"repent|confess|\bsin\b|guilt|\bidol",
     ["Psalms","1 John","Romans","Jonah","Hosea","Joel","Isaiah","James"]),
    (r"shepherd|sheep|flock|pastor",
     ["Psalms","John","Ezekiel","1 Peter","Luke","Zechariah"]),
    (r"\bwar\b|battle|\barmy\b|enemy|sword|conquer|siege",
     ["Joshua","Judges","1 Samuel","2 Kings","2 Chronicles","Ephesians","Nahum","Revelation"]),
    (r"\bwork\b|labour|\blabor\b|craft|trade|\bhands\b|\brest\b|sabbath",
     ["Ecclesiastes","Genesis","Exodus","2 Thessalonians","Colossians","Proverbs","Hebrews"]),
    (r"\bwoman\b|\bwomen\b|daughter|mother|sister",
     ["Luke","Ruth","Esther","Acts","Judges","Proverbs","Romans"]),
    (r"hospitality|stranger|foreign|sojourn|refuge",
     ["Ruth","Hebrews","3 John","1 Peter","Leviticus","Deuteronomy","Acts"]),
    (r"false teach|heres|deceiv|warn(ed|ing)? against|doctrine",
     ["Jude","2 Peter","1 Timothy","Titus","Galatians","1 John","2 John","Colossians"]),
    (r"humil|humble|pride|boast|\bmeek",
     ["Philippians","James","Proverbs","1 Peter","Daniel","Obadiah","2 Corinthians"]),
    (r"\bhope\b|endur|persever|patien|wait(ing|ed)? (on|for) (the )?lord",
     ["Hebrews","Romans","James","Habakkuk","Lamentations","1 Thessalonians","Psalms"]),
]
THEMES = [(re.compile(p, re.I), bs) for p, bs in THEMES]

# People, places and objects named in the text point at the books that tell the
# same story, which makes for distractors a reader has to think about.
ENTITY_HINTS = [
    (r"\badam\b|\beve\b|\bcain\b|\babel\b|\bbabel\b",           ["Genesis","Romans","1 Corinthians","1 Timothy"]),
    (r"\babraham|\bsarah\b|\bisaac\b|\bjacob\b|\bjoseph's|\besau\b", ["Genesis","Hebrews","Romans","Galatians","James"]),
    (r"\bmoses\b|\baaron\b|\bburning bush\b",                    ["Exodus","Deuteronomy","Numbers","Leviticus","Hebrews","Acts"]),
    (r"\bjoshua\b|\bjericho\b|\brahab\b|\bcanaan\b",             ["Joshua","Judges","Numbers","Hebrews","James"]),
    (r"\bgideon\b|\bsamson\b|\bdeborah\b|\bjudges\b",            ["Judges","Joshua","1 Samuel","Hebrews","Ruth"]),
    (r"\bruth\b|\bnaomi\b|\bboaz\b|\bgleaning\b",                ["Ruth","Judges","Deuteronomy","Leviticus","Matthew"]),
    (r"\bhannah\b|\bsamuel\b|\bsaul\b|\bgoliath\b|\bjonathan\b", ["1 Samuel","2 Samuel","1 Chronicles","Psalms","Judges"]),
    (r"\bdavid\b|\bbathsheba\b|\babsalom\b",                     ["1 Samuel","2 Samuel","Psalms","1 Chronicles","1 Kings"]),
    (r"\bsolomon\b|\bqueen of sheba\b",                          ["1 Kings","Proverbs","Ecclesiastes","2 Chronicles","Song of Solomon"]),
    (r"\belijah\b|\belisha\b|\bahab\b|\bjezebel\b|\bbaal\b",     ["1 Kings","2 Kings","James","Malachi","Luke"]),
    (r"\bhezekiah\b|\bjosiah\b|\bmanasseh\b|\bassyria",          ["2 Kings","2 Chronicles","Isaiah","Nahum","Jeremiah"]),
    (r"\bnebuchadnezzar\b|\bdarius\b|\bcyrus\b|\bfiery furnace\b|\blions' den\b", ["Daniel","Ezra","Isaiah","Jeremiah","Esther"]),
    (r"\besther\b|\bmordecai\b|\bhaman\b|\bxerxes\b|\bpurim\b",  ["Esther","Nehemiah","Ezra","Daniel","Ruth"]),
    (r"\bnehemiah\b|\bezra\b|\bwall of jerusalem\b",             ["Nehemiah","Ezra","Haggai","Zechariah","Malachi"]),
    (r"\bjob\b|\bsatan (asked|came)|\bwhirlwind\b",              ["Job","Ecclesiastes","Psalms","James","Habakkuk"]),
    (r"\bjonah\b|\bnineveh\b|\bgreat fish\b",                    ["Jonah","Nahum","Matthew","Amos","Micah"]),
    (r"\bjohn the baptist\b|\bbaptiz|\bjordan river\b",          ["Matthew","Mark","Luke","John","Acts","Romans"]),
    (r"\bmary\b|\bjoseph\b|\bnazareth\b|\bmagi\b|\bherod\b",     ["Matthew","Luke","John","Micah","Isaiah"]),
    (r"\bjudas\b|\blast supper\b|\bgethsemane\b|\bcaiaphas\b",   ["Matthew","Mark","Luke","John","1 Corinthians","Acts"]),
    (r"\bpaul\b|\bsaul of tarsus\b|\bdamascus\b|\bbarnabas\b|\bsilas\b|\btimothy\b",
     ["Acts","Romans","2 Corinthians","Galatians","Philippians","1 Timothy","2 Timothy"]),
    (r"\bcorinth\b|\bephesus\b|\bphilippi\b|\bthessalonica\b|\bantioch\b|\bathens\b",
     ["Acts","1 Corinthians","Ephesians","Philippians","1 Thessalonians","2 Corinthians"]),
    (r"\brome\b|\broman\b|\bcaesar\b|\bnero\b|\bempire\b",       ["Acts","Romans","Revelation","1 Peter","Philippians","Luke"]),
    (r"\bpatmos\b|\bseven churches\b|\blamb\b|\bnew jerusalem\b",["Revelation","1 John","Daniel","Ezekiel","Zechariah"]),
]
ENTITY_HINTS = [(re.compile(p, re.I), bs) for p, bs in ENTITY_HINTS]

# Books named inside the text itself are strong, plausible distractors.
MENTION_PATTERNS = []
for _b in BOOKS:
    if _b == "Acts":
        _pat = r"book of acts|\bthe acts\b"
    elif _b == "Psalms":
        _pat = r"psalms?\b|psalter"
    elif _b == "Song of Solomon":
        _pat = r"song of solomon|song of songs"
    elif re.match(r"^[123] ", _b):
        _num, _name = _b.split(" ", 1)
        _word = {"1": "first", "2": "second", "3": "third"}[_num]
        _pat = r"\b(%s|%s)\s+%s\b" % (_num, _word, re.escape(_name))
    else:
        _pat = r"\b%s\b" % re.escape(_b)
    MENTION_PATTERNS.append((_b, re.compile(_pat, re.I)))

OT = set(BOOKS[:39])


def similar_books(title, fact, book, row_id=0, n=4):
    text = "%s. %s" % (title or "", fact or "")
    scores = {}

    def bump(b, amount):
        if b in BOOKSET and b != book:
            scores[b] = scores.get(b, 0.0) + amount

    # 1. thematic overlap drawn from the Title + Fact wording
    for rx, books in THEMES:
        if rx.search(text):
            for i, b in enumerate(books):
                bump(b, 3.0 - i * 0.12)

    # 2. the books that carry the people and places this row names
    for rx, books in ENTITY_HINTS:
        if rx.search(text):
            for i, b in enumerate(books):
                bump(b, 3.4 - i * 0.15)

    # 3. books explicitly named in the text read as natural near-misses
    for b, rx in MENTION_PATTERNS:
        if rx.search(text):
            bump(b, 2.2)

    # 4. the row's own corner of the canon, so options stay same-neighbourhood
    group = GROUP_OF.get(book, [])
    for i, b in enumerate(group):
        bump(b, 1.6 - i * 0.05)
    for b in NEIGHBOURS.get(id(group), []):
        bump(b, 0.5)

    # 5. Testament kinship keeps an OT answer from sitting beside three epistles
    same_testament = OT if book in OT else set(BOOKS[39:])
    for b in same_testament:
        bump(b, 0.35)

    # deterministic jitter so repeated books/themes do not always yield the
    # identical four options across rows
    for b in list(scores):
        h = hashlib.md5(("%s|%s" % (row_id, b)).encode()).digest()[0]
        scores[b] += h / 255.0 * 0.30

    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    picked = [b for b, _ in ranked[:n]]

    # keep at least two options from the answer's own testament, so a quiz never
    # gives itself away by putting one lone Old Testament book among epistles
    kin = [b for b in picked if (b in OT) == (book in OT)]
    if len(kin) < 2:
        spare = [b for b, _ in ranked[n:] if (b in OT) == (book in OT)]
        for b in picked[::-1]:
            if len(kin) >= 2 or not spare:
                break
            if (b in OT) != (book in OT):
                picked[picked.index(b)] = spare.pop(0)
                kin = [x for x in picked if (x in OT) == (book in OT)]

    # safety net: never return fewer than n
    if len(picked) < n:
        for b in group + BOOKS:
            if b != book and b not in picked:
                picked.append(b)
                if len(picked) == n:
                    break
    return picked[:n]


def similar_books_str(title, fact, book, row_id=0, n=4):
    return ", ".join(similar_books(title, fact, book, row_id, n))

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 4:
        print("usage: python similar_books.py "<Title>" "<Fact>" "<Book>"")
        raise SystemExit(2)
    print(similar_books_str(sys.argv[1], sys.argv[2], sys.argv[3]))
