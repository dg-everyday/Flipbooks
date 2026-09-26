"""Heroes of the Bible.

Each entry: name, epithet, testament, era, books (names as in the database),
summary, story, moment {title, reference}, traits (strengths), flaws (told
honestly — Scripture does not hide them), lesson, told_in (where the story is),
key_verses, faced (ids of entries they stood against), peoples, and an optional
`turned` note for someone who changed sides.
"""

HEROES = [
    # ------------------------------------------------------------ Old Testament
    {
        "name": "Noah",
        "epithet": "The builder who believed",
        "testament": "Old",
        "era": "Before the flood",
        "books": ["Genesis"],
        "summary": "A righteous man in a violent world who built the ark at God's word and carried humanity through the flood.",
        "story": (
            "When 'the wickedness of man was great in the earth', Noah 'found grace in the eyes of "
            "the LORD'. God told him to build an ark of gopher wood and bring his family and the "
            "animals into it. For years he built a ship on dry land. The flood came, the ark "
            "floated, and after it settled on the mountains of Ararat God made a covenant with "
            "Noah never again to destroy the earth by flood, sealed with the rainbow."),
        "moment": {"title": "He did all that God commanded", "reference": "Genesis 6:22"},
        "traits": ["Faith", "Obedience", "Patience", "Righteousness in a corrupt age"],
        "flaws": "After the flood Noah planted a vineyard, got drunk and lay uncovered in his tent — a sad scene that led to the curse on Canaan (Genesis 9:20-25).",
        "lesson": "Faith obeys even when the task looks foolish and the world is watching. God's grace comes first; Noah's obedience answers it.",
        "told_in": ["Genesis 6-9"],
        "key_verses": ["Genesis 6:8", "Hebrews 11:7"],
        "faced": [],
        "peoples": [],
    },
    {
        "name": "Abraham",
        "epithet": "The father of faith",
        "testament": "Old",
        "era": "c. 2000 BC (traditional)",
        "books": ["Genesis"],
        "summary": "Called out of Ur to a land he did not know, he believed God's promise of a son and a nation — and was counted righteous.",
        "story": (
            "At seventy-five Abram left Haran at God's call, with the promise that he would become "
            "a great nation and a blessing to all families of the earth. Childless for decades, he "
            "'believed in the LORD; and he counted it to him for righteousness'. God renamed him "
            "Abraham, 'father of many nations', and gave him Isaac when he was a hundred. Then came "
            "the hardest test: to offer Isaac on Mount Moriah. Abraham went, and God provided a ram."),
        "moment": {"title": "The offering of Isaac on Mount Moriah", "reference": "Genesis 22:1-14"},
        "traits": ["Faith", "Obedience", "Hospitality", "Intercession for others"],
        "flaws": "Twice he passed Sarah off as his sister to protect himself (Genesis 12; 20), and he took Hagar to force the promise (Genesis 16).",
        "lesson": "Faith is trusting God's promise before you can see it. Paul makes Abraham the pattern for everyone who is justified by faith (Romans 4).",
        "told_in": ["Genesis 11:27-25:11"],
        "key_verses": ["Genesis 15:6", "Genesis 22:14", "Hebrews 11:8"],
        "faced": [],
        "peoples": ["israelites", "canaanites", "hittites", "egyptians", "ishmaelites"],
    },
    {
        "name": "Joseph",
        "epithet": "The dreamer who forgave",
        "testament": "Old",
        "era": "c. 1900–1800 BC (traditional)",
        "books": ["Genesis"],
        "summary": "Sold into slavery by his brothers and jailed on a lie, he rose to rule Egypt and saved the family that betrayed him.",
        "story": (
            "Jacob's favourite son dreamed his brothers would bow to him. In jealousy they sold him "
            "to traders bound for Egypt. As a slave in Potiphar's house he refused his master's wife "
            "and was thrown into prison, where he interpreted dreams. Called before Pharaoh, he "
            "foretold seven years of plenty and seven of famine and was made ruler over Egypt. When "
            "his brothers came to buy grain, he tested them, then revealed himself and forgave them: "
            "'ye thought evil against me; but God meant it unto good.'"),
        "moment": {"title": "Revealing himself to his brothers", "reference": "Genesis 45:1-8"},
        "traits": ["Integrity", "Purity", "Faithfulness in hardship", "Forgiveness"],
        "flaws": "As a young man he tactlessly told his dreams and brought a bad report of his brothers (Genesis 37:2-11).",
        "lesson": "God is at work even in betrayal and injustice. Faithfulness in small, hidden places prepares for great ones, and forgiveness breaks the cycle of revenge.",
        "told_in": ["Genesis 37-50"],
        "key_verses": ["Genesis 39:9", "Genesis 50:20"],
        "faced": [],
        "peoples": ["egyptians", "ishmaelites", "midianites", "israelites"],
    },
    {
        "name": "Moses",
        "epithet": "The deliverer and lawgiver",
        "testament": "Old",
        "era": "15th or 13th century BC",
        "books": ["Exodus", "Leviticus", "Numbers", "Deuteronomy"],
        "summary": "Saved as a baby, raised in Pharaoh's palace, and sent from a burning bush to lead Israel out of slavery and receive God's Law.",
        "story": (
            "Hidden in a basket on the Nile, Moses was adopted by Pharaoh's daughter. At forty he "
            "killed an Egyptian and fled to Midian, where he kept sheep for forty years. God called "
            "him from a burning bush. Reluctant and slow of speech, he went back, confronted Pharaoh "
            "through ten plagues, and led Israel through the Red Sea. On Sinai he received the Ten "
            "Commandments, and for forty years he led a complaining people through the wilderness, "
            "interceding for them again and again. He saw the promised land from Mount Nebo, and "
            "died there."),
        "moment": {"title": "Parting the Red Sea", "reference": "Exodus 14:21-22"},
        "traits": ["Humility", "Intercession", "Perseverance", "Faithfulness"],
        "flaws": "He killed an Egyptian in anger, argued with God's call, and struck the rock in anger at Meribah — which kept him out of the promised land (Numbers 20:10-12).",
        "lesson": "God uses reluctant, imperfect people. Moses was 'very meek, above all the men which were upon the face of the earth', and God spoke with him 'face to face'.",
        "told_in": ["Exodus 2-40", "Numbers 1-36", "Deuteronomy 1-34"],
        "key_verses": ["Exodus 3:14", "Numbers 12:3", "Hebrews 11:24-25"],
        "faced": ["pharaoh"],
        "peoples": ["israelites", "egyptians", "midianites", "amalekites", "moabites"],
    },
    {
        "name": "Joshua",
        "epithet": "The strong and courageous",
        "testament": "Old",
        "era": "c. 1400 BC (traditional)",
        "books": ["Exodus", "Numbers", "Joshua"],
        "summary": "Moses' faithful assistant who led Israel across the Jordan, brought down Jericho and divided the promised land.",
        "story": (
            "Joshua fought the Amalekites while Moses prayed, served Moses on Sinai, and was one of "
            "only two spies who trusted God to give Canaan. After Moses died, God told him three "
            "times to be strong and courageous. He led the people across the Jordan on dry ground, "
            "marched around Jericho until its walls fell, and fought the kings of Canaan. In old age "
            "he gathered Israel at Shechem and called them to choose: 'as for me and my house, we "
            "will serve the LORD.'"),
        "moment": {"title": "The walls of Jericho fall", "reference": "Joshua 6:20"},
        "traits": ["Courage", "Loyalty", "Obedience", "Leadership"],
        "flaws": "He made a treaty with the Gibeonites without asking counsel of the LORD (Joshua 9:14).",
        "lesson": "Courage rests on God's presence, not on the size of the enemy: 'the LORD thy God is with thee whithersoever thou goest.'",
        "told_in": ["Exodus 17:8-14", "Numbers 13-14", "Joshua 1-24"],
        "key_verses": ["Joshua 1:9", "Joshua 24:15"],
        "faced": [],
        "peoples": ["israelites", "canaanites", "amorites", "amalekites", "anakim", "hivites"],
    },
    {
        "name": "Rahab",
        "epithet": "The outsider saved by faith",
        "testament": "Old",
        "era": "c. 1400 BC (traditional)",
        "books": ["Joshua", "Matthew", "Hebrews", "James"],
        "summary": "A Canaanite woman of Jericho who hid Israel's spies, trusted their God, and became an ancestor of King David and of Jesus.",
        "story": (
            "Rahab, a harlot whose house was on Jericho's wall, had heard what God did at the Red "
            "Sea and confessed: 'the LORD your God, he is God in heaven above, and in earth "
            "beneath.' She hid the two spies on her roof and let them down by a rope, asking only "
            "that her family be spared. A scarlet cord in her window marked her house, and when the "
            "walls fell she and her household were saved. She married into Israel; Matthew names her "
            "as the mother of Boaz."),
        "moment": {"title": "The scarlet cord in the window", "reference": "Joshua 2:18-21"},
        "traits": ["Faith", "Courage", "Kindness", "Loyalty to God's people"],
        "flaws": "Her past as a harlot is named plainly, and she lied to the king's men to protect the spies (Joshua 2:4-5).",
        "lesson": "No one is too far outside for God's grace. Rahab is one of only two women named in Hebrews 11's hall of faith.",
        "told_in": ["Joshua 2", "Joshua 6:22-25"],
        "key_verses": ["Joshua 2:11", "Hebrews 11:31"],
        "faced": [],
        "peoples": ["canaanites", "israelites"],
    },
    {
        "name": "Deborah",
        "epithet": "The prophetess who judged Israel",
        "testament": "Old",
        "era": "c. 1200 BC",
        "books": ["Judges"],
        "summary": "A prophetess and judge who summoned Barak to battle, went with him, and celebrated God's victory over Sisera in song.",
        "story": (
            "Under Jabin king of Canaan, whose general Sisera had nine hundred iron chariots, Israel "
            "was oppressed for twenty years. Deborah judged Israel under a palm tree between Ramah "
            "and Bethel. She told Barak that God would give him victory; he would only go if she went "
            "too, so she went, and foretold that the honour would go to a woman. God routed "
            "Sisera's army at the river Kishon, and Jael killed Sisera. Deborah's song (Judges 5) is "
            "one of the oldest poems in the Bible."),
        "moment": {"title": "'Up; for this is the day'", "reference": "Judges 4:14"},
        "traits": ["Wisdom", "Courage", "Faith", "Leadership"],
        "flaws": "Scripture records no failing of Deborah's.",
        "lesson": "God raises up the leaders he chooses. Faithful leadership calls others to act and gives God the glory.",
        "told_in": ["Judges 4-5"],
        "key_verses": ["Judges 4:14", "Judges 5:31"],
        "faced": [],
        "peoples": ["israelites", "canaanites", "kenites"],
    },
    {
        "name": "Gideon",
        "epithet": "The least who became mighty",
        "testament": "Old",
        "era": "c. 1150 BC",
        "books": ["Judges"],
        "summary": "A fearful farmer called 'mighty man of valour', who defeated the Midianite hordes with three hundred men, trumpets and torches.",
        "story": (
            "Gideon was threshing wheat in a winepress to hide it from the Midianites when the angel "
            "of the LORD greeted him as a 'mighty man of valour'. He protested he was the least in "
            "his father's house. He tore down his father's altar to Baal by night and asked for signs "
            "with a fleece. God cut his army from 32,000 to 300 so that Israel could not boast. At "
            "night they broke their pitchers, shone their lamps and blew their trumpets, and the "
            "Midianites turned on one another and fled."),
        "moment": {"title": "Three hundred trumpets and torches", "reference": "Judges 7:19-22"},
        "traits": ["Obedience", "Humility", "Courage that grew", "Refused to be king"],
        "flaws": "He asked for repeated signs, took revenge on two towns, and made a gold ephod that became a snare to Israel and his family (Judges 8:27).",
        "lesson": "God delights to save by few, so that the glory is his: 'The people that are with thee are too many for me.'",
        "told_in": ["Judges 6-8"],
        "key_verses": ["Judges 6:12", "Judges 7:2"],
        "faced": [],
        "peoples": ["israelites", "midianites", "amalekites"],
    },
    {
        "name": "Ruth",
        "epithet": "The loyal Moabitess",
        "testament": "Old",
        "era": "c. 1100 BC",
        "books": ["Ruth", "Matthew"],
        "summary": "A Moabite widow who refused to leave her mother-in-law, chose Israel's God, and became the great-grandmother of David.",
        "story": (
            "When Naomi lost her husband and both sons in Moab and decided to go home, her "
            "daughter-in-law Orpah went back to her people, but Ruth clung to her: 'thy people shall "
            "be my people, and thy God my God.' In Bethlehem Ruth gleaned barley to feed them both, "
            "in the field of Boaz, a relative, who showed her great kindness. At Naomi's urging she "
            "asked Boaz to redeem the family; he married her, and their son Obed was the grandfather "
            "of David."),
        "moment": {"title": "'Whither thou goest, I will go'", "reference": "Ruth 1:16-17"},
        "traits": ["Loyalty", "Kindness (hesed)", "Hard work", "Humility"],
        "flaws": "Scripture records no failing of Ruth's.",
        "lesson": "Faithful love in ordinary life is part of God's great story. A foreigner who took refuge under God's wings became part of the Messiah's family.",
        "told_in": ["Ruth 1-4"],
        "key_verses": ["Ruth 1:16", "Ruth 2:12"],
        "faced": [],
        "peoples": ["moabites", "israelites"],
    },
    {
        "name": "Hannah",
        "epithet": "The woman who prayed",
        "testament": "Old",
        "era": "c. 1100 BC",
        "books": ["1 Samuel"],
        "summary": "A barren, taunted wife who poured out her soul to God for a son, then gave that son — Samuel — back to God's service.",
        "story": (
            "Hannah had no children, and her rival Peninnah provoked her year after year. At the "
            "tabernacle in Shiloh she prayed so intensely that Eli the priest thought she was drunk. "
            "She vowed that if God gave her a son she would give him to the LORD all his life. God "
            "remembered her, and she named the boy Samuel. When he was weaned she brought him to "
            "Eli and left him there, and sang a song of praise that Mary would echo a thousand "
            "years later."),
        "moment": {"title": "Pouring out her soul before the LORD", "reference": "1 Samuel 1:15"},
        "traits": ["Prayer", "Faithfulness", "Keeping her word", "Praise"],
        "flaws": "Scripture records no failing of Hannah's.",
        "lesson": "Bring your deepest grief to God honestly. What he gives, give back to him.",
        "told_in": ["1 Samuel 1:1-2:11"],
        "key_verses": ["1 Samuel 1:27", "1 Samuel 2:2"],
        "faced": [],
        "peoples": ["israelites"],
    },
    {
        "name": "Samuel",
        "epithet": "The prophet who anointed kings",
        "testament": "Old",
        "era": "c. 1100–1015 BC",
        "books": ["1 Samuel"],
        "summary": "Hannah's son, called by God as a boy, who became Israel's last judge and the prophet who anointed Saul and David.",
        "story": (
            "Serving in the tabernacle as a child, Samuel heard a voice in the night and answered, "
            "'Speak; for thy servant heareth.' He grew into a prophet 'established' before all "
            "Israel, led the nation back from idols, and judged it all his life. When the people "
            "demanded a king, he warned them, then anointed Saul. When Saul disobeyed, Samuel "
            "confronted him and later anointed the shepherd boy David."),
        "moment": {"title": "'Speak; for thy servant heareth'", "reference": "1 Samuel 3:10"},
        "traits": ["Listening to God", "Integrity", "Prayer", "Courage to confront kings"],
        "flaws": "His sons did not walk in his ways and took bribes, which prompted the demand for a king (1 Samuel 8:1-5).",
        "lesson": "Leadership begins with listening. Samuel could say, when he retired, that he had taken nothing from anyone (1 Samuel 12:3-4).",
        "told_in": ["1 Samuel 1-16", "1 Samuel 25:1"],
        "key_verses": ["1 Samuel 3:10", "1 Samuel 15:22"],
        "faced": ["saul"],
        "peoples": ["israelites", "philistines", "amalekites"],
    },
    {
        "name": "David",
        "epithet": "The shepherd king",
        "testament": "Old",
        "era": "c. 1040–970 BC",
        "books": ["1 Samuel", "2 Samuel", "1 Kings", "1 Chronicles", "Psalms"],
        "summary": "The youngest son of Jesse, who killed Goliath, became Israel's greatest king, wrote many psalms, and received God's promise of an everlasting throne.",
        "story": (
            "God chose David because 'the LORD looketh on the heart'. As a teenager he faced the "
            "giant Goliath with a sling, 'in the name of the LORD of hosts'. He served Saul, who "
            "grew jealous and hunted him for years, yet David twice refused to kill him. As king he "
            "took Jerusalem, brought the ark there dancing, and received God's covenant that his "
            "throne would last for ever. But he committed adultery with Bathsheba and had her "
            "husband killed; confronted by Nathan, he repented deeply (Psalm 51), and lived with "
            "the painful consequences in his family."),
        "moment": {"title": "Facing Goliath", "reference": "1 Samuel 17:45-50"},
        "traits": ["Faith", "Courage", "Worship", "Repentance", "Mercy to enemies"],
        "flaws": "Adultery with Bathsheba and the murder of Uriah (2 Samuel 11); indulgence toward his sons; a proud census (2 Samuel 24).",
        "lesson": "God calls him 'a man after mine own heart' — not because he was sinless, but because he trusted God and truly repented. His greater Son is Jesus, 'the son of David'.",
        "told_in": ["1 Samuel 16-31", "2 Samuel 1-24", "1 Kings 1-2"],
        "key_verses": ["1 Samuel 17:45", "Psalms 23:1", "Psalms 51:10"],
        "faced": ["goliath", "saul", "absalom"],
        "peoples": ["israelites", "philistines", "jebusites", "ammonites", "moabites", "amalekites"],
    },
    {
        "name": "Jonathan",
        "epithet": "The faithful friend",
        "testament": "Old",
        "era": "c. 1010 BC",
        "books": ["1 Samuel", "2 Samuel"],
        "summary": "Saul's son and heir, a brave warrior who loved David as his own soul and gave up the throne to protect him.",
        "story": (
            "Jonathan attacked a Philistine garrison with only his armourbearer, saying 'there is no "
            "restraint to the LORD to save by many or by few.' After David killed Goliath, Jonathan "
            "made a covenant with him and gave him his robe, sword and bow. When Saul tried to kill "
            "David, Jonathan warned him, risked his father's spear, and parted from David in tears. "
            "He died beside Saul on Mount Gilboa, and David mourned: 'thy love to me was wonderful.'"),
        "moment": {"title": "The covenant of friendship", "reference": "1 Samuel 18:1-4"},
        "traits": ["Loyalty", "Selflessness", "Courage", "Faith"],
        "flaws": "Scripture records no failing of Jonathan's; he stayed loyal to his father even while protecting David.",
        "lesson": "True friendship gives up its own advantage for another. Jonathan knew David would be king, and rejoiced in it.",
        "told_in": ["1 Samuel 13-14", "1 Samuel 18-20", "1 Samuel 23:16-18", "2 Samuel 1:17-27"],
        "key_verses": ["1 Samuel 14:6", "1 Samuel 18:1"],
        "faced": ["saul"],
        "peoples": ["israelites", "philistines"],
    },
    {
        "name": "Elijah",
        "epithet": "The prophet of fire",
        "testament": "Old",
        "era": "c. 870–850 BC",
        "books": ["1 Kings", "2 Kings", "Malachi"],
        "summary": "The fearless prophet who stood alone against King Ahab and 450 prophets of Baal, and was taken to heaven in a whirlwind.",
        "story": (
            "Elijah the Tishbite announced a drought to Ahab and was fed by ravens and by a widow of "
            "Zarephath, whose son he raised to life. On Mount Carmel he challenged the prophets of "
            "Baal: 'How long halt ye between two opinions?' Their god did not answer; the LORD sent "
            "fire. Yet when Jezebel threatened him he fled to the desert in despair, and God met him "
            "not in wind, earthquake or fire, but in 'a still small voice'. He anointed Elisha and "
            "was taken up in a chariot of fire."),
        "moment": {"title": "Fire on Mount Carmel", "reference": "1 Kings 18:36-39"},
        "traits": ["Boldness", "Prayer", "Zeal for God", "Faith"],
        "flaws": "After Carmel he ran from Jezebel and asked to die, convinced he alone was left (1 Kings 19:4, 10).",
        "lesson": "James calls Elijah 'a man subject to like passions as we are' — ordinary, yet his prayer was powerful. God cares for his servants in their lowest moments too.",
        "told_in": ["1 Kings 17-19", "1 Kings 21", "2 Kings 1-2"],
        "key_verses": ["1 Kings 18:21", "1 Kings 19:12", "James 5:17"],
        "faced": ["ahab", "jezebel"],
        "peoples": ["israelites", "phoenicians"],
    },
    {
        "name": "Hezekiah",
        "epithet": "The king who trusted",
        "testament": "Old",
        "era": "c. 715–686 BC",
        "books": ["2 Kings", "2 Chronicles", "Isaiah"],
        "summary": "A reforming king of Judah who tore down idols and, when Assyria surrounded Jerusalem, spread the enemy's letter before God and prayed.",
        "story": (
            "Hezekiah reopened the Temple, restored the Passover and broke even the bronze serpent "
            "Moses made, because the people burned incense to it. 'He trusted in the LORD God of "
            "Israel; so that after him was none like him.' When Sennacherib's army besieged "
            "Jerusalem and mocked God, Hezekiah took the letter into the Temple and prayed. That "
            "night the angel of the LORD struck the Assyrian camp. Later, when he was deathly ill, "
            "God added fifteen years to his life."),
        "moment": {"title": "Spreading the letter before the LORD", "reference": "2 Kings 19:14-19"},
        "traits": ["Trust in God", "Reform", "Prayer", "Courage"],
        "flaws": "In pride he showed all his treasures to envoys from Babylon, and Isaiah foretold they would be carried there (2 Kings 20:12-18).",
        "lesson": "Bring your crisis to God before anyone else. Hezekiah's prayer asks that 'all the kingdoms of the earth may know' who God is.",
        "told_in": ["2 Kings 18-20", "2 Chronicles 29-32", "Isaiah 36-39"],
        "key_verses": ["2 Kings 18:5", "2 Kings 19:19"],
        "faced": [],
        "peoples": ["israelites", "assyrians", "babylonians"],
    },
    {
        "name": "Josiah",
        "epithet": "The boy king who found the Book",
        "testament": "Old",
        "era": "c. 640–609 BC",
        "books": ["2 Kings", "2 Chronicles"],
        "summary": "Made king at eight, he sought God as a youth, and when the lost book of the law was found he led Judah's greatest reformation.",
        "story": (
            "Josiah became king after his father Amon was assassinated. At sixteen he began to seek "
            "God, and at twenty to purge Judah of idols. While the Temple was being repaired, the "
            "high priest found the book of the law. When it was read to him, Josiah tore his clothes, "
            "gathered the people, renewed the covenant, destroyed the high places — even Jeroboam's "
            "altar at Bethel, as prophesied three centuries before — and kept a Passover like none "
            "since Samuel."),
        "moment": {"title": "Hearing the book of the law", "reference": "2 Kings 22:11-13"},
        "traits": ["Tender heart", "Zeal for God's Word", "Courage to reform", "Humility"],
        "flaws": "He went to fight Pharaoh Necho against God's warning and was killed at Megiddo (2 Chronicles 35:20-24).",
        "lesson": "It is never too early to seek God, and God's Word, once heard, must be obeyed.",
        "told_in": ["2 Kings 22:1-23:30", "2 Chronicles 34-35"],
        "key_verses": ["2 Kings 22:19", "2 Kings 23:25"],
        "faced": [],
        "peoples": ["israelites", "egyptians"],
    },
    {
        "name": "Esther",
        "epithet": "The queen for such a time",
        "testament": "Old",
        "era": "c. 480 BC",
        "books": ["Esther"],
        "summary": "A Jewish orphan made queen of Persia, who risked her life to stand before the king and save her people from Haman.",
        "story": (
            "Raised by her cousin Mordecai, Esther was chosen queen by King Ahasuerus without "
            "revealing she was a Jew. When Haman obtained a decree to destroy all the Jews, "
            "Mordecai urged her to plead with the king, though going unbidden could mean death. "
            "She asked the Jews to fast three days, then went in: 'if I perish, I perish.' The king "
            "held out his sceptre. At her banquet she exposed Haman, who was hanged on his own "
            "gallows, and the Jews were delivered."),
        "moment": {"title": "'If I perish, I perish'", "reference": "Esther 4:16"},
        "traits": ["Courage", "Wisdom and timing", "Humility", "Self-sacrifice"],
        "flaws": "At first she hesitated to act, pointing to the danger (Esther 4:11).",
        "lesson": "God places people where they are 'for such a time as this'. Courage often means using the position you have for others.",
        "told_in": ["Esther 2-9"],
        "key_verses": ["Esther 4:14", "Esther 4:16"],
        "faced": ["haman"],
        "peoples": ["persians", "israelites", "amalekites"],
    },
    {
        "name": "Nehemiah",
        "epithet": "The builder who prayed",
        "testament": "Old",
        "era": "c. 445–430 BC",
        "books": ["Nehemiah"],
        "summary": "A Persian king's cupbearer who left the palace to rebuild Jerusalem's broken walls in fifty-two days, against fierce opposition.",
        "story": (
            "Hearing that Jerusalem lay in ruins, Nehemiah wept, fasted and prayed for days, then "
            "risked the king's displeasure to ask for leave to rebuild. He inspected the walls by "
            "night, organised families to build their own sections, and answered mockery and "
            "threats from Sanballat and Tobiah with prayer and guards: half worked, half held "
            "spears. The wall was finished in fifty-two days, and he led the people back to God's "
            "Law."),
        "moment": {"title": "The wall finished in fifty-two days", "reference": "Nehemiah 6:15-16"},
        "traits": ["Prayer", "Leadership", "Perseverance", "Integrity"],
        "flaws": "His reforms could be fierce — he beat and pulled out the hair of men who had married foreign wives (Nehemiah 13:25).",
        "lesson": "Pray, then plan and work. 'The joy of the LORD is your strength.'",
        "told_in": ["Nehemiah 1-13"],
        "key_verses": ["Nehemiah 2:20", "Nehemiah 8:10"],
        "faced": [],
        "peoples": ["persians", "israelites", "samaritans", "ammonites"],
    },
    {
        "name": "Daniel",
        "epithet": "The faithful exile",
        "testament": "Old",
        "era": "c. 605–536 BC",
        "books": ["Daniel"],
        "summary": "Taken to Babylon as a youth, he stayed faithful to God under four kings, interpreted dreams, and was delivered from the lions' den.",
        "story": (
            "Daniel 'purposed in his heart' not to defile himself with the king's food, and God gave "
            "him wisdom. He interpreted Nebuchadnezzar's dreams and read the writing on the wall for "
            "Belshazzar on the night Babylon fell. Under Darius, jealous officials trapped him with a "
            "law against prayer; Daniel went home and prayed three times a day with his windows "
            "open, as before. Thrown to the lions, he was unharmed: 'My God hath sent his angel, and "
            "hath shut the lions' mouths.'"),
        "moment": {"title": "Praying with the windows open", "reference": "Daniel 6:10"},
        "traits": ["Integrity", "Prayer", "Wisdom", "Faithfulness over a lifetime"],
        "flaws": "Scripture records no failing of Daniel's; he confesses his people's sins as his own (Daniel 9).",
        "lesson": "You can serve faithfully in a culture that does not share your faith, without giving up your faith.",
        "told_in": ["Daniel 1-12"],
        "key_verses": ["Daniel 1:8", "Daniel 6:22"],
        "faced": ["nebuchadnezzar"],
        "peoples": ["babylonians", "medes", "persians", "israelites"],
    },
    {
        "id": "shadrach-meshach-and-abednego",
        "name": "Shadrach, Meshach and Abednego",
        "epithet": "The three who would not bow",
        "testament": "Old",
        "era": "c. 600–580 BC",
        "books": ["Daniel"],
        "summary": "Daniel's three friends who refused to worship Nebuchadnezzar's golden image and walked unharmed in the fiery furnace with a fourth man.",
        "story": (
            "Hananiah, Mishael and Azariah were given Babylonian names and high office. When "
            "Nebuchadnezzar set up a golden image on the plain of Dura and commanded all to bow, they "
            "stood. Given a second chance, they answered that God was able to deliver them, 'But if "
            "not… we will not serve thy gods.' Bound and thrown into a furnace heated seven times "
            "hotter, they walked loose in the fire with a fourth figure 'like the Son of God', and "
            "came out without even the smell of smoke."),
        "moment": {"title": "'But if not'", "reference": "Daniel 3:17-18"},
        "traits": ["Courage", "Faith", "Loyalty to God", "Friendship"],
        "flaws": "Scripture records no failing of theirs.",
        "lesson": "Faith trusts God's power and his will — whether or not he rescues. And no one goes through the fire alone.",
        "told_in": ["Daniel 1", "Daniel 3"],
        "key_verses": ["Daniel 3:17-18", "Daniel 3:25"],
        "faced": ["nebuchadnezzar"],
        "peoples": ["babylonians", "israelites"],
    },
    {
        "name": "Job",
        "epithet": "The patient sufferer",
        "testament": "Old",
        "era": "Patriarchal age",
        "books": ["Job", "James"],
        "summary": "A blameless man who lost everything, wrestled honestly with God through his pain, and never cursed him.",
        "story": (
            "Job was the greatest man of the east, 'perfect and upright'. In one day he lost his "
            "herds, his servants and his ten children, and then his health. He fell to the ground and "
            "worshipped. His friends insisted he must have sinned; Job protested his innocence and "
            "cried out for an answer. God spoke from the whirlwind, Job repented of speaking beyond "
            "his knowledge, and God restored him double."),
        "moment": {"title": "'The LORD gave, and the LORD hath taken away'", "reference": "Job 1:20-22"},
        "traits": ["Patience", "Integrity", "Honest prayer", "Faith in suffering"],
        "flaws": "In his anguish he spoke rashly and demanded that God answer him (Job 40:2-5; 42:3).",
        "lesson": "Suffering is not always punishment. We may bring our questions to God, and trust him even when he does not explain.",
        "told_in": ["Job 1-42"],
        "key_verses": ["Job 1:21", "Job 19:25", "James 5:11"],
        "faced": ["satan"],
        "peoples": ["sabeans"],
    },
    # ------------------------------------------------------------ New Testament
    {
        "id": "mary-mother-of-jesus",
        "name": "Mary, mother of Jesus",
        "epithet": "The handmaid of the Lord",
        "testament": "New",
        "era": "c. 20 BC – 1st century AD",
        "books": ["Matthew", "Luke", "John", "Acts"],
        "summary": "A young woman of Nazareth who said yes to God's plan, bore the Son of God, and stood by him at the cross.",
        "story": (
            "The angel Gabriel told Mary, a virgin engaged to Joseph, that she would bear the Son of "
            "the Highest. She answered, 'be it unto me according to thy word', and sang the "
            "Magnificat. She gave birth in Bethlehem, fled to Egypt, and 'kept all these things, and "
            "pondered them in her heart'. At Cana she told the servants, 'Whatsoever he saith unto "
            "you, do it.' She stood at the cross, where Jesus entrusted her to John, and was praying "
            "with the disciples before Pentecost."),
        "moment": {"title": "'Be it unto me according to thy word'", "reference": "Luke 1:38"},
        "traits": ["Faith", "Humility", "Obedience", "Endurance in sorrow"],
        "flaws": "Scripture records no failing of hers; once she and Jesus' brothers came to take him home (Mark 3:21, 31-35).",
        "lesson": "Surrender to God's will, even when it costs your reputation and breaks your heart.",
        "told_in": ["Luke 1-2", "John 2:1-11", "John 19:25-27", "Acts 1:14"],
        "key_verses": ["Luke 1:38", "Luke 1:46-47"],
        "faced": ["herod-the-great"],
        "peoples": ["israelites", "egyptians"],
    },
    {
        "name": "John the Baptist",
        "epithet": "The voice in the wilderness",
        "testament": "New",
        "era": "c. 5 BC – AD 29",
        "books": ["Matthew", "Mark", "Luke", "John"],
        "summary": "The forerunner who prepared the way for Jesus, baptised him, and was beheaded for rebuking King Herod.",
        "story": (
            "Born to the elderly priest Zacharias and Elisabeth, John lived in the wilderness, wore "
            "camel's hair and ate locusts and wild honey. He preached repentance and baptised crowds "
            "in the Jordan, then pointed to Jesus: 'Behold the Lamb of God.' He told his disciples, "
            "'He must increase, but I must decrease.' He rebuked Herod Antipas for taking his "
            "brother's wife, was imprisoned, and beheaded at Herodias' request. Jesus said none born "
            "of women was greater."),
        "moment": {"title": "'Behold the Lamb of God'", "reference": "John 1:29"},
        "traits": ["Boldness", "Humility", "Self-denial", "Faithfulness to death"],
        "flaws": "In prison he sent to ask Jesus, 'Art thou he that should come, or do we look for another?' (Matthew 11:3).",
        "lesson": "Point people to Jesus, not to yourself — and tell the truth even to the powerful.",
        "told_in": ["Luke 1", "Luke 3:1-22", "John 1:19-36", "John 3:22-30", "Mark 6:14-29"],
        "key_verses": ["John 1:29", "John 3:30"],
        "faced": ["herod-antipas"],
        "peoples": ["israelites"],
    },
    {
        "name": "Peter",
        "epithet": "The rock who fell and rose",
        "testament": "New",
        "era": "1st century AD",
        "books": ["Matthew", "Mark", "Luke", "John", "Acts", "1 Peter", "2 Peter"],
        "summary": "An impulsive fisherman who confessed Jesus as the Christ, denied him three times, was restored, and led the early church.",
        "story": (
            "Simon left his nets to follow Jesus, who named him Peter, 'rock'. He walked on water "
            "until he looked at the waves, confessed 'Thou art the Christ, the Son of the living "
            "God', and swore he would never deny Jesus — then did, three times, before the cock "
            "crowed. After the resurrection Jesus asked him three times, 'lovest thou me?' and told "
            "him to feed his sheep. At Pentecost Peter preached and three thousand believed. He "
            "healed a lame man, opened the door to the Gentile Cornelius, and by tradition died a "
            "martyr in Rome."),
        "moment": {"title": "Preaching at Pentecost", "reference": "Acts 2:14-41"},
        "traits": ["Boldness", "Wholehearted love", "Leadership", "Humility after failure"],
        "flaws": "He denied Jesus three times (Luke 22:54-62), and later drew back from eating with Gentiles until Paul rebuked him (Galatians 2:11-14).",
        "lesson": "Failure need not be final. Jesus restores those who fall and uses them to strengthen others.",
        "told_in": ["Matthew 16:13-19", "Luke 22:31-62", "John 21:15-19", "Acts 1-12"],
        "key_verses": ["Matthew 16:16", "John 21:17", "Acts 4:12"],
        "faced": ["caiaphas"],
        "peoples": ["israelites", "romans", "samaritans"],
    },
    {
        "name": "Mary Magdalene",
        "epithet": "The first witness of the resurrection",
        "testament": "New",
        "era": "1st century AD",
        "books": ["Matthew", "Mark", "Luke", "John"],
        "summary": "Freed by Jesus from seven devils, she followed and supported him, stood at the cross, and was the first to see him risen.",
        "story": (
            "Mary of Magdala was one of the women who travelled with Jesus and provided for him from "
            "their own means, after he cast seven devils out of her. When most of the disciples had "
            "fled, she watched the crucifixion and saw where he was buried. Early on the first day "
            "of the week she came to the tomb and found it empty. Weeping in the garden, she heard "
            "her name — 'Mary' — and knew him. Jesus sent her to tell the disciples: 'I ascend unto "
            "my Father, and your Father.'"),
        "moment": {"title": "'Mary' — 'Rabboni'", "reference": "John 20:16"},
        "traits": ["Devotion", "Courage", "Gratitude", "Faithful witness"],
        "flaws": "Scripture records no failing of hers. (The later idea that she had been a prostitute is not in the Bible.)",
        "lesson": "Jesus meets those who seek him and entrusts the best news in history to those the world overlooks.",
        "told_in": ["Luke 8:1-3", "Mark 15:40-47", "John 20:1-18"],
        "key_verses": ["John 20:16", "John 20:18"],
        "faced": [],
        "peoples": ["israelites"],
    },
    {
        "name": "Stephen",
        "epithet": "The first martyr",
        "testament": "New",
        "era": "c. AD 34",
        "books": ["Acts"],
        "summary": "A deacon 'full of faith and power' who preached Christ before the council and died praying for those who stoned him.",
        "story": (
            "Stephen was one of seven men chosen to care for the widows of the Jerusalem church, "
            "and he did great wonders among the people. Accused of blasphemy, he answered the "
            "council with a sweeping history of Israel, ending with their rejection of the Just "
            "One. As they rushed at him he saw 'the Son of man standing on the right hand of God'. "
            "While they stoned him — with a young man named Saul holding their coats — he prayed, "
            "'Lord, lay not this sin to their charge.'"),
        "moment": {"title": "Praying for his killers", "reference": "Acts 7:59-60"},
        "traits": ["Faith", "Wisdom", "Courage", "Forgiveness"],
        "flaws": "Scripture records no failing of Stephen's.",
        "lesson": "Faithfulness can cost everything — and forgiveness can reach even the persecutor watching (Saul became Paul).",
        "told_in": ["Acts 6-7"],
        "key_verses": ["Acts 6:8", "Acts 7:60"],
        "faced": [],
        "peoples": ["israelites", "greeks"],
    },
    {
        "name": "Paul",
        "epithet": "The persecutor turned apostle",
        "testament": "New",
        "era": "c. AD 5 – 67",
        "books": ["Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon"],
        "summary": "Saul the zealous Pharisee who hunted Christians, until the risen Jesus met him on the Damascus road — then the greatest missionary of the church.",
        "story": (
            "Saul of Tarsus approved Stephen's death and 'made havock of the church'. On the road "
            "to Damascus a light from heaven blinded him and a voice asked, 'Saul, Saul, why "
            "persecutest thou me?' Baptised by Ananias, he began to preach the Jesus he had "
            "persecuted. As Paul he made three long missionary journeys, planted churches across "
            "Asia Minor and Greece, and wrote thirteen New Testament letters. Beaten, shipwrecked "
            "and imprisoned, he was finally taken to Rome, where by tradition he was executed "
            "under Nero."),
        "moment": {"title": "The Damascus road", "reference": "Acts 9:3-6"},
        "traits": ["Zeal", "Endurance", "Grace-filled teaching", "Love for the churches"],
        "flaws": "Before his conversion he persecuted the church violently; later he fell out sharply with Barnabas over Mark (Acts 15:39).",
        "lesson": "No one is beyond the reach of grace. Paul called himself the chief of sinners, and the proof of Christ's longsuffering.",
        "turned": "From the church's fiercest persecutor to its greatest missionary.",
        "told_in": ["Acts 7:58-8:3", "Acts 9:1-31", "Acts 13-28"],
        "key_verses": ["Acts 9:4", "Galatians 2:20", "2 Timothy 4:7"],
        "faced": [],
        "peoples": ["israelites", "romans", "greeks"],
    },
]
