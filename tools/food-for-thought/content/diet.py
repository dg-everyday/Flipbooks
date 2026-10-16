"""Food for Thought, section 1: The daily diet.

Fields (see tools/food-for-thought/README.md):
  name      the topic, in KJV words where it can be
  areas     Mind, Body and/or Spirit
  food      the key verse(s); the build adds the exact KJV text
  read      the passage(s) to read
  guards    what it guards against
  feeds     how it feeds you, in plain words; 'single quotes' are KJV, checked
  serving   one small practice for today, in our own words (no single quotes)
  hunger    signs the soul is underfed here, in our own words
  chew      a question to reflect on
  see_also  [(page, id)]: related entries in other guides
"""

SECTION = "The daily diet"

DIET = [
    {
        "name": "Not by bread alone",
        "areas": ["Spirit"],
        "food": ["Matthew 4:4"],
        "read": ["Matthew 4:1-4", "Deuteronomy 8:3"],
        "guards": "Spiritual starvation; living on the world's bread only",
        "feeds": (
            "Jesus was hungry after forty days without food, yet he answered the tempter with Scripture: man lives "
            "'by every word that proceedeth out of the mouth of God.' The body needs bread; the soul needs God's word "
            "just as surely, and every day."),
        "serving": "Before your first meal today, read one verse and carry it with you until the next meal.",
        "hunger": [
            "Days pass without opening the Bible, and it is not missed.",
            "The news, the feed or the shows get your first and last thoughts.",
            "You feel busy and full, yet empty inside.",
        ],
        "chew": "If your soul ate only what it ate this week, would it be strong or starving?",
        "see_also": [("following-gods-blueprint", "daily-bread-daily-prayer"),
                     ("guidance-for-life", "reading-the-bible")],
    },
    {
        "name": "Desire the sincere milk of the word",
        "areas": ["Spirit"],
        "food": ["1 Peter 2:2"],
        "read": ["1 Peter 2:1-3"],
        "guards": "Malice, guile, hypocrisies, envy, evil speaking",
        "feeds": (
            "A newborn does not need to be taught to want milk. Peter says we are to want the word in the same way, "
            "'that ye may grow thereby.' The verse before lists what must be laid aside to make room for it: "
            "'all malice, and all guile, and hypocrisies, and envies, and all evil speakings.'"),
        "serving": "Name one thing from Peter's list you will lay aside today, and replace it with a verse you can recall.",
        "hunger": [
            "The Bible feels like duty, never like appetite.",
            "Sharp words and envy come easily.",
            "You have not grown in years, and have stopped expecting to.",
        ],
        "chew": "What would it take for you to want God's word the way a hungry baby wants milk?",
        "see_also": [("guidance-for-life", "reading-the-bible")],
    },
    {
        "name": "From milk to strong meat",
        "areas": ["Spirit", "Mind"],
        "food": ["Hebrews 5:14"],
        "read": ["Hebrews 5:12-14"],
        "guards": "Staying immature; not knowing good from evil",
        "feeds": (
            "Milk is right for a beginner, but a believer is meant to grow. 'Strong meat belongeth to them that are of "
            "full age', to those whose senses are 'exercised to discern both good and evil.' The way to grow is use: "
            "reading, thinking and obeying, until telling right from wrong becomes second nature."),
        "serving": "Read a whole chapter today instead of a single verse, and write down one thing it asks of you.",
        "hunger": [
            "You still need someone else to tell you what the Bible says.",
            "Hard passages are skipped rather than wrestled with.",
            "Right and wrong feel blurry in everyday choices.",
        ],
        "chew": "Is there a part of the Bible you avoid because it is too hard to chew?",
        "see_also": [("following-gods-blueprint", "search-the-scriptures-daily")],
    },
    {
        "name": "Hidden in the heart",
        "areas": ["Spirit"],
        "food": ["Psalms 119:11"],
        "read": ["Psalms 119:9-11"],
        "guards": "Sinning against God unawares",
        "feeds": (
            "'Wherewithal shall a young man cleanse his way? by taking heed thereto according to thy word.' The psalmist "
            "did more than read the word; he stored it: 'Thy word have I hid in mine heart, that I might not sin against "
            "thee.' A verse learned by heart is there when temptation comes and no Bible is at hand."),
        "serving": "Learn one verse by heart today: say it aloud three times, morning, noon and night.",
        "hunger": [
            "You cannot recall a single verse when you need one.",
            "The same sins catch you off guard again and again.",
            "God's word feels far away the moment the Bible is closed.",
        ],
        "chew": "Which verse would you most want ready the next time you are tempted?",
        "see_also": [("poems-songs-and-wisdom", "thy-word-is-a-lamp")],
    },
    {
        "name": "Meditate day and night",
        "areas": ["Mind", "Spirit"],
        "food": ["Psalms 1:2"],
        "read": ["Psalms 1:1-3", "Joshua 1:8"],
        "guards": "Walking in the counsel of the ungodly",
        "feeds": (
            "The blessed man does not drift into 'the counsel of the ungodly'; his 'delight is in the law of the LORD; "
            "and in his law doth he meditate day and night.' To meditate is to turn a word over and over, as a cow "
            "chews its cud. Such a person grows 'like a tree planted by the rivers of water'."),
        "serving": "Choose one short verse this morning and come back to it at midday and again before you sleep.",
        "hunger": [
            "Your thoughts run to worry or gossip whenever they are free.",
            "Advice from people who do not know God shapes your choices.",
            "Scripture is read but never thought about again.",
        ],
        "chew": "Whose counsel do you hear most in a week, and is it rooted by the rivers of water?",
        "see_also": [("poems-songs-and-wisdom", "the-two-ways")],
    },
    {
        "name": "My meat is to do his will",
        "areas": ["Spirit"],
        "food": ["John 4:34"],
        "read": ["John 4:31-34"],
        "guards": "Self-will; living only for self",
        "feeds": (
            "His disciples brought Jesus food, but he said, 'My meat is to do the will of him that sent me, and to "
            "finish his work.' Doing what God asks is itself nourishing. A life spent only on our own wants leaves us "
            "hungry; a life given to God's will fills."),
        "serving": "Do one thing today that you know God wants done, and that no one will thank you for.",
        "hunger": [
            "Your plans are made without asking what God wants.",
            "Serving others feels like losing, not gaining.",
            "Unfinished good works pile up while personal wants come first.",
        ],
        "chew": "What work has God given you that you have left unfinished?",
        "see_also": [("commandments-of-god", "deny-yourself-and-follow-me")],
    },
    {
        "name": "Hunger and thirst after righteousness",
        "areas": ["Spirit"],
        "food": ["Matthew 5:6"],
        "read": ["Matthew 5:1-6"],
        "guards": "Spiritual complacency",
        "feeds": (
            "Jesus blesses not those who are already full but those who 'hunger and thirst after righteousness: for "
            "they shall be filled.' Hunger is a good sign; it means the soul is alive. The danger is to feel satisfied "
            "with ourselves and stop wanting more of God."),
        "serving": "Pray in your own words for one area of your life where you want to be more right with God.",
        "hunger": [
            "You feel you are good enough already.",
            "Prayers are about comfort, never about change.",
            "Wrong in your own life no longer troubles you.",
        ],
        "chew": "What do you hunger for most, and does righteousness make the list?",
        "see_also": [("poems-songs-and-wisdom", "the-beatitudes")],
    },
    {
        "name": "He satisfieth the longing soul",
        "areas": ["Spirit"],
        "food": ["Psalms 107:9"],
        "read": ["Psalms 107:4-9"],
        "guards": "Empty cravings that nothing fills",
        "feeds": (
            "The psalm tells of people lost in the wilderness, 'Hungry and thirsty, their soul fainted in them.' They "
            "cried to the LORD, and he led them home, 'For he satisfieth the longing soul, and filleth the hungry soul "
            "with goodness.' The ache we try to fill with things is meant to bring us to him."),
        "serving": "When a craving comes today, pause and tell God what you are really longing for.",
        "hunger": [
            "You keep buying, scrolling or snacking to fill a gap.",
            "Nothing satisfies for long.",
            "You rarely bring your longings to God in prayer.",
        ],
        "chew": "What longing have you been trying to fill without God?",
        "see_also": [("guidance-for-life", "contentment")],
    },
    {
        "name": "How sweet are thy words unto my taste",
        "areas": ["Spirit", "Mind"],
        "food": ["Psalms 119:103"],
        "read": ["Psalms 119:97-104"],
        "guards": "A taste for lesser things; every false way",
        "feeds": (
            "'How sweet are thy words unto my taste! yea, sweeter than honey to my mouth!' Taste grows with what we "
            "eat. The psalmist adds, 'Through thy precepts I get understanding: therefore I hate every false way.' The "
            "more we enjoy God's word, the less false ways appeal."),
        "serving": "Read Psalm 119:97-104 slowly and underline the line that tastes sweetest to you.",
        "hunger": [
            "Reading the Bible feels dry and tasteless.",
            "Lesser things, like gossip or empty entertainment, taste better.",
            "You read only to finish, never to enjoy.",
        ],
        "chew": "When did a verse last taste sweet to you, and what made it so?",
        "see_also": [("poems-songs-and-wisdom", "thy-word-is-a-lamp")],
    },
    {
        "name": "The meat which endureth",
        "areas": ["Spirit"],
        "food": ["John 6:27"],
        "read": ["John 6:26-35"],
        "guards": "Living for what perishes",
        "feeds": (
            "The crowd followed Jesus for loaves. He told them, 'Labour not for the meat which perisheth, but for that "
            "meat which endureth unto everlasting life'. Then he said, 'I am the bread of life'. Work and food matter, "
            "but they spoil; only what we have in him lasts."),
        "serving": "Give some of today's effort to something that will last: a prayer, a kind word, a verse shared.",
        "hunger": [
            "All your energy goes to things that will not last.",
            "Thoughts of eternity seldom cross your mind.",
            "You come to Jesus only for what he can give today.",
        ],
        "chew": "How much of this week's labour was for meat that perishes?",
        "see_also": [("commandments-of-god", "seek-first-the-kingdom-of-god")],
    },
]
