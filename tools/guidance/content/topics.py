"""Guidance for life: the questions of life, answered by the voices of Scripture.

Each topic: name, section, question (how a reader would ask it), summary (the
short answer), guidance (in plain words), teachings, practice (one thing to
do), prayer.

Each teaching: voice (Jesus, The prophets, The apostles, Wisdom, Law and
history), who (the speaker or writer), hero (optional id on
heroes-and-villains.html), reference (the build adds the KJV text), note (what
it means, in plain words), example (optional: something Jesus did rather than
said, so the red-letter check is skipped).

Quote Scripture in 'single quotes', word for word; the build checks it.
"""

TOPICS = [
    # ================================================================== heart and mind
    {
        "name": "Worry and anxiety",
        "section": "Heart and mind",
        "question": "What do I do when I can't stop worrying?",
        "summary": "Worry pulls tomorrow's troubles into today. Scripture's answer is not to stop caring, but to hand the care to God.",
        "guidance": (
            "Jesus does not tell worried people to try harder. He points them to a Father who feeds "
            "the birds and knows what they need, and tells them to put his kingdom first and take one "
            "day at a time. The apostles turn that into a habit: bring every care to God in prayer, "
            "with thanks, and his peace will guard your heart and mind."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:33-34", "note": "Put God's kingdom first; let tomorrow look after itself."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 4:6-7", "note": "Turn every worry into prayer, with thanks, and God's peace will guard you."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "1 Peter 5:7", "note": "Throw your cares on God, because he cares for you."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 26:3", "note": "A mind that rests on God is kept in peace."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 55:22", "note": "Hand your burden to the LORD; he will hold you up."},
        ],
        "practice": "When a worry comes, turn it into a one-line prayer, then name one thing you are thankful for.",
        "prayer": "Father, you know what I need before I ask. I give you what I am carrying today, and I trust you with tomorrow.",
    },
    {
        "name": "Fear and courage",
        "section": "Heart and mind",
        "question": "How can I be brave when I'm afraid?",
        "summary": "Courage in the Bible is not the absence of fear. It is trusting that God is with you in it.",
        "guidance": (
            "'Fear not' is one of the most repeated commands in Scripture, and it almost always comes "
            "with a reason: 'for I am with thee'. God does not ask his people to feel strong. He asks "
            "them to remember who goes with them, and to take the next step."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 14:27", "note": "Jesus gives a peace the world cannot give, so don't let your heart be afraid."},
            {"voice": "Law and history", "who": "The LORD, to Joshua", "hero": "joshua", "reference": "Joshua 1:9", "note": "Be strong and brave, because God goes with you wherever you go."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 41:10", "note": "Don't be afraid: God is with you and will hold you up."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 27:1", "note": "If the LORD is your light and strength, whom do you need to fear?"},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Timothy 1:7", "note": "God's Spirit is not one of fear, but of power, love and a sound mind."},
            {"voice": "The apostles", "who": "John", "reference": "1 John 4:18", "note": "Being loved completely drives fear out."},
        ],
        "practice": "Name the fear out loud, then say who is with you in it. Take one small step anyway.",
        "prayer": "Lord, I am afraid. Remind me that you are with me, and give me courage for the next step.",
    },
    {
        "name": "Anger",
        "section": "Heart and mind",
        "question": "What do I do with my anger?",
        "summary": "Anger is not always sin, but it must not be kept, fed or acted on in revenge.",
        "guidance": (
            "The Bible expects us to feel anger and warns us not to let it rule. Deal with it quickly, "
            "before the day ends; listen more than you speak; answer softly. Jesus takes it further: "
            "if someone has something against you, go and make peace before you go to worship."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:23-24", "note": "Put things right with your brother before you bring your gift to God."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 4:26-27", "note": "Be angry without sinning, and don't go to bed angry."},
            {"voice": "The apostles", "who": "James", "reference": "James 1:19-20", "note": "Be quick to listen, slow to speak and slow to anger."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 15:1", "note": "A gentle answer calms anger; harsh words stir it up."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 16:32", "note": "Ruling your own temper takes more strength than capturing a city."},
            {"voice": "The prophets", "who": "The LORD, to Jonah", "reference": "Jonah 4:4", "note": "God asks the angry prophet a question worth asking ourselves: is this anger right?"},
        ],
        "practice": "Before you answer in anger, wait, and ask God's question: 'Doest thou well to be angry?'",
        "prayer": "Lord, slow me down. Help me to listen before I speak, and to make peace before the sun goes down.",
    },
    {
        "name": "Pride and humility",
        "section": "Heart and mind",
        "question": "How do I stay humble?",
        "summary": "Pride puts self at the centre. Humility is not thinking less of yourself, but thinking of others and of God first.",
        "guidance": (
            "Scripture turns the world's ladder upside down: the one who lifts himself up is brought "
            "down, and the one who humbles himself is lifted up. Humility is walking with God and "
            "counting other people's needs as important as your own."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 14:11", "note": "Whoever raises himself up will be brought down, and the humble will be raised."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 18:4", "note": "The greatest in God's kingdom is the one who becomes humble like a little child."},
            {"voice": "The prophets", "who": "Micah", "reference": "Micah 6:8", "note": "What God asks: do justly, love mercy, walk humbly with him."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 16:18", "note": "Pride comes before a fall."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 2:3-4", "note": "Think of others as better than yourself, and look to their interests too."},
            {"voice": "The apostles", "who": "James", "reference": "James 4:10", "note": "Humble yourself before God, and he will lift you up."},
        ],
        "practice": "Today, quietly do something for someone that no one will thank you for.",
        "prayer": "Lord, keep me low before you. Teach me to walk humbly and to put others first.",
    },
    {
        "name": "Contentment",
        "section": "Heart and mind",
        "question": "Why am I never satisfied?",
        "summary": "Contentment is learned, not bought. It grows from knowing that God will never leave you.",
        "guidance": (
            "The Bible is blunt that more money and more things do not satisfy. Paul says he had to "
            "learn contentment, in plenty and in need, and that the secret was Christ's strength. "
            "Hebrews gives the reason we can be content: God has promised never to leave us."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 12:15", "note": "Life is not measured by how much you own."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 4:11-13", "note": "Paul learned to be content with much or little, through Christ's strength."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Timothy 6:6-8", "note": "Godliness with contentment is great gain; we brought nothing in and take nothing out."},
            {"voice": "The apostles", "who": "The letter to the Hebrews", "reference": "Hebrews 13:5", "note": "Be content, because God has said he will never leave you."},
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 5:10", "note": "Whoever loves money never has enough of it."},
            {"voice": "Law and history", "who": "The Ten Commandments", "reference": "Exodus 20:17", "note": "Do not covet what belongs to someone else."},
        ],
        "practice": "Write down three things you already have that you once prayed for.",
        "prayer": "Lord, you are enough for me. Teach me to be content, and to trust you in plenty and in need.",
    },
    {
        "name": "Temptation",
        "section": "Heart and mind",
        "question": "How do I say no to temptation?",
        "summary": "Temptation comes to everyone. God always provides a way out, and his word is the first weapon.",
        "guidance": (
            "Jesus was tempted and answered each time with Scripture. He told his friends to watch and "
            "pray, because the spirit is willing but the flesh is weak. The apostles add that no "
            "temptation is unique and that God always makes a way of escape; Joseph shows what taking "
            "it looks like."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 26:41", "note": "Watch and pray: the spirit is willing, but the flesh is weak."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 4:4", "note": "Jesus answered temptation with the word of God."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 10:13", "note": "No temptation is beyond what others face, and God always makes a way out."},
            {"voice": "The apostles", "who": "James", "reference": "James 1:13-15", "note": "Temptation grows from our own desires; don't blame God for it."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 4:23", "note": "Guard your heart, because your whole life flows from it."},
            {"voice": "Law and history", "who": "Joseph", "hero": "joseph", "reference": "Genesis 39:9", "note": "Joseph refused: how could he do this and sin against God?"},
        ],
        "practice": "Know your weak moment, and plan your way out before it comes.",
        "prayer": "Lead me not into temptation, Lord, and show me the way out when it comes.",
    },
    {
        "name": "Purity",
        "section": "Heart and mind",
        "question": "Does God care what I think about and do with my body?",
        "summary": "Yes. Purity starts in the heart and the thought life, and the body is a temple of the Holy Spirit.",
        "guidance": (
            "Jesus blessed the pure in heart, because they will see God. The Bible treats the body as "
            "precious, bought at a price, and asks us to honour God with it. The way to a clean life "
            "is to fill the mind with what is true, lovely and good, and to keep to God's word."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:8", "note": "The pure in heart are blessed; they shall see God."},
            {"voice": "Wisdom", "who": "A psalmist", "reference": "Psalms 119:9", "note": "A young person keeps their way clean by living by God's word."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 6:19-20", "note": "Your body is the Holy Spirit's temple, bought at a price; honour God with it."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 4:8", "note": "Fill your mind with whatever is true, honest, pure and lovely."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Thessalonians 4:3-4", "note": "God's will is that we keep ourselves pure and honour our bodies."},
        ],
        "practice": "Notice what you feed your eyes and mind on this week, and swap one thing for something good.",
        "prayer": "Create in me a clean heart, O God. Help me to honour you with my mind and body.",
    },

    # ================================================================== relationships
    {
        "name": "Love",
        "section": "Relationships",
        "question": "What does real love look like?",
        "summary": "Love God with everything, and love your neighbour as yourself. Everything else hangs on these two.",
        "guidance": (
            "When asked for the greatest commandment, Jesus joined two from the Law: love God, love "
            "your neighbour. At the Last Supper he gave a new standard: love one another as I have "
            "loved you. Paul spells out what that love looks like day to day, and John says it comes "
            "from God, because God is love."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 22:37-39", "note": "The two great commandments: love God, and love your neighbour as yourself."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 13:34-35", "note": "Love each other as Jesus loved you; that is how the world will know his followers."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 13:4-7", "note": "Love is patient and kind; it is not proud, keeps no record of wrongs and never gives up."},
            {"voice": "The apostles", "who": "John", "reference": "1 John 4:7-8", "note": "Love comes from God, because God is love."},
            {"voice": "Law and history", "who": "The Law of Moses", "reference": "Leviticus 19:18", "note": "Don't take revenge or hold a grudge; love your neighbour as yourself."},
        ],
        "practice": "Read 1 Corinthians 13:4-7 and put your own name in place of 'charity'. Where does it not fit yet?",
        "prayer": "Lord, you loved me first. Teach me to love you with all I am, and to love the people around me as you do.",
    },
    {
        "name": "Forgiveness",
        "section": "Relationships",
        "question": "How can I forgive someone who hurt me?",
        "summary": "We forgive because we have been forgiven. It is not pretending the hurt never happened, but letting God be the judge.",
        "guidance": (
            "Jesus links our forgiving to our being forgiven, and told Peter to forgive without "
            "counting. On the cross he prayed for the men who crucified him. Forgiveness does not say "
            "the wrong was small; Joseph named what his brothers did as evil, and still left the "
            "judging to God and cared for them."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:14-15", "note": "Forgive others, as you hope to be forgiven by God."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 18:22", "note": "Asked if seven times was enough, Jesus said seventy times seven: stop counting."},
            {"voice": "Jesus", "who": "Jesus, on the cross", "reference": "Luke 23:34", "note": "Jesus prayed for those who were killing him."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 4:32", "note": "Be kind and forgive one another, as God in Christ forgave you."},
            {"voice": "The prophets", "who": "Micah", "reference": "Micah 7:18-19", "note": "God delights in mercy and throws our sins into the depths of the sea."},
            {"voice": "Law and history", "who": "Joseph", "hero": "joseph", "reference": "Genesis 50:19-21", "note": "Joseph told his brothers: you meant evil, God meant it for good; don't be afraid."},
        ],
        "practice": "Name the person. Tell God honestly what they did, then ask him for the strength to release them.",
        "prayer": "Father, forgive me as I forgive those who have wronged me. Give me grace to let go of what I cannot carry.",
    },
    {
        "name": "Marriage",
        "section": "Relationships",
        "question": "What does God say about marriage?",
        "summary": "Marriage is God's idea: two people joined as one for life, loving and serving each other as Christ loves his church.",
        "guidance": (
            "From the first pages of the Bible, marriage is a man and woman leaving their parents and "
            "becoming one. Jesus affirmed it and said no one should separate what God has joined. The "
            "apostles call husbands and wives to put each other first, in the pattern of Christ's own "
            "self-giving love."),
        "teachings": [
            {"voice": "Law and history", "who": "Genesis", "reference": "Genesis 2:24", "note": "A man leaves his parents and holds fast to his wife; the two become one."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 19:4-6", "note": "What God has joined together, let no one separate."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 5:21", "note": "Put each other first, out of reverence for God."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 5:25", "note": "Husbands, love your wives as Christ loved the church and gave himself for her."},
            {"voice": "The apostles", "who": "The letter to the Hebrews", "reference": "Hebrews 13:4", "note": "Honour marriage and keep it pure."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 18:22", "note": "Finding a wife is finding a good thing, and favour from the LORD."},
            {"voice": "The prophets", "who": "Malachi", "reference": "Malachi 2:14", "note": "God witnesses the covenant with the wife of your youth, your companion."},
        ],
        "practice": "Ask your husband or wife one question this week: “What can I do to make your day easier?”",
        "prayer": "Lord, bless our marriage (or the marriage you have for me). Teach us to love each other as Christ loves us.",
    },
    {
        "name": "Parents and children",
        "section": "Relationships",
        "question": "How should families treat each other?",
        "summary": "Children are to honour their parents; parents are to teach, train and not provoke their children.",
        "guidance": (
            "Honouring father and mother is the first commandment with a promise attached. Parents are "
            "given the task of passing on God's words in everyday life: at home, on the road, at "
            "bedtime and in the morning. Jesus welcomed children and said the kingdom belongs to them."),
        "teachings": [
            {"voice": "Law and history", "who": "The Ten Commandments", "reference": "Exodus 20:12", "note": "Honour your father and mother."},
            {"voice": "Law and history", "who": "Moses", "hero": "moses", "reference": "Deuteronomy 6:6-7", "note": "Keep God's words in your heart and talk about them with your children all day long."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 22:6", "note": "Train a child in the way they should go."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Psalms 127:3", "note": "Children are a gift and heritage from the LORD."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 10:14", "note": "Let the children come to me; the kingdom of God belongs to such as these."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 6:1-4", "note": "Children, obey and honour your parents; fathers, don't provoke your children, but bring them up in the Lord."},
        ],
        "practice": "Share one thing God has done for you with your child or parent this week.",
        "prayer": "Lord, bless my family. Help us to honour and teach one another in your ways.",
    },
    {
        "name": "Friendship",
        "section": "Relationships",
        "question": "What makes a true friend?",
        "summary": "A true friend loves at all times, tells the truth, and sticks closer than a brother. Choose friends who make you better.",
        "guidance": (
            "Proverbs is full of friendship: loyal in hard times, honest enough to sharpen you, and "
            "better than going it alone. Jonathan and David show a friendship that put the other "
            "first. Jesus calls his disciples friends, and shows the greatest love a friend can give."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 15:13-15", "note": "No love is greater than laying down your life for your friends; Jesus calls us his friends."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 17:17", "note": "A friend loves at all times."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 27:17", "note": "Friends sharpen each other, as iron sharpens iron."},
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 4:9-10", "note": "Two are better than one: if one falls, the other lifts him up."},
            {"voice": "Law and history", "who": "Jonathan and David", "hero": "jonathan", "reference": "1 Samuel 18:1", "note": "Jonathan loved David as his own soul."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 15:33", "note": "Bad company corrupts good character."},
        ],
        "practice": "Reach out to a friend who is going through something hard, and just be there.",
        "prayer": "Thank you, Jesus, for calling me your friend. Help me to be a faithful friend to others.",
    },
    {
        "name": "Loving your enemies",
        "section": "Relationships",
        "question": "How do I treat people who are against me?",
        "summary": "Don't repay evil with evil. Bless, pray for and do good to those who hate you, and overcome evil with good.",
        "guidance": (
            "Jesus' command to love enemies was not new to the Law, which told Israel to return an "
            "enemy's straying ox. But he made it the mark of God's children. The apostles show how: "
            "don't take revenge, feed your enemy when he is hungry, and answer insults with blessing."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:43-44", "note": "Love your enemies and pray for those who persecute you."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 6:27-28", "note": "Do good to those who hate you; bless those who curse you."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 12:20-21", "note": "Feed a hungry enemy; overcome evil with good."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "1 Peter 3:9", "note": "Don't pay back evil for evil or insult for insult; bless instead."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 25:21", "note": "If your enemy is hungry, give him bread."},
            {"voice": "Law and history", "who": "The Law of Moses", "reference": "Exodus 23:4-5", "note": "Even your enemy's lost ox should be brought home."},
        ],
        "practice": "Pray by name for someone who has hurt you, and ask God to bless them.",
        "prayer": "Lord Jesus, you prayed for your enemies. Soften my heart toward the people who are against me.",
    },
    {
        "name": "Words and the tongue",
        "section": "Relationships",
        "question": "Do my words really matter?",
        "summary": "Words carry life and death. We will give account for them, so let them build up rather than tear down.",
        "guidance": (
            "Jesus said we will answer for every careless word, and that a simple yes or no should be "
            "enough. James calls the tongue a small fire that can burn a forest. Proverbs puts it "
            "plainly: words can wound like a sword or heal like medicine."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 12:36-37", "note": "We will give account for every careless word we speak."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:37", "note": "Let your yes mean yes and your no mean no."},
            {"voice": "The apostles", "who": "James", "reference": "James 3:9-10", "note": "The same mouth shouldn't bless God and curse people."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 4:29", "note": "Speak only what builds others up and gives grace to those who hear."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 18:21", "note": "Death and life are in the power of the tongue."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 141:3", "note": "A prayer: set a guard over my mouth."},
        ],
        "practice": "For one day, say nothing about anyone that you wouldn't say to their face.",
        "prayer": "Set a watch, O LORD, before my mouth. Let my words today build up and not tear down.",
    },

    # ================================================================== work and money
    {
        "name": "Work",
        "section": "Work and money",
        "question": "Does my work matter to God?",
        "summary": "Work was part of God's good plan before the fall. Whatever you do, do it with all your heart, as for the Lord.",
        "guidance": (
            "Before sin entered the world, God put Adam in the garden to work it and keep it. Work is "
            "not a curse but a calling. The Bible praises diligence and warns against idleness, and "
            "Paul tells even slaves to work 'heartily, as to the Lord', because he is the one who "
            "rewards."),
        "teachings": [
            {"voice": "Law and history", "who": "Genesis", "reference": "Genesis 2:15", "note": "God gave the first man work: to tend and keep the garden."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 5:17", "note": "Jesus said his Father is always at work, and so is he."},
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 9:10", "note": "Whatever you do, do it with all your might."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 14:23", "note": "Hard work brings profit; mere talk leads to poverty."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Colossians 3:23-24", "note": "Work wholeheartedly, as for the Lord and not for people."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Thessalonians 3:10", "note": "Whoever refuses to work should not expect to eat."},
        ],
        "practice": "Before you start work tomorrow, offer it to God in one sentence.",
        "prayer": "Lord, my work belongs to you. Help me to do it well and honestly, as for you.",
    },
    {
        "name": "Money and possessions",
        "section": "Work and money",
        "question": "How should I think about money?",
        "summary": "Money is a good servant and a terrible master. You cannot serve God and money.",
        "guidance": (
            "Jesus spoke about money more than almost anything else, because it so easily takes God's "
            "place. Store up treasure in heaven, he said, because your heart follows your treasure. "
            "Paul warns that the love of money is a root of all kinds of evil, and tells the rich to "
            "be generous and hope in God, not in wealth."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:19-21", "note": "Store up treasure in heaven; your heart follows your treasure."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:24", "note": "No one can serve two masters: God and money."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Timothy 6:10", "note": "The love of money is a root of every kind of evil."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Timothy 6:17-19", "note": "Tell the rich to trust God, not riches, and to be generous."},
            {"voice": "Wisdom", "who": "Agur", "reference": "Proverbs 30:8-9", "note": "A wise prayer: give me neither poverty nor riches, just my daily bread."},
            {"voice": "The prophets", "who": "Haggai", "reference": "Haggai 1:5-6", "note": "When God is left out, wages go into a bag with holes."},
        ],
        "practice": "Look at where your money went last month. What does it say your heart treasures?",
        "prayer": "Lord, everything I have is yours. Keep me from loving money, and make me generous.",
    },
    {
        "name": "Generosity",
        "section": "Work and money",
        "question": "How much should I give?",
        "summary": "Give freely, cheerfully and in proportion to what you have. God loves a cheerful giver, and no one out-gives him.",
        "guidance": (
            "Jesus praised a widow who gave two small coins, because she gave all she had. The Law "
            "told Israel to open their hands wide to the poor and to bring the tithe. Paul says each "
            "should give as they have decided in their heart, not reluctantly, for God loves a "
            "cheerful giver."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 6:38", "note": "Give, and it will be given to you, pressed down and running over."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 12:43-44", "note": "The poor widow gave more than all the rich, because she gave everything."},
            {"voice": "Jesus", "who": "Jesus, quoted by Paul", "hero": "paul", "reference": "Acts 20:35", "note": "It is more blessed to give than to receive."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Corinthians 9:7", "note": "Give as you've decided in your heart; God loves a cheerful giver."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 19:17", "note": "Kindness to the poor is a loan to the LORD."},
            {"voice": "The prophets", "who": "Malachi", "reference": "Malachi 3:10", "note": "Bring the tithe, and see if God will not pour out a blessing."},
            {"voice": "Law and history", "who": "Moses", "hero": "moses", "reference": "Deuteronomy 15:7-8", "note": "Don't harden your heart to a poor brother; open your hand wide."},
        ],
        "practice": "Give something away this week, quietly, to someone who cannot pay you back.",
        "prayer": "Generous God, you gave your Son for me. Make me a cheerful giver.",
    },
    {
        "name": "Honesty",
        "section": "Work and money",
        "question": "Is a small lie really a big deal?",
        "summary": "Yes. God hates a false balance. Faithfulness in small things shows who we are in big ones.",
        "guidance": (
            "The Law demanded honest weights and measures in the market. Proverbs says the one who "
            "walks in integrity walks securely. Jesus said that faithfulness in very little shows "
            "faithfulness in much, and the apostles tell believers to put away lying and speak the "
            "truth to one another."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 16:10", "note": "Whoever is faithful in little is faithful in much."},
            {"voice": "Law and history", "who": "The Law of Moses", "reference": "Leviticus 19:35-36", "note": "Use honest weights and measures."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 11:1", "note": "God hates a rigged scale and delights in an honest one."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 10:9", "note": "Whoever walks in integrity walks securely."},
            {"voice": "The prophets", "who": "Zechariah", "reference": "Zechariah 8:16", "note": "Speak the truth to one another."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Ephesians 4:25", "note": "Put away lying; speak truth, because we belong to each other."},
        ],
        "practice": "If you have shaded the truth somewhere, go and set it straight.",
        "prayer": "Lord of truth, make me honest in small things and large, when I am seen and when I am not.",
    },
    {
        "name": "Justice and the poor",
        "section": "Work and money",
        "question": "What does God expect me to do about injustice?",
        "summary": "Do justly, love mercy, and speak up for those who cannot speak for themselves. Serving the least is serving Christ.",
        "guidance": (
            "The prophets thundered against worship that ignored the poor, the widow and the orphan. "
            "The Law built care for the poor into farming itself. Jesus said that whatever we do for "
            "the least of his brothers, we do for him, and James calls caring for widows and orphans "
            "pure religion."),
        "teachings": [
            {"voice": "The prophets", "who": "Micah", "reference": "Micah 6:8", "note": "God requires us to do justly, love mercy and walk humbly."},
            {"voice": "The prophets", "who": "Amos", "reference": "Amos 5:24", "note": "Let justice roll down like waters."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 1:17", "note": "Learn to do good: seek justice, help the oppressed, defend the orphan and widow."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 25:40", "note": "Whatever you did for the least of these, you did for me."},
            {"voice": "The apostles", "who": "James", "reference": "James 1:27", "note": "Pure religion: care for orphans and widows, and keep yourself unstained."},
            {"voice": "Wisdom", "who": "King Lemuel's mother", "reference": "Proverbs 31:8-9", "note": "Speak up for those who cannot speak, and defend the poor."},
            {"voice": "Law and history", "who": "The Law of Moses", "reference": "Leviticus 19:9-10", "note": "Leave the edges of your field for the poor and the stranger."},
        ],
        "practice": "Find one person or cause near you that speaks for the voiceless, and give your time or help.",
        "prayer": "Lord, open my eyes to the people I pass by. Teach me to do justly and love mercy.",
    },

    # ================================================================== walking with God
    {
        "name": "Purpose",
        "section": "Walking with God",
        "question": "What is my life for?",
        "summary": "To know God, love him and enjoy him, and to do everything, even eating and drinking, to his glory.",
        "guidance": (
            "The Preacher tried everything under the sun and concluded: fear God and keep his "
            "commandments. Jeremiah says the only thing worth boasting about is knowing God. Jesus "
            "came so that we might have life to the full, and Paul says that whatever we do, we can "
            "do it to the glory of God."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 10:10", "note": "Jesus came so that we may have life, and have it to the full."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:16", "note": "Let your light shine so that people see your good works and glorify God."},
            {"voice": "The prophets", "who": "Jeremiah", "reference": "Jeremiah 9:23-24", "note": "Don't boast in wisdom, strength or riches, but in knowing God."},
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 12:13", "note": "The conclusion of it all: fear God and keep his commandments."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 10:31", "note": "Whatever you do, even eating and drinking, do it all for God's glory."},
        ],
        "practice": "At the end of today, ask: where did I see God, and where did I show him to someone?",
        "prayer": "Lord, my life is yours. Let me know you, and let my light shine for your glory.",
    },
    {
        "name": "Prayer",
        "section": "Walking with God",
        "question": "How should I pray?",
        "summary": "Simply, honestly and often. Ask, seek and knock; God is near to all who call on him.",
        "guidance": (
            "Jesus taught his disciples to pray in secret, not for show, and to keep asking without "
            "giving up. He promised that those who ask receive. The apostles say to pray without "
            "ceasing and in everything give thanks. The prophets and psalms promise that God is near "
            "and answers when we call."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:6", "note": "Pray to your Father in secret, and he will reward you."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Luke 11:9-10", "note": "Ask, seek and knock: everyone who asks receives."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 15:7", "note": "Stay close to Jesus and his words, and ask."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Thessalonians 5:17-18", "note": "Pray without ceasing, and give thanks in everything."},
            {"voice": "The apostles", "who": "James", "reference": "James 5:16", "note": "The earnest prayer of a righteous person is powerful."},
            {"voice": "The prophets", "who": "Jeremiah", "reference": "Jeremiah 33:3", "note": "Call to God, and he will answer and show you great things."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 145:18", "note": "The LORD is near to all who call on him in truth."},
        ],
        "practice": "Pray the Lord's Prayer slowly (Matthew 6:9-13), stopping on each line to make it your own.",
        "prayer": "Lord, teach me to pray.",
    },
    {
        "name": "Faith and trust",
        "section": "Walking with God",
        "question": "How can I trust God when I can't see the way?",
        "summary": "Faith is trusting God's word before you see the outcome. Lean on him, not on your own understanding.",
        "guidance": (
            "Faith in the Bible is not a feeling but trust in a person. Proverbs says to trust the LORD "
            "with all your heart and he will make your paths straight. Habakkuk learned that 'the just "
            "shall live by his faith' in the worst of times, and Hebrews defines faith as confidence "
            "in what we hope for but cannot yet see."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 11:22-24", "note": "Have faith in God; believe as you pray."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 14:1", "note": "Don't let your heart be troubled: trust God, and trust me."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 3:5-6", "note": "Trust the LORD with all your heart; he will direct your paths."},
            {"voice": "The prophets", "who": "Habakkuk", "reference": "Habakkuk 2:4", "note": "The just shall live by faith."},
            {"voice": "The apostles", "who": "The letter to the Hebrews", "reference": "Hebrews 11:1", "note": "Faith is being sure of what we hope for and cannot yet see."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 10:17", "note": "Faith grows by hearing the word of God."},
        ],
        "practice": "Write down one promise of God and one situation where you need to trust it today.",
        "prayer": "Lord, I trust you with what I cannot see. Direct my path.",
    },
    {
        "name": "Knowing God's will",
        "section": "Walking with God",
        "question": "How do I know what God wants me to do?",
        "summary": "Start with his word, ask for wisdom, listen to wise counsel, and obey what you already know.",
        "guidance": (
            "God promises to guide those who seek him. His word is a lamp for the next step, not "
            "always a floodlight for the whole road. James promises wisdom to anyone who asks. Paul "
            "says a renewed mind learns to recognise God's good will, and Jesus says that willingness "
            "to do God's will comes before knowing it."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 7:17", "note": "Whoever is willing to do God's will shall know the truth."},
            {"voice": "Wisdom", "who": "A psalmist", "reference": "Psalms 119:105", "note": "God's word is a lamp for your feet and a light for your path."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 32:8", "note": "God promises to instruct and guide you with his eye upon you."},
            {"voice": "Wisdom", "who": "Solomon", "reference": "Proverbs 15:22", "note": "Plans succeed with many advisers."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 30:21", "note": "You will hear a word behind you: this is the way, walk in it."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 12:2", "note": "Be transformed by a renewed mind, and you'll recognise God's good will."},
            {"voice": "The apostles", "who": "James", "reference": "James 1:5", "note": "If you lack wisdom, ask God; he gives generously."},
        ],
        "practice": "Before a decision, pray, read, and ask one wise person you trust.",
        "prayer": "Lord, show me the way I should walk. I want to do your will; give me wisdom and light.",
    },
    {
        "name": "Rest",
        "section": "Walking with God",
        "question": "Is it all right to stop?",
        "summary": "Yes. God rested, commanded rest, and invites the weary to come to him. Rest is a gift, not a weakness.",
        "guidance": (
            "God rested on the seventh day and made the sabbath a gift for people who would otherwise "
            "never stop. Jesus took his tired disciples away to rest, and invited everyone who labours "
            "and is heavy laden to come to him. Stillness is where we learn again that he is God and "
            "we are not."),
        "teachings": [
            {"voice": "Law and history", "who": "Genesis", "reference": "Genesis 2:2-3", "note": "God rested on the seventh day and blessed it."},
            {"voice": "Law and history", "who": "The Ten Commandments", "reference": "Exodus 20:8-10", "note": "Remember the sabbath: six days to work, and one to rest."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 11:28-30", "note": "Come to me, all who are weary, and I will give you rest."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 6:31", "note": "Come away to a quiet place and rest a while."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 2:27", "note": "The sabbath was made for people, not people for the sabbath."},
            {"voice": "Wisdom", "who": "The sons of Korah", "reference": "Psalms 46:10", "note": "Be still, and know that I am God."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 30:15", "note": "In returning and rest you are saved; quietness and trust are your strength."},
        ],
        "practice": "Set aside one unhurried hour this week with no screen, and spend some of it with God.",
        "prayer": "Lord, I am tired. I come to you for rest. Teach me to be still and know that you are God.",
    },
    {
        "name": "Serving others",
        "section": "Walking with God",
        "question": "What does it mean to be great?",
        "summary": "In God's kingdom the greatest is the servant. Jesus came not to be served, but to serve.",
        "guidance": (
            "Jesus overturned every idea of greatness: the first will be the servant of all. He washed "
            "his disciples' feet and told them to do the same. Even Rehoboam's old advisers knew that "
            "a leader who serves his people is followed for ever. The apostles call every believer to "
            "use their gifts to serve one another in love."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Mark 10:43-45", "note": "Whoever wants to be great must be the servant of all, as Jesus came to serve."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 13:14-15", "note": "Jesus washed his disciples' feet and told them to do the same."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Galatians 5:13", "note": "Use your freedom to serve one another in love."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 2:5-7", "note": "Have the mind of Christ, who took the form of a servant."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "1 Peter 4:10", "note": "Use whatever gift you have received to serve others."},
            {"voice": "Law and history", "who": "Rehoboam's old counsellors", "reference": "1 Kings 12:7", "note": "Serve the people, and they will serve you for ever."},
        ],
        "practice": "Look for the job nobody wants to do this week, and do it.",
        "prayer": "Lord Jesus, you came to serve. Give me a servant's heart.",
    },

    # ================================================================== hard times
    {
        "name": "Suffering",
        "section": "Hard times",
        "question": "Why is this happening to me?",
        "summary": "The Bible does not always answer why. It promises that God is with us in suffering, and that he works even this for good.",
        "guidance": (
            "Jesus told his friends plainly that in this world they would have trouble, and to take "
            "heart because he has overcome the world. Job worshipped in his loss without knowing why. "
            "The apostles teach that suffering can grow patience and hope, that our troubles are light "
            "beside the glory coming, and that God works all things together for good for those who "
            "love him."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 16:33", "note": "You will have trouble in this world, but take heart: I have overcome the world."},
            {"voice": "Wisdom", "who": "Job", "hero": "job", "reference": "Job 1:21", "note": "The LORD gave, and the LORD has taken away; blessed be his name."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 43:2", "note": "When you pass through deep waters and fire, God will be with you."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 8:28", "note": "God works all things together for good for those who love him."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 5:3-5", "note": "Suffering produces patience, character and a hope that does not disappoint."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Corinthians 4:17-18", "note": "Our troubles are light and brief next to the glory to come."},
            {"voice": "The apostles", "who": "James", "reference": "James 1:2-4", "note": "Trials test faith and make us complete."},
        ],
        "practice": "Tell God honestly how you feel. The Psalms give you permission to lament.",
        "prayer": "Lord, I don't understand this. Be with me in it, and work even this for good.",
    },
    {
        "name": "Grief and loss",
        "section": "Hard times",
        "question": "How do I grieve as a believer?",
        "summary": "Grieve honestly, as Jesus did. But not as those who have no hope.",
        "guidance": (
            "Jesus wept at his friend's grave, though he knew he would raise him. Grief is not a lack "
            "of faith. The Bible gives a time to weep, promises that God is close to the "
            "broken-hearted, and that joy will come in the morning. Paul does not tell grieving "
            "believers not to sorrow, but not to sorrow without hope."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 5:4", "note": "Those who mourn are blessed: they will be comforted."},
            {"voice": "Jesus", "who": "Jesus, at Lazarus' tomb", "reference": "John 11:35", "note": "Jesus grieved openly at his friend's grave, though he was about to raise him.", "example": True},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 34:18", "note": "The LORD is close to the broken-hearted."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 30:5", "note": "Weeping may last for the night, but joy comes in the morning."},
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 3:1-4", "note": "There is a time to weep and a time to mourn."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 61:3", "note": "God gives beauty for ashes and joy for mourning."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Thessalonians 4:13-14", "note": "Grieve, but not like those who have no hope."},
        ],
        "practice": "Let yourself grieve. Share one memory with someone, and one hope with God.",
        "prayer": "Lord, you wept too. Stay close to my broken heart, and hold my hope when I cannot.",
    },
    {
        "name": "Discouragement and doubt",
        "section": "Hard times",
        "question": "What do I do when I feel like giving up?",
        "summary": "Even prophets despaired. God meets the weary with rest, fresh strength and mercies that are new every morning.",
        "guidance": (
            "Elijah asked to die under a juniper tree, and God sent food and sleep before he sent new "
            "work. The Psalms talk honestly to a downcast soul. Thomas doubted, and Jesus came to him. "
            "The promise is not that we will never tire, but that God gives power to the faint and "
            "his mercies never run out."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus, to Thomas", "reference": "John 20:27", "note": "Jesus came to doubting Thomas and invited him to believe."},
            {"voice": "The prophets", "who": "An angel, to Elijah", "hero": "elijah", "reference": "1 Kings 19:7", "note": "Get up and eat, because the journey is too much for you."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 40:29-31", "note": "God gives power to the faint; those who wait on him renew their strength."},
            {"voice": "The prophets", "who": "Lamentations", "reference": "Lamentations 3:22-23", "note": "God's mercies never end; they are new every morning."},
            {"voice": "Wisdom", "who": "The sons of Korah", "reference": "Psalms 42:11", "note": "Why so downcast, my soul? Hope in God."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Galatians 6:9", "note": "Don't grow weary of doing good; the harvest will come."},
        ],
        "practice": "Eat, sleep and rest, then tell God honestly where you are.",
        "prayer": "Lord, I'm tired and my faith is small. Renew my strength, and help my unbelief.",
    },
    {
        "name": "Loneliness",
        "section": "Hard times",
        "question": "What if I feel completely alone?",
        "summary": "God has promised never to leave you or forsake you. He sets the lonely in families.",
        "guidance": (
            "Moses told Israel, and later Joshua, that God would never fail or forsake them. David "
            "wrote that even if father and mother abandon us, the LORD takes us in. Paul, deserted by "
            "everyone at his trial, wrote that the Lord stood with him. And Jesus' last words in "
            "Matthew are a promise: I am with you always."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 28:20", "note": "I am with you always, to the end of the age."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 14:18", "note": "I will not leave you as orphans; I will come to you."},
            {"voice": "Law and history", "who": "Moses", "hero": "moses", "reference": "Deuteronomy 31:6", "note": "God will never fail you or forsake you."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 27:10", "note": "Even if my parents forsake me, the LORD will take me in."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 68:6", "note": "God sets the lonely in families."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Timothy 4:16-17", "note": "Everyone deserted me, but the Lord stood with me and strengthened me."},
        ],
        "practice": "Reach out to one person today, even with a short message. Someone else may be lonely too.",
        "prayer": "Lord, you are with me even here. Set me in a family of your people.",
    },

    # ================================================================== the future
    {
        "name": "Hope",
        "section": "The future",
        "question": "Is there hope for my future?",
        "summary": "Yes. God has plans for his people, and a living hope kept in heaven that nothing can spoil.",
        "guidance": (
            "Jeremiah wrote to exiles far from home that God's thoughts toward them were of peace, to "
            "give them a future. The apostles call Christian hope 'lively', alive because Jesus rose, "
            "and an anchor for the soul. Hope in the Bible is not wishful thinking but confident "
            "waiting on a faithful God."),
        "teachings": [
            {"voice": "The prophets", "who": "Jeremiah", "reference": "Jeremiah 29:11", "note": "God's thoughts toward his people are of peace, to give them a future."},
            {"voice": "The prophets", "who": "Lamentations", "reference": "Lamentations 3:24", "note": "The LORD is my portion, so I will hope in him."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 39:7", "note": "What am I waiting for? My hope is in you."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "1 Peter 1:3-4", "note": "A living hope through Jesus' resurrection, and an inheritance that cannot fade."},
            {"voice": "The apostles", "who": "The letter to the Hebrews", "reference": "Hebrews 6:19", "note": "Hope is an anchor for the soul, sure and steady."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 15:13", "note": "May the God of hope fill you with joy and peace."},
        ],
        "practice": "Write down one fear about the future, and next to it one promise of God.",
        "prayer": "God of hope, fill me with joy and peace as I trust you with my future.",
    },
    {
        "name": "Death and eternal life",
        "section": "The future",
        "question": "What happens when we die?",
        "summary": "For those who trust Christ, death is not the end. Whoever believes in him has everlasting life and will be raised.",
        "guidance": (
            "Job believed that his Redeemer lives and that he would see God. Daniel foresaw the dead "
            "awaking. Jesus promised everlasting life to all who believe, called himself the "
            "resurrection and the life, and said he was preparing a place for his people. Paul could "
            "say that to die is gain, because death has lost its sting."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 3:16", "note": "Whoever believes in God's Son will not perish but have everlasting life."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 11:25-26", "note": "I am the resurrection and the life; whoever believes in me will live."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 14:2", "note": "In my Father's house are many rooms; I go to prepare a place for you."},
            {"voice": "Wisdom", "who": "Job", "hero": "job", "reference": "Job 19:25-26", "note": "I know that my Redeemer lives, and I will see God."},
            {"voice": "Wisdom", "who": "David", "hero": "david", "reference": "Psalms 23:4", "note": "Even in the valley of the shadow of death, you are with me."},
            {"voice": "The prophets", "who": "Daniel", "hero": "daniel", "reference": "Daniel 12:2", "note": "Those who sleep in the dust will awake."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Corinthians 15:54-55", "note": "Death is swallowed up in victory: where is its sting?"},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Philippians 1:21", "note": "To live is Christ, and to die is gain."},
        ],
        "practice": "Read John 11:25-26 and answer Jesus' question to Martha for yourself: 'Believest thou this?'",
        "prayer": "Lord Jesus, you are the resurrection and the life. I put my trust in you, in life and in death.",
    },
    {
        "name": "The return of Christ",
        "section": "The future",
        "question": "Is Jesus really coming back?",
        "summary": "Yes. No one knows the day or hour, so live ready: watching, working and waiting.",
        "guidance": (
            "Daniel saw one like the Son of man coming with the clouds of heaven. Jesus promised to "
            "come again and warned that no one knows when, so we should be ready. The apostles waited "
            "eagerly for him, explained that his delay is God's patience, giving time to repent, and "
            "ended the Bible with a prayer: come, Lord Jesus."),
        "teachings": [
            {"voice": "Jesus", "who": "Jesus", "reference": "John 14:3", "note": "I will come again and receive you to myself."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 24:36", "note": "No one knows the day or the hour."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 24:42-44", "note": "Watch and be ready, because he comes at an hour you don't expect."},
            {"voice": "The prophets", "who": "Daniel", "hero": "daniel", "reference": "Daniel 7:13-14", "note": "One like the Son of man comes with the clouds, and his kingdom never ends."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "1 Thessalonians 4:16-17", "note": "The Lord will descend from heaven, and we will be with him for ever."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "2 Peter 3:9", "note": "God isn't slow; he is patient, wanting everyone to repent."},
            {"voice": "The apostles", "who": "John's vision", "reference": "Revelation 22:20", "note": "Surely I come quickly. Amen. Come, Lord Jesus."},
        ],
        "practice": "If Jesus came back tomorrow, what would you want to have put right today?",
        "prayer": "Even so, come, Lord Jesus. Keep me ready and faithful until you do.",
    },
    {
        "name": "Judgement",
        "section": "The future",
        "question": "Will I have to answer for my life?",
        "summary": "Everyone will give account to God. But whoever trusts Christ has passed from death to life and does not come into condemnation.",
        "guidance": (
            "The Preacher ends by reminding us that God will bring every work into judgement. Jesus "
            "spoke of the Son of man separating the nations, and the apostles say we will each give "
            "account of ourselves. But Jesus also promised that whoever hears his word and believes "
            "will not come into condemnation. Judgement is real, and so is mercy."),
        "teachings": [
            {"voice": "Wisdom", "who": "The Preacher", "reference": "Ecclesiastes 12:13-14", "note": "Fear God and keep his commandments; every deed will be judged."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 25:31-32", "note": "The Son of man will come in glory and separate the nations."},
            {"voice": "Jesus", "who": "Jesus", "reference": "John 5:24", "note": "Whoever hears and believes has passed from death to life, and will not be condemned."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "2 Corinthians 5:10", "note": "We must all appear before the judgement seat of Christ."},
            {"voice": "The apostles", "who": "Paul", "hero": "paul", "reference": "Romans 14:12", "note": "Each of us will give account of himself to God."},
            {"voice": "The apostles", "who": "The letter to the Hebrews", "reference": "Hebrews 9:27-28", "note": "We die once and then face judgement; Christ was offered once to bear our sins."},
        ],
        "practice": "Live today as someone who will give account, and who is already forgiven.",
        "prayer": "Lord, I will stand before you one day. Thank you that in Christ I have passed from death to life.",
    },
    {
        "name": "All things new",
        "section": "The future",
        "question": "How does the story end?",
        "summary": "With a new heaven and a new earth, where God lives with his people, and there is no more death, crying or pain.",
        "guidance": (
            "The prophets saw a coming world with no more war, where the wolf lies down with the lamb "
            "and the earth is full of the knowledge of God. Jesus taught us to pray for that kingdom "
            "to come on earth as in heaven. The Bible ends where it began, in a garden city, with God "
            "wiping every tear away and saying, 'Behold, I make all things new.'"),
        "teachings": [
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 65:17", "note": "God will create new heavens and a new earth."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 2:4", "note": "Swords will be beaten into ploughshares; nations will learn war no more."},
            {"voice": "The prophets", "who": "Isaiah", "reference": "Isaiah 11:9", "note": "The earth will be full of the knowledge of the LORD."},
            {"voice": "Jesus", "who": "Jesus", "reference": "Matthew 6:10", "note": "Pray: your kingdom come, your will be done on earth as in heaven."},
            {"voice": "The apostles", "who": "Peter", "hero": "peter", "reference": "2 Peter 3:13", "note": "We look for new heavens and a new earth, where righteousness lives."},
            {"voice": "The apostles", "who": "John's vision", "reference": "Revelation 21:3-5", "note": "God will live with his people, wipe away every tear, and make all things new."},
        ],
        "practice": "Do one thing this week that looks like the world to come: make peace, heal, or give.",
        "prayer": "Thy kingdom come, thy will be done, on earth as it is in heaven.",
    },
]
