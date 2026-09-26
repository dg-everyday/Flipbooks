"""History Books: Joshua – Esther."""

_FORMER_PROPHETS = (
    " In the Hebrew Bible, Joshua, Judges, Samuel and Kings are the 'Former Prophets'. Many "
    "scholars read them as one history, shaped by Deuteronomy's teaching and completed during "
    "the exile.")

_SAMUEL = (
    "The book does not name its author. Jewish tradition (Talmud, Bava Batra 14b–15a) says "
    "Samuel wrote the early part and the prophets Nathan and Gad completed it, drawing on 1 "
    "Chronicles 29:29. 1 and 2 Samuel were one book in Hebrew; the Greek translators split it "
    "into two." + _FORMER_PROPHETS)

_KINGS = (
    "The author is not named; Jewish tradition credits Jeremiah. The writer cites sources such "
    "as 'the book of the acts of Solomon' and the chronicles of the kings of Israel and Judah. "
    "1 and 2 Kings were one book in Hebrew." + _FORMER_PROPHETS)

_CHRONICLES = (
    "The author, often called 'the Chronicler', is not named; Jewish tradition credits Ezra, "
    "and the last verses of 2 Chronicles repeat the opening of Ezra. The writer drew on Samuel "
    "and Kings and on many named records. 1 and 2 Chronicles were one book in Hebrew, the last "
    "book of the Hebrew Bible.")

BOOKS = [
    {
        "name": "Joshua",
        "group": "history",
        "name_meaning": "Named after its hero; Joshua (Yehoshua) means 'the LORD is salvation' — the same name as Jesus.",
        "summary": "Israel crosses the Jordan, conquers Canaan under Joshua, and divides the land among the tribes.",
        "author": "Joshua (traditional), with later additions",
        "author_note": "The Talmud credits Joshua with the book, except the account of his death, added by Eleazar and Phinehas. Joshua is said to have written 'these words in the book of the law of God' (24:26)." + _FORMER_PROPHETS,
        "date": "c. 1400–1370 BC by the traditional dating; final form debated",
        "audience": "Israel settled in the land",
        "setting": "Canaan, from the crossing of the Jordan to Joshua's death (about 25 years)",
        "origin": (
            "Joshua continues directly from Deuteronomy: the same promise of land, now being kept. "
            "It includes eyewitness-style details ('unto this day', 4:9) alongside detailed "
            "boundary lists for each tribe, which served as Israel's land register."),
        "description": (
            "God tells Joshua to be strong and courageous. Rahab hides the spies, the Jordan parts, "
            "and Jericho's walls fall at the shout of the people. Achan's hidden sin causes defeat "
            "at Ai. The Gibeonites trick Israel into a treaty, and the sun stands still while "
            "Joshua defeats the southern kings. After the northern campaign the land is divided by "
            "lot, cities of refuge are set up, and Joshua's farewell ends with 'as for me and my "
            "house, we will serve the LORD.'"),
        "themes": ["God keeps his promises", "Courage and obedience", "Holy war and judgement", "Inheritance"],
        "outline": [
            {"chapters": "1-5", "title": "Entering the land"},
            {"chapters": "6-12", "title": "Conquering the land"},
            {"chapters": "13-21", "title": "Dividing the land"},
            {"chapters": "22-24", "title": "Joshua's farewell and the covenant renewed"},
        ],
        "key_verses": ["Joshua 1:9", "Joshua 6:20", "Joshua 21:45", "Joshua 24:15"],
        "key_people": ["Joshua", "Rahab", "Caleb", "Achan", "Eleazar"],
        "christ": "Joshua bears the name Jesus bears; he leads God's people into rest, a picture Hebrews 4 fulfils in Christ. Rahab of Jericho is in Jesus' genealogy (Matthew 1:5).",
        "peoples": ["israelites", "canaanites", "amorites", "hivites", "jebusites", "hittites", "perizzites", "girgashites", "anakim"],
    },
    {
        "name": "Judges",
        "group": "history",
        "name_meaning": "Named after the 'judges' (shophetim) — deliverers God raised up to rescue Israel.",
        "summary": "A downward spiral of sin, oppression and rescue, through Deborah, Gideon and Samson, when 'every man did that which was right in his own eyes'.",
        "author": "Unknown (Jewish tradition: Samuel)",
        "author_note": "The book does not name its author. The repeated line 'In those days there was no king in Israel' suggests it was written early in the monarchy." + _FORMER_PROPHETS,
        "date": "Probably early monarchy, c. 1050–1000 BC; final form debated",
        "audience": "Israel under its first kings",
        "setting": "From Joshua's death to the time of Samuel (c. 1375–1050 BC traditionally)",
        "origin": (
            "Judges gathers the stories of twelve deliverers from different tribes and arranges "
            "them in a repeating cycle: Israel sins, God gives them to an enemy, they cry out, God "
            "raises a judge, the land has rest, then the cycle starts again, each time worse."),
        "description": (
            "Othniel, left-handed Ehud and Shamgar come first. Deborah and Barak defeat Sisera, whom "
            "Jael kills with a tent peg. Gideon routs Midian with three hundred men, trumpets and "
            "torches. Jephthah makes a tragic vow. Samson, the strongest judge, is the weakest in "
            "character and dies pulling down Dagon's temple. The last chapters show the nation's "
            "collapse: a private idol, a tribe stealing it, a Levite's concubine murdered, and "
            "civil war against Benjamin."),
        "themes": ["The cycle of sin", "God's patience", "Unlikely deliverers", "The need for a king"],
        "outline": [
            {"chapters": "1-2", "title": "Incomplete conquest; the cycle explained"},
            {"chapters": "3-16", "title": "The judges, from Othniel to Samson"},
            {"chapters": "17-21", "title": "Idolatry and civil war"},
        ],
        "key_verses": ["Judges 2:16", "Judges 7:2", "Judges 21:25"],
        "key_people": ["Deborah and Barak", "Jael", "Gideon", "Jephthah", "Samson", "Delilah"],
        "christ": "Each judge is a flawed, temporary saviour; the book leaves Israel longing for a true King and Deliverer.",
        "peoples": ["israelites", "canaanites", "midianites", "philistines", "moabites", "ammonites", "amalekites", "kenites"],
    },
    {
        "name": "Ruth",
        "group": "history",
        "name_meaning": "Named after Ruth the Moabitess; the name may mean 'friend' or 'companion'.",
        "summary": "In the dark days of the judges, a loyal Moabite widow finds refuge under the wings of Israel's God and becomes the great-grandmother of David.",
        "author": "Unknown (Jewish tradition: Samuel)",
        "author_note": "The book does not name its author. It ends with David's genealogy, so it was written in or after David's time. In the Hebrew Bible it sits among the 'Writings' and is read at the feast of Weeks (Pentecost).",
        "date": "During or after David's reign (c. 1000 BC or later)",
        "audience": "Israel under the monarchy",
        "setting": "Bethlehem and Moab, 'in the days when the judges ruled'",
        "origin": (
            "A short, carefully crafted story set at harvest time. Its genealogy ties an ordinary "
            "family's faithfulness to the royal line, showing that God was at work even in the "
            "chaos of the judges."),
        "description": (
            "Famine drives Elimelech and Naomi to Moab, where Naomi's husband and sons die. Naomi "
            "returns to Bethlehem, and her Moabite daughter-in-law Ruth refuses to leave her: "
            "'whither thou goest, I will go.' Ruth gleans in the field of Boaz, a relative, who "
            "treats her kindly. At Naomi's urging Ruth asks Boaz to act as kinsman-redeemer; he "
            "marries her, and their son Obed becomes the grandfather of David."),
        "themes": ["Loyal love (hesed)", "Redemption", "Providence", "Gentiles welcomed"],
        "outline": [
            {"chapters": "1", "title": "Naomi and Ruth return to Bethlehem"},
            {"chapters": "2", "title": "Ruth gleans in Boaz's field"},
            {"chapters": "3", "title": "At the threshing floor"},
            {"chapters": "4", "title": "Boaz redeems; the line of David"},
        ],
        "key_verses": ["Ruth 1:16", "Ruth 2:12", "Ruth 4:17"],
        "key_people": ["Naomi", "Ruth", "Boaz", "Orpah", "Obed"],
        "christ": "Boaz the kinsman-redeemer pictures Christ who redeems at his own cost; Ruth is named in Jesus' genealogy (Matthew 1:5).",
        "peoples": ["moabites", "israelites"],
    },
    {
        "name": "1 Samuel",
        "group": "history",
        "name_meaning": "Named after Samuel, the last judge and the prophet who anointed Israel's first two kings. Samuel means 'heard of God' or 'name of God'.",
        "summary": "Israel moves from judges to kings: Samuel's birth and ministry, Saul's rise and rejection, and young David's rise.",
        "author": "Unknown (tradition: Samuel, Nathan and Gad)",
        "author_note": _SAMUEL,
        "date": "After Solomon's death (it mentions 'the kings of Judah', 27:6), c. 930 BC or later",
        "audience": "Israel and Judah under the kings",
        "setting": "c. 1105–1010 BC; Shiloh, Ramah, Gibeah and the wilderness of Judah",
        "origin": (
            "Samuel was written from prophetic records of the transition to monarchy. It is frank "
            "about its heroes' failures and shows that God, not human strength, raises and brings "
            "down kings."),
        "description": (
            "Barren Hannah prays for a son and gives Samuel to God's service. The ark is captured "
            "by the Philistines and returned. The people demand a king 'like all the nations', and "
            "God gives them Saul, who begins well but disobeys and is rejected: 'to obey is better "
            "than sacrifice'. Samuel anoints the shepherd boy David, who kills Goliath, becomes "
            "Jonathan's friend, and flees Saul's jealousy for years, twice sparing Saul's life. "
            "The book ends with Saul's death on Mount Gilboa."),
        "themes": ["Prayer answered", "Obedience", "God looks on the heart", "Kingship"],
        "outline": [
            {"chapters": "1-7", "title": "Samuel, the last judge"},
            {"chapters": "8-15", "title": "Saul's rise and rejection"},
            {"chapters": "16-31", "title": "David and Saul"},
        ],
        "key_verses": ["1 Samuel 3:10", "1 Samuel 15:22", "1 Samuel 16:7", "1 Samuel 17:45"],
        "key_people": ["Hannah", "Eli", "Samuel", "Saul", "David", "Jonathan", "Goliath"],
        "christ": "Hannah's song first speaks of the LORD's 'anointed' (Messiah, 2:10); David, the anointed shepherd-king from Bethlehem, foreshadows Christ.",
        "peoples": ["israelites", "philistines", "amalekites", "ammonites", "kenites"],
    },
    {
        "name": "2 Samuel",
        "group": "history",
        "name_meaning": "The second half of the book of Samuel.",
        "summary": "David's reign: his triumphs, God's covenant with his house, his sin with Bathsheba, and the troubles that followed.",
        "author": "Unknown (tradition: Nathan and Gad)",
        "author_note": _SAMUEL,
        "date": "After Solomon's death, c. 930 BC or later",
        "audience": "Israel and Judah under the kings",
        "setting": "c. 1010–970 BC; Hebron and Jerusalem",
        "origin": (
            "The book is built around the covenant God made with David in chapter 7 and then shows, "
            "without hiding anything, how David's own sin brought 'the sword' into his house."),
        "description": (
            "David mourns Saul and Jonathan, is made king over Judah and then all Israel, takes "
            "Jerusalem, and brings up the ark with dancing. God promises him an everlasting house "
            "and throne. At the height of his power David takes Bathsheba and has Uriah killed; "
            "Nathan confronts him — 'Thou art the man' — and David repents. Amnon's crime, "
            "Absalom's revolt and death, and further rebellions follow. The book closes with "
            "David's songs, his mighty men and the census plague."),
        "themes": ["God's covenant with David", "Sin and consequences", "Repentance", "Grace to the undeserving"],
        "outline": [
            {"chapters": "1-10", "title": "David's rise and the covenant"},
            {"chapters": "11-12", "title": "David and Bathsheba"},
            {"chapters": "13-20", "title": "Troubles in David's house"},
            {"chapters": "21-24", "title": "Songs, heroes and the census"},
        ],
        "key_verses": ["2 Samuel 7:16", "2 Samuel 12:7", "2 Samuel 22:2"],
        "key_people": ["David", "Bathsheba", "Nathan", "Joab", "Absalom", "Mephibosheth"],
        "christ": "The promise of an eternal throne for David's son (7:12-16) is fulfilled in Jesus, 'the son of David' (Luke 1:32-33).",
        "peoples": ["israelites", "philistines", "jebusites", "ammonites", "arameans", "moabites", "edomites", "hittites", "hivites"],
    },
    {
        "name": "1 Kings",
        "group": "history",
        "name_meaning": "Named after the kings of Israel and Judah whose reigns it records.",
        "summary": "Solomon's glory and the Temple, the kingdom's split into Israel and Judah, and Elijah's stand against Baal.",
        "author": "Unknown (Jewish tradition: Jeremiah)",
        "author_note": _KINGS,
        "date": "Completed after 561 BC (2 Kings 25:27), during the exile",
        "audience": "Exiles asking why the kingdom fell",
        "setting": "c. 970–853 BC; Jerusalem and Samaria",
        "origin": (
            "Kings judges every ruler by one measure — faithfulness to the LORD — and explains the "
            "exile as the result of centuries of idolatry, while holding on to God's promise to "
            "David."),
        "description": (
            "Solomon succeeds David, asks God for wisdom, builds and dedicates the Temple, and "
            "receives the queen of Sheba. But his foreign wives turn his heart to other gods. Under "
            "his son Rehoboam the ten northern tribes break away under Jeroboam, who sets up golden "
            "calves. A succession of northern kings follows, down to Ahab and Jezebel, who promote "
            "Baal. Elijah announces a drought, defeats the prophets of Baal on Mount Carmel, hears "
            "God's 'still small voice', and confronts Ahab over Naboth's vineyard."),
        "themes": ["Wisdom and its loss", "The Temple", "Division", "True and false worship"],
        "outline": [
            {"chapters": "1-11", "title": "Solomon's reign and the Temple"},
            {"chapters": "12-16", "title": "The kingdom divides"},
            {"chapters": "17-22", "title": "Elijah and Ahab"},
        ],
        "key_verses": ["1 Kings 3:9", "1 Kings 8:27", "1 Kings 12:16", "1 Kings 18:21"],
        "key_people": ["Solomon", "Rehoboam", "Jeroboam", "Ahab", "Jezebel", "Elijah"],
        "christ": "Jesus is 'greater than Solomon' (Matthew 12:42) and the true Temple (John 2:19-21).",
        "peoples": ["israelites", "phoenicians", "egyptians", "sabeans", "arameans", "moabites", "edomites", "hittites"],
    },
    {
        "name": "2 Kings",
        "group": "history",
        "name_meaning": "The second half of the book of Kings.",
        "summary": "Elisha's miracles, the fall of Israel to Assyria, the reforms of Hezekiah and Josiah, and Jerusalem's fall to Babylon.",
        "author": "Unknown (Jewish tradition: Jeremiah)",
        "author_note": _KINGS,
        "date": "Completed after 561 BC, during the exile",
        "audience": "Exiles in Babylon",
        "setting": "c. 853–561 BC; Israel, Judah, Assyria and Babylon",
        "origin": (
            "The second half of Kings follows both kingdoms to their end. Its final paragraph — King "
            "Jehoiachin released from prison and fed at the king's table — leaves a thread of hope "
            "for David's line."),
        "description": (
            "Elijah is taken up in a whirlwind, and Elisha receives a double portion of his spirit, "
            "raising a dead boy and healing Naaman. Jehu wipes out Ahab's house. The northern "
            "kingdom falls to Assyria in 722 BC, and chapter 17 explains why. In Judah, Hezekiah "
            "trusts God and Jerusalem is delivered from Sennacherib; Josiah finds the book of the "
            "law and leads a great reform. But Manasseh's evil sealed Judah's fate, and "
            "Nebuchadnezzar burns Jerusalem and the Temple in 586 BC."),
        "themes": ["Judgement on idolatry", "Prophetic power", "Reform", "Exile", "Hope for David's line"],
        "outline": [
            {"chapters": "1-8", "title": "Elisha's ministry"},
            {"chapters": "9-17", "title": "Israel and Judah to the fall of Samaria"},
            {"chapters": "18-25", "title": "Judah alone, to the fall of Jerusalem"},
        ],
        "key_verses": ["2 Kings 2:11", "2 Kings 6:16", "2 Kings 17:13", "2 Kings 23:25"],
        "key_people": ["Elijah", "Elisha", "Naaman", "Jehu", "Hezekiah", "Josiah", "Nebuchadnezzar"],
        "christ": "Elisha's ministry of healing, raising the dead and feeding many with little foreshadows Jesus' miracles (Luke 4:27).",
        "peoples": ["israelites", "assyrians", "babylonians", "arameans", "samaritans", "moabites", "egyptians", "edomites", "rechabites"],
    },
    {
        "name": "1 Chronicles",
        "group": "history",
        "name_meaning": "Hebrew Divre ha-Yamim, 'the words (events) of the days'. The Greek Paraleipomena means 'things left out'; 'Chronicles' comes from Jerome.",
        "summary": "Israel's story retold for the returned exiles: genealogies from Adam, then David's reign and his preparations for the Temple.",
        "author": "The Chronicler (Jewish tradition: Ezra)",
        "author_note": _CHRONICLES,
        "date": "c. 450–400 BC",
        "audience": "Jews who had returned from exile",
        "setting": "From Adam to David's death (c. 970 BC)",
        "origin": (
            "Written after the exile, Chronicles retells history from a priestly angle to remind a "
            "small, struggling community that they were still the people of God's covenant with "
            "David, centred on the Temple and true worship."),
        "description": (
            "Nine chapters of genealogy run from Adam through the tribes, including the short "
            "prayer of Jabez. Saul's death is told briefly, then David's reign in detail: bringing "
            "the ark to Jerusalem with music and praise, God's covenant, his victories, and "
            "especially his careful preparations for the Temple — materials, Levites, singers and "
            "gatekeepers. David's sin with Bathsheba is not retold."),
        "themes": ["Continuity of God's people", "Worship", "The Davidic covenant", "Temple"],
        "outline": [
            {"chapters": "1-9", "title": "Genealogies from Adam to the returned exiles"},
            {"chapters": "10-16", "title": "David made king; the ark comes to Jerusalem"},
            {"chapters": "17-20", "title": "God's covenant and David's victories"},
            {"chapters": "21-29", "title": "Preparing for the Temple; Solomon crowned"},
        ],
        "key_verses": ["1 Chronicles 4:10", "1 Chronicles 16:34", "1 Chronicles 29:11"],
        "key_people": ["David", "Jabez", "Asaph", "Solomon"],
        "christ": "The genealogies preserve the line of David from which the Messiah would come (Matthew 1:1).",
        "peoples": ["israelites", "philistines", "jebusites", "ammonites", "kenites", "rechabites"],
    },
    {
        "name": "2 Chronicles",
        "group": "history",
        "name_meaning": "The second half of Chronicles.",
        "summary": "The kings of Judah from Solomon's Temple to the exile, ending with Cyrus' decree to rebuild.",
        "author": "The Chronicler (Jewish tradition: Ezra)",
        "author_note": _CHRONICLES,
        "date": "c. 450–400 BC",
        "audience": "Jews who had returned from exile",
        "setting": "c. 970–538 BC; Jerusalem",
        "origin": (
            "The second half of Chronicles focuses on Judah and its Temple, highlighting the kings "
            "who sought God and the revivals they led, and ending on the hopeful note of return."),
        "description": (
            "Solomon builds and dedicates the Temple, and God answers: 'If my people… shall humble "
            "themselves, and pray… then will I hear from heaven.' The northern kingdom is mostly "
            "left out. Judah's kings are judged by whether they sought the LORD: Asa, Jehoshaphat, "
            "Hezekiah and Josiah lead revivals, and even wicked Manasseh repents in exile. The book "
            "ends with Jerusalem's fall and the decree of Cyrus."),
        "themes": ["Seeking God", "Revival", "Humility and prayer", "Temple worship"],
        "outline": [
            {"chapters": "1-9", "title": "Solomon and the Temple"},
            {"chapters": "10-28", "title": "Judah's kings, Rehoboam to Ahaz"},
            {"chapters": "29-36", "title": "Hezekiah, Josiah, the exile and Cyrus"},
        ],
        "key_verses": ["2 Chronicles 7:14", "2 Chronicles 16:9", "2 Chronicles 20:15", "2 Chronicles 36:23"],
        "key_people": ["Solomon", "Asa", "Jehoshaphat", "Hezekiah", "Manasseh", "Josiah", "Cyrus"],
        "christ": "The Temple where God put his name points to Christ, in whom 'dwelleth all the fulness of the Godhead bodily' (Colossians 2:9).",
        "peoples": ["israelites", "egyptians", "cushites", "assyrians", "babylonians", "persians", "ammonites", "moabites", "edomites", "philistines"],
    },
    {
        "name": "Ezra",
        "group": "history",
        "name_meaning": "Named after Ezra the priest and scribe; Ezra means 'help'.",
        "summary": "The exiles return from Babylon under Cyrus, rebuild the Temple, and are renewed in God's Law under Ezra.",
        "author": "Ezra (traditional)",
        "author_note": "Jewish tradition names Ezra as author; chapters 7–9 are written in the first person. Ezra and Nehemiah were one book in the Hebrew Bible. Parts (4:8–6:18; 7:12-26) are in Aramaic, the official language of the Persian empire, and quote royal letters.",
        "date": "c. 440 BC",
        "audience": "The returned community in Judah",
        "setting": "538–c. 457 BC; Babylon and Jerusalem under Persian rule",
        "origin": (
            "Ezra draws on official documents — Cyrus' decree, lists of returning families, letters "
            "to and from Persian kings — to show God keeping his word through Jeremiah that the "
            "exile would end."),
        "description": (
            "Cyrus lets the Jews go home, and about 50,000 return under Zerubbabel. They rebuild "
            "the altar and lay the Temple's foundation, but local opposition stops the work for "
            "years. Encouraged by the prophets Haggai and Zechariah, they finish the Temple in 516 "
            "BC. Decades later Ezra, 'a ready scribe in the law of Moses', arrives from Babylon and "
            "leads the people to repent of marrying into pagan peoples."),
        "themes": ["Return and restoration", "God moves kings", "The Word of God", "Holiness"],
        "outline": [
            {"chapters": "1-6", "title": "The return and the Temple rebuilt"},
            {"chapters": "7-10", "title": "Ezra's return and reforms"},
        ],
        "key_verses": ["Ezra 1:3", "Ezra 3:11", "Ezra 7:10"],
        "key_people": ["Cyrus", "Zerubbabel", "Jeshua", "Haggai and Zechariah", "Ezra", "Artaxerxes"],
        "christ": "God preserves his people and the line of David (Zerubbabel appears in Jesus' genealogy, Matthew 1:12) for the coming of Christ.",
        "peoples": ["persians", "israelites", "samaritans", "babylonians"],
    },
    {
        "name": "Nehemiah",
        "group": "history",
        "name_meaning": "Named after Nehemiah, the Persian king's cupbearer; Nehemiah means 'the LORD comforts'.",
        "summary": "Nehemiah leaves the Persian court to rebuild Jerusalem's walls in 52 days, and leads the people back to God's Law.",
        "author": "Nehemiah (his memoirs), with Ezra",
        "author_note": "Much of the book is Nehemiah's own first-person memoir ('the words of Nehemiah', 1:1). It was one book with Ezra in the Hebrew Bible.",
        "date": "c. 430 BC",
        "audience": "The returned community in Judah",
        "setting": "445–c. 432 BC; Susa and Jerusalem",
        "origin": (
            "Nehemiah's memoir, full of short prayers ('Remember me, O my God'), is combined with "
            "lists and records of the community's covenant renewal. Outside records, the "
            "Elephantine papyri, name his opponent Sanballat as governor of Samaria."),
        "description": (
            "Hearing that Jerusalem's walls lie in ruins, Nehemiah weeps, prays and asks King "
            "Artaxerxes for leave to rebuild them. Despite mockery and threats from Sanballat, "
            "Tobiah and Geshem, the people build with a tool in one hand and a weapon in the other, "
            "and finish in 52 days. Ezra reads the Law to the people, who weep, then celebrate: "
            "'the joy of the LORD is your strength.' They confess their sins and sign a covenant, "
            "and Nehemiah later returns to correct abuses."),
        "themes": ["Prayer and action", "Leadership", "Opposition overcome", "Revival through the Word"],
        "outline": [
            {"chapters": "1-7", "title": "Rebuilding the walls"},
            {"chapters": "8-10", "title": "The Law read and the covenant renewed"},
            {"chapters": "11-13", "title": "Resettling Jerusalem; final reforms"},
        ],
        "key_verses": ["Nehemiah 1:11", "Nehemiah 6:15", "Nehemiah 8:10"],
        "key_people": ["Nehemiah", "Artaxerxes", "Ezra", "Sanballat", "Tobiah", "Geshem"],
        "christ": "Nehemiah leaves a royal palace to restore a ruined city and its people — a picture of the one who 'became poor' to restore us (2 Corinthians 8:9).",
        "peoples": ["persians", "israelites", "samaritans", "ammonites", "ishmaelites", "moabites"],
    },
    {
        "name": "Esther",
        "group": "history",
        "name_meaning": "Named after Queen Esther; her Persian name probably means 'star'. Her Hebrew name was Hadassah, 'myrtle'.",
        "summary": "A Jewish orphan becomes queen of Persia and risks her life to save her people from Haman's plot — the origin of Purim.",
        "author": "Unknown",
        "author_note": "The author is not named; suggestions include Mordecai (9:20 says he 'wrote these things') or a later Persian-era Jew. The book never mentions God by name, yet his providence runs through every turn of the story.",
        "date": "c. 460–350 BC",
        "audience": "Jews of the Persian empire",
        "setting": "Shushan (Susa), 483–473 BC, in the reign of Ahasuerus (Xerxes I)",
        "origin": (
            "Esther explains the origin of the feast of Purim ('lots'), still read aloud each year "
            "in synagogues. Its details of the Persian court match what is known from Greek "
            "historians and the palace excavated at Susa."),
        "description": (
            "King Ahasuerus deposes Queen Vashti and chooses Esther, who hides that she is Jewish. "
            "Her cousin Mordecai refuses to bow to Haman, the king's favourite, so Haman plots to "
            "destroy all the Jews. Mordecai urges Esther: 'who knoweth whether thou art come to the "
            "kingdom for such a time as this?' She fasts and goes to the king uninvited, saying "
            "'if I perish, I perish.' Haman is hanged on his own gallows, and the Jews are allowed "
            "to defend themselves."),
        "themes": ["Hidden providence", "Courage", "Reversal", "Deliverance"],
        "outline": [
            {"chapters": "1-2", "title": "Esther becomes queen"},
            {"chapters": "3-5", "title": "Haman's plot and Esther's courage"},
            {"chapters": "6-7", "title": "Haman's downfall"},
            {"chapters": "8-10", "title": "Deliverance and the feast of Purim"},
        ],
        "key_verses": ["Esther 4:14", "Esther 4:16"],
        "key_people": ["Esther", "Mordecai", "Ahasuerus", "Haman", "Vashti"],
        "christ": "Esther risks death to intercede for her condemned people before the king — a shadow of Christ, who 'ever liveth to make intercession' (Hebrews 7:25).",
        "peoples": ["persians", "medes", "amalekites", "israelites"],
    },
]
