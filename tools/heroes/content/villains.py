"""Villains of the Bible.

Same fields as heroes.py, except that `traits` are what drove them and `end`
says how their story ended. `turned` marks those who repented.
"""

VILLAINS = [
    # ------------------------------------------------------------ Old Testament
    {
        "name": "Cain",
        "epithet": "The first murderer",
        "testament": "Old",
        "era": "The beginning",
        "books": ["Genesis", "Hebrews", "1 John", "Jude"],
        "summary": "Adam and Eve's firstborn, who killed his brother Abel in jealousy and asked God, 'Am I my brother's keeper?'",
        "story": (
            "Cain farmed; his brother Abel kept sheep. Both brought offerings, and God respected "
            "Abel's but not Cain's. God warned Cain that sin was crouching at the door and that he "
            "must rule over it. Instead Cain lured Abel into the field and killed him. When God "
            "asked where his brother was, Cain lied. He was driven out as a wanderer, yet God put a "
            "mark on him so no one would kill him."),
        "moment": {"title": "'Am I my brother's keeper?'", "reference": "Genesis 4:8-9"},
        "traits": ["Jealousy", "Anger", "Refusing God's warning", "Deceit"],
        "end": "Banished from God's presence to the land of Nod, east of Eden, where he built a city.",
        "lesson": "Sin starts in the heart — 'sin lieth at the door' — and must be mastered before it masters us. John names Cain as the opposite of love (1 John 3:12).",
        "told_in": ["Genesis 4:1-16"],
        "key_verses": ["Genesis 4:7", "1 John 3:12"],
        "faced": [],
        "peoples": [],
    },
    {
        "name": "Pharaoh",
        "epithet": "The king who hardened his heart",
        "testament": "Old",
        "era": "15th or 13th century BC",
        "books": ["Exodus", "Romans"],
        "summary": "The unnamed king of Egypt who enslaved Israel and refused, through ten plagues, to 'let my people go'.",
        "story": (
            "A new king who 'knew not Joseph' feared the growing Hebrews, made them slaves and "
            "ordered their baby boys drowned. When Moses demanded 'Let my people go', Pharaoh "
            "answered, 'Who is the LORD, that I should obey his voice?' Through ten plagues he "
            "promised and broke his word. After the death of Egypt's firstborn he finally let them "
            "go, then changed his mind and chased them to the Red Sea, where his army drowned."),
        "moment": {"title": "'Who is the LORD, that I should obey?'", "reference": "Exodus 5:2"},
        "traits": ["Pride", "Cruelty", "Broken promises", "A hardened heart"],
        "end": "His chariots and army were drowned in the Red Sea; Egypt was left devastated.",
        "lesson": "Each refusal to listen to God makes the heart harder. God raised Pharaoh up 'that my name might be declared throughout all the earth' (Romans 9:17).",
        "told_in": ["Exodus 1-14"],
        "key_verses": ["Exodus 5:2", "Exodus 14:28"],
        "faced": ["moses"],
        "peoples": ["egyptians", "israelites"],
    },
    {
        "name": "Balaam",
        "epithet": "The prophet for hire",
        "testament": "Old",
        "era": "End of the wilderness period",
        "books": ["Numbers", "Deuteronomy", "2 Peter", "Jude", "Revelation"],
        "summary": "A famous soothsayer hired by the king of Moab to curse Israel, who could only bless — and then showed Moab how to make Israel sin.",
        "story": (
            "Balak king of Moab offered Balaam rich rewards to curse Israel. God told him not to go; "
            "he went anyway, and his donkey saw the angel of the LORD blocking the road before he "
            "did. Three times Balak led him to a high place, and three times — four in all — Balaam "
            "could only bless Israel, foretelling 'a Star out of Jacob'. But afterwards he counselled "
            "Moab to lure Israel into idolatry and immorality at Peor."),
        "moment": {"title": "The donkey that spoke", "reference": "Numbers 22:28-31"},
        "traits": ["Greed", "Double-mindedness", "Using religion for profit"],
        "end": "Killed by Israel in the war against Midian (Numbers 31:8). The New Testament uses him as a warning against loving 'the wages of unrighteousness'.",
        "lesson": "You can say the right words and still have a wrong heart. Balaam is the Bible's example of ministry for money.",
        "told_in": ["Numbers 22-24", "Numbers 31:8", "Numbers 31:16"],
        "key_verses": ["Numbers 23:19", "2 Peter 2:15"],
        "faced": [],
        "peoples": ["moabites", "midianites", "israelites"],
    },
    {
        "name": "Delilah",
        "epithet": "The betrayer of Samson",
        "testament": "Old",
        "era": "c. 1100 BC",
        "books": ["Judges"],
        "summary": "The woman Samson loved, who took the Philistines' silver to discover the secret of his strength and handed him over.",
        "story": (
            "Delilah lived in the valley of Sorek. The lords of the Philistines each offered her "
            "eleven hundred pieces of silver to find the secret of Samson's strength. Three times "
            "she asked and he lied; three times she tried to hand him over. She pressed him daily "
            "'so that his soul was vexed unto death', until he told her about his Nazirite hair. She "
            "had his head shaved while he slept and called the Philistines."),
        "moment": {"title": "'The Philistines be upon thee, Samson'", "reference": "Judges 16:18-20"},
        "traits": ["Greed", "Manipulation", "Persistent betrayal"],
        "end": "Scripture does not say. Samson was blinded and imprisoned, but in his death he pulled down the temple of Dagon.",
        "lesson": "Temptation often works by wearing us down slowly. Samson played with his calling until he lost it.",
        "told_in": ["Judges 16:4-21"],
        "key_verses": ["Judges 16:5", "Judges 16:20"],
        "faced": [],
        "peoples": ["philistines", "israelites"],
    },
    {
        "name": "Goliath",
        "epithet": "The giant of Gath",
        "testament": "Old",
        "era": "c. 1025 BC",
        "books": ["1 Samuel"],
        "summary": "The Philistine champion, six cubits and a span tall, who defied the armies of Israel for forty days — until a shepherd boy came.",
        "story": (
            "Goliath of Gath wore a bronze coat of mail weighing five thousand shekels and carried a "
            "spear like a weaver's beam. Morning and evening for forty days he challenged Israel to "
            "send a man to fight him, and Saul's army was 'dismayed, and greatly afraid'. David, "
            "bringing food to his brothers, was outraged that anyone should 'defy the armies of the "
            "living God'. Goliath mocked him, cursed him by his gods, and was felled by one stone."),
        "moment": {"title": "'Am I a dog, that thou comest to me with staves?'", "reference": "1 Samuel 17:43-44"},
        "traits": ["Pride", "Intimidation", "Defiance of God", "Trust in strength"],
        "end": "Struck in the forehead by David's stone and killed with his own sword; the Philistines fled.",
        "lesson": "The biggest threat is small before God: 'the battle is the LORD's'.",
        "told_in": ["1 Samuel 17"],
        "key_verses": ["1 Samuel 17:10", "1 Samuel 17:47"],
        "faced": ["david"],
        "peoples": ["philistines", "anakim", "rephaim"],
    },
    {
        "name": "Saul",
        "epithet": "The king who fell",
        "testament": "Old",
        "era": "c. 1050–1010 BC",
        "books": ["1 Samuel", "1 Chronicles"],
        "summary": "Israel's first king — tall, anointed and humble at first — who disobeyed God, grew jealous of David, and hunted him for years.",
        "story": (
            "Saul was 'a choice young man, and a goodly', who hid among the baggage when chosen king. "
            "He began well, rescuing Jabesh-gilead. But he offered a sacrifice he had no right to "
            "make, and later spared King Agag and the best spoil against God's command, and God "
            "rejected him as king. When the women sang that David had slain his ten thousands, "
            "Saul's jealousy turned murderous: he threw spears at David and chased him through the "
            "wilderness. On the eve of his last battle he consulted a medium at Endor."),
        "moment": {"title": "'To obey is better than sacrifice'", "reference": "1 Samuel 15:22-23"},
        "traits": ["Insecurity", "Jealousy", "Partial obedience", "Fear of people"],
        "end": "Badly wounded on Mount Gilboa, he fell on his own sword; three of his sons, including Jonathan, died that day (1 Samuel 31).",
        "lesson": "A good start is no guarantee of a good finish. Saul feared the people more than God, and jealousy consumed him.",
        "told_in": ["1 Samuel 9-31"],
        "key_verses": ["1 Samuel 15:22", "1 Samuel 18:7-9"],
        "faced": ["david", "samuel", "jonathan"],
        "peoples": ["israelites", "philistines", "amalekites", "ammonites"],
    },
    {
        "name": "Absalom",
        "epithet": "The prince who stole hearts",
        "testament": "Old",
        "era": "c. 980 BC",
        "books": ["2 Samuel"],
        "summary": "David's handsome son, who avenged his sister, then 'stole the hearts of the men of Israel' and seized his father's throne.",
        "story": (
            "After his half-brother Amnon violated his sister Tamar, Absalom waited two years and had "
            "Amnon killed. Allowed back from exile, he sat by the city gate telling everyone who came "
            "for justice that he would treat them better than the king. After four years he declared "
            "himself king in Hebron, and David fled Jerusalem weeping. In the battle in the wood of "
            "Ephraim, Absalom's long hair caught in an oak and Joab killed him, against David's order."),
        "moment": {"title": "Stealing the hearts of Israel", "reference": "2 Samuel 15:6"},
        "traits": ["Vanity", "Ambition", "Revenge", "Flattery"],
        "end": "Killed while hanging from an oak; David's grief — 'O my son Absalom… would God I had died for thee' — is one of the most heart-breaking lines in Scripture.",
        "lesson": "Charm and ambition without integrity destroy. And sin in a family can echo for years (2 Samuel 12:10).",
        "told_in": ["2 Samuel 13-18"],
        "key_verses": ["2 Samuel 15:6", "2 Samuel 18:33"],
        "faced": ["david"],
        "peoples": ["israelites"],
    },
    {
        "name": "Ahab",
        "epithet": "The king who sold himself to evil",
        "testament": "Old",
        "era": "c. 874–853 BC",
        "books": ["1 Kings", "2 Chronicles"],
        "summary": "King of Israel who married Jezebel, built a temple to Baal in Samaria, and let his wife murder Naboth for a vineyard.",
        "story": (
            "Ahab 'did more to provoke the LORD God of Israel to anger than all the kings of Israel "
            "that were before him'. He married Jezebel, served Baal, and called Elijah 'thou troubler "
            "of Israel'. He saw God's fire fall on Carmel but did not change. When Naboth would not "
            "sell his vineyard, Ahab sulked on his bed until Jezebel had Naboth killed. Elijah met "
            "him in the vineyard with God's judgement. Ahab humbled himself, and God delayed the "
            "disaster — but Ahab later ignored the prophet Micaiah and went to war."),
        "moment": {"title": "Taking Naboth's vineyard", "reference": "1 Kings 21:15-19"},
        "traits": ["Weakness", "Greed", "Idolatry", "Hating God's messengers"],
        "end": "Killed by an arrow shot 'at a venture' at Ramoth-gilead; dogs licked his blood, as Elijah had said (1 Kings 22:34-38).",
        "lesson": "Passive evil is still evil. Ahab let others do his wickedness for him and was held responsible.",
        "told_in": ["1 Kings 16:29-22:40"],
        "key_verses": ["1 Kings 18:17", "1 Kings 21:25"],
        "faced": ["elijah"],
        "peoples": ["israelites", "phoenicians", "arameans", "moabites"],
    },
    {
        "name": "Jezebel",
        "epithet": "The queen of Baal",
        "testament": "Old",
        "era": "c. 874–841 BC",
        "books": ["1 Kings", "2 Kings", "Revelation"],
        "summary": "A Sidonian princess, Ahab's queen, who promoted Baal worship, killed the LORD's prophets, and plotted Naboth's murder.",
        "story": (
            "Daughter of Ethbaal king of the Zidonians, Jezebel fed 450 prophets of Baal and 400 of "
            "the groves at her table and 'cut off the prophets of the LORD'. After Carmel she vowed "
            "to kill Elijah within a day, sending him fleeing. She forged letters in Ahab's name to "
            "have Naboth falsely accused and stoned. Elijah foretold that dogs would eat her by the "
            "wall of Jezreel. Her name became a byword: Revelation uses it for a false prophetess "
            "in Thyatira."),
        "moment": {"title": "The letters that killed Naboth", "reference": "1 Kings 21:7-10"},
        "traits": ["Idolatry", "Ruthlessness", "Manipulation", "Hatred of God's prophets"],
        "end": "When Jehu came to Jezreel she painted her face and taunted him; her servants threw her from a window, and dogs ate her, as Elijah had said (2 Kings 9:30-37).",
        "lesson": "Power used to crush the innocent will be judged. God sees what is done in secret with a forged seal.",
        "told_in": ["1 Kings 16:31", "1 Kings 18-19", "1 Kings 21", "2 Kings 9:30-37"],
        "key_verses": ["1 Kings 19:2", "1 Kings 21:25"],
        "faced": ["elijah"],
        "peoples": ["phoenicians", "israelites"],
    },
    {
        "name": "Manasseh",
        "epithet": "The worst king who repented",
        "testament": "Old",
        "era": "c. 697–642 BC",
        "books": ["2 Kings", "2 Chronicles"],
        "summary": "Hezekiah's son and Judah's longest-reigning king, who filled Jerusalem with idols and innocent blood — and, in chains, humbled himself before God.",
        "story": (
            "Manasseh undid all his father's reforms: he rebuilt the high places, set an idol in the "
            "Temple, practised sorcery, burned his own son as an offering, and 'shed innocent blood "
            "very much'. Kings says his sins sealed Judah's fate. But Chronicles adds that the "
            "Assyrians took him to Babylon in chains, where 'he besought the LORD his God, and "
            "humbled himself greatly'. God heard him and brought him home, and he removed the idols "
            "he had set up."),
        "moment": {"title": "Humbled in chains", "reference": "2 Chronicles 33:12-13"},
        "traits": ["Idolatry", "Cruelty", "Occult practice", "Repentance, at last"],
        "end": "Restored to his throne, he tore down foreign altars; but the damage he had done to Judah remained (2 Kings 23:26).",
        "lesson": "No one is too far gone to be forgiven: 'Then Manasseh knew that the LORD he was God.' Yet forgiven sin can still leave lasting consequences.",
        "turned": "The most wicked king of Judah repented and was restored.",
        "told_in": ["2 Kings 21:1-18", "2 Chronicles 33:1-20"],
        "key_verses": ["2 Kings 21:16", "2 Chronicles 33:12-13"],
        "faced": [],
        "peoples": ["israelites", "assyrians"],
    },
    {
        "name": "Nebuchadnezzar",
        "epithet": "The proud king humbled",
        "testament": "Old",
        "era": "605–562 BC",
        "books": ["2 Kings", "Jeremiah", "Daniel"],
        "summary": "The Babylonian emperor who destroyed Jerusalem and threw three Hebrews into a furnace — until God humbled him and he praised the Most High.",
        "story": (
            "Nebuchadnezzar took Daniel and others captive in 605 BC, and in 586 BC his army burned "
            "Jerusalem and the Temple. He set up a golden image and raged when three young Jews would "
            "not bow, then saw them walking in the fire with a fourth. Walking on his palace roof he "
            "boasted, 'Is not this great Babylon, that I have built… for the honour of my majesty?' "
            "That hour he lost his reason and lived like an animal, until he 'lifted up mine eyes "
            "unto heaven' and blessed the Most High."),
        "moment": {"title": "'Is not this great Babylon, that I have built?'", "reference": "Daniel 4:30-33"},
        "traits": ["Pride", "Violent temper", "Self-glory", "Humility, at last"],
        "end": "His reason returned and he praised God: 'those that walk in pride he is able to abase' (Daniel 4:37). He reigned 43 years.",
        "lesson": "God rules 'in the kingdom of men, and giveth it to whomsoever he will'. Even the most powerful can be humbled — and restored.",
        "turned": "Humbled by God, he ended by praising the King of heaven.",
        "told_in": ["2 Kings 24-25", "Daniel 1-4"],
        "key_verses": ["Daniel 3:28", "Daniel 4:37"],
        "faced": ["daniel", "shadrach-meshach-and-abednego"],
        "peoples": ["babylonians", "israelites", "egyptians"],
    },
    {
        "name": "Haman",
        "epithet": "The enemy of the Jews",
        "testament": "Old",
        "era": "c. 474 BC",
        "books": ["Esther"],
        "summary": "The Persian king's chief minister who, enraged that Mordecai would not bow, plotted to destroy every Jew in the empire.",
        "story": (
            "Haman the Agagite was promoted above all the king's princes, and everyone bowed to him "
            "except Mordecai. Rather than punish one man, Haman cast lots (pur) and obtained a decree "
            "to kill all the Jews on one day. He built a gallows fifty cubits high for Mordecai. But "
            "the night before, the sleepless king read of Mordecai's loyalty and made Haman lead "
            "him through the city in honour. At Queen Esther's banquet Haman's plot was exposed."),
        "moment": {"title": "The decree to destroy the Jews", "reference": "Esther 3:8-11"},
        "traits": ["Pride", "Hatred", "Wounded vanity", "Genocidal cruelty"],
        "end": "Hanged on the gallows he had built for Mordecai; the feast of Purim celebrates the reversal (Esther 7:10; 9:26).",
        "lesson": "'Pride goeth before destruction.' Haman's plans turned back on his own head.",
        "told_in": ["Esther 3-7"],
        "key_verses": ["Esther 3:6", "Esther 7:10"],
        "faced": ["esther"],
        "peoples": ["persians", "amalekites", "israelites"],
    },
    # ------------------------------------------------------------ New Testament
    {
        "name": "Herod the Great",
        "epithet": "The king who feared a child",
        "testament": "New",
        "era": "Ruled 37–4 BC",
        "books": ["Matthew", "Luke"],
        "summary": "The Idumean king of Judea who tried to kill the newborn 'King of the Jews' and ordered the massacre of Bethlehem's children.",
        "story": (
            "Herod was a great builder — he rebuilt the Temple on a grand scale — and a ruthless "
            "ruler who killed his own wife and sons when he suspected them. When wise men from the "
            "east asked where the King of the Jews was born, he was 'troubled, and all Jerusalem with "
            "him'. He pretended he wanted to worship the child, and when the wise men went home "
            "another way, he ordered all the boys of Bethlehem two years old and under to be killed. "
            "Joseph had already fled with Mary and Jesus to Egypt."),
        "moment": {"title": "The slaughter at Bethlehem", "reference": "Matthew 2:16"},
        "traits": ["Paranoia", "Cruelty", "Deceit", "Clinging to power"],
        "end": "He died soon afterwards, in 4 BC, and Joseph brought the family back from Egypt (Matthew 2:19-20).",
        "lesson": "No ruler can stop God's purpose. The child Herod feared outlived him and his kingdom.",
        "told_in": ["Matthew 2:1-22"],
        "key_verses": ["Matthew 2:3", "Matthew 2:16"],
        "faced": ["mary-mother-of-jesus"],
        "peoples": ["edomites", "romans", "israelites"],
    },
    {
        "name": "Herod Antipas",
        "epithet": "The king who kept the wrong promise",
        "testament": "New",
        "era": "Ruled 4 BC – AD 39",
        "books": ["Matthew", "Mark", "Luke"],
        "summary": "Herod the Great's son, ruler of Galilee, who beheaded John the Baptist to keep a rash oath and mocked Jesus at his trial.",
        "story": (
            "Antipas married Herodias, his brother Philip's wife, and John the Baptist told him it "
            "was unlawful. He imprisoned John, yet 'feared John, knowing that he was a just man… and "
            "heard him gladly'. At his birthday feast Herodias' daughter danced, and he swore to give "
            "her anything. Prompted by her mother she asked for John's head, and Herod, 'for his "
            "oath's sake', agreed. Jesus called him 'that fox'. At Jesus' trial Herod hoped to see a "
            "miracle, then mocked him and sent him back to Pilate."),
        "moment": {"title": "The oath at the birthday feast", "reference": "Mark 6:22-27"},
        "traits": ["Weakness", "Pride", "Fear of what others think", "Curiosity without repentance"],
        "end": "Exiled by the emperor Caligula to Gaul in AD 39 (Josephus, Antiquities 18.7.2).",
        "lesson": "Keeping face can cost a soul. Herod heard the truth gladly but would not act on it.",
        "told_in": ["Mark 6:14-29", "Luke 13:31-32", "Luke 23:6-12"],
        "key_verses": ["Mark 6:20", "Mark 6:26"],
        "faced": ["john-the-baptist"],
        "peoples": ["edomites", "romans", "israelites"],
    },
    {
        "name": "Caiaphas",
        "epithet": "The high priest who plotted",
        "testament": "New",
        "era": "High priest c. AD 18–36",
        "books": ["Matthew", "John", "Acts"],
        "summary": "The high priest who reasoned that it was 'expedient… that one man should die for the people' and led the trial that condemned Jesus.",
        "story": (
            "After Jesus raised Lazarus, the council feared the Romans would take away 'our place "
            "and nation'. Caiaphas answered that it was better for one man to die than for the whole "
            "nation to perish — unknowingly prophesying the meaning of the cross. He presided at the "
            "night trial, and when Jesus said he was the Christ and would be seen at the right hand "
            "of power, Caiaphas tore his clothes and declared it blasphemy. He later questioned Peter "
            "and John after they healed a lame man."),
        "moment": {"title": "'One man should die for the people'", "reference": "John 11:49-50"},
        "traits": ["Political calculation", "Protecting position", "Religious pride"],
        "end": "Removed from office by the Roman governor Vitellius in AD 36 (Josephus). An ornate ossuary inscribed 'Joseph son of Caiaphas', found in Jerusalem in 1990, may be his.",
        "lesson": "Religion can be used to protect power instead of seeking truth. Yet God turned Caiaphas' scheme into the salvation he spoke of.",
        "told_in": ["John 11:47-53", "Matthew 26:57-68", "Acts 4:5-7"],
        "key_verses": ["John 11:50", "Matthew 26:65"],
        "faced": ["peter"],
        "peoples": ["israelites", "romans"],
    },
    {
        "name": "Judas Iscariot",
        "epithet": "The betrayer",
        "testament": "New",
        "era": "Died c. AD 30",
        "books": ["Matthew", "Mark", "Luke", "John", "Acts"],
        "summary": "One of the twelve apostles, the group's treasurer, who betrayed Jesus to the chief priests for thirty pieces of silver.",
        "story": (
            "Judas was chosen as one of the twelve and kept the money bag — and, John says, stole "
            "from it. When Mary anointed Jesus with costly ointment, Judas complained it should have "
            "been sold. He went to the chief priests and asked, 'What will ye give me?' They weighed "
            "out thirty pieces of silver. At the Last Supper Jesus told him, 'That thou doest, do "
            "quickly.' In Gethsemane Judas led the soldiers and identified Jesus with a kiss."),
        "moment": {"title": "The kiss in Gethsemane", "reference": "Luke 22:47-48"},
        "traits": ["Greed", "Hypocrisy", "Betrayal of a friend", "Despair"],
        "end": "Seeing Jesus condemned, he was seized with remorse, threw the silver down in the Temple and hanged himself; the money bought the potter's field (Matthew 27:3-8; Acts 1:18-19).",
        "lesson": "It is possible to be near Jesus without belonging to him. Remorse without turning to God is not repentance — compare Peter, who also failed but came back.",
        "told_in": ["John 12:4-6", "Matthew 26:14-16", "Matthew 26:47-50", "Matthew 27:3-10"],
        "key_verses": ["Matthew 26:15", "Luke 22:48"],
        "faced": [],
        "peoples": ["israelites"],
    },
    {
        "name": "Pontius Pilate",
        "epithet": "The judge who washed his hands",
        "testament": "New",
        "era": "Governor of Judea AD 26–36",
        "books": ["Matthew", "Mark", "Luke", "John", "Acts", "1 Timothy"],
        "summary": "The Roman governor who found no fault in Jesus, yet handed him over to be crucified to satisfy the crowd.",
        "story": (
            "Pilate questioned Jesus — 'Art thou the King of the Jews?' — and asked 'What is truth?' "
            "He said three times that he found no fault in him, sent him to Herod, and offered to "
            "release him for Passover, but the crowd chose Barabbas. His wife warned him about a "
            "dream. When the crowd threatened that he was no friend of Caesar, Pilate washed his "
            "hands — 'I am innocent of the blood of this just person' — scourged Jesus and gave him "
            "to be crucified, with the title 'Jesus of Nazareth the King of the Jews' over the cross."),
        "moment": {"title": "Washing his hands", "reference": "Matthew 27:24-26"},
        "traits": ["Cowardice", "Political self-interest", "Cynicism about truth"],
        "end": "Recalled to Rome in AD 36 after violently suppressing a Samaritan gathering (Josephus, Antiquities 18.4.1–2). His name is kept in the Creeds: 'suffered under Pontius Pilate'.",
        "lesson": "Neutrality about Jesus is not possible, and washing your hands does not remove responsibility.",
        "told_in": ["Matthew 27:1-26", "Luke 23:1-25", "John 18:28-19:22"],
        "key_verses": ["John 18:38", "Matthew 27:24"],
        "faced": [],
        "peoples": ["romans", "israelites", "samaritans"],
    },
    {
        "name": "Satan",
        "epithet": "The adversary",
        "testament": "Both",
        "era": "From the beginning to the end",
        "books": ["Genesis", "Job", "Zechariah", "Matthew", "Luke", "John", "2 Corinthians", "Ephesians", "James", "1 Peter", "Revelation"],
        "summary": "The devil, the accuser and deceiver, who tempted Eve, tested Job and Jesus, and whose final defeat Scripture promises.",
        "story": (
            "Satan means 'adversary'. In Eden the serpent questioned God's word — 'Yea, hath God "
            "said?' — and deceived Eve. In Job he accuses a righteous man before God, and in "
            "Zechariah he stands to resist the high priest. He tempted Jesus in the wilderness for "
            "forty days and was answered each time with 'It is written'. Jesus called him 'a liar, "
            "and the father of it'. He entered Judas; he 'walketh about, seeking whom he may "
            "devour'. Revelation shows the dragon cast down and finally thrown into the lake of fire."),
        "moment": {"title": "The temptation in the wilderness", "reference": "Matthew 4:1-11"},
        "traits": ["Deception", "Accusation", "Pride", "Hatred of God's people"],
        "end": "Defeated at the cross (Colossians 2:15; Hebrews 2:14) and, at the end, 'cast into the lake of fire and brimstone' (Revelation 20:10).",
        "lesson": "Resist him with God's Word and in God's armour: 'Resist the devil, and he will flee from you.' His defeat is already certain.",
        "told_in": ["Genesis 3:1-15", "Job 1-2", "Matthew 4:1-11", "Revelation 12", "Revelation 20:1-10"],
        "key_verses": ["Genesis 3:1", "John 8:44", "1 Peter 5:8", "James 4:7"],
        "faced": ["job", "peter"],
        "peoples": [],
    },
]
