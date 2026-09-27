"""Prayers: what Jesus taught about prayer, and Jesus at prayer.

Fields (all but name, group, testament, told_in and summary are optional):

  name, epithet   the prayer's name, and a line from it
  group           one of GROUPS in build_prayers.py
  testament       Old or New
  by              [{name, hero?}]: who prayed it or taught it (hero: an id on
                  heroes-and-villains.html); by_label replaces "Prayed by"
  occasion, where what it was prayed for, and where
  told_in         the passage; also_in: parallels and echoes
  prayed          references for the prayer's own words; the build adds the text
  summary         one sentence
  story           the story behind it
  meaning         what it teaches about prayer
  daily           how it fits into daily life today
  pray_it         a short prayer in our own modern words (not Scripture: no single quotes)
  key_verses      other verses to read with it; the build adds the text

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

JESUS = [
    # ------------------------------------------------------------------ Jesus teaches us to pray
    {
        "name": "The Lord's Prayer",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Our Father which art in heaven",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "A pattern for his disciples' prayers",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 6:5-15",
        "also_in": ["Luke 11:1-4"],
        "prayed": ["Matthew 6:9-13"],
        "summary": "The prayer Jesus gave his disciples as a pattern: God's name, kingdom and will first, then our bread, our forgiveness and our protection.",
        "story": (
            "In the Sermon on the Mount Jesus told his hearers not to pray like the hypocrites, to be seen, "
            "nor to pray with 'vain repetitions, as the heathen do.' Then: 'After this manner therefore pray "
            "ye: Our Father which art in heaven, Hallowed be thy name.' Luke records that on another "
            "occasion a disciple asked, 'Lord, teach us to pray', and Jesus gave the same prayer. (The "
            "closing words, 'For thine is the kingdom, and the power, and the glory, for ever', are not in the "
            "oldest manuscripts of Matthew; the King James Version keeps them.)"),
        "meaning": (
            "The prayer puts God first: his name, his kingdom, his will. Only then does it ask for daily "
            "needs, forgiveness and protection. It says 'our', not 'my', and it ties our being forgiven to "
            "our forgiving others (Matthew 6:14-15)."),
        "daily": (
            "The Lord's Prayer fits any day, prayed as it stands or used as an outline to fill with your "
            "own words. 'Give us this day our daily bread' asks for today's needs, not a lifetime's "
            "supply, so it is a prayer to pray again tomorrow."),
        "pray_it": "Father, may your name be honoured in my life today. Give me what I need for this day, forgive me as I forgive others, and keep me from evil.",
        "key_verses": ["Matthew 6:14"],
    },
    {
        "name": "Prayer in secret",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Enter into thy closet",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "Teaching against praying to be seen",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 6:5-8",
        "prayed": ["Matthew 6:6"],
        "summary": "Jesus warned against praying to be seen, and told his hearers to pray to their Father in secret.",
        "story": (
            "Some prayed standing in the synagogues and on street corners, 'that they may be seen of men.' "
            "Jesus said, 'They have their reward.' Instead: 'enter into thy closet, and when thou hast shut "
            "thy door, pray to thy Father which is in secret.' There is no need for many words, 'for your "
            "Father knoweth what things ye have need of, before ye ask him.'"),
        "meaning": (
            "Prayer is not a performance. God is not impressed by length or eloquence; he is a Father who "
            "already knows what we need, and wants us to come to him anyway."),
        "daily": (
            "Find a place and a time where no one is watching: a room, a walk, the first minutes of the "
            "morning. Shut the door on distractions, and speak to God simply."),
        "pray_it": "Father, you see me here where no one else does. You know what I need before I say it. I come to you just as I am.",
        "key_verses": ["Matthew 6:8"],
    },
    {
        "name": "Ask, seek, knock",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Ask, and it shall be given you",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "After teaching the Lord's Prayer",
        "told_in": "Luke 11:5-13",
        "also_in": ["Matthew 7:7-11"],
        "prayed": ["Luke 11:9-10"],
        "summary": "Through the story of a friend at midnight, Jesus taught persistence in prayer, and promised that the Father gives the Holy Spirit to those who ask.",
        "story": (
            "Jesus told of a man who knocked on a friend's door at midnight to borrow three loaves. The "
            "friend called out, 'Trouble me not', but got up and gave him what he needed 'because of his "
            "importunity', his shameless persistence. 'Ask, and it shall be given you; seek, and ye shall "
            "find; knock, and it shall be opened unto you.' If earthly fathers give good gifts, 'how much "
            "more shall your heavenly Father give the Holy Spirit to them that ask him?'"),
        "meaning": (
            "God is not a reluctant neighbour; the point of the story is 'how much more'. Persistence in "
            "prayer is not wearing God down, but staying close to him and continuing to trust."),
        "daily": (
            "Keep asking. Bring the same need back tomorrow, and the day after. Ask especially for the Holy "
            "Spirit, the gift Jesus promised the Father would give."),
        "pray_it": "Father, I keep knocking because I trust you. Give me what is good, and above all fill me with your Holy Spirit.",
        "key_verses": ["Luke 11:13"],
    },
    {
        "name": "The widow who would not give up",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Men ought always to pray, and not to faint",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "A parable about praying without losing heart",
        "told_in": "Luke 18:1-8",
        "prayed": ["Luke 18:1"],
        "summary": "A parable of a widow who kept asking an unjust judge for justice until he gave in, told so that we would always pray and not lose heart.",
        "story": (
            "Luke says plainly why Jesus told it: 'that men ought always to pray, and not to faint.' A judge "
            "who feared neither God nor man was pestered by a widow asking for justice. At last he said he "
            "would help her, 'lest by her continual coming she weary me.' Jesus said, 'shall not God avenge "
            "his own elect, which cry day and night unto him?' Then he asked, 'when the Son of man cometh, "
            "shall he find faith on the earth?'"),
        "meaning": (
            "Again the point is contrast: if an unjust judge gives in, how much more will a loving God hear "
            "his children. Faith shows itself by not giving up."),
        "daily": (
            "When an answer is slow in coming, keep praying rather than letting discouragement win. Praying "
            "day and night is the opposite of fainting."),
        "pray_it": "Lord, when your answer seems slow, keep me from losing heart. I will keep bringing this to you, because I trust that you hear.",
        "key_verses": ["Luke 18:7"],
    },
    {
        "name": "The Pharisee and the tax collector",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "God be merciful to me a sinner",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "A parable for those who trusted in their own righteousness",
        "where": "The temple, in the story",
        "told_in": "Luke 18:9-14",
        "prayed": ["Luke 18:13"],
        "summary": "Two men went up to the temple to pray: a Pharisee who thanked God he was not like others, and a tax collector who could only ask for mercy. The second went home justified.",
        "story": (
            "Jesus told this parable 'unto certain which trusted in themselves that they were righteous, and "
            "despised others.' The Pharisee stood and prayed 'with himself', listing his fasting and tithing "
            "and thanking God he was not like 'this publican.' The tax collector stood far off, would not "
            "even lift his eyes to heaven, beat his breast and said, 'God be merciful to me a sinner.' Jesus "
            "said, 'this man went down to his house justified rather than the other.'"),
        "meaning": (
            "God hears humility, not self-promotion: 'every one that exalteth himself shall be abased; and he "
            "that humbleth himself shall be exalted' (Luke 18:14)."),
        "daily": (
            "Before you pray, drop your comparisons with other people. The shortest prayer in this story was "
            "the one God accepted, and it can be prayed anywhere, at any moment."),
        "pray_it": "God, be merciful to me, a sinner. I have nothing to boast of; I come only asking for your mercy.",
        "key_verses": ["Luke 18:14"],
    },
    {
        "name": "Pray for your enemies",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Pray for them which despitefully use you",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "Teaching on love for enemies",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 5:43-48",
        "also_in": ["Luke 6:27-28"],
        "prayed": ["Matthew 5:44"],
        "summary": "Jesus told his followers to love their enemies and to pray for those who persecute them, because their Father in heaven is kind to all.",
        "story": (
            "People had heard it said, 'Thou shalt love thy neighbour, and hate thine enemy.' Jesus said, "
            "'Love your enemies, bless them that curse you, do good to them that hate you, and pray for them "
            "which despitefully use you, and persecute you.' The reason is the Father's own character: 'he "
            "maketh his sun to rise on the evil and on the good.'"),
        "meaning": (
            "Jesus did it himself on the cross (Luke 23:34), and Stephen did the same as he died (Acts "
            "7:60). Praying for an enemy changes the one who prays."),
        "daily": (
            "Name someone who has hurt you, and pray for their good, not only for your protection from them. "
            "It may be the hardest prayer of the day."),
        "pray_it": "Father, I bring you the person who has hurt me. Bless them, do them good, and change my heart toward them, as you are kind to all.",
        "key_verses": ["Matthew 5:45"],
    },
    {
        "name": "Where two or three are gathered",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "There am I in the midst of them",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "Teaching his disciples about life together",
        "told_in": "Matthew 18:15-20",
        "also_in": ["Acts 2:42"],
        "prayed": ["Matthew 18:19-20"],
        "summary": "Jesus promised that when two agree in prayer, and two or three gather in his name, he is with them.",
        "story": (
            "Speaking to his disciples about life together, Jesus said, 'if two of you shall agree on earth "
            "as touching any thing that they shall ask, it shall be done for them of my Father which is in "
            "heaven. For where two or three are gathered together in my name, there am I in the midst of "
            "them.'"),
        "meaning": (
            "Prayer is not only private. The first believers 'continued stedfastly' in prayers together "
            "(Acts 2:42), and Jesus promised his presence to even the smallest gathering."),
        "daily": (
            "Pray with someone: a husband or wife, a friend, a child, a colleague, even for two minutes. "
            "Agreeing together in prayer is one of the promises Jesus attached to it."),
        "pray_it": "Lord Jesus, you are here with us as we pray together. Hear what we agree to ask in your name.",
        "key_verses": ["Matthew 18:20"],
    },
    {
        "name": "The Lord of the harvest",
        "group": "Jesus teaches us to pray",
        "testament": "New",
        "epithet": "Pray ye therefore the Lord of the harvest",
        "by_label": "Taught by",
        "by": [{"name": "Jesus"}],
        "occasion": "Seeing the crowds like sheep without a shepherd",
        "where": "The towns of Galilee",
        "told_in": "Matthew 9:35-38",
        "also_in": ["Luke 10:2"],
        "prayed": ["Matthew 9:37-38"],
        "summary": "Moved with compassion for the crowds, Jesus told his disciples to pray that God would send workers out into his harvest.",
        "story": (
            "Jesus saw the multitudes scattered 'as sheep having no shepherd', and was moved with "
            "compassion. He said, 'The harvest truly is plenteous, but the labourers are few; Pray ye "
            "therefore the Lord of the harvest, that he will send forth labourers into his harvest.' In the "
            "very next chapter he sent out the twelve."),
        "meaning": (
            "Compassion leads to prayer, and prayer leads to action: the disciples who were told to pray for "
            "workers became the workers."),
        "daily": (
            "When you see a need you cannot meet, pray for God to send the right people, and be ready to be "
            "one of them."),
        "pray_it": "Lord of the harvest, the need around me is great. Send people to help, to care and to share the good news, and send me.",
        "key_verses": ["Matthew 9:36"],
    },
    # ------------------------------------------------------------------ Jesus at prayer
    {
        "name": "Before dawn",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "A great while before day",
        "by": [{"name": "Jesus"}],
        "occasion": "The morning after a day of healing",
        "where": "A solitary place near Capernaum",
        "told_in": "Mark 1:32-39",
        "also_in": ["Luke 5:16"],
        "summary": "After a long day of healing, Jesus rose before dawn and went to a solitary place to pray.",
        "story": (
            "The evening before, the whole city had gathered at the door, and Jesus had healed many. 'And in "
            "the morning, rising up a great while before day, he went out, and departed into a solitary "
            "place, and there prayed.' Simon and the others hunted for him: 'All men seek for thee.' Jesus "
            "answered that they must go on to the next towns."),
        "meaning": (
            "Even at the height of his popularity Jesus made time alone with his Father, and it was there "
            "that his direction became clear. Luke says he often withdrew into the wilderness to pray "
            "(Luke 5:16)."),
        "daily": (
            "Begin before the day begins. A few quiet minutes with God before messages and demands arrive can "
            "set the course of everything else."),
        "pray_it": "Father, before the day's demands begin, I come to you. Show me what matters today, and what I can leave with you.",
        "key_verses": ["Mark 1:35", "Luke 5:16"],
    },
    {
        "name": "All night before choosing the twelve",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "He continued all night in prayer to God",
        "by": [{"name": "Jesus"}],
        "occasion": "Before choosing his apostles",
        "where": "A mountain in Galilee",
        "told_in": "Luke 6:12-16",
        "summary": "Before choosing his twelve apostles, Jesus went up a mountain and prayed all night.",
        "story": (
            "'And it came to pass in those days, that he went out into a mountain to pray, and continued all "
            "night in prayer to God. And when it was day, he called unto him his disciples: and of them he "
            "chose twelve, whom also he named apostles.'"),
        "meaning": (
            "Jesus prayed before his great decisions. Luke shows him praying at his baptism (Luke 3:21), "
            "before choosing the twelve, at the transfiguration (Luke 9:29) and in Gethsemane."),
        "daily": (
            "Before a big decision, spend unhurried time in prayer first, not just a quick request after the "
            "choice has already been made."),
        "pray_it": "Lord, I have a decision to make. Before I choose, I bring it to you. Guide my choice, and give me peace about it.",
        "key_verses": ["Luke 6:12"],
    },
    {
        "name": "I thank thee, O Father",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "Revealed unto babes",
        "by": [{"name": "Jesus"}],
        "occasion": "After some towns refused to repent",
        "where": "Galilee",
        "told_in": "Matthew 11:20-30",
        "also_in": ["Luke 10:21-22"],
        "prayed": ["Matthew 11:25-26"],
        "summary": "Jesus thanked his Father for showing the truth to ordinary people, and then invited everyone who is weary to come to him for rest.",
        "story": (
            "After some towns refused to repent, Jesus prayed aloud: 'I thank thee, O Father, Lord of heaven "
            "and earth, because thou hast hid these things from the wise and prudent, and hast revealed them "
            "unto babes.' Then he turned to the crowd: 'Come unto me, all ye that labour and are heavy laden, "
            "and I will give you rest.'"),
        "meaning": (
            "Thanksgiving was part of Jesus' own praying, even in disappointment, and his thanks for God's "
            "way led straight into an invitation."),
        "daily": "Thank God for what he has shown you, even on a day when things have not gone your way.",
        "pray_it": "Father, thank you for showing yourself to ordinary people like me. I come to you tired, and I receive your rest.",
        "key_verses": ["Matthew 11:28"],
    },
    {
        "name": "At the tomb of Lazarus",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "Father, I thank thee that thou hast heard me",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Martha and Mary"}, {"name": "Lazarus"}],
        "occasion": "Just before he raised Lazarus",
        "where": "The tomb at Bethany",
        "told_in": "John 11:38-44",
        "prayed": ["John 11:41-42"],
        "summary": "Before raising Lazarus, Jesus looked up and thanked his Father for hearing him, so that the people standing by would believe.",
        "story": (
            "When the stone was taken away, 'Jesus lifted up his eyes, and said, Father, I thank thee that "
            "thou hast heard me. And I knew that thou hearest me always: but because of the people which "
            "stand by I said it, that they may believe that thou hast sent me.' Then he cried with a loud "
            "voice, 'Lazarus, come forth.'"),
        "meaning": (
            "Jesus gave thanks before the answer could be seen. His prayer was confident because he knew his "
            "Father heard him always."),
        "daily": "Thank God ahead of time for hearing you. It is not presumption, but trust.",
        "pray_it": "Father, thank you that you hear me. Even before I see the answer, I trust that you are at work.",
    },
    {
        "name": "The prayer for his followers",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "That they all may be one",
        "by": [{"name": "Jesus"}],
        "occasion": "The night before the crucifixion",
        "where": "Jerusalem, after the Last Supper",
        "told_in": "John 17:1-26",
        "prayed": ["John 17:1", "John 17:20-21"],
        "summary": "On the night before he died, Jesus prayed for himself, for his disciples, and for everyone who would believe through them.",
        "story": (
            "After the Last Supper Jesus 'lifted up his eyes to heaven, and said, Father, the hour is come; "
            "glorify thy Son, that thy Son also may glorify thee.' He prayed for the disciples he was leaving "
            "in the world, that God would 'keep them from the evil.' Then his prayer reached past them to us: "
            "'Neither pray I for these alone, but for them also which shall believe on me through their word; "
            "That they all may be one.'"),
        "meaning": (
            "Jesus prayed for people who did not yet exist: every believer to come. The unity of his people "
            "was on his heart the night before the cross."),
        "daily": (
            "Pray for the church, including believers you disagree with, that they may be one. And remember "
            "that Jesus has prayed for you."),
        "pray_it": "Lord Jesus, you prayed for me before I was born. Make your people one, keep us from evil, and let the world believe.",
        "key_verses": ["John 17:15"],
    },
    {
        "name": "Gethsemane",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "Not as I will, but as thou wilt",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}, {"name": "James and John"}],
        "occasion": "The night of his arrest",
        "where": "The garden of Gethsemane",
        "told_in": "Matthew 26:36-46",
        "also_in": ["Mark 14:32-42", "Luke 22:39-46", "Hebrews 5:7"],
        "prayed": ["Matthew 26:39"],
        "summary": "In the garden before his arrest, deeply distressed, Jesus asked his Father to take the cup from him, and then yielded to his Father's will.",
        "story": (
            "Jesus took Peter, James and John with him and said, 'My soul is exceeding sorrowful, even unto "
            "death.' He went a little further, fell on his face and prayed, 'O my Father, if it be possible, "
            "let this cup pass from me: nevertheless not as I will, but as thou wilt.' Three times he prayed, "
            "and three times he found the disciples asleep: 'Watch and pray, that ye enter not into "
            "temptation.' Luke adds that his sweat was 'as it were great drops of blood'."),
        "meaning": (
            "Honest prayer can ask for the hard thing to be taken away, and still end in trust: 'thy will be "
            "done' (Matthew 26:42)."),
        "daily": (
            "Tell God honestly what you want, and then hand the outcome to him. Surrender does not mean "
            "pretending you have no wishes."),
        "pray_it": "Father, this is what I want, and you know it. Yet not my will, but yours be done.",
        "key_verses": ["Matthew 26:41", "Matthew 26:42"],
    },
    {
        "name": "Father, forgive them",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "For they know not what they do",
        "by": [{"name": "Jesus"}],
        "occasion": "As he was being crucified",
        "where": "Calvary",
        "told_in": "Luke 23:32-38",
        "also_in": ["Isaiah 53:12", "Acts 7:60"],
        "prayed": ["Luke 23:34"],
        "summary": "While he was being crucified, Jesus prayed for the forgiveness of those who put him on the cross.",
        "story": (
            "At the place called Calvary they crucified him between two criminals. 'Then said Jesus, Father, "
            "forgive them; for they know not what they do.' Below him, the soldiers were dividing his "
            "clothes. (Some early manuscripts of Luke do not have this prayer; the King James Version keeps "
            "it.)"),
        "meaning": (
            "Jesus did on the cross what he had taught on the mountain: he prayed for his enemies. Isaiah had "
            "said the servant would make 'intercession for the transgressors' (Isaiah 53:12)."),
        "daily": (
            "Forgiveness often begins as a prayer before it becomes a feeling. Pray for the people who "
            "wronged you, even if they never know it."),
        "pray_it": "Father, forgive those who have hurt me; they do not fully know what they have done. And forgive me, as I forgive them.",
    },
    {
        "name": "Into thy hands",
        "group": "Jesus at prayer",
        "testament": "New",
        "epithet": "Father, into thy hands I commend my spirit",
        "by": [{"name": "Jesus"}],
        "occasion": "His last words on the cross",
        "where": "Calvary",
        "told_in": "Luke 23:44-49",
        "also_in": ["Psalms 31:1-5", "Acts 7:59"],
        "prayed": ["Luke 23:46"],
        "summary": "Jesus' last words on the cross were a prayer from the Psalms, entrusting himself to his Father.",
        "story": (
            "Darkness covered the land from the sixth hour to the ninth, and the veil of the temple was torn. "
            "'And when Jesus had cried with a loud voice, he said, Father, into thy hands I commend my "
            "spirit: and having said thus, he gave up the ghost.' His words come from Psalm 31, a prayer of "
            "trust: 'Into thine hand I commit my spirit' (Psalm 31:5)."),
        "meaning": (
            "Jesus died praying. He added one word to the psalm, 'Father', and made the moment of death an "
            "act of trust. Stephen prayed the same way as he died (Acts 7:59)."),
        "daily": (
            "End the day, and every hard moment, by committing yourself into God's hands. Psalm 31:5 is a "
            "prayer for bedtime as well as for the end of life."),
        "pray_it": "Father, into your hands I commit my spirit, my worries and this night. Keep me.",
        "key_verses": ["Psalms 31:5"],
    },
]
