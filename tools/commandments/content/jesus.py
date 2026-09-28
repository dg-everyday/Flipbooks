"""Commandments of God: the greatest commandments, and the commandments of Jesus.

Fields as in ten.py (without `number`). Scripture in 'single quotes' must be
word for word KJV (the build checks it).
"""

JESUS = [
    # ------------------------------------------------------------------ The greatest commandments
    {
        "name": "Love God with all your heart",
        "group": "The greatest commandments",
        "testament": "Old",
        "epithet": "Thou shalt love the LORD thy God with all thine heart",
        "by_label": "Given by",
        "by": [{"name": "God, through Moses", "hero": "moses"}],
        "to": "Israel, about to enter the promised land",
        "where": "The plains of Moab",
        "told_in": "Deuteronomy 6:4-9",
        "also_in": ["Matthew 22:36-38", "Mark 12:28-30", "Luke 10:25-28"],
        "words": ["Deuteronomy 6:4-5", "Matthew 22:37-38"],
        "summary": "The first and great commandment: love the one true God with everything you are.",
        "story": (
            "Before Israel crossed the Jordan, Moses repeated the law and gave them the words Jews still say "
            "every morning and evening, the Shema: 'Hear, O Israel: The LORD our God is one LORD'. Centuries "
            "later a lawyer asked Jesus, 'Master, which is the great commandment in the law?' Jesus answered "
            "with these words, and called them 'the first and great commandment.'"),
        "meaning": (
            "Heart, soul, mind and strength together mean all of you: your feelings, your life, your thinking "
            "and your energy. Love for God is not one part of life beside the others; it is the centre the rest "
            "turns on. The first four of the Ten Commandments are this one commandment spelled out."),
        "daily": (
            "Loving God is shown by trust, obedience, worship and time. Jesus said, 'If ye love me, keep my "
            "commandments' (John 14:15). Bring God into the ordinary parts of the day, not only the religious "
            "ones."),
        "try_it": "Tell God today, in your own words, three reasons you love him.",
        "key_verses": ["Mark 12:30", "John 14:15"],
    },
    {
        "name": "Love your neighbour as yourself",
        "group": "The greatest commandments",
        "testament": "Old",
        "epithet": "Thou shalt love thy neighbour as thyself",
        "by_label": "Given by",
        "by": [{"name": "God, through Moses", "hero": "moses"}],
        "to": "Israel",
        "where": "Mount Sinai",
        "told_in": "Leviticus 19:18",
        "also_in": ["Matthew 22:39-40", "Luke 10:29-37", "Romans 13:8-10", "Galatians 5:14"],
        "words": ["Leviticus 19:18", "Matthew 22:39-40"],
        "summary": "The second great commandment: treat other people with the same care you want for yourself.",
        "story": (
            "The command sits in the middle of the law's rules for everyday life in Leviticus 19: 'Thou shalt "
            "not avenge, nor bear any grudge … but thou shalt love thy neighbour as thyself'. When a lawyer asked "
            "Jesus, 'And who is my neighbour?', he told the story of the good Samaritan, who stopped for a "
            "wounded stranger of another people, and ended, 'Go, and do thou likewise' (Luke 10:37)."),
        "meaning": (
            "Jesus joined this command to the first: 'On these two commandments hang all the law and the "
            "prophets.' Paul says the last six of the Ten Commandments are 'briefly comprehended' in it, and "
            "'love is the fulfilling of the law' (Romans 13:9-10). Your neighbour is anyone whose need you can "
            "see and meet."),
        "daily": (
            "Your neighbour is the person next to you: family, colleague, stranger, the one who disagrees with "
            "you. Love is practical: time, help, patience, fairness and kindness."),
        "try_it": "Notice one person today who needs help, and help them without being asked.",
        "key_verses": ["Romans 13:10", "Galatians 5:14"],
    },
    {
        "name": "Love one another as I have loved you",
        "group": "The greatest commandments",
        "testament": "New",
        "epithet": "A new commandment I give unto you",
        "by": [{"name": "Jesus"}],
        "to": "His disciples",
        "where": "The Last Supper",
        "told_in": "John 13:31-35",
        "also_in": ["John 15:12-17", "1 John 3:16-18", "1 John 4:7-11"],
        "words": ["John 13:34-35"],
        "summary": "Jesus's new commandment: love each other the way he loved us, and the world will know we are his.",
        "story": (
            "On the night before he died, after washing his disciples' feet and sending Judas out into the dark, "
            "Jesus said, 'A new commandment I give unto you, That ye love one another; as I have loved you, that "
            "ye also love one another.' He said it again later that night: 'Greater love hath no man than this, "
            "that a man lay down his life for his friends' (John 15:13)."),
        "meaning": (
            "Love was already commanded; what is new is the measure: 'as I have loved you'. That love serves, "
            "forgives and lays down its life. It is the mark by which people are to recognise Christ's "
            "followers: 'By this shall all men know that ye are my disciples'. John writes, 'let us not love in "
            "word, neither in tongue; but in deed and in truth' (1 John 3:18)."),
        "daily": (
            "How Christians treat each other is the clearest sermon the world hears. Serve, forgive and care for "
            "fellow believers, especially the hard ones to love."),
        "try_it": "Do a humble, practical service for someone in your church or family this week, like Jesus washing feet.",
        "key_verses": ["John 15:13", "1 John 4:11"],
    },
    {
        "name": "The golden rule",
        "group": "The greatest commandments",
        "testament": "New",
        "epithet": "Whatsoever ye would that men should do to you, do ye even so to them",
        "by": [{"name": "Jesus"}],
        "to": "The crowds and his disciples",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 7:12",
        "also_in": ["Luke 6:31"],
        "words": ["Matthew 7:12"],
        "summary": "Treat others the way you would want them to treat you; Jesus said this sums up the law and the prophets.",
        "story": (
            "Near the end of the Sermon on the Mount, after teaching that the Father gives good things to those "
            "who ask him, Jesus drew it all together: 'Therefore all things whatsoever ye would that men should "
            "do to you, do ye even so to them: for this is the law and the prophets.' Christians have long "
            "called it “the golden rule”."),
        "meaning": (
            "Others taught a negative form: do not do to others what you would hate done to you. Jesus put it "
            "positively. It is not enough to avoid harm; we are to take the first step and do the good we would "
            "hope for ourselves. It is the love of neighbour turned into a question anyone can ask."),
        "daily": (
            "Before you speak, reply, drive, review, bargain or post, ask: how would I want to be treated here? "
            "Then do that first."),
        "try_it": "Before your next hard conversation, ask yourself how you would want to be spoken to, and speak that way.",
        "key_verses": ["Luke 6:31"],
    },

    # ------------------------------------------------------------------ Commandments of Jesus
    {
        "name": "Repent and believe the gospel",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Repent ye, and believe the gospel",
        "by": [{"name": "Jesus"}],
        "to": "Everyone who heard him",
        "where": "Galilee",
        "told_in": "Mark 1:14-15",
        "also_in": ["Matthew 4:17", "Acts 2:38", "Acts 17:30"],
        "words": ["Mark 1:15"],
        "summary": "Jesus's first command: turn from sin and trust the good news that God's kingdom has come.",
        "story": (
            "After John the Baptist was put in prison, Jesus came into Galilee 'preaching the gospel of the "
            "kingdom of God'. His message was short: 'The time is fulfilled, and the kingdom of God is at hand: "
            "repent ye, and believe the gospel.' On the day of Pentecost Peter preached the same: 'Repent, and "
            "be baptized every one of you' (Acts 2:38)."),
        "meaning": (
            "To repent is to change your mind and turn around: from sin, and from running your own life, to God. "
            "To believe is to trust Jesus and the good news he brings. Every other commandment of Jesus begins "
            "here; it is the door into the kingdom."),
        "daily": (
            "Repentance is not only the first step; it is a way of life. Keep short accounts with God: confess "
            "quickly, turn back, and trust his forgiveness."),
        "try_it": "At the end of today, name one thing to turn from and one promise of God to trust.",
        "key_verses": ["Acts 3:19", "1 John 1:9"],
    },
    {
        "name": "Deny yourself and follow me",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Take up his cross daily, and follow me",
        "by": [{"name": "Jesus"}],
        "to": "All who would follow him",
        "where": "Near Caesarea Philippi",
        "told_in": "Luke 9:18-26",
        "also_in": ["Matthew 16:24-26", "Mark 8:34-37"],
        "words": ["Luke 9:23-24"],
        "summary": "Following Jesus means putting him before yourself every day, even when it costs.",
        "story": (
            "Just after Peter confessed that Jesus was 'The Christ of God', Jesus told his disciples that he "
            "must suffer, be rejected and be killed. Then he said to them all, 'If any man will come after me, "
            "let him deny himself, and take up his cross daily, and follow me.'"),
        "meaning": (
            "A cross was not a burden to carry for a while; it was the end of a life lived for oneself. Jesus "
            "promises that this loss is really gain: 'whosoever will lose his life for my sake, the same shall "
            "save it.' Luke adds one word the others do not: 'daily'."),
        "daily": (
            "Denying yourself looks ordinary: choosing honesty when it costs, serving when you are tired, giving "
            "up a comfort for someone else, saying yes to God when you want to say no."),
        "try_it": "Pick one small comfort to give up today, and use the time or money to serve someone else.",
        "key_verses": ["Galatians 2:20"],
    },
    {
        "name": "Seek first the kingdom of God",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Seek ye first the kingdom of God, and his righteousness",
        "by": [{"name": "Jesus"}],
        "to": "The crowds and his disciples",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 6:25-34",
        "also_in": ["Luke 12:22-31", "Philippians 4:19"],
        "words": ["Matthew 6:31-34"],
        "summary": "Do not be ruled by worry about food, clothes and tomorrow; put God's kingdom first and trust him for the rest.",
        "story": (
            "Jesus pointed his hearers to the birds, which 'sow not, neither do they reap', and the lilies of "
            "the field, dressed more finely than 'Solomon in all his glory'. If God cares for them, he will care "
            "for his children. So: 'seek ye first the kingdom of God, and his righteousness; and all these "
            "things shall be added unto you.'"),
        "meaning": (
            "“Take no thought” in the KJV means “do not be anxious”. Jesus does not forbid work or planning; he "
            "forbids letting worry set our priorities. The cure for anxiety is not less caring but a greater "
            "trust: 'your heavenly Father knoweth that ye have need of all these things.'"),
        "daily": (
            "Your calendar and your bank statement show what you seek first. Start the day with God, give to "
            "his work first, and hand tomorrow's worries back to him."),
        "try_it": "Write down what you are worried about, pray over each line, and then do the one thing you can do today.",
        "key_verses": ["Matthew 6:33", "Philippians 4:19"],
    },
    {
        "name": "Love your enemies",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Love your enemies, bless them that curse you",
        "by": [{"name": "Jesus"}],
        "to": "The crowds and his disciples",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 5:43-48",
        "also_in": ["Luke 6:27-36", "Romans 12:14", "Romans 12:20-21"],
        "words": ["Matthew 5:44-45"],
        "summary": "Jesus commands the hardest love: to do good to those who hate us and to pray for those who hurt us.",
        "story": (
            "'Ye have heard that it hath been said, Thou shalt love thy neighbour, and hate thine enemy. But I "
            "say unto you, Love your enemies'. Jesus lived it: on the cross he prayed, 'Father, forgive them; "
            "for they know not what they do' (Luke 23:34), and Stephen prayed the same as he was stoned (Acts "
            "7:60)."),
        "meaning": (
            "God himself 'maketh his sun to rise on the evil and on the good'; loving enemies makes us like our "
            "Father. Love here is not a warm feeling but a choice: to bless, to do good, and to pray. Paul "
            "writes, 'Be not overcome of evil, but overcome evil with good' (Romans 12:21)."),
        "daily": (
            "Your enemy may be a critic at work, an unkind neighbour, an ex, or someone online. You do not have "
            "to trust them or stay in harm's way, but you can refuse to hate them, and pray for them by name."),
        "try_it": "Pray by name for someone who has hurt you, and ask God to bless them.",
        "key_verses": ["Luke 6:27-28", "Romans 12:21"],
    },
    {
        "name": "Forgive, seventy times seven",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Until seventy times seven",
        "by": [{"name": "Jesus"}],
        "with": [{"name": "Peter", "hero": "peter"}],
        "to": "Peter and the disciples",
        "where": "Capernaum",
        "told_in": "Matthew 18:21-35",
        "also_in": ["Mark 11:25", "Matthew 6:14-15", "Colossians 3:13"],
        "words": ["Matthew 18:21-22", "Mark 11:25"],
        "summary": "Jesus's followers are to forgive without keeping count, as God has forgiven them.",
        "story": (
            "Peter asked, 'Lord, how oft shall my brother sin against me, and I forgive him? till seven times?' "
            "Jesus answered, 'Until seventy times seven', and told of a servant forgiven a debt he could never "
            "pay, who then seized a fellow servant over a small one. His master asked him, 'Shouldest not thou "
            "also have had compassion on thy fellowservant, even as I had pity on thee?' (Matthew 18:33)."),
        "meaning": (
            "Forgiveness is not pretending the wrong did not happen, and it does not always mean trust returns "
            "at once. It means cancelling the debt and giving up revenge, because God has cancelled ours. Jesus "
            "ties our forgiving to our prayers: 'when ye stand praying, forgive, if ye have ought against any'."),
        "daily": (
            "Forgiveness is often a decision you make before your feelings catch up, and you may need to make it "
            "again. Let go of the replaying, the punishing and the score keeping."),
        "try_it": "Name one grudge you are holding, and tell God you are letting it go; if you can, tell the person too.",
        "key_verses": ["Matthew 6:14", "Colossians 3:13"],
    },
    {
        "name": "Judge not",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Judge not, that ye be not judged",
        "by": [{"name": "Jesus"}],
        "to": "The crowds and his disciples",
        "where": "The Sermon on the Mount",
        "told_in": "Matthew 7:1-5",
        "also_in": ["Luke 6:37-42", "Romans 14:10-13", "James 4:11-12"],
        "words": ["Matthew 7:1-5"],
        "summary": "Do not condemn others while ignoring your own faults; deal with the beam in your own eye first.",
        "story": (
            "Jesus drew a picture that makes his hearers smile: a man with a beam of wood in his own eye trying "
            "to pull a speck of sawdust, a 'mote', from his brother's. 'Thou hypocrite, first cast out the beam "
            "out of thine own eye; and then shalt thou see clearly to cast out the mote out of thy brother's "
            "eye.'"),
        "meaning": (
            "Jesus does not forbid telling right from wrong, or helping a brother with his speck; he says 'then "
            "shalt thou see clearly' to do so. He forbids the harsh, self-righteous judging that condemns others "
            "and excuses ourselves, for 'with what measure ye mete, it shall be measured to you again.'"),
        "daily": (
            "When someone's fault irritates you, ask first where the same fault lives in you. Assume the best, "
            "speak humbly, and leave final judgment to God."),
        "try_it": "The next time you feel like criticising someone, name one of your own faults to God first.",
        "key_verses": ["Luke 6:37", "Romans 14:13"],
    },
    {
        "name": "Do this in remembrance of me",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "This do in remembrance of me",
        "by": [{"name": "Jesus"}],
        "to": "The twelve",
        "where": "The Last Supper, Jerusalem",
        "told_in": "Luke 22:14-20",
        "also_in": ["Matthew 26:26-29", "Mark 14:22-25", "1 Corinthians 11:23-26"],
        "words": ["Luke 22:19-20"],
        "summary": "Jesus commanded his followers to share bread and the cup to remember his death for them.",
        "story": (
            "At the Passover meal on the night he was betrayed, Jesus took bread, gave thanks, broke it and said, "
            "'This is my body which is given for you: this do in remembrance of me.' Then the cup: 'This cup is "
            "the new testament in my blood, which is shed for you.' The church has kept this meal ever since, "
            "called the Lord's Supper, Holy Communion or the Eucharist."),
        "meaning": (
            "Churches understand the meal in different ways, but all keep it at Jesus's command. It looks back "
            "to the cross, looks around at the church sharing one loaf, and looks forward: 'ye do shew the "
            "Lord's death till he come' (1 Corinthians 11:26). Paul asks each person to examine himself before "
            "he eats."),
        "daily": (
            "Remembering Jesus is not only for communion Sundays. Let his death for you shape how you see your "
            "sin, your worth, and the people you share the table with."),
        "try_it": "Before your next meal, pause to thank Jesus for giving his body and blood for you.",
        "key_verses": ["1 Corinthians 11:26", "1 Corinthians 11:28"],
    },
    {
        "name": "Go and make disciples",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Go ye therefore, and teach all nations",
        "by": [{"name": "Jesus, risen from the dead"}],
        "to": "The eleven disciples",
        "where": "A mountain in Galilee",
        "told_in": "Matthew 28:16-20",
        "also_in": ["Mark 16:15", "Acts 1:8"],
        "words": ["Matthew 28:18-20"],
        "summary": "The risen Jesus sent his followers to make disciples of all nations, baptising and teaching them.",
        "story": (
            "After his resurrection Jesus met the eleven on a mountain in Galilee. 'All power is given unto me in "
            "heaven and in earth. Go ye therefore, and teach all nations, baptizing them in the name of the "
            "Father, and of the Son, and of the Holy Ghost'. It is often called “the Great Commission”."),
        "meaning": (
            "“Teach all nations” means “make disciples”: not just converts, but learners who are 'Teaching them "
            "to observe all things whatsoever I have commanded you'. The command comes with a promise that makes "
            "it possible: 'lo, I am with you alway, even unto the end of the world.'"),
        "daily": (
            "Most disciple-making happens close to home: in a family, a friendship, a small group, a workplace. "
            "Share what you know of Jesus, and help someone take their next step."),
        "try_it": "Tell one person this week what Jesus has done for you, or invite them to read a Gospel with you.",
        "key_verses": ["Acts 1:8"],
    },
    {
        "name": "Abide in me",
        "group": "Commandments of Jesus",
        "testament": "New",
        "epithet": "Abide in me, and I in you",
        "by": [{"name": "Jesus"}],
        "to": "His disciples",
        "where": "On the way to Gethsemane",
        "told_in": "John 15:1-11",
        "also_in": ["John 14:15-21", "1 John 2:6"],
        "words": ["John 15:4-5", "John 14:15"],
        "summary": "Stay joined to Jesus like a branch to a vine; everything good in the Christian life grows from that.",
        "story": (
            "On his last night, Jesus told his disciples, 'I am the vine, ye are the branches'. A branch does not "
            "strain to produce grapes; it stays joined to the vine and the fruit comes. 'Abide in me, and I in "
            "you … for without me ye can do nothing.'"),
        "meaning": (
            "To abide is to remain, to live in. Jesus shows how: his words abide in us, we keep his "
            "commandments, and we continue in his love (John 15:7-10). Obedience is not the price of his love "
            "but the way we stay in it: 'If ye love me, keep my commandments.' The goal is joy: 'that my joy "
            "might remain in you, and that your joy might be full' (John 15:11)."),
        "daily": (
            "Abiding is built out of daily habits: reading his words, praying, obeying what you already know, "
            "and staying close to his people."),
        "try_it": "Read John 15:1-11 slowly today, and carry one line of it with you through the day.",
        "key_verses": ["John 15:7", "John 15:11"],
    },
]
