"""Poems: the great poems of the prophets and of the New Testament.

Same fields as history.py. These are written, not sung (as far as the Bible
says), so by_label is "Written by" or "Spoken by". `lesson` is shown on the
page as "For your daily life".

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

POEMS = [
    # ------------------------------------------------------------------ poems of the prophets
    {
        "name": "They shall mount up with wings",
        "group": "Poems of the prophets",
        "testament": "Old",
        "epithet": "Comfort ye, comfort ye my people",
        "by_label": "Written by",
        "by": [{"name": "Isaiah the prophet"}],
        "occasion": "Comfort for a people in exile, worn out and far from home",
        "where": "Isaiah 40",
        "told_in": "Isaiah 40:1-31",
        "also_in": ["Matthew 3:1-3", "1 Peter 1:24-25"],
        "words": ["Isaiah 40:1-2", "Isaiah 40:28-31"],
        "summary": "A poem of comfort that begins with God speaking tenderly to his people and ends with the tired rising up on wings like eagles.",
        "story": (
            "After the warnings of the first half of Isaiah, the tone changes: 'Comfort ye, comfort "
            "ye my people, saith your God.' A voice cries in the wilderness to prepare the way of "
            "the LORD, and the Gospels hear John the Baptist in it (Matthew 3:3). People are like "
            "grass that withers, 'but the word of our God shall stand for ever.' The poem ends "
            "with a question for anyone who feels forgotten: 'Hast thou not known? hast thou not "
            "heard, that the everlasting God … fainteth not, neither is weary?'"),
        "meaning": (
            "The God who names every star gives 'power to the faint'. The promise is not that "
            "God's people will never tire, but that 'they that wait upon the LORD shall renew "
            "their strength'. Peter quotes the poem about the grass and the everlasting word "
            "(1 Peter 1:24-25)."),
        "lesson": (
            "When you are running on empty, stop and wait on the Lord before you push on. Strength "
            "comes from him, sometimes to soar, sometimes to run, and often just to keep walking."),
        "key_verses": ["Isaiah 40:8", "Isaiah 41:10"],
    },
    {
        "name": "The man of sorrows",
        "group": "Poems of the prophets",
        "testament": "Old",
        "epithet": "With his stripes we are healed",
        "by_label": "Written by",
        "by": [{"name": "Isaiah the prophet"}],
        "occasion": "The fourth song of the servant of the LORD",
        "where": "Isaiah 52:13-53:12",
        "told_in": "Isaiah 52:13-53:12",
        "also_in": ["Acts 8:26-35", "1 Peter 2:21-25", "Matthew 8:16-17"],
        "words": ["Isaiah 53:3-6"],
        "summary": "A poem of a servant who suffers in silence for the sins of others, which the apostles read as a portrait of Jesus drawn centuries before the cross.",
        "story": (
            "Isaiah describes a servant with no beauty to draw us, 'despised and rejected of men; "
            "a man of sorrows, and acquainted with grief'. He is led 'as a lamb to the slaughter' "
            "and does not open his mouth. Hundreds of years later an Ethiopian official was reading "
            "this very passage in his chariot, and Philip 'began at the same scripture, and "
            "preached unto him Jesus' (Acts 8:35)."),
        "meaning": (
            "The poem says plainly why the servant suffers: 'he was wounded for our "
            "transgressions, he was bruised for our iniquities'. Peter wrote, 'by whose stripes "
            "ye were healed' (1 Peter 2:24). It is the heart of the gospel in poetry: we went "
            "astray, and 'the LORD hath laid on him the iniquity of us all.'"),
        "lesson": (
            "Read it slowly on a day you feel guilty or unloved. Your sins were carried, your "
            "sorrows understood. And when you suffer unfairly, the servant shows a way to bear it "
            "without bitterness."),
        "key_verses": ["1 Peter 2:24", "Isaiah 53:11"],
    },
    {
        "name": "Ho, every one that thirsteth",
        "group": "Poems of the prophets",
        "testament": "Old",
        "epithet": "Without money and without price",
        "by_label": "Written by",
        "by": [{"name": "Isaiah the prophet"}],
        "occasion": "God's invitation to the thirsty and the searching",
        "where": "Isaiah 55",
        "told_in": "Isaiah 55:1-13",
        "also_in": ["John 7:37-38", "Revelation 22:17"],
        "words": ["Isaiah 55:1-3", "Isaiah 55:8-11"],
        "summary": "God calls out like a market seller who gives everything away free: come, eat, drink, and find the life that money cannot buy.",
        "story": (
            "The poem opens like a street cry: 'Ho, every one that thirsteth, come ye to the "
            "waters, and he that hath no money'. Then comes a question for anyone chasing what "
            "does not satisfy: 'Wherefore do ye spend money for that which is not bread?' God's "
            "thoughts are higher than ours, as the heavens are higher than the earth, and his word "
            "works like rain on a field: 'it shall not return unto me void'."),
        "meaning": (
            "Grace is free, and it is for the thirsty, not the deserving. Jesus stood in the temple "
            "and cried, 'If any man thirst, let him come unto me, and drink' (John 7:37). The "
            "Bible's last invitation echoes this poem: 'let him take the water of life freely' "
            "(Revelation 22:17)."),
        "lesson": (
            "Notice what you are spending yourself on that never satisfies, and bring that thirst "
            "to God instead. When you do not understand his ways, remember they are higher, and "
            "that his word always does its work."),
        "key_verses": ["Isaiah 55:6", "John 7:37"],
    },
    {
        "name": "Beauty for ashes",
        "group": "Poems of the prophets",
        "testament": "Old",
        "epithet": "To bind up the brokenhearted",
        "by_label": "Written by",
        "by": [{"name": "Isaiah the prophet"}],
        "occasion": "Good news for the poor, the grieving and the captive",
        "where": "Isaiah 61",
        "told_in": "Isaiah 61:1-11",
        "also_in": ["Luke 4:16-21"],
        "words": ["Isaiah 61:1-3"],
        "summary": "An anointed messenger brings good news to the broken: freedom for captives, comfort for mourners, and beauty in place of ashes. Jesus read it aloud and said it was about him.",
        "story": (
            "In the synagogue at Nazareth, Jesus was handed the scroll of Isaiah and found this "
            "place: 'The Spirit of the Lord is upon me'. He rolled it up, sat down, and said, "
            "'This day is this scripture fulfilled in your ears' (Luke 4:21). The poem promises "
            "'beauty for ashes, the oil of joy for mourning, the garment of praise for the spirit "
            "of heaviness'."),
        "meaning": (
            "This is the mission statement of Jesus' ministry. God does not only forgive; he "
            "restores what grief and sin have burned down, and turns broken people into 'trees of "
            "righteousness, the planting of the LORD'."),
        "lesson": (
            "Bring your ashes to God: the loss, the failure, the heaviness you carry. And look for "
            "someone brokenhearted near you; the same Spirit sends Christ's people to bind up "
            "wounds."),
        "key_verses": ["Luke 4:18", "Psalms 147:3"],
    },
    {
        "name": "Swords into plowshares",
        "group": "Poems of the prophets",
        "testament": "Old",
        "epithet": "Neither shall they learn war any more",
        "by_label": "Written by",
        "by": [{"name": "Micah the prophet"}],
        "occasion": "A vision of peace in the last days",
        "where": "Micah 4, and Isaiah 2",
        "told_in": "Micah 4:1-5",
        "also_in": ["Isaiah 2:2-4", "Revelation 21:3-4"],
        "words": ["Micah 4:3-4"],
        "summary": "A poem of the day when the nations come to learn God's ways, weapons are hammered into farm tools, and everyone sits safe under their own vine.",
        "story": (
            "Micah lived in a violent age of invasions and injustice. Yet he saw a day when 'they "
            "shall beat their swords into plowshares, and their spears into pruninghooks'. The "
            "same poem appears almost word for word in Isaiah 2, the two prophets sharing one "
            "vision. It ends with a picture of simple peace: 'they shall sit every man under his "
            "vine and under his fig tree; and none shall make them afraid'."),
        "meaning": (
            "Peace in the Bible is not only the end of war but the flourishing of ordinary life, "
            "and it comes when people learn God's ways. The poem looks ahead to the new creation, "
            "where God 'shall wipe away all tears' (Revelation 21:4)."),
        "lesson": (
            "Be a peacemaker now, ahead of that day: turn one quarrel, one grudge or one sharp "
            "word into something that builds up, and pray for peace where there is war."),
        "key_verses": ["Isaiah 2:4", "Matthew 5:9"],
    },

    # ------------------------------------------------------------------ poems of the New Testament
    {
        "name": "In the beginning was the Word",
        "group": "Poems of the New Testament",
        "testament": "New",
        "epithet": "The Word was made flesh",
        "by_label": "Written by",
        "by": [{"name": "John the apostle"}],
        "occasion": "The opening of John's Gospel",
        "where": "John 1",
        "told_in": "John 1:1-18",
        "also_in": ["Genesis 1:1-3", "1 John 1:1-3"],
        "words": ["John 1:1-5", "John 1:14"],
        "summary": "John opens his Gospel with a poem that echoes Genesis: the Word who made all things, the light no darkness can put out, became a man and lived among us.",
        "story": (
            "Genesis begins 'In the beginning God'. John begins 'In the beginning was the Word, "
            "and the Word was with God, and the Word was God.' Everything was made through him, "
            "and 'the light shineth in darkness; and the darkness comprehended it not.' Then comes "
            "the line that changes everything: 'And the Word was made flesh, and dwelt among us'."),
        "meaning": (
            "God did not stay far off and send instructions; he came in person, 'full of grace and "
            "truth'. The same poem says that all who receive him are given 'power to become the "
            "sons of God' (John 1:12)."),
        "lesson": (
            "When the world feels dark, remember the darkness has not put out the light. And "
            "remember that God knows ordinary human life from the inside: tiredness, family, work "
            "and tears."),
        "key_verses": ["John 1:12", "John 8:12"],
    },
    {
        "name": "The greatest of these is charity",
        "group": "Poems of the New Testament",
        "testament": "New",
        "epithet": "Charity suffereth long, and is kind",
        "by_label": "Written by",
        "by": [{"name": "Paul", "hero": "paul"}],
        "occasion": "A letter to a gifted, quarrelling church",
        "where": "1 Corinthians 13",
        "told_in": "1 Corinthians 13:1-13",
        "also_in": ["1 John 4:7-12", "Colossians 3:14"],
        "words": ["1 Corinthians 13:1-8", "1 Corinthians 13:13"],
        "summary": "Paul's poem of love: without it every gift is noise; with it comes patience, kindness and a love that never fails.",
        "story": (
            "The church at Corinth was proud of its gifts and divided over them. In the middle of "
            "his letter Paul writes a poem. Tongues, prophecy, knowledge, even giving everything "
            "away, are worth nothing without love. Then he describes it: 'Charity suffereth long, "
            "and is kind; charity envieth not; charity vaunteth not itself, is not puffed up'. It "
            "is read at countless weddings, but it was written for a church that could not get "
            "along."),
        "meaning": (
            "“Charity” is the KJV's word for self-giving love. This love is a way of acting, not a "
            "feeling: patient, kind, not keeping score. And it outlasts everything: 'now abideth "
            "faith, hope, charity, these three; but the greatest of these is charity.'"),
        "lesson": (
            "Read verses 4 to 7 and put your own name in place of “charity”. Where the line stops "
            "being true, that is where to ask God for help today, at home, at work and at church."),
        "key_verses": ["1 John 4:7", "Colossians 3:14"],
    },
    {
        "name": "If God be for us",
        "group": "Poems of the New Testament",
        "testament": "New",
        "epithet": "Who shall separate us from the love of Christ?",
        "by_label": "Written by",
        "by": [{"name": "Paul", "hero": "paul"}],
        "occasion": "The climax of Paul's letter to the Romans",
        "where": "Romans 8",
        "told_in": "Romans 8:28-39",
        "also_in": ["Psalms 44:22", "John 10:27-29"],
        "words": ["Romans 8:31-35", "Romans 8:37-39"],
        "summary": "Paul's letter rises into a hymn of confidence: nothing in life or death, nothing in all creation, can separate God's people from his love.",
        "story": (
            "After eight chapters on sin, grace and the Spirit, Paul asks, 'What shall we then say "
            "to these things? If God be for us, who can be against us?' He lists every threat he "
            "knew from experience, 'tribulation, or distress, or persecution, or famine, or "
            "nakedness, or peril, or sword', and answers, 'Nay, in all these things we are more "
            "than conquerors through him that loved us.'"),
        "meaning": (
            "The security of a Christian does not rest on how strong their grip on God is, but on "
            "his grip on them. Neither 'death, nor life, nor angels, nor principalities' can undo "
            "it. Jesus said the same of his sheep: 'neither shall any man pluck them out of my "
            "hand' (John 10:28)."),
        "lesson": (
            "Name the thing you fear most and set it beside Paul's list. Say out loud that it cannot "
            "separate you from God's love, and let that settle your heart before you face it."),
        "key_verses": ["Romans 8:28", "John 10:28"],
    },
    {
        "name": "The image of the invisible God",
        "group": "Poems of the New Testament",
        "testament": "New",
        "epithet": "By him all things consist",
        "by_label": "Written by",
        "by": [{"name": "Paul", "hero": "paul"}],
        "occasion": "A letter to the church at Colossae",
        "where": "Colossians 1",
        "told_in": "Colossians 1:15-20",
        "also_in": ["Hebrews 1:1-3", "John 1:3"],
        "words": ["Colossians 1:15-20"],
        "summary": "A poem, perhaps an early hymn, that crowns Jesus as the maker, sustainer and reconciler of all things.",
        "story": (
            "Some in Colossae were being told that Jesus was only one of many spiritual powers. Paul "
            "answers with lines many scholars think the church already knew by heart: Christ is "
            "'the image of the invisible God, the firstborn of every creature', and 'by him were "
            "all things created'. He holds everything together, 'by him all things consist', and "
            "makes peace 'through the blood of his cross'."),
        "meaning": (
            "Jesus is not a part of the picture; he is the one it all hangs on. To see him is to "
            "see what God is like, and his cross reaches everything that sin has broken."),
        "lesson": (
            "When life feels like it is falling apart, remember who holds all things together. Put "
            "Christ first in the thing you are most tempted to keep for yourself: 'that in all "
            "things he might have the preeminence.'"),
        "key_verses": ["Hebrews 1:3", "Colossians 1:17"],
    },
    {
        "name": "O death, where is thy sting?",
        "group": "Poems of the New Testament",
        "testament": "New",
        "epithet": "Death is swallowed up in victory",
        "by_label": "Written by",
        "by": [{"name": "Paul", "hero": "paul"}],
        "occasion": "Paul's great chapter on the resurrection",
        "where": "1 Corinthians 15",
        "told_in": "1 Corinthians 15:51-58",
        "also_in": ["Isaiah 25:8", "Hosea 13:14", "1 Thessalonians 4:13-18"],
        "words": ["1 Corinthians 15:51-57"],
        "summary": "Paul ends his teaching on the resurrection with a taunt to death itself, because Christ has won the victory over it.",
        "story": (
            "Some in Corinth doubted that the dead would rise. Paul reminds them that Christ was "
            "raised, seen by hundreds of witnesses, and then unveils 'a mystery': 'We shall not "
            "all sleep, but we shall all be changed, In a moment, in the twinkling of an eye, at "
            "the last trump'. Borrowing words from Isaiah and Hosea, he turns to death and asks, "
            "'O death, where is thy sting? O grave, where is thy victory?'"),
        "meaning": (
            "Death is real, and it still hurts, but it no longer has the last word. 'The sting of "
            "death is sin', and that sting has been drawn by Christ. So Paul ends not with a "
            "feeling but with a task: be 'stedfast, unmovable, always abounding in the work of "
            "the Lord' (1 Corinthians 15:58)."),
        "lesson": (
            "Grieve honestly, but not 'as others which have no hope' (1 Thessalonians 4:13). And "
            "because your labour 'is not in vain in the Lord', keep doing the good work in front "
            "of you today."),
        "key_verses": ["1 Corinthians 15:58", "1 Thessalonians 4:13"],
    },
]
