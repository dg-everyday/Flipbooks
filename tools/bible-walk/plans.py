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
