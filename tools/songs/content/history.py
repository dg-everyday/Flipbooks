"""Songs from Israel's story: songs of victory, worship and thanksgiving, and laments.

Fields (all but name, group, testament, told_in and summary are optional):

  name, epithet   the song's name, and a line from it
  group           one of GROUPS in build_songs.py
  testament       Old or New
  by, with        [{name, hero?}]: who sang or wrote it, and who else was there.
                  hero is an id on heroes-and-villains.html. by_label replaces
                  "Sung by" for one entry (e.g. "Written by").
  occasion        what the song was sung for
  where           where it was sung
  told_in         the passage that tells it; also_in: parallels and echoes
  sung            references for the song's own words; the build adds the text
  summary         one sentence
  story           the story behind it
  meaning         why it matters
  lesson          what we learn
  key_verses      other verses to read with it; the build adds the text

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

HISTORY = [
    # ------------------------------------------------------------------ songs of victory
    {
        "name": "Lamech's song",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "Hear my voice, ye wives of Lamech",
        "by": [{"name": "Lamech, of Cain's family"}],
        "with": [{"name": "Adah and Zillah, his wives"}, {"name": "Cain", "hero": "cain"}],
        "occasion": "Boasting to his wives of a killing",
        "where": "Among Cain's descendants, east of Eden",
        "told_in": "Genesis 4:19-24",
        "also_in": ["Matthew 18:21-22"],
        "sung": ["Genesis 4:23-24"],
        "summary": "The first song in the Bible is a boast. Lamech, of Cain's line, sang to his wives that he had killed a man, and would take revenge seventy-seven times over.",
        "story": (
            "Cain's family built the first city and began the first crafts. One of Lamech's sons, "
            "Jubal, was 'the father of all such as handle the harp and organ'. From the same "
            "family came the first poem in Scripture. Lamech, the first man said to take two wives, "
            "sang to them: 'I have slain a man to my wounding, and a young man to my hurt. If Cain "
            "shall be avenged sevenfold, truly Lamech seventy and sevenfold.'"),
        "meaning": (
            "Music and poetry are God's gifts, but here they are put to work for pride and revenge. "
            "Jesus turned Lamech's number around: when Peter asked how often he should forgive, he "
            "answered, 'I say not unto thee, Until seven times: but, Until seventy times seven' "
            "(Matthew 18:22)."),
        "lesson": "A song can carry pride or praise. The gift that first boasted of revenge would one day sing of forgiveness.",
        "key_verses": ["Matthew 18:21-22"],
    },
    {
        "name": "The song of the sea",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "I will sing unto the LORD, for he hath triumphed gloriously",
        "by": [{"name": "Moses and the children of Israel", "hero": "moses"}],
        "with": [{"name": "Miriam"}, {"name": "Pharaoh", "hero": "pharaoh"}],
        "occasion": "The morning after the Red Sea closed over Pharaoh's army",
        "where": "The shore of the Red Sea",
        "told_in": "Exodus 15:1-19",
        "also_in": ["Psalms 106:9-12", "Revelation 15:2-4"],
        "sung": ["Exodus 15:1", "Exodus 15:11", "Exodus 15:18"],
        "summary": "The first great song of Scripture: Israel, safe on the far shore, sang of the God who threw horse and rider into the sea.",
        "story": (
            "Israel had walked through the sea on dry ground, and in the morning they saw the "
            "Egyptians dead on the shore. 'Then sang Moses and the children of Israel this song unto "
            "the LORD'. The song tells the night again: the blast of wind, the waters piled up, the "
            "enemy's boast, 'I will pursue, I will overtake', and the sea closing over them, 'they "
            "sank as lead in the mighty waters.' Then it looks ahead to the land where God would "
            "plant his people, and ends: 'The LORD shall reign for ever and ever.'"),
        "meaning": (
            "Israel's first act as a free people was to sing. The song gave them words they would "
            "use for centuries, 'The LORD is my strength and song', which Isaiah and the psalmist "
            "sing again (Isaiah 12:2; Psalm 118:14). At the end of the Bible the redeemed stand "
            "beside another sea and sing 'the song of Moses the servant of God, and the song of the "
            "Lamb' (Revelation 15:3)."),
        "lesson": "Remember out loud what God has done. Praise after a rescue is how faith remembers.",
        "key_verses": ["Psalms 118:14", "Revelation 15:3"],
    },
    {
        "name": "Miriam's song",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "Sing ye to the LORD",
        "by": [{"name": "Miriam the prophetess"}],
        "with": [{"name": "The women of Israel"}, {"name": "Moses", "hero": "moses"}],
        "occasion": "The crossing of the Red Sea",
        "where": "The shore of the Red Sea",
        "told_in": "Exodus 15:20-21",
        "also_in": ["Micah 6:4"],
        "sung": ["Exodus 15:21"],
        "summary": "Miriam took a timbrel and led the women of Israel in dancing, answering Moses' song with its opening line.",
        "story": (
            "'And Miriam the prophetess, the sister of Aaron, took a timbrel in her hand; and all "
            "the women went out after her with timbrels and with dances.' She answered the song "
            "with a chorus of her own, the same words turned into a call to everyone watching: "
            "'Sing ye to the LORD, for he hath triumphed gloriously; the horse and his rider hath he "
            "thrown into the sea.'"),
        "meaning": (
            "Miriam is the first woman the Bible calls a prophetess, and she is remembered beside "
            "her brothers as a leader of the exodus: 'I sent before thee Moses, Aaron, and Miriam' "
            "(Micah 6:4). Many scholars think her two-line chorus is among the oldest verse in "
            "Scripture."),
        "lesson": "Praise is catching. One voice and a timbrel can set a whole people singing.",
        "key_verses": ["Micah 6:4"],
    },
    {
        "name": "The song of Deborah",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "I, even I, will sing unto the LORD",
        "by": [{"name": "Deborah", "hero": "deborah"}, {"name": "Barak"}],
        "with": [{"name": "Jael"}, {"name": "Sisera"}],
        "occasion": "The defeat of Sisera and the army of Jabin, king of Canaan",
        "where": "Israel, after the battle by the river Kishon",
        "told_in": "Judges 5:1-31",
        "also_in": ["Judges 4:1-24", "Hebrews 11:32"],
        "sung": ["Judges 5:3", "Judges 5:31"],
        "summary": "After God routed Sisera's chariots at the river Kishon, Deborah and Barak sang of the tribes who came, the tribes who stayed home, and the stars that fought from heaven.",
        "story": (
            "For twenty years Jabin's nine hundred iron chariots had crushed Israel. Deborah, a "
            "prophetess who judged Israel under a palm tree, called Barak to fight; the LORD routed "
            "Sisera's army, and the fleeing captain died in Jael's tent. 'Then sang Deborah and "
            "Barak the son of Abinoam on that day'. The song praises the volunteers, 'when the "
            "people willingly offered themselves', and shames the tribes who stayed among their "
            "sheepfolds. It tells how 'the stars in their courses fought against Sisera' and 'The "
            "river of Kishon swept them away'. It ends with Sisera's mother at her window, waiting "
            "for a son who would never come home."),
        "meaning": (
            "It is among the oldest songs in the Bible, and it gives the glory to God, and honour to "
            "a woman: 'I Deborah arose, that I arose a mother in Israel' (Judges 5:7). The victory "
            "ends in peace: 'the land had rest forty years.'"),
        "lesson": "God notices who shows up. The song honours those who willingly offered themselves, and asks the rest where they were.",
        "key_verses": ["Judges 5:7", "Judges 5:20"],
    },
    {
        "name": "Saul hath slain his thousands",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "And David his ten thousands",
        "by": [{"name": "The women of Israel"}],
        "with": [{"name": "David", "hero": "david"}, {"name": "Saul", "hero": "saul"}],
        "occasion": "The army coming home after David killed Goliath",
        "where": "The cities of Israel",
        "told_in": "1 Samuel 18:6-9",
        "also_in": ["1 Samuel 21:10-12", "1 Samuel 29:5"],
        "sung": ["1 Samuel 18:7"],
        "summary": "The women sang to welcome the army home, and one line gave young David more praise than the king. Saul never forgave it.",
        "story": (
            "When David came back from killing Goliath, 'the women came out of all cities of "
            "Israel, singing and dancing, to meet king Saul'. As they played they answered one "
            "another: 'Saul hath slain his thousands, and David his ten thousands.' It was meant as "
            "a victory song. But 'Saul was very wroth, and the saying displeased him', and he asked, "
            "'what can he have more but the kingdom?' 'And Saul eyed David from that day and "
            "forward.'"),
        "meaning": (
            "A song of celebration became the start of years of jealousy and pursuit. The song "
            "spread so far that even the Philistines at Gath knew it, and quoted it about David "
            "(1 Samuel 21:11)."),
        "lesson": "Jealousy can turn someone else's blessing into our misery. Saul could have rejoiced in a victory that was his too.",
        "key_verses": ["1 Samuel 18:8-9"],
    },
    {
        "name": "David's song of deliverance",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "The LORD is my rock, and my fortress",
        "by": [{"name": "David", "hero": "david"}],
        "with": [{"name": "Saul", "hero": "saul"}],
        "occasion": "Looking back on a lifetime of rescue from his enemies and from Saul",
        "where": "Jerusalem, late in David's reign",
        "told_in": "2 Samuel 22:1-51",
        "also_in": ["Psalms 18:1-50", "Romans 15:9"],
        "sung": ["2 Samuel 22:2-3"],
        "summary": "Near the end of his life David sang of the God who had rescued him again and again: his rock, his fortress, his deliverer.",
        "story": (
            "David 'spake unto the LORD the words of this song in the day that the LORD had "
            "delivered him out of the hand of all his enemies, and out of the hand of Saul'. He "
            "remembers death closing over him like floods, crying out in his distress, and God "
            "coming down to answer: 'He sent from above, he took me; he drew me out of many "
            "waters'. It ends with thanks sung 'among the heathen', and mercy promised 'unto David, "
            "and to his seed for evermore.'"),
        "meaning": (
            "The same song appears again as Psalm 18, so it was sung in worship as well as kept as "
            "history. Paul quotes it to show that God always meant the nations to praise him: 'For "
            "this cause I will confess to thee among the Gentiles' (Romans 15:9)."),
        "lesson": "Look back and count the rescues. The God who delivered you before is the rock you can stand on now.",
        "key_verses": ["2 Samuel 22:17", "2 Samuel 22:31"],
    },
    {
        "name": "The singers before the army",
        "group": "Songs of victory",
        "testament": "Old",
        "epithet": "Praise the LORD; for his mercy endureth for ever",
        "by": [{"name": "The Levite singers"}],
        "with": [{"name": "King Jehoshaphat"}, {"name": "The army of Judah"}],
        "occasion": "A vast army of Moab, Ammon and mount Seir marching on Judah",
        "where": "The wilderness of Tekoa",
        "told_in": "2 Chronicles 20:1-30",
        "also_in": ["Psalms 136:1-3"],
        "sung": ["2 Chronicles 20:21"],
        "summary": "Facing an army far bigger than his own, King Jehoshaphat sent singers out in front of his soldiers. As they began to praise, the LORD routed the enemy.",
        "story": (
            "A great multitude was coming against Judah. Jehoshaphat proclaimed a fast and prayed, "
            "'neither know we what to do: but our eyes are upon thee.' A Levite stood up with God's "
            "answer: 'Be not afraid nor dismayed by reason of this great multitude'. Next morning "
            "the king 'appointed singers unto the LORD, and that should praise the beauty of "
            "holiness, as they went out before the army'. 'And when they began to sing and to "
            "praise, the LORD set ambushments' against the invaders, and they turned on one another. "
            "Judah spent three days gathering the spoil, and came home to Jerusalem with psalteries, "
            "harps and trumpets."),
        "meaning": (
            "Judah went into battle with praise at the front, trusting God before they saw the "
            "victory. Their song, 'his mercy endureth for ever', is the refrain of Psalm 136, sung "
            "in every one of its twenty-six verses."),
        "lesson": "When you do not know what to do, keep your eyes on God, and praise him before the answer comes.",
        "key_verses": ["2 Chronicles 20:12", "2 Chronicles 20:22"],
    },
    # ------------------------------------------------------------------ worship and thanksgiving
    {
        "name": "Hannah's song",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "My heart rejoiceth in the LORD",
        "by": [{"name": "Hannah", "hero": "hannah"}],
        "with": [{"name": "Samuel", "hero": "samuel"}, {"name": "Eli the priest"}],
        "occasion": "Giving her young son Samuel to serve the LORD",
        "where": "The house of the LORD at Shiloh",
        "told_in": "1 Samuel 2:1-10",
        "also_in": ["1 Samuel 1:1-28", "Luke 1:46-55"],
        "sung": ["1 Samuel 2:1-2"],
        "summary": "Hannah, once mocked for having no children, brought her son Samuel to Shiloh and sang of the God who lifts up the poor and brings down the proud.",
        "story": (
            "Year after year Hannah wept at Shiloh because she had no child, while her rival "
            "provoked her. She prayed so hard that Eli the priest thought she was drunk. God gave "
            "her a son, and when Samuel was weaned she brought him to Eli, as she had vowed: 'For "
            "this child I prayed'. Then she sang: 'My heart rejoiceth in the LORD'. Her song reaches "
            "far beyond one family: the LORD 'bringeth low, and lifteth up', raises the poor from "
            "the dust, and will 'exalt the horn of his anointed.'"),
        "meaning": (
            "Hannah sings of the LORD's king, his anointed, before Israel had any king at all. The "
            "word “anointed” becomes Messiah in Hebrew and Christ in Greek. A thousand years later "
            "Mary sang a song so like Hannah's that the two are always read together "
            "(Luke 1:46-55)."),
        "lesson": "God sees the one who weeps in the corner. He is the God who turns things upside down: the proud brought low, the humble lifted up.",
        "key_verses": ["1 Samuel 2:7", "1 Samuel 2:10"],
    },
    {
        "name": "The song of the well",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "Spring up, O well",
        "by": [{"name": "The children of Israel"}],
        "with": [{"name": "Moses", "hero": "moses"}, {"name": "The princes of Israel"}],
        "occasion": "God giving water in the wilderness",
        "where": "Beer, on the way to the promised land",
        "told_in": "Numbers 21:16-18",
        "also_in": ["Numbers 21:4-9"],
        "sung": ["Numbers 21:17"],
        "summary": "In the wilderness God promised water, and as the leaders dug the well with their staffs, Israel sang to it.",
        "story": (
            "Near the end of the forty years, Israel came to a place called Beer, which means "
            "“well”. There the LORD said to Moses, 'Gather the people together, and I will give "
            "them water.' So the leaders dug, and the people sang: 'Spring up, O well; sing ye unto "
            "it: The princes digged the well, the nobles of the people digged it, by the direction "
            "of the lawgiver, with their staves.'"),
        "meaning": (
            "Only a little earlier Israel had grumbled about water and been bitten by fiery "
            "serpents (Numbers 21:4-9). Now they sing instead of complain. It is a work song, sung "
            "with digging sticks in hand, and one of the few scraps of Israel's everyday songs to "
            "survive."),
        "lesson": "Sing while you work for what God has promised. Thankfulness turns the same wilderness into a different journey.",
        "key_verses": ["Numbers 21:16"],
    },
    {
        "name": "David's psalm for the ark",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "Give thanks unto the LORD, call upon his name",
        "by": [{"name": "David", "hero": "david"}, {"name": "Asaph and his brethren"}],
        "with": [{"name": "The Levite singers and musicians"}],
        "occasion": "The ark of God brought up to Jerusalem",
        "where": "The tent David pitched for the ark in Jerusalem",
        "told_in": "1 Chronicles 16:1-36",
        "also_in": ["1 Chronicles 15:16-28", "2 Samuel 6:12-19", "Psalms 105:1-15", "Psalms 96:1-13"],
        "sung": ["1 Chronicles 16:8", "1 Chronicles 16:34"],
        "summary": "When the ark came up to Jerusalem with shouting, trumpets and dancing, David gave Asaph a psalm of thanks for all the people to sing.",
        "story": (
            "The first attempt to move the ark ended in death, because it was carried the wrong "
            "way. The second time the Levites carried it, with singers, cymbals, harps and "
            "trumpets, and David danced before the LORD. When the ark was set in its tent, 'David "
            "delivered first this psalm to thank the LORD into the hand of Asaph and his brethren.' "
            "It calls Israel to remember God's covenant, calls the whole world to 'Sing unto the "
            "LORD, all the earth', and ends with a line Israel would sing for centuries: 'O give "
            "thanks unto the LORD; for he is good; for his mercy endureth for ever.'"),
        "meaning": (
            "David left Asaph and his brethren 'to minister before the ark continually' "
            "(1 Chronicles 16:37). This was the beginning of the temple choirs, and parts of this "
            "very psalm are sung again in Psalms 96, 105 and 106."),
        "lesson": "Joy in God is meant to be shared. David did not keep his thanks to himself; he gave it to a choir.",
        "key_verses": ["1 Chronicles 16:23", "1 Chronicles 16:29"],
    },
    {
        "name": "The glory fills the temple",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "For he is good; for his mercy endureth for ever",
        "by": [{"name": "The Levite singers and the trumpeters"}],
        "with": [{"name": "King Solomon"}, {"name": "Asaph, Heman and Jeduthun"}],
        "occasion": "The ark brought into Solomon's new temple",
        "where": "The temple in Jerusalem",
        "told_in": "2 Chronicles 5:11-14",
        "also_in": ["1 Kings 8:10-11", "2 Chronicles 7:1-3"],
        "sung": ["2 Chronicles 5:13"],
        "summary": "At the dedication of Solomon's temple, a hundred and twenty trumpeters and the singers made one sound, and the glory of the LORD filled the house as a cloud.",
        "story": (
            "When the ark was brought into Solomon's temple, the Levite singers stood at the east "
            "end of the altar in white linen with cymbals, psalteries and harps, and with them 'an "
            "hundred and twenty priests sounding with trumpets'. They sang together 'as one, to "
            "make one sound', praising the LORD: 'For he is good; for his mercy endureth for ever'. "
            "At that moment 'the house was filled with a cloud', and 'the priests could not stand to "
            "minister by reason of the cloud: for the glory of the LORD had filled the house of "
            "God.'"),
        "meaning": (
            "God answered a song with his presence. The people sang the same words again when fire "
            "fell from heaven on Solomon's sacrifices (2 Chronicles 7:3)."),
        "lesson": "Worship that is united and wholehearted makes room for God. When his people sing as one, he draws near.",
        "key_verses": ["2 Chronicles 5:14", "2 Chronicles 7:3"],
    },
    {
        "name": "Shouts and tears at the foundation",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "Because he is good, for his mercy endureth for ever",
        "by": [{"name": "The priests and Levites"}],
        "with": [{"name": "Zerubbabel and Jeshua"}, {"name": "The exiles home from Babylon"}],
        "occasion": "Laying the foundation of the second temple after the exile",
        "where": "The ruins of the temple in Jerusalem",
        "told_in": "Ezra 3:8-13",
        "also_in": ["Haggai 2:1-9"],
        "sung": ["Ezra 3:11"],
        "summary": "When the exiles home from Babylon laid the new temple's foundation, the young shouted for joy and the old wept, and no one could tell the two sounds apart.",
        "story": (
            "Back from Babylon, the builders laid the foundation of the LORD's house, and the "
            "priests with trumpets and the sons of Asaph with cymbals praised God 'after the "
            "ordinance of David king of Israel'. 'And they sang together by course in praising and "
            "giving thanks unto the LORD; because he is good, for his mercy endureth for ever "
            "toward Israel.' But the old men who had seen Solomon's temple 'wept with a loud "
            "voice', while many shouted for joy, 'So that the people could not discern the noise of "
            "the shout of joy from the noise of the weeping of the people'."),
        "meaning": (
            "The new foundation looked small beside the memory of the old. Through the prophet "
            "Haggai, God answered the weeping: 'The glory of this latter house shall be greater "
            "than of the former' (Haggai 2:9)."),
        "lesson": "Joy and grief can share one song. Do not despise small beginnings; God's best may still be ahead.",
        "key_verses": ["Haggai 2:9"],
    },
    {
        "name": "The joy of Jerusalem",
        "group": "Worship and thanksgiving",
        "testament": "Old",
        "epithet": "The joy of Jerusalem was heard even afar off",
        "by": [{"name": "Two great choirs of the Levites"}],
        "with": [{"name": "Nehemiah", "hero": "nehemiah"}, {"name": "Ezra the scribe"}],
        "occasion": "Dedicating the rebuilt wall of Jerusalem",
        "where": "On top of the walls of Jerusalem",
        "told_in": "Nehemiah 12:27-43",
        "also_in": ["Nehemiah 8:9-12"],
        "summary": "When the broken walls were rebuilt, Nehemiah set two great choirs walking along the top of them in opposite directions, singing, until they met at the temple.",
        "story": (
            "The Levites were fetched from all their villages 'to keep the dedication with "
            "gladness, both with thanksgivings, and with singing, with cymbals, psalteries, and "
            "with harps.' Nehemiah divided the leaders and singers into two great companies. One "
            "went one way along the top of the wall, led by Ezra the scribe; the other went the "
            "other way, with Nehemiah behind it. They met at the house of God, where 'the singers "
            "sang loud'. 'God had made them rejoice with great joy: the wives also and the children "
            "rejoiced: so that the joy of Jerusalem was heard even afar off.'"),
        "meaning": (
            "Enemies had jeered that if a fox climbed the wall it would fall down (Nehemiah 4:3). "
            "Now the finished wall carried a choir. Earlier Nehemiah had told the people, 'the joy "
            "of the LORD is your strength' (Nehemiah 8:10)."),
        "lesson": "Finish the work, then celebrate it with God. Joy that is shared carries a long way.",
        "key_verses": ["Nehemiah 12:43", "Nehemiah 8:10"],
    },
    {
        "name": "A hymn after the Last Supper",
        "group": "Worship and thanksgiving",
        "testament": "New",
        "epithet": "When they had sung an hymn",
        "by": [{"name": "Jesus and his disciples"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "occasion": "The end of the Passover meal on the night Jesus was betrayed",
        "where": "The upper room in Jerusalem",
        "told_in": "Matthew 26:26-30",
        "also_in": ["Mark 14:22-26", "Psalms 118:19-29"],
        "summary": "On the night he was betrayed, Jesus ended the Last Supper by singing with his disciples, then walked out to the mount of Olives.",
        "story": (
            "Jesus took bread and a cup and gave them to his disciples as his body and his blood. "
            "Then, 'when they had sung an hymn, they went out into the mount of Olives.' The Gospels "
            "do not give the words. At Passover, Jewish families sang the Hallel, Psalms 113 to "
            "118, and many think this was the hymn. If so, among the last words Jesus sang before "
            "the cross were 'The stone which the builders refused is become the head stone of the "
            "corner' and 'This is the day which the LORD hath made; we will rejoice and be glad in "
            "it.'"),
        "meaning": (
            "Jesus knew what the night held, and he sang anyway. If the hymn was Psalm 118, he "
            "went to Gethsemane singing that God's 'mercy endureth for ever'."),
        "lesson": "Singing is not only for good days. Jesus sang on the darkest night of his life.",
        "key_verses": ["Matthew 26:30", "Psalms 118:24"],
    },
    {
        "name": "Paul and Silas at midnight",
        "group": "Worship and thanksgiving",
        "testament": "New",
        "epithet": "At midnight Paul and Silas prayed, and sang praises",
        "by": [{"name": "Paul", "hero": "paul"}, {"name": "Silas"}],
        "with": [{"name": "The Philippian jailer"}, {"name": "The other prisoners"}],
        "occasion": "Beaten and locked in the stocks for casting out a spirit",
        "where": "The inner prison at Philippi",
        "told_in": "Acts 16:22-34",
        "also_in": ["1 Thessalonians 2:2"],
        "summary": "Beaten, bleeding and fastened in the stocks, Paul and Silas sang praises to God at midnight. An earthquake opened the doors, and the jailer came to faith.",
        "story": (
            "After Paul cast a spirit of divination out of a slave girl, her masters dragged him "
            "and Silas before the magistrates. They were beaten with many stripes and thrown into "
            "the inner prison, their feet 'fast in the stocks'. 'And at midnight Paul and Silas "
            "prayed, and sang praises unto God: and the prisoners heard them.' Suddenly an "
            "earthquake shook the prison, the doors flew open and every chain came loose. The "
            "jailer drew his sword to kill himself, but Paul cried out, 'Do thyself no harm: for we "
            "are all here.' Trembling, the jailer asked, 'Sirs, what must I do to be saved?' "
            "'Believe on the Lord Jesus Christ, and thou shalt be saved, and thy house.'"),
        "meaning": (
            "Their song was sung in the dark, to God, and 'the prisoners heard them'. Praise in "
            "suffering became the jailer's doorway to faith, and his whole household was baptised "
            "that same night."),
        "lesson": "Someone is listening when you praise God in hard places. A midnight song can open more than prison doors.",
        "key_verses": ["Acts 16:25", "Acts 16:31"],
    },
    # ------------------------------------------------------------------ laments
    {
        "name": "The song of the bow",
        "group": "Laments",
        "testament": "Old",
        "epithet": "How are the mighty fallen!",
        "by": [{"name": "David", "hero": "david"}],
        "with": [{"name": "Saul", "hero": "saul"}, {"name": "Jonathan", "hero": "jonathan"}],
        "occasion": "The deaths of Saul and Jonathan on mount Gilboa",
        "where": "Ziklag, when the news came",
        "told_in": "2 Samuel 1:17-27",
        "also_in": ["1 Samuel 31:1-6"],
        "sung": ["2 Samuel 1:19", "2 Samuel 1:23", "2 Samuel 1:26"],
        "summary": "When Saul and his son Jonathan died in battle, David wrote a lament for them both: the king who had hunted him, and the friend who had loved him.",
        "story": (
            "A messenger brought David the news that Israel had fled before the Philistines and "
            "that Saul and Jonathan were dead. David tore his clothes, wept and fasted. Then he "
            "'lamented with this lamentation over Saul and over Jonathan his son', and had it "
            "taught to the people of Judah; it was written in the book of Jasher. Three times it "
            "cries, 'How are the mighty fallen'. It praises Saul without a word of bitterness, and "
            "it grieves for Jonathan: 'thy love to me was wonderful, passing the love of women.'"),
        "meaning": (
            "Saul had tried to kill David for years, yet David's song honours him: 'Saul and "
            "Jonathan were lovely and pleasant in their lives'. The book of Jasher is lost; this "
            "song survives because Scripture kept it."),
        "lesson": "Grief can be honest and gracious at once. David mourned an enemy without gloating, and a friend without holding back.",
        "key_verses": ["2 Samuel 1:25"],
    },
    {
        "name": "David's lament for Abner",
        "group": "Laments",
        "testament": "Old",
        "epithet": "Died Abner as a fool dieth?",
        "by": [{"name": "King David", "hero": "david"}],
        "with": [{"name": "Abner, Saul's general"}, {"name": "Joab"}],
        "occasion": "The murder of Abner by Joab",
        "where": "Hebron",
        "told_in": "2 Samuel 3:27-39",
        "sung": ["2 Samuel 3:33-34"],
        "summary": "When Joab murdered Abner in revenge, David walked behind the bier and sang a short lament, so all Israel would know the king had no part in it.",
        "story": (
            "Abner had led Saul's army against David, then came to Hebron to make peace and bring "
            "all Israel over to him. As he left, Joab, whose brother Abner had killed in battle, "
            "took him aside in the gate and stabbed him. David cursed the deed, ordered the people "
            "to mourn, and followed the bier himself. At the grave 'the king lifted up his voice, "
            "and wept', and sang: 'Died Abner as a fool dieth? Thy hands were not bound, nor thy "
            "feet put into fetters: as a man falleth before wicked men, so fellest thou.'"),
        "meaning": (
            "The lament told everyone that Abner died by treachery, not in fair battle, and that "
            "David grieved for him. 'For all the people and all Israel understood that day that it "
            "was not of the king to slay Abner' (2 Samuel 3:37)."),
        "lesson": "Mourn injustice openly, even when it seems to help you. Honour belongs to the dead, whichever side they were on.",
        "key_verses": ["2 Samuel 3:37", "2 Samuel 3:38"],
    },
    {
        "name": "The laments for Josiah",
        "group": "Laments",
        "testament": "Old",
        "epithet": "All Judah and Jerusalem mourned for Josiah",
        "by": [{"name": "Jeremiah"}, {"name": "The singing men and singing women"}],
        "with": [{"name": "Josiah", "hero": "josiah"}],
        "occasion": "The death of good King Josiah in battle at Megiddo",
        "where": "Jerusalem",
        "told_in": "2 Chronicles 35:20-27",
        "also_in": ["2 Kings 23:29-30", "Zechariah 12:10-11"],
        "summary": "When Josiah, the best of Judah's later kings, was killed at Megiddo, Jeremiah wrote laments for him, and singers sang them for generations.",
        "story": (
            "Pharaoh Necho was marching north, and Josiah went out to fight him, though Necho "
            "warned him not to. Archers shot the king at Megiddo; his servants carried him back to "
            "Jerusalem in his second chariot, and he died. 'And all Judah and Jerusalem mourned for "
            "Josiah. And Jeremiah lamented for Josiah: and all the singing men and the singing "
            "women spake of Josiah in their lamentations to this day, and made them an ordinance in "
            "Israel'."),
        "meaning": (
            "The words of these laments are lost; they were 'written in the lamentations', a "
            "collection we no longer have. The grief was remembered for a long time: Zechariah "
            "speaks of a great mourning 'as the mourning of Hadadrimmon in the valley of Megiddon' "
            "(Zechariah 12:11), which many take to mean the mourning for Josiah."),
        "lesson": "Good leaders are a gift, and it is right to grieve them. Laments help a whole people remember.",
        "key_verses": ["2 Chronicles 35:25", "Zechariah 12:10"],
    },
    {
        "name": "By the rivers of Babylon",
        "group": "Laments",
        "testament": "Old",
        "epithet": "How shall we sing the LORD's song in a strange land?",
        "by": [{"name": "An exile in Babylon"}],
        "with": [{"name": "The Babylonian captors"}],
        "occasion": "Israel in exile after Jerusalem was destroyed",
        "where": "By the rivers of Babylon",
        "told_in": "Psalms 137:1-9",
        "also_in": ["2 Kings 25:8-11", "Psalms 126:1-6"],
        "sung": ["Psalms 137:1-3", "Psalms 137:5"],
        "summary": "Captives in Babylon hung their harps on the willows when their captors demanded a cheerful song from Zion.",
        "story": (
            "Jerusalem and its temple had been burned, and the survivors carried off to Babylon. "
            "There, by the rivers and canals, 'we sat down, yea, we wept, when we remembered Zion.' "
            "Their captors mocked them: 'Sing us one of the songs of Zion.' They could not. They "
            "hung up their harps and swore never to forget Jerusalem: 'If I forget thee, O "
            "Jerusalem, let my right hand forget her cunning.' The psalm ends in raw anger, crying "
            "out for judgement on Edom and Babylon."),
        "meaning": (
            "The Bible makes room for grief that cannot sing. Its harsh last lines are a prayer, not "
            "an act: the psalmist hands his fury to God instead of taking revenge himself. Seventy "
            "years later God brought the exiles home, and 'then was our mouth filled with laughter, "
            "and our tongue with singing' (Psalm 126:2)."),
        "lesson": "You do not have to pretend in front of God. Bring him your tears, and even your anger; he knows how to answer them.",
        "key_verses": ["Psalms 126:1-2"],
    },
    {
        "name": "Great is thy faithfulness",
        "group": "Laments",
        "testament": "Old",
        "epithet": "They are new every morning",
        "by": [{"name": "Jeremiah, by tradition"}],
        "with": [{"name": "The survivors in Jerusalem"}],
        "occasion": "The fall of Jerusalem to Babylon",
        "where": "The ruined city of Jerusalem",
        "told_in": "Lamentations 3:1-33",
        "also_in": ["Lamentations 1:1-2"],
        "sung": ["Lamentations 3:21", "Lamentations 3:23-26"],
        "summary": "Lamentations is five poems of grief over fallen Jerusalem. At its very centre, in the darkest place, the poet remembers that God's mercies are new every morning.",
        "story": (
            "The book opens with the city sitting alone: 'How doth the city sit solitary, that was "
            "full of people!' Four of its five poems are acrostics, each verse or group of verses "
            "beginning with the next letter of the Hebrew alphabet, as if grief were being set in "
            "order from A to Z. In chapter 3 one man speaks of darkness, walls and chains, until he "
            "turns: 'This I recall to my mind, therefore have I hope.' His hope is God's "
            "compassion: 'They are new every morning: great is thy faithfulness.'"),
        "meaning": (
            "The hope sits at the very middle of the book, with ruin on every side. Nothing has "
            "changed outside; what changes is what the poet calls to mind. The hymn “Great Is Thy "
            "Faithfulness” takes its words from here."),
        "lesson": "On the worst morning of your life, God's mercy is new that morning too. Remember it on purpose.",
        "key_verses": ["Lamentations 3:31-33"],
    },
    {
        "name": "My God, my God",
        "group": "Laments",
        "testament": "Old",
        "epithet": "Why hast thou forsaken me?",
        "by": [{"name": "David", "hero": "david"}],
        "with": [{"name": "Jesus, who prayed it on the cross"}],
        "occasion": "A cry of abandonment, later prayed by Jesus on the cross",
        "where": "Sung in Israel; cried out at Golgotha",
        "told_in": "Psalms 22:1-31",
        "also_in": ["Matthew 27:35-46", "John 19:23-24", "Hebrews 2:12"],
        "sung": ["Psalms 22:1", "Psalms 22:16-18"],
        "summary": "David's psalm begins in utter abandonment and ends in praise that reaches the ends of the earth. Jesus prayed its first line from the cross.",
        "story": (
            "The psalm opens with a cry: 'My God, my God, why hast thou forsaken me?' The sufferer "
            "is mocked and surrounded, his strength poured out like water; 'they pierced my hands "
            "and my feet', and 'They part my garments among them, and cast lots upon my vesture.' "
            "Then it turns to praise: 'All the ends of the world shall remember and turn unto the "
            "LORD'. At the ninth hour on the cross Jesus 'cried with a loud voice, saying, Eli, Eli, "
            "lama sabachthani?' while below him the soldiers had cast lots for his clothes."),
        "meaning": (
            "John saw the psalm fulfilled word for word: the soldiers divided his garments and cast "
            "lots for his coat, 'that the scripture might be fulfilled' (John 19:24). By praying its "
            "first line, Jesus took the whole psalm on his lips, from its darkness to its hope."),
        "lesson": "It is not unbelief to ask God “why?”. Jesus did, and the psalm he prayed ends in victory.",
        "key_verses": ["Matthew 27:46", "John 19:24"],
    },
    {
        "name": "Out of the depths",
        "group": "Laments",
        "testament": "Old",
        "epithet": "Out of the depths have I cried unto thee, O LORD",
        "by": [{"name": "A pilgrim psalmist"}],
        "occasion": "A plea for forgiveness from the depths of guilt",
        "where": "One of the Songs of degrees, sung on the way up to Jerusalem",
        "told_in": "Psalms 130:1-8",
        "sung": ["Psalms 130:1-5"],
        "summary": "Sung by pilgrims on the way up to Jerusalem, this psalm cries to God from the depths and waits for him as a watchman waits for the morning.",
        "story": (
            "The singer is in deep water, and the depths are not only trouble but sin: 'If thou, "
            "LORD, shouldest mark iniquities, O Lord, who shall stand? But there is forgiveness with "
            "thee'. So he waits, 'more than they that watch for the morning', and calls all Israel "
            "to hope, for 'with the LORD there is mercy, and with him is plenteous redemption.'"),
        "meaning": (
            "Its answer to guilt is not denial but forgiveness. Martin Luther counted it among the "
            "psalms that teach the gospel most plainly, and it has comforted troubled consciences "
            "for centuries."),
        "lesson": "No depth is too deep for prayer. God does not keep a record we cannot survive; with him there is forgiveness.",
        "key_verses": ["Psalms 130:7"],
    },
]
