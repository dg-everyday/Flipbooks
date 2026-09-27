"""Bible characters: the judges, the kingdom, the divided kingdom, and exile and return.

Same fields as beginnings.py.
"""

KINGDOMS = [
    # ------------------------------------------------------------------ the judges
    {
        "name": "Deborah",
        "epithet": "The judge under the palm tree",
        "group": "The judges",
        "testament": "Old",
        "role": "Prophetess and judge",
        "era": "The time of the judges",
        "hero": "deborah",
        "family": [{"relation": "Commander at her side", "name": "Barak"}],
        "summary": "A prophetess who judged Israel, summoned Barak to battle against Sisera's chariots, and sang of the victory.",
        "story": (
            "Deborah judged Israel under a palm tree in the hill country of Ephraim, and the people came up "
            "to her for judgement. For twenty years Jabin king of Canaan had oppressed Israel with nine "
            "hundred chariots of iron. Deborah called Barak and gave him God's command to fight. He would "
            "not go unless she went with him, and she told him the honour would go to a woman. The LORD "
            "routed Sisera's army by the river Kishon, and Sisera died in Jael's tent. Deborah and Barak "
            "sang a song of victory."),
        "importance": (
            "Deborah is the only judge also called a prophetess, and the only one in the book shown "
            "hearing the people's cases. Under her, 'the land had rest forty years' (Judges 5:31)."),
        "known_for": ["The palm tree of Deborah", "Victory over Sisera", "The song of Deborah"],
        "told_in": ["Judges 4-5"],
        "key_verses": ["Judges 4:4-5", "Judges 5:31"],
    },
    {
        "name": "Gideon",
        "epithet": "The least in his father's house",
        "group": "The judges",
        "testament": "Old",
        "role": "Judge",
        "era": "The time of the judges",
        "hero": "gideon",
        "summary": "A frightened farmer greeted as a 'mighty man of valour', who with three hundred men routed the armies of Midian.",
        "story": (
            "Midian raided Israel every harvest, and Gideon was threshing wheat in a winepress to hide it "
            "when the angel of the LORD greeted him: 'The LORD is with thee, thou mighty man of valour.' "
            "Gideon protested that his family was poor and he was the least in his father's house. He tore "
            "down his father's altar to Baal by night, and asked for signs with a fleece. God cut his army "
            "down, 'lest Israel vaunt themselves against me': twenty-two thousand went home, and of the ten "
            "thousand left only three hundred were kept. With trumpets, jars and lamps they routed the "
            "Midianite camp. Afterwards Gideon refused to be king, but made a golden ephod that became a "
            "snare to Israel."),
        "importance": (
            "Gideon's story is about God's strength in human weakness: the victory had to be too great for "
            "Israel to claim. Hebrews lists him among the heroes of faith (Hebrews 11:32), though his story "
            "ends in compromise."),
        "known_for": ["The fleece", "Three hundred men", "Trumpets, jars and lamps"],
        "told_in": ["Judges 6-8"],
        "also_in": ["Isaiah 9:4", "Hebrews 11:32"],
        "key_verses": ["Judges 6:12", "Judges 7:2"],
    },
    {
        "name": "Samson",
        "epithet": "The strong man who fell",
        "group": "The judges",
        "testament": "Old",
        "role": "Judge and Nazarite",
        "era": "The time of the judges",
        "family": [{"relation": "Betrayed by", "id": "delilah"}],
        "summary": "A Nazarite from birth, given great strength, who fought the Philistines alone, was betrayed by Delilah, and died bringing down the temple of Dagon.",
        "story": (
            "An angel told Manoah's wife she would bear a son who would be a Nazarite from the womb, and "
            "'he shall begin to deliver Israel out of the hand of the Philistines.' Samson tore a lion apart "
            "with his bare hands, killed a thousand Philistines with the jawbone of an ass, and carried off "
            "the gates of Gaza. But he was ruled by what he saw and wanted. Delilah wore him down until he "
            "told her the secret of his strength; his hair was shaved, and the Philistines blinded him and "
            "set him to grind in the prison. At a feast to their god Dagon he prayed for strength once more "
            "and pulled down the pillars of the house."),
        "importance": (
            "Samson shows great gifts wasted by a lack of self-control, and God using even a flawed man. "
            "Hebrews still counts him among those who 'out of weakness were made strong' (Hebrews "
            "11:32-34)."),
        "known_for": ["Great strength", "His uncut hair", "The pillars of Dagon's house"],
        "told_in": ["Judges 13-16"],
        "also_in": ["Hebrews 11:32"],
        "key_verses": ["Judges 16:28"],
    },
    {
        "name": "Delilah",
        "epithet": "The woman who sold Samson's secret",
        "group": "The judges",
        "testament": "Old",
        "role": "A woman of the valley of Sorek",
        "era": "The time of the judges",
        "hero": "delilah",
        "family": [{"relation": "Betrayed", "id": "samson"}],
        "summary": "The woman Samson loved, who was paid by the Philistine lords to find out the secret of his strength.",
        "story": (
            "Samson loved a woman in the valley of Sorek, whose name was Delilah. The lords of the "
            "Philistines each offered her eleven hundred pieces of silver to find out what made him so "
            "strong. Three times she asked and he lied; three times the Philistines came and he broke "
            "free. She pressed him day after day until 'his soul was vexed unto death', and he told her the "
            "truth. While he slept on her knees she had his hair shaved, and called, 'The Philistines be "
            "upon thee, Samson.'"),
        "importance": (
            "Delilah's story is one of love used as a weapon and loyalty sold for money. The Bible never "
            "says whether she loved Samson, only that he loved her (Judges 16:4)."),
        "known_for": ["Eleven hundred pieces of silver", "The secret of the hair"],
        "told_in": ["Judges 16:4-22"],
        "key_verses": ["Judges 16:4-5"],
    },
    {
        "name": "Ruth",
        "epithet": "The loyal Moabite",
        "group": "The judges",
        "testament": "Old",
        "role": "A Moabite widow",
        "era": "The time of the judges",
        "hero": "ruth",
        "family": [{"relation": "Mother-in-law", "id": "naomi"}, {"relation": "Husband", "id": "boaz"},
                   {"relation": "Great-grandson", "id": "david"}],
        "summary": "A Moabite widow who left her homeland to stay with her mother-in-law, gleaned in the fields of Boaz, and became the great-grandmother of King David.",
        "story": (
            "Ruth married one of Naomi's sons in Moab. When all three men of the family died and Naomi set "
            "out for home, Ruth would not leave her: 'whither thou goest, I will go … thy people shall be my "
            "people, and thy God my God.' In Bethlehem she gleaned barley behind the reapers and came, as it "
            "happened, to the field of Boaz, a relative, who protected and provided for her. At Naomi's "
            "urging she asked Boaz to act as her kinsman-redeemer, and he married her. Their son Obed was "
            "the grandfather of David."),
        "importance": (
            "Ruth is a foreigner welcomed into Israel through faithfulness and kindness, and one of the few "
            "women named in Matthew's family tree of Jesus (Matthew 1:5). Her story shows God's care in "
            "ordinary days of grief, work and loyalty."),
        "known_for": ["“Whither thou goest, I will go”", "Gleaning in the fields", "Ancestor of David"],
        "told_in": ["Ruth 1-4"],
        "also_in": ["Matthew 1:5"],
        "key_verses": ["Ruth 1:16"],
    },
    {
        "name": "Naomi",
        "epithet": "Call me Mara",
        "group": "The judges",
        "testament": "Old",
        "role": "A widow of Bethlehem",
        "era": "The time of the judges",
        "family": [{"relation": "Daughter-in-law", "id": "ruth"}, {"relation": "Kinsman", "id": "boaz"}],
        "summary": "A widow of Bethlehem who lost her husband and both sons in Moab, came home bitter, and lived to hold her grandson.",
        "story": (
            "Naomi went to Moab in a famine with her husband Elimelech and their two sons. Within ten years "
            "all three men had died. She set out for home and urged her daughters-in-law to stay; Orpah "
            "stayed, and Ruth came. In Bethlehem she said, 'Call me not Naomi, call me Mara: for the Almighty "
            "hath dealt very bitterly with me.' When Ruth came home from the field of Boaz, Naomi saw God's "
            "kindness again and guided Ruth to him. When Obed was born, the women said, 'There is a son born "
            "to Naomi.'"),
        "importance": (
            "Naomi's honesty in grief is part of Scripture. The women's blessing names what God did for "
            "her: he would be 'a restorer of thy life' (Ruth 4:15)."),
        "known_for": ["“Call me Mara”", "Guiding Ruth to Boaz"],
        "told_in": ["Ruth 1-4"],
        "key_verses": ["Ruth 1:20", "Ruth 4:14"],
    },
    {
        "name": "Boaz",
        "epithet": "The kinsman-redeemer",
        "group": "The judges",
        "testament": "Old",
        "role": "A landowner of Bethlehem",
        "era": "The time of the judges",
        "family": [{"relation": "Mother", "id": "rahab"}, {"relation": "Wife", "id": "ruth"},
                   {"relation": "Great-grandson", "id": "david"}],
        "summary": "A wealthy landowner of Bethlehem who showed kindness to Ruth, redeemed Elimelech's land, married her, and became David's great-grandfather.",
        "story": (
            "Boaz greeted his reapers with 'The LORD be with you.' Seeing Ruth gleaning, he told her to stay "
            "in his fields, drink from his water jars and eat with his reapers, and told his men to let "
            "handfuls fall for her on purpose. When Ruth asked him to act as her near kinsman, he praised "
            "her kindness and went to the city gate. A nearer kinsman gave up his right, and Boaz bought the "
            "land and took Ruth as his wife."),
        "importance": (
            "Boaz shows the law of the kinsman-redeemer at its best: a relative who pays the cost to rescue "
            "a family. Christians have long seen in him a picture of Christ the Redeemer, and Matthew names "
            "him in Jesus' line (Matthew 1:5)."),
        "known_for": ["Kindness to Ruth", "The kinsman-redeemer"],
        "told_in": ["Ruth 2-4"],
        "also_in": ["Matthew 1:5"],
        "key_verses": ["Ruth 2:12"],
    },
    {
        "name": "Eli",
        "epithet": "The priest who could not restrain his sons",
        "group": "The judges",
        "testament": "Old",
        "role": "Priest at Shiloh and judge",
        "era": "The end of the judges",
        "family": [{"relation": "Raised", "id": "samuel"}],
        "summary": "The priest at Shiloh who blessed Hannah, raised the boy Samuel, and died on the day the ark was captured.",
        "story": (
            "Eli judged Israel forty years and served as priest at Shiloh. Seeing Hannah praying silently, "
            "he thought she was drunk, then blessed her. He raised her son Samuel in the house of the LORD, "
            "and when the boy heard a voice in the night, it was Eli who understood: 'Go, lie down: and it "
            "shall be, if he call thee, that thou shalt say, Speak, LORD; for thy servant heareth.' But his "
            "sons Hophni and Phinehas robbed the offerings, and Eli rebuked them without stopping them. When "
            "news came that the ark was taken and his sons were dead, he fell backward from his seat and "
            "died."),
        "importance": (
            "Eli was a man of faith who failed his own family: 'his sons made themselves vile, and he "
            "restrained them not' (1 Samuel 3:13). Yet he taught the boy who became Israel's great prophet "
            "how to listen to God."),
        "known_for": ["Raising Samuel", "“Speak, LORD; for thy servant heareth”"],
        "told_in": ["1 Samuel 1-4"],
        "key_verses": ["1 Samuel 3:9", "1 Samuel 3:13"],
    },
    {
        "name": "Hannah",
        "epithet": "The mother who prayed",
        "group": "The judges",
        "testament": "Old",
        "role": "Mother of Samuel",
        "era": "The end of the judges",
        "hero": "hannah",
        "family": [{"relation": "Son", "id": "samuel"}, {"relation": "Husband", "name": "Elkanah"}],
        "summary": "A childless woman who poured out her heart to God at Shiloh, vowed her son to the LORD, and gave Samuel to serve him.",
        "story": (
            "Hannah was loved by her husband Elkanah but had no child, and his other wife provoked her year "
            "after year. At Shiloh she wept and prayed silently, vowing that if God gave her a son she would "
            "give him to the LORD all his life. Eli thought she was drunk; when she explained, he blessed "
            "her. She bore Samuel, and when he was weaned she brought him to Eli: 'For this child I prayed.' "
            "Then she sang of the God who lifts up the poor."),
        "importance": (
            "Hannah's prayer is a model of honest faith, and her song speaks of the LORD's king, his "
            "anointed, before Israel had any king (1 Samuel 2:10). Mary's song echoes hers (Luke 1:46-55)."),
        "known_for": ["Praying at Shiloh", "Giving Samuel to God", "Hannah's song"],
        "told_in": ["1 Samuel 1:1-2:21"],
        "also_in": ["Luke 1:46-55"],
        "key_verses": ["1 Samuel 1:27"],
    },
    {
        "name": "Samuel",
        "epithet": "The prophet who anointed kings",
        "group": "The judges",
        "testament": "Old",
        "role": "Prophet and the last judge",
        "era": "The end of the judges",
        "hero": "samuel",
        "family": [{"relation": "Mother", "id": "hannah"}, {"relation": "Raised by", "id": "eli"},
                   {"relation": "Anointed", "id": "saul"}, {"relation": "Anointed", "id": "david"}],
        "summary": "The boy given to God at Shiloh who became Israel's last judge and a great prophet, and who anointed its first two kings.",
        "story": (
            "As a boy serving under Eli, Samuel heard God call his name in the night and answered, 'Speak; "
            "for thy servant heareth.' He grew up, 'and the LORD was with him, and did let none of his words "
            "fall to the ground.' He judged Israel all his life. When the people demanded a king, he warned "
            "them what a king would take from them, then anointed Saul at God's command. When Saul "
            "disobeyed, Samuel told him, 'to obey is better than sacrifice', and anointed the shepherd boy "
            "David."),
        "importance": (
            "Samuel stands between the judges and the kings. Jeremiah names him with Moses as a great man "
            "of prayer (Jeremiah 15:1), and Peter counts him first among the prophets who foretold Christ's "
            "days (Acts 3:24)."),
        "known_for": ["God's call in the night", "Anointing Saul and David"],
        "told_in": ["1 Samuel 1-16"],
        "also_in": ["Jeremiah 15:1", "Acts 3:24", "Hebrews 11:32"],
        "key_verses": ["1 Samuel 3:10", "1 Samuel 15:22"],
    },
    # ------------------------------------------------------------------ the kingdom
    {
        "name": "Saul",
        "epithet": "The first king of Israel",
        "group": "The kingdom",
        "testament": "Old",
        "role": "King of Israel",
        "era": "The united kingdom",
        "hero": "saul",
        "family": [{"relation": "Son", "id": "jonathan"}, {"relation": "Anointed by", "id": "samuel"},
                   {"relation": "Son-in-law", "id": "david"}],
        "summary": "A tall young man chosen as Israel's first king, who began humbly, disobeyed God, grew jealous of David, and died on Mount Gilboa.",
        "story": (
            "Saul, a Benjamite 'higher than any of the people' from the shoulders up, went looking for lost "
            "donkeys and was anointed king by Samuel. At his proclamation he hid among the baggage. He won "
            "victories, but he offered a sacrifice he had no right to offer and spared what God told him to "
            "destroy, and God rejected him as king. An evil spirit troubled him, and young David's harp "
            "soothed him, until the women's song about David's ten thousands made Saul his enemy. He hunted "
            "David for years. In the end, with no answer from God, he consulted a medium at Endor, and the "
            "next day he died in battle with his sons."),
        "importance": (
            "Saul's life is a warning about a good start that ends badly: partial obedience, fear of "
            "people, and jealousy. David's lament for him still sets the tone of grief: 'How are the mighty "
            "fallen!' (2 Samuel 1:19)."),
        "known_for": ["Israel's first king", "Jealousy of David", "The medium at Endor"],
        "told_in": ["1 Samuel 9-31"],
        "also_in": ["2 Samuel 1:17-27", "Acts 13:21"],
        "key_verses": ["1 Samuel 15:23", "2 Samuel 1:19"],
    },
    {
        "name": "Jonathan",
        "epithet": "The friend who loved David",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Prince of Israel",
        "era": "The united kingdom",
        "hero": "jonathan",
        "family": [{"relation": "Father", "id": "saul"}, {"relation": "Friend", "id": "david"}],
        "summary": "King Saul's son and heir, a brave warrior, who loved David as his own soul and protected him from his father.",
        "story": (
            "Jonathan and his armourbearer climbed alone to a Philistine outpost, trusting that 'there is no "
            "restraint to the LORD to save by many or by few', and won a great victory. When David killed "
            "Goliath, 'the soul of Jonathan was knit with the soul of David', and he gave David his robe, his "
            "sword and his bow. Though he was heir to the throne, he warned David of Saul's plans and made a "
            "covenant with him. He died with his father on Mount Gilboa."),
        "importance": (
            "Jonathan gave up his own claim to the throne because he saw God's choice in his friend. Their "
            "friendship is the Bible's great picture of loyal, selfless love, and David kept his promise by "
            "caring for Jonathan's son Mephibosheth (2 Samuel 9:1-7)."),
        "known_for": ["Friendship with David", "The covenant", "Courage at the outpost"],
        "told_in": ["1 Samuel 14:1-23", "1 Samuel 18:1-4", "1 Samuel 20:1-42", "1 Samuel 23:16-18"],
        "also_in": ["2 Samuel 1:25-26", "2 Samuel 9:1-7"],
        "key_verses": ["1 Samuel 18:1", "1 Samuel 23:16"],
    },
    {
        "name": "David",
        "epithet": "The shepherd king",
        "group": "The kingdom",
        "testament": "Old",
        "role": "King of Israel",
        "era": "The united kingdom",
        "hero": "david",
        "family": [{"relation": "Anointed by", "id": "samuel"}, {"relation": "Friend", "id": "jonathan"},
                   {"relation": "Wife", "id": "bathsheba"}, {"relation": "Son", "id": "absalom"},
                   {"relation": "Son", "id": "solomon"}, {"relation": "Descendant", "id": "jesus"}],
        "summary": "The shepherd boy who killed Goliath, became Israel's greatest king, wrote many of the psalms, fell into grave sin, repented, and received God's promise of an everlasting throne.",
        "story": (
            "Samuel anointed David, the youngest son of Jesse, while he was still keeping sheep. He killed "
            "the giant Goliath with a sling and a stone, served in Saul's court, and fled for years from "
            "Saul's jealousy, twice refusing to kill him. As king he took Jerusalem and brought the ark "
            "there, and God promised him through Nathan that his throne would be established for ever. He "
            "took Bathsheba and arranged her husband's death; when Nathan confronted him, he confessed, 'I "
            "have sinned against the LORD.' His later years were darkened by the rebellion of his son "
            "Absalom."),
        "importance": (
            "David is called 'a man after his own heart' (1 Samuel 13:14): not sinless, but a man who turned "
            "back to God. The psalms that carry his name have shaped prayer for three thousand years, and "
            "the promised Messiah is 'the son of David' (Matthew 1:1)."),
        "known_for": ["Goliath", "The psalms", "The promise of an everlasting throne"],
        "told_in": ["1 Samuel 16-31", "2 Samuel 1-24", "1 Kings 1:1-2:11"],
        "also_in": ["Psalms 23:1-6", "Acts 13:22", "Matthew 1:1"],
        "key_verses": ["1 Samuel 16:7", "2 Samuel 7:16"],
    },
    {
        "name": "Goliath",
        "epithet": "The giant of Gath",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Philistine champion",
        "era": "The united kingdom",
        "hero": "goliath",
        "summary": "The Philistine champion who defied the armies of Israel for forty days and was killed by the young David with a sling and a stone.",
        "story": (
            "Goliath of Gath stood six cubits and a span, armoured in bronze, with a spear like a weaver's "
            "beam. Morning and evening for forty days he came out and challenged Israel to send a man to "
            "fight him, and Saul's army was dismayed and greatly afraid. David, bringing food to his "
            "brothers, asked, 'who is this uncircumcised Philistine, that he should defy the armies of the "
            "living God?' He went out with his staff, his sling and five smooth stones, telling the giant "
            "that the battle belonged to the LORD. His first stone sank into Goliath's forehead."),
        "importance": (
            "Goliath has become a name for any overwhelming enemy. The story's point is David's: 'the LORD "
            "saveth not with sword and spear' (1 Samuel 17:47)."),
        "known_for": ["Forty days of taunts", "Felled by a stone"],
        "told_in": ["1 Samuel 17:1-54"],
        "key_verses": ["1 Samuel 17:45"],
    },
    {
        "name": "Bathsheba",
        "epithet": "The mother of Solomon",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Queen mother",
        "era": "The united kingdom",
        "family": [{"relation": "Husband", "id": "david"}, {"relation": "First husband", "name": "Uriah the Hittite"},
                   {"relation": "Son", "id": "solomon"}],
        "summary": "The wife of Uriah, whom King David took and whose husband he had killed; she became the mother of Solomon and secured the throne for him.",
        "story": (
            "From his roof David saw Bathsheba bathing and sent for her, and she conceived. When his "
            "attempts to cover it up failed, David had her husband Uriah the Hittite, one of his mighty "
            "men, put where the fighting was fiercest, and he was killed. The prophet Nathan confronted the "
            "king, and the child died. Bathsheba bore a second son, Solomon. Years later, when Adonijah tried "
            "to seize the throne, Nathan and Bathsheba went to the dying David and made sure Solomon was "
            "crowned."),
        "importance": (
            "The Bible tells David's sin against her plainly and lays the blame on him: 'the thing that "
            "David had done displeased the LORD' (2 Samuel 11:27). Matthew names her in Jesus' family tree "
            "as 'her that had been the wife of Urias' (Matthew 1:6)."),
        "known_for": ["David's sin", "Mother of Solomon"],
        "told_in": ["2 Samuel 11-12", "1 Kings 1:11-31"],
        "also_in": ["Matthew 1:6"],
        "key_verses": ["2 Samuel 11:27"],
    },
    {
        "name": "Nathan",
        "epithet": "The prophet who said, Thou art the man",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The united kingdom",
        "family": [{"relation": "Spoke to", "id": "david"}],
        "summary": "The prophet who brought God's promise of an everlasting house to David, and then confronted him over Bathsheba with a story about a stolen lamb.",
        "story": (
            "When David wanted to build God a temple, Nathan brought God's answer: David would not build God "
            "a house, but God would build David a house, and his throne would be established for ever. "
            "After David took Bathsheba and had Uriah killed, Nathan told him of a rich man who took a poor "
            "man's only ewe lamb. David burned with anger, and Nathan said, 'Thou art the man.' Later Nathan "
            "made sure that Solomon, not Adonijah, became king."),
        "importance": (
            "Nathan shows the courage to speak truth to power, and the wisdom to tell it in a way that could "
            "be heard. The promise he carried to David, of a son whose kingdom would last for ever, runs "
            "through the rest of the Bible to Jesus (Luke 1:32-33)."),
        "known_for": ["The promise to David", "The parable of the ewe lamb"],
        "told_in": ["2 Samuel 7:1-17", "2 Samuel 12:1-15", "1 Kings 1:11-45"],
        "also_in": ["Luke 1:32-33"],
        "key_verses": ["2 Samuel 12:7"],
    },
    {
        "name": "Absalom",
        "epithet": "The son who rebelled",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Prince of Israel",
        "era": "The united kingdom",
        "hero": "absalom",
        "family": [{"relation": "Father", "id": "david"}],
        "summary": "David's handsome son, who killed his brother Amnon, stole the hearts of Israel, rebelled against his father, and died caught in an oak.",
        "story": (
            "Absalom was praised above all Israel for his good looks. When his half-brother Amnon violated "
            "his sister Tamar, Absalom waited two years and then had him killed. After exile and a cold "
            "homecoming, he sat by the city gate and 'stole the hearts of the men of Israel.' He had himself "
            "proclaimed king in Hebron, and David fled Jerusalem. In the battle in the forest of Ephraim, "
            "Absalom's head caught in an oak and Joab killed him. David wept, 'O my son Absalom, my son, my "
            "son Absalom! would God I had died for thee.'"),
        "importance": (
            "Absalom's rebellion was part of the trouble Nathan foretold for David's house (2 Samuel "
            "12:10). His father's grief over him is one of the most painful cries in Scripture: a king who "
            "loved even the son who tried to kill him."),
        "known_for": ["Stealing the hearts of Israel", "Rebellion against David"],
        "told_in": ["2 Samuel 13-18"],
        "key_verses": ["2 Samuel 18:33"],
    },
    {
        "name": "Joab",
        "epithet": "David's ruthless general",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Commander of David's army",
        "era": "The united kingdom",
        "family": [{"relation": "Uncle", "id": "david"}],
        "summary": "The commander of David's army, fiercely loyal and brutally ruthless, who won David's wars and killed his rivals.",
        "story": (
            "Joab was the son of David's sister Zeruiah. He led the capture of Jerusalem and commanded "
            "David's army for decades. He killed Abner and later Amasa, both rivals, with a greeting and a "
            "sudden blade. He carried out David's order to put Uriah in the front line. Against the king's "
            "wishes he killed Absalom, then told the grieving David to go out and thank his men. At the end "
            "he backed Adonijah for the throne, and Solomon had him put to death at the altar."),
        "importance": (
            "Joab shows how loyalty without righteousness goes wrong. David said of him and his brother, "
            "'these men the sons of Zeruiah be too hard for me' (2 Samuel 3:39)."),
        "known_for": ["David's general", "Killing Abner and Absalom"],
        "told_in": ["2 Samuel 3:22-39", "2 Samuel 11:14-25", "2 Samuel 18:1-19:8", "1 Kings 2:28-34"],
        "key_verses": ["2 Samuel 3:39"],
    },
    {
        "name": "Solomon",
        "epithet": "The wise king who built the temple",
        "group": "The kingdom",
        "testament": "Old",
        "role": "King of Israel",
        "era": "The united kingdom",
        "family": [{"relation": "Father", "id": "david"}, {"relation": "Mother", "id": "bathsheba"},
                   {"relation": "Son", "id": "rehoboam"}],
        "summary": "David's son and successor, who asked God for wisdom, built the temple in Jerusalem, and brought Israel to its height, but turned to other gods in old age.",
        "story": (
            "When God appeared to him in a dream and said, 'Ask what I shall give thee', Solomon asked for "
            "'an understanding heart' to judge the people, and God gave him wisdom and riches too. He judged "
            "between two women who both claimed one baby. He built the temple and prayed at its dedication "
            "that 'the heaven and heaven of heavens cannot contain thee.' The queen of Sheba came to test "
            "him and was overwhelmed. But he married many foreign wives, and 'his wives turned away his "
            "heart after other gods'; after his death the kingdom split."),
        "importance": (
            "Solomon's wisdom lives on in Proverbs, Ecclesiastes and the Song of Songs, all linked with his "
            "name. His life is also a warning that great wisdom does not guarantee faithfulness. Jesus said, "
            "'a greater than Solomon is here' (Matthew 12:42)."),
        "known_for": ["Asking for wisdom", "Building the temple", "The two mothers"],
        "told_in": ["1 Kings 1-11"],
        "also_in": ["2 Chronicles 1-9", "Matthew 6:29", "Matthew 12:42"],
        "key_verses": ["1 Kings 3:9", "1 Kings 4:29"],
    },
    {
        "id": "queen-of-sheba",
        "name": "The queen of Sheba",
        "epithet": "She came to test Solomon",
        "group": "The kingdom",
        "testament": "Old",
        "role": "Queen of Sheba",
        "era": "The united kingdom",
        "family": [{"relation": "Visited", "id": "solomon"}],
        "summary": "A queen from the south who came to test Solomon with hard questions, saw his wisdom, and praised his God.",
        "story": (
            "Hearing of Solomon's fame, the queen of Sheba came to Jerusalem with a great train of camels "
            "bearing spices, gold and precious stones, to prove him with hard questions. Solomon answered "
            "every one. When she had seen his wisdom and his house, 'there was no more spirit in her.' She "
            "said, 'the half was not told me', blessed the LORD his God, and gave the king gifts before she "
            "went home."),
        "importance": (
            "Jesus held her up against his own generation: she came 'from the uttermost parts of the earth "
            "to hear the wisdom of Solomon', while they would not listen to one greater (Matthew 12:42)."),
        "known_for": ["Hard questions", "“The half was not told me”"],
        "told_in": ["1 Kings 10:1-13"],
        "also_in": ["2 Chronicles 9:1-12", "Matthew 12:42"],
        "key_verses": ["1 Kings 10:7"],
    },
    # ------------------------------------------------------------------ the divided kingdom
    {
        "name": "Rehoboam",
        "epithet": "The king who split the kingdom",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Judah",
        "era": "The divided kingdom",
        "family": [{"relation": "Father", "id": "solomon"}],
        "summary": "Solomon's son, who answered the northern tribes' plea for lighter burdens with harsh words and lost ten of the twelve tribes.",
        "story": (
            "At Shechem the people asked Rehoboam to lighten the heavy yoke his father had laid on them. The "
            "old men who had served Solomon advised him to speak kindly; the young men he had grown up with "
            "told him to say that his little finger would be thicker than his father's waist. He took the "
            "young men's advice. The northern tribes cried, 'to your tents, O Israel', and made Jeroboam "
            "their king. Rehoboam was left with Judah and Benjamin."),
        "importance": (
            "Rehoboam's pride divided God's people for the rest of the Old Testament: from here on there "
            "are two kingdoms, Israel in the north and Judah in the south. His story is a warning about "
            "listening to flatterers."),
        "known_for": ["Harsh words at Shechem", "The kingdom torn in two"],
        "told_in": ["1 Kings 12:1-24", "1 Kings 14:21-31"],
        "also_in": ["2 Chronicles 10-12"],
        "key_verses": ["1 Kings 12:16"],
    },
    {
        "name": "Jeroboam",
        "epithet": "Who made Israel to sin",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Israel",
        "era": "The divided kingdom",
        "summary": "The first king of the northern kingdom of Israel, who set up golden calves at Bethel and Dan so that his people would not worship in Jerusalem.",
        "story": (
            "Jeroboam was an able officer of Solomon's. The prophet Ahijah tore a new garment into twelve "
            "pieces and gave him ten, promising him ten tribes. When the kingdom split he became king of "
            "Israel. Afraid that if his people went up to Jerusalem to worship they would turn back to "
            "Rehoboam, he made two calves of gold and said, 'behold thy gods, O Israel, which brought thee "
            "up out of the land of Egypt.' A man of God cried out against his altar at Bethel, and the hand "
            "Jeroboam stretched out against him dried up."),
        "importance": (
            "Jeroboam's golden calves became the pattern of the north's idolatry. Again and again the book "
            "of Kings judges later kings by one line: Jeroboam 'made Israel to sin' (1 Kings 14:16)."),
        "known_for": ["Ten torn pieces", "The golden calves"],
        "told_in": ["1 Kings 11:26-40", "1 Kings 12:20-14:20"],
        "key_verses": ["1 Kings 12:28"],
    },
    {
        "name": "Ahab",
        "epithet": "The king who served Baal",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Israel",
        "era": "The divided kingdom",
        "hero": "ahab",
        "family": [{"relation": "Wife", "id": "jezebel"}, {"relation": "Opposed by", "id": "elijah"}],
        "summary": "A powerful king of Israel who married Jezebel, brought the worship of Baal into Israel, and was confronted again and again by Elijah.",
        "story": (
            "Ahab 'did more to provoke the LORD God of Israel to anger than all the kings of Israel that "
            "were before him.' He married Jezebel of Sidon and built a temple to Baal in Samaria. Elijah "
            "announced a drought, and after three years Ahab met him with, 'Art thou he that troubleth "
            "Israel?' He watched fire fall on Mount Carmel. Later he sulked when Naboth would not sell his "
            "vineyard, and Jezebel had Naboth killed. He humbled himself when Elijah pronounced judgement, "
            "but later died in battle, as the prophet Micaiah had warned."),
        "importance": (
            "Ahab shows how far a king could lead a nation from God, and how patient God was: even Ahab's "
            "late humility was noticed (1 Kings 21:29)."),
        "known_for": ["Baal worship", "Naboth's vineyard", "“Thou troubler of Israel”"],
        "told_in": ["1 Kings 16:29-22:40"],
        "key_verses": ["1 Kings 16:33", "1 Kings 21:29"],
    },
    {
        "name": "Jezebel",
        "epithet": "The queen who hunted the prophets",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Queen of Israel",
        "era": "The divided kingdom",
        "hero": "jezebel",
        "family": [{"relation": "Husband", "id": "ahab"}, {"relation": "Enemy", "id": "elijah"}],
        "summary": "A princess of Sidon who married Ahab, promoted the worship of Baal, killed the LORD's prophets, and had Naboth murdered for his vineyard.",
        "story": (
            "Jezebel was the daughter of the king of the Sidonians. As queen of Israel she fed hundreds of "
            "the prophets of Baal at her table, and she 'cut off the prophets of the LORD.' After Carmel she "
            "swore to kill Elijah, and he fled. When Naboth refused to sell his vineyard, she wrote letters "
            "in Ahab's name, had false witnesses accuse him, and had him stoned. Years later Jehu came to "
            "Jezreel; she painted her face and looked out of a window, and was thrown down, as Elijah had "
            "foretold."),
        "importance": (
            "Her name became a byword for false religion backed by power and cruelty; Revelation uses it for "
            "a false prophetess leading a church astray (Revelation 2:20)."),
        "known_for": ["Hunting Elijah", "Naboth's murder"],
        "told_in": ["1 Kings 16:31", "1 Kings 18:4", "1 Kings 19:1-3", "1 Kings 21:1-25", "2 Kings 9:30-37"],
        "also_in": ["Revelation 2:20"],
        "key_verses": ["1 Kings 21:25"],
    },
    {
        "name": "Elijah",
        "epithet": "The prophet of fire",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The divided kingdom",
        "hero": "elijah",
        "family": [{"relation": "Successor", "id": "elisha"}, {"relation": "Opposed", "id": "ahab"}],
        "summary": "The prophet who stood alone against Baal, called down fire on Mount Carmel, heard God in a still small voice, and was taken up to heaven in a whirlwind.",
        "story": (
            "Elijah the Tishbite told Ahab there would be no rain, and was fed by ravens and by a widow "
            "whose flour and oil did not run out. After three years he challenged the prophets of Baal on "
            "Mount Carmel: 'How long halt ye between two opinions?' Fire fell from heaven on his soaked "
            "altar. Yet when Jezebel threatened him, he fled into the wilderness and asked to die. At Horeb "
            "God met him not in the wind, the earthquake or the fire, but in 'a still small voice'. He called "
            "Elisha to follow him, and was taken up by a whirlwind into heaven."),
        "importance": (
            "Malachi promised that Elijah would come before the great day of the LORD (Malachi 4:5); Jesus "
            "said John the Baptist came in that role (Matthew 11:14), and Elijah stood with Moses at the "
            "transfiguration."),
        "known_for": ["Fire on Mount Carmel", "The still small voice", "Taken up in a whirlwind"],
        "told_in": ["1 Kings 17-19", "1 Kings 21:17-29", "2 Kings 1:1-2:11"],
        "also_in": ["Malachi 4:5-6", "Matthew 17:1-13", "James 5:17-18"],
        "key_verses": ["1 Kings 18:21", "1 Kings 19:12"],
    },
    {
        "name": "Elisha",
        "epithet": "The prophet with a double portion",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The divided kingdom",
        "family": [{"relation": "Master", "id": "elijah"}, {"relation": "Healed", "id": "naaman"}],
        "summary": "Elijah's successor, who asked for a double portion of his spirit, and whose ministry was full of miracles of mercy.",
        "story": (
            "Elisha was ploughing with twelve yoke of oxen when Elijah threw his mantle over him. He "
            "followed him to the end, and asked, 'let a double portion of thy spirit be upon me.' When "
            "Elijah was taken up, Elisha picked up his mantle and struck the Jordan, and the waters parted. "
            "He purified a spring, filled a widow's jars with oil, raised the Shunammite's son, healed "
            "Naaman of leprosy, made an axe head float, and showed his frightened servant the hills full of "
            "horses and chariots of fire."),
        "importance": (
            "Elisha's miracles were full of mercy to ordinary people: widows, a foreign general, a servant, "
            "a family in grief. Jesus pointed to his healing of Naaman as a sign that God's grace reaches "
            "beyond Israel (Luke 4:27)."),
        "known_for": ["A double portion", "The widow's oil", "Chariots of fire"],
        "told_in": ["1 Kings 19:19-21", "2 Kings 2-9", "2 Kings 13:14-21"],
        "also_in": ["Luke 4:27"],
        "key_verses": ["2 Kings 2:9", "2 Kings 6:17"],
    },
    {
        "name": "Naaman",
        "epithet": "The general who washed in the Jordan",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Commander of the army of Syria",
        "era": "The divided kingdom",
        "family": [{"relation": "Healed through", "id": "elisha"}],
        "summary": "The Syrian army commander, a leper, who was healed when he humbled himself and washed seven times in the Jordan.",
        "story": (
            "Naaman was a great man in Syria, 'but he was a leper.' A captive Israelite girl told his wife "
            "about the prophet in Samaria. Elisha did not even come out, but sent word to wash in the Jordan "
            "seven times. Naaman went away in a rage, until his servants persuaded him. He dipped seven "
            "times, 'and his flesh came again like unto the flesh of a little child.' He came back to say, "
            "'now I know that there is no God in all earth, but in Israel.'"),
        "importance": (
            "Naaman learned that healing comes by humbling yourself and doing what God says, not by rank or "
            "grand gestures. Jesus used his story to show God's grace to outsiders (Luke 4:27)."),
        "known_for": ["Seven times in the Jordan", "A servant girl's word"],
        "told_in": ["2 Kings 5:1-19"],
        "also_in": ["Luke 4:27"],
        "key_verses": ["2 Kings 5:14"],
    },
    {
        "name": "Jonah",
        "epithet": "The prophet who ran from God",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The divided kingdom",
        "summary": "A prophet who fled from God's call to preach to Nineveh, was swallowed by a great fish, and was angry when Nineveh repented.",
        "story": (
            "God told Jonah to go and cry against Nineveh, the great Assyrian city. Jonah took a ship the "
            "other way. In a great storm the sailors threw him overboard, and 'the LORD had prepared a great "
            "fish to swallow up Jonah.' After three days it cast him out on dry land. This time he went, and "
            "the whole city repented, from the king down. Jonah was furious, because he knew that God was "
            "'a gracious God, and merciful.' God used a withered plant to ask him, 'should not I spare "
            "Nineveh, that great city?'"),
        "importance": (
            "Jonah's story shows God's mercy even to Israel's enemies, and a prophet who did not want it. "
            "Jesus called his three days in the fish 'the sign of the prophet Jonas' (Matthew 12:39-40), "
            "pointing to his own resurrection."),
        "known_for": ["The great fish", "Nineveh's repentance", "The withered plant"],
        "told_in": ["Jonah 1-4"],
        "also_in": ["2 Kings 14:25", "Matthew 12:39-41"],
        "key_verses": ["Jonah 2:9", "Jonah 4:11"],
    },
    {
        "name": "Isaiah",
        "epithet": "The prophet who saw the Lord high and lifted up",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The divided kingdom",
        "family": [{"relation": "Counselled", "id": "hezekiah"}],
        "summary": "The great prophet of Jerusalem, who saw God's glory in the temple, counselled kings, and foretold the virgin's son and the suffering servant.",
        "story": (
            "In the year King Uzziah died, Isaiah saw the Lord 'high and lifted up' and heard the seraphim "
            "cry, 'Holy, holy, holy.' He cried, 'Woe is me! for I am undone', and when his lips were touched "
            "with a live coal he answered God's call: 'Here am I; send me.' For decades he spoke to Judah's "
            "kings. He gave Ahaz the sign of a virgin's son called Immanuel; he stood with Hezekiah when the "
            "Assyrians besieged Jerusalem; and he wrote of a servant who would be 'wounded for our "
            "transgressions.'"),
        "importance": (
            "Isaiah is among the prophets the New Testament quotes most, and Jesus began his ministry in "
            "Nazareth by reading from his book (Luke 4:17-21). His vision of the servant who suffers for "
            "others shaped how the first Christians understood the cross."),
        "known_for": ["“Here am I; send me”", "Immanuel", "The suffering servant"],
        "told_in": ["Isaiah 6:1-13", "Isaiah 7:1-16", "Isaiah 36-39"],
        "also_in": ["2 Kings 19-20", "Luke 4:17-21", "John 12:37-41"],
        "key_verses": ["Isaiah 6:8", "Isaiah 53:5"],
    },
    {
        "name": "Hezekiah",
        "epithet": "The king who trusted God",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Judah",
        "era": "The divided kingdom",
        "hero": "hezekiah",
        "family": [{"relation": "Son", "id": "manasseh"}, {"relation": "Counselled by", "id": "isaiah"}],
        "summary": "A king of Judah who cleansed the temple, trusted God when the Assyrians surrounded Jerusalem, and was healed of a mortal illness.",
        "story": (
            "Hezekiah 'trusted in the LORD God of Israel; so that after him was none like him among all the "
            "kings of Judah.' He cleansed the temple, broke down the idols, and even destroyed the bronze "
            "serpent Moses had made, because the people burned incense to it. When Sennacherib's army "
            "surrounded Jerusalem and his envoy mocked Israel's God, Hezekiah spread the threatening letter "
            "before the LORD and prayed. That night the angel of the LORD struck the Assyrian camp. Later, "
            "sick to death, he prayed and wept, and God added fifteen years to his life."),
        "importance": (
            "Hezekiah's prayer over the Assyrian letter is a model for bringing a crisis to God (2 Kings "
            "19:14-19). Yet his pride in showing Babylon's envoys all his treasures foreshadowed the exile "
            "(2 Kings 20:12-18)."),
        "known_for": ["The letter spread before God", "Fifteen more years"],
        "told_in": ["2 Kings 18-20"],
        "also_in": ["2 Chronicles 29-32", "Isaiah 36-39"],
        "key_verses": ["2 Kings 18:5", "2 Kings 19:19"],
    },
    {
        "name": "Manasseh",
        "epithet": "The wicked king who repented",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Judah",
        "era": "The divided kingdom",
        "hero": "manasseh",
        "family": [{"relation": "Father", "id": "hezekiah"}, {"relation": "Grandson", "id": "josiah"}],
        "summary": "Hezekiah's son, the longest-reigning and one of the most wicked kings of Judah, who was taken captive to Babylon, humbled himself, and was restored.",
        "story": (
            "Manasseh became king at twelve and reigned fifty-five years. He rebuilt the altars his father "
            "had destroyed, worshipped the stars, practised sorcery, made his son pass through the fire, and "
            "'shed innocent blood very much.' The Assyrians took him in chains to Babylon. 'And when he was "
            "in affliction, he besought the LORD his God, and humbled himself greatly.' God heard him and "
            "brought him back to Jerusalem, where he removed the foreign gods."),
        "importance": (
            "Kings says Manasseh's sins sealed Judah's judgement (2 Kings 24:3-4), while Chronicles records "
            "his repentance. Together they show both the damage sin does and how far God's mercy reaches."),
        "known_for": ["Fifty-five years of evil", "Repentance in chains"],
        "told_in": ["2 Kings 21:1-18", "2 Chronicles 33:1-20"],
        "also_in": ["2 Kings 24:3-4"],
        "key_verses": ["2 Chronicles 33:12-13"],
    },
    {
        "name": "Josiah",
        "epithet": "The boy king who found the law",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "King of Judah",
        "era": "The divided kingdom",
        "hero": "josiah",
        "family": [{"relation": "Grandfather", "id": "manasseh"}, {"relation": "Mourned by", "id": "jeremiah"}],
        "summary": "A king of Judah crowned at eight, who led the greatest reform in Judah's history after the lost book of the law was found in the temple.",
        "story": (
            "Josiah became king at eight, and 'he did that which was right in the sight of the LORD.' In his "
            "eighteenth year, while the temple was being repaired, the high priest found the book of the "
            "law. When it was read to him, Josiah tore his clothes. He read it to all the people, renewed "
            "the covenant, destroyed the idols and high places, and kept a Passover like none since the days "
            "of the judges. He was killed in battle against Pharaoh Necho at Megiddo, and Jeremiah lamented "
            "for him."),
        "importance": (
            "Josiah shows what happens when God's word is recovered and taken seriously: 'like unto him was "
            "there no king before him, that turned to the LORD with all his heart' (2 Kings 23:25). A "
            "prophet had named him three centuries before he was born (1 Kings 13:2)."),
        "known_for": ["King at eight", "The book of the law found", "The great Passover"],
        "told_in": ["2 Kings 22-23"],
        "also_in": ["2 Chronicles 34-35", "1 Kings 13:1-2"],
        "key_verses": ["2 Kings 23:25"],
    },
    {
        "name": "Jeremiah",
        "epithet": "The weeping prophet",
        "group": "The divided kingdom",
        "testament": "Old",
        "role": "Prophet",
        "era": "The fall of Jerusalem",
        "family": [{"relation": "Mourned", "id": "josiah"}],
        "summary": "The prophet called as a youth, who warned Judah for some forty years that Babylon would destroy Jerusalem, suffered for it, and lived to see it happen.",
        "story": (
            "God called Jeremiah as a young man: 'Before I formed thee in the belly I knew thee.' He "
            "protested, 'I am a child', and God touched his mouth. He warned kings and people that Jerusalem "
            "would fall to Babylon unless they turned back, and he was beaten, put in the stocks, let down "
            "into a muddy pit and imprisoned as a traitor. He wept over his people. When Jerusalem fell he "
            "stayed with the poor who were left, and was later taken to Egypt against his will. He also "
            "promised a new covenant, written on the heart."),
        "importance": (
            "Jeremiah's promise of a new covenant (Jeremiah 31:31-34) is quoted in full in Hebrews 8, and "
            "at the Last Supper Jesus spoke of 'the new testament in my blood' (Luke 22:20). His life shows "
            "faithfulness when faithfulness looks like failure."),
        "known_for": ["Called before birth", "The muddy pit", "The new covenant"],
        "told_in": ["Jeremiah 1:1-19", "Jeremiah 20:1-18", "Jeremiah 37-43"],
        "also_in": ["2 Chronicles 35:25", "Hebrews 8:8-12"],
        "key_verses": ["Jeremiah 1:5", "Jeremiah 31:33"],
    },
    # ------------------------------------------------------------------ exile and return
    {
        "name": "Nebuchadnezzar",
        "epithet": "The king of Babylon",
        "group": "Exile and return",
        "testament": "Old",
        "role": "King of Babylon",
        "era": "The exile",
        "hero": "nebuchadnezzar",
        "family": [{"relation": "Served by", "id": "daniel"}],
        "summary": "The king of Babylon who destroyed Jerusalem and carried Judah into exile, dreamed of a great statue, and was humbled until he praised God.",
        "story": (
            "Nebuchadnezzar besieged Jerusalem more than once, carried off its king, its craftsmen and young "
            "nobles such as Daniel, and in the end burned the city and the temple. He dreamed of a great "
            "image of gold, silver, bronze, iron and clay, and Daniel told him its meaning. He set up a "
            "golden image, threw Shadrach, Meshach and Abednego into the furnace, and then praised their "
            "God. Proud of the Babylon he had built, he lost his reason and lived like an animal, until he "
            "lifted his eyes to heaven and 'blessed the most High.'"),
        "importance": (
            "Nebuchadnezzar was God's instrument of judgement on Judah. His story ends with a pagan emperor "
            "confessing that God humbles the proud: 'those that walk in pride he is able to abase' (Daniel "
            "4:37)."),
        "known_for": ["The fall of Jerusalem", "The golden image", "Humbled and restored"],
        "told_in": ["2 Kings 24-25", "Daniel 1-4"],
        "also_in": ["Jeremiah 25:9", "Jeremiah 39:1-10"],
        "key_verses": ["Daniel 4:37"],
    },
    {
        "name": "Daniel",
        "epithet": "The man greatly beloved",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Prophet and royal official",
        "era": "The exile",
        "hero": "daniel",
        "family": [{"relation": "Friends", "id": "shadrach-meshach-and-abednego"},
                   {"relation": "Served", "id": "nebuchadnezzar"}],
        "summary": "A young noble of Judah carried to Babylon, who served its kings for some seventy years without giving up his faith, and was delivered from the lions.",
        "story": (
            "As a youth in Babylon, Daniel 'purposed in his heart that he would not defile himself' with the "
            "king's food. God gave him wisdom to tell Nebuchadnezzar his dream and its meaning, and he rose "
            "high in the kingdom. He read the writing on the wall at Belshazzar's feast. Under Darius, "
            "jealous officials had a law passed forbidding prayer to anyone but the king; Daniel went home "
            "and prayed three times a day, as before, with his windows open toward Jerusalem. He was thrown "
            "to the lions, and God shut their mouths. He also saw visions of the kingdoms to come."),
        "importance": (
            "Daniel shows how to live faithfully in a foreign and hostile culture. Jesus called him 'Daniel "
            "the prophet' (Matthew 24:15), and Daniel's vision of 'one like the Son of man' coming with the "
            "clouds (Daniel 7:13) gave Jesus the title he used most for himself."),
        "known_for": ["The king's food refused", "The writing on the wall", "The lions' den"],
        "told_in": ["Daniel 1-2", "Daniel 5-6"],
        "also_in": ["Daniel 7-12", "Ezekiel 14:14", "Matthew 24:15"],
        "key_verses": ["Daniel 1:8", "Daniel 6:10"],
    },
    {
        "name": "Shadrach, Meshach and Abednego",
        "epithet": "The three in the furnace",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Officials in Babylon",
        "era": "The exile",
        "hero": "shadrach-meshach-and-abednego",
        "family": [{"relation": "Friend", "id": "daniel"}],
        "summary": "Daniel's three friends, who refused to bow to Nebuchadnezzar's golden image and were thrown into a burning furnace, where a fourth man walked with them.",
        "story": (
            "Hananiah, Mishael and Azariah were taken to Babylon with Daniel and given Babylonian names. "
            "When Nebuchadnezzar ordered everyone to bow to his golden image, they would not. They told him "
            "their God was able to deliver them, 'But if not … we will not serve thy gods.' The furnace was "
            "heated seven times hotter, and they were thrown in bound. The king saw four men walking loose in "
            "the fire, 'and the form of the fourth is like the Son of God.' They came out without even the "
            "smell of fire on them."),
        "importance": (
            "Their 'but if not' is one of the Bible's great statements of faith that does not depend on the "
            "outcome. Hebrews remembers those who 'quenched the violence of fire' (Hebrews 11:34)."),
        "known_for": ["“But if not”", "The fiery furnace", "The fourth man"],
        "told_in": ["Daniel 1:6-7", "Daniel 3:1-30"],
        "also_in": ["Hebrews 11:33-34"],
        "key_verses": ["Daniel 3:17-18"],
    },
    {
        "name": "Ezekiel",
        "epithet": "The prophet of the dry bones",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Priest and prophet",
        "era": "The exile",
        "summary": "A priest taken to Babylon in the first exile, who saw visions of God's glory by the river Chebar and prophesied Jerusalem's fall and its restoration.",
        "story": (
            "Ezekiel was among the captives by the river Chebar when 'the heavens were opened, and I saw "
            "visions of God': living creatures, wheels full of eyes, and a throne like sapphire. He acted "
            "out the siege of Jerusalem, lying on his side for many days. When his wife died, God told him "
            "not to mourn openly, as a sign to the people. After the city fell, he saw a valley full of dry "
            "bones come together and live, and a river flowing out from a new temple."),
        "importance": (
            "Ezekiel's message is that God's glory is not tied to one place: it appeared to him in exile. "
            "His promise, 'A new heart also will I give you' (Ezekiel 36:26), and his vision of the dry "
            "bones have given hope to God's people ever since."),
        "known_for": ["The wheels and the throne", "The valley of dry bones", "A new heart"],
        "told_in": ["Ezekiel 1:1-3:15", "Ezekiel 24:15-27", "Ezekiel 37:1-14"],
        "key_verses": ["Ezekiel 36:26", "Ezekiel 37:5"],
    },
    {
        "name": "Cyrus",
        "epithet": "The Persian king who sent the Jews home",
        "group": "Exile and return",
        "testament": "Old",
        "role": "King of Persia",
        "era": "The return from exile",
        "summary": "The king of Persia who conquered Babylon and let the exiles of Judah go home to rebuild the temple in Jerusalem.",
        "story": (
            "In the first year of Cyrus king of Persia, 'the LORD stirred up the spirit of Cyrus', and he "
            "proclaimed that the God of heaven had charged him to build him a house at Jerusalem. He invited "
            "every Jew who wished to go up and build it, and gave back the gold and silver vessels "
            "Nebuchadnezzar had taken from the temple."),
        "importance": (
            "Isaiah named Cyrus long before, calling him the LORD's anointed and shepherd (Isaiah "
            "44:28-45:1): a foreign king who served God's purpose for his people without knowing him."),
        "known_for": ["The decree to rebuild", "Named by Isaiah"],
        "told_in": ["Ezra 1:1-11"],
        "also_in": ["2 Chronicles 36:22-23", "Isaiah 44:28-45:4", "Daniel 6:28"],
        "key_verses": ["Ezra 1:2"],
    },
    {
        "name": "Esther",
        "epithet": "The queen who saved her people",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Queen of Persia",
        "era": "The Persian empire",
        "hero": "esther",
        "family": [{"relation": "Cousin", "id": "mordecai"}, {"relation": "Enemy", "id": "haman"}],
        "summary": "A Jewish orphan who became queen of Persia and risked her life to save her people from Haman's plot.",
        "story": (
            "Hadassah, called Esther, was raised by her cousin Mordecai and chosen as queen by King "
            "Ahasuerus, without revealing that she was a Jew. When Haman obtained a decree to destroy all "
            "the Jews, Mordecai told her, 'who knoweth whether thou art come to the kingdom for such a time "
            "as this?' She fasted three days and went to the king uninvited, saying, 'if I perish, I "
            "perish.' At a banquet she exposed Haman's plot, and the Jews were saved. The feast of Purim "
            "remembers it."),
        "importance": (
            "The book of Esther never mentions God by name, yet his care for his people runs through every "
            "turn of the story. Esther shows courage in the place God has put you."),
        "known_for": ["“For such a time as this”", "“If I perish, I perish”", "Purim"],
        "told_in": ["Esther 2-9"],
        "key_verses": ["Esther 4:14", "Esther 4:16"],
    },
    {
        "name": "Mordecai",
        "epithet": "The cousin who would not bow",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Official of the Persian court",
        "era": "The Persian empire",
        "family": [{"relation": "Cousin", "id": "esther"}, {"relation": "Enemy", "id": "haman"}],
        "summary": "A Jew at the Persian court who raised his cousin Esther, refused to bow to Haman, and rose to be second in the kingdom.",
        "story": (
            "Mordecai sat in the king's gate and uncovered a plot to kill King Ahasuerus. He would not bow "
            "to Haman, and Haman in his fury planned to destroy all the Jews. Mordecai put on sackcloth and "
            "urged Esther to plead with the king. That night the king could not sleep, read the record of "
            "Mordecai's loyalty, and ordered Haman himself to lead Mordecai through the city in royal "
            "honour. Haman was hanged on the gallows he had built for Mordecai, and Mordecai took his "
            "place."),
        "importance": (
            "Mordecai's faithfulness in a small thing, a report written down and forgotten, became the "
            "hinge of his people's rescue. He was 'great among the Jews … seeking the wealth of his people' "
            "(Esther 10:3)."),
        "known_for": ["Raising Esther", "Refusing to bow", "Honoured by the king"],
        "told_in": ["Esther 2-10"],
        "key_verses": ["Esther 10:3"],
    },
    {
        "name": "Haman",
        "epithet": "The man who plotted to destroy the Jews",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Chief minister of Persia",
        "era": "The Persian empire",
        "hero": "haman",
        "family": [{"relation": "Enemy", "id": "mordecai"}],
        "summary": "The proud chief minister of Persia who plotted to destroy all the Jews because Mordecai would not bow to him, and was hanged on his own gallows.",
        "story": (
            "When King Ahasuerus promoted Haman above all the princes, everyone at the gate bowed to him "
            "except Mordecai. Haman 'thought scorn to lay hands on Mordecai alone', and cast lots, called "
            "pur, to choose a day to destroy all the Jews in the empire. He built a gallows for Mordecai. "
            "But he was made to honour Mordecai in public, and at Esther's banquet his plot was exposed. He "
            "was hanged on the gallows he had prepared."),
        "importance": (
            "Haman is the Bible's picture of wounded pride turned murderous; 'Pride goeth before "
            "destruction' (Proverbs 16:18) could be written over his life. The lots he cast gave the feast "
            "of Purim its name (Esther 9:24-26)."),
        "known_for": ["The plot against the Jews", "His own gallows"],
        "told_in": ["Esther 3-7"],
        "key_verses": ["Esther 3:6", "Esther 7:10"],
    },
    {
        "name": "Ezra",
        "epithet": "The scribe who taught the law",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Priest and scribe",
        "era": "The return from exile",
        "family": [{"relation": "Worked with", "id": "nehemiah"}],
        "summary": "A priest and scribe who led a company of exiles back to Jerusalem and taught God's law to the people who had returned.",
        "story": (
            "Ezra 'was a ready scribe in the law of Moses', who 'had prepared his heart to seek the law of "
            "the LORD, and to do it, and to teach' it. He led a second company of exiles from Babylon to "
            "Jerusalem, too ashamed to ask the king for soldiers after saying that God would protect them. "
            "Finding that many had married wives who worshipped other gods, he tore his clothes and prayed. "
            "With Nehemiah he read the book of the law aloud to all the people from morning until midday, "
            "and the Levites helped them understand it."),
        "importance": (
            "Ezra's order, to seek the law, to do it and to teach it (Ezra 7:10), is a pattern for anyone "
            "who handles God's word. Jewish tradition remembers him as the one who gathered the returned "
            "people around the Scriptures."),
        "known_for": ["A ready scribe", "Reading the law to the people"],
        "told_in": ["Ezra 7-10", "Nehemiah 8:1-12"],
        "key_verses": ["Ezra 7:10"],
    },
    {
        "name": "Nehemiah",
        "epithet": "The builder of Jerusalem's walls",
        "group": "Exile and return",
        "testament": "Old",
        "role": "Governor of Judah",
        "era": "The return from exile",
        "hero": "nehemiah",
        "family": [{"relation": "Worked with", "id": "ezra"}],
        "summary": "The Persian king's cupbearer, who wept over Jerusalem's broken walls, went to rebuild them, and finished them in fifty-two days despite fierce opposition.",
        "story": (
            "Nehemiah, cupbearer to King Artaxerxes, heard that Jerusalem's wall was broken down and its "
            "gates burned, and he wept, fasted and prayed. The king saw his sad face and let him go to "
            "rebuild. Nehemiah inspected the ruins by night, rallied the people, and set families to build "
            "each section. Sanballat and Tobiah mocked and threatened, so the builders worked with a tool in "
            "one hand and a weapon in the other. 'So the wall was finished … in fifty and two days.'"),
        "importance": (
            "Nehemiah shows prayer and hard work together: he prayed before he spoke to the king, and then "
            "planned carefully. He told the people, 'the joy of the LORD is your strength' (Nehemiah 8:10)."),
        "known_for": ["The rebuilt wall", "A tool in one hand, a weapon in the other"],
        "told_in": ["Nehemiah 1-6", "Nehemiah 8:9-12"],
        "key_verses": ["Nehemiah 2:20", "Nehemiah 8:10"],
    },
]
