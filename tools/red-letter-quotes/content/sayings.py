"""The best-known words of Jesus, with a plain explanation of each.

Each saying: name (its best-known words), theme, reference (every verse must
carry red letters; the build keeps only the red words), also_in (parallel
accounts, optional), context (where, when and to whom), meaning (what it
means), today (what it asks of us).

Quote Scripture in 'single quotes', word for word; the build checks it.
"""

SAYINGS = [
    # ================================================================== I am
    {
        "name": "I am the bread of life",
        "theme": "I am",
        "reference": "John 6:35",
        "context": "In the synagogue at Capernaum, the day after he fed the five thousand, to a crowd that wanted more bread.",
        "meaning": (
            "The crowd had eaten their fill and wanted Jesus to keep feeding them, as Moses' manna had "
            "fed Israel. Jesus pointed past the bread to himself: he is what the soul is hungry for, "
            "and whoever comes to him will be satisfied. The phrase 'I am' echoes God's own name at "
            "the burning bush."),
        "today": "Bring your hunger to Jesus himself, not only to the things you hope he will give.",
    },
    {
        "name": "I am the light of the world",
        "theme": "I am",
        "reference": "John 8:12",
        "context": "In the temple treasury in Jerusalem, around the Feast of Tabernacles, when great lamps were lit in the temple courts.",
        "meaning": (
            "Light shows the way and drives away darkness. Jesus claims to be that light for the whole "
            "world, not for Israel only. Following him means not walking in darkness, and he backed "
            "the claim by giving sight to a man born blind (John 9:5)."),
        "today": "Follow the light you have been given, one step at a time.",
    },
    {
        "name": "Before Abraham was, I am",
        "theme": "I am",
        "reference": "John 8:58",
        "context": "In the temple, arguing with leaders who asked how he could have seen Abraham.",
        "meaning": (
            "He did not say 'I was' but 'I am': the name God gave himself to Moses. His hearers "
            "understood exactly what he meant, and picked up stones to throw at him (John 8:59). It "
            "is one of his plainest claims to be God."),
        "today": "Jesus is not only a great teacher from the past. He is the eternal I AM, and he is present now.",
    },
    {
        "name": "I am the door",
        "theme": "I am",
        "reference": "John 10:9",
        "context": "In Jerusalem, speaking of shepherds and sheepfolds, after the Pharisees threw out the man born blind.",
        "meaning": (
            "A sheepfold had one gate, and at night the shepherd lay across it. Jesus is the one way "
            "in to safety and life, and those who enter through him 'go in and out, and find "
            "pasture': freedom and provision, not confinement."),
        "today": "There is a way in to God, and it is open. Jesus is the door.",
    },
    {
        "name": "I am the good shepherd",
        "theme": "I am",
        "reference": "John 10:11",
        "context": "The same discourse in Jerusalem, contrasting himself with thieves and hired hands.",
        "meaning": (
            "The prophets had condemned Israel's leaders as bad shepherds and promised God would "
            "shepherd his people himself (Ezekiel 34). Jesus claims that role, and defines it by one "
            "thing no hired hand will do: he lays down his life for the sheep."),
        "today": "You are known by name and loved enough to die for. Listen for the Shepherd's voice.",
    },
    {
        "name": "I am the resurrection, and the life",
        "theme": "I am",
        "reference": "John 11:25-26",
        "context": "Outside Bethany, to Martha, four days after her brother Lazarus had died.",
        "meaning": (
            "Martha believed in a resurrection at the last day. Jesus told her the resurrection was "
            "standing in front of her. Then he asked, 'Believest thou this?', and moments later "
            "called Lazarus out of the tomb."),
        "today": "Answer Jesus' question to Martha for yourself: do you believe this?",
    },
    {
        "name": "I am the way, the truth, and the life",
        "theme": "I am",
        "reference": "John 14:6",
        "context": "In the upper room on the night before he died, answering Thomas, who said they did not know the way.",
        "meaning": (
            "Thomas asked for directions; Jesus offered himself. He is not one path among many or a "
            "guide who points elsewhere: he is the way to the Father, the truth about God, and the "
            "life God gives."),
        "today": "When you don't know the way, you can still know the one who is the way.",
    },
    {
        "name": "I am the vine, ye are the branches",
        "theme": "I am",
        "reference": "John 15:5",
        "context": "On the night before the cross, as he walked with his disciples toward the Mount of Olives.",
        "meaning": (
            "Israel was often pictured as God's vine. Jesus says he is the true vine, and his "
            "followers live only by staying joined to him. A branch does not strain to produce "
            "grapes; it abides, and fruit comes. Cut off, it can do nothing."),
        "today": "Stay close to Jesus through his words and prayer; fruit is his work through you.",
    },

    # ================================================================== the sermon on the mount
    {
        "name": "The Beatitudes",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 5:3-10",
        "also_in": ["Luke 6:20-23"],
        "context": "On a mountain in Galilee, the opening of his best-known sermon, to his disciples with the crowds listening.",
        "meaning": (
            "Jesus begins by blessing the people the world overlooks: the poor in spirit, the "
            "mourners, the meek, the hungry for righteousness, the merciful, the pure in heart, the "
            "peacemakers and the persecuted. The kingdom of heaven turns the world's values upside "
            "down."),
        "today": "Read the list slowly and ask which one Jesus is speaking to you today.",
    },
    {
        "name": "Ye are the salt of the earth",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 5:13-14",
        "context": "The Sermon on the Mount, straight after the Beatitudes.",
        "meaning": (
            "Salt preserved food and gave it flavour; light showed the way. Jesus tells ordinary "
            "followers that they already are both, and warns against losing their saltiness or hiding "
            "their light. Faith is meant to make a difference where you are."),
        "today": "Where has God placed you to be salt and light this week?",
    },
    {
        "name": "Love your enemies",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 5:44",
        "also_in": ["Luke 6:27-28"],
        "context": "The Sermon on the Mount, in a series of sayings that begin 'Ye have heard that it was said…'.",
        "meaning": (
            "People had added 'hate thine enemy' to the command to love one's neighbour. Jesus "
            "removes the limit: love, bless, do good to and pray for enemies, because that is how "
            "the Father treats a world that rejects him."),
        "today": "Pray by name for someone who has wronged you.",
    },
    {
        "name": "The Lord's Prayer",
        "theme": "His prayers",
        "reference": "Matthew 6:9-13",
        "also_in": ["Luke 11:2-4"],
        "context": "The Sermon on the Mount; in Luke, the answer to a disciple who asked, 'Lord, teach us to pray'.",
        "meaning": (
            "Jesus gives a pattern rather than a formula: first God's name, kingdom and will; then "
            "our daily bread, our forgiveness as we forgive others, and protection from temptation "
            "and evil. It begins 'Our Father', inviting his followers to pray as he did."),
        "today": "Pray it slowly, one line at a time, turning each line into your own words.",
    },
    {
        "name": "Lay up treasures in heaven",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 6:19-21",
        "also_in": ["Luke 12:33-34"],
        "context": "The Sermon on the Mount, teaching about money and worry.",
        "meaning": (
            "Everything we store up on earth can be eaten, rusted or stolen. Jesus says to invest in "
            "what lasts, and gives the reason: 'where your treasure is, there will your heart be "
            "also.' What we value shapes what we love."),
        "today": "Look at where your time and money go. It will tell you where your heart is.",
    },
    {
        "name": "Take no thought for the morrow",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 6:33-34",
        "also_in": ["Luke 12:31"],
        "context": "The Sermon on the Mount, after pointing to the birds and the lilies.",
        "meaning": (
            "'Take no thought' means “don't be anxious”. Jesus does not forbid planning; he forbids "
            "worry that forgets the Father. Seek his kingdom first, and he will provide what we need; "
            "each day has enough trouble of its own."),
        "today": "Give tomorrow to God and deal with today's needs today.",
    },
    {
        "name": "Judge not",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 7:1-2",
        "also_in": ["Luke 6:37"],
        "context": "The Sermon on the Mount, just before the picture of the speck and the beam in the eye.",
        "meaning": (
            "Jesus is not forbidding all discernment (a few verses later he warns about false "
            "prophets). He forbids the harsh, hypocritical judging that condemns others while "
            "ignoring our own faults. The measure we use on others will be used on us."),
        "today": "Before you point out someone's fault, deal honestly with your own.",
    },
    {
        "name": "Ask, and it shall be given you",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 7:7-8",
        "also_in": ["Luke 11:9-10"],
        "context": "The Sermon on the Mount, teaching about prayer.",
        "meaning": (
            "Ask, seek, knock: the verbs mean keep on asking. Jesus goes on to say that if human "
            "fathers give good things to their children, how much more will the Father in heaven give "
            "good things to those who ask him."),
        "today": "Keep bringing your requests to God. He is a better Father than any on earth.",
    },
    {
        "name": "The golden rule",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 7:12",
        "also_in": ["Luke 6:31"],
        "context": "The Sermon on the Mount, summing up how to treat others.",
        "meaning": (
            "Many teachers had said, “Don't do to others what you would not want done to you.” Jesus "
            "put it positively: actively do for others what you would want done for you. He says "
            "this sums up 'the law and the prophets'."),
        "today": "Think of what you would most want from others today, and do that for someone.",
    },
    {
        "name": "Enter ye in at the strait gate",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 7:13-14",
        "also_in": ["Luke 13:24"],
        "context": "Near the end of the Sermon on the Mount, calling the listeners to decide.",
        "meaning": (
            "'Strait' means narrow. The way of the crowd is wide and easy and leads to destruction; "
            "the way to life is narrow and fewer find it. Jesus does not want admirers who stay on "
            "the broad road; he calls for a choice."),
        "today": "Following Jesus will sometimes mean not going with the crowd.",
    },
    {
        "name": "The wise man built his house upon a rock",
        "theme": "The Sermon on the Mount",
        "reference": "Matthew 7:24-25",
        "also_in": ["Luke 6:47-48"],
        "context": "The closing words of the Sermon on the Mount.",
        "meaning": (
            "Two houses look the same until the storm comes. The difference is the foundation: one "
            "hears Jesus' words and does them, the other hears and does not. Hearing without doing "
            "builds on sand."),
        "today": "Choose one thing Jesus said and put it into practice this week.",
    },

    # ================================================================== parables
    {
        "name": "The sower",
        "theme": "Parables",
        "reference": "Mark 4:3-8",
        "also_in": ["Matthew 13:3-8", "Luke 8:5-8"],
        "context": "Teaching from a boat by the Sea of Galilee to a crowd on the shore.",
        "meaning": (
            "The same seed falls on four kinds of ground: the path, the rocks, the thorns and good "
            "soil. Jesus later explains that the seed is God's word and the soils are the hearts that "
            "hear it (Mark 4:14-20). The question is not the seed but the soil."),
        "today": "Ask what kind of soil your heart is today, and what is choking the word.",
    },
    {
        "name": "The mustard seed",
        "theme": "Parables",
        "reference": "Matthew 13:31-32",
        "also_in": ["Mark 4:30-32", "Luke 13:18-19"],
        "context": "A series of kingdom parables by the Sea of Galilee.",
        "meaning": (
            "The kingdom of God starts as small as the smallest seed a farmer sows, and grows into a "
            "plant big enough for birds to nest in. Jesus' small band of followers would become a "
            "worldwide church."),
        "today": "Don't despise small beginnings. God grows great things from them.",
    },
    {
        "name": "The pearl of great price",
        "theme": "Parables",
        "reference": "Matthew 13:45-46",
        "context": "The same series of kingdom parables.",
        "meaning": (
            "A merchant finds one pearl worth more than everything he owns, and gladly sells it all "
            "to buy it. The kingdom of heaven is worth more than anything we give up for it, and "
            "those who find it give up things with joy, not regret."),
        "today": "What would you not give up for God? Ask whether he is worth more.",
    },
    {
        "name": "The good Samaritan",
        "theme": "Parables",
        "reference": "Luke 10:36-37",
        "context": "Answering a lawyer who asked, 'And who is my neighbour?'",
        "meaning": (
            "A priest and a Levite passed a wounded man by; a Samaritan, from a people the Jews "
            "despised, stopped and cared for him. Jesus turned the lawyer's question around: not "
            "'who is my neighbour?' but “who acted as a neighbour?” Then: 'Go, and do thou likewise.'"),
        "today": "Your neighbour is whoever needs you. Don't pass by on the other side.",
    },
    {
        "name": "The lost sheep",
        "theme": "Parables",
        "reference": "Luke 15:4-7",
        "also_in": ["Matthew 18:12-14"],
        "context": "To Pharisees and scribes who complained that Jesus welcomed sinners and ate with them.",
        "meaning": (
            "A shepherd leaves ninety-nine sheep to search for one that is lost, and carries it home "
            "rejoicing. Heaven rejoices more over one sinner who repents than over ninety-nine who "
            "think they need no repentance. God goes looking for the lost."),
        "today": "No one is too far gone for God to go looking for them, including you.",
    },
    {
        "name": "The prodigal son",
        "theme": "Parables",
        "reference": "Luke 15:20-24",
        "context": "The third of three 'lost' parables, told to the same grumbling Pharisees.",
        "meaning": (
            "The son who wasted everything came home hoping to be a servant. His father saw him a "
            "great way off, ran, embraced him and threw a feast. The parable ends with the elder "
            "brother outside, refusing to join: grace offends those who think they have earned it."),
        "today": "Whatever you have done, the Father runs to meet those who come home.",
    },
    {
        "name": "The rich fool",
        "theme": "Parables",
        "reference": "Luke 12:20-21",
        "context": "After a man asked Jesus to make his brother divide the family inheritance.",
        "meaning": (
            "A farmer had a record harvest and planned bigger barns and an easy retirement. God "
            "called him a fool, because that night his life would be required of him. Being rich "
            "toward yourself is not the same as being rich toward God."),
        "today": "Plan for the future, but plan for the life that lasts.",
    },
    {
        "name": "Well done, thou good and faithful servant",
        "theme": "Parables",
        "reference": "Matthew 25:21",
        "also_in": ["Luke 19:17"],
        "context": "The parable of the talents, told on the Mount of Olives in his last week.",
        "meaning": (
            "A master entrusted his servants with money and went away. Those who put it to work were "
            "praised and given more; the one who buried his out of fear lost it. God expects us to "
            "use what he has given us, and faithfulness in little leads to more."),
        "today": "Use your gifts, time and money for God, even if they seem small.",
    },
    {
        "name": "Watch therefore",
        "theme": "Parables",
        "reference": "Matthew 25:13",
        "context": "The end of the parable of the ten virgins, on the Mount of Olives in his last week.",
        "meaning": (
            "Five bridesmaids brought extra oil; five did not, and were shut out when the bridegroom "
            "came late at night. Jesus' return will come unexpectedly, and readiness cannot be "
            "borrowed at the last minute."),
        "today": "Live ready. Keep your lamp filled day by day.",
    },

    # ================================================================== invitations and promises
    {
        "name": "Come unto me, all ye that labour",
        "theme": "Invitations and promises",
        "reference": "Matthew 11:28-30",
        "context": "In Galilee, after praising the Father for revealing things to little children rather than the wise.",
        "meaning": (
            "Jesus invites everyone worn out, whether by work, grief or the heavy rules of religious "
            "teachers, to come to him. His yoke is easy: not no yoke at all, but one he carries "
            "with us, gentle and humble in heart."),
        "today": "Bring your tiredness to Jesus and learn from him how to rest.",
    },
    {
        "name": "For God so loved the world",
        "theme": "Invitations and promises",
        "reference": "John 3:16",
        "context": "At night in Jerusalem, speaking with Nicodemus, a Pharisee and ruler of the Jews.",
        "meaning": (
            "The best-known verse in the Bible sums up the gospel: God's love for the whole world, "
            "shown in giving his only Son, so that anyone who believes in him will not perish but "
            "have everlasting life. The next verse adds that he came not to condemn but to save."),
        "today": "Put your own name in place of 'the world'. God's love includes you.",
    },
    {
        "name": "Him that cometh to me I will in no wise cast out",
        "theme": "Invitations and promises",
        "reference": "John 6:37",
        "context": "The bread of life discourse in the synagogue at Capernaum.",
        "meaning": (
            "Jesus promises that no one who truly comes to him will be turned away. 'In no wise' "
            "means in no way at all. The promise rests not on the one who comes but on the one who "
            "receives."),
        "today": "If you have come to Jesus, you will not be sent away.",
    },
    {
        "name": "I am come that they might have life",
        "theme": "Invitations and promises",
        "reference": "John 10:10",
        "context": "The good shepherd discourse in Jerusalem.",
        "meaning": (
            "The thief comes to steal, kill and destroy. Jesus came for the opposite: life, 'more "
            "abundantly'. The life he gives is not a smaller, poorer life but a full one."),
        "today": "Ask what is stealing life from you, and bring it to the one who gives it.",
    },
    {
        "name": "Let not your heart be troubled",
        "theme": "Invitations and promises",
        "reference": "John 14:1-3",
        "context": "In the upper room, after telling the disciples he was leaving and that Peter would deny him.",
        "meaning": (
            "On the worst night of their lives, Jesus comforted his friends: trust God, trust me. He "
            "was going to prepare a place for them in his Father's house, and he would come back to "
            "take them there."),
        "today": "Whatever troubles your heart, it is held by a promise: he is coming back for you.",
    },
    {
        "name": "Peace I leave with you",
        "theme": "Invitations and promises",
        "reference": "John 14:27",
        "context": "In the upper room, promising the Holy Spirit.",
        "meaning": (
            "The world's peace depends on circumstances. Jesus gives his own peace, the peace he had "
            "on the night before the cross, and it does not depend on everything going well."),
        "today": "Ask Jesus for his peace in the thing that troubles you most.",
    },
    {
        "name": "Be of good cheer; I have overcome the world",
        "theme": "Invitations and promises",
        "reference": "John 16:33",
        "context": "The last words of his teaching in the upper room, before he prayed for his disciples.",
        "meaning": (
            "Jesus did not promise his followers an easy life: in the world they will have "
            "tribulation. But he gives a reason for good cheer in the middle of it: he has already "
            "overcome the world."),
        "today": "Trouble is real, but it is not the final word. Take heart.",
    },

    # ================================================================== commands and challenges
    {
        "name": "Follow me, and I will make you fishers of men",
        "theme": "Commands and challenges",
        "reference": "Matthew 4:19",
        "also_in": ["Mark 1:17"],
        "context": "By the Sea of Galilee, to the fishermen Peter and Andrew as they cast their nets.",
        "meaning": (
            "Jesus' first call to his disciples was simple: follow me. He took their ordinary skill, "
            "fishing, and gave it a new purpose, gathering people for God. They left their nets "
            "straight away."),
        "today": "Jesus calls you as you are, and uses who you are for his purpose.",
    },
    {
        "name": "Ye must be born again",
        "theme": "Commands and challenges",
        "reference": "John 3:7",
        "context": "At night, to Nicodemus, a respected teacher of Israel.",
        "meaning": (
            "Nicodemus was religious, educated and moral, and Jesus told him he needed a new birth "
            "'of water and of the Spirit'. Entering God's kingdom is not self-improvement but new "
            "life from God."),
        "today": "Religion is not enough. Ask God for the new life only his Spirit gives.",
    },
    {
        "name": "Deny himself, and take up his cross",
        "theme": "Commands and challenges",
        "reference": "Mark 8:34-35",
        "also_in": ["Matthew 16:24-25", "Luke 9:23-24"],
        "context": "Near Caesarea Philippi, straight after Peter called him the Christ and then rebuked him for speaking of the cross.",
        "meaning": (
            "A cross meant death. Following Jesus means saying no to self-rule and walking the road "
            "he walked. The paradox: whoever tries to save his life will lose it, and whoever loses "
            "it for Jesus and the gospel will save it."),
        "today": "Where is Jesus asking you to say no to yourself and yes to him?",
    },
    {
        "name": "The greatest commandment",
        "theme": "Commands and challenges",
        "reference": "Mark 12:29-31",
        "also_in": ["Matthew 22:37-40", "Luke 10:27"],
        "context": "In the temple in his last week, answering a scribe who asked which commandment is first of all.",
        "meaning": (
            "Jesus joined two commands from the Law: love God with all your heart, soul, mind and "
            "strength (Deuteronomy 6:5), and love your neighbour as yourself (Leviticus 19:18). "
            "Everything else in the Law hangs on these."),
        "today": "Love God with everything, and let that love reach your neighbour.",
    },
    {
        "name": "Render to Caesar the things that are Caesar's",
        "theme": "Commands and challenges",
        "reference": "Mark 12:17",
        "also_in": ["Matthew 22:21", "Luke 20:25"],
        "context": "In the temple, to Pharisees and Herodians who tried to trap him with a question about paying tax to Rome.",
        "meaning": (
            "The coin carried Caesar's image, so it could be given back to Caesar. But people carry "
            "God's image, so they belong to God. Jesus escaped the trap and set a deeper claim on "
            "everyone listening."),
        "today": "Be a good citizen, but remember whose image you bear.",
    },
    {
        "name": "Suffer the little children to come unto me",
        "theme": "Commands and challenges",
        "reference": "Mark 10:14-15",
        "also_in": ["Matthew 19:14", "Luke 18:16-17"],
        "context": "On the way to Jerusalem, when his disciples turned away parents bringing their children.",
        "meaning": (
            "'Suffer' means 'let'. Jesus was much displeased with his disciples, welcomed the "
            "children, and said the kingdom belongs to such as these. Only those who receive it like "
            "a little child, trusting and empty-handed, can enter it."),
        "today": "Don't stand in the way of anyone coming to Jesus, however small.",
    },
    {
        "name": "A new commandment: love one another",
        "theme": "Commands and challenges",
        "reference": "John 13:34-35",
        "context": "In the upper room, after washing his disciples' feet and sending Judas out.",
        "meaning": (
            "Love was an old command; the new thing was the standard: 'as I have loved you'. That "
            "love would be the badge that marks out his disciples to the watching world."),
        "today": "Love another believer this week in a way that costs you something.",
    },
    {
        "name": "The Son of man came to minister",
        "theme": "Commands and challenges",
        "reference": "Mark 10:43-45",
        "also_in": ["Matthew 20:26-28"],
        "context": "On the road to Jerusalem, after James and John asked for the best seats in his kingdom.",
        "meaning": (
            "Among the nations, the great rule over others. Among Jesus' followers, the great serve. "
            "He is the pattern: he came not to be served but to serve, and to give his life as a "
            "ransom for many."),
        "today": "Look for a way to serve someone who cannot repay you.",
    },

    # ================================================================== questions he asked
    {
        "name": "Whom say ye that I am?",
        "theme": "Questions he asked",
        "reference": "Matthew 16:15",
        "also_in": ["Mark 8:29", "Luke 9:20"],
        "context": "Near Caesarea Philippi, after asking what other people said about him.",
        "meaning": (
            "It was easy to report what others thought: a prophet, John the Baptist, Elijah. Then "
            "Jesus made it personal. Peter answered, 'Thou art the Christ, the Son of the living "
            "God.' It is the most important question anyone can answer."),
        "today": "Not what others say, but what do you say about Jesus?",
    },
    {
        "name": "What shall it profit a man?",
        "theme": "Questions he asked",
        "reference": "Mark 8:36-37",
        "also_in": ["Matthew 16:26", "Luke 9:25"],
        "context": "Straight after calling his followers to take up their cross.",
        "meaning": (
            "Suppose you gained everything the world could offer and lost your own soul. What would "
            "you give to buy it back? Jesus asks us to weigh this life against eternity."),
        "today": "Is anything you are chasing worth your soul?",
    },
    {
        "name": "Wilt thou be made whole?",
        "theme": "Questions he asked",
        "reference": "John 5:6",
        "context": "At the pool of Bethesda in Jerusalem, to a man who had been ill for thirty-eight years.",
        "meaning": (
            "It sounds like an unnecessary question, but after thirty-eight years the man had lost "
            "hope and only made excuses. Jesus' question woke up his will, and then his word healed "
            "him."),
        "today": "Do you actually want Jesus to change the thing you keep complaining about?",
    },
    {
        "name": "Will ye also go away?",
        "theme": "Questions he asked",
        "reference": "John 6:67",
        "context": "In Capernaum, after many disciples left him over his hard teaching on the bread of life.",
        "meaning": (
            "Jesus let the crowd walk away rather than soften his words, and asked the twelve if "
            "they would go too. Peter answered for them: 'Lord, to whom shall we go? thou hast the "
            "words of eternal life.'"),
        "today": "When following Jesus is hard, remember there is nowhere else to go for life.",
    },
    {
        "name": "Woman, where are those thine accusers?",
        "theme": "Questions he asked",
        "reference": "John 8:10-11",
        "context": "In the temple, to a woman taken in adultery, after her accusers had all walked away.",
        "meaning": (
            "Jesus had said, 'He that is without sin among you, let him first cast a stone', and one "
            "by one they left. Now no one was left to condemn her, and neither did he. But mercy "
            "came with a call: 'go, and sin no more.'"),
        "today": "Jesus does not condemn you; he sends you on free to live differently.",
    },
    {
        "name": "What wilt thou that I should do unto thee?",
        "theme": "Questions he asked",
        "reference": "Mark 10:51",
        "also_in": ["Luke 18:41"],
        "context": "By the road out of Jericho, to blind Bartimaeus, who had shouted until Jesus stopped.",
        "meaning": (
            "It was obvious what a blind man needed, but Jesus asked anyway. He wants us to name our "
            "need to him. Bartimaeus did, received his sight, and followed Jesus in the way."),
        "today": "Tell Jesus plainly what you want him to do for you.",
    },
    {
        "name": "Why are ye so fearful?",
        "theme": "Questions he asked",
        "reference": "Mark 4:40",
        "also_in": ["Matthew 8:26", "Luke 8:25"],
        "context": "In the boat on the Sea of Galilee, straight after calming the storm.",
        "meaning": (
            "The disciples had been sure they would drown while Jesus slept. His question after the "
            "calm was gentle and searching: after all they had seen, how was it they still had no "
            "faith?"),
        "today": "Name the fear. Then remember who is in the boat with you.",
    },

    # ================================================================== his prayers
    {
        "name": "Father, I thank thee that thou hast heard me",
        "theme": "His prayers",
        "reference": "John 11:41-42",
        "context": "At the tomb of Lazarus, after the stone was taken away and before he called Lazarus out.",
        "meaning": (
            "Jesus thanked the Father before the miracle happened, and prayed aloud so that the "
            "people standing by would believe the Father had sent him."),
        "today": "Thank God in faith before you see the answer.",
    },
    {
        "name": "This is life eternal",
        "theme": "His prayers",
        "reference": "John 17:3",
        "context": "His long prayer for his disciples, on the night before the cross.",
        "meaning": (
            "Eternal life is not only living for ever; it is knowing the only true God, and Jesus "
            "Christ whom he sent. It begins now, in a relationship."),
        "today": "Eternal life is knowing God. Spend time getting to know him today.",
    },
    {
        "name": "That they all may be one",
        "theme": "His prayers",
        "reference": "John 17:20-21",
        "context": "The same prayer, where Jesus prays not only for the twelve but for all who would believe through them.",
        "meaning": (
            "Jesus prayed for believers who were not yet born, including us. He asked that they "
            "would be one, as he and the Father are one, so that the world may believe."),
        "today": "Jesus prayed for you. Work for peace with other believers.",
    },
    {
        "name": "Not my will, but thine, be done",
        "theme": "His prayers",
        "reference": "Luke 22:42",
        "also_in": ["Matthew 26:39", "Mark 14:36"],
        "context": "In the garden on the Mount of Olives, hours before his arrest.",
        "meaning": (
            "Jesus asked honestly for the cup of suffering to be taken away, and then surrendered to "
            "the Father's will. Luke adds that his sweat was like great drops of blood. Obedience "
            "did not mean he felt no anguish."),
        "today": "You can tell God what you want and still say, 'thy will be done'.",
    },

    # ================================================================== from the cross
    {
        "name": "Father, forgive them",
        "theme": "From the cross",
        "reference": "Luke 23:34",
        "context": "The first of his words from the cross, as the soldiers crucified him.",
        "meaning": (
            "While the nails were being driven, Jesus prayed for the people doing it. It is the "
            "clearest picture of what he came to do: bring forgiveness to those who did not deserve "
            "it."),
        "today": "If Jesus could forgive this, ask him for grace to forgive those who have hurt you.",
    },
    {
        "name": "To day shalt thou be with me in paradise",
        "theme": "From the cross",
        "reference": "Luke 23:43",
        "context": "To one of the two criminals crucified beside him, who asked, 'Lord, remember me'.",
        "meaning": (
            "The man had nothing to offer: no good works, no time left, no baptism. He had only a "
            "request and faith. Jesus promised him paradise that very day."),
        "today": "It is never too late to turn to Jesus.",
    },
    {
        "name": "Woman, behold thy son!",
        "theme": "From the cross",
        "reference": "John 19:26-27",
        "context": "To his mother Mary and the disciple he loved, standing near the cross.",
        "meaning": (
            "In his agony Jesus still cared for his mother, entrusting her to John, who took her to "
            "his own home from that hour."),
        "today": "Care for the people God has given you, even when life is at its hardest.",
    },
    {
        "name": "My God, my God, why hast thou forsaken me?",
        "theme": "From the cross",
        "reference": "Matthew 27:46",
        "also_in": ["Mark 15:34"],
        "context": "At about the ninth hour, after three hours of darkness over the land.",
        "meaning": (
            "Jesus cried out the first line of Psalm 22, a psalm that begins in abandonment and ends "
            "in praise. He took on himself the separation from God that sin brings, so that we "
            "would never be forsaken."),
        "today": "When you feel forsaken, you can pray Jesus' own words, and know he has been there.",
    },
    {
        "name": "I thirst",
        "theme": "From the cross",
        "reference": "John 19:28",
        "context": "Near the end, 'that the scripture might be fulfilled'.",
        "meaning": (
            "The one who offered living water was thirsty. It shows how fully human he was, and "
            "fulfils Psalm 69:21, where the sufferer is given vinegar to drink."),
        "today": "Jesus knows physical suffering from the inside.",
    },
    {
        "name": "It is finished",
        "theme": "From the cross",
        "reference": "John 19:30",
        "context": "His last word in John's Gospel, after receiving the vinegar.",
        "meaning": (
            "Not “I am finished” but 'it is finished': the work he came to do was complete. The debt "
            "of sin was paid in full. Then he bowed his head and gave up his spirit."),
        "today": "You cannot add to what Jesus finished. Rest in it.",
    },
    {
        "name": "Father, into thy hands I commend my spirit",
        "theme": "From the cross",
        "reference": "Luke 23:46",
        "context": "His last words in Luke's Gospel, cried with a loud voice.",
        "meaning": (
            "Jesus quoted Psalm 31:5, a prayer of trust, adding the word 'Father'. He died not as a "
            "victim overwhelmed but entrusting himself to the Father. Stephen prayed the same way "
            "when he was stoned (Acts 7:59)."),
        "today": "You can put your life and your death into the Father's hands.",
    },

    # ================================================================== after the resurrection
    {
        "name": "Mary",
        "theme": "After the resurrection",
        "reference": "John 20:15-17",
        "context": "In the garden by the empty tomb on Easter morning, to Mary Magdalene, who thought he was the gardener.",
        "meaning": (
            "She did not recognise him until he said her name. The risen Lord knows his people by "
            "name. Then he sent her to tell the others: the first witness of the resurrection."),
        "today": "The risen Jesus knows your name.",
    },
    {
        "name": "Peace be unto you: as my Father hath sent me",
        "theme": "After the resurrection",
        "reference": "John 20:21-22",
        "context": "On Easter evening, to the disciples behind locked doors.",
        "meaning": (
            "Jesus greeted his frightened friends with peace and immediately gave them a mission: "
            "as the Father sent him, he sends them, with the Holy Spirit."),
        "today": "You are sent, just as Jesus was sent, and not alone.",
    },
    {
        "name": "Be not faithless, but believing",
        "theme": "After the resurrection",
        "reference": "John 20:27",
        "context": "A week later, to Thomas, who had said he would not believe unless he touched the wounds.",
        "meaning": (
            "Jesus met Thomas' doubt head on, inviting him to touch. Thomas answered, 'My Lord and "
            "my God.' Jesus then blessed everyone who believes without seeing, which includes us."),
        "today": "Bring your doubts to Jesus honestly. He meets them.",
    },
    {
        "name": "Lovest thou me? Feed my sheep",
        "theme": "After the resurrection",
        "reference": "John 21:15-17",
        "context": "By the Sea of Galilee at dawn, after breakfast, to Peter who had denied him three times.",
        "meaning": (
            "Three denials, three questions. Jesus did not shame Peter; he restored him, and gave him "
            "work to do: caring for Jesus' flock. Love for Jesus shows itself in caring for his "
            "people."),
        "today": "Failure is not the end. Jesus restores, and gives work to do.",
    },
    {
        "name": "The Great Commission",
        "theme": "After the resurrection",
        "reference": "Matthew 28:18-20",
        "also_in": ["Mark 16:15"],
        "context": "On a mountain in Galilee, his last words in Matthew's Gospel.",
        "meaning": (
            "With all authority in heaven and earth, Jesus sent his followers to make disciples of "
            "all nations, baptising and teaching them, and he promised to be with them always, to "
            "the end of the world."),
        "today": "Every follower is sent, and Jesus is with you in it.",
    },
    {
        "name": "Ye shall receive power",
        "theme": "After the resurrection",
        "reference": "Acts 1:7-8",
        "context": "On the Mount of Olives, just before he was taken up into heaven.",
        "meaning": (
            "The disciples wanted to know when the kingdom would come. Jesus told them the timing "
            "was the Father's business; theirs was to receive the Holy Spirit and be his witnesses, "
            "from Jerusalem to the ends of the earth."),
        "today": "Leave the timing to God, and be a witness where you are.",
    },

    # ================================================================== from heaven
    {
        "name": "Saul, Saul, why persecutest thou me?",
        "theme": "From heaven",
        "reference": "Acts 9:4-5",
        "also_in": ["Acts 22:7-8", "Acts 26:14-15"],
        "context": "On the road to Damascus, from a light out of heaven, to Saul, who was hunting Christians.",
        "meaning": (
            "Saul thought he was attacking a sect; Jesus said he was attacking him. Jesus is so "
            "closely joined to his people that what is done to them is done to him. The persecutor "
            "became the apostle Paul."),
        "today": "No one is beyond Jesus' reach, not even his fiercest enemy.",
    },
    {
        "name": "It is more blessed to give than to receive",
        "theme": "From heaven",
        "reference": "Acts 20:35",
        "context": "Quoted by Paul to the elders of Ephesus at Miletus. The saying is not in the Gospels, but was remembered by the church.",
        "meaning": (
            "Paul had worked with his own hands to support himself and help the weak, and pointed to "
            "these words of Jesus as the reason. Giving is not a loss; it is where the blessing is."),
        "today": "Give something this week, and see who is more blessed.",
    },
    {
        "name": "This do in remembrance of me",
        "theme": "From heaven",
        "reference": "1 Corinthians 11:24-25",
        "also_in": ["Luke 22:19-20"],
        "context": "Words from the Last Supper, which Paul says he 'received of the Lord' and passed on to the church at Corinth.",
        "meaning": (
            "Jesus gave his followers a meal to remember him by: bread for his body broken for them, "
            "a cup for the new covenant in his blood. Every time the church shares it, it proclaims "
            "his death until he comes."),
        "today": "Take the Lord's Supper as a remembrance, not a routine.",
    },
    {
        "name": "My grace is sufficient for thee",
        "theme": "From heaven",
        "reference": "2 Corinthians 12:9",
        "context": "The Lord's answer to Paul, who had prayed three times for his 'thorn in the flesh' to be taken away.",
        "meaning": (
            "God said no to Paul's request and gave something better: grace enough for the weakness, "
            "and strength made perfect in it. Paul decided he would rather boast in his weaknesses, "
            "so that Christ's power could rest on him."),
        "today": "If God has not removed your weakness, his grace is enough for it.",
    },
    {
        "name": "I am Alpha and Omega",
        "theme": "From heaven",
        "reference": "Revelation 1:8",
        "context": "At the start of John's vision on the island of Patmos.",
        "meaning": (
            "Alpha and Omega are the first and last letters of the Greek alphabet. The one who "
            "speaks is the beginning and the end of all things, the Almighty, 'which is, and which "
            "was, and which is to come'."),
        "today": "Your story is held between the first and last letters of God's.",
    },
    {
        "name": "Behold, I stand at the door, and knock",
        "theme": "From heaven",
        "reference": "Revelation 3:20",
        "context": "The risen Christ's message to the lukewarm church at Laodicea.",
        "meaning": (
            "Jesus was outside the door of a church that thought it was rich and needed nothing. He "
            "knocks and waits; he does not break in. To anyone who opens, he promises to come in and "
            "share a meal."),
        "today": "Open the door. Jesus wants fellowship with you, not just your attendance.",
    },
    {
        "name": "Surely I come quickly",
        "theme": "From heaven",
        "reference": "Revelation 22:20",
        "context": "The last words of Jesus in the Bible, at the end of John's vision.",
        "meaning": (
            "The Bible ends with a promise from Jesus and a prayer from his people. 'Quickly' means "
            "his coming is sure and could be at any time. The church answers, 'Even so, come, Lord "
            "Jesus.'"),
        "today": "Live ready, and pray with the church: come, Lord Jesus.",
    },
]
