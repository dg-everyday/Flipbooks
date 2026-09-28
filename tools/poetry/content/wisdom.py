"""Wisdom: Proverbs for every day, Job and Ecclesiastes on the hard questions,
and the wisdom of Jesus and the apostles.

Same fields as history.py. by_label is "Written by" or "Spoken by". `lesson` is
shown on the page as "For your daily life".

Proverbs names Solomon and others (Agur, King Lemuel); Ecclesiastes names
"the Preacher", long identified with Solomon; the writer of Job is not named.
The entries say only what the books themselves say.

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

SOLOMON = [{"name": "Solomon and the wise men of Israel"}]
PREACHER = [{"name": "The Preacher (Ecclesiastes)"}]
JOB = [{"name": "Job", "hero": "job"}]
JESUS = [{"name": "Jesus"}]
PAUL = [{"name": "Paul", "hero": "paul"}]
JAMES = [{"name": "James, the brother of Jesus"}]

WISDOM = [
    # ------------------------------------------------------------------ proverbs for every day
    {
        "name": "The beginning of wisdom",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "The fear of the LORD",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "The motto of the whole book of Proverbs",
        "where": "Proverbs 1 and 9",
        "told_in": "Proverbs 1:1-7",
        "also_in": ["Proverbs 9:10", "Job 28:28", "Psalms 111:10"],
        "words": ["Proverbs 1:7", "Proverbs 9:10"],
        "summary": "Proverbs opens with its key: real knowledge and wisdom begin with the fear of the LORD, a humble reverence for God.",
        "story": (
            "Proverbs was written to give 'subtilty to the simple, to the young man knowledge and "
            "discretion' (Proverbs 1:4). Before any advice about money, words or friends, it lays "
            "the foundation: 'The fear of the LORD is the beginning of knowledge: but fools "
            "despise wisdom and instruction.' The same line returns in chapter 9, and in Job and "
            "the Psalms."),
        "meaning": (
            "“The fear of the LORD” is not terror but awe: taking God seriously, trusting him, "
            "and living as someone who will answer to him. Wisdom in the Bible is not cleverness; "
            "it is skill in living well under God. Without that starting point, even brilliant "
            "people build on sand."),
        "lesson": (
            "Start the day by acknowledging God before you make plans. Ask for his wisdom in the "
            "decisions ahead: 'If any of you lack wisdom, let him ask of God' (James 1:5)."),
        "key_verses": ["Proverbs 4:7", "James 1:5"],
    },
    {
        "name": "Go to the ant",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Consider her ways, and be wise",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "A word to the lazy",
        "where": "Proverbs 6",
        "told_in": "Proverbs 6:6-11",
        "also_in": ["Proverbs 10:4-5", "Proverbs 24:30-34", "Colossians 3:23"],
        "words": ["Proverbs 6:6-11"],
        "summary": "The tiny ant, with no boss to make her work, gathers food in summer. The sluggard, with 'a little sleep, a little slumber', drifts into poverty.",
        "story": (
            "Proverbs sends the lazy person to school with an insect: 'Go to the ant, thou "
            "sluggard; consider her ways, and be wise'. The ant has 'no guide, overseer, or "
            "ruler', yet she works ahead of need. The sluggard only asks for a little more rest, "
            "and poverty arrives 'as one that travelleth', suddenly and uninvited."),
        "meaning": (
            "The Bible honours work as part of how God made us. Laziness rarely looks like a big "
            "decision; it is a string of small delays. Diligence, planning ahead and working "
            "without being watched are signs of wisdom."),
        "lesson": (
            "Pick the task you keep putting off and do the first part of it today, without waiting "
            "to be asked. Work 'heartily, as to the Lord' (Colossians 3:23), even when no one is "
            "watching."),
        "key_verses": ["Proverbs 10:4", "Colossians 3:23"],
    },
    {
        "name": "A soft answer",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "A soft answer turneth away wrath",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on the power of words",
        "where": "Proverbs 15 and 12",
        "told_in": "Proverbs 15:1-4",
        "also_in": ["Proverbs 12:18", "Proverbs 18:21", "James 3:5-10"],
        "words": ["Proverbs 15:1-4", "Proverbs 12:18"],
        "summary": "Words can calm a fight or start one, heal or wound. Proverbs teaches that a gentle answer turns away anger.",
        "story": (
            "Proverbs returns again and again to the tongue. 'A soft answer turneth away wrath: but "
            "grievous words stir up anger.' Some speak 'like the piercings of a sword: but the "
            "tongue of the wise is health.' A gentle tongue is called 'a tree of life'. Later, "
            "James says the tongue is small, like a ship's rudder, but steers everything (James "
            "3:4-5)."),
        "meaning": (
            "A soft answer is not weakness or giving in; it is strength under control. Most "
            "arguments are made worse by the second harsh word, not the first. The wise choose "
            "words that heal."),
        "lesson": (
            "The next time someone speaks to you in anger, lower your voice instead of raising it, "
            "and answer the need behind their words, not just the words."),
        "key_verses": ["Proverbs 18:21", "Ephesians 4:29"],
    },
    {
        "name": "Pride goeth before destruction",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "An haughty spirit before a fall",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on pride and humility",
        "where": "Proverbs 16",
        "told_in": "Proverbs 16:18-19",
        "also_in": ["Proverbs 11:2", "James 4:6", "1 Peter 5:5-6"],
        "words": ["Proverbs 16:18-19"],
        "summary": "The saying everyone knows, even if they do not know it is in the Bible: pride sets us up for a fall; humility is the safer road.",
        "story": (
            "'Pride goeth before destruction, and an haughty spirit before a fall.' It has become "
            "a household proverb, often shortened to “pride comes before a fall”. The next verse "
            "adds, 'Better it is to be of an humble spirit with the lowly, than to divide the "
            "spoil with the proud.' The Bible is full of examples, from Pharaoh to Nebuchadnezzar, "
            "who was humbled until he knew 'that the most High ruleth' (Daniel 4:25)."),
        "meaning": (
            "Pride blinds us to our own faults and to the warnings of others. Humility is not "
            "thinking badly of yourself; it is seeing yourself truly, before God. 'God resisteth "
            "the proud, but giveth grace unto the humble' (James 4:6)."),
        "lesson": (
            "Ask someone you trust where you might be blind, and listen without defending yourself. "
            "Say “I was wrong” once this week when it is true."),
        "key_verses": ["James 4:6", "Proverbs 11:2"],
    },
    {
        "name": "A friend loveth at all times",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Iron sharpeneth iron",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on friendship",
        "where": "Proverbs 17, 18 and 27",
        "told_in": "Proverbs 17:17",
        "also_in": ["Proverbs 18:24", "Proverbs 27:6", "Proverbs 27:17", "John 15:13-15"],
        "words": ["Proverbs 17:17", "Proverbs 18:24", "Proverbs 27:6", "Proverbs 27:17"],
        "summary": "Proverbs describes the friend worth having: loyal in hard times, honest enough to wound, and one who makes us better, as iron sharpens iron.",
        "story": (
            "Scattered through Proverbs are short sayings about friends. 'A friend loveth at all "
            "times, and a brother is born for adversity.' 'Faithful are the wounds of a friend; "
            "but the kisses of an enemy are deceitful.' 'Iron sharpeneth iron; so a man sharpeneth "
            "the countenance of his friend.' And there is 'a friend that sticketh closer than a "
            "brother'. David and Jonathan lived it (1 Samuel 18:1-3)."),
        "meaning": (
            "True friendship is loyal, honest and shaping. Friends are not only for comfort; they "
            "tell us the truth and help us grow. Jesus called his disciples friends, and showed "
            "the greatest love of all by laying down his life for them (John 15:13-15)."),
        "lesson": (
            "Reach out to a friend who is going through a hard time, and be the friend who shows up. "
            "Thank the friend who once told you a hard truth."),
        "key_verses": ["John 15:13", "Proverbs 13:20"],
    },
    {
        "name": "The LORD directeth his steps",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Commit thy works unto the LORD",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on plans and God's guidance",
        "where": "Proverbs 16 and 19",
        "told_in": "Proverbs 16:1-9",
        "also_in": ["Proverbs 19:21", "James 4:13-15", "Proverbs 3:5-6"],
        "words": ["Proverbs 16:3", "Proverbs 16:9", "Proverbs 19:21"],
        "summary": "Make your plans, but hold them in open hands: we plan our way, but the LORD directs our steps and his purpose stands.",
        "story": (
            "Proverbs does not tell us not to plan; it tells us who has the last word. 'A man's "
            "heart deviseth his way: but the LORD directeth his steps.' 'There are many devices in "
            "a man's heart; nevertheless the counsel of the LORD, that shall stand.' So: 'Commit "
            "thy works unto the LORD, and thy thoughts shall be established.'"),
        "meaning": (
            "Planning is wise; presuming is not. James warns against saying what we will do "
            "tomorrow without adding, 'If the Lord will' (James 4:15). There is freedom in this: we "
            "do our part and trust God with the outcome."),
        "lesson": (
            "Write down your plans for this week and pray over each one. When a plan falls "
            "through, ask what God might be directing instead, rather than only what went wrong."),
        "key_verses": ["James 4:15", "Proverbs 3:6"],
    },
    {
        "name": "A merry heart",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "A merry heart doeth good like a medicine",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on joy and the heart",
        "where": "Proverbs 15 and 17",
        "told_in": "Proverbs 17:22",
        "also_in": ["Proverbs 15:13", "Proverbs 12:25", "Nehemiah 8:10"],
        "words": ["Proverbs 17:22", "Proverbs 15:13"],
        "summary": "Proverbs knew long ago what doctors now say: a cheerful heart is good for body and soul, and a crushed spirit dries us up.",
        "story": (
            "'A merry heart doeth good like a medicine: but a broken spirit drieth the bones.' "
            "Another proverb says, 'A merry heart maketh a cheerful countenance'. When the people "
            "of Jerusalem wept at hearing God's law, Nehemiah told them to celebrate instead: "
            "'the joy of the LORD is your strength' (Nehemiah 8:10)."),
        "meaning": (
            "Joy is not denial of pain; it is a gift God gives and a habit we can grow. The Bible "
            "takes a heavy heart seriously, and it also offers kindness, laughter and gratitude "
            "as real medicine."),
        "lesson": (
            "Do something today that lifts your spirit and someone else's: a meal together, a walk, "
            "a good laugh, a word of thanks. If your spirit has been broken a long time, tell "
            "someone and ask for help."),
        "key_verses": ["Nehemiah 8:10", "Proverbs 12:25"],
    },
    {
        "name": "A good name",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Rather to be chosen than great riches",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on money, debt and reputation",
        "where": "Proverbs 22",
        "told_in": "Proverbs 22:1-9",
        "also_in": ["Proverbs 22:7", "Proverbs 30:8-9", "Ecclesiastes 5:10"],
        "words": ["Proverbs 22:1", "Proverbs 22:7"],
        "summary": "Proverbs puts character above wealth, and warns that debt makes the borrower a servant.",
        "story": (
            "'A good name is rather to be chosen than great riches, and loving favour rather than "
            "silver and gold.' A few verses later comes a plain warning: 'the borrower is servant "
            "to the lender.' One writer in Proverbs prays for neither poverty nor riches, 'lest I "
            "be full, and deny thee' (Proverbs 30:8-9)."),
        "meaning": (
            "Money is useful, but it makes a poor master. A reputation for honesty takes years to "
            "build and moments to lose. Debt is not always sin, but it always costs freedom."),
        "lesson": (
            "Before your next big purchase, ask whether it would put you in debt, and whether your "
            "money choices match the name you want to be known by."),
        "key_verses": ["Ecclesiastes 5:10", "Hebrews 13:5"],
    },
    {
        "name": "He that ruleth his spirit",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Slow to anger",
        "by_label": "Written by",
        "by": SOLOMON,
        "occasion": "Proverbs on self-control",
        "where": "Proverbs 16 and 25",
        "told_in": "Proverbs 16:32",
        "also_in": ["Proverbs 25:28", "Galatians 5:22-23", "James 1:19"],
        "words": ["Proverbs 16:32", "Proverbs 25:28"],
        "summary": "Self-control is a greater victory than taking a city; without it a life is like a town with its walls broken down.",
        "story": (
            "In a world that honoured warriors, Proverbs said something surprising: 'He that is "
            "slow to anger is better than the mighty; and he that ruleth his spirit than he that "
            "taketh a city.' The opposite is pictured as a city in ruins: 'He that hath no rule "
            "over his own spirit is like a city that is broken down, and without walls.'"),
        "meaning": (
            "Ancient cities without walls were open to every attack. A person without self-control "
            "is the same: anger, appetite and impulse walk straight in. Paul lists 'temperance', "
            "self-control, as part of the fruit of the Spirit (Galatians 5:23)."),
        "lesson": (
            "Choose one area where you often lose control, whether temper, spending, food or the "
            "phone, and build one small wall there today, with God's help."),
        "key_verses": ["Galatians 5:22-23", "James 1:19"],
    },
    {
        "name": "The virtuous woman",
        "group": "Proverbs for every day",
        "testament": "Old",
        "epithet": "Her price is far above rubies",
        "by_label": "Taught by",
        "by": [{"name": "The mother of King Lemuel"}],
        "occasion": "An acrostic poem that closes the book of Proverbs",
        "where": "Proverbs 31",
        "told_in": "Proverbs 31:10-31",
        "also_in": ["Ruth 3:11", "1 Peter 3:3-4"],
        "words": ["Proverbs 31:10-12", "Proverbs 31:20", "Proverbs 31:25-30"],
        "summary": "Proverbs ends with a poem in praise of a strong, wise, hard-working woman whose worth comes from her fear of the LORD.",
        "story": (
            "Proverbs 31 is the teaching of King Lemuel's mother. Its last 22 verses are an "
            "acrostic, each beginning with the next letter of the Hebrew alphabet. The woman it "
            "praises runs a household, trades, buys a field, plants a vineyard, cares for the "
            "poor, and speaks with wisdom: 'in her tongue is the law of kindness.' It ends, "
            "'Favour is deceitful, and beauty is vain: but a woman that feareth the LORD, she shall "
            "be praised.'"),
        "meaning": (
            "The poem is not a checklist no one can meet, but a portrait of wisdom lived out in "
            "real work and real love. Ruth, the only woman in the Old Testament called “a virtuous "
            "woman” (Ruth 3:11), was a poor foreign widow, so its worth is not about wealth."),
        "lesson": (
            "Honour the women around you who work, give and lead with wisdom, and tell one of them "
            "so this week. Whoever you are, value character above looks."),
        "key_verses": ["Ruth 3:11", "1 Peter 3:4"],
    },

    # ------------------------------------------------------------------ wisdom for hard questions
    {
        "name": "The LORD gave, and the LORD hath taken away",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "Blessed be the name of the LORD",
        "by_label": "Spoken by",
        "by": JOB,
        "occasion": "Job's first words after losing everything",
        "where": "The land of Uz",
        "told_in": "Job 1:13-22",
        "also_in": ["Job 2:9-10", "James 5:11"],
        "words": ["Job 1:20-22"],
        "summary": "In one day Job loses his children, his servants and his wealth, and he falls to the ground and worships.",
        "story": (
            "Job was 'perfect and upright', and wealthy (Job 1:1). One messenger after another "
            "brings disaster: raiders, fire, a great wind that kills his children. Job tears his "
            "robe, shaves his head, and falls to the ground. Then he says, 'Naked came I out of my "
            "mother's womb, and naked shall I return thither: the LORD gave, and the LORD hath "
            "taken away; blessed be the name of the LORD.'"),
        "meaning": (
            "Job does not pretend he is not grieving; he tears his clothes. But he worships in the "
            "grief. Everything we have is a gift, held on loan. Later in the book Job will cry, "
            "argue and question, and God does not condemn his honesty. James points to Job's "
            "patience and says 'the Lord is very pitiful, and of tender mercy' (James 5:11)."),
        "lesson": (
            "Hold your blessings with open hands, and thank God for them today while you have them. "
            "In loss, you may grieve and worship at the same time."),
        "key_verses": ["Job 2:10", "James 5:11"],
    },
    {
        "name": "I know that my redeemer liveth",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "In my flesh shall I see God",
        "by_label": "Spoken by",
        "by": JOB,
        "occasion": "Job's hope at the lowest point of his suffering",
        "where": "The land of Uz",
        "told_in": "Job 19:1-27",
        "also_in": ["1 Corinthians 15:20", "1 John 3:2"],
        "words": ["Job 19:25-27"],
        "summary": "Abandoned by friends and family, sick and in pain, Job reaches past his suffering to a Redeemer who lives and a day when he will see God.",
        "story": (
            "Job's friends have blamed him, his family has turned away, and his body is wasting. "
            "'Have pity upon me, have pity upon me, O ye my friends' (Job 19:21), he pleads. Then, "
            "out of the darkness: 'For I know that my redeemer liveth, and that he shall stand at "
            "the latter day upon the earth'. Handel set these words at the start of the third part "
            "of Messiah."),
        "meaning": (
            "A redeemer was a family member who stood up for someone in trouble and bought them "
            "back. Job does not know why he suffers, but he knows someone will stand for him. "
            "Christians hear Christ in these words, the Redeemer who died and lives again."),
        "lesson": (
            "When you cannot see a reason for your pain, hold on to what you can know: your "
            "Redeemer lives. Write Job 19:25 somewhere you will see it on hard days."),
        "key_verses": ["1 Corinthians 15:20", "1 John 3:2"],
    },
    {
        "name": "Where shall wisdom be found?",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "The fear of the Lord, that is wisdom",
        "by_label": "Written by",
        "by": [{"name": "The writer of Job"}],
        "occasion": "A poem on wisdom in the middle of Job's debates",
        "where": "Job 28",
        "told_in": "Job 28:1-28",
        "also_in": ["Proverbs 3:13-15", "Colossians 2:3"],
        "words": ["Job 28:12-15", "Job 28:28"],
        "summary": "People dig deep into the earth for silver and gold, but wisdom cannot be mined or bought. Only God knows the way to it.",
        "story": (
            "In the middle of the long arguments between Job and his friends comes a quiet poem. "
            "Miners tunnel into mountains and bring out gems, but 'where shall wisdom be found? "
            "and where is the place of understanding?' The sea says it is not there; gold cannot "
            "buy it. God alone knows its place, and he says, 'Behold, the fear of the Lord, that "
            "is wisdom; and to depart from evil is understanding.'"),
        "meaning": (
            "We can know how to do almost anything and still not know how to live. Wisdom is "
            "found by drawing near to God and turning from evil. Paul says that in Christ 'are hid "
            "all the treasures of wisdom and knowledge' (Colossians 2:3)."),
        "lesson": (
            "Spend as much effort seeking wisdom as you would seeking a pay rise. Ask God for it, "
            "read it in his word, and turn from one thing you know is wrong."),
        "key_verses": ["Proverbs 3:13", "Colossians 2:3"],
    },
    {
        "name": "Out of the whirlwind",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "Where wast thou when I laid the foundations of the earth?",
        "by_label": "Spoken by",
        "by": [{"name": "God, to Job"}],
        "with": JOB,
        "occasion": "God answers Job at last",
        "where": "The land of Uz",
        "told_in": "Job 38:1-42:6",
        "also_in": ["Isaiah 55:8-9", "Romans 11:33-36"],
        "words": ["Job 38:1-7", "Job 42:1-6"],
        "summary": "God does not explain Job's suffering. Instead he shows Job the wonders of creation, and Job, seeing God, is satisfied.",
        "story": (
            "After thirty-five chapters of argument, 'the LORD answered Job out of the whirlwind'. "
            "He asks question after question: 'Where wast thou when I laid the foundations of the "
            "earth?' He points to the stars, the sea, the storm, the wild goat and the war horse. "
            "Job answers, 'I have heard of thee by the hearing of the ear: but now mine eye seeth "
            "thee.' Afterwards God restores Job's fortunes and rebukes the friends who spoke "
            "wrongly of him (Job 42:7-10)."),
        "meaning": (
            "God never tells Job about the conversation in heaven in chapters 1 and 2. What Job "
            "receives is not an explanation but God himself. Some questions have no answer we "
            "could understand, but the God who runs the universe is worth trusting."),
        "lesson": (
            "Take your “why” to God honestly, as Job did. Then go outside and look at the sky, and "
            "let the size of creation remind you of the size of the one who holds you."),
        "key_verses": ["Romans 11:33", "Isaiah 55:9"],
    },
    {
        "name": "Vanity of vanities",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "All is vanity",
        "by_label": "Written by",
        "by": PREACHER,
        "occasion": "The Preacher's search for meaning under the sun",
        "where": "Ecclesiastes 1 and 2",
        "told_in": "Ecclesiastes 1:1-11",
        "also_in": ["Ecclesiastes 2:1-11", "Ecclesiastes 5:10", "Matthew 16:26"],
        "words": ["Ecclesiastes 1:2-4", "Ecclesiastes 1:9"],
        "summary": "A man who had everything tries pleasure, work, wealth and wisdom, and finds that under the sun, without God, it all slips through the fingers like breath.",
        "story": (
            "'Vanity of vanities, saith the Preacher, vanity of vanities; all is vanity.' The "
            "Hebrew word means breath or vapour, something that cannot be held. The Preacher built "
            "houses, planted vineyards, gathered silver and gold and 'whatsoever mine eyes desired "
            "I kept not from them' (Ecclesiastes 2:10), and found it was all 'vanity and vexation "
            "of spirit'."),
        "meaning": (
            "Ecclesiastes is the Bible's honest look at life “under the sun”, life as if this world "
            "were all there is. Its answer is not despair but perspective: enjoy God's good gifts, "
            "but do not expect them to fill the space only God can fill. Jesus asked, 'what is a "
            "man profited, if he shall gain the whole world, and lose his own soul?' (Matthew "
            "16:26)."),
        "lesson": (
            "Name what you are chasing hardest right now, and ask if it can bear the weight you are "
            "putting on it. Enjoy today's gifts as gifts, and give God first place."),
        "key_verses": ["Ecclesiastes 5:10", "Matthew 16:26"],
    },
    {
        "name": "A time to every purpose",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "To every thing there is a season",
        "by_label": "Written by",
        "by": PREACHER,
        "occasion": "A poem on the seasons of life",
        "where": "Ecclesiastes 3",
        "told_in": "Ecclesiastes 3:1-14",
        "also_in": ["Psalms 31:15", "Galatians 6:9"],
        "words": ["Ecclesiastes 3:1-8", "Ecclesiastes 3:11"],
        "summary": "Birth and death, weeping and laughing, silence and speech: the Preacher's poem of the seasons of life, each in God's time.",
        "story": (
            "'To every thing there is a season, and a time to every purpose under the heaven'. The "
            "poem pairs opposites: 'A time to weep, and a time to laugh; a time to mourn, and a "
            "time to dance'. It became a popular song in the 1960s, “Turn! Turn! Turn!”. After the "
            "poem the Preacher adds, 'He hath made every thing beautiful in his time: also he hath "
            "set the world in their heart'."),
        "meaning": (
            "Life moves in seasons, and we do not control their timing. That can frustrate us, or "
            "it can teach us to trust the one who does. God has set eternity in our hearts, a "
            "longing for more than the seasons can give. As David prayed, 'My times are in thy "
            "hand' (Psalms 31:15)."),
        "lesson": (
            "Ask what season you are in right now, and what it calls for: patience, grief, work, "
            "rest or celebration. Do not try to live next season's life today."),
        "key_verses": ["Psalms 31:15", "Galatians 6:9"],
    },
    {
        "name": "Two are better than one",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "A threefold cord is not quickly broken",
        "by_label": "Written by",
        "by": PREACHER,
        "occasion": "The Preacher on loneliness and companionship",
        "where": "Ecclesiastes 4",
        "told_in": "Ecclesiastes 4:7-12",
        "also_in": ["Genesis 2:18", "Hebrews 10:24-25"],
        "words": ["Ecclesiastes 4:9-12"],
        "summary": "A lonely man works endlessly for no one; the Preacher answers that two are better than one, and a threefold cord is not quickly broken.",
        "story": (
            "The Preacher sees a man with 'neither child nor brother', who never stops working and "
            "never asks who it is all for (Ecclesiastes 4:8). Then he writes, 'Two are better than "
            "one'. If one falls, the other lifts him up, 'but woe to him that is alone when he "
            "falleth'. The passage is often read at weddings, with the “threefold cord” taken as "
            "husband, wife and God."),
        "meaning": (
            "From the beginning God said, 'It is not good that the man should be alone' (Genesis "
            "2:18). We were made for companionship: in marriage, friendship, family and the "
            "church. Isolation, however busy, is a kind of poverty."),
        "lesson": (
            "Do not carry life alone. Call someone this week just to connect, and be the one who "
            "lifts up a friend who has fallen."),
        "key_verses": ["Genesis 2:18", "Hebrews 10:24-25"],
    },
    {
        "name": "Remember now thy Creator",
        "group": "Wisdom for hard questions",
        "testament": "Old",
        "epithet": "Fear God, and keep his commandments",
        "by_label": "Written by",
        "by": PREACHER,
        "occasion": "The Preacher's last word",
        "where": "Ecclesiastes 12",
        "told_in": "Ecclesiastes 12:1-14",
        "also_in": ["Ecclesiastes 9:10", "2 Corinthians 5:10"],
        "words": ["Ecclesiastes 12:1", "Ecclesiastes 12:13-14"],
        "summary": "The Preacher ends with a poem on growing old and his conclusion to the whole matter: remember God while you are young, fear him, and keep his commandments.",
        "story": (
            "The last chapter is a poem on old age, full of pictures: the grinders cease because "
            "they are few, those that look out of the windows are darkened, the silver cord is "
            "loosed. Before those days come, 'Remember now thy Creator in the days of thy youth'. "
            "Then: 'Let us hear the conclusion of the whole matter: Fear God, and keep his "
            "commandments: for this is the whole duty of man.'"),
        "meaning": (
            "After all the searching, the answer is simple. Life is short and will be judged, so "
            "the wise life is the God-centred one, begun early. It is never too late, but sooner "
            "is better."),
        "lesson": (
            "Whatever your age, give God your best years, which are the ones you have now. If you "
            "are young, start the habit of prayer and Scripture today; if older, pass it on."),
        "key_verses": ["Ecclesiastes 9:10", "2 Corinthians 5:10"],
    },

    # ------------------------------------------------------------------ wisdom of Jesus and the apostles
    {
        "name": "The Beatitudes",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Blessed are the poor in spirit",
        "by_label": "Spoken by",
        "by": JESUS,
        "occasion": "The opening of the Sermon on the Mount",
        "where": "A mountain in Galilee",
        "told_in": "Matthew 5:1-12",
        "also_in": ["Luke 6:20-23", "Psalms 37:11", "Isaiah 61:1-3"],
        "words": ["Matthew 5:3-12"],
        "summary": "Jesus turns the world's idea of happiness upside down: the blessed are the poor in spirit, the mourners, the meek, the merciful and the peacemakers.",
        "story": (
            "Seeing the crowds, Jesus went up a mountain, sat down and began to teach. Each saying "
            "begins with “Blessed”, which means happy, favoured by God. 'Blessed are the poor in "
            "spirit: for theirs is the kingdom of heaven.' 'Blessed are the meek: for they shall "
            "inherit the earth', words taken from Psalm 37:11. The Latin word for blessed, "
            "beatus, gives them their name."),
        "meaning": (
            "The Beatitudes are not rules to earn blessing but a portrait of the people God "
            "blesses. They describe Jesus himself, and the life his Spirit grows in us: humble, "
            "hungry for what is right, merciful, pure, making peace, and faithful under pressure."),
        "lesson": (
            "Choose one Beatitude to live today. Show mercy to someone who does not deserve it, or "
            "make peace in one conversation."),
        "key_verses": ["Psalms 37:11", "Luke 6:20"],
    },
    {
        "name": "Salt and light",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Ye are the light of the world",
        "by_label": "Spoken by",
        "by": JESUS,
        "occasion": "The Sermon on the Mount",
        "where": "A mountain in Galilee",
        "told_in": "Matthew 5:13-16",
        "also_in": ["Mark 9:50", "Philippians 2:15", "John 8:12"],
        "words": ["Matthew 5:13-16"],
        "summary": "Jesus tells ordinary people that they are the salt of the earth and the light of the world, and that their lives should point others to God.",
        "story": (
            "Salt kept food from rotting and gave it flavour. Light in a small house came from a "
            "single lamp on a stand. Jesus says to his listeners, fishermen and farmers, 'Ye are the "
            "salt of the earth' and 'Ye are the light of the world. A city that is set on an hill "
            "cannot be hid.' No one lights a lamp to hide it 'under a bushel'."),
        "meaning": (
            "Christians are not meant to withdraw from the world but to make a difference in it: "
            "slowing decay and bringing light. The aim is not our fame but God's: 'that they may "
            "see your good works, and glorify your Father which is in heaven.'"),
        "lesson": (
            "Look for one place today where you can bring light: an act of kindness at work, honesty "
            "where others cut corners, hope in a gloomy conversation. Let it point to God, not to "
            "you."),
        "key_verses": ["Philippians 2:15", "John 8:12"],
    },
    {
        "name": "Treasure in heaven",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Where your treasure is, there will your heart be also",
        "by_label": "Spoken by",
        "by": JESUS,
        "occasion": "The Sermon on the Mount",
        "where": "A mountain in Galilee",
        "told_in": "Matthew 6:19-24",
        "also_in": ["Luke 12:15-21", "1 Timothy 6:17-19"],
        "words": ["Matthew 6:19-21"],
        "summary": "Earthly treasure rusts, rots and gets stolen; Jesus tells us to store up treasure in heaven, because our heart follows our treasure.",
        "story": (
            "In Jesus' day wealth was often kept as fine clothes, which moths could eat, or coins "
            "hidden in walls, which thieves could dig through. 'Lay not up for yourselves "
            "treasures upon earth, where moth and rust doth corrupt'. Instead, 'lay up for "
            "yourselves treasures in heaven'. He told of a rich fool who built bigger barns and "
            "died that night (Luke 12:16-21)."),
        "meaning": (
            "Jesus is not against saving or planning; he is against letting money own our hearts. "
            "What we spend on shows what we love, and what we love shapes who we become. 'Ye "
            "cannot serve God and mammon' (Matthew 6:24)."),
        "lesson": (
            "Look at your last month's spending and ask what it says about your heart. Give "
            "something this week to God's work or to someone in need, as treasure stored in "
            "heaven."),
        "key_verses": ["Matthew 6:24", "1 Timothy 6:17"],
    },
    {
        "name": "The wise and foolish builders",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "A wise man, which built his house upon a rock",
        "by_label": "Spoken by",
        "by": JESUS,
        "occasion": "The end of the Sermon on the Mount",
        "where": "A mountain in Galilee",
        "told_in": "Matthew 7:24-29",
        "also_in": ["Luke 6:46-49", "James 1:22-25"],
        "words": ["Matthew 7:24-27"],
        "summary": "Two houses face the same storm. The one built on rock stands; the one on sand falls. The difference is whether we do what Jesus says.",
        "story": (
            "Jesus ends his great sermon with a story children still sing about. Two men build "
            "houses. The same rain falls, the same floods rise, the same winds beat on both. The "
            "house on the rock 'fell not'; the house on the sand 'fell: and great was the fall "
            "of it.' The wise man is 'whosoever heareth these sayings of mine, and doeth them'."),
        "meaning": (
            "Storms come to everyone, the wise and the foolish alike. What matters is the "
            "foundation, and the foundation is not hearing Jesus but obeying him. James says the "
            "same: 'be ye doers of the word, and not hearers only' (James 1:22)."),
        "lesson": (
            "Take one thing Jesus said that you already know is true and put it into practice "
            "today. Each act of obedience is another stone laid on the rock."),
        "key_verses": ["James 1:22", "Luke 6:46"],
    },
    {
        "name": "The wisdom that is from above",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "First pure, then peaceable, gentle",
        "by_label": "Written by",
        "by": JAMES,
        "occasion": "A letter to scattered Jewish Christians",
        "where": "James 3",
        "told_in": "James 3:13-18",
        "also_in": ["James 1:5", "Proverbs 2:6"],
        "words": ["James 3:13-18"],
        "summary": "James contrasts two kinds of wisdom: the earthly kind that breeds envy and strife, and the wisdom from above that is pure, peaceable, gentle and full of mercy.",
        "story": (
            "James, the brother of Jesus and leader of the church in Jerusalem, writes the most "
            "Proverbs-like book of the New Testament. He asks, 'Who is a wise man and endued with "
            "knowledge among you? let him shew out of a good conversation his works with meekness "
            "of wisdom.' Wisdom that comes with 'bitter envying and strife' is 'earthly, sensual, "
            "devilish'."),
        "meaning": (
            "You can tell true wisdom by its fruit, not its cleverness. 'The wisdom that is from "
            "above is first pure, then peaceable, gentle, and easy to be intreated, full of mercy "
            "and good fruits'. It is a gift: 'If any of you lack wisdom, let him ask of God' "
            "(James 1:5)."),
        "lesson": (
            "Before you give advice or win an argument today, check it against James 3:17. Is it "
            "pure, peaceable, gentle and merciful? If not, wait and pray first."),
        "key_verses": ["James 1:5", "Proverbs 2:6"],
    },
    {
        "name": "The tongue is a fire",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Behold, how great a matter a little fire kindleth!",
        "by_label": "Written by",
        "by": JAMES,
        "occasion": "James on the power of words",
        "where": "James 3",
        "told_in": "James 3:1-12",
        "also_in": ["Proverbs 18:21", "Matthew 12:36-37"],
        "words": ["James 3:2-10"],
        "summary": "A bit steers a horse, a rudder steers a ship, and a spark sets a forest ablaze: James warns that the tongue is small but mighty.",
        "story": (
            "James piles up pictures: bits in horses' mouths, a small helm turning a great ship, "
            "a little fire kindling a forest. 'And the tongue is a fire, a world of iniquity'. "
            "People can tame every kind of animal, 'But the tongue can no man tame'. With the same "
            "mouth we bless God and curse people made in his image. 'My brethren, these things "
            "ought not so to be.'"),
        "meaning": (
            "Our words reveal and direct our whole lives. Jesus said we will give account for "
            "every idle word (Matthew 12:36). No one tames the tongue alone, but God's Spirit can "
            "change the heart the words come from."),
        "lesson": (
            "Go one whole day without complaining, gossiping or cutting anyone down, and notice how "
            "often it is hard. Ask God to change your heart where your words keep slipping."),
        "key_verses": ["Proverbs 18:21", "Matthew 12:36"],
    },
    {
        "name": "Think on these things",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Whatsoever things are true",
        "by_label": "Written by",
        "by": PAUL,
        "occasion": "Paul's letter from prison to the church at Philippi",
        "where": "Philippians 4",
        "told_in": "Philippians 4:4-9",
        "also_in": ["Romans 12:2", "Colossians 3:2"],
        "words": ["Philippians 4:8-9"],
        "summary": "Paul gives a filter for the mind: think on what is true, honest, just, pure, lovely and of good report, and practise what you have learned.",
        "story": (
            "Writing from prison, Paul has just told the Philippians not to be anxious but to pray. "
            "Then he tells them what to fill their minds with: 'whatsoever things are true, "
            "whatsoever things are honest, whatsoever things are just, whatsoever things are pure, "
            "whatsoever things are lovely, whatsoever things are of good report'. And he adds a "
            "promise: 'the God of peace shall be with you.'"),
        "meaning": (
            "What we dwell on shapes how we feel and who we become. Paul does not say ignore what "
            "is wrong, but choose what you feed on. It is the same transformation he describes "
            "elsewhere: 'be ye transformed by the renewing of your mind' (Romans 12:2)."),
        "lesson": (
            "Run tonight's screen time, music and conversations through Paul's list. Swap one thing "
            "that fails it for one thing that passes."),
        "key_verses": ["Romans 12:2", "Colossians 3:2"],
    },
    {
        "name": "The foolishness of God",
        "group": "Wisdom of Jesus and the apostles",
        "testament": "New",
        "epithet": "Christ the power of God, and the wisdom of God",
        "by_label": "Written by",
        "by": PAUL,
        "occasion": "Paul writes to a church that prized clever speech",
        "where": "1 Corinthians 1",
        "told_in": "1 Corinthians 1:18-31",
        "also_in": ["Colossians 2:3", "Isaiah 29:14"],
        "words": ["1 Corinthians 1:18-25"],
        "summary": "The cross looks like foolishness to the world, but Paul says it is the wisdom and power of God, wiser and stronger than anything people can devise.",
        "story": (
            "The Corinthians admired polished speakers and rival teachers. Paul reminds them that "
            "the message of a crucified Messiah was 'unto the Jews a stumblingblock, and unto the "
            "Greeks foolishness'. Yet God chose it: 'the foolishness of God is wiser than men; and "
            "the weakness of God is stronger than men.' He also chose ordinary people, 'not many "
            "wise men after the flesh' (1 Corinthians 1:26)."),
        "meaning": (
            "Biblical wisdom has a centre: Christ crucified. God's way is not climbing up by "
            "cleverness, but grace coming down to the humble. That frees us from needing to "
            "impress anyone."),
        "lesson": (
            "Stop measuring yourself by how clever, successful or impressive you seem. Boast in "
            "what God has done: 'He that glorieth, let him glory in the Lord' (1 Corinthians "
            "1:31)."),
        "key_verses": ["1 Corinthians 1:30", "Colossians 2:3"],
    },
]
