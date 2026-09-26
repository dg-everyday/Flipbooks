"""Animals of the Bible.

Same fields as plants.py, plus an optional `law`: whether the Law of Moses
counted it clean or unclean, and where.
"""

ANIMALS = [
    # ------------------------------------------------------------------ flocks and herds
    {
        "name": "Sheep and lambs",
        "group": "Flocks and herds",
        "epithet": "The flock of God",
        "terms": r"\bsheep\b|\blambs?\b|\blambs'|\bewes?\b|\bsheepfolds?\b|\bsheepcotes?\b",
        "law": "Clean: it parts the hoof and chews the cud (Deuteronomy 14:4).",
        "summary": "The most common animal in Israel, kept in flocks for wool, milk and meat, and led by a shepherd who knew each one.",
        "uses": [
            "Wool for clothing",
            "Milk, cheese and meat",
            "Rams' skins dyed red for the tabernacle's covering",
            "Rams' horns for trumpets and for carrying oil",
            "Sacrifices: the Passover lamb, burnt offerings and sin offerings",
        ],
        "why": (
            "Sheep are helpless without a shepherd, so God describes his people as sheep and himself "
            "as their shepherd. And the lamb was the great animal of sacrifice, until John the "
            "Baptist pointed at Jesus and said, 'Behold the Lamb of God'."),
        "who": [
            {"who": "Abel", "what": "kept sheep and offered the firstlings of his flock", "reference": "Genesis 4:2-4"},
            {"who": "Abraham", "hero": "abraham", "what": "told Isaac, 'God will provide himself a lamb'", "reference": "Genesis 22:8"},
            {"who": "Moses", "hero": "moses", "what": "commanded every household to take a lamb for the Passover", "reference": "Exodus 12:3"},
            {"who": "David", "hero": "david", "what": "kept his father's sheep and fought a lion and a bear for them", "reference": "1 Samuel 17:34-35"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "called Jesus 'the Lamb of God'", "reference": "John 1:29"},
            {"who": "Peter", "hero": "peter", "what": "was told by the risen Jesus, 'Feed my sheep'", "reference": "John 21:15-17"},
        ],
        "importance": (
            "From Abel's offering to the Passover to Isaiah's servant 'brought as a lamb to the "
            "slaughter' (Isaiah 53:7), the lamb points to Jesus. Revelation ends with the Lamb on "
            "the throne and the marriage supper of the Lamb (Revelation 19:9)."),
        "lesson": "'All we like sheep have gone astray', but the good shepherd gives his life for the sheep (Isaiah 53:6; John 10:11).",
        "key_verses": ["Isaiah 53:6", "John 1:29", "John 10:11"],
    },
    {
        "name": "Goat",
        "group": "Flocks and herds",
        "epithet": "The scapegoat",
        "terms": r"\bgoats?\b|\bgoats'|\bscapegoat\b|\bkids?\b",
        "law": "Clean: it parts the hoof and chews the cud (Deuteronomy 14:4).",
        "summary": "Hardy black goats grazed alongside the sheep, giving milk, meat and the long hair woven into tent cloth.",
        "uses": [
            "Milk: the main milking animal",
            "Meat: a young kid for honoured guests",
            "Goats' hair woven into tents and the tabernacle's curtains",
            "Skins for water and wine bottles",
            "Sin offerings, and the scapegoat on the Day of Atonement",
        ],
        "why": (
            "On the Day of Atonement the high priest laid Israel's sins on the head of a live goat "
            "and sent it into the wilderness, carrying their sins away: the scapegoat. In Jesus' "
            "parable, the goats are those who never served him in 'the least of these'."),
        "who": [
            {"who": "Rebekah and Jacob", "what": "used two kids of the goats to trick blind Isaac", "reference": "Genesis 27:9-16"},
            {"who": "Joseph's brothers", "hero": "joseph", "what": "dipped his coat in the blood of a kid of the goats", "reference": "Genesis 37:31"},
            {"who": "Aaron", "what": "sent the scapegoat into the wilderness bearing Israel's sins", "reference": "Leviticus 16:21-22"},
            {"who": "Gideon", "hero": "gideon", "what": "prepared a kid for the angel of the LORD", "reference": "Judges 6:19"},
            {"who": "Jesus", "what": "said he would separate the sheep from the goats", "reference": "Matthew 25:32-33"},
        ],
        "importance": (
            "The scapegoat is one of the clearest pictures of forgiveness in the Law: sin carried "
            "away 'unto a land not inhabited' (Leviticus 16:22). 'As far as the east is from the "
            "west, so far hath he removed our transgressions from us' (Psalm 103:12)."),
        "lesson": "God does not just cover sin; he carries it away.",
        "key_verses": ["Leviticus 16:21-22", "Matthew 25:32"],
    },
    {
        "name": "Oxen and cattle",
        "group": "Flocks and herds",
        "epithet": "The strength of the farm",
        "terms": r"\boxen\b|\box\b|\bbullocks?\b|\bbulls?\b|\bheifers?\b|\bkine\b|\bcalf\b|\bcalves\b|\bcattle\b|\bbeeves\b",
        "law": "Clean: it parts the hoof and chews the cud (Deuteronomy 14:4).",
        "summary": "Cattle were the farmer's engine and the family's wealth: oxen ploughed and threshed, cows gave milk, and a fatted calf meant a feast.",
        "uses": [
            "Ploughing and threshing grain",
            "Pulling carts",
            "Milk, butter and meat",
            "Leather",
            "Sacrifices: bullocks for burnt and sin offerings, and the red heifer",
        ],
        "why": (
            "Oxen meant strength and wealth; Job's riches were counted in yoke of oxen. The Law cared "
            "for them: even a working ox was not to be muzzled. But a calf was also Israel's first "
            "idol, the golden calf at Sinai."),
        "who": [
            {"who": "Aaron and Israel", "what": "made a golden calf and worshipped it", "reference": "Exodus 32:4"},
            {"who": "Elisha", "hero": "elijah", "what": "was ploughing with twelve yoke of oxen when Elijah called him", "reference": "1 Kings 19:19"},
            {"who": "Job", "hero": "job", "what": "owned five hundred yoke of oxen before he lost everything", "reference": "Job 1:3"},
            {"who": "The prodigal's father", "what": "killed the fatted calf when his son came home", "reference": "Luke 15:23"},
        ],
        "importance": (
            "Paul read 'Thou shalt not muzzle the ox' as a principle for how God's people should "
            "care for those who serve them (1 Corinthians 9:9). And the fatted calf in Jesus' "
            "parable shows the joy of the Father over one sinner who comes home."),
        "lesson": "God cares even for the working ox. How much more does he care for those who labour for him.",
        "key_verses": ["Deuteronomy 25:4", "Luke 15:23"],
    },
    {
        "name": "Donkey",
        "group": "Flocks and herds",
        "epithet": "The humble king's ride",
        "terms": r"\bass\b|\basses\b|\bass's\b|\basses'|\bcolts?\b|\bfoals?\b",
        "law": "Unclean: it does not part the hoof. Its firstborn had to be redeemed with a lamb (Exodus 13:13).",
        "summary": "The everyday beast of burden in Israel (the KJV's 'ass'): sure-footed, patient and strong, ridden by rich and poor alike.",
        "uses": [
            "Carrying loads and grain",
            "Riding for travel, even for judges and kings",
            "Ploughing, though never yoked with an ox",
        ],
        "why": (
            "A king on a donkey came in peace, not war. Zechariah foretold, 'thy King cometh unto "
            "thee… lowly, and riding upon an ass', and Jesus fulfilled it when he rode into "
            "Jerusalem."),
        "who": [
            {"who": "Abraham", "hero": "abraham", "what": "saddled his ass to go to Mount Moriah", "reference": "Genesis 22:3"},
            {"who": "Balaam", "hero": "balaam", "what": "was rebuked by his donkey, which saw the angel he could not", "reference": "Numbers 22:28"},
            {"who": "Samson", "what": "killed a thousand men with the jawbone of an ass", "reference": "Judges 15:16"},
            {"who": "Saul", "hero": "saul", "what": "was out looking for his father's lost asses when he met Samuel", "reference": "1 Samuel 9:3"},
            {"who": "Jesus", "what": "rode into Jerusalem on a colt, the foal of an ass", "reference": "Matthew 21:5"},
        ],
        "importance": (
            "Zechariah's prophecy (Zechariah 9:9) shaped how Jesus entered Jerusalem: not on a "
            "warhorse but on a borrowed colt, a King 'meek, and sitting upon an ass'."),
        "lesson": "God's King comes in humility. Even a donkey could see what a proud prophet missed (Numbers 22:31).",
        "key_verses": ["Zechariah 9:9", "Numbers 22:28"],
    },
    {
        "name": "Camel",
        "group": "Flocks and herds",
        "epithet": "The ship of the desert",
        "terms": r"\bcamels?\b|\bcamels'|\bcamel's\b",
        "law": "Unclean: it chews the cud but does not divide the hoof (Leviticus 11:4).",
        "summary": "The long-distance carrier of the East, able to go days without water, and a sign of great wealth.",
        "uses": [
            "Caravans and long-distance trade",
            "Riding across the desert",
            "Camel's hair woven into rough cloth",
            "Wealth, and gifts for a bride's family",
        ],
        "why": (
            "Camels carried the wealth of nations. They travel with the patriarchs and the Queen of "
            "Sheba, and Isaiah saw 'the multitude of camels' bringing gold and incense to Zion "
            "(Isaiah 60:6). Jesus used them for his famous picture of how hard it is for a rich "
            "man to enter the kingdom of God."),
        "who": [
            {"who": "Abraham's servant", "hero": "abraham", "what": "took ten camels to find a wife for Isaac", "reference": "Genesis 24:10"},
            {"who": "Rebekah", "what": "watered all ten camels, the sign the servant had prayed for", "reference": "Genesis 24:19-20"},
            {"who": "The Queen of Sheba", "what": "came to Solomon with camels loaded with spices and gold", "reference": "1 Kings 10:2"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "wore clothing of camel's hair", "reference": "Matthew 3:4"},
        ],
        "importance": (
            "Rebekah's kindness to a stranger's thirsty camels was the very sign Abraham's servant "
            "had asked God for (Genesis 24:14). And Jesus said it is 'easier for a camel to go "
            "through the eye of a needle' than for a rich man to enter the kingdom of God: "
            "impossible with men, but not with God (Mark 10:25-27)."),
        "lesson": "What is impossible for us is possible with God, even saving someone whose heart is tied to their wealth.",
        "key_verses": ["Genesis 24:19", "Mark 10:25"],
    },
    {
        "name": "Horse",
        "group": "Flocks and herds",
        "epithet": "The warhorse",
        "terms": r"\bhorses?\b|\bhorses'|\bhorse's\b",
        "law": "Unclean: it does not part the hoof. Israel's kings were told not to 'multiply horses' (Deuteronomy 17:16).",
        "summary": "In Bible times horses were animals of war, drawing chariots and carrying cavalry: the strength of Egypt and the great empires.",
        "uses": [
            "Pulling war chariots",
            "Cavalry",
            "Swift royal couriers",
            "A show of a king's power",
        ],
        "why": (
            "Because horses meant military power, God warned Israel's kings not to gather them or "
            "trust in them. 'Some trust in chariots, and some in horses: but we will remember the "
            "name of the LORD our God.'"),
        "who": [
            {"who": "Pharaoh's army", "hero": "pharaoh", "what": "'the horse and his rider hath he thrown into the sea'", "reference": "Exodus 15:1"},
            {"who": "Solomon", "what": "gathered horses brought out of Egypt", "reference": "1 Kings 10:26-28"},
            {"who": "Elijah", "hero": "elijah", "what": "was parted from Elisha by a chariot and horses of fire", "reference": "2 Kings 2:11"},
            {"who": "Elisha's servant", "what": "saw the hills full of horses and chariots of fire", "reference": "2 Kings 6:17"},
            {"who": "Faithful and True", "what": "rides out on a white horse to judge and make war", "reference": "Revelation 19:11"},
        ],
        "importance": (
            "The horse is the Bible's test of where trust lies. Isaiah warned those who 'go down to "
            "Egypt for help; and stay on horses' (Isaiah 31:1). At the end, Christ himself rides "
            "the white horse to victory."),
        "lesson": "Don't trust in the strongest thing you can see. 'An horse is a vain thing for safety' (Psalm 33:17).",
        "key_verses": ["Psalms 20:7", "Revelation 19:11"],
    },
    {
        "name": "Pig",
        "group": "Flocks and herds",
        "epithet": "The unclean animal",
        "terms": r"\bswine\b|\bswine's\b|\bboar\b",
        "law": "Unclean: it divides the hoof but does not chew the cud (Leviticus 11:7).",
        "summary": "Forbidden as food under the Law of Moses, pigs (the KJV's 'swine') were kept by Gentiles, which made herding them the lowest job a Jew could have.",
        "uses": [
            "Meat for Gentiles; forbidden to Israel",
            "Herds kept in Gentile country east of the Sea of Galilee",
        ],
        "why": (
            "Pigs do not chew the cud, so they were unclean. That is why the prodigal son feeding "
            "swine had hit bottom, and why a herd of about two thousand pigs shows Jesus crossing "
            "into Gentile country."),
        "who": [
            {"who": "The prodigal son", "what": "fed pigs and longed to eat their husks", "reference": "Luke 15:15-16"},
            {"who": "The man from the tombs", "what": "was set free as the unclean spirits went into a herd of swine", "reference": "Mark 5:11-13"},
            {"who": "Jesus", "what": "warned not to cast pearls before swine", "reference": "Matthew 7:6"},
        ],
        "importance": (
            "The New Testament lifts the Law's line between clean and unclean food: Mark notes that "
            "Jesus' words meant 'purging all meats' (Mark 7:19), and Peter's vision taught him not to call any "
            "person common or unclean (Acts 10:15, 28)."),
        "lesson": "No one is too far gone. The son among the pigs was still a son, and his father ran to meet him (Luke 15:20).",
        "key_verses": ["Leviticus 11:7", "Luke 15:15"],
    },

    # ------------------------------------------------------------------ wild animals
    {
        "name": "Lion",
        "group": "Wild animals",
        "epithet": "The king of beasts",
        "terms": r"\blions?\b|\blion's\b|\blions'|\blionesse?s?\b",
        "summary": "Lions roamed the thickets of the Jordan and the hills of Judah in Bible times, a real danger to shepherds and travellers.",
        "uses": [
            "A danger to flocks and people",
            "A royal emblem: lions stood beside the steps of Solomon's throne",
        ],
        "why": (
            "The lion stood for strength, courage and royal power, and for danger. Judah is 'a "
            "lion's whelp' (Genesis 49:9), the devil 'as a roaring lion' seeks whom he may devour, "
            "and Jesus is 'the Lion of the tribe of Juda'."),
        "who": [
            {"who": "Samson", "what": "tore a young lion apart with his bare hands", "reference": "Judges 14:5-6"},
            {"who": "David", "hero": "david", "what": "killed a lion that took a lamb from his flock", "reference": "1 Samuel 17:34-36"},
            {"who": "A disobedient prophet", "what": "was killed by a lion on the road home", "reference": "1 Kings 13:24"},
            {"who": "Daniel", "hero": "daniel", "what": "was thrown into the den of lions and came out unhurt", "reference": "Daniel 6:22"},
        ],
        "importance": (
            "The Bible's lions show both sides of power. God shut the lions' mouths for Daniel; Peter "
            "warns us to stay alert against the enemy who prowls like one; and the Lion of Judah "
            "turns out to be a Lamb that was slain (Revelation 5:5-6)."),
        "lesson": "'The righteous are bold as a lion' (Proverbs 28:1), not because they are strong but because the Lion of Judah has conquered.",
        "key_verses": ["Daniel 6:22", "1 Peter 5:8", "Revelation 5:5"],
    },
    {
        "name": "Wolf",
        "group": "Wild animals",
        "epithet": "The enemy of the flock",
        "terms": r"\bwolf\b|\bwolves\b",
        "summary": "Wolves hunted the flocks of Israel at night, and a good shepherd had to stand between them and his sheep.",
        "uses": [
            "A constant danger to sheep and goats, especially at night",
        ],
        "why": (
            "The wolf pictures those who harm God's people, above all false teachers who look "
            "harmless. Jesus warned of 'false prophets, which come to you in sheep's clothing, but "
            "inwardly they are ravening wolves'."),
        "who": [
            {"who": "Jacob", "what": "said in his blessing that Benjamin 'shall ravin as a wolf'", "reference": "Genesis 49:27"},
            {"who": "Jesus", "what": "sent out his disciples 'as sheep in the midst of wolves'", "reference": "Matthew 10:16"},
            {"who": "The hired hand", "what": "runs when he sees the wolf coming; the good shepherd does not", "reference": "John 10:12"},
            {"who": "Paul", "hero": "paul", "what": "warned the Ephesian elders of 'grievous wolves'", "reference": "Acts 20:29"},
        ],
        "importance": (
            "Isaiah's picture of the coming kingdom begins with this old enemy at peace: 'The wolf "
            "also shall dwell with the lamb' (Isaiah 11:6)."),
        "lesson": "Watch for wolves in sheep's clothing, and trust the Shepherd who lays down his life rather than run (John 10:11-12).",
        "key_verses": ["Matthew 7:15", "Isaiah 11:6"],
    },
    {
        "name": "Bear",
        "group": "Wild animals",
        "epithet": "The robbed mother",
        "terms": r"\bshe bears\b|\ba bear\b|\bthe bear\b|\btwo bears\b|\bas a bear\b|\blike bears\b",
        "summary": "The Syrian brown bear lived in the hills and forests of Israel in Bible times, dangerous to flocks and fierce in defending its cubs.",
        "uses": [
            "A danger to flocks and travellers",
        ],
        "why": (
            "The bear stood for fierce, sudden danger. 'Let a bear robbed of her whelps meet a man, "
            "rather than a fool in his folly' (Proverbs 17:12)."),
        "who": [
            {"who": "David", "hero": "david", "what": "killed a bear to save his father's sheep", "reference": "1 Samuel 17:34-36"},
            {"who": "Hushai", "hero": "absalom", "what": "warned Absalom that David was as fierce as a bear robbed of her cubs", "reference": "2 Samuel 17:8"},
            {"who": "Elisha", "what": "was mocked near Bethel, and two she bears came out of the wood", "reference": "2 Kings 2:23-24"},
            {"who": "Daniel", "hero": "daniel", "what": "saw a kingdom rise like a bear in his vision", "reference": "Daniel 7:5"},
        ],
        "importance": (
            "David's fights with the lion and the bear gave him courage to face Goliath: 'The LORD "
            "that delivered me out of the paw of the lion, and out of the paw of the bear, he will "
            "deliver me out of the hand of this Philistine' (1 Samuel 17:37)."),
        "lesson": "Remember what God has already done. Past rescues build courage for today's giant.",
        "key_verses": ["1 Samuel 17:37", "Proverbs 17:12"],
    },
    {
        "name": "Fox",
        "group": "Wild animals",
        "epithet": "The little spoilers",
        "terms": r"\bfox(es)?\b",
        "summary": "Foxes and jackals prowled the ruins and vineyards of Israel: clever, destructive and at home in holes.",
        "uses": [
            "Pests in the vineyards",
            "Scavengers of ruined places",
        ],
        "why": (
            "Foxes stood for cunning and for the ruin of what once flourished. Jesus called Herod "
            "'that fox', and said that foxes have holes while he had nowhere to lay his head."),
        "who": [
            {"who": "Samson", "what": "tied torches to three hundred foxes and burned the Philistines' fields", "reference": "Judges 15:4-5"},
            {"who": "Tobiah", "hero": "nehemiah", "what": "mocked that a fox would break down Nehemiah's wall", "reference": "Nehemiah 4:3"},
            {"who": "Jesus", "what": "said the foxes have holes but he had nowhere to lay his head", "reference": "Matthew 8:20"},
            {"who": "Herod Antipas", "hero": "herod-antipas", "what": "was called 'that fox' by Jesus", "reference": "Luke 13:32"},
        ],
        "importance": (
            "'Take us the foxes, the little foxes, that spoil the vines' (Song of Solomon 2:15): "
            "small things left unchecked can ruin a whole vineyard."),
        "lesson": "Watch for the little foxes: small compromises that quietly spoil what God is growing.",
        "key_verses": ["Song of Solomon 2:15", "Matthew 8:20"],
    },
    {
        "name": "Deer",
        "group": "Wild animals",
        "epithet": "Thirsting for God",
        "terms": r"\bharts?\b|\bhinds?\b|\bhinds'|\broebucks?\b|\broes?\b|\bfallow ?deer\b",
        "law": "Clean: the hart, the roebuck and the fallow deer could be eaten (Deuteronomy 14:5).",
        "summary": "Gazelles and deer (the KJV's harts, hinds and roes) were swift, graceful animals of the hills, hunted for food.",
        "uses": [
            "Clean game meat, served daily at Solomon's table",
            "Hunted in the hills",
        ],
        "why": (
            "The deer's thirst and sure feet gave Scripture two of its loveliest pictures: 'As the "
            "hart panteth after the water brooks, so panteth my soul after thee, O God', and feet "
            "'like hinds' feet' set on high places."),
        "who": [
            {"who": "Asahel", "what": "was 'as light of foot as a wild roe'", "reference": "2 Samuel 2:18"},
            {"who": "Solomon", "what": "had harts, roebucks and fallow deer on his table every day", "reference": "1 Kings 4:23"},
            {"who": "David", "hero": "david", "what": "sang that God made his feet like hinds' feet", "reference": "Psalms 18:33"},
            {"who": "Habakkuk", "what": "trusted God though the harvest failed, and walked the heights with hinds' feet", "reference": "Habakkuk 3:19"},
        ],
        "importance": (
            "Habakkuk's song begins with empty fields and bare fig trees and ends with feet like a "
            "deer's on the heights (Habakkuk 3:17-19). Joy in God does not depend on the harvest."),
        "lesson": "Thirst for God as a deer thirsts for water, and trust him to keep your feet steady on hard ground.",
        "key_verses": ["Psalms 42:1", "Habakkuk 3:19"],
    },
    {
        "name": "Dog",
        "group": "Wild animals",
        "epithet": "The scavenger at the gate",
        "terms": r"\bdogs?\b|\bdog's\b|\bdogs'",
        "summary": "Most dogs in Bible times were half-wild scavengers roaming the streets and rubbish heaps; a few guarded the flocks.",
        "uses": [
            "Guarding flocks",
            "Scavenging whatever was thrown out",
        ],
        "why": (
            "Because they were unclean scavengers, 'dog' was an insult: Goliath sneered, 'Am I a "
            "dog?' Yet Jesus let a Gentile mother turn the word around: even the dogs eat the "
            "children's crumbs under the table."),
        "who": [
            {"who": "Goliath", "hero": "goliath", "what": "asked David, 'Am I a dog, that thou comest to me with staves?'", "reference": "1 Samuel 17:43"},
            {"who": "Mephibosheth", "hero": "david", "what": "called himself 'such a dead dog as I am' when David showed him kindness", "reference": "2 Samuel 9:8"},
            {"who": "Jezebel", "hero": "jezebel", "what": "was eaten by dogs, as Elijah had said", "reference": "2 Kings 9:36"},
            {"who": "Lazarus the beggar", "what": "had dogs lick his sores at the rich man's gate", "reference": "Luke 16:21"},
            {"who": "A Syrophenician mother", "what": "answered Jesus that even the dogs eat the children's crumbs", "reference": "Mark 7:28"},
        ],
        "importance": (
            "The Syrophenician mother's humble, quick answer won her daughter's healing (Mark 7:29). "
            "Faith does not argue its own worth; it clings to the Master's mercy."),
        "lesson": "No one is too low for God's grace. David seated a man who called himself a dead dog at the king's table (2 Samuel 9:8-11).",
        "key_verses": ["Mark 7:28", "2 Samuel 9:8"],
    },

    # ------------------------------------------------------------------ birds
    {
        "name": "Dove",
        "group": "Birds",
        "epithet": "The bird of peace and the Spirit",
        "terms": r"\bdoves?\b|\bdoves'|\bturtledoves?\b|\bturtles?\b|\bpigeons?\b",
        "law": "Clean: doves and pigeons were offered in sacrifice (Leviticus 1:14).",
        "summary": "Doves and pigeons nested in the rocks and were the cheapest sacrifice: the offering of the poor.",
        "uses": [
            "Sacrifices for those who could not afford a lamb",
            "Food",
            "Sold in the temple courts for offerings",
        ],
        "why": (
            "The dove carried the olive leaf to Noah, came down on Jesus at his baptism as the Holy "
            "Spirit, and was the sacrifice poor families brought. It stands for peace, gentleness "
            "and the Spirit of God."),
        "who": [
            {"who": "Noah", "hero": "noah", "what": "sent out a dove that came back with an olive leaf", "reference": "Genesis 8:8-11"},
            {"who": "Mary and Joseph", "hero": "mary-mother-of-jesus", "what": "offered two birds, the offering of the poor, when Jesus was presented", "reference": "Luke 2:24"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "saw the Spirit come down like a dove on Jesus", "reference": "John 1:32"},
            {"who": "Jesus", "what": "drove out those who sold doves in the temple", "reference": "Matthew 21:12"},
        ],
        "importance": (
            "Mary's offering of birds shows that Jesus was born into a poor family (Luke 2:24; "
            "Leviticus 12:8). Jesus told his disciples to be 'wise as serpents, and harmless as "
            "doves' (Matthew 10:16)."),
        "lesson": "Be harmless as doves (gentle and pure) while being wise (Matthew 10:16).",
        "key_verses": ["Genesis 8:11", "Matthew 3:16"],
    },
    {
        "name": "Raven",
        "group": "Birds",
        "epithet": "The bird God feeds",
        "terms": r"\bravens?\b",
        "law": "Unclean: 'every raven after his kind' (Leviticus 11:15).",
        "summary": "Large black birds of the crow family: scavengers that eat almost anything, and unclean under the Law.",
        "uses": [
            "None to people: an unclean scavenger",
        ],
        "why": (
            "An unclean bird became God's delivery service: ravens fed Elijah by the brook Cherith. "
            "Jesus pointed to them too: they neither sow nor reap, 'and God feedeth them'."),
        "who": [
            {"who": "Noah", "hero": "noah", "what": "sent out a raven first, which flew to and fro", "reference": "Genesis 8:7"},
            {"who": "Elijah", "hero": "elijah", "what": "was brought bread and meat by ravens morning and evening", "reference": "1 Kings 17:4-6"},
            {"who": "Jesus", "what": "said, 'Consider the ravens… God feedeth them'", "reference": "Luke 12:24"},
        ],
        "importance": (
            "'Who provideth for the raven his food? when his young ones cry unto God' (Job 38:41). "
            "If God feeds the unclean scavenger, he will not forget his children."),
        "lesson": "God can use anything, even an unclean bird, to provide for those who trust him.",
        "key_verses": ["1 Kings 17:6", "Luke 12:24"],
    },
    {
        "name": "Eagle",
        "group": "Birds",
        "epithet": "Mounting up with wings",
        "terms": r"\beagles?\b|\beagles'|\beagle's\b",
        "law": "Unclean: the first bird named as forbidden (Leviticus 11:13).",
        "summary": "The great birds of prey (eagles and vultures, both 'eagle' in the KJV) soaring high over the mountains and deserts.",
        "uses": [
            "None to people: an unclean bird of prey",
        ],
        "why": (
            "The eagle's strength, speed and high flight made it a picture of God's care (he carried "
            "Israel 'on eagles' wings') and of new strength for those who wait on him."),
        "who": [
            {"who": "Moses", "hero": "moses", "what": "heard God say he had carried Israel on eagles' wings", "reference": "Exodus 19:4"},
            {"who": "David", "hero": "david", "what": "mourned Saul and Jonathan as 'swifter than eagles'", "reference": "2 Samuel 1:23"},
            {"who": "Isaiah", "what": "promised that those who wait on the LORD will mount up with wings as eagles", "reference": "Isaiah 40:31"},
            {"who": "John", "what": "saw a living creature like a flying eagle around the throne", "reference": "Revelation 4:7"},
        ],
        "importance": (
            "Deuteronomy pictures God as an eagle that stirs up her nest and bears her young on her "
            "wings (Deuteronomy 32:11): pushing them to fly, but never letting them fall."),
        "lesson": "'They that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles' (Isaiah 40:31).",
        "key_verses": ["Isaiah 40:31", "Exodus 19:4"],
    },
    {
        "name": "Sparrow",
        "group": "Birds",
        "epithet": "Not forgotten",
        "terms": r"\bsparrows?\b",
        "summary": "Small birds sold in the market for a copper coin or two: the cheapest meat there was.",
        "uses": [
            "Cheap food for the poor",
            "Nesting around the house of God",
        ],
        "why": (
            "Jesus chose the cheapest thing in the market to show the Father's care: not one sparrow "
            "falls to the ground without him. 'Fear ye not therefore, ye are of more value than many "
            "sparrows.'"),
        "who": [
            {"who": "The psalmist", "what": "envied the sparrow that nested near God's altar", "reference": "Psalms 84:3"},
            {"who": "Jesus", "what": "said not one sparrow falls without the Father", "reference": "Matthew 10:29-31"},
        ],
        "importance": (
            "Two sparrows sold for a farthing (Matthew 10:29); five for two farthings (Luke 12:6). "
            "The fifth seems to have been thrown in for nothing, and Luke adds, 'not one of them is "
            "forgotten before God'."),
        "lesson": "You are not forgotten. If God watches every sparrow, he knows every hair on your head (Matthew 10:30).",
        "key_verses": ["Matthew 10:29", "Luke 12:6-7"],
    },
    {
        "name": "Quail",
        "group": "Birds",
        "epithet": "Meat in the wilderness",
        "terms": r"\bquails?\b",
        "summary": "Small birds that cross the Sinai in huge flocks each spring and autumn, flying low and landing exhausted.",
        "uses": [
            "Meat: God sent quail to feed Israel in the wilderness",
        ],
        "why": (
            "Twice God sent quail to feed Israel in the desert. The first time it was simple "
            "provision. The second time, when they despised the manna and craved meat, it became "
            "a judgement."),
        "who": [
            {"who": "Moses and Israel", "hero": "moses", "what": "saw quails come up and cover the camp at evening", "reference": "Exodus 16:13"},
            {"who": "The people at Kibroth-hattaavah", "what": "gathered quail for two days and were struck by a plague", "reference": "Numbers 11:31-34"},
        ],
        "importance": (
            "'He gave them their request; but sent leanness into their soul' (Psalm 106:15). "
            "Numbers 11 is a warning about grumbling and craving: getting what we want is not the "
            "same as being blessed."),
        "lesson": "Be thankful for God's daily provision. Craving more can leave the soul empty.",
        "key_verses": ["Exodus 16:13", "Psalms 105:40"],
    },
    {
        "name": "Rooster",
        "group": "Birds",
        "epithet": "The crow that woke Peter",
        "terms": r"\bcock\b|\bcockcrowing\b|(?-i:\bhen\b)",
        "summary": "In the KJV the rooster ('cock') appears only in the New Testament, its crow marking the last hours of the night.",
        "uses": [
            "Keeping time before dawn: 'cockcrowing' was a watch of the night",
            "Eggs and meat",
        ],
        "why": (
            "Jesus told Peter he would deny him three times before the cock crowed. When it crowed, "
            "Peter remembered and wept bitterly. And Jesus longed to gather Jerusalem 'as a hen "
            "gathereth her chickens under her wings'."),
        "who": [
            {"who": "Peter", "hero": "peter", "what": "denied Jesus three times, then heard the cock crow", "reference": "Luke 22:60-62"},
            {"who": "Jesus", "what": "longed to gather Jerusalem as a hen gathers her chicks", "reference": "Matthew 23:37"},
        ],
        "importance": (
            "The rooster's crow was not the end of Peter's story. After the resurrection Jesus asked "
            "him three times, 'Lovest thou me?', once for each denial, and gave him his sheep to "
            "feed (John 21:15-17)."),
        "lesson": "Failure is not final. The man who heard the cock crow became the one who fed Christ's sheep.",
        "key_verses": ["Luke 22:61", "Matthew 23:37"],
    },

    # ------------------------------------------------------------------ creatures of the water
    {
        "name": "Fish",
        "group": "Creatures of the water",
        "epithet": "The food of Galilee",
        "terms": r"\bfish(es)?\b|\bfish's\b",
        "law": "Clean only if it has fins and scales (Leviticus 11:9-10).",
        "summary": "The Sea of Galilee teemed with fish, and fishing was a major trade; fish were eaten fresh, dried and salted across the land.",
        "uses": [
            "Food: fresh, dried and salted",
            "Trade: Jerusalem had a Fish Gate",
            "A living for fishermen like Peter, Andrew, James and John",
        ],
        "why": (
            "Jesus called fishermen and made them 'fishers of men'. He fed crowds with a few fish, "
            "filled nets after a fruitless night, and ate fish with his disciples after he rose "
            "from the dead."),
        "who": [
            {"who": "Jonah", "what": "was swallowed by a great fish and spent three days inside", "reference": "Jonah 1:17"},
            {"who": "Peter", "hero": "peter", "what": "let down his nets at Jesus' word and caught so many fish they broke", "reference": "Luke 5:4-6"},
            {"who": "A boy in the crowd", "what": "gave two small fishes with his five loaves", "reference": "John 6:9"},
            {"who": "Peter", "hero": "peter", "what": "found a coin in a fish's mouth to pay the temple tax", "reference": "Matthew 17:27"},
            {"who": "The risen Jesus", "what": "cooked fish on a fire for his disciples at dawn", "reference": "John 21:9-13"},
        ],
        "importance": (
            "After the resurrection Jesus ate broiled fish in front of his disciples to show he was "
            "not a ghost (Luke 24:42-43), and filled their nets with a hundred and fifty-three "
            "great fish (John 21:11)."),
        "lesson": "Jesus meets people at their work. Follow him, and he will make you fishers of men (Matthew 4:19).",
        "key_verses": ["Jonah 1:17", "Luke 5:6", "John 21:11"],
    },
    {
        "name": "Frog",
        "group": "Creatures of the water",
        "epithet": "The second plague",
        "terms": r"\bfrogs?\b",
        "summary": "The frogs of the Nile, which swarmed out of the river and into every house in the second plague on Egypt.",
        "uses": [
            "None: they appear as a plague",
        ],
        "why": (
            "Egypt honoured the Nile and its life, but at God's word the river's frogs overran the "
            "land (ovens, beds and kneading troughs) until Pharaoh begged Moses to pray them away."),
        "who": [
            {"who": "Moses and Aaron", "hero": "moses", "what": "brought the plague of frogs on Egypt", "reference": "Exodus 8:5-6"},
            {"who": "Pharaoh", "hero": "pharaoh", "what": "begged for the frogs to go, then hardened his heart when they did", "reference": "Exodus 8:8-15"},
            {"who": "John", "what": "saw three unclean spirits like frogs in his vision", "reference": "Revelation 16:13"},
        ],
        "importance": (
            "Moses let Pharaoh choose when the frogs would go, 'that thou mayest know that there is "
            "none like unto the LORD our God' (Exodus 8:10). Each plague showed the LORD's power "
            "over what Egypt trusted."),
        "lesson": "Don't make promises to God in trouble and forget them when relief comes (Exodus 8:15).",
        "key_verses": ["Exodus 8:6", "Psalms 78:45"],
    },

    # ------------------------------------------------------------------ creeping things
    {
        "name": "Serpent",
        "group": "Creeping things",
        "epithet": "The tempter and the bronze snake",
        "terms": r"\bserpents?\b|\bserpent's\b|\badders?\b|\basps?\b|\bvipers?\b|\bcockatrices?\b",
        "summary": "Snakes, including deadly vipers, were common in the deserts and fields of Israel. In the Bible the serpent is both a real danger and a picture of the enemy.",
        "uses": [
            "A danger in the desert",
            "The bronze serpent on a pole, which brought healing",
        ],
        "why": (
            "The Bible's first enemy speaks through a serpent in Eden, and the devil is later called "
            "'that old serpent'. Yet God also used a bronze serpent lifted on a pole to heal, and "
            "Jesus said he would be lifted up the same way."),
        "who": [
            {"who": "Eve", "what": "was deceived by the serpent in the garden", "reference": "Genesis 3:1-4"},
            {"who": "Moses", "hero": "moses", "what": "made a serpent of brass; whoever looked at it lived", "reference": "Numbers 21:9"},
            {"who": "Hezekiah", "hero": "hezekiah", "what": "broke the bronze serpent in pieces when Israel began to worship it", "reference": "2 Kings 18:4"},
            {"who": "Paul", "hero": "paul", "what": "shook a viper off his hand into the fire on Malta", "reference": "Acts 28:3-5"},
            {"who": "Satan", "hero": "satan", "what": "is called 'that old serpent'", "reference": "Revelation 12:9"},
        ],
        "importance": (
            "The first promise of the gospel is spoken to the serpent: the woman's seed would bruise "
            "its head (Genesis 3:15). And Jesus used the bronze serpent to explain his cross: 'as "
            "Moses lifted up the serpent in the wilderness, even so must the Son of man be lifted "
            "up'."),
        "lesson": "Look and live. A bitten Israelite only had to look at the serpent God lifted up; we look to Christ (Numbers 21:8; John 3:14-15).",
        "key_verses": ["Numbers 21:9", "John 3:14"],
    },
    {
        "name": "Locust",
        "group": "Creeping things",
        "epithet": "The army that eats everything",
        "terms": r"\blocusts?\b|\bgrasshoppers?\b|\bpalmerworm\b|\bcankerworm\b|\bcaterpillers?\b",
        "law": "Clean: one of the few insects Israel could eat (Leviticus 11:22).",
        "summary": "Desert locusts swarm in their millions and strip every green thing; the Bible describes them like an invading army.",
        "uses": [
            "Food: locusts were among the insects the Law allowed",
            "John the Baptist lived on locusts and wild honey",
        ],
        "why": (
            "Locust swarms were one of the most feared disasters of the ancient world. They were the "
            "eighth plague on Egypt, and Joel saw a locust plague as a warning of the day of the "
            "LORD."),
        "who": [
            {"who": "Moses", "hero": "moses", "what": "brought the plague of locusts on Egypt", "reference": "Exodus 10:12-15"},
            {"who": "The ten spies", "what": "said, 'we were in our own sight as grasshoppers'", "reference": "Numbers 13:33"},
            {"who": "Joel", "what": "saw the land stripped by locusts and called Israel back to God", "reference": "Joel 1:4"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "ate locusts and wild honey", "reference": "Matthew 3:4"},
        ],
        "importance": (
            "After the devastation, God made a promise through Joel: 'I will restore to you the "
            "years that the locust hath eaten' (Joel 2:25)."),
        "lesson": "God can restore what has been devoured. No loss is beyond his power to repay.",
        "key_verses": ["Joel 2:25", "Matthew 3:4"],
    },
    {
        "name": "Bees and honey",
        "group": "Creeping things",
        "epithet": "Sweetness from the rock",
        "terms": r"\bbees?\b|\bhoney\b|\bhoneycomb\b",
        "summary": "Wild bees nested in rocks and trees, and their honey was the sweetest thing Israel knew: the land 'flowing with milk and honey'.",
        "uses": [
            "Honey for food and sweetening",
            "A gift of the land's best",
            "Kept out of offerings burned on the altar",
        ],
        "why": (
            "Honey stood for the richness of the Promised Land and for the sweetness of God's word: "
            "'sweeter also than honey and the honeycomb'. Swarming, stinging bees pictured enemies "
            "on the attack."),
        "who": [
            {"who": "Samson", "what": "found a swarm of bees and honey in the carcass of a lion", "reference": "Judges 14:8"},
            {"who": "Jonathan", "hero": "jonathan", "what": "tasted honey in the forest, not knowing Saul's rash oath", "reference": "1 Samuel 14:27"},
            {"who": "Ezekiel", "what": "ate a scroll that tasted as sweet as honey", "reference": "Ezekiel 3:3"},
            {"who": "John the Baptist", "hero": "john-the-baptist", "what": "ate locusts and wild honey", "reference": "Mark 1:6"},
        ],
        "importance": (
            "God described the Promised Land as 'a land flowing with milk and honey' (Exodus 3:8). "
            "The psalmist found God's word sweeter still (Psalm 19:10; 119:103)."),
        "lesson": "'How sweet are thy words unto my taste! yea, sweeter than honey to my mouth!' (Psalm 119:103).",
        "key_verses": ["Exodus 3:8", "Psalms 119:103"],
    },
    {
        "name": "Ant",
        "group": "Creeping things",
        "epithet": "The wise worker",
        "terms": r"\bants?\b",
        "summary": "The harvester ants of Israel gather seeds in summer and store them underground for the winter.",
        "uses": [
            "None to people, but a lesson for them",
        ],
        "why": (
            "Solomon sent the lazy man to the ant: without any ruler over her, she lays up her food "
            "in summer. Small and weak, the ant is 'exceeding wise'."),
        "who": [
            {"who": "Solomon", "what": "told the sluggard, 'Go to the ant… consider her ways, and be wise'", "reference": "Proverbs 6:6-8"},
            {"who": "Agur", "what": "counted the ants among four small but wise creatures", "reference": "Proverbs 30:24-25"},
        ],
        "importance": (
            "The ant appears only twice, both times in Proverbs, but its lesson is plain: diligence "
            "and foresight, not size, make a creature wise."),
        "lesson": "Do today's work while it is summer. Faithfulness in small things prepares for hard seasons.",
        "key_verses": ["Proverbs 6:6-8", "Proverbs 30:25"],
    },
    {
        "name": "Scorpion",
        "group": "Creeping things",
        "epithet": "The sting in the wilderness",
        "terms": r"\bscorpions?\b",
        "summary": "Scorpions hid under stones in the deserts of Sinai and Judea; their sting was painful and sometimes deadly.",
        "uses": [
            "None: a danger in the desert",
        ],
        "why": (
            "Scorpions marked the wilderness as 'great and terrible'. Jesus used them to show the "
            "Father's goodness: no father gives his child a scorpion when he asks for an egg."),
        "who": [
            {"who": "Moses", "hero": "moses", "what": "reminded Israel how God led them through a land of serpents and scorpions", "reference": "Deuteronomy 8:15"},
            {"who": "Rehoboam", "what": "threatened to chastise Israel 'with scorpions'", "reference": "1 Kings 12:11"},
            {"who": "Ezekiel", "what": "was told not to fear though he lived among scorpions", "reference": "Ezekiel 2:6"},
            {"who": "The seventy", "what": "were given power to tread on serpents and scorpions", "reference": "Luke 10:19"},
        ],
        "importance": (
            "'If a son… shall ask an egg, will he offer him a scorpion? If ye then, being evil, know "
            "how to give good gifts unto your children: how much more shall your heavenly Father "
            "give the Holy Spirit to them that ask him?' (Luke 11:11-13)."),
        "lesson": "Ask God boldly. He is a better Father than any on earth, and he gives good gifts.",
        "key_verses": ["Luke 11:12", "Deuteronomy 8:15"],
    },
]
