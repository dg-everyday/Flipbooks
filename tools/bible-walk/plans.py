# -*- coding: utf-8 -*-
"""The plans of The Living Voice (files and paths keep its working name, Bible Walk),
in the order the page shows them.

Each plan lists its episodes by id (docs/bible-walk/where-to-start.md). A chapter is
recorded once and used by every plan that walks through it. An episode with no script
or no recording yet shows in its plan as coming soon.

cover: {"symbol": "<Book>"} uses the book's symbol already on R2
       (images/symbols/<Book>-symbol.svg); {"image": "media:..."} a picture of its own.
"""

PLANS = [
    {
        "id": "first-steps",
        "title": "First Steps",
        "subtitle": "Meet Jesus in the book of Mark",
        "about": "Start here. How to walk through a chapter, then the shortest and fastest "
                 "Gospel, one chapter at a time.",
        "cover": {"symbol": "Mark"},
        "episodes": ["walk-00", "mark-00"] + [f"mark-{n:02d}" for n in range(1, 17)],
    },
    {
        "id": "big-picture",
        "title": "The Big Picture",
        "subtitle": "The whole Bible in 30 chapters",
        "about": "From the first chapter of Genesis to the last chapters of Revelation: the "
                 "one story every book belongs to.",
        "cover": {"image": "media:images/bible-walk/big-picture-cover.webp"},
        # Its own telling of each chapter (bp-…): where it stands in the whole
        # story, and what comes next in this plan. In the story's order.
        "episodes": ["big-picture-00"] + [f"bp-{c}" for c in [
            "genesis-01", "genesis-03", "genesis-06", "genesis-12", "genesis-22", "genesis-45",
            "exodus-03", "exodus-14", "exodus-20", "deuteronomy-06", "joshua-06", "ruth-01",
            "1samuel-17", "2samuel-07", "psalms-23", "proverbs-03", "1kings-18", "isaiah-53",
            "2kings-25", "jeremiah-31", "daniel-06", "nehemiah-02", "luke-02", "matthew-05",
            "luke-15", "john-11", "mark-15", "luke-24", "acts-02", "revelation-21",
        ]],
    },
    {
        "id": "luke",
        "title": "Luke",
        "subtitle": "Good Tidings of Great Joy",
        "about": "The whole Gospel of Luke, chapter by chapter: an orderly account of Jesus, "
                 "from the angel’s good tidings to the road to Emmaus.",
        "cover": {"symbol": "Luke"},
        "episodes": [f"luke-{n:02d}" for n in range(0, 25)],
    },
    {
        "id": "acts",
        "title": "Acts",
        "subtitle": "Ye Shall Be Witnesses unto Me",
        "about": "The Acts of the Apostles, chapter by chapter: Luke’s second book, from the "
                 "coming of the Holy Ghost in Jerusalem to Paul preaching in Rome.",
        "cover": {"symbol": "Acts"},
        "episodes": [f"acts-{n:02d}" for n in range(0, 29)],
    },
    {
        "id": "genesis",
        "title": "Genesis",
        "subtitle": "In the Beginning",
        "about": "The book of beginnings, chapter by chapter: creation, the fall and the flood, "
                 "and God’s promise carried through Abraham, Isaac, Jacob and Joseph.",
        "cover": {"symbol": "Genesis"},
        "episodes": [f"genesis-{n:02d}" for n in range(0, 51)],
    },
    {
        "id": "exodus",
        "title": "Exodus",
        "subtitle": "Let My People Go",
        "about": "The great rescue, chapter by chapter: Moses and the burning bush, the plagues "
                 "and the Passover, the Red Sea, and the commandments at Mount Sinai. Chapters 1 to 20.",
        "cover": {"symbol": "Exodus"},
        "episodes": [f"exodus-{n:02d}" for n in range(0, 21)],
    },
    {
        "id": "john",
        "title": "John",
        "subtitle": "That Ye Might Believe",
        "about": "The Gospel of John, chapter by chapter: the Word made flesh, seven signs, "
                 "the great I AM sayings, the cross, and the empty tomb.",
        "cover": {"symbol": "John"},
        "episodes": [f"john-{n:02d}" for n in range(0, 22)],
    },
    # The short wins: whole stories finished in a week or less, one album each.
    {
        "id": "ruth",
        "title": "Ruth",
        "subtitle": "Whither Thou Goest",
        "about": "A whole book in four chapters: Naomi’s loss, Ruth’s loyalty, the kindness of "
                 "Boaz, and a redeemer in Bethlehem. A short win, finished in a week.",
        "cover": {"symbol": "Ruth"},
        "episodes": [f"ruth-{n:02d}" for n in range(0, 5)],
    },
    {
        "id": "jonah",
        "title": "Jonah",
        "subtitle": "Salvation Is of the LORD",
        "about": "A whole book in four chapters: the prophet who ran from God, the storm and "
                 "the great fish, a city that turned back, and the God who is slow to anger.",
        "cover": {"symbol": "Jonah"},
        "episodes": [f"jonah-{n:02d}" for n in range(0, 5)],
    },
    {
        "id": "esther",
        "title": "Esther",
        "subtitle": "For Such a Time as This",
        "about": "A whole book in ten chapters: an orphan who becomes queen, a plot to destroy "
                 "her people, and a God who is never named, yet is at work in every turn.",
        "cover": {"symbol": "Esther"},
        "episodes": [f"esther-{n:02d}" for n in range(0, 11)],
    },
    {
        "id": "daniel",
        "title": "Daniel",
        "subtitle": "Our God Whom We Serve Is Able",
        "about": "The stories of Daniel, chapters 1 to 6: faithful young men in Babylon, a "
                 "king’s dream, the fiery furnace, the writing on the wall, and the lions’ den.",
        "cover": {"symbol": "Daniel"},
        "episodes": [f"daniel-{n:02d}" for n in range(0, 7)],
    },
    {
        "id": "joshua",
        "title": "Joshua",
        "subtitle": "Be Strong and of a Good Courage",
        "about": "Israel crosses the Jordan into the land God promised: Rahab and the scarlet "
                 "line, the walls of Jericho, the sun standing still, the land shared out by "
                 "lot, and Joshua’s last call to choose whom we will serve.",
        "cover": {"symbol": "Joshua"},
        "episodes": [f"joshua-{n:02d}" for n in range(0, 25)],
    },
    {
        "id": "judges",
        "title": "Judges",
        "subtitle": "The LORD Raised Up Judges",
        "about": "Israel forgets God again and again, and again and again he raises up a deliverer: "
                 "Deborah, Gideon, Samson and more. An honest book about a dark time, told gently, "
                 "that leaves us longing for a true King.",
        "cover": {"symbol": "Judges"},
        "episodes": [f"judges-{n:02d}" for n in range(0, 22)],
    },
    {
        "id": "1samuel",
        "title": "1 Samuel",
        "subtitle": "The LORD Looketh on the Heart",
        "about": "Hannah’s prayer, the boy Samuel who heard God’s voice, a nation that asked for a "
                 "king, Saul’s rise and fall, and a shepherd boy named David, chosen by God and "
                 "tested on the run.",
        "cover": {"symbol": "1 Samuel"},
        "episodes": [f"1samuel-{n:02d}" for n in range(0, 32)],
    },
    {
        "id": "2samuel",
        "title": "2 Samuel",
        "subtitle": "A Man After God’s Own Heart",
        "about": "David becomes king, brings the ark to Jerusalem and receives God’s promise of a "
                 "throne for ever. Then comes his great sin, his true repentance, and the sorrows "
                 "that follow in his family, and God’s mercy through it all.",
        "cover": {"symbol": "2 Samuel"},
        "episodes": [f"2samuel-{n:02d}" for n in range(0, 25)],
    },
]

# Pictures for episodes that are not a chapter of a book (an intro to the walk or a plan).
EPISODE_ART = {
    "walk-00": "media:images/bible-walk/walk-00-cover.webp",
    "big-picture-00": "media:images/bible-walk/big-picture-cover.webp",
}

# Labels for episodes that are not a chapter of a book.
EPISODE_LABELS = {
    "walk-00": "Start here",
    "big-picture-00": "The Big Picture",
}
