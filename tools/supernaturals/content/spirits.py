"""The spirit world: demons cast out, magic and sorcery, signs, wonders and angels.

Same fields as miracles.py. For Magic and sorcery, `by` is who practised it or
was involved, and `meaning` is what Scripture says about it. These entries
report what the Bible tells and how it judges it, never how anything was done.
"""

SPIRITS = [
    # ------------------------------------------------------------------ casting out demons
    {
        "name": "Saul's evil spirit and David's harp",
        "group": "Casting out demons",
        "testament": "Old",
        "epithet": "The harp that brought relief",
        "by": [{"name": "David, with his harp", "hero": "david"}],
        "with": [{"name": "Saul", "hero": "saul"}],
        "for": "King Saul",
        "where": "Saul's court",
        "told_in": "1 Samuel 16:14-23",
        "also_in": ["1 Samuel 18:10-11"],
        "summary": "After the Spirit of the LORD left Saul, an evil spirit troubled him, and young David's harp brought him relief.",
        "story": (
            "'The Spirit of the LORD departed from Saul, and an evil spirit from the LORD troubled "
            "him.' His servants suggested a skilful harp player, and one of them knew a son of "
            "Jesse: a musician, a mighty man of valour, prudent, 'and the LORD is with him'. So "
            "David came into Saul's service. Whenever the evil spirit came on Saul, David played, "
            "'so Saul was refreshed, and was well, and the evil spirit departed from him.'"),
        "meaning": (
            "Scripture says plainly that even this spirit was under God's hand, a judgement on "
            "Saul's disobedience. Music brought relief but not repentance; later the same spirit "
            "drove Saul to hurl his javelin at David (1 Samuel 18:10-11)."),
        "lesson": "Worship can bring real relief, but it cannot replace obedience. Saul needed repentance, not only a song.",
        "key_verses": ["1 Samuel 16:14", "1 Samuel 16:23"],
    },
    {
        "name": "The man in the synagogue",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "Hold thy peace, and come out",
        "by": [{"name": "Jesus"}],
        "for": "A man with an unclean spirit",
        "where": "The synagogue at Capernaum",
        "told_in": "Mark 1:21-28",
        "also_in": ["Luke 4:31-37"],
        "summary": "In the middle of a sabbath service an unclean spirit cried out that it knew who Jesus was, and Jesus silenced it and cast it out.",
        "story": (
            "The people were astonished at Jesus' teaching, 'for he taught them as one that had "
            "authority'. Then a man with an unclean spirit cried out: 'Let us alone; what have we "
            "to do with thee, thou Jesus of Nazareth? art thou come to destroy us? I know thee who "
            "thou art, the Holy One of God.' Jesus rebuked him: 'Hold thy peace, and come out of "
            "him.' The spirit threw the man into convulsions, cried with a loud voice, and came out."),
        "meaning": (
            "Mark's first miracle is a deliverance. The demons knew exactly who Jesus was, and the "
            "people marvelled: 'with authority commandeth he even the unclean spirits, and they do "
            "obey him' (Mark 1:27)."),
        "lesson": "Knowing who Jesus is is not the same as following him. Even the demons know (James 2:19).",
        "key_verses": ["Mark 1:24-25", "Mark 1:27"],
    },
    {
        "name": "Legion",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "My name is Legion",
        "by": [{"name": "Jesus"}],
        "for": "A man living among the tombs",
        "where": "The country of the Gadarenes",
        "told_in": "Mark 5:1-20",
        "also_in": ["Matthew 8:28-34", "Luke 8:26-39"],
        "summary": "A man possessed by many demons, living among the tombs, was set free when Jesus sent them into a herd of pigs.",
        "story": (
            "He lived among the tombs, too strong for any chain, crying and cutting himself with "
            "stones night and day. Seeing Jesus far off, he ran and worshipped him. Asked his name, "
            "the spirit answered, 'My name is Legion: for we are many.' They begged to go into a "
            "herd of about two thousand swine; Jesus let them, and the herd ran violently down a "
            "steep place into the sea. The townspeople found the man 'sitting, and clothed, and in "
            "his right mind', and in fear begged Jesus to leave. The man wanted to go with him, but "
            "Jesus sent him home: 'tell them how great things the Lord hath done for thee.'"),
        "meaning": (
            "No one could bind him, but one word from Jesus set him free. He became the first "
            "messenger of Jesus in the Gentile towns of the Decapolis (Mark 5:20)."),
        "lesson": "No one is beyond Jesus' reach. And the best witness often starts at home: tell them what the Lord has done for you.",
        "key_verses": ["Mark 5:9", "Mark 5:15", "Mark 5:19"],
    },
    {
        "name": "The Syrophenician woman's daughter",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "The dogs eat of the children's crumbs",
        "by": [{"name": "Jesus"}],
        "for": "A Gentile mother's daughter",
        "where": "The borders of Tyre and Sidon",
        "told_in": "Mark 7:24-30",
        "also_in": ["Matthew 15:21-28"],
        "summary": "A Gentile mother begged Jesus to free her daughter, answered his hard reply with humble faith, and went home to find the girl well.",
        "story": (
            "A Greek woman, a Syrophenician by nation, fell at Jesus' feet and begged him to cast "
            "the devil out of her daughter. Jesus said, 'Let the children first be filled: for it "
            "is not meet to take the children's bread, and to cast it unto the dogs.' She answered, "
            "'Yes, Lord: yet the dogs under the table eat of the children's crumbs.' 'For this "
            "saying go thy way; the devil is gone out of thy daughter.' She went home and found her "
            "daughter lying on the bed, and the devil gone."),
        "meaning": (
            "The deliverance happened at a distance, for a Gentile, in Gentile country. Matthew "
            "records Jesus' verdict: 'O woman, great is thy faith' (Matthew 15:28)."),
        "lesson": "Humble, persistent faith does not argue its worth. It holds on to the Master's mercy.",
        "key_verses": ["Mark 7:28-29"],
    },
    {
        "name": "The boy the disciples could not free",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "Help thou mine unbelief",
        "by": [{"name": "Jesus"}],
        "for": "A father's son, troubled by a spirit since childhood",
        "where": "At the foot of the mountain of the Transfiguration",
        "told_in": "Mark 9:14-29",
        "also_in": ["Matthew 17:14-21", "Luke 9:37-43"],
        "summary": "While Jesus was on the mountain, his disciples failed to free a boy. His father's honest prayer met Jesus' power.",
        "story": (
            "Coming down from the mountain, Jesus found his disciples arguing with scribes. A father "
            "had brought his son, seized since childhood by a spirit that threw him into fire and "
            "water, and the disciples could not cast it out. 'If thou canst do any thing, have "
            "compassion on us, and help us.' Jesus replied, 'If thou canst believe, all things are "
            "possible to him that believeth.' The father cried out with tears, 'Lord, I believe; "
            "help thou mine unbelief.' Jesus rebuked the spirit, which came out leaving the boy as "
            "if dead; Jesus took him by the hand and lifted him up."),
        "meaning": (
            "Asked why they had failed, Jesus told the disciples, 'This kind can come forth by "
            "nothing, but by prayer and fasting' (Mark 9:29)."),
        "lesson": "Honest faith is enough to begin with. Bring your doubt to Jesus and ask him to help it.",
        "key_verses": ["Mark 9:23-24", "Mark 9:29"],
    },
    {
        "name": "Mary Magdalene set free",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "Out of whom went seven devils",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Mary Magdalene", "hero": "mary-magdalene"}],
        "for": "Mary, called Magdalene",
        "where": "Galilee",
        "told_in": "Luke 8:1-3",
        "also_in": ["Mark 16:9"],
        "summary": "Mary Magdalene had been freed from seven devils, and she became one of Jesus' most faithful followers, the first to see him risen.",
        "story": (
            "Luke mentions her almost in passing: travelling with Jesus and the twelve were 'certain "
            "women, which had been healed of evil spirits and infirmities, Mary called Magdalene, "
            "out of whom went seven devils'. With Joanna, Susanna and others she supported Jesus "
            "from her own means. She stood by the cross, watched where he was laid, and was first "
            "at the empty tomb."),
        "meaning": (
            "The Gospels never tell the story of her deliverance, only what came after it. Mark says "
            "the risen Jesus 'appeared first to Mary Magdalene, out of whom he had cast seven "
            "devils' (Mark 16:9)."),
        "lesson": "Your past is not the end of your story. The one set free of seven devils became the first witness of the resurrection.",
        "key_verses": ["Luke 8:2", "Mark 16:9"],
    },
    {
        "name": "A house divided",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "By the Spirit of God",
        "by": [{"name": "Jesus"}],
        "for": "A blind and dumb man possessed with a devil",
        "where": "Galilee",
        "told_in": "Matthew 12:22-30",
        "also_in": ["Mark 3:22-27", "Luke 11:14-23"],
        "summary": "When Jesus freed a blind and mute man, the Pharisees claimed he did it by the prince of the devils.",
        "story": (
            "The man could neither see nor speak until Jesus freed him, and the people asked, 'Is "
            "not this the son of David?' The Pharisees said he cast out devils 'but by Beelzebub "
            "the prince of the devils'. Jesus answered that 'every kingdom divided against itself "
            "is brought to desolation', so Satan would not cast out Satan. 'But if I cast out devils "
            "by the Spirit of God, then the kingdom of God is come unto you.' No one can spoil a "
            "strong man's house without first binding the strong man."),
        "meaning": (
            "Jesus' deliverances were not tricks. They were signs of the kingdom breaking in: he "
            "had come to bind the strong man and set his captives free."),
        "lesson": "'He that is not with me is against me' (Matthew 12:30). There is no neutral ground between Christ and Satan.",
        "key_verses": ["Matthew 12:26", "Matthew 12:28"],
    },
    {
        "name": "The slave girl at Philippi",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "A spirit of divination",
        "by": [{"name": "Paul, in the name of Jesus Christ", "hero": "paul"}],
        "for": "A slave girl whose owners profited from her fortune-telling",
        "where": "Philippi",
        "told_in": "Acts 16:16-24",
        "summary": "A slave girl who made money for her owners by fortune-telling followed Paul for days, until he cast the spirit out, and her owners had Paul beaten and jailed.",
        "story": (
            "She had 'a spirit of divination' and brought her masters much gain by soothsaying. "
            "For many days she followed Paul and his companions, crying, 'These men are the "
            "servants of the most high God, which shew unto us the way of salvation.' Paul, "
            "grieved, turned and said to the spirit, 'I command thee in the name of Jesus Christ to "
            "come out of her.' It came out the same hour. Her owners, seeing their profits gone, "
            "dragged Paul and Silas to the magistrates, who had them beaten and put in the stocks."),
        "meaning": (
            "What she said was true, but Paul would not have the gospel advertised by a spirit of "
            "divination. That night God shook the prison open, and the jailer and his household "
            "believed (Acts 16:25-34)."),
        "lesson": "One person's freedom cost someone else their profit. Doing right sometimes has a price.",
        "key_verses": ["Acts 16:18"],
    },
    {
        "name": "The sons of Sceva",
        "group": "Casting out demons",
        "testament": "New",
        "epithet": "Jesus I know, and Paul I know",
        "by": [{"name": "Seven sons of Sceva, who failed"}],
        "with": [{"name": "Paul", "hero": "paul"}],
        "for": "A man with an evil spirit",
        "where": "Ephesus",
        "told_in": "Acts 19:11-17",
        "summary": "Seven sons of a Jewish priest tried to use Jesus' name as a spell. The evil spirit overpowered them, and they fled naked and wounded.",
        "story": (
            "God did special miracles by the hands of Paul at Ephesus. Some travelling Jewish "
            "exorcists tried to use the same name: 'We adjure you by Jesus whom Paul preacheth.' "
            "The evil spirit answered, 'Jesus I know, and Paul I know; but who are ye?' The man "
            "leapt on them and overpowered them, so that they fled out of that house naked and "
            "wounded."),
        "meaning": (
            "Jesus' name is not a magic word. Used by men who did not know him, it had no power. "
            "Fear fell on Ephesus, and the name of the Lord Jesus was magnified (Acts 19:17)."),
        "lesson": "It is not enough to know about Jesus. What matters is whether you know him.",
        "key_verses": ["Acts 19:15"],
    },

    # ------------------------------------------------------------------ magic and sorcery
    {
        "name": "The Law against sorcery",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "An abomination unto the LORD",
        "by": [{"name": "The LORD, through Moses", "hero": "moses"}],
        "for": "Israel, about to enter Canaan",
        "told_in": "Deuteronomy 18:9-15",
        "also_in": ["Leviticus 19:31", "Galatians 5:19-21"],
        "summary": "Before Israel entered Canaan, God forbade every kind of divination, sorcery, spell and consulting of the dead.",
        "story": (
            "Moses listed the practices of the nations Israel was about to replace: making children "
            "pass through the fire, divination, observing times, enchanters, witches, charmers, "
            "consulters with familiar spirits, wizards and necromancers. 'For all that do these "
            "things are an abomination unto the LORD.' Instead of seeking hidden knowledge, Israel "
            "was to listen to the Prophet God would raise up."),
        "meaning": (
            "The Bible never treats the occult as harmless. Seeking power or knowledge from spirits, "
            "the dead or the stars is turning away from the living God. In the New Testament, "
            "witchcraft is listed among 'the works of the flesh' (Galatians 5:19-20)."),
        "lesson": "God has not left us to guess. He has spoken through his prophets and, last of all, through his Son (Hebrews 1:1-2).",
        "key_verses": ["Deuteronomy 18:10-12", "Deuteronomy 18:15"],
    },
    {
        "name": "Pharaoh's magicians",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "This is the finger of God",
        "by": [{"name": "The magicians of Egypt"}],
        "with": [{"name": "Moses", "hero": "moses"}, {"name": "Pharaoh", "hero": "pharaoh"}],
        "for": "Pharaoh's court",
        "where": "Egypt",
        "told_in": "Exodus 7:8-13",
        "also_in": ["Exodus 7:20-22", "Exodus 8:16-19", "2 Timothy 3:8"],
        "summary": "Pharaoh's magicians copied Moses' first signs 'with their enchantments', until they could go no further and admitted, 'This is the finger of God.'",
        "story": (
            "When Aaron's rod became a serpent, Pharaoh called his wise men and sorcerers, and the "
            "magicians did the same with their enchantments; but Aaron's rod swallowed up theirs. "
            "They copied the water turned to blood and the frogs. But when Aaron struck the dust and "
            "it became lice, they could not: 'Then the magicians said unto Pharaoh, This is the "
            "finger of God.' Pharaoh still would not listen. Paul later names two of them, Jannes "
            "and Jambres, as men who 'withstood Moses'."),
        "meaning": (
            "The magicians could imitate for a while, but they could not undo a single plague; they "
            "only made things worse. The Bible does not pretend sorcery can do nothing, but it shows "
            "its limits, and that it is no match for God."),
        "lesson": "Counterfeit power runs out. The finger of God does not.",
        "key_verses": ["Exodus 7:12", "Exodus 8:19"],
    },
    {
        "name": "Balaam the soothsayer",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "No enchantment against Jacob",
        "by": [{"name": "Balaam, son of Beor", "hero": "balaam"}],
        "for": "Balak king of Moab, who wanted Israel cursed",
        "where": "The high places of Moab",
        "told_in": "Numbers 22:1-24:25",
        "also_in": ["Joshua 13:22", "2 Peter 2:15-16", "Revelation 2:14"],
        "summary": "A famous diviner was hired to curse Israel, but every time he opened his mouth, God turned the curse into a blessing.",
        "story": (
            "Balak king of Moab, afraid of Israel, sent 'the rewards of divination' to hire Balaam "
            "to curse them. God told Balaam, 'thou shalt not curse the people: for they are "
            "blessed.' Three times Balak built altars on high places, and three times Balaam blessed "
            "Israel instead: 'Surely there is no enchantment against Jacob, neither is there any "
            "divination against Israel.' The last time he did not even go 'to seek for "
            "enchantments', and he ended by foretelling a Star out of Jacob."),
        "meaning": (
            "No curse can stick to people God has blessed. Yet Balaam 'loved the wages of "
            "unrighteousness' (2 Peter 2:15), taught Balak how to lead Israel into sin "
            "(Revelation 2:14), and died among Israel's enemies. Joshua remembers him simply as "
            "'Balaam also the son of Beor, the soothsayer' (Joshua 13:22)."),
        "lesson": "No spell can undo God's blessing. The real danger is not a curse from outside but compromise from within.",
        "key_verses": ["Numbers 23:23", "Numbers 24:17"],
    },
    {
        "name": "The witch of Endor",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "A woman that hath a familiar spirit",
        "by": [{"name": "A medium at Endor"}],
        "with": [{"name": "Saul", "hero": "saul"}, {"name": "Samuel", "hero": "samuel"}],
        "for": "King Saul, on the eve of his last battle",
        "where": "Endor",
        "told_in": "1 Samuel 28:3-25",
        "also_in": ["1 Chronicles 10:13-14"],
        "summary": "Abandoned by God and terrified of the Philistines, King Saul broke his own law and went in disguise to a medium to call up the dead prophet Samuel.",
        "story": (
            "Samuel was dead, and Saul had put the mediums and wizards out of the land. But with the "
            "Philistine army gathered and no answer from God, 'neither by dreams nor by Urim, nor "
            "by prophets', Saul went by night in disguise to a woman at Endor who had a familiar "
            "spirit. When she saw Samuel she cried out with a loud voice. Samuel told Saul the LORD "
            "had torn the kingdom from him, and 'to morrow shalt thou and thy sons be with me'. Saul "
            "fell full length on the ground, and the next day he died on Mount Gilboa."),
        "meaning": (
            "Scripture gives the verdict plainly: Saul died 'for asking counsel of one that had a "
            "familiar spirit, to enquire of it', and because he 'enquired not of the LORD' "
            "(1 Chronicles 10:13-14). "
            "Seeking the dead was the last step of a king who had long stopped obeying the living "
            "God."),
        "lesson": "When God seems silent, don't turn to forbidden sources. Turn back to him.",
        "key_verses": ["1 Samuel 28:7", "1 Chronicles 10:13-14"],
    },
    {
        "name": "Manasseh's witchcraft",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "He used enchantments",
        "by": [{"name": "Manasseh, king of Judah", "hero": "manasseh"}],
        "for": "Judah, led astray",
        "where": "Jerusalem",
        "told_in": "2 Chronicles 33:1-20",
        "also_in": ["2 Kings 21:1-18"],
        "summary": "Judah's worst king filled Jerusalem with idols and the occult, yet when he humbled himself in chains, God heard him.",
        "story": (
            "Manasseh became king at twelve and undid his father Hezekiah's reforms. He built altars "
            "to Baal and to the host of heaven in the temple courts, made his children pass through "
            "the fire, and 'observed times, and used enchantments, and used witchcraft, and dealt "
            "with a familiar spirit, and with wizards'. God sent the Assyrians, who took him in "
            "chains to Babylon. There, in affliction, he humbled himself greatly and prayed, and God "
            "heard him and brought him back to Jerusalem. 'Then Manasseh knew that the LORD he was "
            "God.'"),
        "meaning": (
            "His sins are named among the reasons for Judah's exile (2 Kings 21:10-15). His "
            "repentance is one of the most astonishing in the Bible: no one is too deep in darkness "
            "for God to hear a humble prayer."),
        "lesson": "The occult binds, but God can free even the one who went furthest into it.",
        "key_verses": ["2 Chronicles 33:6", "2 Chronicles 33:12-13"],
    },
    {
        "name": "The wise men of Babylon",
        "group": "Magic and sorcery",
        "testament": "Old",
        "epithet": "A God in heaven that revealeth secrets",
        "by": [{"name": "Babylon's magicians, astrologers and sorcerers"}],
        "with": [{"name": "Daniel", "hero": "daniel"}, {"name": "Nebuchadnezzar", "hero": "nebuchadnezzar"}],
        "for": "King Nebuchadnezzar",
        "where": "Babylon",
        "told_in": "Daniel 2:1-30",
        "also_in": ["Daniel 5:7-17"],
        "summary": "Babylon's magicians, astrologers and sorcerers could not tell the king his dream, but Daniel's God could.",
        "story": (
            "Nebuchadnezzar had a troubling dream and demanded that his magicians, astrologers, "
            "sorcerers and Chaldeans tell him both the dream and its meaning, on pain of death. They "
            "protested, 'There is not a man upon the earth that can shew the king's matter.' Daniel "
            "and his friends prayed, and God revealed the secret to Daniel in a night vision. Before "
            "the king, Daniel gave God the credit: 'there is a God in heaven that revealeth "
            "secrets.' Years later Belshazzar's wise men also failed to read the writing on the "
            "wall, and Daniel was sent for again."),
        "meaning": (
            "The best occult experts of the greatest empire were helpless before a real revelation. "
            "The Bible's answer to divination is not a better technique but the God who speaks."),
        "lesson": "The secret things belong to God (Deuteronomy 29:29). Ask him, not the stars.",
        "key_verses": ["Daniel 2:27-28"],
    },
    {
        "name": "Simon the sorcerer",
        "group": "Magic and sorcery",
        "testament": "New",
        "epithet": "Thy money perish with thee",
        "by": [{"name": "Simon, a sorcerer of Samaria"}],
        "with": [{"name": "Philip"}, {"name": "Peter", "hero": "peter"}],
        "for": "The city of Samaria",
        "where": "Samaria",
        "told_in": "Acts 8:9-24",
        "summary": "A famous magician of Samaria believed and was baptised, then tried to buy the power to give the Holy Spirit.",
        "story": (
            "Simon had amazed Samaria with his sorceries for a long time, and people called him "
            "'the great power of God'. When Philip preached Christ, Simon too believed and was "
            "baptised, and followed Philip, astonished at the miracles. But when he saw the Holy "
            "Ghost given through the apostles' hands, he offered them money. Peter answered, 'Thy "
            "money perish with thee, because thou hast thought that the gift of God may be purchased "
            "with money,' and told him to repent and pray."),
        "meaning": (
            "Simon still thought like a magician: power was something to acquire and control. The "
            "gift of God cannot be bought or used for our own greatness. His name lives on in the "
            "word 'simony', the buying of church office."),
        "lesson": "God's gifts are received by grace, not bought or earned, and never used to make ourselves great.",
        "key_verses": ["Acts 8:20", "Acts 8:22"],
    },
    {
        "name": "Elymas struck blind",
        "group": "Magic and sorcery",
        "testament": "New",
        "epithet": "Thou child of the devil",
        "by": [{"name": "Elymas (Bar-jesus), a sorcerer"}],
        "with": [{"name": "Paul", "hero": "paul"}],
        "for": "Sergius Paulus, the governor of Cyprus",
        "where": "Paphos, on Cyprus",
        "told_in": "Acts 13:6-12",
        "summary": "A sorcerer tried to turn the governor of Cyprus away from the faith. Paul struck him blind, and the governor believed.",
        "story": (
            "At Paphos a Jewish sorcerer and false prophet named Bar-jesus, or Elymas, was with the "
            "governor Sergius Paulus. When the governor sent for Barnabas and Saul to hear the word "
            "of God, Elymas tried to turn him from the faith. Paul, filled with the Holy Ghost, "
            "looked at him: 'O full of all subtilty and all mischief, thou child of the devil… thou "
            "shalt be blind, not seeing the sun for a season.' A mist and darkness fell on him, and "
            "he went about seeking someone to lead him by the hand. The governor believed, "
            "astonished at the doctrine of the Lord."),
        "meaning": (
            "This is where Luke first calls Saul by the name Paul (Acts 13:9). Paul, once struck "
            "blind himself on the Damascus road, now saw a blindness 'for a season' fall on a man "
            "who opposed the gospel."),
        "lesson": "Opposing the truth leaves a person groping in the dark. The light of God's word can reach even a Roman governor.",
        "key_verses": ["Acts 13:10-11", "Acts 13:12"],
    },
    {
        "name": "The books burned at Ephesus",
        "group": "Magic and sorcery",
        "testament": "New",
        "epithet": "Fifty thousand pieces of silver",
        "by": [{"name": "The new believers of Ephesus"}],
        "with": [{"name": "Paul", "hero": "paul"}],
        "for": "Ephesus",
        "where": "Ephesus",
        "told_in": "Acts 19:17-20",
        "summary": "New believers in Ephesus confessed their magic practices and publicly burned their books, worth fifty thousand pieces of silver.",
        "story": (
            "After the sons of Sceva were beaten, fear fell on the Jews and Greeks of Ephesus, and "
            "the name of the Lord Jesus was magnified. Many believers came and 'confessed, and "
            "shewed their deeds'. Many who had practised 'curious arts' brought their books together "
            "and burned them in front of everyone. They counted the price: fifty thousand pieces of "
            "silver. 'So mightily grew the word of God and prevailed.'"),
        "meaning": (
            "Ephesus was famous for magic. Real conversion meant a clean break, whatever it cost, "
            "not keeping the old books “just in case”."),
        "lesson": "Following Jesus means letting go of other sources of power, even costly ones.",
        "key_verses": ["Acts 19:19-20"],
    },

    # ------------------------------------------------------------------ signs, wonders and angels
    {
        "name": "The burning bush",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "The bush was not consumed",
        "by": [{"name": "The angel of the LORD"}],
        "with": [{"name": "Moses", "hero": "moses"}],
        "for": "Moses, a shepherd in Midian",
        "where": "Horeb, the mountain of God",
        "told_in": "Exodus 3:1-14",
        "also_in": ["Mark 12:26-27"],
        "summary": "A bush burned in the desert without burning up, and from it God called Moses by name and revealed his name: I AM THAT I AM.",
        "story": (
            "Moses was keeping his father-in-law's flock near Horeb when the angel of the LORD "
            "appeared to him in a flame of fire out of a bush. 'The bush burned with fire, and the "
            "bush was not consumed.' When he turned aside to look, God called, 'Moses, Moses', and "
            "told him to take off his shoes, for the ground was holy. God said he had seen his "
            "people's affliction and was sending Moses to Pharaoh. When Moses asked his name, God "
            "said, 'I AM THAT I AM.'"),
        "meaning": (
            "The fire that did not destroy the bush pictures God's holy presence dwelling with his "
            "people without consuming them. Jesus used this passage to prove the resurrection: God "
            "'is not the God of the dead, but the God of the living' (Mark 12:27)."),
        "lesson": "Turn aside and listen. God often speaks when we stop to notice what he is doing.",
        "key_verses": ["Exodus 3:2", "Exodus 3:14"],
    },
    {
        "name": "The pillar of cloud and fire",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "He took not away the pillar",
        "by": [{"name": "The LORD"}],
        "with": [{"name": "Moses", "hero": "moses"}],
        "for": "Israel in the wilderness",
        "where": "From Egypt to the Jordan",
        "told_in": "Exodus 13:17-22",
        "also_in": ["Exodus 14:19-20", "Numbers 9:15-23", "Nehemiah 9:19"],
        "summary": "God led Israel through the wilderness by a pillar of cloud by day and a pillar of fire by night.",
        "story": (
            "When Israel left Egypt, 'the LORD went before them by day in a pillar of a cloud, to "
            "lead them the way; and by night in a pillar of fire, to give them light'. At the Red "
            "Sea the pillar moved behind them, darkness to the Egyptians and light to Israel. Later "
            "it rested over the tabernacle: when the cloud lifted they set out, and when it stayed "
            "they stayed, whether two days, a month or a year."),
        "meaning": (
            "The pillar was God's visible presence and guidance, never taken away (Exodus 13:22). "
            "Centuries later Nehemiah still praised God for it: 'the pillar of the cloud departed "
            "not from them by day' (Nehemiah 9:19)."),
        "lesson": "Move when God moves and wait when he waits. His guidance is as faithful as the pillar.",
        "key_verses": ["Exodus 13:21-22"],
    },
    {
        "name": "Balaam's donkey speaks",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "The dumb ass speaking with man's voice",
        "by": [{"name": "The LORD, and the angel in the way"}],
        "with": [{"name": "Balaam", "hero": "balaam"}],
        "for": "Balaam, on his way to curse Israel",
        "where": "A narrow path between vineyard walls",
        "told_in": "Numbers 22:21-35",
        "also_in": ["2 Peter 2:16"],
        "summary": "An angel with a drawn sword blocked Balaam's road. His donkey saw it; he did not, and when he beat her, God let the donkey speak.",
        "story": (
            "Balaam rode off to meet Balak, and the angel of the LORD stood in the way with a drawn "
            "sword. The donkey saw the angel and turned aside three times, crushing Balaam's foot "
            "against a wall and at last lying down; three times Balaam beat her. 'And the LORD "
            "opened the mouth of the ass', and she said, 'What have I done unto thee, that thou "
            "hast smitten me these three times?' Then the LORD opened Balaam's eyes, and he saw the "
            "angel and bowed down."),
        "meaning": (
            "A donkey saw what a famous seer could not. Peter remembers it: 'the dumb ass speaking "
            "with man's voice forbad the madness of the prophet' (2 Peter 2:16)."),
        "lesson": "Pay attention when God puts obstacles in your road. They may be saving your life.",
        "key_verses": ["Numbers 22:28", "Numbers 22:31"],
    },
    {
        "name": "The fourth man in the fire",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "Like the Son of God",
        "by": [{"name": "God, who sent his angel"}],
        "with": [{"name": "Shadrach, Meshach and Abednego", "hero": "shadrach-meshach-and-abednego"},
                 {"name": "Nebuchadnezzar", "hero": "nebuchadnezzar"}],
        "for": "Shadrach, Meshach and Abednego",
        "where": "The plain of Dura, Babylon",
        "told_in": "Daniel 3:1-30",
        "summary": "Three young Hebrews refused to bow to a golden image and were thrown into a blazing furnace, where a fourth figure walked with them.",
        "story": (
            "Nebuchadnezzar set up a golden image on the plain of Dura and ordered everyone to bow at "
            "the sound of the music. Shadrach, Meshach and Abednego refused: their God was able to "
            "deliver them, 'But if not… we will not serve thy gods.' The furnace was heated seven "
            "times hotter and they were thrown in bound. The king looked in, astonished: 'Lo, I see "
            "four men loose, walking in the midst of the fire, and they have no hurt; and the form "
            "of the fourth is like the Son of God.' They came out without even the smell of fire on "
            "them."),
        "meaning": (
            "God did not keep them out of the fire; he met them in it. The king who demanded worship "
            "ended by blessing their God, 'who hath sent his angel, and delivered his servants' "
            "(Daniel 3:28)."),
        "lesson": "Trust God enough to obey him 'if not'. He walks with his people in the furnace.",
        "key_verses": ["Daniel 3:17-18", "Daniel 3:25"],
    },
    {
        "name": "The writing on the wall",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "Weighed in the balances",
        "by": [{"name": "The fingers of a man's hand"}],
        "with": [{"name": "Daniel", "hero": "daniel"}],
        "for": "King Belshazzar of Babylon",
        "where": "Belshazzar's palace, Babylon",
        "told_in": "Daniel 5:1-31",
        "summary": "At a drunken feast using the temple's holy vessels, a hand appeared and wrote on the palace wall. That night Babylon fell.",
        "story": (
            "Belshazzar held a great feast and drank from the gold and silver vessels taken from "
            "God's temple in Jerusalem, praising gods of gold and silver. 'In the same hour came "
            "forth fingers of a man's hand, and wrote' on the plaster of the wall, and the king's "
            "knees knocked together. His wise men could not read it, so Daniel was brought in. He "
            "read it, MENE, MENE, TEKEL, UPHARSIN: 'Thou art weighed in the balances, and art found "
            "wanting.' That night Belshazzar was slain, and Darius the Median took the kingdom."),
        "meaning": (
            "Belshazzar knew what had happened to Nebuchadnezzar and still did not humble his heart "
            "(Daniel 5:22). The hand on the wall gave our language the phrase “the writing on the "
            "wall”."),
        "lesson": "Every life is weighed by God. Humble yourself before the verdict is written.",
        "key_verses": ["Daniel 5:5", "Daniel 5:27"],
    },
    {
        "name": "Daniel in the lions' den",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "My God hath sent his angel",
        "by": [{"name": "God, who sent his angel"}],
        "with": [{"name": "Daniel", "hero": "daniel"}],
        "for": "Daniel, who would not stop praying",
        "where": "Babylon, under King Darius",
        "told_in": "Daniel 6:1-28",
        "also_in": ["Hebrews 11:33"],
        "summary": "Daniel kept praying to God despite a royal ban, was thrown to the lions, and was found unhurt in the morning.",
        "story": (
            "Jealous officials persuaded King Darius to forbid prayer to anyone but the king for "
            "thirty days. Daniel went home, opened his windows toward Jerusalem, and prayed three "
            "times a day, 'as he did aforetime'. He was thrown into the den of lions and a stone "
            "sealed over the mouth. The king spent a sleepless night and at dawn cried out, 'is thy "
            "God, whom thou servest continually, able to deliver thee from the lions?' Daniel "
            "answered, 'My God hath sent his angel, and hath shut the lions' mouths.'"),
        "meaning": (
            "Daniel's faithfulness was quiet and daily, not dramatic. Hebrews counts among the "
            "heroes of faith those who 'stopped the mouths of lions' (Hebrews 11:33)."),
        "lesson": "Keep your daily habits of prayer, especially when they become costly.",
        "key_verses": ["Daniel 6:10", "Daniel 6:22"],
    },
    {
        "name": "Gabriel comes to Mary",
        "group": "Signs, wonders and angels",
        "testament": "New",
        "epithet": "Be it unto me according to thy word",
        "by": [{"name": "The angel Gabriel"}],
        "with": [{"name": "Mary", "hero": "mary-mother-of-jesus"}],
        "for": "Mary, a young woman of Nazareth",
        "where": "Nazareth in Galilee",
        "told_in": "Luke 1:26-38",
        "summary": "The angel Gabriel told a young woman engaged to Joseph that she would conceive and bear the Son of God.",
        "story": (
            "God sent the angel Gabriel to Nazareth, to a virgin named Mary, espoused to Joseph of "
            "the house of David. 'Hail, thou that art highly favoured, the Lord is with thee.' She "
            "was troubled, but he said, 'Fear not, Mary', and told her she would bear a son called "
            "Jesus, who would reign on David's throne for ever. 'How shall this be, seeing I know "
            "not a man?' The Holy Ghost would come upon her, 'For with God nothing shall be "
            "impossible.' Mary answered, 'Behold the handmaid of the Lord; be it unto me according "
            "to thy word.'"),
        "meaning": (
            "The announcement of the greatest miracle, God becoming man, came quietly to one young "
            "woman in a small town. Her answer is a model of faith: willing before she understood."),
        "lesson": "'With God nothing shall be impossible.' Say yes to him, even before you see how.",
        "key_verses": ["Luke 1:37-38"],
    },
    {
        "name": "The transfiguration",
        "group": "Signs, wonders and angels",
        "testament": "New",
        "epithet": "This is my beloved Son: hear him",
        "by": [{"name": "Jesus, and the Father's voice"}],
        "with": [{"name": "Peter, James and John", "hero": "peter"}, {"name": "Moses and Elijah", "hero": "elijah"}],
        "for": "Peter, James and John",
        "where": "A high mountain",
        "told_in": "Mark 9:2-8",
        "also_in": ["Matthew 17:1-8", "Luke 9:28-36", "2 Peter 1:16-18"],
        "summary": "On a mountain Jesus was changed before three disciples, shining white, and Moses and Elijah talked with him.",
        "story": (
            "Jesus took Peter, James and John up a high mountain and was transfigured before them: "
            "'his raiment became shining, exceeding white as snow.' Elijah and Moses appeared, "
            "talking with him. Peter, not knowing what to say, offered to make three tabernacles. A "
            "cloud overshadowed them and a voice came out of it: 'This is my beloved Son: hear him.' "
            "Suddenly, looking round, they saw no one any more, only Jesus."),
        "meaning": (
            "Moses (the Law) and Elijah (the Prophets) stood with Jesus, and then only Jesus "
            "remained. Peter never forgot it: they 'were eyewitnesses of his majesty' "
            "(2 Peter 1:16)."),
        "lesson": "Of all the voices you could listen to, the Father says: hear him.",
        "key_verses": ["Mark 9:7"],
    },
    {
        "name": "Peter freed by an angel",
        "group": "Signs, wonders and angels",
        "testament": "New",
        "epithet": "Arise up quickly",
        "by": [{"name": "The angel of the Lord"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "for": "Peter, in prison awaiting execution",
        "where": "Jerusalem",
        "told_in": "Acts 12:1-17",
        "summary": "The night before his execution, Peter was woken by an angel, his chains fell off, and he walked out of prison while the church prayed.",
        "story": (
            "Herod had killed James and imprisoned Peter under four quaternions of soldiers, 'but "
            "prayer was made without ceasing of the church unto God for him'. That night Peter "
            "slept chained between two soldiers. An angel struck him on the side and woke him: "
            "'Arise up quickly.' The chains fell off, and they passed the guards to the iron gate, "
            "which opened of its own accord. Peter went to the house where the church was praying. "
            "The girl Rhoda was so glad to hear his voice that she forgot to open the door, and "
            "they told her, 'Thou art mad.'"),
        "meaning": (
            "The church prayed for Peter, then could hardly believe the answer when it knocked on "
            "the door. God is often kinder than our faith expects."),
        "lesson": "Keep praying without ceasing, and be ready to open the door when the answer comes.",
        "key_verses": ["Acts 12:5", "Acts 12:7"],
    },
    {
        "name": "Elijah taken up",
        "group": "Signs, wonders and angels",
        "testament": "Old",
        "epithet": "A chariot of fire",
        "by": [{"name": "The LORD"}],
        "with": [{"name": "Elijah", "hero": "elijah"}, {"name": "Elisha"}],
        "for": "Elijah, and Elisha who watched",
        "where": "Beyond the Jordan",
        "told_in": "2 Kings 2:1-14",
        "also_in": ["Malachi 4:5", "Matthew 11:14"],
        "summary": "Elijah did not die. A chariot and horses of fire parted him from Elisha, and he went up by a whirlwind into heaven.",
        "story": (
            "Elisha refused to leave his master, though Elijah told him three times to stay behind. "
            "At the Jordan, Elijah struck the water with his mantle and they crossed on dry ground. "
            "Elisha asked for a double portion of his spirit. As they walked and talked, 'there "
            "appeared a chariot of fire, and horses of fire', and Elijah went up by a whirlwind into "
            "heaven. Elisha cried, 'My father, my father, the chariot of Israel, and the horsemen "
            "thereof', took up the fallen mantle and struck the Jordan: the waters parted for him "
            "too."),
        "meaning": (
            "Only Enoch and Elijah are said to have been taken without dying (Genesis 5:24). Malachi "
            "promised that Elijah would come again, and Jesus said John the Baptist was 'Elias, "
            "which was for to come' (Matthew 11:14)."),
        "lesson": "God's work does not end when his servant goes. The mantle passes on.",
        "key_verses": ["2 Kings 2:11"],
    },
]
