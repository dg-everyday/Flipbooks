"""The ten groups the 66 books are shown in, in canonical order."""

GROUPS = [
    {
        "id": "law",
        "name": "The Law or the Pentateuch",
        "testament": "Old",
        "description": (
            "About creation and the history of mankind before and after the flood; the origin "
            "of the nations and of Israel; and the Law and covenant God gave them. Jews call "
            "these five books the Torah ('instruction'); tradition names Moses as their author."),
        "key_chapters": [
            {"reference": "Genesis 1", "note": "Creation"},
            {"reference": "Genesis 12", "note": "The call of Abram"},
            {"reference": "Exodus 14", "note": "Through the Red Sea"},
            {"reference": "Exodus 20", "note": "The Ten Commandments"},
            {"reference": "Deuteronomy 6", "note": "Hear, O Israel"},
        ],
    },
    {
        "id": "history",
        "name": "History Books",
        "testament": "Old",
        "description": (
            "Basically, Israel's history — from entering Canaan under Joshua, through the judges "
            "and the kings, the division and fall of the kingdom, to the exile in Babylon and the "
            "return to rebuild Jerusalem."),
        "key_chapters": [
            {"reference": "Joshua 6", "note": "The walls of Jericho fall"},
            {"reference": "1 Kings 12", "note": "The kingdom divides"},
            {"reference": "Ezra 1", "note": "Cyrus lets the exiles return"},
            {"reference": "Nehemiah 2", "note": "Nehemiah goes to rebuild the walls"},
        ],
    },
    {
        "id": "poetry",
        "name": "Poetry and Wisdom",
        "testament": "Old",
        "description": (
            "The songs, prayers and wisdom of Israel: how to worship, how to suffer, how to live "
            "wisely, and how to love. Written mostly in Hebrew poetry, which rhymes ideas rather "
            "than sounds — each line echoes or answers the one before."),
        "key_chapters": [
            {"reference": "Job 38", "note": "God answers Job"},
            {"reference": "Psalms 23", "note": "The LORD is my shepherd"},
            {"reference": "Proverbs 3", "note": "Trust in the LORD"},
            {"reference": "Ecclesiastes 12", "note": "Remember thy Creator"},
        ],
    },
    {
        "id": "major-prophets",
        "name": "Major Prophets",
        "testament": "Old",
        "description": (
            "Called 'major' for their length, not their importance. Isaiah, Jeremiah and Ezekiel "
            "warned Judah before and during its fall to Babylon; Lamentations mourns Jerusalem; "
            "Daniel was faithful in exile. Together they promise a new covenant and a coming King."),
        "key_chapters": [
            {"reference": "Isaiah 53", "note": "The suffering servant"},
            {"reference": "Jeremiah 31", "note": "The new covenant"},
            {"reference": "Ezekiel 37", "note": "The valley of dry bones"},
            {"reference": "Daniel 3", "note": "The fiery furnace"},
        ],
    },
    {
        "id": "minor-prophets",
        "name": "Minor Prophets",
        "testament": "Old",
        "description": (
            "Twelve shorter prophetic books, kept on a single scroll in the Hebrew Bible and called "
            "'The Twelve'. They span about 350 years, from Assyria's rise to the rebuilt Temple, "
            "calling Israel to justice, mercy and faithfulness."),
        "key_chapters": [
            {"reference": "Jonah 3", "note": "Nineveh repents"},
            {"reference": "Micah 6", "note": "What doth the LORD require"},
            {"reference": "Habakkuk 3", "note": "Yet I will rejoice"},
            {"reference": "Malachi 3", "note": "My messenger"},
        ],
    },
    {
        "id": "gospels",
        "name": "The Gospels",
        "testament": "New",
        "description": (
            "Four accounts of the life, death and resurrection of Jesus Christ. Matthew, Mark and "
            "Luke (the 'Synoptic' Gospels) share much of their material; John tells the story in "
            "his own way, 'that ye might believe that Jesus is the Christ, the Son of God'."),
        "key_chapters": [
            {"reference": "Matthew 5", "note": "The Sermon on the Mount begins"},
            {"reference": "Luke 15", "note": "The lost sheep, coin and son"},
            {"reference": "John 3", "note": "Ye must be born again"},
            {"reference": "John 20", "note": "The empty tomb"},
        ],
    },
    {
        "id": "church-history",
        "name": "Church History",
        "testament": "New",
        "description": (
            "The Acts of the Apostles: how the gospel spread from Jerusalem to Rome in about thirty "
            "years, through Peter, Stephen, Philip and above all Paul."),
        "key_chapters": [
            {"reference": "Acts 2", "note": "Pentecost"},
            {"reference": "Acts 9", "note": "Saul's conversion"},
        ],
    },
    {
        "id": "pauline-epistles",
        "name": "Paul's Letters",
        "testament": "New",
        "description": (
            "Thirteen letters by the apostle Paul to churches and to fellow workers, explaining the "
            "gospel of grace and how to live it. They are arranged by length, longest first, not in "
            "the order they were written."),
        "key_chapters": [
            {"reference": "Romans 8", "note": "No condemnation"},
            {"reference": "1 Corinthians 13", "note": "The love chapter"},
            {"reference": "Ephesians 2", "note": "Saved by grace"},
            {"reference": "Philippians 2", "note": "The mind of Christ"},
        ],
    },
    {
        "id": "general-epistles",
        "name": "General Letters",
        "testament": "New",
        "description": (
            "Eight letters written to the wider church rather than to one congregation — by James, "
            "Peter, John, Jude and the unnamed author of Hebrews — urging faith that endures and "
            "shows itself in love."),
        "key_chapters": [
            {"reference": "Hebrews 11", "note": "The hall of faith"},
            {"reference": "James 2", "note": "Faith and works"},
            {"reference": "1 John 4", "note": "God is love"},
        ],
    },
    {
        "id": "prophecy",
        "name": "Prophecy",
        "testament": "New",
        "description": (
            "The Revelation of Jesus Christ given to John: letters to seven churches and visions of "
            "the throne of God, the Lamb, the defeat of evil and the new heaven and new earth."),
        "key_chapters": [
            {"reference": "Revelation 1", "note": "The risen Christ"},
            {"reference": "Revelation 21", "note": "All things new"},
        ],
    },
]
