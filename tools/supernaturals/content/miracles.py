"""Miracles: power over nature, food and plenty, healings, the dead raised.

Each entry: name, group, testament (Old/New), epithet, by (who did it: {name,
hero?}), with (others involved, optional), for (who it was for), where
(optional), told_in (the main passage), also_in (parallel accounts and other
places that tell it), summary, story (what happened), meaning (why it
matters), lesson, key_verses. `hero` is an id on heroes-and-villains.html.
"""

MIRACLES = [
    # ------------------------------------------------------------------ power over nature
    {
        "name": "The Red Sea parted",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "A road through the sea",
        "by": [{"name": "The LORD, through Moses", "hero": "moses"}],
        "with": [{"name": "Pharaoh", "hero": "pharaoh"}],
        "for": "Israel, trapped between the sea and Pharaoh's army",
        "where": "The Red Sea",
        "told_in": "Exodus 14:10-31",
        "also_in": ["Hebrews 11:29"],
        "summary": "With Pharaoh's chariots behind them and the sea in front, Israel watched God open a dry path through the water.",
        "story": (
            "Pharaoh changed his mind and chased the freed slaves with six hundred chosen chariots. "
            "Trapped against the sea, the people panicked. Moses said, 'Fear ye not, stand still, and "
            "see the salvation of the LORD.' He stretched out his hand; a strong east wind blew all "
            "night, the waters divided, and Israel walked through on dry ground with a wall of water "
            "on each side. When the Egyptians followed, the sea came back and covered them."),
        "meaning": (
            "The crossing of the Red Sea is the great rescue of the Old Testament, the moment Israel "
            "was born as a free people. The psalms and prophets look back to it again and again, and "
            "Paul sees in it a picture of baptism (1 Corinthians 10:1-2)."),
        "lesson": "When there is no way forward, God can make one. Sometimes our part is to stand still and see his salvation.",
        "key_verses": ["Exodus 14:13", "Exodus 14:21"],
    },
    {
        "name": "Water from the rock",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "Water in the wilderness",
        "by": [{"name": "The LORD, through Moses", "hero": "moses"}],
        "for": "A thirsty nation in the desert",
        "where": "Rephidim, at Horeb; later at Kadesh",
        "told_in": "Exodus 17:1-7",
        "also_in": ["Numbers 20:2-13"],
        "summary": "When Israel had no water and was ready to stone Moses, God told him to strike a rock, and water poured out for the whole people.",
        "story": (
            "At Rephidim there was no water, and the people turned on Moses: 'Wherefore is this that "
            "thou hast brought us up out of Egypt, to kill us and our children and our cattle with "
            "thirst?' God told him to take the rod he had struck the river with and strike the rock "
            "in Horeb, and water came out for the people to drink. Moses named the place Massah and "
            "Meribah, because they had asked, 'Is the LORD among us, or not?' Years later at Kadesh, "
            "told to speak to a rock, Moses struck it twice in anger. The water still came, but he "
            "was barred from leading Israel into the land."),
        "meaning": (
            "Paul says Israel in the desert 'drank of that spiritual Rock that followed them: and that "
            "Rock was Christ' (1 Corinthians 10:4). Jesus later offered living water to everyone who "
            "thirsts (John 7:37-38)."),
        "lesson": "God meets real needs, even when we complain. But he asks us to trust and obey him exactly, as Moses learned at Meribah.",
        "key_verses": ["Exodus 17:6", "1 Corinthians 10:4"],
    },
    {
        "name": "Manna from heaven",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "Bread from heaven",
        "by": [{"name": "The LORD, through Moses", "hero": "moses"}],
        "for": "Israel, for forty years in the wilderness",
        "where": "The wilderness of Sin, and every camp after it",
        "told_in": "Exodus 16:1-36",
        "also_in": ["Numbers 11:4-9", "Joshua 5:12", "John 6:30-35"],
        "summary": "Every morning for forty years, small white flakes covered the ground around Israel's camp: bread God sent from heaven.",
        "story": (
            "A month after leaving Egypt, the people grumbled that they would rather have died by the "
            "fleshpots of Egypt. God said, 'I will rain bread from heaven for you.' Each morning, when "
            "the dew lifted, a small round thing lay on the ground. 'They wist not what it was', and "
            "it was called manna. They gathered enough for each day and twice as much on the sixth "
            "day; what was kept overnight bred worms, except on the sabbath. It tasted like wafers "
            "made with honey, and it did not stop until they ate the grain of Canaan."),
        "meaning": (
            "The manna taught Israel to depend on God one day at a time: 'man doth not live by bread "
            "only, but by every word that proceedeth out of the mouth of the LORD' (Deuteronomy 8:3). "
            "Jesus quoted those words when he was tempted, and called himself 'the bread of life'."),
        "lesson": "Ask for daily bread, and trust God for tomorrow. Manna could not be stored up.",
        "key_verses": ["Exodus 16:4", "Deuteronomy 8:3", "John 6:35"],
    },
    {
        "name": "The sun stands still",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "The longest day",
        "by": [{"name": "The LORD, at Joshua's prayer", "hero": "joshua"}],
        "for": "Israel, fighting to defend Gibeon",
        "where": "Gibeon and the valley of Ajalon",
        "told_in": "Joshua 10:6-14",
        "summary": "In battle against five Amorite kings, Joshua asked God to hold back the sun, and the day was lengthened until Israel had won.",
        "story": (
            "Five Amorite kings attacked Gibeon, which had made peace with Israel. Joshua marched all "
            "night and routed them, and the LORD cast down great hailstones on the fleeing army; more "
            "died from the hail than by the sword. Then Joshua spoke in the sight of Israel: 'Sun, "
            "stand thou still upon Gibeon; and thou, Moon, in the valley of Ajalon.' The sun stayed "
            "in the midst of heaven, and did not go down for about a whole day."),
        "meaning": (
            "'There was no day like that before it or after it, that the LORD hearkened unto the "
            "voice of a man' (Joshua 10:14). The miracle is less about the sun than about God "
            "listening to one man's bold prayer."),
        "lesson": "Pray boldly. The God who made the sun listens to the voice of his servants.",
        "key_verses": ["Joshua 10:12", "Joshua 10:14"],
    },
    {
        "name": "Fire on Mount Carmel",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "The God that answereth by fire",
        "by": [{"name": "The LORD, at Elijah's prayer", "hero": "elijah"}],
        "with": [{"name": "Ahab", "hero": "ahab"}],
        "for": "Israel, torn between the LORD and Baal",
        "where": "Mount Carmel",
        "told_in": "1 Kings 18:17-40",
        "also_in": ["James 5:17-18"],
        "summary": "Elijah challenged 450 prophets of Baal: the god who answered by fire would be God. Baal was silent; the LORD's fire fell.",
        "story": (
            "In the third year of drought Elijah gathered Israel and the prophets of Baal on Mount "
            "Carmel: 'How long halt ye between two opinions?' Each side would prepare a bullock, and "
            "'the God that answereth by fire, let him be God.' Baal's prophets cried and cut "
            "themselves from morning until evening, until 'there was neither voice, nor any to "
            "answer'. Elijah rebuilt the LORD's altar with twelve stones, soaked it three times with "
            "water, and prayed a short prayer. The fire of the LORD fell and burned up the "
            "sacrifice, the wood, the stones, the dust and the water. The people fell on their faces: "
            "'The LORD, he is the God.'"),
        "meaning": (
            "Carmel was a showdown between the living God and a dead idol, staged in front of a "
            "nation that wanted both. James holds up Elijah as 'a man subject to like passions as we "
            "are' whose prayer God heard (James 5:17)."),
        "lesson": "You cannot follow two gods. Choose the one who answers.",
        "key_verses": ["1 Kings 18:21", "1 Kings 18:38-39"],
    },
    {
        "name": "The axe head floats",
        "group": "Power over nature",
        "testament": "Old",
        "epithet": "It was borrowed",
        "by": [{"name": "Elisha"}],
        "for": "One of the sons of the prophets",
        "where": "The river Jordan",
        "told_in": "2 Kings 6:1-7",
        "summary": "A young prophet lost a borrowed iron axe head in the Jordan. Elisha threw in a stick, and the iron floated up.",
        "story": (
            "The sons of the prophets needed a bigger place to live, so they went down to the Jordan "
            "to cut beams. As one was felling a tree, the iron axe head flew off into the water. "
            "'Alas, master! for it was borrowed.' Elisha asked where it fell, cut a stick, threw it "
            "in, 'and the iron did swim'. He told the man to take it up, and he did."),
        "meaning": (
            "It is one of the smallest miracles in the Bible: no army, no nation, just a poor "
            "student's borrowed tool. It shows a God who cares about ordinary losses as well as "
            "great battles."),
        "lesson": "Nothing is too small to bring to God. He cares about the borrowed axe head as well as the parted sea.",
        "key_verses": ["2 Kings 6:5-6"],
    },
    {
        "name": "Jesus calms the storm",
        "group": "Power over nature",
        "testament": "New",
        "epithet": "Peace, be still",
        "by": [{"name": "Jesus"}],
        "for": "His disciples, sinking in a storm",
        "where": "The Sea of Galilee",
        "told_in": "Mark 4:35-41",
        "also_in": ["Matthew 8:23-27", "Luke 8:22-25"],
        "summary": "A violent storm filled the disciples' boat while Jesus slept. He woke, rebuked the wind, and the sea went calm.",
        "story": (
            "At evening Jesus said, 'Let us pass over unto the other side.' A great storm of wind "
            "arose, and the waves beat into the ship until it was full. Jesus was asleep on a pillow "
            "in the stern. They woke him: 'Master, carest thou not that we perish?' He rebuked the "
            "wind and said to the sea, 'Peace, be still.' The wind stopped and there was a great "
            "calm. 'Why are ye so fearful? how is it that ye have no faith?' They feared greatly: "
            "'What manner of man is this, that even the wind and the sea obey him?'"),
        "meaning": (
            "In the Old Testament it is God who rules the raging of the sea (Psalm 89:9; 107:29). "
            "When the wind obeys Jesus, the disciples' question answers itself: this is more than "
            "a man."),
        "lesson": "Jesus is in the boat. Storms come to those who follow him, but they cannot sink the one who says 'Peace, be still'.",
        "key_verses": ["Mark 4:39", "Mark 4:41"],
    },
    {
        "name": "Jesus walks on the water",
        "group": "Power over nature",
        "testament": "New",
        "epithet": "Be of good cheer; it is I",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "for": "His disciples, rowing against the wind",
        "where": "The Sea of Galilee",
        "told_in": "Matthew 14:22-33",
        "also_in": ["Mark 6:45-52", "John 6:15-21"],
        "summary": "In the night Jesus came to his disciples walking on the sea, and Peter walked on the water to meet him until he looked at the wind.",
        "story": (
            "After feeding the five thousand, Jesus sent the disciples across the lake and went up a "
            "mountain to pray. In the fourth watch of the night, with the ship tossed by the waves, "
            "he came to them walking on the sea. They cried out in fear, thinking he was a spirit. "
            "'Be of good cheer; it is I; be not afraid.' Peter said, 'Lord, if it be thou, bid me "
            "come unto thee on the water.' He walked on the water towards Jesus, but when he saw the "
            "wind boisterous he was afraid and began to sink: 'Lord, save me.' Jesus caught him: 'O "
            "thou of little faith, wherefore didst thou doubt?'"),
        "meaning": (
            "When they were back in the ship and the wind stopped, the disciples worshipped him: "
            "'Of a truth thou art the Son of God' (Matthew 14:33)."),
        "lesson": "Keep your eyes on Jesus, not the wind. And when you sink, one short prayer is enough: 'Lord, save me.'",
        "key_verses": ["Matthew 14:27", "Matthew 14:30-31"],
    },

    # ------------------------------------------------------------------ food and plenty
    {
        "name": "The widow's flour and oil",
        "group": "Food and plenty",
        "testament": "Old",
        "epithet": "The barrel that did not run out",
        "by": [{"name": "The LORD, through Elijah", "hero": "elijah"}],
        "for": "A starving widow of Zarephath and her son",
        "where": "Zarephath, near Sidon",
        "told_in": "1 Kings 17:8-16",
        "also_in": ["Luke 4:25-26"],
        "summary": "In a famine, a widow shared her last meal with Elijah, and her flour and oil did not run out until the rain came.",
        "story": (
            "God sent Elijah to Zarephath, a Gentile town, where a widow was gathering sticks to "
            "cook her last handful of meal for herself and her son, 'that we may eat it, and die'. "
            "Elijah asked her to make him a little cake first, with a promise: 'The barrel of meal "
            "shall not waste, neither shall the cruse of oil fail, until the day that the LORD "
            "sendeth rain upon the earth.' She did as he said, and she, her household and Elijah "
            "ate many days."),
        "meaning": (
            "Jesus pointed to this widow in his first sermon at Nazareth: there were many widows in "
            "Israel, but Elijah was sent only to a woman of Sidon (Luke 4:25-26). God's care reached "
            "beyond Israel long before the gospel did."),
        "lesson": "Giving from the little you have is not the end of your supply. God keeps faith with those who trust him first.",
        "key_verses": ["1 Kings 17:14", "1 Kings 17:16"],
    },
    {
        "name": "The pot of oil",
        "group": "Food and plenty",
        "testament": "Old",
        "epithet": "Borrow empty vessels",
        "by": [{"name": "Elisha"}],
        "for": "A prophet's widow about to lose her sons to a creditor",
        "told_in": "2 Kings 4:1-7",
        "summary": "A widow's one pot of oil filled every jar she could borrow, and paid off her debt.",
        "story": (
            "The widow of one of the sons of the prophets came to Elisha: her husband was dead, and "
            "a creditor was coming to take her two sons as slaves. All she had was a pot of oil. "
            "Elisha told her to borrow empty vessels from all her neighbours, 'borrow not a few', "
            "shut the door and pour. She poured until every vessel was full, 'and the oil stayed'. "
            "She sold the oil, paid the debt, and lived on the rest."),
        "meaning": (
            "The oil stopped only when the vessels ran out: the miracle was as large as her faith in "
            "gathering jars. The Law told Israel to care for the widow and the fatherless; here God "
            "does it himself."),
        "lesson": "Bring God your empty vessels, and not a few. His supply is limited only by our room to receive it.",
        "key_verses": ["2 Kings 4:6"],
    },
    {
        "name": "Water into wine",
        "group": "Food and plenty",
        "testament": "New",
        "epithet": "The beginning of miracles",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Mary, his mother", "hero": "mary-mother-of-jesus"}],
        "for": "A wedding that ran out of wine",
        "where": "Cana in Galilee",
        "told_in": "John 2:1-11",
        "summary": "At a wedding in Cana, Jesus turned six great stone jars of water into the best wine of the feast.",
        "story": (
            "When the wine ran out, Mary told Jesus, and then told the servants, 'Whatsoever he "
            "saith unto you, do it.' Jesus had them fill six stone waterpots, kept for Jewish "
            "washing, to the brim, then draw some out and take it to the governor of the feast. He "
            "tasted it and called the bridegroom: 'Every man at the beginning doth set forth good "
            "wine… but thou hast kept the good wine until now.'"),
        "meaning": (
            "John calls it the 'beginning of miracles', where Jesus 'manifested forth his glory; and "
            "his disciples believed on him'. Water kept for the old washing rites became the best "
            "wine: what Jesus brings is better than what went before."),
        "lesson": "'Whatsoever he saith unto you, do it.' Mary's advice to the servants is good advice for everyone.",
        "key_verses": ["John 2:5", "John 2:11"],
    },
    {
        "name": "Feeding the five thousand",
        "group": "Food and plenty",
        "testament": "New",
        "epithet": "Five loaves and two fishes",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Andrew and Philip"}],
        "for": "A hungry crowd of about five thousand men, besides women and children",
        "where": "A grassy place by the Sea of Galilee",
        "told_in": "John 6:1-14",
        "also_in": ["Matthew 14:13-21", "Mark 6:30-44", "Luke 9:10-17"],
        "summary": "Apart from the resurrection, the only miracle told in all four Gospels: Jesus fed a huge crowd with five loaves and two fish.",
        "story": (
            "A great crowd followed Jesus to a remote place. He asked Philip, 'Whence shall we buy "
            "bread, that these may eat?' Philip reckoned two hundred pennyworth would not be enough. "
            "Andrew found a boy with five barley loaves and two small fishes, 'but what are they "
            "among so many?' Jesus had the people sit down on the grass, gave thanks, and handed out "
            "bread and fish, as much as they wanted. Afterwards the disciples filled twelve baskets "
            "with the fragments."),
        "meaning": (
            "The next day Jesus explained the sign: 'I am the bread of life: he that cometh to me "
            "shall never hunger' (John 6:35). The crowd wanted more bread; he offered them himself."),
        "lesson": "Give Jesus what you have, even if it looks like nothing among so many. In his hands it is more than enough.",
        "key_verses": ["John 6:9", "John 6:11"],
    },
    {
        "name": "The great catch of fish",
        "group": "Food and plenty",
        "testament": "New",
        "epithet": "Launch out into the deep",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "for": "Fishermen who had caught nothing all night",
        "where": "The lake of Gennesaret",
        "told_in": "Luke 5:1-11",
        "summary": "After a night of catching nothing, Peter let down his nets at Jesus' word and caught so many fish the nets broke.",
        "story": (
            "Jesus taught the crowd from Simon's boat, then told him, 'Launch out into the deep, and "
            "let down your nets for a draught.' Simon answered, 'Master, we have toiled all the "
            "night, and have taken nothing: nevertheless at thy word I will let down the net.' The "
            "catch was so great the net broke and two boats began to sink. Peter fell at Jesus' "
            "knees: 'Depart from me; for I am a sinful man, O Lord.' Jesus said, 'Fear not; from "
            "henceforth thou shalt catch men.' They left everything and followed him."),
        "meaning": (
            "The miracle was Peter's call. Faced with Jesus' power, he saw his own sin, and Jesus "
            "answered not with 'depart' but with a new life's work."),
        "lesson": "Obey even when your experience says it's pointless: 'nevertheless at thy word'.",
        "key_verses": ["Luke 5:5", "Luke 5:10"],
    },
    {
        "name": "The coin in the fish's mouth",
        "group": "Food and plenty",
        "testament": "New",
        "epithet": "For me and thee",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "for": "Peter, asked about the temple tax",
        "where": "Capernaum",
        "told_in": "Matthew 17:24-27",
        "summary": "Asked whether Jesus paid the temple tax, Peter was sent fishing, and the first fish had a coin in its mouth to pay for them both.",
        "story": (
            "At Capernaum the collectors asked Peter, 'Doth not your master pay tribute?' Jesus "
            "explained that kings' children are free from such taxes, but 'lest we should offend "
            "them' he told Peter to cast a hook, take the first fish and open its mouth: 'thou shalt "
            "find a piece of money: that take, and give unto them for me and thee.'"),
        "meaning": (
            "As the Son of the house, Jesus owed no tax for his Father's temple, yet he paid it "
            "rather than cause offence, and provided Peter's share as well."),
        "lesson": "Freedom does not insist on its rights. Jesus gave what he did not owe rather than put a stumbling block in anyone's way.",
        "key_verses": ["Matthew 17:27"],
    },

    # ------------------------------------------------------------------ healings
    {
        "name": "Naaman healed of leprosy",
        "group": "Healings",
        "testament": "Old",
        "epithet": "Wash in the Jordan seven times",
        "by": [{"name": "The LORD, through Elisha"}],
        "with": [{"name": "A captive Israelite girl"}],
        "for": "Naaman, commander of the Syrian army",
        "where": "The river Jordan",
        "told_in": "2 Kings 5:1-19",
        "also_in": ["Luke 4:27"],
        "summary": "A proud Syrian general was healed of leprosy when he humbled himself and washed seven times in the Jordan.",
        "story": (
            "Naaman was a great man in Syria, but a leper. A little Israelite girl, taken captive, "
            "told his wife about the prophet in Samaria. Naaman came with horses, chariots and gifts, "
            "but Elisha did not even come out; he sent word, 'Go and wash in the Jordan seven times.' "
            "Naaman stormed off: were not Abana and Pharpar, rivers of Damascus, better? His servants "
            "reasoned with him, and he went down and dipped seven times, 'and his flesh came again "
            "like unto the flesh of a little child, and he was clean'. He came back: 'now I know "
            "that there is no God in all earth, but in Israel.'"),
        "meaning": (
            "Jesus named Naaman in Nazareth: there were many lepers in Israel, but only the Syrian "
            "was cleansed (Luke 4:27). Healing came to an enemy commander through the faith of a "
            "captive girl."),
        "lesson": "God's cure often starts with humbling our pride. Naaman had to do something simple and beneath him.",
        "key_verses": ["2 Kings 5:14", "2 Kings 5:15"],
    },
    {
        "name": "Hezekiah healed",
        "group": "Healings",
        "testament": "Old",
        "epithet": "Fifteen more years",
        "by": [{"name": "The LORD, through Isaiah"}],
        "with": [{"name": "Hezekiah", "hero": "hezekiah"}],
        "for": "King Hezekiah, sick unto death",
        "where": "Jerusalem",
        "told_in": "2 Kings 20:1-11",
        "also_in": ["Isaiah 38:1-8"],
        "summary": "Told he would die, King Hezekiah wept and prayed. God gave him fifteen more years, and turned back the shadow on the sundial as a sign.",
        "story": (
            "Isaiah came to the sick king with a hard word: 'Set thine house in order; for thou "
            "shalt die, and not live.' Hezekiah turned his face to the wall, prayed and wept. Before "
            "Isaiah had left the middle court, God sent him back: 'I have heard thy prayer, I have "
            "seen thy tears: behold, I will heal thee.' A lump of figs was laid on the boil, and as "
            "a sign the shadow went back ten degrees on the dial of Ahaz."),
        "meaning": (
            "God heard a king's tears and changed what he had announced. Yet the added years were "
            "mixed: Hezekiah showed off his treasures to envoys from Babylon (2 Kings 20:12-19), "
            "and his son Manasseh, born in those years, became Judah's worst king."),
        "lesson": "Pray honestly, tears and all. God hears, and his answer is wiser than our request.",
        "key_verses": ["2 Kings 20:5", "2 Kings 20:11"],
    },
    {
        "name": "A leper made clean",
        "group": "Healings",
        "testament": "New",
        "epithet": "I will; be thou clean",
        "by": [{"name": "Jesus"}],
        "for": "A man full of leprosy",
        "where": "Galilee",
        "told_in": "Mark 1:40-45",
        "also_in": ["Matthew 8:1-4", "Luke 5:12-16"],
        "summary": "A leper knelt and said, 'If thou wilt, thou canst make me clean.' Jesus touched him, and he was clean.",
        "story": (
            "Lepers had to live apart and cry 'Unclean' (Leviticus 13:45-46). This one came right up "
            "to Jesus and knelt: 'If thou wilt, thou canst make me clean.' Moved with compassion, "
            "Jesus put out his hand and touched him: 'I will; be thou clean.' At once the leprosy "
            "left him. Jesus sent him to the priest with the offering Moses commanded, as a "
            "testimony."),
        "meaning": (
            "Anyone who touched a leper became unclean. Jesus touched him anyway, and instead of the "
            "uncleanness passing to Jesus, cleanness passed to the man."),
        "lesson": "Never doubt whether Jesus is willing. His answer to the leper was 'I will'.",
        "key_verses": ["Mark 1:40-41"],
    },
    {
        "name": "Through the roof",
        "group": "Healings",
        "testament": "New",
        "epithet": "Thy sins be forgiven thee",
        "by": [{"name": "Jesus"}],
        "for": "A man sick of the palsy, carried by four friends",
        "where": "A crowded house in Capernaum",
        "told_in": "Mark 2:1-12",
        "also_in": ["Matthew 9:1-8", "Luke 5:17-26"],
        "summary": "Four friends broke open a roof to lower a paralysed man to Jesus, who forgave his sins and then told him to walk.",
        "story": (
            "The house was so packed that no one could reach the door. So four men carrying a "
            "paralysed friend went up on the roof, broke it open, and let his bed down in front of "
            "Jesus. 'When Jesus saw their faith', he said, 'Son, thy sins be forgiven thee.' Some "
            "scribes thought, 'who can forgive sins but God only?' Jesus answered by healing him, "
            "'that ye may know that the Son of man hath power on earth to forgive sins… Arise, and "
            "take up thy bed.' The man got up and walked out in front of them all."),
        "meaning": (
            "The healing was the proof of a bigger claim. Anyone can say 'your sins are forgiven'; "
            "Jesus showed he had the authority by doing what could be seen."),
        "lesson": "Bring your friends to Jesus, even if you have to make a hole in the roof. He saw their faith.",
        "key_verses": ["Mark 2:5", "Mark 2:10-11"],
    },
    {
        "name": "The centurion's servant",
        "group": "Healings",
        "testament": "New",
        "epithet": "Say in a word",
        "by": [{"name": "Jesus"}],
        "for": "A Roman centurion's dying servant",
        "where": "Capernaum",
        "told_in": "Luke 7:1-10",
        "also_in": ["Matthew 8:5-13"],
        "summary": "A Roman officer believed Jesus could heal his servant with a word, from a distance, and Jesus marvelled at his faith.",
        "story": (
            "A centurion in Capernaum, who loved the Jewish nation and had built them a synagogue, "
            "sent elders to ask Jesus to heal his dying servant. As Jesus neared the house, the "
            "centurion sent friends to say, 'Lord, trouble not thyself: for I am not worthy that "
            "thou shouldest enter under my roof… say in a word, and my servant shall be healed.' He "
            "knew about authority: he told soldiers 'Go', and they went. Jesus marvelled: 'I have "
            "not found so great faith, no, not in Israel.' The messengers returned to find the "
            "servant well."),
        "meaning": (
            "The greatest faith Jesus found in Israel belonged to a Gentile soldier. In Matthew, "
            "Jesus adds that many will come from east and west and sit down in the kingdom "
            "(Matthew 8:11)."),
        "lesson": "Jesus' word is enough. He does not need to be in the room to act.",
        "key_verses": ["Luke 7:7", "Luke 7:9"],
    },
    {
        "name": "The woman who touched his clothes",
        "group": "Healings",
        "testament": "New",
        "epithet": "Who touched my clothes?",
        "by": [{"name": "Jesus"}],
        "for": "A woman ill for twelve years",
        "where": "A crowd in Galilee",
        "told_in": "Mark 5:25-34",
        "also_in": ["Matthew 9:20-22", "Luke 8:43-48"],
        "summary": "A woman who had bled for twelve years touched Jesus' clothes in a crowd and was healed at once.",
        "story": (
            "She had suffered for twelve years, spent all she had on physicians, and only grew "
            "worse. Her illness made her unclean, so she came secretly through the crowd: 'If I may "
            "touch but his clothes, I shall be whole.' She touched, and felt in her body that she "
            "was healed. Jesus turned: 'Who touched my clothes?' Trembling, she fell down and told "
            "him all the truth. He said, 'Daughter, thy faith hath made thee whole; go in peace, and "
            "be whole of thy plague.'"),
        "meaning": (
            "Jesus would not let her slip away healed but hidden. He called her out, not to shame "
            "her, but to call her 'Daughter' in front of everyone and send her home in peace."),
        "lesson": "Reach out to Jesus, even with trembling faith. He wants to heal you and to know you.",
        "key_verses": ["Mark 5:28", "Mark 5:34"],
    },
    {
        "name": "Blind Bartimaeus",
        "group": "Healings",
        "testament": "New",
        "epithet": "Thou Son of David, have mercy",
        "by": [{"name": "Jesus"}],
        "for": "A blind beggar by the road out of Jericho",
        "where": "Jericho",
        "told_in": "Mark 10:46-52",
        "also_in": ["Matthew 20:29-34", "Luke 18:35-43"],
        "summary": "A blind beggar would not stop shouting for Jesus, and received his sight and followed him.",
        "story": (
            "As Jesus left Jericho with a crowd, blind Bartimaeus sat begging by the road. Hearing "
            "it was Jesus of Nazareth, he cried out, 'Jesus, thou Son of David, have mercy on me.' "
            "Many told him to be quiet; he cried all the more. Jesus stood still and called him. "
            "Throwing off his garment, he came. 'What wilt thou that I should do unto thee?' 'Lord, "
            "that I might receive my sight.' 'Go thy way; thy faith hath made thee whole.' At once "
            "he saw, and followed Jesus in the way."),
        "meaning": (
            "Bartimaeus called Jesus 'Son of David', a title for the Messiah, while many who could "
            "see missed who he was. His healing comes just before Jesus enters Jerusalem as king."),
        "lesson": "Keep calling, however many tell you to be quiet. Jesus stops for those who cry to him.",
        "key_verses": ["Mark 10:47", "Mark 10:52"],
    },
    {
        "name": "The man born blind",
        "group": "Healings",
        "testament": "New",
        "epithet": "One thing I know",
        "by": [{"name": "Jesus"}],
        "for": "A man blind from birth",
        "where": "Jerusalem, and the pool of Siloam",
        "told_in": "John 9:1-41",
        "summary": "Jesus healed a man blind from birth, and the man's plain testimony outargued the religious leaders.",
        "story": (
            "The disciples asked whose sin had caused his blindness. Jesus said neither his nor his "
            "parents', 'but that the works of God should be made manifest in him'. He spat on the "
            "ground, made clay, anointed the man's eyes and said, 'Go, wash in the pool of Siloam.' "
            "He came back seeing. The Pharisees questioned him, then his parents, then him again, "
            "and finally cast him out. His answer never changed: 'one thing I know, that, whereas I "
            "was blind, now I see.' Jesus found him afterwards, and he believed and worshipped him."),
        "meaning": (
            "Jesus said, 'I am the light of the world', and then gave sight to a man who had never "
            "seen. The real blindness in the story belongs to those who claimed to see "
            "(John 9:39-41)."),
        "lesson": "You don't need every answer to be a witness. Tell what Jesus has done for you.",
        "key_verses": ["John 9:5", "John 9:25"],
    },
    {
        "name": "Ten lepers",
        "group": "Healings",
        "testament": "New",
        "epithet": "Where are the nine?",
        "by": [{"name": "Jesus"}],
        "for": "Ten lepers, one of them a Samaritan",
        "where": "Between Samaria and Galilee",
        "told_in": "Luke 17:11-19",
        "summary": "Jesus healed ten lepers, but only one came back to thank him, and he was a Samaritan.",
        "story": (
            "Ten lepers stood far off and called, 'Jesus, Master, have mercy on us.' He told them, "
            "'Go shew yourselves unto the priests', and as they went, they were cleansed. One, "
            "seeing he was healed, turned back, glorified God with a loud voice and fell at Jesus' "
            "feet giving thanks. He was a Samaritan. Jesus asked, 'Were there not ten cleansed? but "
            "where are the nine?'"),
        "meaning": (
            "All ten were healed; only one heard, 'thy faith hath made thee whole' (Luke 17:19). "
            "Thanksgiving turned a healing into a relationship, and again the grateful one was the "
            "outsider."),
        "lesson": "Don't be one of the nine. Come back and say thank you.",
        "key_verses": ["Luke 17:15-16", "Luke 17:17"],
    },
    {
        "name": "The lame man at the Beautiful gate",
        "group": "Healings",
        "testament": "New",
        "epithet": "Such as I have give I thee",
        "by": [{"name": "Peter and John, in Jesus' name", "hero": "peter"}],
        "for": "A man lame from birth, begging at the temple",
        "where": "The Beautiful gate of the temple",
        "told_in": "Acts 3:1-10",
        "also_in": ["Acts 4:22"],
        "summary": "A man lame from birth, over forty years old, asked Peter and John for money and was given the power to walk.",
        "story": (
            "Every day a man lame from his mother's womb was carried to the Beautiful gate to beg. "
            "He asked Peter and John for alms. Peter looked at him: 'Silver and gold have I none; "
            "but such as I have give I thee: In the name of Jesus Christ of Nazareth rise up and "
            "walk.' He took him by the hand, and at once his feet and ankle bones received "
            "strength. He went into the temple 'walking, and leaping, and praising God'."),
        "meaning": (
            "The first healing told after Pentecost was done in Jesus' name, not the apostles' own "
            "power, and Peter said so to the crowd (Acts 3:12-16). It led to their first arrest, "
            "and to five thousand men believing (Acts 4:4)."),
        "lesson": "You may have no silver or gold, but you can give what you have received: Jesus.",
        "key_verses": ["Acts 3:6", "Acts 3:8"],
    },

    # ------------------------------------------------------------------ raised from the dead
    {
        "name": "The widow's son at Zarephath",
        "group": "Raised from the dead",
        "testament": "Old",
        "epithet": "See, thy son liveth",
        "by": [{"name": "The LORD, at Elijah's prayer", "hero": "elijah"}],
        "for": "The widow who had fed Elijah",
        "where": "Zarephath",
        "told_in": "1 Kings 17:17-24",
        "also_in": ["Hebrews 11:35"],
        "summary": "The first person in the Bible raised from the dead: a widow's son, brought back to life when Elijah prayed.",
        "story": (
            "The widow's son fell sick and died, and in her grief she turned on Elijah. He carried "
            "the boy up to his own room, laid him on his bed and cried to the LORD. He stretched "
            "himself on the child three times and prayed, 'let this child's soul come into him "
            "again.' The LORD heard, and the child revived. Elijah carried him down: 'See, thy son "
            "liveth.' She said, 'Now by this I know that thou art a man of God.'"),
        "meaning": (
            "The flour and oil kept her alive; now God gave back her son. Hebrews remembers such "
            "moments: 'Women received their dead raised to life again' (Hebrews 11:35)."),
        "lesson": "Bring your grief to God, even when it comes out as anger. He hears the cry of the bereaved.",
        "key_verses": ["1 Kings 17:22", "1 Kings 17:24"],
    },
    {
        "name": "The Shunammite's son",
        "group": "Raised from the dead",
        "testament": "Old",
        "epithet": "It is well",
        "by": [{"name": "The LORD, at Elisha's prayer"}],
        "for": "The woman of Shunem, who had made Elisha a room",
        "where": "Shunem",
        "told_in": "2 Kings 4:18-37",
        "summary": "A generous woman's long-awaited son died in her lap. Elisha prayed, and the boy sneezed seven times and opened his eyes.",
        "story": (
            "The boy was the promised son of a woman who had built a room for Elisha. One day in "
            "the harvest field he cried, 'My head, my head', and by noon he died on his mother's "
            "knees. She laid him on the prophet's bed and rode to Mount Carmel, and when she was "
            "asked, answered only, 'It is well.' Elisha came, shut the door, prayed, and stretched "
            "himself on the child until the flesh grew warm. Then 'the child sneezed seven times, "
            "and the child opened his eyes.'"),
        "meaning": (
            "Her 'It is well' was faith under grief. She went straight to the man of God and would "
            "not leave without him (2 Kings 4:30)."),
        "lesson": "Even in the worst moment, take your trouble straight to God and hold on.",
        "key_verses": ["2 Kings 4:26", "2 Kings 4:35"],
    },
    {
        "name": "Elisha's bones",
        "group": "Raised from the dead",
        "testament": "Old",
        "epithet": "Life from a grave",
        "by": [{"name": "The LORD, through the bones of Elisha"}],
        "for": "A dead man thrown into Elisha's grave",
        "told_in": "2 Kings 13:20-21",
        "summary": "Men burying a body in a hurry threw it into Elisha's tomb; when it touched his bones, the dead man stood up.",
        "story": (
            "Elisha died and was buried. The next spring, bands of Moabite raiders came into the "
            "land. Some men burying a dead man saw a band coming, threw the body into Elisha's "
            "sepulchre and fled. 'When the man was let down, and touched the bones of Elisha, he "
            "revived, and stood up on his feet.'"),
        "meaning": (
            "Even after Elisha died, God showed that the power had never been the prophet's own. "
            "The strangest raising in the Bible points past death to the God of the living."),
        "lesson": "God's power is not buried with his servants. What he began through them, he can still do.",
        "key_verses": ["2 Kings 13:21"],
    },
    {
        "name": "The widow's son at Nain",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "Weep not",
        "by": [{"name": "Jesus"}],
        "for": "A widow burying her only son",
        "where": "The gate of Nain",
        "told_in": "Luke 7:11-17",
        "summary": "Jesus met a funeral at the gate of Nain, stopped it, and gave a widow back her only son.",
        "story": (
            "A dead man was being carried out, 'the only son of his mother, and she was a widow', "
            "with a large crowd from the city. When the Lord saw her, he had compassion on her and "
            "said, 'Weep not.' He touched the bier, and the bearers stood still. 'Young man, I say "
            "unto thee, Arise.' The dead man sat up and began to speak, and Jesus delivered him to "
            "his mother. Fear came on all: 'God hath visited his people.'"),
        "meaning": (
            "No one asked Jesus for this miracle. He saw a widow who had lost her only son, and her "
            "future with him, and his compassion moved first."),
        "lesson": "Jesus sees the grieving before they ask. His first word to them is 'Weep not'.",
        "key_verses": ["Luke 7:13", "Luke 7:14-15"],
    },
    {
        "name": "Jairus' daughter",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "Talitha cumi",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter, James and John", "hero": "peter"}],
        "for": "The twelve-year-old daughter of a synagogue ruler",
        "where": "Capernaum",
        "told_in": "Mark 5:21-43",
        "also_in": ["Matthew 9:18-26", "Luke 8:40-56"],
        "summary": "A synagogue ruler begged Jesus to heal his dying daughter. She died before they arrived, and Jesus raised her.",
        "story": (
            "Jairus fell at Jesus' feet: his little daughter lay at the point of death. On the way, "
            "Jesus stopped for the woman who touched his clothes, and messengers came: 'Thy daughter "
            "is dead: why troublest thou the Master any further?' Jesus said, 'Be not afraid, only "
            "believe.' At the house the mourners laughed when he said she was sleeping. Taking only "
            "her parents and Peter, James and John, he took her hand: 'Talitha cumi… Damsel, I say "
            "unto thee, arise.' She got up and walked, and he told them to give her something to "
            "eat."),
        "meaning": (
            "The delay that seemed to cost Jairus his daughter was the healing of a woman who had "
            "been ill for twelve years, as long as the girl had been alive. Jesus was not too late."),
        "lesson": "'Be not afraid, only believe.' When the news is at its worst, listen to Jesus rather than the messengers.",
        "key_verses": ["Mark 5:36", "Mark 5:41"],
    },
    {
        "name": "Lazarus raised",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "Lazarus, come forth",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Martha and Mary"}],
        "for": "Lazarus of Bethany, four days dead",
        "where": "Bethany, near Jerusalem",
        "told_in": "John 11:1-44",
        "summary": "Four days after Lazarus was buried, Jesus called him out of the tomb.",
        "story": (
            "Jesus loved Martha, Mary and Lazarus, yet when he heard Lazarus was sick he stayed "
            "where he was two more days. By the time he reached Bethany, Lazarus had lain in the "
            "grave four days. Martha met him: 'Lord, if thou hadst been here, my brother had not "
            "died.' Jesus said, 'I am the resurrection, and the life.' At the tomb Jesus wept. He "
            "had the stone taken away, prayed, and cried with a loud voice, 'Lazarus, come forth.' "
            "The dead man came out, bound hand and foot in grave clothes. 'Loose him, and let him "
            "go.'"),
        "meaning": (
            "This was the last and greatest sign in John before the cross. It led many to believe, "
            "and it led the council to plan Jesus' death (John 11:45-53). He gave Lazarus life at "
            "the cost of his own."),
        "lesson": "Jesus weeps with us, and he raises the dead. Both are true, and he is 'the resurrection, and the life'.",
        "key_verses": ["John 11:25", "John 11:43-44"],
    },
    {
        "name": "Dorcas raised",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "Tabitha, arise",
        "by": [{"name": "Peter, in prayer", "hero": "peter"}],
        "for": "Tabitha, a disciple known for her good works",
        "where": "Joppa",
        "told_in": "Acts 9:36-42",
        "summary": "When a much-loved disciple who made clothes for widows died, Peter prayed and she came back to life.",
        "story": (
            "Tabitha, called Dorcas in Greek, was 'full of good works and almsdeeds'. When she died, "
            "the disciples at Joppa sent for Peter. The widows stood by weeping, showing him the "
            "coats and garments she had made. Peter put them all out, knelt and prayed, then turned "
            "to the body: 'Tabitha, arise.' She opened her eyes and sat up, and he presented her "
            "alive. It was known throughout Joppa, and many believed."),
        "meaning": (
            "Peter's words echo Jesus' 'Talitha cumi' in Jairus' house, where Peter had been. The "
            "same Lord was at work through his apostle."),
        "lesson": "A life of quiet kindness leaves a mark people cannot forget.",
        "key_verses": ["Acts 9:40"],
    },
    {
        "name": "Eutychus",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "The long sermon",
        "by": [{"name": "Paul", "hero": "paul"}],
        "for": "A young man who fell asleep during Paul's sermon",
        "where": "Troas",
        "told_in": "Acts 20:7-12",
        "summary": "A young man dozed off during Paul's long sermon, fell from a third-floor window and was taken up dead. Paul brought him back.",
        "story": (
            "On the first day of the week the believers at Troas met to break bread, and Paul, "
            "leaving the next day, preached until midnight. Eutychus, sitting in a window, sank into "
            "a deep sleep and fell from the third loft, 'and was taken up dead'. Paul went down, "
            "embraced him and said, 'Trouble not yourselves; for his life is in him.' Paul went back "
            "up, broke bread and talked until daybreak, and they brought the young man home alive, "
            "'and were not a little comforted'."),
        "meaning": (
            "Luke, who was there, tells it with a smile, and in passing shows the early church "
            "meeting on the first day of the week to break bread."),
        "lesson": "God's grace reaches even those who fall asleep in church.",
        "key_verses": ["Acts 20:9-10"],
    },
    {
        "name": "The resurrection of Jesus",
        "group": "Raised from the dead",
        "testament": "New",
        "epithet": "He is not here, but is risen",
        "by": [{"name": "God the Father"}],
        "with": [{"name": "Mary Magdalene", "hero": "mary-magdalene"}, {"name": "Peter", "hero": "peter"}],
        "for": "Everyone who believes",
        "where": "A garden tomb outside Jerusalem",
        "told_in": "Luke 24:1-12",
        "also_in": ["Matthew 28:1-10", "Mark 16:1-8", "John 20:1-18", "1 Corinthians 15:3-8"],
        "summary": "On the third day after his crucifixion, Jesus rose from the dead: the miracle on which the whole Christian faith stands.",
        "story": (
            "Early on the first day of the week, women came to the tomb with spices and found the "
            "stone rolled away and the body gone. Two men in shining garments said, 'Why seek ye the "
            "living among the dead? He is not here, but is risen.' Peter ran to the tomb and saw the "
            "linen clothes lying by themselves. That day and for forty days after, the risen Jesus "
            "appeared to Mary Magdalene, to Peter, to the disciples, and once to more than five "
            "hundred people at the same time."),
        "meaning": (
            "Every other raising in the Bible was a return to a life that would end again. Jesus "
            "rose never to die. 'If Christ be not raised, your faith is vain' (1 Corinthians 15:17), "
            "but he is: 'the firstfruits of them that slept'."),
        "lesson": "Death does not have the last word. Because he lives, those who belong to him will live too (John 14:19).",
        "key_verses": ["Luke 24:5-6", "1 Corinthians 15:20"],
    },
]
