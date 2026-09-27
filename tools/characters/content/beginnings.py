"""Bible characters: the beginning, the patriarchs, and the exodus and the promised land.

Fields (all but name, group, testament, told_in and summary are optional):

  name, epithet   the name, and a short title
  group           one of GROUPS in build_characters.py
  testament       Old or New
  role            what they were ("Patriarch", "Prophet", "King of Judah")
  era             roughly when, in words; dates only where they are well agreed
  family          [{relation, id?, name?}]: id links to another character on the page
  hero            an id on heroes-and-villains.html, for a link to that entry
  summary         one sentence
  story           their story
  importance      why they matter
  known_for       two to four short phrases
  told_in         where their story is told; also_in: other places that speak of them
  key_verses      references; the build adds the text

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

BEGINNINGS = [
    # ------------------------------------------------------------------ the beginning
    {
        "name": "Adam",
        "epithet": "The first man",
        "group": "The beginning",
        "testament": "Old",
        "role": "Father of the human race",
        "era": "The beginning",
        "family": [{"relation": "Wife", "id": "eve"}, {"relation": "Son", "id": "cain"},
                   {"relation": "Son", "id": "abel"}, {"relation": "Son", "id": "seth"}],
        "summary": "Formed from the dust and given the breath of life, Adam was set in Eden to tend the garden, and with Eve he broke the one command God gave.",
        "story": (
            "God formed man of the dust of the ground and breathed into his nostrils the breath of life. "
            "He put him in the garden of Eden 'to dress it and to keep it', brought him the animals to "
            "name, and made the woman from his side. God gave one command: not to eat of the tree of the "
            "knowledge of good and evil. Adam ate, hid among the trees when God called, and was sent out "
            "of the garden to work ground that now brought forth thorns. He lived nine hundred and thirty "
            "years."),
        "importance": (
            "Adam is humanity's beginning and humanity's fall. Paul sets him beside Christ: 'For as in Adam "
            "all die, even so in Christ shall all be made alive' (1 Corinthians 15:22), and calls Jesus 'the "
            "last Adam' (1 Corinthians 15:45)."),
        "known_for": ["Made from the dust", "Naming the animals", "The first sin"],
        "told_in": ["Genesis 2-3"],
        "also_in": ["Genesis 5:1-5", "Romans 5:12-19", "1 Corinthians 15:21-22"],
        "key_verses": ["Genesis 2:7", "1 Corinthians 15:22"],
    },
    {
        "name": "Eve",
        "epithet": "The mother of all living",
        "group": "The beginning",
        "testament": "Old",
        "role": "The first woman",
        "era": "The beginning",
        "family": [{"relation": "Husband", "id": "adam"}, {"relation": "Son", "id": "cain"},
                   {"relation": "Son", "id": "abel"}, {"relation": "Son", "id": "seth"}],
        "summary": "Made from Adam's side, Eve was deceived by the serpent, ate the forbidden fruit, and became the mother of all living.",
        "story": (
            "God said it was not good for the man to be alone, and made the woman from a rib taken from "
            "Adam's side. The serpent questioned what God had said and promised she would not die. She "
            "saw that the tree was good for food and pleasant to the eyes, took of the fruit, and gave it "
            "to her husband. When God asked what she had done, she said, 'The serpent beguiled me, and I "
            "did eat.' God promised that her seed would bruise the serpent's head. Adam called her Eve, "
            "'because she was the mother of all living.'"),
        "importance": (
            "Eve's story shows how temptation works: doubt about God's word, then desire. Yet God's first "
            "promise of rescue was spoken about her offspring (Genesis 3:15), and the Bible's first mother "
            "is named for life."),
        "known_for": ["Made from Adam's rib", "Deceived by the serpent", "Mother of all living"],
        "told_in": ["Genesis 2:18-4:2"],
        "also_in": ["Genesis 4:25", "2 Corinthians 11:3", "1 Timothy 2:13-14"],
        "key_verses": ["Genesis 3:15", "Genesis 3:20"],
    },
    {
        "name": "Cain",
        "epithet": "The first murderer",
        "group": "The beginning",
        "testament": "Old",
        "role": "A tiller of the ground",
        "era": "The beginning",
        "hero": "cain",
        "family": [{"relation": "Father", "id": "adam"}, {"relation": "Mother", "id": "eve"},
                   {"relation": "Brother", "id": "abel"}, {"relation": "Brother", "id": "seth"}],
        "summary": "Adam and Eve's firstborn, a farmer, who killed his brother Abel out of anger and jealousy.",
        "story": (
            "Cain brought an offering of the fruit of the ground; his brother Abel brought the firstlings "
            "of his flock. God had respect to Abel's offering but not to Cain's, and Cain was very angry. "
            "God warned him that 'sin lieth at the door', but Cain talked with Abel in the field and killed "
            "him. Asked where his brother was, he answered that he did not know, and asked whether he was "
            "his brother's keeper. God sent him out as a wanderer, yet set a mark on him so that no one "
            "would kill him."),
        "importance": (
            "Cain's is the first killing in the Bible, and it grows from anger left unmastered. The New "
            "Testament names him as a warning: 'Not as Cain, who was of that wicked one, and slew his "
            "brother' (1 John 3:12)."),
        "known_for": ["The first murder", "“Am I my brother's keeper?”", "The mark of Cain"],
        "told_in": ["Genesis 4:1-17"],
        "also_in": ["Hebrews 11:4", "1 John 3:12", "Jude 1:11"],
        "key_verses": ["Genesis 4:7", "1 John 3:12"],
    },
    {
        "name": "Abel",
        "epithet": "The first righteous man",
        "group": "The beginning",
        "testament": "Old",
        "role": "A keeper of sheep",
        "era": "The beginning",
        "family": [{"relation": "Father", "id": "adam"}, {"relation": "Mother", "id": "eve"},
                   {"relation": "Brother", "id": "cain"}],
        "summary": "Adam and Eve's second son, a shepherd, whose offering God accepted and whose brother killed him.",
        "story": (
            "Abel kept sheep, and brought God the firstlings of his flock and the fat of them. God had "
            "respect to Abel and to his offering. His brother Cain, angry that his own offering was not "
            "accepted, rose up against him in the field and killed him. God told Cain that his brother's "
            "blood cried out to him from the ground."),
        "importance": (
            "Abel is the first person the Bible commends for faith: 'By faith Abel offered unto God a more "
            "excellent sacrifice than Cain' (Hebrews 11:4). Jesus named him as the first of the righteous "
            "whose blood was shed (Matthew 23:35)."),
        "known_for": ["An accepted offering", "The first to die"],
        "told_in": ["Genesis 4:1-10"],
        "also_in": ["Hebrews 11:4", "Hebrews 12:24", "Matthew 23:35"],
        "key_verses": ["Hebrews 11:4"],
    },
    {
        "name": "Seth",
        "epithet": "The son given in Abel's place",
        "group": "The beginning",
        "testament": "Old",
        "role": "Son of Adam",
        "era": "The beginning",
        "family": [{"relation": "Father", "id": "adam"}, {"relation": "Mother", "id": "eve"},
                   {"relation": "Brother", "id": "abel"}, {"relation": "Brother", "id": "cain"}],
        "summary": "Born after Abel's death, Seth carried on the family line through which Noah, Abraham and in the end Jesus would come.",
        "story": (
            "After Cain killed Abel, Eve bore another son and named him Seth, saying that God 'hath "
            "appointed me another seed instead of Abel, whom Cain slew.' When Seth's son Enos was born, "
            "'then began men to call upon the name of the LORD.' Seth lived nine hundred and twelve years."),
        "importance": (
            "Seth's line is the one Genesis follows through the flood to Abraham. Luke traces Jesus' family "
            "back through him: 'which was the son of Seth, which was the son of Adam, which was the son of "
            "God' (Luke 3:38)."),
        "known_for": ["Abel's replacement", "The line of promise"],
        "told_in": ["Genesis 4:25-5:8"],
        "also_in": ["Luke 3:38"],
        "key_verses": ["Genesis 4:26"],
    },
    {
        "name": "Enoch",
        "epithet": "He walked with God",
        "group": "The beginning",
        "testament": "Old",
        "role": "A patriarch before the flood",
        "era": "Before the flood",
        "family": [{"relation": "Son", "id": "methuselah"}],
        "summary": "A man who walked with God for three hundred years and did not die: 'he was not; for God took him.'",
        "story": (
            "Enoch was the seventh generation from Adam. After his son Methuselah was born he 'walked with "
            "God' for three hundred years. Then, in one of the shortest accounts of a life's end in the "
            "Bible, 'he was not; for God took him.'"),
        "importance": (
            "In a chapter where life after life ends 'and he died', Enoch's does not. Hebrews says he 'was "
            "translated that he should not see death' because 'he pleased God' (Hebrews 11:5), and Jude "
            "quotes him as a prophet of judgement (Jude 1:14-15)."),
        "known_for": ["Walking with God", "Taken without dying"],
        "told_in": ["Genesis 5:18-24"],
        "also_in": ["Hebrews 11:5-6", "Jude 1:14-15"],
        "key_verses": ["Genesis 5:24", "Hebrews 11:5"],
    },
    {
        "name": "Methuselah",
        "epithet": "The longest life",
        "group": "The beginning",
        "testament": "Old",
        "role": "A patriarch before the flood",
        "era": "Before the flood",
        "family": [{"relation": "Father", "id": "enoch"}, {"relation": "Grandson", "id": "noah"}],
        "summary": "Enoch's son, who lived 969 years, longer than anyone else in the Bible.",
        "story": (
            "Methuselah was born when his father Enoch was sixty-five. He fathered Lamech, whose son was "
            "Noah. 'And all the days of Methuselah were nine hundred sixty and nine years: and he died.'"),
        "importance": (
            "Methuselah's age has made his name a byword for a long life. By the ages Genesis gives, he "
            "died in the year of the flood, the last link between the world before it and the world after."),
        "known_for": ["969 years", "Noah's grandfather"],
        "told_in": ["Genesis 5:21-27"],
        "also_in": ["Luke 3:37"],
        "key_verses": ["Genesis 5:27"],
    },
    {
        "name": "Noah",
        "epithet": "The builder of the ark",
        "group": "The beginning",
        "testament": "Old",
        "role": "A patriarch",
        "era": "The flood",
        "hero": "noah",
        "family": [{"relation": "Grandfather", "id": "methuselah"}, {"relation": "Son", "id": "shem"}],
        "summary": "A righteous man in a violent world, who built the ark at God's command and carried his family and the animals through the flood.",
        "story": (
            "When the earth was filled with violence, 'Noah found grace in the eyes of the LORD.' God told "
            "him to build an ark and to bring into it his family and the animals, two of every kind. The "
            "rain fell forty days and forty nights, and the waters covered the earth. When the ark rested "
            "on the mountains of Ararat and the ground was dry, Noah built an altar, and God made a "
            "covenant never again to destroy the earth by a flood, with the rainbow as its sign."),
        "importance": (
            "Noah is the new beginning after judgement: every nation in Genesis 10 comes from his sons. "
            "Jesus pointed to his days as a picture of his own coming (Matthew 24:37-39), and Hebrews names "
            "him among the heroes of faith (Hebrews 11:7)."),
        "known_for": ["The ark", "The flood", "The rainbow covenant"],
        "told_in": ["Genesis 6-9"],
        "also_in": ["Matthew 24:37-39", "Hebrews 11:7", "1 Peter 3:20"],
        "key_verses": ["Genesis 6:8", "Genesis 9:13"],
    },
    {
        "name": "Shem",
        "epithet": "Father of the line of promise",
        "group": "The beginning",
        "testament": "Old",
        "role": "Son of Noah",
        "era": "After the flood",
        "family": [{"relation": "Father", "id": "noah"}, {"relation": "Descendant", "id": "abraham"}],
        "summary": "Noah's son, blessed by his father, from whose line came Abraham and the Hebrew people.",
        "story": (
            "Shem was one of Noah's three sons who went into the ark with their wives. After the flood, "
            "when Ham saw his father lying uncovered, Shem and Japheth walked in backwards and covered him "
            "without looking. Noah blessed them: 'Blessed be the LORD God of Shem.' Genesis traces Shem's "
            "line through ten generations to Abram."),
        "importance": (
            "Shem is the root of the family tree Genesis follows from here on. The word “Semitic” comes "
            "from his name, and Luke's list of Jesus' ancestors passes through him (Luke 3:36)."),
        "known_for": ["Son of Noah", "Ancestor of Abraham"],
        "told_in": ["Genesis 9:18-27", "Genesis 11:10-26"],
        "also_in": ["Luke 3:36"],
        "key_verses": ["Genesis 9:26"],
    },
    {
        "name": "Nimrod",
        "epithet": "A mighty hunter before the LORD",
        "group": "The beginning",
        "testament": "Old",
        "role": "Founder of kingdoms",
        "era": "After the flood",
        "family": [{"relation": "Father", "name": "Cush"}],
        "summary": "A descendant of Noah remembered as the first mighty man on the earth, whose kingdom began at Babel.",
        "story": (
            "Nimrod, the son of Cush, 'began to be a mighty one in the earth. He was a mighty hunter before "
            "the LORD.' The beginning of his kingdom was Babel, Erech, Accad and Calneh in the land of "
            "Shinar, and out of that land Nineveh and the cities of Assyria were built."),
        "importance": (
            "Genesis gives Nimrod only a few verses, but his kingdom began at Babel, where people tried to "
            "build a tower to heaven, and Nineveh and Babylon became Israel's great enemies. He stands at "
            "the head of the empires that fill the rest of the Old Testament."),
        "known_for": ["A mighty hunter", "Babel and Nineveh"],
        "told_in": ["Genesis 10:8-12"],
        "also_in": ["1 Chronicles 1:10", "Micah 5:6"],
        "key_verses": ["Genesis 10:9"],
    },
    # ------------------------------------------------------------------ the patriarchs
    {
        "name": "Abraham",
        "epithet": "The friend of God",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Patriarch",
        "era": "The patriarchs",
        "hero": "abraham",
        "family": [{"relation": "Wife", "id": "sarah"}, {"relation": "Son", "id": "ishmael"},
                   {"relation": "Son", "id": "isaac"}, {"relation": "Nephew", "id": "lot"}],
        "summary": "Called by God to leave his homeland, Abraham believed God's promise of a land, a people and a blessing for every nation, and became the father of the faithful.",
        "story": (
            "God called Abram to leave his country and his kindred and go 'unto a land that I will shew "
            "thee', promising to make him a great nation, and that in him 'shall all families of the earth "
            "be blessed.' He went, not knowing where. He waited twenty-five years for the promised son, and "
            "God changed his name to Abraham, 'a father of many nations.' When Isaac was a boy, God tested "
            "Abraham by telling him to offer his son; at the last moment God stopped his hand and provided "
            "a ram."),
        "importance": (
            "Three faiths look back to Abraham. The New Testament makes him the pattern of faith: 'Abraham "
            "believed God, and it was counted unto him for righteousness' (Romans 4:3), and it calls "
            "believers his children (Galatians 3:7). God himself calls him 'Abraham my friend' (Isaiah "
            "41:8)."),
        "known_for": ["The call to leave home", "The promise of a son", "The offering of Isaac"],
        "told_in": ["Genesis 11:26-25:11"],
        "also_in": ["Romans 4:1-25", "Hebrews 11:8-19", "James 2:21-23"],
        "key_verses": ["Genesis 15:6", "Hebrews 11:8"],
    },
    {
        "name": "Sarah",
        "epithet": "A mother of nations",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Matriarch",
        "era": "The patriarchs",
        "family": [{"relation": "Husband", "id": "abraham"}, {"relation": "Son", "id": "isaac"},
                   {"relation": "Servant", "id": "hagar"}],
        "summary": "Abraham's wife, who waited into old age for the son God promised, laughed at the promise, and then bore Isaac.",
        "story": (
            "Sarai was barren, and for years she and Abram had no child. She gave her maid Hagar to Abram, "
            "and bitter trouble followed. When God said she would have a son at ninety, Sarah laughed "
            "within herself, and the LORD asked, 'Is any thing too hard for the LORD?' A year later she bore "
            "Isaac, and said, 'God hath made me to laugh, so that all that hear will laugh with me.' God "
            "changed her name to Sarah and said she would be 'a mother of nations.'"),
        "importance": (
            "Sarah is the only woman whose age at death the Bible gives (Genesis 23:1). Hebrews counts her "
            "faith, because she 'judged him faithful who had promised' (Hebrews 11:11), and Peter holds her "
            "up as an example (1 Peter 3:6)."),
        "known_for": ["Laughing at the promise", "Isaac in her old age"],
        "told_in": ["Genesis 11:29-23:20"],
        "also_in": ["Isaiah 51:2", "Hebrews 11:11-12", "1 Peter 3:6"],
        "key_verses": ["Genesis 18:14", "Hebrews 11:11"],
    },
    {
        "name": "Hagar",
        "epithet": "She met the God who sees",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Sarah's Egyptian servant",
        "era": "The patriarchs",
        "family": [{"relation": "Son", "id": "ishmael"}, {"relation": "Mistress", "id": "sarah"}],
        "summary": "Sarah's Egyptian maid, who bore Abraham's son Ishmael, fled into the wilderness, and met the God who sees.",
        "story": (
            "Because Sarai had no child, she gave Hagar to Abram, and Hagar conceived. When Sarai dealt "
            "harshly with her, she fled. By a spring in the wilderness the angel of the LORD found her, "
            "sent her back and promised her a son. She called the LORD who spoke to her 'Thou God seest "
            "me.' Years later, after Isaac was born, Hagar and Ishmael were sent away. When the water ran "
            "out she laid the boy under a shrub and wept, and God opened her eyes to a well."),
        "importance": (
            "Hagar is the first person in Scripture said to give God a name. A foreign slave, used and then "
            "sent away, is met twice by God in the desert. Paul later uses her story as an allegory of two "
            "covenants (Galatians 4:22-31)."),
        "known_for": ["“Thou God seest me”", "Mother of Ishmael", "The well in the desert"],
        "told_in": ["Genesis 16:1-16", "Genesis 21:8-21"],
        "also_in": ["Galatians 4:22-31"],
        "key_verses": ["Genesis 16:13", "Genesis 21:17"],
    },
    {
        "name": "Ishmael",
        "epithet": "The son God heard",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Abraham's firstborn",
        "era": "The patriarchs",
        "family": [{"relation": "Father", "id": "abraham"}, {"relation": "Mother", "id": "hagar"},
                   {"relation": "Brother", "id": "isaac"}],
        "summary": "Abraham's first son, by Hagar, whom God saved in the wilderness and promised to make a great nation.",
        "story": (
            "Before he was born, the angel told Hagar to call him Ishmael, 'because the LORD hath heard thy "
            "affliction.' He was circumcised with his father at thirteen. After he mocked at the feast for "
            "Isaac, he and his mother were sent away, and in the wilderness God heard the boy's voice and "
            "saved him. He grew up in the wilderness of Paran, became an archer, and fathered twelve "
            "princes. He and Isaac buried their father together."),
        "importance": (
            "God's promise reached beyond the chosen line: 'I will make him a great nation' (Genesis "
            "21:18). Ishmael's twelve sons, like Jacob's twelve, became tribes (Genesis 25:13-16), and Arab "
            "tradition has long traced its descent from him."),
        "known_for": ["Abraham's first son", "Saved in the wilderness", "Twelve princes"],
        "told_in": ["Genesis 16:1-16", "Genesis 21:8-21", "Genesis 25:9-18"],
        "key_verses": ["Genesis 21:17-18"],
    },
    {
        "name": "Lot",
        "epithet": "The righteous man who lingered",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Abraham's nephew",
        "era": "The patriarchs",
        "family": [{"relation": "Uncle", "id": "abraham"}],
        "summary": "Abraham's nephew, who chose the well-watered plain near Sodom and was pulled out of the city before it was destroyed.",
        "story": (
            "Lot travelled with his uncle from Haran. When their herds grew too large to stay together, "
            "Abram let him choose, and Lot chose the plain of Jordan and pitched his tent toward Sodom. He "
            "was captured in a war and rescued by Abram. When two angels came to destroy Sodom, Lot "
            "sheltered them, but he lingered; the angels took him, his wife and his daughters by the hand "
            "and brought them out. His wife looked back and became a pillar of salt."),
        "importance": (
            "Peter calls him 'just Lot, vexed with the filthy conversation of the wicked' (2 Peter 2:7): a "
            "good man compromised by where he chose to live. Jesus told his hearers to remember Lot's wife "
            "(Luke 17:32)."),
        "known_for": ["Choosing Sodom", "Rescued by angels", "His wife's backward look"],
        "told_in": ["Genesis 11:27-14:16", "Genesis 19:1-38"],
        "also_in": ["Luke 17:28-32", "2 Peter 2:6-9"],
        "key_verses": ["Genesis 19:16", "2 Peter 2:7"],
    },
    {
        "name": "Melchizedek",
        "epithet": "King of Salem, priest of the most high God",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "King and priest",
        "era": "The patriarchs",
        "summary": "A king and priest who blessed Abraham and received a tenth from him, and who became a picture of Christ's priesthood.",
        "story": (
            "After Abram rescued Lot, Melchizedek king of Salem brought out bread and wine. He was 'the "
            "priest of the most high God', and he blessed Abram. Abram gave him a tenth of everything. He "
            "appears in three verses, and then he is gone."),
        "importance": (
            "Psalm 110 promises a king who will be 'a priest for ever after the order of Melchizedek' "
            "(Psalm 110:4), and Hebrews explains that Jesus is that priest: with no recorded beginning or "
            "end, Melchizedek was 'made like unto the Son of God' (Hebrews 7:3)."),
        "known_for": ["Bread and wine", "Abraham's tenth", "A priest for ever"],
        "told_in": ["Genesis 14:17-20"],
        "also_in": ["Psalms 110:4", "Hebrews 5:5-10", "Hebrews 7:1-28"],
        "key_verses": ["Genesis 14:18", "Hebrews 7:3"],
    },
    {
        "name": "Isaac",
        "epithet": "The son of promise",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Patriarch",
        "era": "The patriarchs",
        "family": [{"relation": "Father", "id": "abraham"}, {"relation": "Mother", "id": "sarah"},
                   {"relation": "Brother", "id": "ishmael"}, {"relation": "Wife", "id": "rebekah"},
                   {"relation": "Son", "id": "esau"}, {"relation": "Son", "id": "jacob"}],
        "summary": "The son God promised Abraham and Sarah, who was laid on the altar on Mount Moriah and spared, and who passed the promise on to Jacob.",
        "story": (
            "Isaac was born when Abraham was a hundred years old. As a boy he carried the wood up Mount "
            "Moriah and asked, 'where is the lamb for a burnt offering?' Abraham answered, 'God will provide "
            "himself a lamb.' Isaac was bound on the altar and spared. At forty he married Rebekah, and he "
            "loved her. In old age, blind, he was deceived into blessing Jacob instead of Esau, and when he "
            "found out he 'trembled very exceedingly.'"),
        "importance": (
            "Isaac is the quiet link in the chain of promise. His near-sacrifice has long been read as a "
            "picture of God giving his own Son, and God calls himself 'the God of Abraham, the God of Isaac, "
            "and the God of Jacob' (Exodus 3:6)."),
        "known_for": ["Born in his parents' old age", "Bound on the altar", "Blessing Jacob"],
        "told_in": ["Genesis 21:1-8", "Genesis 22:1-19", "Genesis 24-27"],
        "also_in": ["Genesis 35:27-29", "Hebrews 11:17-20"],
        "key_verses": ["Genesis 22:8"],
    },
    {
        "name": "Rebekah",
        "epithet": "The bride from far away",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Matriarch",
        "era": "The patriarchs",
        "family": [{"relation": "Husband", "id": "isaac"}, {"relation": "Son", "id": "esau"},
                   {"relation": "Son", "id": "jacob"}, {"relation": "Brother", "name": "Laban"}],
        "summary": "The woman chosen at a well to be Isaac's wife, mother of the twins Esau and Jacob, who helped Jacob win his father's blessing.",
        "story": (
            "Abraham's servant prayed for a sign at a well in Mesopotamia, and Rebekah came, gave him water "
            "and watered his ten camels too. Asked whether she would go with him, she said, 'I will go.' "
            "Isaac loved her. When the twins struggled within her, the LORD told her 'the elder shall serve "
            "the younger.' Years later, when Isaac meant to bless Esau, she dressed Jacob in his brother's "
            "clothes and sent him in. Jacob had to flee, and the text never tells of her seeing him again."),
        "importance": (
            "Rebekah's kindness and courage made her part of the promise. Paul points to the word she "
            "received before her sons were born as proof that God's choosing rests on his call, not on "
            "works (Romans 9:10-13)."),
        "known_for": ["Water for the camels", "“I will go”", "Mother of twins"],
        "told_in": ["Genesis 24:1-67", "Genesis 25:19-28", "Genesis 27:1-46"],
        "also_in": ["Romans 9:10-13"],
        "key_verses": ["Genesis 25:23"],
    },
    {
        "name": "Esau",
        "epithet": "The elder who sold his birthright",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "A hunter; father of Edom",
        "era": "The patriarchs",
        "family": [{"relation": "Father", "id": "isaac"}, {"relation": "Mother", "id": "rebekah"},
                   {"relation": "Twin brother", "id": "jacob"}],
        "summary": "Jacob's twin, a hunter, who sold his birthright for a bowl of stew and lost his father's blessing, but in the end met his brother with an embrace.",
        "story": (
            "Esau was born first, red and hairy, and grew up a skilful hunter, his father's favourite. "
            "Coming in faint from the field, he sold his birthright to Jacob for bread and red lentil stew: "
            "'thus Esau despised his birthright.' When Jacob took the blessing too, Esau planned to kill "
            "him. Twenty years later he ran to meet his returning brother, 'and embraced him, and fell on "
            "his neck, and kissed him: and they wept.' His descendants became the nation of Edom."),
        "importance": (
            "Hebrews warns against being a 'profane person, as Esau, who for one morsel of meat sold his "
            "birthright' (Hebrews 12:16). Yet his forgiving embrace of Jacob is one of the most moving "
            "reunions in Genesis."),
        "known_for": ["A birthright for stew", "The lost blessing", "Forgiving Jacob"],
        "told_in": ["Genesis 25:19-34", "Genesis 27:1-45", "Genesis 32:3-33:16"],
        "also_in": ["Genesis 36:1-8", "Hebrews 12:16-17"],
        "key_verses": ["Genesis 33:4"],
    },
    {
        "name": "Jacob",
        "epithet": "Israel, who wrestled with God",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Patriarch; father of the twelve tribes",
        "era": "The patriarchs",
        "family": [{"relation": "Father", "id": "isaac"}, {"relation": "Mother", "id": "rebekah"},
                   {"relation": "Twin brother", "id": "esau"}, {"relation": "Wife", "id": "leah"},
                   {"relation": "Wife", "id": "rachel"}, {"relation": "Son", "id": "judah"},
                   {"relation": "Son", "id": "joseph"}],
        "summary": "The younger twin who grasped his brother's heel, schemed his way to the blessing, wrestled with God, and was renamed Israel, father of the twelve tribes.",
        "story": (
            "Jacob took Esau's birthright and, with his mother's help, his blessing, and fled for his life. "
            "On the way he dreamed of a ladder reaching to heaven, and God promised to be with him. In "
            "Haran he served Laban fourteen years for Rachel and was tricked into marrying Leah first. "
            "Coming home, he wrestled all night with a man at Peniel and would not let go without a "
            "blessing. God said, 'Thy name shall be called no more Jacob, but Israel.' His twelve sons "
            "became the tribes of Israel, and he died in Egypt, blessing them."),
        "importance": (
            "The whole nation carries his new name. Jacob shows that God's promise does not depend on the "
            "worthiness of the one who carries it: God is 'the God of Jacob', the schemer made new (Psalm "
            "46:7)."),
        "known_for": ["The stolen blessing", "The ladder to heaven", "Wrestling with God"],
        "told_in": ["Genesis 25:19-35:29", "Genesis 46-49"],
        "also_in": ["Hosea 12:3-4", "Hebrews 11:21"],
        "key_verses": ["Genesis 28:15", "Genesis 32:28"],
    },
    {
        "name": "Leah",
        "epithet": "The unloved wife",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Matriarch",
        "era": "The patriarchs",
        "family": [{"relation": "Husband", "id": "jacob"}, {"relation": "Sister", "id": "rachel"},
                   {"relation": "Son", "id": "judah"}],
        "summary": "Laban's elder daughter, given to Jacob in her sister's place, less loved but mother of six of the twelve tribes, including Judah and Levi.",
        "story": (
            "Laban veiled Leah and gave her to Jacob on the night he expected Rachel. 'And when the LORD saw "
            "that Leah was hated, he opened her womb.' She named her first sons as prayers for her "
            "husband's love, until at the fourth she said, 'Now will I praise the LORD', and called him "
            "Judah. She bore six sons and a daughter, Dinah, and was buried in the family tomb at Machpelah "
            "with Abraham and Sarah, Isaac and Rebekah."),
        "importance": (
            "Through Leah came Levi, the priestly tribe, and Judah, the royal tribe of David and of Jesus. "
            "The unloved wife became the mother of both priesthood and kingship, and Jacob asked to be "
            "buried beside her (Genesis 49:29-31)."),
        "known_for": ["Married by a trick", "Mother of Judah and Levi"],
        "told_in": ["Genesis 29:16-35", "Genesis 30:9-21"],
        "also_in": ["Genesis 49:29-31", "Ruth 4:11"],
        "key_verses": ["Genesis 29:31", "Genesis 29:35"],
    },
    {
        "name": "Rachel",
        "epithet": "The beloved wife",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Matriarch",
        "era": "The patriarchs",
        "family": [{"relation": "Husband", "id": "jacob"}, {"relation": "Sister", "id": "leah"},
                   {"relation": "Son", "id": "joseph"}],
        "summary": "Jacob's beloved wife, for whom he served fourteen years, mother of Joseph and Benjamin, who died in childbirth on the road to Bethlehem.",
        "story": (
            "Jacob met Rachel at a well and served seven years for her, 'and they seemed unto him but a few "
            "days, for the love he had to her.' Tricked into marrying Leah first, he served seven more. "
            "Rachel was long barren and envied her sister, until 'God remembered Rachel' and she bore "
            "Joseph. On the road near Bethlehem she died giving birth to Benjamin, and Jacob set up a "
            "pillar on her grave."),
        "importance": (
            "Rachel became a picture of Israel's mothers mourning their lost children: Jeremiah heard "
            "'Rahel weeping for her children' (Jeremiah 31:15), and Matthew hears it again at Bethlehem "
            "(Matthew 2:18)."),
        "known_for": ["Fourteen years of service", "Mother of Joseph", "Her tomb near Bethlehem"],
        "told_in": ["Genesis 29:1-31:35", "Genesis 35:16-20"],
        "also_in": ["Jeremiah 31:15", "Matthew 2:18"],
        "key_verses": ["Genesis 29:20"],
    },
    {
        "name": "Joseph",
        "epithet": "The dreamer who saved his family",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Governor of Egypt",
        "era": "The patriarchs",
        "hero": "joseph",
        "family": [{"relation": "Father", "id": "jacob"}, {"relation": "Mother", "id": "rachel"},
                   {"relation": "Brother", "id": "judah"}],
        "summary": "Jacob's favourite son, sold into slavery by his brothers, who rose from an Egyptian prison to rule Egypt and save his family from famine.",
        "story": (
            "Joseph's father gave him a coat of many colours, and his dreams of his brothers bowing down "
            "to him made them hate him. They sold him to traders, and he became a slave in Potiphar's "
            "house, and then a prisoner on a false charge. God gave him the meaning of Pharaoh's dreams, "
            "seven years of plenty and seven of famine, and Pharaoh set him over all Egypt. When his "
            "brothers came to buy grain, he tested them, and then made himself known, weeping."),
        "importance": (
            "Joseph's story shows God at work through betrayal and injustice. He told his brothers, 'ye "
            "thought evil against me; but God meant it unto good' (Genesis 50:20). Through him Israel's "
            "family came to Egypt, where the story of the exodus begins."),
        "known_for": ["The coat of many colours", "Sold by his brothers", "Ruler of Egypt"],
        "told_in": ["Genesis 37-50"],
        "also_in": ["Psalms 105:16-22", "Acts 7:9-16", "Hebrews 11:22"],
        "key_verses": ["Genesis 50:20"],
    },
    {
        "name": "Judah",
        "epithet": "The brother who offered himself",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "Son of Jacob; father of the royal tribe",
        "era": "The patriarchs",
        "family": [{"relation": "Father", "id": "jacob"}, {"relation": "Mother", "id": "leah"},
                   {"relation": "Brother", "id": "joseph"}, {"relation": "Descendant", "id": "david"}],
        "summary": "Leah's fourth son, who proposed selling Joseph, later offered himself as a slave in Benjamin's place, and received the blessing of kingship.",
        "story": (
            "It was Judah who said, 'Come, and let us sell him to the Ishmeelites', when his brothers "
            "wanted Joseph dead. His dealings with his daughter-in-law Tamar ended with his own confession: "
            "'She hath been more righteous than I.' In Egypt, when Benjamin was about to be kept as a slave, "
            "Judah stepped forward and begged to take his place. Jacob blessed him: 'The sceptre shall not "
            "depart from Judah.'"),
        "importance": (
            "Judah's tribe gave Israel its kings, its capital and in time its name: the Jews are named "
            "after him. David came from his line, and Jesus is called 'the Lion of the tribe of Juda' "
            "(Revelation 5:5)."),
        "known_for": ["Selling Joseph", "Offering himself for Benjamin", "The royal tribe"],
        "told_in": ["Genesis 37:26-27", "Genesis 38:1-30", "Genesis 43:1-44:34", "Genesis 49:8-12"],
        "also_in": ["Revelation 5:5"],
        "key_verses": ["Genesis 49:10"],
    },
    {
        "name": "Job",
        "epithet": "The man who suffered and trusted",
        "group": "The patriarchs",
        "testament": "Old",
        "role": "A righteous man of Uz",
        "era": "Unknown; the book's setting recalls the age of the patriarchs",
        "hero": "job",
        "summary": "A blameless man who lost his wealth, his children and his health, argued his case before God, and was answered out of the whirlwind.",
        "story": (
            "Job was 'perfect and upright, and one that feared God, and eschewed evil.' Satan claimed he "
            "served God only for what he got, and in one day Job lost his flocks, his servants and his ten "
            "children, and then his health. He said, 'the LORD gave, and the LORD hath taken away; blessed "
            "be the name of the LORD.' Three friends came to comfort him and ended by accusing him. Job "
            "cried out to God for an answer, and God spoke out of the whirlwind. In the end 'the LORD gave "
            "Job twice as much as he had before.'"),
        "importance": (
            "The book of Job faces the hardest question, why the righteous suffer, and gives no easy "
            "answer. James holds him up: 'Ye have heard of the patience of Job' (James 5:11). The Bible "
            "does not say when he lived; the book's world feels like the age of the patriarchs."),
        "known_for": ["Losing everything", "“I know that my redeemer liveth”", "God in the whirlwind"],
        "told_in": ["Job 1-2", "Job 38-42"],
        "also_in": ["Ezekiel 14:14", "James 5:11"],
        "key_verses": ["Job 1:21", "Job 19:25"],
    },
    # ------------------------------------------------------------------ exodus and the promised land
    {
        "name": "Moses",
        "epithet": "The lawgiver",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "Prophet and leader of Israel",
        "era": "The exodus",
        "hero": "moses",
        "family": [{"relation": "Brother", "id": "aaron"}, {"relation": "Sister", "id": "miriam"},
                   {"relation": "Wife", "name": "Zipporah"}, {"relation": "Father-in-law", "id": "jethro"}],
        "summary": "Saved as a baby from Pharaoh's order, Moses led Israel out of slavery in Egypt, received the law at Sinai, and brought the people to the edge of the promised land.",
        "story": (
            "Moses was hidden in a basket on the Nile and raised by Pharaoh's daughter. After killing an "
            "Egyptian he fled to Midian and kept sheep for forty years, until God spoke from a burning bush "
            "and sent him back to Pharaoh: 'Let my people go.' Through ten plagues and the crossing of the "
            "Red Sea he led Israel out. At Sinai he received the law. For forty years he led a complaining "
            "people through the wilderness, and from Mount Nebo he saw the land he would not enter."),
        "importance": (
            "No Old Testament figure stands higher: 'there arose not a prophet since in Israel like unto "
            "Moses, whom the LORD knew face to face' (Deuteronomy 34:10). The first five books are called "
            "the Law of Moses, and on the mount of transfiguration he stood talking with Jesus."),
        "known_for": ["The burning bush", "The ten plagues", "The Ten Commandments"],
        "told_in": ["Exodus 2-40", "Deuteronomy 34:1-12"],
        "also_in": ["Numbers 12:3", "Acts 7:20-44", "Hebrews 11:23-29"],
        "key_verses": ["Exodus 3:14", "Deuteronomy 34:10"],
    },
    {
        "name": "Aaron",
        "epithet": "The first high priest",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "High priest",
        "era": "The exodus",
        "family": [{"relation": "Brother", "id": "moses"}, {"relation": "Sister", "id": "miriam"}],
        "summary": "Moses' elder brother and spokesman, who became Israel's first high priest, and who made the golden calf.",
        "story": (
            "When Moses protested that he was slow of speech, God sent Aaron to speak for him before "
            "Pharaoh, and his rod became a serpent that swallowed the magicians' rods. While Moses was on "
            "Sinai, the people pressed Aaron, and he made them a golden calf. Yet God chose him and his "
            "sons for the priesthood. He wore the breastplate bearing the names of the tribes, and his rod "
            "budded, blossomed and yielded almonds. He died on Mount Hor."),
        "importance": (
            "Aaron's priesthood shaped Israel's worship for centuries, and his blessing is still spoken: "
            "'The LORD bless thee, and keep thee' (Numbers 6:24). Hebrews contrasts his priesthood, which "
            "passed from man to man, with Christ's, which lasts for ever (Hebrews 7:23-24)."),
        "known_for": ["Moses' spokesman", "The golden calf", "The rod that budded"],
        "told_in": ["Exodus 4:14-16", "Exodus 7:8-13", "Exodus 28:1-4", "Exodus 32:1-35", "Numbers 17:1-11", "Numbers 20:22-29"],
        "also_in": ["Hebrews 5:4", "Hebrews 7:11-28"],
        "key_verses": ["Numbers 6:24-26"],
    },
    {
        "name": "Miriam",
        "epithet": "The prophetess with the timbrel",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "Prophetess",
        "era": "The exodus",
        "family": [{"relation": "Brother", "id": "moses"}, {"relation": "Brother", "id": "aaron"}],
        "summary": "The sister of Moses and Aaron, who led Israel's women in song after the crossing of the Red Sea.",
        "story": (
            "The sister who watched the baby Moses in the reeds and offered to find a Hebrew nurse was very "
            "probably Miriam, though that chapter does not name her. After the Red Sea she took a timbrel "
            "and led the women in dancing: 'Sing ye to the LORD, for he hath triumphed gloriously.' Later "
            "she and Aaron spoke against Moses, and she was struck with leprosy for seven days until Moses "
            "prayed for her. She died at Kadesh."),
        "importance": (
            "Miriam is the first woman the Bible calls a prophetess (Exodus 15:20), and she is remembered "
            "as one of the three leaders of the exodus: 'I sent before thee Moses, Aaron, and Miriam' "
            "(Micah 6:4)."),
        "known_for": ["Song at the Red Sea", "Sister of Moses"],
        "told_in": ["Exodus 2:1-10", "Exodus 15:20-21", "Numbers 12:1-16", "Numbers 20:1"],
        "also_in": ["Micah 6:4"],
        "key_verses": ["Exodus 15:21", "Micah 6:4"],
    },
    {
        "name": "Pharaoh of the exodus",
        "epithet": "The king who would not let Israel go",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "King of Egypt",
        "era": "The exodus",
        "hero": "pharaoh",
        "summary": "The king of Egypt who refused to let Israel go, hardened his heart through ten plagues, and lost his army in the sea.",
        "story": (
            "The Bible never gives his name. When Moses said, 'Let my people go', he answered, 'Who is the "
            "LORD, that I should obey his voice' to let Israel go? He made the Hebrews' labour harder. "
            "Through ten plagues he promised again and again to release them and then hardened his heart. "
            "After the death of the firstborn he let them go, then changed his mind and chased them to the "
            "Red Sea, where his chariots were drowned."),
        "importance": (
            "Pharaoh is the Bible's great picture of a proud heart hardened against God. Paul quotes God's "
            "word to him: 'for this same purpose have I raised thee up, that I might shew my power in thee' "
            "(Romans 9:17). Which pharaoh he was is still debated."),
        "known_for": ["The ten plagues", "A hardened heart", "The Red Sea"],
        "told_in": ["Exodus 5-14"],
        "also_in": ["Romans 9:17"],
        "key_verses": ["Exodus 5:2", "Romans 9:17"],
    },
    {
        "name": "Jethro",
        "epithet": "The priest of Midian who counselled Moses",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "Priest of Midian",
        "era": "The exodus",
        "family": [{"relation": "Son-in-law", "id": "moses"}, {"relation": "Daughter", "name": "Zipporah"}],
        "summary": "A priest of Midian who took in the fugitive Moses, gave him his daughter Zipporah, and later taught him to share the work of judging Israel.",
        "story": (
            "When Moses fled from Egypt, he defended the seven daughters of the priest of Midian at a well, "
            "and their father took him in and gave him Zipporah as his wife. (He is called Reuel in one "
            "place and Jethro in others.) After the exodus Jethro came to the camp, heard all that God had "
            "done, and said, 'Now I know that the LORD is greater than all gods.' Seeing Moses judge the "
            "people from morning to evening, he told him, 'The thing that thou doest is not good', and "
            "advised him to appoint able men as judges."),
        "importance": (
            "An outsider gave Israel its first system of courts, and Moses listened. Jethro is a reminder "
            "that wisdom can come from unexpected people, and that no leader should carry everything alone."),
        "known_for": ["Moses' father-in-law", "Advice to share the load"],
        "told_in": ["Exodus 2:15-22", "Exodus 18:1-27"],
        "key_verses": ["Exodus 18:17-18"],
    },
    {
        "name": "Joshua",
        "epithet": "The leader who took the land",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "Moses' successor",
        "era": "The conquest",
        "hero": "joshua",
        "family": [{"relation": "Served", "id": "moses"}],
        "summary": "Moses' assistant and successor, who led Israel across the Jordan, took Jericho, and divided the land among the tribes.",
        "story": (
            "Joshua fought Amalek while Moses held up his hands, went with Moses up Sinai, and was one of "
            "the twelve spies; only he and Caleb urged Israel to trust God and go in. After Moses died, God "
            "told him, 'Be strong and of a good courage.' He led Israel through the Jordan on dry ground, "
            "and Jericho's walls fell. He divided the land among the tribes, and at the end he challenged "
            "the people: 'as for me and my house, we will serve the LORD.'"),
        "importance": (
            "Joshua's name is the Hebrew form of Jesus; Hebrews compares the rest he led Israel into with "
            "the greater rest Jesus gives (Hebrews 4:8-9). He stands for courage built on God's promise: 'I "
            "will not fail thee, nor forsake thee' (Joshua 1:5)."),
        "known_for": ["The walls of Jericho", "Crossing the Jordan", "“As for me and my house”"],
        "told_in": ["Exodus 17:8-16", "Numbers 13-14", "Joshua 1-24"],
        "also_in": ["Hebrews 4:8-9"],
        "key_verses": ["Joshua 1:9", "Joshua 24:15"],
    },
    {
        "name": "Caleb",
        "epithet": "He wholly followed the LORD",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "Spy and leader of Judah",
        "era": "The conquest",
        "summary": "One of the twelve spies, who with Joshua trusted God's promise, and at eighty-five asked for the hill country where the giants lived.",
        "story": (
            "Of the twelve men Moses sent to spy out Canaan, ten came back afraid of the giants. Caleb "
            "stilled the people and said, 'Let us go up at once, and possess it; for we are well able to "
            "overcome it.' God said that Caleb 'hath followed me fully' and would enter the land. "
            "Forty-five years later, at eighty-five, he told Joshua he was as strong as ever and asked, "
            "'give me this mountain': Hebron, home of the giant Anakim. And he took it."),
        "importance": (
            "Caleb is the Bible's picture of faith that does not fade with age, because 'he wholly followed "
            "the LORD God of Israel' (Joshua 14:14). He shows that the minority report can be the right one."),
        "known_for": ["The faithful spy", "“Give me this mountain”"],
        "told_in": ["Numbers 13-14", "Joshua 14:6-15", "Joshua 15:13-19"],
        "key_verses": ["Numbers 13:30", "Joshua 14:12"],
    },
    {
        "name": "Balaam",
        "epithet": "The prophet for hire",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "A seer from Mesopotamia",
        "era": "The wilderness years",
        "hero": "balaam",
        "summary": "A seer hired by the king of Moab to curse Israel, who could only bless them, and who later led Israel into sin.",
        "story": (
            "Balak king of Moab sent princes with rewards to bring Balaam to curse Israel. God told him not "
            "to go; he went anyway. On the road his donkey saw the angel of the LORD standing in the way, "
            "turned aside three times, and then spoke. Three times Balak built altars, and three times "
            "Balaam blessed Israel instead: 'How shall I curse, whom God hath not cursed?' He even foretold "
            "that 'there shall come a Star out of Jacob.' Afterwards he counselled Moab to lure Israel into "
            "idolatry, and he was killed in battle."),
        "importance": (
            "Balaam is the New Testament's warning against religion for profit: he 'loved the wages of "
            "unrighteousness' (2 Peter 2:15). Even so, God put true words in his mouth, and his star "
            "prophecy has long been linked with the Messiah."),
        "known_for": ["The talking donkey", "Blessings instead of curses", "The star out of Jacob"],
        "told_in": ["Numbers 22-24", "Numbers 31:8-16"],
        "also_in": ["2 Peter 2:15-16", "Jude 1:11", "Revelation 2:14"],
        "key_verses": ["Numbers 23:19", "Numbers 24:17"],
    },
    {
        "name": "Rahab",
        "epithet": "The woman who hid the spies",
        "group": "Exodus and the promised land",
        "testament": "Old",
        "role": "A woman of Jericho",
        "era": "The conquest",
        "hero": "rahab",
        "family": [{"relation": "Son", "id": "boaz"}],
        "summary": "A woman of Jericho who hid Israel's spies, trusted Israel's God, and was saved with her family when the city fell.",
        "story": (
            "Rahab, a harlot whose house was on Jericho's wall, hid Joshua's two spies under stalks of flax "
            "and sent the king's men the wrong way. She told the spies, 'the LORD your God, he is God in "
            "heaven above, and in earth beneath.' They told her to tie a scarlet cord in her window. When "
            "the walls fell, Rahab and all her family were brought out alive, and she lived in Israel."),
        "importance": (
            "A Canaanite outsider became part of Israel's story and of Jesus' family tree: Matthew names her "
            "as the mother of Boaz (Matthew 1:5). Hebrews praises her faith and James her deeds (Hebrews "
            "11:31; James 2:25)."),
        "known_for": ["Hiding the spies", "The scarlet cord", "Ancestor of David"],
        "told_in": ["Joshua 2:1-24", "Joshua 6:22-25"],
        "also_in": ["Matthew 1:5", "Hebrews 11:31", "James 2:25"],
        "key_verses": ["Joshua 2:11", "Hebrews 11:31"],
    },
]
