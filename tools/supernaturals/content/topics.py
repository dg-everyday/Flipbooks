"""Special topics: what the whole Bible teaches about angels, and about demons
and the devil.

Unlike the other entries, which are events, each topic gathers many passages.
The page shows them under "Special topics", after the events. Fields as in
miracles.py, except:

  testament   Old, New, or Both (a topic drawn from both Testaments shows
              under either Testament filter)
  told_in     the key passage; also_in: the other passages the topic draws on
  related     ids of events on this page that show the topic in action; the
              page links to them (the build checks they exist)
  with        people with a page of their own, e.g. Satan on Heroes and Villains
  story       what the Bible says; meaning: why it matters, and where the Bible
              is silent or Christians read it differently; lesson: daily life

These entries say what Scripture says and where it stops. They never describe
occult practice, and they do not add to the Bible's names or ranks of angels.

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

ANGELS = "Angels"
DEMONS = "Demons"
SATAN = [{"name": "Satan", "hero": "satan"}]

TOPICS = [
    # ------------------------------------------------------------------ angels
    {
        "name": "What are angels?",
        "group": ANGELS,
        "testament": "Both",
        "epithet": "Ministering spirits",
        "told_in": "Hebrews 1:13-14",
        "also_in": ["Psalms 148:2-5", "Colossians 1:16", "Psalms 103:20", "Luke 15:10",
                    "Revelation 5:11", "Matthew 22:30"],
        "related": ["gabriel-comes-to-mary", "peter-freed-by-an-angel"],
        "summary": "Angels are spirits created by God to worship him and to serve him, sent out to help those who will inherit salvation.",
        "story": (
            "The word angel means messenger, in Hebrew and in Greek. The Bible says angels were "
            "made: 'Praise ye him, all his angels … for he commanded, and they were created.' "
            "They were made through Christ, 'whether they be thrones, or dominions, or "
            "principalities, or powers' (Colossians 1:16). They are strong, 'that excel in "
            "strength, that do his commandments' (Psalms 103:20), and many: John heard 'ten "
            "thousand times ten thousand, and thousands of thousands' around God's throne. "
            "Hebrews sums up their work: 'Are they not all ministering spirits, sent forth to "
            "minister for them who shall be heirs of salvation?'"),
        "meaning": (
            "Angels are real, but they are servants, not rivals to God or objects of devotion. "
            "They rejoice when a sinner repents (Luke 15:10). People do not become angels when "
            "they die: Jesus said the raised will be 'as the angels of God in heaven' in that they "
            "do not marry, not that they turn into angels. The Bible tells us what angels do far "
            "more than what they are like."),
        "lesson": (
            "Worship with confidence: you join a crowd too large to count. And remember that you "
            "are cared for by a God whose servants are sent to help his people."),
        "key_verses": ["Hebrews 1:14", "Luke 15:10"],
    },
    {
        "name": "The angel of the LORD",
        "group": ANGELS,
        "testament": "Old",
        "epithet": "Thou God seest me",
        "told_in": "Genesis 16:7-13",
        "also_in": ["Genesis 22:11-18", "Exodus 3:2-6", "Judges 6:11-24", "Judges 13:15-22",
                    "Psalms 34:7"],
        "related": ["the-burning-bush", "balaam-s-donkey-speaks"],
        "summary": "In the Old Testament a mysterious figure called the angel of the LORD appears, speaks as God, and is worshipped as God.",
        "story": (
            "When Hagar fled into the desert, 'the angel of the LORD found her by a fountain of "
            "water'. He promised her a son, and she 'called the name of the LORD that spake unto "
            "her, Thou God seest me'. The angel of the LORD called to Abraham on Mount Moriah, "
            "'appeared unto him in a flame of fire out of the midst of a bush' to Moses, and told "
            "Samson's father his name was 'secret' (Judges 13:18). Again and again those who met "
            "him said they had seen God."),
        "meaning": (
            "Christians have long read these appearances in different ways. Many, since the early "
            "church, see the Son of God appearing before he was born as a man; others see an angel "
            "who carries God's name and speaks for him. The Bible does not settle it, but it does "
            "show a God who comes close to the frightened and the forgotten."),
        "lesson": (
            "Like Hagar, you are seen, even in the wilderness. 'The angel of the LORD encampeth "
            "round about them that fear him, and delivereth them' (Psalms 34:7)."),
        "key_verses": ["Genesis 16:13", "Psalms 34:7"],
    },
    {
        "name": "Cherubim and seraphim",
        "group": ANGELS,
        "testament": "Old",
        "epithet": "Holy, holy, holy, is the LORD of hosts",
        "told_in": "Isaiah 6:1-8",
        "also_in": ["Genesis 3:24", "Exodus 25:18-22", "Ezekiel 10:1-22", "Revelation 4:6-8"],
        "summary": "The Bible names two kinds of heavenly beings who stand nearest God's throne: cherubim who guard his holiness and seraphim who cry out his praise.",
        "story": (
            "After the fall, God 'placed at the east of the garden of Eden Cherubim, and a flaming "
            "sword' to guard the tree of life. Golden cherubim covered the mercy seat on the ark, "
            "and Ezekiel saw living creatures with wings and wheels and said, 'I knew that they "
            "were the cherubims.' Isaiah saw 'the seraphims: each one had six wings' above God's "
            "throne, calling, 'Holy, holy, holy, is the LORD of hosts: the whole earth is full of "
            "his glory.' One flew to him with a live coal and touched his lips: 'thine iniquity is "
            "taken away'."),
        "meaning": (
            "These are not the chubby babies of later paintings. Cherubim and seraphim show how "
            "holy God is: the most glorious creatures cover their faces before him. Yet Isaiah's "
            "vision ends in grace, with sin purged and a man sent out: 'Here am I; send me' "
            "(Isaiah 6:8)."),
        "lesson": (
            "Come to worship with awe as well as joy. And when you feel unworthy, remember that "
            "God's holiness came to Isaiah with forgiveness and a calling."),
        "key_verses": ["Isaiah 6:3", "Revelation 4:8"],
    },
    {
        "name": "Michael and Gabriel",
        "group": ANGELS,
        "testament": "Both",
        "epithet": "The only angels the Bible names",
        "told_in": "Daniel 10:10-21",
        "also_in": ["Daniel 12:1", "Jude 1:9", "Revelation 12:7-9", "Daniel 8:15-19",
                    "Daniel 9:20-23", "Luke 1:11-20", "Luke 1:26-38"],
        "related": ["gabriel-comes-to-mary"],
        "summary": "Only two angels are named in the Bible: Michael, the archangel who fights for God's people, and Gabriel, who brings God's messages.",
        "story": (
            "Daniel hears of a heavenly struggle in which 'Michael, one of the chief princes, came "
            "to help'. Later, 'at that time shall Michael stand up, the great prince which "
            "standeth for the children of thy people'. Jude calls him 'Michael the archangel', and "
            "in Revelation 'Michael and his angels fought against the dragon'. Gabriel explained "
            "Daniel's visions, then told Zacharias, 'I am Gabriel, that stand in the presence of "
            "God', and was sent to Mary in Nazareth."),
        "meaning": (
            "Michael is linked with protection and battle, Gabriel with good news. Even Michael, "
            "contending with the devil, 'durst not bring against him a railing accusation, but "
            "said, The Lord rebuke thee' (Jude 1:9): the strongest angel relies on God's "
            "authority, not his own. Other names, such as Raphael, come from books outside the "
            "Protestant Bible."),
        "lesson": (
            "Take on spiritual battles the way Michael did, not in your own strength or with "
            "insults, but by trusting the Lord. And listen for good news: Gabriel's words to Mary "
            "still stand, 'with God nothing shall be impossible' (Luke 1:37)."),
        "key_verses": ["Jude 1:9", "Luke 1:19"],
    },
    {
        "name": "Angels who guard and help",
        "group": ANGELS,
        "testament": "Both",
        "epithet": "He shall give his angels charge over thee",
        "told_in": "Psalms 91:9-13",
        "also_in": ["2 Kings 6:14-17", "Psalms 34:7", "Daniel 6:22", "Acts 12:5-11",
                    "Matthew 18:10", "Hebrews 13:2"],
        "related": ["daniel-in-the-lions-den", "peter-freed-by-an-angel", "the-fourth-man-in-the-fire"],
        "summary": "Scripture shows angels sent to protect, rescue and strengthen God's people, often unseen.",
        "story": (
            "When an army surrounded Elisha, his servant panicked. Elisha said, 'Fear not: for they "
            "that be with us are more than they that be with them', and prayed for the young man's "
            "eyes to be opened: 'the mountain was full of horses and chariots of fire round about "
            "Elisha.' God 'shall give his angels charge over thee, to keep thee in all thy ways.' "
            "An angel shut the lions' mouths for Daniel and led Peter out of prison, and Hebrews "
            "says some 'have entertained angels unawares.'"),
        "meaning": (
            "God protects his people, and angels are one of the ways he does it. Jesus said of the "
            "little ones, 'in heaven their angels do always behold the face of my Father' "
            "(Matthew 18:10), and some take this to mean each believer has a guardian angel; the "
            "Bible does not say so plainly. Psalm 91 was also quoted by the devil to tempt Jesus to "
            "jump from the temple (Matthew 4:6): angels' care is no licence to take foolish "
            "risks."),
        "lesson": (
            "When you are afraid, pray Elisha's prayer: that your eyes would see that those with "
            "you are more than those against you. And be kind to strangers; you never know whom "
            "you are welcoming."),
        "key_verses": ["2 Kings 6:16", "Hebrews 13:2"],
    },
    {
        "name": "Angels in the life of Jesus",
        "group": ANGELS,
        "testament": "New",
        "epithet": "Angels came and ministered unto him",
        "told_in": "Matthew 28:1-7",
        "also_in": ["Luke 1:26-38", "Luke 2:8-14", "Matthew 4:11", "Luke 22:43",
                    "Acts 1:10-11", "Matthew 25:31"],
        "related": ["gabriel-comes-to-mary"],
        "summary": "Angels announced Jesus' birth, served him after his temptation, strengthened him in Gethsemane, opened his tomb, and will come with him when he returns.",
        "story": (
            "Gabriel told Mary she would bear a son, and a multitude of angels praised God over "
            "the fields of Bethlehem. After forty days of temptation, 'the devil leaveth him, and, "
            "behold, angels came and ministered unto him.' In Gethsemane 'there appeared an angel "
            "unto him from heaven, strengthening him.' On Easter morning 'the angel of the Lord "
            "descended from heaven, and came and rolled back the stone', and told the women, 'He "
            "is not here: for he is risen'. At his ascension two men in white promised he would "
            "come again, and when he does, 'all the holy angels with him'."),
        "meaning": (
            "Angels surround the whole story of Jesus, but always as servants. Hebrews says he is "
            "'so much better than the angels' (Hebrews 1:4); they worship him. The good news they "
            "bring is about him, not about themselves."),
        "lesson": (
            "When you face your own Gethsemane, remember that God strengthened his Son in his "
            "darkest night, and he has promised strength to you. Live today as someone waiting "
            "for Christ's return."),
        "key_verses": ["Luke 22:43", "Matthew 25:31"],
    },
    {
        "name": "Worship God, not angels",
        "group": ANGELS,
        "testament": "New",
        "epithet": "See thou do it not",
        "told_in": "Revelation 22:8-9",
        "also_in": ["Revelation 19:10", "Colossians 2:18-19", "Galatians 1:8", "Hebrews 1:4-6"],
        "summary": "When John fell down to worship an angel, the angel stopped him: angels are fellow servants, and worship belongs to God alone.",
        "story": (
            "Overwhelmed by his visions, John 'fell down to worship before the feet of the angel "
            "which shewed me these things.' The angel said, 'See thou do it not: for I am thy "
            "fellowservant … worship God.' Paul warned the Colossians against 'worshipping of "
            "angels', and the Galatians that even 'an angel from heaven' preaching another gospel "
            "should be rejected (Galatians 1:8)."),
        "meaning": (
            "Fascination with angels can quietly replace faith in Christ. The Bible never tells us "
            "to pray to angels, to seek messages from them, or to learn their names. Any message "
            "that contradicts the gospel is to be refused, whoever seems to bring it."),
        "lesson": (
            "Test what you hear by Scripture, however heavenly it sounds. Give your devotion to "
            "Jesus alone, and thank God, not angels, for his care."),
        "key_verses": ["Colossians 2:18", "Galatians 1:8"],
    },

    # ------------------------------------------------------------------ demons
    {
        "name": "Satan, the adversary",
        "group": DEMONS,
        "testament": "Both",
        "epithet": "As a roaring lion, walketh about",
        "with": SATAN,
        "told_in": "1 Peter 5:8-9",
        "also_in": ["Genesis 3:1-5", "Job 1:6-12", "Zechariah 3:1-2", "Matthew 4:1-11",
                    "John 8:44", "2 Corinthians 11:14", "Revelation 12:9"],
        "related": ["a-house-divided"],
        "summary": "Satan, whose name means adversary, is the Bible's great enemy of God and his people: a liar, an accuser and a tempter, but never God's equal.",
        "story": (
            "The serpent in Eden asked, 'Yea, hath God said?' In Job, 'Satan came also among "
            "them' before the LORD, and could do only what God allowed. In Zechariah he stands "
            "'at his right hand to resist him', accusing the high priest. He tempted Jesus in the "
            "wilderness and was sent away with Scripture: 'Get thee hence, Satan'. Jesus called him "
            "'a liar, and the father of it'. Paul warns that 'Satan himself is transformed into an "
            "angel of light', and Peter that 'your adversary the devil, as a roaring lion, walketh "
            "about, seeking whom he may devour'."),
        "meaning": (
            "Satan is real, personal and dangerous, but he is a created being on a leash, not a "
            "dark god equal to the Lord. His main weapons are lies, accusation and temptation. "
            "The Bible never asks us to be curious about him, only to be watchful and firm."),
        "lesson": (
            "Be sober and alert: notice the lies that pull you away from God, especially the ones "
            "that sound reasonable. Answer them as Jesus did, with what is written."),
        "key_verses": ["1 Peter 5:8", "John 8:44"],
    },
    {
        "name": "Where did demons come from?",
        "group": DEMONS,
        "testament": "New",
        "epithet": "The angels which kept not their first estate",
        "told_in": "Revelation 12:7-9",
        "also_in": ["Jude 1:6", "2 Peter 2:4", "Matthew 25:41", "Luke 10:18",
                    "Isaiah 14:12-15", "Ezekiel 28:12-17"],
        "summary": "The Bible does not tell the whole story, but it speaks of angels who sinned and fell, and of the devil and his angels cast out of heaven.",
        "story": (
            "Scripture gives glimpses rather than a full account. Jude speaks of 'the angels which "
            "kept not their first estate, but left their own habitation', and Peter of 'the angels "
            "that sinned'. Revelation describes war in heaven: 'the great dragon was cast out, that "
            "old serpent, called the Devil, and Satan … and his angels were cast out with him.' "
            "Jesus said, 'I beheld Satan as lightning fall from heaven', and spoke of 'everlasting "
            "fire, prepared for the devil and his angels'."),
        "meaning": (
            "Most Christians have understood demons as fallen angels who followed Satan in "
            "rebellion. Isaiah 14 and Ezekiel 28, which speak of the kings of Babylon and Tyre, "
            "have often been read as describing the devil's fall too, though that reading is "
            "debated. God did not create evil: these beings were made good and turned away."),
        "lesson": (
            "Do not fill the gaps with speculation or films. Hold to what is written: evil is real "
            "but rebellious, limited and already judged."),
        "key_verses": ["Jude 1:6", "Matthew 25:41"],
    },
    {
        "name": "What demons do",
        "group": DEMONS,
        "testament": "New",
        "epithet": "The god of this world hath blinded the minds",
        "told_in": "2 Corinthians 4:3-6",
        "also_in": ["1 Timothy 4:1", "1 Corinthians 10:19-21", "Luke 13:10-17", "Acts 10:38",
                    "Mark 5:1-5"],
        "related": ["legion", "the-boy-the-disciples-could-not-free", "the-slave-girl-at-philippi"],
        "summary": "In the Bible, evil spirits deceive, blind people to the gospel, stand behind false worship, and sometimes oppress people in body and mind.",
        "story": (
            "Paul says 'the god of this world hath blinded the minds of them which believe not'. "
            "He warns of 'seducing spirits, and doctrines of devils', and that sacrifices to idols "
            "are made 'to devils, and not to God'. In the Gospels, spirits tormented people: the "
            "man in the tombs cut himself with stones, and a woman 'whom Satan hath bound, lo, "
            "these eighteen years' could not stand upright. Peter summed up Jesus' ministry as "
            "'healing all that were oppressed of the devil'."),
        "meaning": (
            "The Bible takes the spirit world seriously, but it does not blame every illness or "
            "trouble on demons. Many healings in the Gospels involve no spirit at all, and Jesus "
            "told the difference. Deception is the devil's chief work, so truth is our first "
            "defence."),
        "lesson": (
            "Be careful not to see a demon behind every problem, or none anywhere. Pray for "
            "discernment, get medical help when you are ill, and hold fast to the truth of the "
            "gospel."),
        "key_verses": ["2 Corinthians 4:4", "Acts 10:38"],
    },
    {
        "name": "Jesus' authority over demons",
        "group": DEMONS,
        "testament": "New",
        "epithet": "Even the unclean spirits … do obey him",
        "told_in": "Mark 1:21-28",
        "also_in": ["Luke 10:17-20", "Colossians 2:15", "1 John 3:8", "Hebrews 2:14-15",
                    "John 12:31"],
        "related": ["the-man-in-the-synagogue", "legion", "mary-magdalene-set-free",
                    "the-sons-of-sceva"],
        "summary": "Jesus cast out demons with a word, gave his followers authority in his name, and at the cross disarmed the powers of darkness.",
        "story": (
            "In the synagogue at Capernaum the people were amazed: 'with authority commandeth he "
            "even the unclean spirits, and they do obey him.' He used no rituals or charms, only "
            "a command. The seventy returned saying, 'Lord, even the devils are subject unto us "
            "through thy name.' At the cross, Paul says, Christ 'spoiled principalities and powers, "
            "he made a shew of them openly, triumphing over them in it.'"),
        "meaning": (
            "'For this purpose the Son of God was manifested, that he might destroy the works of "
            "the devil' (1 John 3:8). The power is Christ's, not ours: the sons of Sceva tried to "
            "use Jesus' name like a spell and were overpowered (Acts 19:13-16). Jesus told his "
            "disciples to rejoice not that spirits obeyed them, 'but rather rejoice, because your "
            "names are written in heaven.'"),
        "lesson": (
            "You do not need to fear what Christ has already defeated. Rejoice most of all that "
            "you belong to him."),
        "key_verses": ["1 John 3:8", "Colossians 2:15"],
    },
    {
        "name": "The whole armour of God",
        "group": DEMONS,
        "testament": "New",
        "epithet": "We wrestle not against flesh and blood",
        "told_in": "Ephesians 6:10-18",
        "also_in": ["Romans 13:12", "1 Thessalonians 5:8", "2 Corinthians 10:3-5"],
        "summary": "Paul tells Christians to stand against the devil's schemes in God's armour: truth, righteousness, the gospel, faith, salvation, the word of God and prayer.",
        "story": (
            "Writing in chains, perhaps with a Roman guard beside him, Paul says, 'Put on the whole "
            "armour of God, that ye may be able to stand against the wiles of the devil. For we "
            "wrestle not against flesh and blood, but against principalities, against powers'. "
            "Then he names each piece: the belt of truth, the 'breastplate of righteousness', feet "
            "ready with 'the gospel of peace', 'the shield of faith, wherewith ye shall be able to "
            "quench all the fiery darts of the wicked', 'the helmet of salvation, and the sword of "
            "the Spirit, which is the word of God', and prayer 'always'."),
        "meaning": (
            "Most of the armour is ordinary Christian living: honesty, right living, the gospel, "
            "trust, Scripture and prayer. Spiritual battle is not mainly dramatic encounters but "
            "daily faithfulness. And our enemy is not the people who oppose us: 'we wrestle not "
            "against flesh and blood'."),
        "lesson": (
            "Put the armour on each morning: read a verse, tell the truth, trust God and pray for "
            "the people around you. Remember that the person who hurt you is not your real "
            "enemy."),
        "key_verses": ["Ephesians 6:11", "Ephesians 6:16"],
    },
    {
        "name": "Resist the devil",
        "group": DEMONS,
        "testament": "New",
        "epithet": "And he will flee from you",
        "told_in": "James 4:7-8",
        "also_in": ["1 Peter 5:8-9", "Ephesians 4:26-27", "Matthew 4:1-11", "1 Corinthians 10:13"],
        "summary": "The Bible's plan for facing the devil is simple: submit to God, resist the devil, and do not give him a foothold.",
        "story": (
            "James writes, 'Submit yourselves therefore to God. Resist the devil, and he will flee "
            "from you.' Peter says the same: 'Whom resist stedfast in the faith'. Paul warns that "
            "anger left overnight gives the devil room: 'Neither give place to the devil.' Jesus "
            "showed the way in the wilderness, answering each temptation with 'It is written'."),
        "meaning": (
            "The order matters: submit to God first, then resist. Resistance is not shouting at "
            "the devil but saying no to sin and yes to God. And there is always a way out: 'God is "
            "faithful, who will not suffer you to be tempted above that ye are able' (1 "
            "Corinthians 10:13)."),
        "lesson": (
            "Name the place where you keep giving the devil a foothold, whether anger, a habit or "
            "a lie you believe, and close it today by submitting it to God and choosing the way "
            "out."),
        "key_verses": ["James 4:7", "1 Corinthians 10:13"],
    },
    {
        "name": "Try the spirits",
        "group": DEMONS,
        "testament": "New",
        "epithet": "Believe not every spirit",
        "told_in": "1 John 4:1-6",
        "also_in": ["2 Corinthians 11:13-15", "Deuteronomy 18:9-14", "Acts 19:18-20",
                    "Galatians 1:8"],
        "related": ["the-law-against-sorcery", "the-witch-of-endor", "the-books-burned-at-ephesus"],
        "summary": "Not every spiritual experience comes from God. John tells believers to test the spirits by what they say about Jesus Christ.",
        "story": (
            "John writes, 'Beloved, believe not every spirit, but try the spirits whether they are "
            "of God: because many false prophets are gone out into the world.' The test is Christ: "
            "every spirit that confesses 'that Jesus Christ is come in the flesh is of God' (1 "
            "John 4:2). Paul warns that false teachers can look like 'ministers of righteousness'. "
            "At Ephesus, new believers burned their books of magic in public (Acts 19:19)."),
        "meaning": (
            "The Bible forbids consulting mediums, fortune-tellers and spirits (Deuteronomy "
            "18:10-12), not because they are harmless but because they are not. A spiritual "
            "message is to be judged by Scripture and by what it says about Jesus, not by how "
            "impressive it feels."),
        "lesson": (
            "Stay away from horoscopes, séances, ouija boards and fortune-telling, even as a game. "
            "If you have been involved, bring it to God, get rid of anything connected to it, and "
            "talk to a pastor."),
        "key_verses": ["1 John 4:1", "Acts 19:19"],
    },
    {
        "name": "Greater is he that is in you",
        "group": DEMONS,
        "testament": "New",
        "epithet": "Than he that is in the world",
        "told_in": "1 John 4:4",
        "also_in": ["Romans 8:37-39", "Colossians 1:13", "Luke 10:19-20", "2 Kings 6:16"],
        "summary": "Should a Christian be afraid of demons? The Bible's answer is no: the one who lives in believers is greater than any power in the world.",
        "story": (
            "John writes to ordinary believers surrounded by false teaching: 'Ye are of God, little "
            "children, and have overcome them: because greater is he that is in you, than he that "
            "is in the world.' Paul lists every power he can think of, 'angels, nor principalities, "
            "nor powers', and says none 'shall be able to separate us from the love of God' "
            "(Romans 8:38-39). God 'hath delivered us from the power of darkness' (Colossians "
            "1:13)."),
        "meaning": (
            "The Bible treats evil seriously but never tells believers to live in fear of it. The "
            "Holy Spirit lives in those who belong to Christ, and nothing can snatch them from "
            "God. Fear of the devil gives him more attention than he deserves; faith keeps our eyes "
            "on the Lord."),
        "lesson": (
            "If you are afraid at night or troubled by dark thoughts, pray in Jesus' name, read "
            "Romans 8:38-39 aloud, and rest in the one who is greater."),
        "key_verses": ["1 John 4:4", "Colossians 1:13"],
    },
    {
        "name": "The end of the devil",
        "group": DEMONS,
        "testament": "Both",
        "epithet": "The God of peace shall bruise Satan under your feet",
        "told_in": "Revelation 20:7-10",
        "also_in": ["Genesis 3:15", "Romans 16:20", "Matthew 25:41", "Hebrews 2:14-15",
                    "Revelation 21:3-4"],
        "summary": "The Bible's story ends with the devil defeated for ever: the serpent's head crushed, as God promised in Eden.",
        "story": (
            "Right after the first sin, God told the serpent that the woman's seed would win: 'it "
            "shall bruise thy head' (Genesis 3:15). Paul promised the Romans, 'the God of peace shall "
            "bruise Satan under your feet shortly.' Jesus shared our flesh 'that through death he "
            "might destroy him that had the power of death, that is, the devil'. At the end, 'the "
            "devil that deceived them was cast into the lake of fire', and God makes all things "
            "new, with no more death, sorrow or pain (Revelation 21:4)."),
        "meaning": (
            "Evil will not have the last word. The victory was won at the cross and will be "
            "completed at Christ's return. Until then the devil is a defeated enemy who can still "
            "do harm, but his time is short (Revelation 12:12)."),
        "lesson": (
            "When evil seems to be winning, in the news or in your own life, remember how the story "
            "ends. Live today on the side of the winner."),
        "key_verses": ["Romans 16:20", "Hebrews 2:14"],
    },
]
