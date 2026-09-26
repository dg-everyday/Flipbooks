"""Prophecies: words from God about what was still to come, and how they came true.

Same fields as miracles.py. `by` is who spoke it, `for` who it was spoken to,
`told_in` where it was spoken and `also_in` where it came true (or is recalled).
`story` gives the prophecy and what followed. `testament` is the Testament the
prophecy was spoken in, even when it was fulfilled in the New.
"""

PROPHECIES = [
    # ------------------------------------------------------------------ Old Testament
    {
        "name": "The first promise",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "It shall bruise thy head",
        "by": [{"name": "The LORD God"}],
        "with": [{"name": "Adam and Eve"}, {"name": "The serpent", "hero": "satan"}],
        "for": "The serpent, in the hearing of Adam and Eve",
        "where": "The garden of Eden",
        "told_in": "Genesis 3:1-15",
        "also_in": ["Galatians 4:4-5", "Hebrews 2:14-15", "Romans 16:20", "Revelation 12:9"],
        "summary": "On the day sin entered the world, God cursed the serpent and promised that a son of the woman would one day crush it.",
        "story": (
            "The serpent deceived Eve, and Adam ate with her. When the LORD God came to judge, he "
            "spoke first to the serpent: 'I will put enmity between thee and the woman, and between "
            "thy seed and her seed; it shall bruise thy head, and thou shalt bruise his heel.' A "
            "wounded heel for the woman's son; a crushed head for the serpent."),
        "meaning": (
            "Christians have long called this the first gospel. The whole Bible follows the line of "
            "that promised seed, until 'when the fulness of the time was come, God sent forth his "
            "Son, made of a woman' (Galatians 4:4). At the cross the serpent struck his heel; by the "
            "cross the Son destroyed 'him that had the power of death, that is, the devil' "
            "(Hebrews 2:14)."),
        "lesson": "God's answer to sin came in the same breath as his judgement on it. Hope was promised before the garden gate was shut.",
        "key_verses": ["Genesis 3:15", "Galatians 4:4"],
    },
    {
        "name": "Seven years of plenty, seven of famine",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "God will shortly bring it to pass",
        "by": [{"name": "Joseph, interpreting Pharaoh's dreams", "hero": "joseph"}],
        "with": [{"name": "Pharaoh", "hero": "pharaoh"}],
        "for": "Pharaoh and all Egypt",
        "where": "Pharaoh's court in Egypt",
        "told_in": "Genesis 41:1-36",
        "also_in": ["Genesis 41:47-57", "Genesis 45:4-8", "Psalms 105:16-22"],
        "summary": "Pharaoh dreamed of fat cows eaten by thin ones, and Joseph, brought up from prison, told him God was showing seven years of plenty followed by seven of famine.",
        "story": (
            "Pharaoh dreamed twice: seven fat cows eaten by seven thin ones, and seven full ears of "
            "corn swallowed by seven thin ones. None of his magicians could explain it. The chief "
            "butler remembered a Hebrew in prison, and Joseph was brought up: 'It is not in me: God "
            "shall give Pharaoh an answer of peace.' The two dreams were one: 'Behold, there come "
            "seven years of great plenty throughout all the land of Egypt: And there shall arise "
            "after them seven years of famine'. Joseph advised storing a fifth of every harvest, and "
            "Pharaoh set him over all Egypt. It came out exactly: 'the seven years of dearth began "
            "to come, according as Joseph had said'."),
        "meaning": (
            "The dream was doubled 'because the thing is established by God, and God will shortly "
            "bring it to pass' (Genesis 41:32). The famine brought Joseph's brothers to Egypt, and "
            "Joseph could tell them, 'God did send me before you to preserve life' (Genesis 45:5)."),
        "lesson": "God knows the lean years before they come, and he often prepares the rescue long before the need.",
        "key_verses": ["Genesis 41:16", "Genesis 41:32", "Genesis 41:54"],
    },
    {
        "name": "Josiah named before his birth",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Josiah by name",
        "by": [{"name": "A man of God out of Judah"}],
        "with": [{"name": "Jeroboam"}, {"name": "Josiah", "hero": "josiah"}],
        "for": "King Jeroboam, at his altar",
        "where": "The altar at Bethel",
        "told_in": "1 Kings 13:1-5",
        "also_in": ["2 Kings 23:15-18"],
        "summary": "A prophet whose name we are not told stood at Jeroboam's altar and foretold a king of David's line, Josiah by name, who would burn bones upon it. About three hundred years later, it happened.",
        "story": (
            "Jeroboam had set up golden calves and his own altar at Bethel. As he stood there to "
            "burn incense, a man of God from Judah cried out: 'O altar, altar, thus saith the LORD; "
            "Behold, a child shall be born unto the house of David, Josiah by name'. He gave a sign: "
            "the altar would split and its ashes pour out. Jeroboam stretched out his hand, 'Lay "
            "hold on him', and the hand dried up; the altar split just as the prophet had said. "
            "About three centuries later King Josiah broke down that altar and burned bones on it, "
            "'according to the word of the LORD which the man of God proclaimed'."),
        "meaning": (
            "Few prophecies are so precise: a king named, his family, the altar and what he would "
            "do on it, three hundred years ahead. When Josiah found the prophet's grave nearby, he "
            "left it alone: 'let no man move his bones' (2 Kings 23:18)."),
        "lesson": "God's word does not expire. What he says, he does, even if it takes three hundred years.",
        "key_verses": ["1 Kings 13:3", "2 Kings 23:16"],
    },
    {
        "name": "Dogs by the wall of Jezreel",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Hast thou found me, O mine enemy?",
        "by": [{"name": "Elijah", "hero": "elijah"}],
        "with": [{"name": "Ahab", "hero": "ahab"}, {"name": "Jezebel", "hero": "jezebel"}],
        "for": "King Ahab, after the murder of Naboth",
        "where": "Naboth's vineyard in Jezreel",
        "told_in": "1 Kings 21:17-29",
        "also_in": ["1 Kings 22:34-38", "2 Kings 9:30-37"],
        "summary": "After Jezebel had Naboth killed for his vineyard, Elijah met Ahab there and foretold that dogs would lick the king's blood and eat the queen.",
        "story": (
            "Ahab wanted Naboth's vineyard; Jezebel had Naboth stoned on false charges, and Ahab "
            "went down to take it. Elijah met him there: 'In the place where dogs licked the blood "
            "of Naboth shall dogs lick thy blood, even thine.' And of the queen: 'The dogs shall eat "
            "Jezebel by the wall of Jezreel.' Ahab humbled himself, and the full disaster on his "
            "house was delayed, but not cancelled. He died in battle, and when his chariot was "
            "washed in Samaria 'the dogs licked up his blood'. Years later Jezebel was thrown from "
            "a window at Jezreel, and when they went to bury her, almost nothing was left."),
        "meaning": (
            "Jehu, told what was left of Jezebel, said it himself: 'This is the word of the LORD, "
            "which he spake by his servant Elijah the Tishbite' (2 Kings 9:36). Even Ahab's "
            "repentance was seen: God delayed the evil on his house 'because he humbleth himself "
            "before me' (1 Kings 21:29)."),
        "lesson": "No one is too powerful to answer to God. And even late repentance is noticed by him.",
        "key_verses": ["1 Kings 21:19", "1 Kings 22:38", "2 Kings 9:36"],
    },
    {
        "name": "A virgin shall conceive",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Immanuel",
        "by": [{"name": "Isaiah"}],
        "with": [{"name": "King Ahaz"}, {"name": "Mary", "hero": "mary-mother-of-jesus"}],
        "for": "King Ahaz and the house of David",
        "where": "Jerusalem",
        "told_in": "Isaiah 7:10-16",
        "also_in": ["Matthew 1:18-25", "Luke 1:26-35"],
        "summary": "When King Ahaz refused to ask God for a sign, Isaiah gave him one anyway: a virgin would bear a son called Immanuel. Matthew saw it fulfilled in the birth of Jesus.",
        "story": (
            "Ahaz was terrified of the kings of Syria and Israel. God invited him to ask for any "
            "sign he liked, and he refused. Isaiah answered: 'Therefore the Lord himself shall give "
            "you a sign; Behold, a virgin shall conceive, and bear a son, and shall call his name "
            "Immanuel.' Centuries later an angel told Joseph that the child Mary carried was of the "
            "Holy Ghost, and Matthew writes: 'Now all this was done, that it might be fulfilled "
            "which was spoken of the Lord by the prophet'."),
        "meaning": (
            "Immanuel means “God with us” (Matthew 1:23). The sign given to a faithless king became "
            "the heart of Christmas: God did not only send help, he came himself."),
        "lesson": "When we will not ask, God may still give. His greatest sign was not a wonder in the sky, but a child.",
        "key_verses": ["Isaiah 7:14", "Matthew 1:23"],
    },
    {
        "name": "Out of Bethlehem",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Though thou be little among the thousands of Judah",
        "by": [{"name": "Micah"}],
        "with": [{"name": "Herod", "hero": "herod-the-great"}, {"name": "The wise men"}],
        "for": "Judah, waiting for a ruler",
        "where": "Bethlehem Ephratah",
        "told_in": "Micah 5:2-5",
        "also_in": ["Matthew 2:1-6", "Luke 2:1-7", "John 7:40-43"],
        "summary": "Seven centuries ahead, Micah named the small town where Israel's everlasting ruler would be born.",
        "story": (
            "Micah spoke when Assyria threatened Judah, yet he looked past it to a ruler: 'But "
            "thou, Bethlehem Ephratah, though thou be little among the thousands of Judah, yet out "
            "of thee shall he come forth unto me that is to be ruler in Israel'. When wise men came "
            "to Jerusalem asking for the newborn King of the Jews, Herod asked the chief priests "
            "where Christ should be born, and they answered at once: 'In Bethlehem of Judaea: for "
            "thus it is written by the prophet'. A Roman census had already brought Mary and "
            "Joseph from Nazareth to Bethlehem, and there Jesus was born."),
        "meaning": (
            "The ruler would come from a village, but his 'goings forth have been from of old, from "
            "everlasting' (Micah 5:2). Born in David's town, he was older than David. Even the "
            "crowds knew the prophecy: 'Christ cometh of the seed of David, and out of the town of "
            "Bethlehem' (John 7:42)."),
        "lesson": "God can use an emperor's census to keep a promise to a small town. Nothing is too little for his plans.",
        "key_verses": ["Micah 5:2", "Matthew 2:5-6"],
    },
    {
        "name": "The suffering servant",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "A man of sorrows",
        "by": [{"name": "Isaiah"}],
        "with": [{"name": "Philip and the Ethiopian official"}],
        "for": "Israel, and all who have gone astray",
        "where": "Jerusalem",
        "told_in": "Isaiah 52:13-53:12",
        "also_in": ["Acts 8:26-35", "1 Peter 2:21-25", "Matthew 8:16-17"],
        "summary": "Isaiah described a servant of God who would be despised, wounded for other people's sins, silent as a lamb, and afterwards exalted. The New Testament reads it as a portrait of Jesus.",
        "story": (
            "Isaiah's servant is 'despised and rejected of men; a man of sorrows, and acquainted "
            "with grief'. He suffers, but not for himself: 'he was wounded for our transgressions, "
            "he was bruised for our iniquities'. He goes to his death without a word, 'as a lamb to "
            "the slaughter', is buried 'with the rich in his death', and yet God will 'prolong his "
            "days'. Centuries later an Ethiopian official was reading this very passage in his "
            "chariot and asked, 'of whom speaketh the prophet this?' Philip 'began at the same "
            "scripture, and preached unto him Jesus.'"),
        "meaning": (
            "The servant's suffering is in our place: 'the LORD hath laid on him the iniquity of us "
            "all' (Isaiah 53:6). Peter, who saw it happen, wrote that Jesus 'his own self bare our "
            "sins in his own body on the tree … by whose stripes ye were healed' (1 Peter 2:24)."),
        "lesson": "The cross was not an accident or a defeat. It was foretold, and it was for us: 'with his stripes we are healed.'",
        "key_verses": ["Isaiah 53:5", "Isaiah 53:6", "Acts 8:35"],
    },
    {
        "name": "Cyrus called by name",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "He is my shepherd",
        "by": [{"name": "Isaiah"}, {"name": "Jeremiah"}],
        "with": [{"name": "Cyrus king of Persia"}, {"name": "Daniel", "hero": "daniel"}],
        "for": "The people of Judah, and the exiles in Babylon",
        "where": "Jerusalem, and a letter to Babylon",
        "told_in": "Isaiah 44:24-45:7",
        "also_in": ["Jeremiah 29:10-14", "Daniel 9:1-3", "2 Chronicles 36:22-23", "Ezra 1:1-4"],
        "summary": "Isaiah named Cyrus as the one who would rebuild Jerusalem, and Jeremiah said the exile would last seventy years. Cyrus of Persia took Babylon and sent the Jews home.",
        "story": (
            "Long before Jerusalem fell, Isaiah heard God speak 'of Cyrus, He is my shepherd, and "
            "shall perform all my pleasure: even saying to Jerusalem, Thou shalt be built'. "
            "Jeremiah wrote to the exiles that 'after seventy years be accomplished at Babylon' God "
            "would bring them back. Babylon fell to the Persians, and 'in the first year of Cyrus "
            "king of Persia, that the word of the LORD by the mouth of Jeremiah might be "
            "fulfilled', Cyrus proclaimed that the God of heaven had charged him to build a house at "
            "Jerusalem, and let the Jews go up to build it."),
        "meaning": (
            "God called a foreign king his anointed and his shepherd, and said so plainly, 'though "
            "thou hast not known me' (Isaiah 45:4). In Babylon, Daniel read Jeremiah's seventy "
            "years and began to pray for them to be fulfilled (Daniel 9:2-3)."),
        "lesson": "God rules even the kings who do not know him. Empires rise and fall, and his people still come home on time.",
        "key_verses": ["Isaiah 44:28", "Jeremiah 29:10", "Ezra 1:1"],
    },
    {
        "name": "The great image",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "A stone cut out without hands",
        "by": [{"name": "Daniel", "hero": "daniel"}],
        "with": [{"name": "Nebuchadnezzar", "hero": "nebuchadnezzar"}],
        "for": "King Nebuchadnezzar",
        "where": "Babylon",
        "told_in": "Daniel 2:31-45",
        "also_in": ["Daniel 7:1-28"],
        "summary": "Daniel told Nebuchadnezzar his dream of a great statue of gold, silver, brass, iron and clay: kingdoms following one another, and then a kingdom from God that would never end.",
        "story": (
            "The dream none of the wise men of Babylon could tell, Daniel told: 'Thou, O king, "
            "sawest, and behold a great image.' Its head was gold, its chest and arms silver, its "
            "belly and thighs brass, its legs iron, and its feet iron mixed with clay. Then 'a stone "
            "was cut out without hands' and struck the feet, the whole image was broken to dust and "
            "blown away, and the stone 'became a great mountain, and filled the whole earth.' "
            "Nebuchadnezzar was the head of gold; other kingdoms would follow. 'And in the days of "
            "these kings shall the God of heaven set up a kingdom, which shall never be "
            "destroyed'."),
        "meaning": (
            "The dream is a history of empires told in advance, and a verdict on them all. Many "
            "read the kingdoms after Babylon as Persia, Greece and Rome, and in Roman days Jesus "
            "came preaching that 'the kingdom of God is at hand' (Mark 1:15). The stone was not cut "
            "by human hands: God's kingdom is not built by armies."),
        "lesson": "Every kingdom that seems to be made of gold ends as chaff on the wind. Only God's kingdom 'shall stand for ever'.",
        "key_verses": ["Daniel 2:34", "Daniel 2:44"],
    },
    {
        "name": "Thy King cometh",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Lowly, and riding upon an ass",
        "by": [{"name": "Zechariah"}],
        "with": [{"name": "Jesus"}, {"name": "The crowds at Jerusalem"}],
        "for": "Jerusalem, the daughter of Zion",
        "where": "Jerusalem",
        "told_in": "Zechariah 9:9-10",
        "also_in": ["Matthew 21:1-11", "John 12:12-16"],
        "summary": "Zechariah foretold Jerusalem's king coming not on a warhorse but on a donkey's colt. Jesus rode into Jerusalem that way at the start of his last week.",
        "story": (
            "After the exile Zechariah called on Jerusalem to rejoice: 'behold, thy King cometh "
            "unto thee: he is just, and having salvation; lowly, and riding upon an ass, and upon a "
            "colt the foal of an ass.' About five hundred years later Jesus sent two disciples for "
            "a colt, and rode it down the Mount of Olives. The crowds spread their clothes and "
            "branches on the road and shouted 'Hosanna to the Son of David'. Matthew writes: 'All "
            "this was done, that it might be fulfilled which was spoken by the prophet'."),
        "meaning": (
            "Kings rode to war on horses; this King came in peace on a donkey. The disciples did "
            "not see it at first, 'but when Jesus was glorified, then remembered they that these "
            "things were written of him' (John 12:16)."),
        "lesson": "Jesus is a King, but a humble one. He still comes to people gently, bringing salvation, not force.",
        "key_verses": ["Zechariah 9:9", "Matthew 21:5"],
    },
    {
        "name": "The Spirit poured out",
        "group": "Prophecies",
        "testament": "Old",
        "epithet": "Upon all flesh",
        "by": [{"name": "Joel"}],
        "with": [{"name": "Peter", "hero": "peter"}, {"name": "The crowd at Pentecost"}],
        "for": "Judah, and in the end all flesh",
        "where": "Fulfilled in Jerusalem at Pentecost",
        "told_in": "Joel 2:28-32",
        "also_in": ["Acts 2:1-21", "Acts 2:37-41"],
        "summary": "Joel foretold a day when God would pour out his Spirit on every kind of person. On the day of Pentecost Peter stood up and said, “this is that”.",
        "story": (
            "Joel promised that after judgement God would restore his people: 'I will pour out my "
            "spirit upon all flesh; and your sons and your daughters shall prophesy, your old men "
            "shall dream dreams, your young men shall see visions'. Fifty days after the "
            "resurrection the disciples were together in Jerusalem when a sound came from heaven "
            "like a rushing mighty wind, tongues like fire rested on each of them, and they spoke "
            "in other languages. Some in the crowd said they were drunk. Peter stood up: 'But this "
            "is that which was spoken by the prophet Joel'. About three thousand were baptised "
            "that day."),
        "meaning": (
            "In the Old Testament the Spirit came upon a few: prophets, judges, kings. Joel saw a "
            "day when he would be given to all God's people, whatever their age, sex or rank, and "
            "Peter added that 'the promise is unto you, and to your children, and to all that are "
            "afar off' (Acts 2:39)."),
        "lesson": "The Spirit is not for a spiritual elite. Every believer, young or old, is given God's Spirit.",
        "key_verses": ["Joel 2:28", "Joel 2:32", "Acts 2:39"],
    },
    # ------------------------------------------------------------------ New Testament
    {
        "name": "The Son of man must suffer",
        "group": "Prophecies",
        "testament": "New",
        "epithet": "After three days rise again",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}, {"name": "The twelve"}],
        "for": "His disciples",
        "where": "Near Caesarea Philippi, and on the road to Jerusalem",
        "told_in": "Mark 8:31-33",
        "also_in": ["Mark 9:30-32", "Mark 10:32-34", "Luke 24:1-8"],
        "summary": "Three times Jesus told his disciples plainly that he would be rejected, killed, and rise again after three days. They could not take it in until it happened.",
        "story": (
            "Right after Peter confessed him as the Christ, Jesus 'began to teach them, that the Son "
            "of man must suffer many things, and be rejected of the elders, and of the chief "
            "priests, and scribes, and be killed, and after three days rise again.' Peter took him "
            "aside to rebuke him, and Jesus rebuked Peter. Twice more he said it, the last time on "
            "the road up to Jerusalem, adding that he would be mocked, scourged and spat upon. On "
            "the third day after the cross, two men in shining garments at the empty tomb said to "
            "the women: 'He is not here, but is risen: remember how he spake unto you when he was "
            "yet in Galilee'."),
        "meaning": (
            "Jesus was not caught out by the cross. He walked towards it knowing what would happen, "
            "and when it had happened, 'they remembered his words' (Luke 24:8)."),
        "lesson": "Jesus' death was not the end of his plan but the centre of it. What he said about his rising, he kept.",
        "key_verses": ["Mark 8:31", "Luke 24:6-7"],
    },
    {
        "name": "Before the cock crow twice",
        "group": "Prophecies",
        "testament": "New",
        "epithet": "Thou shalt deny me thrice",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "for": "Peter",
        "where": "The Mount of Olives, then the high priest's courtyard",
        "told_in": "Mark 14:26-31",
        "also_in": ["Mark 14:66-72", "Luke 22:31-34", "Luke 22:54-62", "John 21:15-17"],
        "summary": "Peter swore he would never deny Jesus. Jesus told him he would do it three times that very night, and he did.",
        "story": (
            "On the way to the Mount of Olives Jesus said they would all fall away. Peter insisted, "
            "'Although all shall be offended, yet will not I.' Jesus answered: 'this day, even in "
            "this night, before the cock crow twice, thou shalt deny me thrice.' Hours later, "
            "warming himself in the high priest's courtyard, Peter was recognised three times, and "
            "three times denied knowing Jesus, the last time with curses and oaths. 'And the second "
            "time the cock crew.' Peter remembered the word, 'And when he thought thereon, he "
            "wept.'"),
        "meaning": (
            "Jesus knew Peter's failure before Peter did, and loved him anyway. Luke records that "
            "he had already prayed for him, 'that thy faith fail not: and when thou art converted, "
            "strengthen thy brethren' (Luke 22:32). After the resurrection three denials were met "
            "by three questions: 'lovest thou me?' (John 21:15-17)."),
        "lesson": "Jesus knows our weakness better than we do, and his prayers for us do not fail when we do.",
        "key_verses": ["Mark 14:30", "Mark 14:72", "Luke 22:32"],
    },
    {
        "name": "Not one stone upon another",
        "group": "Prophecies",
        "testament": "New",
        "epithet": "Seest thou these great buildings?",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "His disciples"}],
        "for": "His disciples, about Jerusalem and its temple",
        "where": "Leaving the temple in Jerusalem",
        "told_in": "Mark 13:1-2",
        "also_in": ["Matthew 24:1-2", "Luke 19:41-44", "Luke 21:5-24"],
        "summary": "As his disciples admired the temple's great stones, Jesus said that not one would be left on another. About forty years later the Romans destroyed it.",
        "story": (
            "Herod's temple was one of the wonders of its age. As they left it a disciple said, "
            "'Master, see what manner of stones and what buildings are here!' Jesus answered: "
            "'there shall not be left one stone upon another, that shall not be thrown down.' "
            "Earlier, seeing the city from the hillside, he had wept over it and foretold enemies "
            "camped around it, 'because thou knewest not the time of thy visitation.' He told his "
            "followers that when they saw Jerusalem surrounded by armies, they should flee to the "
            "mountains. In AD 70 Roman armies besieged the city and burned the temple."),
        "meaning": (
            "Jesus wept over the city before he foretold its fall (Luke 19:41). The temple, where "
            "God had met his people, was giving way to Jesus himself, who spoke of 'the temple of "
            "his body' (John 2:21). The Bible does not narrate the fall of AD 70; the Jewish "
            "historian Josephus describes it."),
        "lesson": "The grandest things people build can fall in a day. Jesus grieves over those who miss God's visit, and invites them still.",
        "key_verses": ["Mark 13:2", "Luke 19:44"],
    },
    {
        "name": "Agabus and Paul's girdle",
        "group": "Prophecies",
        "testament": "New",
        "epithet": "Thus saith the Holy Ghost",
        "by": [{"name": "Agabus"}],
        "with": [{"name": "Paul", "hero": "paul"}, {"name": "Luke and the church at Caesarea"}],
        "for": "Paul, on his way to Jerusalem",
        "where": "Philip's house at Caesarea",
        "told_in": "Acts 21:7-14",
        "also_in": ["Acts 11:27-30", "Acts 20:22-24", "Acts 21:27-33"],
        "summary": "The prophet Agabus, who had already foretold a great famine, tied his own hands and feet with Paul's belt to show what would happen to Paul in Jerusalem.",
        "story": (
            "Years before, at Antioch, Agabus 'signified by the spirit that there should be great "
            "dearth throughout all the world: which came to pass in the days of Claudius Caesar', "
            "and the church sent relief to Judaea. Now he came down to Caesarea, took Paul's belt "
            "and tied his own hands and feet: 'Thus saith the Holy Ghost, So shall the Jews at "
            "Jerusalem bind the man that owneth this girdle'. Everyone begged Paul not to go. He "
            "answered: 'I am ready not to be bound only, but also to die at Jerusalem for the name "
            "of the Lord Jesus.' In Jerusalem he was seized in the temple and bound with two "
            "chains."),
        "meaning": (
            "The prophecy was not a command to stay away but a warning to go prepared. Paul already "
            "knew 'that bonds and afflictions abide me' (Acts 20:23), and went anyway. His friends "
            "ended where they should: 'The will of the Lord be done' (Acts 21:14)."),
        "lesson": "Knowing the cost does not always mean avoiding it. Sometimes God shows us the road ahead so we can walk it with courage.",
        "key_verses": ["Acts 11:28", "Acts 21:13", "Acts 21:14"],
    },
    {
        "name": "This same Jesus shall come",
        "group": "Prophecies",
        "testament": "New",
        "epithet": "In like manner",
        "by": [{"name": "Two men in white apparel"}, {"name": "Jesus"}],
        "with": [{"name": "The apostles"}],
        "for": "The apostles, and every believer since",
        "where": "The mount called Olivet",
        "told_in": "Acts 1:9-11",
        "also_in": ["John 14:1-3", "1 Thessalonians 4:13-18", "Revelation 22:20"],
        "summary": "As Jesus was taken up into heaven, two men in white promised the watching apostles that he would come back the same way. This prophecy is still waiting to be fulfilled.",
        "story": (
            "Forty days after the resurrection Jesus led his apostles out to the Mount of Olives. "
            "While they watched, 'he was taken up; and a cloud received him out of their sight.' As "
            "they stared into the sky two men in white stood beside them: 'Ye men of Galilee, why "
            "stand ye gazing up into heaven? this same Jesus, which is taken up from you into "
            "heaven, shall so come in like manner as ye have seen him go into heaven.' Jesus had "
            "promised the same the night before he died: 'I will come again, and receive you unto "
            "myself'."),
        "meaning": (
            "Most of the prophecies on this page have already come true. This one is still ahead, "
            "and the Bible ends looking for it: 'Surely I come quickly. Amen. Even so, come, Lord "
            "Jesus' (Revelation 22:20). Paul told grieving Christians that the dead in Christ will "
            "rise first, 'and so shall we ever be with the Lord' (1 Thessalonians 4:17)."),
        "lesson": "The prophecies God has already kept are the reason to trust the one still to come. Live ready, and look up.",
        "key_verses": ["Acts 1:11", "John 14:3", "Revelation 22:20"],
    },
]
