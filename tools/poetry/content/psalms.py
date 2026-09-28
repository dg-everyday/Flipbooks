"""Psalms and songs of wisdom, and songs of the prophets.

Same fields as history.py.
"""

PSALMS = [
    # ------------------------------------------------------------------ psalms and songs of wisdom
    {
        "name": "The two ways",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "Blessed is the man",
        "by_label": "Written by",
        "by": [{"name": "A psalmist whose name is not given"}],
        "occasion": "The doorway into the book of Psalms",
        "where": "Psalm 1, Israel's songbook",
        "told_in": "Psalms 1:1-6",
        "also_in": ["Jeremiah 17:7-8"],
        "sung": ["Psalms 1:1-3"],
        "summary": "The first psalm opens Israel's songbook with two roads: the blessed person rooted in God's word like a tree, and the ungodly blown away like chaff.",
        "story": (
            "The Psalms are 150 songs and prayers, gathered over about a thousand years into five "
            "books. The first sets the tone. Blessed is the one who does not walk with the ungodly, "
            "but whose 'delight is in the law of the LORD'. That person is 'like a tree planted by "
            "the rivers of water'. The ungodly 'are like the chaff which the wind driveth away.'"),
        "meaning": (
            "Before Israel sang its praises and laments, it was shown where happiness is found: in "
            "God's word, taken in day and night. Jeremiah uses the same picture of a tree planted by "
            "the waters (Jeremiah 17:8)."),
        "lesson": "What you delight in is what you become. Put your roots down in God's word.",
        "key_verses": ["Jeremiah 17:7-8"],
    },
    {
        "name": "The LORD is my shepherd",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "I shall not want",
        "by_label": "Written by",
        "by": [{"name": "David", "hero": "david"}],
        "occasion": "A shepherd king's song of trust",
        "where": "Psalm 23",
        "told_in": "Psalms 23:1-6",
        "also_in": ["John 10:11-14", "1 Peter 2:25", "Revelation 7:17"],
        "sung": ["Psalms 23:1-2", "Psalms 23:4"],
        "summary": "The best-loved psalm of all: David, once a shepherd boy, sings of the LORD as his shepherd, through green pastures and the darkest valley to the house of the LORD.",
        "story": (
            "David had kept his father's sheep, fighting off a lion and a bear (1 Samuel "
            "17:34-35). Here he pictures himself as the sheep: led to 'green pastures' and 'still "
            "waters', and through 'the valley of the shadow of death' without fear, 'for thou art "
            "with me'. Halfway through, the shepherd becomes a host who spreads a table in front of "
            "enemies, and the song ends with goodness and mercy following all the days of life."),
        "meaning": (
            "Jesus took the title for himself: 'I am the good shepherd: the good shepherd giveth his "
            "life for the sheep' (John 10:11). The psalm is read at countless bedsides and "
            "funerals, because it walks with us through the valley rather than around it."),
        "lesson": "You are not alone in the valley. The Shepherd does not always lead us around the dark places, but he goes through them with us.",
        "key_verses": ["John 10:11", "Revelation 7:17"],
    },
    {
        "name": "God is our refuge",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "A very present help in trouble",
        "by_label": "Written by",
        "by": [{"name": "The sons of Korah"}],
        "occasion": "Trust in God when the world is shaking",
        "where": "Psalm 46",
        "told_in": "Psalms 46:1-11",
        "sung": ["Psalms 46:1-2", "Psalms 46:10"],
        "summary": "Though the earth shakes and the nations rage, the city of God stands, because God is in the midst of her: 'Be still, and know that I am God'.",
        "story": (
            "The psalm pictures the worst: mountains falling into the sea, waters roaring, nations "
            "in uproar and kingdoms tottering. Against all that stands a quiet river, 'the streams "
            "whereof shall make glad the city of God'. God speaks once, and the earth melts. Then "
            "comes the command: 'Be still, and know that I am God'. Twice the refrain sounds: 'The "
            "LORD of hosts is with us; the God of Jacob is our refuge.'"),
        "meaning": (
            "Martin Luther built his hymn “A Mighty Fortress Is Our God” on this psalm. “Be still” "
            "is not a call to relax but to stop struggling and see who is God."),
        "lesson": "When everything shakes, stand still in God. He is not a distant help but a very present one.",
        "key_verses": ["Psalms 46:7"],
    },
    {
        "name": "Create in me a clean heart",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "Have mercy upon me, O God",
        "by_label": "Written by",
        "by": [{"name": "David", "hero": "david"}],
        "with": [{"name": "Nathan the prophet"}, {"name": "Bathsheba"}],
        "occasion": "After Nathan confronted David over Bathsheba and Uriah",
        "where": "Psalm 51, written in Jerusalem",
        "told_in": "Psalms 51:1-19",
        "also_in": ["2 Samuel 12:1-13"],
        "sung": ["Psalms 51:1-2", "Psalms 51:10-12"],
        "summary": "David's prayer of repentance after he took Bathsheba and had her husband killed, written when the prophet Nathan confronted him.",
        "story": (
            "David took Bathsheba, then arranged for her husband Uriah to die in battle. The prophet "
            "Nathan told him a story about a rich man who stole a poor man's only lamb. David was "
            "furious, and Nathan said, 'Thou art the man.' David answered, 'I have sinned against "
            "the LORD.' The psalm is that confession set to music. It hides nothing: 'my sin is ever "
            "before me'. And it asks for more than pardon: 'Create in me a clean heart, O God; and "
            "renew a right spirit within me.'"),
        "meaning": (
            "God wants a humble heart more than any offering: 'The sacrifices of God are a broken "
            "spirit: a broken and a contrite heart, O God, thou wilt not despise.' A king's public "
            "sin became a prayer that sinners have prayed ever since."),
        "lesson": "No sin is too great to confess. God does not despise a broken heart; he makes it clean.",
        "key_verses": ["Psalms 51:17", "2 Samuel 12:13"],
    },
    {
        "name": "Teach us to number our days",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "LORD, thou hast been our dwelling place",
        "by_label": "Written by",
        "by": [{"name": "Moses", "hero": "moses"}],
        "occasion": "The shortness of life, seen from the wilderness years",
        "where": "Psalm 90",
        "told_in": "Psalms 90:1-17",
        "also_in": ["2 Peter 3:8"],
        "sung": ["Psalms 90:1-2", "Psalms 90:12"],
        "summary": "Headed “A Prayer of Moses the man of God”, this psalm sets our short lives against God's eternity and asks for wisdom to use our days well.",
        "story": (
            "Moses had watched a whole generation die in the wilderness. He sings of a God who was "
            "there 'from everlasting to everlasting', for whom 'a thousand years in thy sight are "
            "but as yesterday when it is past'. Our lives are like grass, green in the morning and "
            "cut down by evening; 'we spend our years as a tale that is told.' So he prays: 'So "
            "teach us to number our days, that we may apply our hearts unto wisdom.'"),
        "meaning": (
            "If its heading is right, it is the oldest song in the Psalms. Isaac Watts turned it "
            "into the hymn “O God, Our Help in Ages Past”. Peter echoes it: 'one day is with the "
            "Lord as a thousand years' (2 Peter 3:8)."),
        "lesson": "Life is short, and God is eternal. Count your days, not to fear them, but to spend them wisely.",
        "key_verses": ["2 Peter 3:8"],
    },
    {
        "name": "Under his wings",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "He that dwelleth in the secret place of the most High",
        "by_label": "Written by",
        "by": [{"name": "A psalmist whose name is not given"}],
        "with": [{"name": "Satan, who quoted it to Jesus", "hero": "satan"}],
        "occasion": "A song of safety in God",
        "where": "Psalm 91",
        "told_in": "Psalms 91:1-16",
        "also_in": ["Matthew 4:5-7", "Luke 4:9-12"],
        "sung": ["Psalms 91:1-2", "Psalms 91:4"],
        "summary": "A song of shelter: whoever lives close to God is covered by his feathers, safe from the terror by night and the arrow by day.",
        "story": (
            "The psalm moves from the singer's trust, 'I will say of the LORD, He is my refuge', to "
            "God's own promise at the end: 'Because he hath set his love upon me, therefore will I "
            "deliver him'. Between them is every danger, 'the terror by night', 'the arrow that "
            "flieth by day', pestilence and plague, lions and serpents, and the promise that 'he "
            "shall give his angels charge over thee'."),
        "meaning": (
            "Satan quoted this psalm to Jesus in the wilderness, urging him to throw himself down "
            "from the temple. Jesus answered, 'It is written again, Thou shalt not tempt the Lord "
            "thy God' (Matthew 4:7). The psalm is a promise to trust, not a dare to test God."),
        "lesson": "Shelter in God, but do not test him. His protection is for those who live close to him.",
        "key_verses": ["Psalms 91:11", "Matthew 4:7"],
    },
    {
        "name": "Make a joyful noise",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "Serve the LORD with gladness",
        "by_label": "Written by",
        "by": [{"name": "A psalmist whose name is not given"}],
        "occasion": "A call to come into God's courts with thanks",
        "where": "Psalm 100",
        "told_in": "Psalms 100:1-5",
        "sung": ["Psalms 100:1-4"],
        "summary": "Five verses calling all lands into God's presence with singing, because he made us and we are his sheep.",
        "story": (
            "Every line is an invitation: make a joyful noise, serve with gladness, come with "
            "singing, enter his gates with thanksgiving. The reason is simple: 'it is he that hath "
            "made us, and not we ourselves; we are his people, and the sheep of his pasture.' It "
            "was probably sung as worshippers came through the temple gates with their thank "
            "offerings."),
        "meaning": (
            "It calls 'all ye lands', not only Israel, to worship. William Kethe's “All People "
            "That on Earth Do Dwell”, sung to the tune Old Hundredth, has carried it into churches "
            "for more than four hundred years."),
        "lesson": "Worship starts with knowing whose we are. We did not make ourselves; we belong to the Shepherd.",
    },
    {
        "name": "Thy word is a lamp",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "A lamp unto my feet, and a light unto my path",
        "by_label": "Written by",
        "by": [{"name": "A psalmist whose name is not given"}],
        "occasion": "A long love song to God's word",
        "where": "Psalm 119",
        "told_in": "Psalms 119:1-176",
        "sung": ["Psalms 119:11", "Psalms 119:105"],
        "summary": "The longest chapter in the Bible: 176 verses in 22 stanzas, one for each letter of the Hebrew alphabet, and almost every verse about God's word.",
        "story": (
            "Each stanza has eight verses, and every verse in a stanza begins with the same Hebrew "
            "letter, from aleph to tau; many Bibles print the letter names as headings. The singer "
            "has many words for God's word, his law, testimonies, precepts, statutes, commandments "
            "and judgments, and he loves them all: 'O how love I thy law! it is my meditation all "
            "the day.' He hides it in his heart to keep from sin, and walks by it in the dark: 'Thy "
            "word is a lamp unto my feet, and a light unto my path.'"),
        "meaning": (
            "Psalm 119 shows that loving God's word is delight, not dry duty. It is honest too: the "
            "singer is afflicted and persecuted, 'like a bottle in the smoke' (Psalm 119:83), and "
            "God's word is what holds him."),
        "lesson": "Take God's word in slowly, verse by verse. A lamp shows only the next step, and that is enough.",
        "key_verses": ["Psalms 119:97", "Psalms 119:130"],
    },
    {
        "name": "I will lift up mine eyes",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "From whence cometh my help",
        "by": [{"name": "Pilgrims going up to Jerusalem"}],
        "occasion": "Setting out for the feasts at Jerusalem",
        "where": "Psalm 121, one of the Songs of degrees",
        "told_in": "Psalms 121:1-8",
        "also_in": ["Psalms 120:1-7", "Psalms 134:1-3"],
        "sung": ["Psalms 121:1-3"],
        "summary": "One of fifteen Songs of degrees (Psalms 120 to 134), sung by pilgrims climbing to Jerusalem, it promises that the LORD who made heaven and earth never sleeps.",
        "story": (
            "Three times a year Israelites went up to Jerusalem for the feasts, and the road "
            "climbed through hills where robbers could hide. 'I will lift up mine eyes unto the "
            "hills, from whence cometh my help. My help cometh from the LORD, which made heaven and "
            "earth.' The song answers every fear of the road: he will not let your foot slip, 'he "
            "that keepeth Israel shall neither slumber nor sleep', and neither sun by day nor moon "
            "by night shall strike you."),
        "meaning": (
            "In eight short verses the song says six times that God keeps or preserves. It ends "
            "with a blessing for every journey: 'The LORD shall preserve thy going out and thy "
            "coming in from this time forth, and even for evermore.'"),
        "lesson": "Look up, past the hills, to the One who made them. He watches your going out and coming in, and he never sleeps.",
        "key_verses": ["Psalms 121:4", "Psalms 121:7"],
    },
    {
        "name": "Let every thing that hath breath",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "Praise ye the LORD",
        "by_label": "Written by",
        "by": [{"name": "A psalmist whose name is not given"}],
        "occasion": "The great finale of the Psalms",
        "where": "Psalm 150",
        "told_in": "Psalms 150:1-6",
        "also_in": ["Revelation 19:1-6"],
        "sung": ["Psalms 150:3-6"],
        "summary": "The last psalm is pure praise: every instrument, every place and every living thing called to praise the LORD.",
        "story": (
            "The Psalms have travelled through tears, anger, confession and fear. They end with no "
            "complaint at all. Thirteen times in six verses comes the word praise: in his sanctuary "
            "and in the heavens, for his mighty acts, with trumpet, psaltery and harp, timbrel and "
            "dance, strings and organs, loud cymbals and high sounding cymbals. The last line calls "
            "on everything alive: 'Let every thing that hath breath praise the LORD. Praise ye the "
            "LORD.'"),
        "meaning": (
            "“Praise ye the LORD” is Hallelujah in Hebrew. The Psalms, full of honest struggle, end "
            "in praise, and so does the story of the Bible (Revelation 19:6)."),
        "lesson": "If you have breath, you have both a reason and the means to praise. Whatever your song today, it is heading for hallelujah.",
        "key_verses": ["Revelation 19:6"],
    },
    {
        "name": "The Song of Songs",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "Love is strong as death",
        "by_label": "Written by",
        "by": [{"name": "Solomon, by its title"}],
        "with": [{"name": "The bride and her beloved"}, {"name": "The daughters of Jerusalem"}],
        "occasion": "A love song between a bride and her beloved",
        "where": "Vineyards, gardens and the hills of Israel",
        "told_in": "Song of Solomon 2:8-17",
        "also_in": ["Song of Solomon 8:6-7", "Ephesians 5:25-32"],
        "sung": ["Song of Solomon 2:10-12", "Song of Solomon 8:7"],
        "summary": "The Bible's own love song: a bride and her beloved delight in each other in poetry full of gardens, vineyards and springtime.",
        "story": (
            "'The song of songs' means the finest song of all. Its voices are a young woman, her "
            "beloved and a chorus of friends. He calls her out into the spring: 'Rise up, my love, "
            "my fair one, and come away. For, lo, the winter is past, the rain is over and gone'. "
            "Near the end she speaks the book's great line, 'love is strong as death', and adds, "
            "'Many waters cannot quench love, neither can the floods drown it'."),
        "meaning": (
            "God made love between husband and wife, and the Bible celebrates it without "
            "embarrassment. Jews and Christians have also read the Song as a picture of God's love "
            "for his people, and Paul speaks of marriage as a picture of 'Christ and the church' "
            "(Ephesians 5:32)."),
        "lesson": "Love is God's gift, strong and faithful. Protect it, treasure it, and see in it a glimpse of how God loves.",
        "key_verses": ["Song of Solomon 8:6", "Ephesians 5:25"],
    },
    {
        "name": "Solomon's thousand and five songs",
        "group": "Psalms and songs of wisdom",
        "testament": "Old",
        "epithet": "His songs were a thousand and five",
        "by_label": "Written by",
        "by": [{"name": "Solomon"}],
        "with": [{"name": "Ethan, Heman, Chalcol and Darda, the famous wise men"}],
        "occasion": "The wisdom God gave Solomon",
        "where": "Jerusalem",
        "told_in": "1 Kings 4:29-34",
        "also_in": ["Psalms 72:1-19", "Psalms 127:1-5"],
        "summary": "Solomon wrote 1,005 songs and 3,000 proverbs. Almost all the songs are lost; a few survive in the Bible.",
        "story": (
            "God gave Solomon 'wisdom and understanding exceeding much, and largeness of heart, "
            "even as the sand that is on the sea shore.' He was wiser than the famous wise men of "
            "his day, 'And he spake three thousand proverbs: and his songs were a thousand and "
            "five.' He wrote about trees, from the cedar of Lebanon to the hyssop growing out of a "
            "wall, and about beasts, birds, creeping things and fish, and people came from every "
            "nation to hear him."),
        "meaning": (
            "Of the 1,005 songs, the Bible keeps only a few: the Song of Songs and the two psalms "
            "that carry his name, Psalm 72 and Psalm 127, which says, 'Except the LORD build the "
            "house, they labour in vain that build it'. Heman and Ethan, the wise men Solomon "
            "surpassed, have a psalm each too (Psalms 88 and 89)."),
        "lesson": "Even great gifts can be lost; what lasts is what God keeps. Build your life with the LORD, or the labour is in vain.",
        "key_verses": ["1 Kings 4:32", "Psalms 127:1"],
    },
    # ------------------------------------------------------------------ songs of the prophets
    {
        "name": "The song of Moses",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "He is the Rock, his work is perfect",
        "by": [{"name": "Moses", "hero": "moses"}],
        "with": [{"name": "Joshua", "hero": "joshua"}, {"name": "All the congregation of Israel"}],
        "occasion": "Moses' farewell, just before his death",
        "where": "The plains of Moab, across the Jordan from the promised land",
        "told_in": "Deuteronomy 31:30-32:47",
        "also_in": ["Deuteronomy 31:19-22", "Romans 10:19", "Revelation 15:3"],
        "sung": ["Deuteronomy 32:1", "Deuteronomy 32:3-4"],
        "summary": "Before he died, Moses taught Israel a song to carry into the promised land: a witness to God's faithfulness, and to their unfaithfulness.",
        "story": (
            "God told Moses his people would turn to other gods once they were settled, and gave "
            "him a song so they could not forget: 'write ye this song for you, and teach it the "
            "children of Israel: put it in their mouths'. Moses spoke it 'in the ears of all the "
            "congregation of Israel', with Joshua beside him. It praises God as the Rock, remembers "
            "how he found Israel 'in a desert land' and carried them as an eagle carries its young, "
            "warns of the judgement their idols would bring, and ends in mercy: God 'will be "
            "merciful unto his land, and to his people.'"),
        "meaning": (
            "A song stays in the memory when laws are forgotten. Moses said of these words, 'it is "
            "not a vain thing for you; because it is your life' (Deuteronomy 32:47). Paul quotes it "
            "(Romans 10:19), and in Revelation the redeemed sing 'the song of Moses the servant of "
            "God, and the song of the Lamb'."),
        "lesson": "What we sing, we remember. Fill your memory with songs that tell the truth about God.",
        "key_verses": ["Deuteronomy 31:19", "Deuteronomy 32:47"],
    },
    {
        "name": "The song of the vineyard",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "A song of my beloved touching his vineyard",
        "by": [{"name": "Isaiah"}],
        "with": [{"name": "The people of Jerusalem and Judah"}],
        "occasion": "A love song that turns into a judgement on Israel",
        "where": "Jerusalem",
        "told_in": "Isaiah 5:1-7",
        "also_in": ["Matthew 21:33-44", "John 15:1-8"],
        "sung": ["Isaiah 5:1-2", "Isaiah 5:7"],
        "summary": "Isaiah began like a wedding singer, with a love song about a friend's vineyard, then revealed that the vineyard was Israel and its wild grapes were injustice.",
        "story": (
            "'Now will I sing to my wellbeloved a song of my beloved touching his vineyard.' The "
            "friend cleared a fruitful hill, planted the choicest vine, built a tower and a "
            "winepress, and waited, but 'it brought forth wild grapes.' Then the singer turns to his "
            "listeners and asks them to judge: 'What could have been done more to my vineyard, that "
            "I have not done in it?' The owner will pull down its wall and let it be trampled. The "
            "last line names it: 'For the vineyard of the LORD of hosts is the house of Israel'. He "
            "looked for justice and found oppression; for righteousness, and heard a cry."),
        "meaning": (
            "The song works like Nathan's story to David: the listeners agree with the verdict "
            "before they know it is about them. Jesus retold it as the parable of the wicked "
            "husbandmen (Matthew 21:33-44), and called himself 'the true vine' (John 15:1)."),
        "lesson": "God has done everything for his people, and he looks for fruit: justice and righteousness. The question is not how well we are planted, but what we bear.",
        "key_verses": ["Isaiah 5:4", "John 15:1"],
    },
    {
        "name": "With joy shall ye draw water",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "The LORD JEHOVAH is my strength and my song",
        "by": [{"name": "Isaiah"}],
        "occasion": "A song for the day of salvation",
        "where": "Jerusalem",
        "told_in": "Isaiah 12:1-6",
        "also_in": ["Exodus 15:2", "John 7:37-39"],
        "sung": ["Isaiah 12:1-3"],
        "summary": "After chapters of warning, Isaiah gives a short song for the day God's anger turns to comfort, echoing the song at the Red Sea.",
        "story": (
            "Isaiah has just promised a king from the family of Jesse, on whom the Spirit of the "
            "LORD will rest. Then he gives the people the song they will sing that day: 'O LORD, I "
            "will praise thee: though thou wast angry with me, thine anger is turned away, and thou "
            "comfortedst me.' Its middle line repeats Moses at the sea: 'the LORD JEHOVAH is my "
            "strength and my song; he also is become my salvation.' And it promises: 'Therefore "
            "with joy shall ye draw water out of the wells of salvation.'"),
        "meaning": (
            "The song ties the exodus to a greater salvation still to come. At the Feast of "
            "Tabernacles, a feast of water and harvest, Jesus stood and cried, 'If any man thirst, "
            "let him come unto me, and drink' (John 7:37)."),
        "lesson": "Salvation is a well, not a single cup. Keep drawing from it with joy.",
        "key_verses": ["John 7:37-38"],
    },
    {
        "name": "Hezekiah's song",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "The living, the living, he shall praise thee",
        "by_label": "Written by",
        "by": [{"name": "King Hezekiah", "hero": "hezekiah"}],
        "with": [{"name": "Isaiah"}],
        "occasion": "Healed of a deadly illness and given fifteen more years",
        "where": "Jerusalem",
        "told_in": "Isaiah 38:9-20",
        "also_in": ["Isaiah 38:1-8", "2 Kings 20:1-11"],
        "sung": ["Isaiah 38:17", "Isaiah 38:19-20"],
        "summary": "When God healed King Hezekiah of a mortal illness, he wrote a song about the fear of dying and the joy of being spared.",
        "story": (
            "Isaiah had told Hezekiah, 'Set thine house in order: for thou shalt die, and not "
            "live.' The king turned his face to the wall and wept, and God sent word that he would "
            "add fifteen years to his life, with a sign: the shadow on the sundial went back ten "
            "degrees. Afterwards Hezekiah wrote this song. He remembers feeling his life taken "
            "down like a shepherd's tent and cut off like cloth from a loom, and chattering 'Like "
            "a crane or a swallow'. Then: 'thou hast cast all my sins behind thy back.' He ends, "
            "'The LORD was ready to save me: therefore we will sing my songs to the stringed "
            "instruments all the days of our life in the house of the LORD.'"),
        "meaning": (
            "Hezekiah treats life itself as a reason to praise: 'The living, the living, he shall "
            "praise thee, as I do this day'. Every extra day was a gift, and he meant to spend it "
            "singing."),
        "lesson": "Each day of life is given. Use the breath you have to praise the One who gave it.",
        "key_verses": ["Isaiah 38:5"],
    },
    {
        "name": "Jonah's prayer",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "Salvation is of the LORD",
        "by": [{"name": "Jonah"}],
        "with": [{"name": "The great fish"}],
        "occasion": "Swallowed by a great fish after running from God",
        "where": "Inside the great fish",
        "told_in": "Jonah 2:1-10",
        "also_in": ["Jonah 1:1-17", "Matthew 12:39-41"],
        "sung": ["Jonah 2:2", "Jonah 2:9"],
        "summary": "From inside the fish, the runaway prophet prayed a psalm of thanks before he was even out, and ended, 'Salvation is of the LORD.'",
        "story": (
            "Jonah ran from God's call to Nineveh, was thrown overboard in a storm, and was "
            "swallowed by a great fish the LORD had prepared. 'Then Jonah prayed unto the LORD his "
            "God'. His prayer is a psalm, full of lines like those in the Psalms: the waters closing "
            "over him, weeds wrapped about his head, going down to the roots of the mountains. Yet "
            "it is a song of thanks: 'I cried by reason of mine affliction unto the LORD, and he "
            "heard me'. It ends with a vow and a confession, 'Salvation is of the LORD.' Then the "
            "LORD spoke to the fish, 'and it vomited out Jonah upon the dry land.'"),
        "meaning": (
            "Jonah gave thanks before he was rescued, trusting what God would do. Jesus pointed to "
            "Jonah's three days and nights in the fish as the sign of his own three days in the "
            "grave (Matthew 12:40)."),
        "lesson": "You can pray from the bottom. God hears from the belly of the fish, even when we got ourselves there.",
        "key_verses": ["Matthew 12:40"],
    },
    {
        "name": "Habakkuk's prayer",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "Yet I will rejoice in the LORD",
        "by": [{"name": "Habakkuk the prophet"}],
        "occasion": "Waiting for a Babylonian invasion he knew was coming",
        "where": "Judah",
        "told_in": "Habakkuk 3:1-19",
        "also_in": ["Habakkuk 1:1-6", "Habakkuk 2:1-4", "Romans 1:17"],
        "sung": ["Habakkuk 3:2", "Habakkuk 3:17-18"],
        "summary": "Habakkuk asked God why he allowed evil, heard that Babylon was coming, and ended with a song: though everything fails, I will rejoice in the LORD.",
        "story": (
            "The book begins with a complaint: 'O LORD, how long shall I cry, and thou wilt not "
            "hear!' God's answer was harder than the question: he was raising up the Chaldeans, the "
            "Babylonians, to punish Judah. Habakkuk waited on his watchtower, and God told him, "
            "'the just shall live by his faith.' Chapter 3 is 'A prayer of Habakkuk the prophet "
            "upon Shigionoth', set to music, with a closing note, 'To the chief singer on my "
            "stringed instruments.' He recalls God's mighty acts of old and asks, 'in wrath "
            "remember mercy.' Then comes his great resolve: though the fig tree does not blossom, "
            "the vines are empty and the stalls are bare, 'Yet I will rejoice in the LORD, I will "
            "joy in the God of my salvation.'"),
        "meaning": (
            "Habakkuk's joy does not depend on the harvest. Paul built his gospel on the line God "
            "gave him: 'The just shall live by faith' (Romans 1:17)."),
        "lesson": "Joy in God can outlast empty fields. Choose to rejoice in him, not in what you have.",
        "key_verses": ["Habakkuk 2:4", "Romans 1:17"],
    },
    {
        "name": "He will joy over thee with singing",
        "group": "Songs of the prophets",
        "testament": "Old",
        "epithet": "He will rest in his love",
        "by": [{"name": "Zephaniah"}],
        "occasion": "A promise of restoration after judgement",
        "where": "Jerusalem, in the days of King Josiah",
        "told_in": "Zephaniah 3:14-20",
        "also_in": ["Zephaniah 1:14-18"],
        "sung": ["Zephaniah 3:14", "Zephaniah 3:17"],
        "summary": "Zephaniah's book of judgement ends with a surprise: Israel is told to sing, and God himself sings over his people.",
        "story": (
            "Zephaniah preached in the days of Josiah about 'the great day of the LORD', a day of "
            "wrath. But his last chapter changes key. The LORD will gather the scattered and leave "
            "a humble people who trust in him. Then: 'Sing, O daughter of Zion; shout, O Israel'. "
            "The reason is that the King is among them: 'he will rejoice over thee with joy; he will "
            "rest in his love, he will joy over thee with singing.'"),
        "meaning": (
            "The Bible is full of people singing to God. Here God is the one singing, over the "
            "people he has saved."),
        "lesson": "God does not merely put up with his people; he delights in them. Let that quiet your fears.",
        "key_verses": ["Zephaniah 3:16"],
    },
]
