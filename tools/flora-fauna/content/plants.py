"""Plants of the Bible.

Each entry: name, group, epithet, terms (a regex for the KJV words that name it;
the build counts the verses it matches and checks every cited passage matches),
summary, uses (its place in daily life), why (why it is in the Bible), who
({who, what, reference, hero?} — people who used it, `hero` an id on
heroes-and-villains.html), importance, lesson, key_verses.
"""

PLANTS = [
    # ------------------------------------------------------------------ trees
    {
        "name": "Olive",
        "group": "Trees",
        "epithet": "The tree of oil and peace",
        "terms": r"\bolives?\b|\boliveyards?\b",
        "summary": "The most valuable tree in Israel. Its oil lit the lamps, cooked the food, healed wounds and anointed priests and kings.",
        "uses": [
            "Oil for cooking and baking bread",
            "Fuel for lamps, including the lampstand in the tabernacle",
            "Anointing priests, kings and the sick",
            "Medicine poured on wounds",
            "Olive wood for carving: the cherubim and doors of Solomon's temple",
        ],
        "why": (
            "The olive stood for peace, blessing and God's rich provision. After the flood a dove "
            "brought Noah an olive leaf, the first sign that the earth was living again. The psalmist "
            "pictures the one who trusts God as 'a green olive tree in the house of God', and Paul "
            "uses the olive tree to show Gentiles grafted into God's people."),
        "who": [
            {"who": "Noah", "hero": "noah", "what": "saw the dove return with an olive leaf in her mouth", "reference": "Genesis 8:11"},
            {"who": "Moses", "hero": "moses", "what": "commanded pure beaten olive oil so the lamp would burn always", "reference": "Exodus 27:20"},
            {"who": "Jesus", "what": "prayed on the Mount of Olives the night he was betrayed", "reference": "Luke 22:39"},
            {"who": "Paul", "hero": "paul", "what": "pictured Gentile believers as wild olive branches grafted in", "reference": "Romans 11:17"},
        ],
        "importance": (
            "Olive oil was one of the three great harvests of the land ('thy corn, and thy wine, and "
            "thine oil') and a sign of God's blessing (Deuteronomy 7:13). The titles Messiah and "
            "Christ both mean 'anointed one', so the oil of the olive stands behind the very name "
            "we give Jesus."),
        "lesson": "Like a tree that bears fruit for centuries, the one who trusts God's mercy stays green and fruitful (Psalm 52:8).",
        "key_verses": ["Genesis 8:11", "Psalms 52:8", "Romans 11:17"],
    },
    {
        "name": "Fig",
        "group": "Trees",
        "epithet": "Leaves, fruit and a lesson",
        "terms": r"\bfigs?\b",
        "summary": "A common fruit tree of Israel. Its sweet figs were eaten fresh, dried and pressed into cakes, and Adam and Eve sewed its broad leaves into aprons.",
        "uses": [
            "Fresh fruit in early summer",
            "Dried and pressed into cakes for journeys",
            "A poultice for boils",
            "Shade: to sit under your own fig tree meant peace",
        ],
        "why": (
            "Sitting 'every man under his vine and under his fig tree' was the Bible's picture of "
            "peace and safety. A fig tree full of leaves but with no fruit became Jesus' living "
            "parable of religion that looks alive but bears nothing."),
        "who": [
            {"who": "Adam and Eve", "what": "sewed fig leaves together to cover themselves", "reference": "Genesis 3:7"},
            {"who": "Abigail", "what": "brought two hundred cakes of figs to David and his men", "reference": "1 Samuel 25:18"},
            {"who": "Hezekiah", "hero": "hezekiah", "what": "recovered when Isaiah had a lump of figs laid on his boil", "reference": "2 Kings 20:7"},
            {"who": "Nathanael", "what": "was seen by Jesus under the fig tree before they met", "reference": "John 1:48"},
            {"who": "Jesus", "what": "cursed a fig tree that had leaves but no fruit", "reference": "Mark 11:12-14"},
        ],
        "importance": (
            "Figs were a staple food and one of the seven blessings of the Promised Land: 'a land of "
            "wheat, and barley, and vines, and fig trees, and pomegranates; a land of oil olive, and "
            "honey' (Deuteronomy 8:8). The prophets used the fig tree to picture Israel, fruitful "
            "when faithful and withered when not."),
        "lesson": "God looks for fruit, not just leaves. A life can look busy and green and still give him nothing (Luke 13:6-9).",
        "key_verses": ["Genesis 3:7", "Micah 4:4", "Mark 11:13"],
    },
    {
        "name": "Cedar",
        "group": "Trees",
        "epithet": "The king of trees",
        "terms": r"\bcedars?\b",
        "summary": "The tall, fragrant cedar of Lebanon: the finest building timber in the ancient world, used for David's palace and Solomon's temple.",
        "uses": [
            "Beams and panelling for palaces and the temple",
            "Masts for ships",
            "Cleansing rites: cedar wood was used for a healed leper and burned with the red heifer",
            "A sign of wealth and royal power",
        ],
        "why": (
            "The cedar's height, strength and resistance to rot made it the picture of greatness. "
            "The righteous 'shall grow like a cedar in Lebanon' (Psalm 92:12), while the prophets "
            "used felled cedars for proud kings brought low."),
        "who": [
            {"who": "David", "hero": "david", "what": "lived in a house of cedar and longed to build one for God", "reference": "2 Samuel 7:2"},
            {"who": "Hiram, king of Tyre", "what": "sent cedar from Lebanon for Solomon's temple", "reference": "1 Kings 5:6-10"},
            {"who": "Solomon", "what": "lined the temple with carved cedar, so that no stone was seen", "reference": "1 Kings 6:18"},
            {"who": "The returned exiles", "what": "brought cedar again from Lebanon to rebuild the temple", "reference": "Ezra 3:7"},
        ],
        "importance": (
            "Cedar built the house of God, and when Israel came home from exile the rebuilders sent "
            "for cedar again. The cedar's fall is also the Bible's picture of pride brought down: "
            "'The voice of the LORD breaketh the cedars' (Psalm 29:5)."),
        "lesson": "Lasting strength comes from being planted in God's house, not from standing tall on your own (Psalm 92:12-13).",
        "key_verses": ["2 Samuel 7:2", "1 Kings 6:18", "Psalms 29:5"],
    },
    {
        "name": "Palm",
        "group": "Trees",
        "epithet": "The tree of victory",
        "terms": r"\bpalm trees?\b|\bpalm branches\b|\bbranches of palm|\bpalms\b(?! of)",
        "summary": "The tall date palm of the oases and the Jordan valley (Jericho was 'the city of palm trees'), whose branches were waved in celebration.",
        "uses": [
            "Sweet dates for food",
            "Branches for the booths of the Feast of Tabernacles",
            "Branches waved to welcome a king",
            "Carved on the walls and doors of the temple",
            "A landmark for water in the desert",
        ],
        "why": (
            "Straight and evergreen in a dry land, the palm stood for uprightness and victory. "
            "Palm branches greeted Jesus as king, and in Revelation a great multitude stands before "
            "the throne with palms in their hands."),
        "who": [
            {"who": "The Israelites", "what": "camped at Elim by twelve wells and seventy palm trees", "reference": "Exodus 15:27"},
            {"who": "Deborah", "hero": "deborah", "what": "judged Israel sitting under 'the palm tree of Deborah'", "reference": "Judges 4:5"},
            {"who": "The crowds in Jerusalem", "what": "took palm branches and went out to meet Jesus", "reference": "John 12:13"},
            {"who": "The redeemed", "what": "stand before the throne, clothed in white, with 'palms in their hands'", "reference": "Revelation 7:9"},
        ],
        "importance": (
            "Only John tells us the branches at Jesus' entry into Jerusalem were palms. For a Jewish "
            "crowd they were the branches of the Feast of Tabernacles and a sign of national "
            "victory. The same sign returns at the end of the Bible, carried by people from every "
            "nation."),
        "lesson": "'The righteous shall flourish like the palm tree', rooted deep enough to stay green in a dry land (Psalm 92:12).",
        "key_verses": ["Psalms 92:12", "John 12:13", "Revelation 7:9"],
    },
    {
        "name": "Almond",
        "group": "Trees",
        "epithet": "The watchful tree",
        "terms": r"\balmonds?\b",
        "summary": "The first tree to blossom in late winter, its white flowers appearing before its leaves; its nuts were among the best gifts of the land.",
        "uses": [
            "Nuts for eating and for gifts",
            "The pattern for the cups of the golden lampstand",
            "A picture of old age: its white blossom like white hair",
        ],
        "why": (
            "In Hebrew the almond is shaqed, “the wakeful one”, because it wakes first after winter. "
            "God showed Jeremiah an almond branch and said, 'I will hasten my word to perform it': "
            "a play on shoqed, “watching”."),
        "who": [
            {"who": "Jacob", "what": "sent almonds among the best fruits of the land to Egypt", "reference": "Genesis 43:11"},
            {"who": "Aaron", "what": "saw his rod bud, blossom and yield almonds overnight", "reference": "Numbers 17:8"},
            {"who": "Bezaleel", "what": "made the lampstand's cups in the shape of almond blossoms", "reference": "Exodus 37:19"},
            {"who": "Jeremiah", "what": "saw a rod of an almond tree when God called him", "reference": "Jeremiah 1:11"},
        ],
        "importance": (
            "Aaron's budding rod settled whom God had chosen to serve as priest, and it was kept "
            "before the ark as a sign (Numbers 17:10; Hebrews 9:4). The lampstand in the holy place "
            "was shaped like an almond tree in bloom: the light in God's house took the form of the "
            "tree that wakes first."),
        "lesson": "God is awake over his word. What he has promised, he watches over to do (Jeremiah 1:12).",
        "key_verses": ["Numbers 17:8", "Jeremiah 1:11-12"],
    },
    {
        "name": "Pomegranate",
        "group": "Trees",
        "epithet": "The fruit on the priest's robe",
        "terms": r"\bpomegranates?\b",
        "summary": "A small tree whose red, many-seeded fruit was a sign of the fruitfulness of the Promised Land.",
        "uses": [
            "Fruit and juice for food and drink",
            "Embroidered on the hem of the high priest's robe, between golden bells",
            "Cast in bronze on the pillars of Solomon's temple",
        ],
        "why": (
            "Its countless seeds made it a picture of fruitfulness and blessing, and it was one of "
            "the foods of the good land (Deuteronomy 8:8). Worked into the priest's robe and the "
            "temple pillars, it carried that promise into the place of worship."),
        "who": [
            {"who": "The twelve spies, among them Joshua", "hero": "joshua", "what": "brought back pomegranates and figs with a huge cluster of grapes", "reference": "Numbers 13:23"},
            {"who": "Aaron", "what": "wore a robe hemmed with pomegranates and golden bells", "reference": "Exodus 28:33-34"},
            {"who": "Hiram the craftsman", "what": "cast rows of bronze pomegranates for the temple pillars", "reference": "1 Kings 7:20"},
            {"who": "Saul", "hero": "saul", "what": "sat under a pomegranate tree at Migron with his men", "reference": "1 Samuel 14:2"},
        ],
        "importance": (
            "The pomegranates and bells on the high priest's robe meant the sound of him was heard "
            "when he went into the holy place (Exodus 28:35). When Babylon destroyed the temple, "
            "its bronze pomegranates were among the things broken up and carried away "
            "(Jeremiah 52:22-23)."),
        "lesson": "A life lived close to God is meant to be full of fruit, as full as a pomegranate is of seed.",
        "key_verses": ["Deuteronomy 8:8", "Exodus 28:33"],
    },
    {
        "name": "Acacia",
        "group": "Trees",
        "epithet": "The wood of the ark",
        "terms": r"\bshittim\b|\bshittah\b",
        "summary": "A hardy, thorny desert tree whose dense, lasting wood the KJV calls 'shittim wood': the timber of the ark of the covenant and the tabernacle.",
        "uses": [
            "The ark of the covenant, overlaid with gold",
            "The table of showbread, the altars and their carrying poles",
            "The boards of the tabernacle",
            "Firewood and shade in the wilderness",
        ],
        "why": (
            "In the Sinai wilderness the acacia was almost the only tree big enough for timber, and "
            "its wood resists rot and insects. God built his dwelling among his people out of the "
            "tough, ordinary wood of the desert, and then covered it in gold."),
        "who": [
            {"who": "Moses", "hero": "moses", "what": "was told to make the ark of shittim wood", "reference": "Exodus 25:10"},
            {"who": "Bezaleel", "what": "made the ark of shittim wood and overlaid it with gold", "reference": "Exodus 37:1-2"},
            {"who": "Joshua", "hero": "joshua", "what": "sent two spies out from Shittim, “the acacias”, Israel's last camp", "reference": "Joshua 2:1"},
        ],
        "importance": (
            "Every piece of furniture that carried God's presence (the ark, the table, the altars) "
            "was shittim wood covered with gold. Israel's last camp before crossing the Jordan was "
            "at Shittim, a place named after the tree (Joshua 3:1)."),
        "lesson": "God makes his dwelling out of plain, desert-hardened wood. He does not need fine material, only what is given to him willingly (Exodus 25:2).",
        "key_verses": ["Exodus 25:10", "Exodus 26:15"],
    },
    {
        "name": "Sycomore",
        "group": "Trees",
        "epithet": "The tree Zacchaeus climbed",
        "terms": r"\bsycomores?\b",
        "summary": "A broad, low-branched fig tree of the lowlands, whose cheap figs fed the poor and whose light wood was used for building.",
        "uses": [
            "Cheap figs for the poor",
            "Everyday building timber",
            "A tree low and wide enough to climb",
        ],
        "why": (
            "The sycomore was the ordinary tree of the lowlands, as common as the cedar was grand: "
            "Solomon made cedars as plentiful 'as the sycomore trees that are in the vale'. Amos was "
            "'a gatherer of sycomore fruit', a poor labourer's work, when God called him to prophesy."),
        "who": [
            {"who": "Solomon", "what": "made cedar as plentiful as the common sycomore", "reference": "1 Kings 10:27"},
            {"who": "Amos", "what": "was a herdsman and 'a gatherer of sycomore fruit'", "reference": "Amos 7:14"},
            {"who": "Zacchaeus", "what": "climbed a sycomore tree to see Jesus pass by", "reference": "Luke 19:4"},
        ],
        "importance": (
            "Two very different men meet God by this humble tree: Amos, called from tending "
            "sycomore figs to speak for God, and Zacchaeus, the rich tax collector who climbed one "
            "and heard Jesus call him by name (Luke 19:5)."),
        "lesson": "Jesus saw the man in the tree. No one is too small, too high up or too far out of the way for him to call by name.",
        "key_verses": ["Luke 19:4", "Amos 7:14"],
    },
    {
        "name": "Broom tree",
        "group": "Trees",
        "epithet": "Shade for a worn-out prophet",
        "terms": r"\bjuniper\b",
        "summary": "The white broom of the desert (the KJV's 'juniper'): a bush big enough to lie under, with roots that burned into hot charcoal.",
        "uses": [
            "Shade in the desert",
            "Roots burned as fuel and charcoal: 'coals of juniper'",
            "Roots eaten by the desperately poor",
        ],
        "why": (
            "It appears in one of the most human moments in Scripture. Elijah, exhausted and afraid "
            "after Mount Carmel, lay down under a juniper and asked to die. God answered not with a "
            "rebuke but with sleep, bread and water."),
        "who": [
            {"who": "Elijah", "hero": "elijah", "what": "sat under a juniper and asked to die, then was fed by an angel", "reference": "1 Kings 19:4-5"},
            {"who": "Job's mockers", "what": "were so poor they cut juniper roots for food", "reference": "Job 30:4"},
        ],
        "importance": (
            "The broom tree marks the place where God cared for a burned-out servant: 'Arise and "
            "eat; because the journey is too great for thee' (1 Kings 19:7). Before giving Elijah "
            "new work, God gave him rest."),
        "lesson": "When you are at the end of your strength, God's first answer may be food and sleep. He knows the journey is too great for you.",
        "key_verses": ["1 Kings 19:4", "1 Kings 19:5"],
    },

    # ------------------------------------------------------------------ vines and crops
    {
        "name": "Grapevine",
        "group": "Vines and crops",
        "epithet": "The plant Jesus called himself",
        "terms": r"\bvines?\b|\bvineyards?\b|\bgrapes?\b",
        "summary": "The grapevine, grown on terraced hillsides all over Israel for fresh grapes, raisins and wine.",
        "uses": [
            "Fresh grapes and dried raisins",
            "Wine for meals, feasts, offerings and medicine",
            "The Passover cup and the Lord's Supper",
        ],
        "why": (
            "Israel itself was God's vine, brought out of Egypt and planted in the land (Psalm 80:8), "
            "and his vineyard that yielded wild grapes (Isaiah 5). Jesus took the picture for "
            "himself: 'I am the true vine'. Life and fruit come only from staying joined to him."),
        "who": [
            {"who": "Noah", "hero": "noah", "what": "planted a vineyard after the flood", "reference": "Genesis 9:20"},
            {"who": "The twelve spies, among them Joshua", "hero": "joshua", "what": "cut a cluster of grapes so big two men carried it on a staff", "reference": "Numbers 13:23"},
            {"who": "Naboth, Ahab and Jezebel", "hero": "ahab", "what": "Naboth was murdered so the king could have his vineyard", "reference": "1 Kings 21:1-16"},
            {"who": "Jesus", "what": "said, 'I am the true vine, and my Father is the husbandman'", "reference": "John 15:1"},
        ],
        "importance": (
            "The vine runs through the whole Bible: Isaiah's song of the vineyard (Isaiah 5:1-7), "
            "Jesus' parable of the wicked tenants (Mark 12:1-9), and his words at the Last Supper "
            "about drinking 'this fruit of the vine' new in his Father's kingdom (Matthew 26:29)."),
        "lesson": "'Without me ye can do nothing.' Fruit does not come from effort but from abiding in Christ (John 15:5).",
        "key_verses": ["Isaiah 5:1-2", "John 15:5"],
    },
    {
        "name": "Wheat",
        "group": "Vines and crops",
        "epithet": "The daily bread",
        "terms": r"\bwheat\b|\bwheaten\b",
        "summary": "The main grain of Israel, harvested in late spring and ground into flour for the daily bread of every household.",
        "uses": [
            "Flour for daily bread",
            "Fine flour for the grain offerings",
            "The firstfruits of the Feast of Weeks (Pentecost)",
            "Payment and trade: Solomon paid Hiram in wheat",
        ],
        "why": (
            "Wheat was life itself; a failed harvest meant famine. So wheat became a picture of God's "
            "people gathered in, and of a death that brings life when Jesus spoke of a grain of "
            "wheat falling into the ground."),
        "who": [
            {"who": "Gideon", "hero": "gideon", "what": "threshed wheat in a winepress to hide it from the Midianites", "reference": "Judges 6:11"},
            {"who": "Ruth", "hero": "ruth", "what": "gleaned through the barley and wheat harvests", "reference": "Ruth 2:23"},
            {"who": "Ornan (Araunah)", "hero": "david", "what": "was threshing wheat on the floor David bought, later the site of the temple", "reference": "1 Chronicles 21:20"},
            {"who": "Peter", "hero": "peter", "what": "was told Satan wanted to sift him as wheat", "reference": "Luke 22:31"},
            {"who": "Jesus", "what": "said a grain of wheat must fall and die to bear fruit", "reference": "John 12:24"},
        ],
        "importance": (
            "The Feast of Weeks celebrated the wheat harvest, and on that feast, Pentecost, the Holy "
            "Spirit came and three thousand were gathered in (Acts 2:1, 41). Jesus' parable of the "
            "wheat and the tares describes the world until the final harvest (Matthew 13:24-30)."),
        "lesson": "'Except a corn of wheat fall into the ground and die, it abideth alone.' Jesus' death was the seed of a great harvest (John 12:24).",
        "key_verses": ["John 12:24", "Matthew 13:30"],
    },
    {
        "name": "Barley",
        "group": "Vines and crops",
        "epithet": "The poor man's bread",
        "terms": r"\bbarley\b",
        "summary": "The hardy grain that ripened first in spring, a few weeks before wheat: cheaper bread for the poor and fodder for horses.",
        "uses": [
            "Bread for ordinary and poor families",
            "Fodder for horses",
            "The first sheaf of the harvest, offered to God",
            "A measure of price: Hosea bought back his wife with silver and barley",
        ],
        "why": (
            "Because it was cheap, barley meant humble people. A Midianite dreamed of a barley loaf "
            "tumbling into the camp and flattening a tent, a picture of Gideon's small army. And a "
            "boy's five barley loaves fed five thousand."),
        "who": [
            {"who": "Ruth", "hero": "ruth", "what": "came to Bethlehem at the beginning of barley harvest", "reference": "Ruth 1:22"},
            {"who": "Gideon", "hero": "gideon", "what": "was pictured in an enemy's dream as a barley loaf rolling into the camp", "reference": "Judges 7:13"},
            {"who": "Elisha", "what": "fed a hundred men with twenty barley loaves, with some left over", "reference": "2 Kings 4:42-44"},
            {"who": "A boy in the crowd", "what": "gave the five barley loaves Jesus used to feed five thousand", "reference": "John 6:9"},
        ],
        "importance": (
            "The barley harvest began the harvest year; its first sheaf was waved before the LORD "
            "(Leviticus 23:10-11), and Paul calls the risen Christ 'the firstfruits of them that "
            "slept' (1 Corinthians 15:20). Again and again God uses the poor man's grain to do "
            "great things."),
        "lesson": "God does not need much. Five barley loaves in his hands are enough for a multitude (John 6:9-11).",
        "key_verses": ["Ruth 1:22", "John 6:9"],
    },
    {
        "name": "Flax",
        "group": "Vines and crops",
        "epithet": "The thread of priests' clothes",
        "terms": r"\bflax\b|\blinen\b",
        "summary": "A tall, blue-flowered plant grown for its fibres, which were spun into linen: the cloth of priests, the tabernacle and burial.",
        "uses": [
            "Linen garments for priests",
            "Curtains of the tabernacle",
            "Lamp wicks: 'smoking flax'",
            "Burial cloths",
            "Spinning and trade: the good wife 'seeketh wool, and flax'",
        ],
        "why": (
            "Linen was cool, clean and white, so it stood for purity. The priests served in linen, "
            "and in Revelation 'the fine linen is the righteousness of saints'."),
        "who": [
            {"who": "Rahab", "hero": "rahab", "what": "hid the spies under stalks of flax on her roof", "reference": "Joshua 2:6"},
            {"who": "Samuel", "hero": "samuel", "what": "served before the LORD as a boy, wearing a linen ephod", "reference": "1 Samuel 2:18"},
            {"who": "David", "hero": "david", "what": "danced before the LORD in a linen ephod", "reference": "2 Samuel 6:14"},
            {"who": "Joseph of Arimathaea", "what": "wrapped Jesus' body in clean linen", "reference": "Matthew 27:59"},
        ],
        "importance": (
            "Of Jesus it was promised, 'the smoking flax shall he not quench' (Isaiah 42:3; "
            "Matthew 12:20): he will not snuff out a faith that is barely smouldering. And the "
            "linen clothes left lying in the empty tomb were the first sign that he had risen "
            "(John 20:5-7)."),
        "lesson": "Jesus is gentle with a faint faith. He does not put out the smoking wick.",
        "key_verses": ["Isaiah 42:3", "Revelation 19:8"],
    },
    {
        "name": "Lentils",
        "group": "Vines and crops",
        "epithet": "The meal that cost a birthright",
        "terms": r"\blentiles\b",
        "summary": "A small, reddish-brown pulse cooked into thick stew: cheap, filling, everyday food.",
        "uses": [
            "Red stew (the KJV's 'pottage')",
            "Mixed with grains for bread in hard times",
            "Food for travellers and armies",
        ],
        "why": (
            "Lentils are in the Bible because of one careless bargain. Esau came in from the field "
            "starving, smelled Jacob's red stew, and traded his birthright for a bowl of it: 'thus "
            "Esau despised his birthright'."),
        "who": [
            {"who": "Esau", "what": "sold his birthright to Jacob for bread and a stew of lentils", "reference": "Genesis 25:29-34"},
            {"who": "Barzillai and friends", "hero": "david", "what": "brought lentils and other food to David as he fled from Absalom", "reference": "2 Samuel 17:27-28"},
            {"who": "Shammah", "what": "stood in a field of lentils and held it against the Philistines", "reference": "2 Samuel 23:11-12"},
            {"who": "Ezekiel", "what": "baked siege bread of wheat, barley, beans, lentils, millet and fitches", "reference": "Ezekiel 4:9"},
        ],
        "importance": (
            "Esau's other name, Edom ('red'), came from that stew (Genesis 25:30), and Hebrews holds "
            "him up as a warning: he 'for one morsel of meat sold his birthright' (Hebrews 12:16). "
            "Yet one of David's mighty men won a great victory defending a plain field of lentils: "
            "ordinary food, but worth standing for."),
        "lesson": "Don't trade what is eternal for what is immediate. Hunger passes; a birthright does not.",
        "key_verses": ["Genesis 25:34"],
    },
    {
        "name": "Gourd",
        "group": "Vines and crops",
        "epithet": "Jonah's shade",
        "terms": r"\bgourds?\b",
        "summary": "A fast-growing climbing plant (the KJV's 'gourd') that God raised overnight to shade Jonah, and then took away.",
        "uses": [
            "Shade over booths and rooftops",
            "Wild gourds gathered for food, some of them poisonous",
        ],
        "why": (
            "God used the gourd to teach an angry prophet. Jonah grieved over a plant he had not "
            "planted, yet begrudged God's pity on Nineveh, a city of more than a hundred and twenty "
            "thousand people 'that cannot discern between their right hand and their left hand'."),
        "who": [
            {"who": "Jonah", "what": "was glad of the gourd's shade, then angry when a worm killed it", "reference": "Jonah 4:6-8"},
            {"who": "Elisha", "what": "made a pot of stew poisoned by wild gourds safe to eat", "reference": "2 Kings 4:38-41"},
        ],
        "importance": (
            "The book of Jonah ends with God's question over the withered gourd: 'And should not I "
            "spare Nineveh, that great city?' (Jonah 4:11). The little plant shows how small our "
            "pity can be beside God's."),
        "lesson": "We grieve easily over our own comforts. God asks us to care about what he cares about: people.",
        "key_verses": ["Jonah 4:6", "Jonah 4:10"],
    },

    # ------------------------------------------------------------------ herbs, flowers and spices
    {
        "name": "Mustard",
        "group": "Herbs, flowers and spices",
        "epithet": "The smallest seed",
        "terms": r"\bmustard\b",
        "summary": "A fast-growing herb of Galilee whose tiny seed grows into a plant tall enough for birds to perch in.",
        "uses": [
            "Seeds for seasoning and oil",
            "Leaves eaten as a vegetable",
            "A garden plant that grows to the size of a small tree",
        ],
        "why": (
            "Jesus chose the mustard seed because it was proverbially the smallest seed a farmer "
            "sowed. It became his picture of the kingdom of God (hidden, small beginnings and a "
            "great ending) and of faith."),
        "who": [
            {"who": "Jesus", "what": "compared the kingdom of heaven to a grain of mustard seed", "reference": "Matthew 13:31-32"},
            {"who": "The disciples", "what": "were told that faith as a grain of mustard seed could move a mountain", "reference": "Matthew 17:20"},
        ],
        "importance": (
            "The mustard seed appears only in the teaching of Jesus, yet it is one of the most "
            "remembered pictures in the Gospels. A small beginning is no measure of what God will "
            "make of it."),
        "lesson": "You don't need great faith; you need faith in a great God. A seed-sized faith, planted, grows (Matthew 17:20).",
        "key_verses": ["Matthew 13:31-32", "Matthew 17:20"],
    },
    {
        "name": "Hyssop",
        "group": "Herbs, flowers and spices",
        "epithet": "The brush of cleansing",
        "terms": r"\bhyssop\b",
        "summary": "A small, bushy, fragrant plant whose leafy stems were bound together and used like a brush to sprinkle blood and water.",
        "uses": [
            "Brushing the Passover blood on the doorposts",
            "Sprinkling in the cleansing of lepers and the unclean",
            "Lifting a sponge of vinegar to Jesus on the cross",
        ],
        "why": (
            "Hyssop was humble (Solomon spoke of plants 'from the cedar tree that is in Lebanon even "
            "unto the hyssop that springeth out of the wall'), but it was the plant of cleansing. So "
            "David prayed, 'Purge me with hyssop, and I shall be clean'."),
        "who": [
            {"who": "Moses and Israel", "hero": "moses", "what": "struck the Passover blood on their doors with a bunch of hyssop", "reference": "Exodus 12:22"},
            {"who": "Solomon", "what": "spoke of every plant from the cedar to the hyssop on the wall", "reference": "1 Kings 4:33"},
            {"who": "David", "hero": "david", "what": "prayed 'Purge me with hyssop' after his sin with Bathsheba", "reference": "Psalms 51:7"},
            {"who": "The soldiers at the cross", "what": "lifted a sponge of vinegar to Jesus on hyssop", "reference": "John 19:29"},
        ],
        "importance": (
            "Hyssop links the first Passover to the cross. It brushed the blood of the lamb on "
            "Israel's doors in Egypt, and it lifted the last drink to Jesus, the Lamb of God, just "
            "before he said, 'It is finished' (John 19:29-30)."),
        "lesson": "Only God can make us clean. David did not ask to clean himself; he asked God to purge him (Psalm 51:7).",
        "key_verses": ["Exodus 12:22", "Psalms 51:7", "John 19:29"],
    },
    {
        "name": "Lily",
        "group": "Herbs, flowers and spices",
        "epithet": "Clothed by God",
        "terms": r"\blily\b|\blilies\b",
        "summary": "The wild flowers of Galilee's hills ('the lilies of the field'), and a flower shape carved on the temple pillars.",
        "uses": [
            "Wild flowers that brighten the fields in spring",
            "Lily-work carved on the tops of the temple pillars and the rim of the great bronze basin",
            "A love poem's picture of beauty",
        ],
        "why": (
            "Jesus pointed to the lilies to cure worry. They do not toil or spin, yet 'even Solomon "
            "in all his glory was not arrayed like one of these'. If God clothes the grass of the "
            "field, he will clothe his children."),
        "who": [
            {"who": "Solomon", "what": "had lily-work carved on the tops of the temple pillars", "reference": "1 Kings 7:22"},
            {"who": "The bride in the Song", "what": "called herself 'the lily of the valleys'", "reference": "Song of Solomon 2:1"},
            {"who": "Jesus", "what": "told his disciples to consider the lilies instead of worrying", "reference": "Matthew 6:28-29"},
        ],
        "importance": (
            "Wild flowers last only a few days, yet God dresses them more beautifully than a king. "
            "Jesus uses that to show how much more he cares for people: 'shall he not much more "
            "clothe you, O ye of little faith?' (Matthew 6:30)."),
        "lesson": "Worry cannot add a thing to your life. Consider the lilies, and trust the Father who clothes them.",
        "key_verses": ["Matthew 6:28-29", "Song of Solomon 2:1"],
    },
    {
        "name": "Myrrh",
        "group": "Herbs, flowers and spices",
        "epithet": "A gift for burial",
        "terms": r"\bmyrrh\b",
        "summary": "A fragrant, bitter resin from a thorny shrub of Arabia and East Africa, precious as perfume, medicine and embalming spice.",
        "uses": [
            "An ingredient of the holy anointing oil",
            "Perfume for clothes and beds",
            "Beauty treatment: Esther's six months with oil of myrrh",
            "Pain relief: wine mingled with myrrh",
            "Preparing the dead for burial",
        ],
        "why": (
            "Myrrh was costly, fragrant and bitter: fit for kings, for love, and for the dead. It "
            "follows Jesus from his cradle to his tomb."),
        "who": [
            {"who": "Joseph", "hero": "joseph", "what": "was sold to a caravan carrying spices, balm and myrrh to Egypt", "reference": "Genesis 37:25"},
            {"who": "Esther", "hero": "esther", "what": "was prepared for the king with six months of oil of myrrh", "reference": "Esther 2:12"},
            {"who": "The wise men", "what": "brought the child Jesus gold, frankincense and myrrh", "reference": "Matthew 2:11"},
            {"who": "Nicodemus", "what": "brought about a hundred pounds of myrrh and aloes to bury Jesus", "reference": "John 19:39"},
        ],
        "importance": (
            "The wise men's myrrh at his birth, the wine mingled with myrrh he refused on the cross "
            "(Mark 15:23), and the myrrh Nicodemus brought for his burial: this bitter perfume "
            "traces Jesus' whole road to the cross."),
        "lesson": "Love gives its best even when it costs. Nicodemus came openly with a king's burial gift when it was most dangerous to do so.",
        "key_verses": ["Matthew 2:11", "John 19:39"],
    },
    {
        "name": "Frankincense",
        "group": "Herbs, flowers and spices",
        "epithet": "The fragrance of prayer",
        "terms": r"\bfrankincense\b",
        "summary": "A pale, fragrant resin from trees of southern Arabia, burned as incense and brought to Israel at great cost.",
        "uses": [
            "The holy incense burned in the tabernacle",
            "Added to the grain offerings",
            "Set beside the showbread every sabbath",
            "A gift fit for a king",
        ],
        "why": (
            "Its sweet smoke rising to God became a picture of prayer: 'Let my prayer be set forth "
            "before thee as incense' (Psalm 141:2). Given to the child Jesus, it honoured him as the "
            "one to whom worship belongs."),
        "who": [
            {"who": "Moses", "hero": "moses", "what": "was given the recipe for the holy incense, with pure frankincense", "reference": "Exodus 30:34"},
            {"who": "The Levites", "what": "kept the frankincense and spices of the temple", "reference": "1 Chronicles 9:29"},
            {"who": "Nehemiah", "hero": "nehemiah", "what": "threw Tobiah out of the temple store-room that had held the frankincense", "reference": "Nehemiah 13:4-9"},
            {"who": "The wise men", "what": "brought frankincense to the child Jesus", "reference": "Matthew 2:11"},
        ],
        "importance": (
            "The holy incense belonged to God alone: anyone who made it for himself was to be cut "
            "off (Exodus 30:37-38). Every morning and evening its smoke rose in the holy place while "
            "the people prayed outside (Luke 1:9-10)."),
        "lesson": "Prayer rises to God like incense. It is an offering he delights in, not a burden to him (Revelation 5:8).",
        "key_verses": ["Exodus 30:34", "Matthew 2:11"],
    },

    # ------------------------------------------------------------------ wild plants
    {
        "name": "Thorns and thistles",
        "group": "Wild plants",
        "epithet": "The curse Jesus wore",
        "terms": r"\bthorns?\b|\bthistles?\b|\bbriers?\b",
        "summary": "The prickly weeds and bushes that choke fields across the land, first named as part of the curse on the ground.",
        "uses": [
            "Hedges to guard fields and flocks",
            "Quick fuel: 'as the crackling of thorns under a pot'",
            "Punishment: Gideon 'taught' the men of Succoth with thorns and briers",
        ],
        "why": (
            "Thorns first appear when Adam sinned: 'Thorns also and thistles shall it bring forth to "
            "thee'. They became the Bible's picture of sin's curse, of worries that choke God's "
            "word, and at last of the crown the soldiers pressed on Jesus' head."),
        "who": [
            {"who": "Adam", "what": "was told the ground would bring forth thorns and thistles", "reference": "Genesis 3:17-18"},
            {"who": "Gideon", "hero": "gideon", "what": "punished the elders of Succoth with thorns and briers", "reference": "Judges 8:16"},
            {"who": "The soldiers", "what": "plaited a crown of thorns and put it on Jesus' head", "reference": "Matthew 27:29"},
            {"who": "Paul", "hero": "paul", "what": "was given 'a thorn in the flesh' to keep him humble", "reference": "2 Corinthians 12:7"},
        ],
        "importance": (
            "The curse began with thorns, and Jesus wore them as a crown when he took the curse on "
            "himself (Galatians 3:13). In the parable of the sower the thorns are 'the care of this "
            "world, and the deceitfulness of riches' that choke the word."),
        "lesson": "Guard the soil of your heart. Worry and riches grow like thorns and choke what God has sown.",
        "key_verses": ["Genesis 3:18", "Matthew 13:22", "Matthew 27:29"],
    },
    {
        "name": "Reeds and bulrushes",
        "group": "Wild plants",
        "epithet": "A baby's ark and a mock sceptre",
        "terms": r"\breeds?\b|\bbulrush(es)?\b|\brushes\b|\bthe rush\b|\band rush\b",
        "summary": "The tall reeds and papyrus that grow thick along the Nile and the Jordan. Papyrus is the KJV's 'bulrushes'.",
        "uses": [
            "Woven into baskets and light boats",
            "Measuring rods: 'a reed' was a measure of six cubits",
            "Walking sticks",
        ],
        "why": (
            "A reed bends in every wind, so it pictured weakness: Egypt was 'this broken reed' that "
            "pierces the hand of anyone who leans on it (Isaiah 36:6). Yet God promised that his "
            "servant would not break 'a bruised reed'."),
        "who": [
            {"who": "Moses' mother", "hero": "moses", "what": "hid her baby in an ark of bulrushes by the river's edge", "reference": "Exodus 2:3"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "was no 'reed shaken with the wind', Jesus said", "reference": "Matthew 11:7"},
            {"who": "The soldiers", "what": "put a reed in Jesus' hand as a mock sceptre, then struck him with it", "reference": "Matthew 27:29-30"},
            {"who": "John", "what": "was given a reed like a rod to measure the temple of God", "reference": "Revelation 11:1"},
        ],
        "importance": (
            "The same weak plant carries one of the Bible's most tender promises: 'A bruised reed "
            "shall he not break', fulfilled in Jesus (Matthew 12:20), the King who was himself "
            "mocked with a reed in his hand."),
        "lesson": "Jesus does not snap what is bent and bruised. He is gentle with the weak.",
        "key_verses": ["Exodus 2:3", "Isaiah 42:3"],
    },
    {
        "name": "Grass",
        "group": "Wild plants",
        "epithet": "Here today, gone tomorrow",
        "terms": r"\bgrass\b",
        "summary": "The green growth that covers the hills after the winter rains and withers fast in the summer heat.",
        "uses": [
            "Pasture for flocks and herds",
            "Hay for the dry season",
            "Fuel for the oven",
        ],
        "why": (
            "Grass grows fast and dies fast, so it became the Bible's picture of how short human "
            "life is, and of how lasting God's word is by contrast."),
        "who": [
            {"who": "Nebuchadnezzar", "hero": "nebuchadnezzar", "what": "ate grass like an ox until he acknowledged God", "reference": "Daniel 4:33"},
            {"who": "Isaiah", "what": "cried, 'All flesh is grass'", "reference": "Isaiah 40:6-8"},
            {"who": "Jesus", "what": "had the five thousand sit down on the green grass", "reference": "Mark 6:39"},
            {"who": "Peter", "hero": "peter", "what": "wrote that the grass withers but the word of the Lord endures", "reference": "1 Peter 1:24-25"},
        ],
        "importance": (
            "'The grass withereth, the flower fadeth: but the word of our God shall stand for ever' "
            "(Isaiah 40:8). Peter applied it to the gospel preached to his readers "
            "(1 Peter 1:25)."),
        "lesson": "Life is short, like grass. Build it on the word that lasts for ever.",
        "key_verses": ["Isaiah 40:8", "Psalms 103:15"],
    },
]
