"""Following God's Blueprint: the plan God has drawn for his people to build on.

PATTERN: the verses that give the guide its picture (a pattern shown on the
mount, a house built on the rock).

PARTS: the sheets of the plan, in order: name, sheet, intro.

ITEMS: name, part, summary (the short answer), plain (in plain words), verses
[{reference, who, hero?, note}] (the build adds `text` and `red`), build (a few
things to do), ask (a question to ask yourself), example (optional:
{title, reference, text}, the plan at work in someone's life), see (optional:
{href, label}, a related study page).

TEST: the blueprint test, questions to measure a decision or a resolution by:
[{question, ask, reference}] (the build adds `text`), and WARNINGS, signs that
a resolution is not from above: [{sign, reference}].

Quote Scripture in 'single quotes', word for word; the build checks it.
"""

PATTERN = [
    {"reference": "Hebrews 8:5", "who": "The letter to the Hebrews", "note": "Moses was told to build everything by the pattern God showed him on the mountain."},
    {"reference": "Psalms 127:1", "who": "Solomon", "note": "Unless the LORD builds the house, the builders work for nothing."},
    {"reference": "Matthew 7:24-25", "who": "Jesus", "note": "Whoever hears Jesus' words and does them builds on rock, and the house stands."},
    {"reference": "Hebrews 11:10", "who": "The letter to the Hebrews", "note": "Abraham looked for a city whose builder and maker is God."},
]

PARTS = [
    {"name": "The foundation", "sheet": 1,
     "intro": "Salvation is where the building starts. God laid the foundation in Christ before we did anything, and everything else in the blueprint stands on it."},
    {"name": "Beyond the Ten", "sheet": 2,
     "intro": "The Ten Commandments are the frame, not the whole house. Jesus showed that God's law reaches the heart, and the Spirit writes it there."},
    {"name": "Every day", "sheet": 3,
     "intro": "A house is built one day at a time. These are the habits God gives for ordinary days."},
    {"name": "Solving problems God's way", "sheet": 4,
     "intro": "Conflicts and hard choices come to every life. Scripture gives a way to handle them, and shows it at work in real people."},
    {"name": "Understanding the times", "sheet": 5,
     "intro": "God's word does not change, but every generation has to read its own day by it. This is how to understand the times without being carried away by them."},
    {"name": "Ready for his return", "sheet": 6,
     "intro": "The plan ends where history ends: with Jesus coming back. Being ready is not guessing the date, but being found faithful when he comes."},
]

ITEMS = [
    # ================================================================== the foundation
    {
        "name": "God's plan from the beginning",
        "part": "The foundation",
        "summary": "Salvation was not a repair job. Before the world was made, God planned to save a people for himself in Christ.",
        "plain": (
            "The first promise of a Saviour comes in Eden, straight after the first sin: the woman's "
            "seed would crush the serpent's head. Paul says God chose us in Christ 'before the "
            "foundation of the world', and Peter says Christ was 'foreordained' for it. When the time "
            "was right, God sent his Son. The blueprint was drawn before the first stone was laid."),
        "verses": [
            {"reference": "Genesis 3:15", "who": "The LORD, to the serpent", "note": "The first promise: a child of the woman would crush the serpent's head."},
            {"reference": "Ephesians 1:4-5", "who": "Paul", "hero": "paul", "note": "God chose us in Christ before the world began, to be his children."},
            {"reference": "1 Peter 1:18-20", "who": "Peter", "hero": "peter", "note": "We were bought with Christ's blood, as planned before the foundation of the world."},
            {"reference": "Galatians 4:4-5", "who": "Paul", "hero": "paul", "note": "At the right time God sent his Son, to redeem us and make us his children."},
        ],
        "build": [
            "Read Genesis 3:15 and Galatians 4:4-5 side by side: the promise, and the promise kept.",
            "Thank God that your salvation was his idea before it was your need.",
        ],
        "ask": "Do I see my salvation as God's plan, or as something I achieved?",
    },
    {
        "name": "The problem: sin",
        "part": "The foundation",
        "summary": "Every plan answers a problem. Ours is sin, which cuts us off from God and ends in death.",
        "plain": (
            "The Bible is plain: 'all have sinned, and come short of the glory of God'. Sin is not only "
            "wrong deeds but a heart turned away, each of us to our own way. It puts a wall between us "
            "and God, and 'the wages of sin is death'. We cannot see why we need the foundation until "
            "we see the problem it answers."),
        "verses": [
            {"reference": "Romans 3:23", "who": "Paul", "hero": "paul", "note": "Everyone has sinned; no one reaches God's standard."},
            {"reference": "Isaiah 53:6", "who": "Isaiah", "note": "We have all wandered off our own way, and the LORD laid our sin on his servant."},
            {"reference": "Isaiah 59:2", "who": "Isaiah", "note": "Sin puts a wall between us and God."},
            {"reference": "Romans 6:23", "who": "Paul", "hero": "paul", "note": "Sin pays out death; God gives eternal life as a gift."},
            {"reference": "1 John 1:8", "who": "John", "note": "Saying we have no sin only fools ourselves."},
        ],
        "build": [
            "Be honest with God about one sin you usually excuse.",
            "Read Romans 6:23 and notice both halves: the wage and the gift.",
        ],
        "ask": "Am I measuring myself against other people, or against God's standard?",
    },
    {
        "name": "Jesus Christ, the cornerstone",
        "part": "The foundation",
        "summary": "There is only one foundation that holds: Jesus Christ, who died for sinners and rose again.",
        "plain": (
            "Isaiah saw God laying in Zion 'a precious corner stone, a sure foundation'. Paul, the wise "
            "masterbuilder, says no one can lay any other foundation than Jesus Christ. Peter told the "
            "council that there is no other name by which we must be saved. Christ, the just, suffered "
            "for the unjust, to bring us to God."),
        "verses": [
            {"reference": "Isaiah 28:16", "who": "Isaiah", "note": "God promised a tested, precious cornerstone; whoever trusts it will stand firm."},
            {"reference": "1 Corinthians 3:10-11", "who": "Paul", "hero": "paul", "note": "No one can lay any foundation other than Jesus Christ."},
            {"reference": "Acts 4:12", "who": "Peter", "hero": "peter", "note": "Salvation is found in no other name."},
            {"reference": "1 Peter 3:18", "who": "Peter", "hero": "peter", "note": "Christ, the righteous, died once for the unrighteous, to bring us to God."},
            {"reference": "John 1:29", "who": "John the Baptist", "hero": "john-the-baptist", "note": "Jesus is the Lamb of God who takes away the sin of the world."},
        ],
        "build": [
            "Write down, in one sentence, what Jesus has done for you.",
            "Whenever you hear a message about God, ask where Jesus stands in it.",
        ],
        "ask": "Is my hope resting on Jesus, or on something I have added to him?",
    },
    {
        "name": "Repent and believe",
        "part": "The foundation",
        "summary": "God's call to everyone: turn from sin, trust in Jesus, and be baptized in his name.",
        "plain": (
            "Jesus began his preaching with 'repent ye, and believe the gospel'. Repentance is a turning, "
            "from sin to God, not only feeling sorry. Faith is trusting that Jesus is Lord and that God "
            "raised him from the dead. On the day of Pentecost, Peter told the crowd to repent and be "
            "baptized, and promised them the gift of the Holy Ghost."),
        "verses": [
            {"reference": "Mark 1:15", "who": "Jesus", "note": "The time has come: turn back to God and believe the good news."},
            {"reference": "Acts 2:38", "who": "Peter", "hero": "peter", "note": "Repent, be baptized in the name of Jesus Christ, and receive the Holy Spirit."},
            {"reference": "Acts 3:19", "who": "Peter", "hero": "peter", "note": "Turn to God, and your sins will be wiped away."},
            {"reference": "Romans 10:9-10", "who": "Paul", "hero": "paul", "note": "Believe in your heart and say with your mouth that Jesus is Lord."},
            {"reference": "Ezekiel 18:31-32", "who": "Ezekiel", "note": "God takes no pleasure in anyone's death: turn, and live."},
        ],
        "build": [
            "If you have never done it, tell God in your own words that you are turning to him and trusting Jesus.",
            "If you have not been baptized, talk to a pastor about it.",
        ],
        "ask": "Is there something I am sorry for but have not yet turned away from?",
    },
    {
        "name": "Born again",
        "part": "The foundation",
        "summary": "Salvation is not a new rule book but a new life. God gives a new heart and makes a new creation.",
        "plain": (
            "Jesus told Nicodemus that no one can enter the kingdom of God unless he is born of water and "
            "of the Spirit. This is God's work, not ours: he saves us 'by the washing of regeneration, and "
            "renewing of the Holy Ghost'. The old life passes away, and the word of God plants a life that "
            "cannot die."),
        "verses": [
            {"reference": "John 3:5", "who": "Jesus, to Nicodemus", "note": "No one enters God's kingdom unless born of water and the Spirit."},
            {"reference": "Ezekiel 36:26", "who": "Ezekiel", "note": "God gives a new heart and a new spirit."},
            {"reference": "2 Corinthians 5:17", "who": "Paul", "hero": "paul", "note": "In Christ you are a new creation; the old has gone."},
            {"reference": "Titus 3:5", "who": "Paul", "hero": "paul", "note": "God saved us by his mercy, not our works, washing and renewing us by the Spirit."},
            {"reference": "1 Peter 1:23", "who": "Peter", "hero": "peter", "note": "We are born again through God's living and lasting word."},
        ],
        "build": [
            "Name one thing that has changed in you since you trusted Christ, and thank God for it.",
            "Pray for someone you know who needs a new start.",
        ],
        "ask": "Am I trying to improve my old life, or living the new one God has given me?",
    },
    {
        "name": "Kept by his hand",
        "part": "The foundation",
        "summary": "Those who belong to Christ are held by him. God finishes what he starts.",
        "plain": (
            "Jesus said his sheep hear his voice and follow him, and no one can pluck them out of his "
            "hand or his Father's. John wrote so that believers 'may know that ye have eternal life'. Paul "
            "was persuaded that nothing in all creation can separate us from the love of God, and that he "
            "who began a good work will finish it."),
        "verses": [
            {"reference": "John 10:27-29", "who": "Jesus", "note": "No one can snatch Jesus' sheep out of his hand, or his Father's."},
            {"reference": "1 John 5:11-13", "who": "John", "note": "Whoever has the Son has life, and can know it."},
            {"reference": "Romans 8:38-39", "who": "Paul", "hero": "paul", "note": "Nothing in all creation can separate us from God's love in Christ."},
            {"reference": "Philippians 1:6", "who": "Paul", "hero": "paul", "note": "God will finish the good work he began in you."},
            {"reference": "Jude 1:24", "who": "Jude", "note": "God is able to keep you from falling."},
        ],
        "build": [
            "When doubt comes, read John 10:27-29 aloud.",
            "Follow his voice in one thing you already know he has asked of you.",
        ],
        "ask": "Am I resting in God's hold on me, or only in my hold on him?",
    },

    # ================================================================== beyond the ten
    {
        "name": "Love fulfils the law",
        "part": "Beyond the Ten",
        "summary": "The whole law hangs on two commands: love God with everything, and love your neighbour as yourself.",
        "plain": (
            "The Ten Commandments are not set aside; they are summed up. Asked for the greatest "
            "commandment, Jesus joined two from the Law of Moses and said that on them 'hang all the law "
            "and the prophets'. Paul explains why: love does no harm to a neighbour, so love keeps every "
            "commandment about neighbours. The Ten tell us what love never does; love goes on to do what "
            "no list could name."),
        "verses": [
            {"reference": "Matthew 22:37-40", "who": "Jesus", "note": "The two great commandments: love God, and love your neighbour as yourself."},
            {"reference": "Deuteronomy 6:5", "who": "Moses", "hero": "moses", "note": "Love the LORD with all your heart, soul and strength."},
            {"reference": "Romans 13:8-10", "who": "Paul", "hero": "paul", "note": "Love does no harm to a neighbour, so love fulfils the law."},
            {"reference": "Galatians 5:14", "who": "Paul", "hero": "paul", "note": "The whole law is summed up in one command: love your neighbour."},
        ],
        "build": [
            "Take one of the Ten Commandments and ask what love would do beyond simply not breaking it.",
            "Read the Ten, then read Romans 13:8-10, and see how love holds them together.",
        ],
        "ask": "Am I keeping the rules but missing the love?",
        "see": {"href": "commandments-of-god.html", "label": "The Ten Commandments, in Commandments of God"},
    },
    {
        "name": "The law written on the heart",
        "part": "Beyond the Ten",
        "summary": "In the new covenant God does not carve his law on stone, but writes it on the heart by his Spirit.",
        "plain": (
            "Moses brought the law down on tables of stone. Jeremiah heard God promise something deeper: "
            "'I will put my law in their inward parts, and write it in their hearts'. Ezekiel heard the "
            "promise of a heart of flesh in place of a heart of stone. The apostles say this is the "
            "covenant Christ brought: believers are a letter from Christ, written 'not in tables of stone, "
            "but in fleshy tables of the heart'."),
        "verses": [
            {"reference": "Jeremiah 31:33", "who": "Jeremiah", "note": "God promised to write his law on his people's hearts."},
            {"reference": "Ezekiel 11:19-20", "who": "Ezekiel", "note": "God takes away the heart of stone and gives a heart that walks in his ways."},
            {"reference": "Hebrews 8:10", "who": "The letter to the Hebrews", "note": "The new covenant puts God's laws in our minds and hearts."},
            {"reference": "2 Corinthians 3:3", "who": "Paul", "hero": "paul", "note": "You are Christ's letter, written by the Spirit on hearts, not on stone."},
            {"reference": "Psalms 40:8", "who": "David", "hero": "david", "note": "I delight to do your will; your law is in my heart."},
        ],
        "build": [
            "Choose one verse and learn it by heart this week.",
            "Ask God to change what you want, not only what you do.",
        ],
        "ask": "Do I obey because I must, or because I have come to want what God wants?",
    },
    {
        "name": "Deeper than the letter",
        "part": "Beyond the Ten",
        "summary": "Jesus did not lower the standard; he took it to the heart. Anger and lust break the law before any act does.",
        "plain": (
            "In the Sermon on the Mount Jesus said he came not to destroy the law but to fulfil it, and "
            "that our righteousness must go beyond that of the scribes and Pharisees. 'Thou shalt not "
            "kill' reaches to anger and contempt; 'Thou shalt not commit adultery' reaches to the look of "
            "lust. God looks on the heart, so the blueprint starts there."),
        "verses": [
            {"reference": "Matthew 5:17", "who": "Jesus", "note": "Jesus came not to destroy the law, but to fulfil it."},
            {"reference": "Matthew 5:20", "who": "Jesus", "note": "Our righteousness must go deeper than the Pharisees' rule-keeping."},
            {"reference": "Matthew 5:21-22", "who": "Jesus", "note": "The command against murder reaches to anger and contempt."},
            {"reference": "Matthew 5:27-28", "who": "Jesus", "note": "The command against adultery reaches to the look of lust."},
            {"reference": "1 Samuel 16:7", "who": "The LORD, to Samuel", "hero": "samuel", "note": "People look at the outside; the LORD looks at the heart."},
        ],
        "build": [
            "Read Matthew 5 slowly, and stop at each 'But I say unto you'.",
            "Deal with anger before it turns into words.",
        ],
        "ask": "Would my heart pass the test that my actions pass?",
    },
    {
        "name": "Mercy, not only sacrifice",
        "part": "Beyond the Ten",
        "summary": "God wants mercy more than ritual. Religion that keeps the small rules and forgets justice and mercy has missed the point.",
        "plain": (
            "Hosea heard God say, 'I desired mercy, and not sacrifice'. Micah asked what God really wants, "
            "and answered: do justly, love mercy, walk humbly. Jesus told the Pharisees to go and learn "
            "what Hosea meant, and warned that tithing herbs while neglecting 'judgment, mercy, and faith' "
            "left the weightier matters of the law undone."),
        "verses": [
            {"reference": "Hosea 6:6", "who": "Hosea", "note": "God wants mercy and knowing him more than offerings."},
            {"reference": "Micah 6:6-8", "who": "Micah", "note": "Not rivers of oil, but to do justly, love mercy and walk humbly with God."},
            {"reference": "Matthew 9:13", "who": "Jesus", "note": "Go and learn what this means: I want mercy, not sacrifice."},
            {"reference": "Matthew 23:23", "who": "Jesus", "note": "Don't keep the small rules and neglect justice, mercy and faith."},
            {"reference": "James 2:13", "who": "James", "note": "Mercy triumphs over judgement."},
        ],
        "build": [
            "Look for one person who needs mercy from you more than correction.",
            "Ask whether one of your religious habits has become a substitute for kindness.",
        ],
        "ask": "Am I careful about small duties and careless about mercy?",
    },
    {
        "name": "The golden rule",
        "part": "Beyond the Ten",
        "summary": "Treat others the way you want to be treated. Jesus said this sums up the law and the prophets.",
        "plain": (
            "Jesus turned the whole law into one practical question: how would I want to be treated if I "
            "were in their place? The Law of Moses already said to love the stranger as yourself, "
            "remembering what it was to be a stranger. Paul adds that each of us should please our "
            "neighbour for his good, looking to the interests of others and not only our own."),
        "verses": [
            {"reference": "Matthew 7:12", "who": "Jesus", "note": "Do to others what you would want them to do to you."},
            {"reference": "Leviticus 19:34", "who": "The Law of Moses", "note": "Love the stranger as yourself; you were strangers once."},
            {"reference": "Romans 15:2", "who": "Paul", "hero": "paul", "note": "Please your neighbour for his good, to build him up."},
            {"reference": "Philippians 2:4", "who": "Paul", "hero": "paul", "note": "Look to the interests of others, not only your own."},
        ],
        "build": [
            "Before you answer someone, picture yourself in their place.",
            "Treat a newcomer this week the way you would want to be treated somewhere new.",
        ],
        "ask": "If I were on the other side of this, would I call it fair?",
    },
    {
        "name": "The fruit of the Spirit",
        "part": "Beyond the Ten",
        "summary": "The surest sign of God's work in a life is its fruit: love, joy, peace, patience, gentleness, goodness, faithfulness, meekness and self-control.",
        "plain": (
            "Paul lists the fruit of the Spirit and adds, 'against such there is no law'. No rule can "
            "command joy or produce gentleness; they grow when we stay joined to Christ, as branches to a "
            "vine. Peter tells believers to keep adding to their faith: virtue, knowledge, self-control, "
            "patience, godliness, kindness and love. This is what the Ten Commandments point towards but "
            "could never produce."),
        "verses": [
            {"reference": "Galatians 5:22-23", "who": "Paul", "hero": "paul", "note": "The fruit of the Spirit, which no law can command or forbid."},
            {"reference": "John 15:5", "who": "Jesus", "note": "Stay joined to Jesus, the vine, and you will bear much fruit."},
            {"reference": "2 Peter 1:5-8", "who": "Peter", "hero": "peter", "note": "Keep adding to your faith, so that you are never barren or fruitless."},
            {"reference": "Psalms 1:3", "who": "A psalmist", "note": "The one who delights in God's word is like a tree that bears fruit in its season."},
        ],
        "build": [
            "Read Galatians 5:22-23 and pick the fruit you most lack. Pray for it every day this week.",
            "Spend unhurried time with Jesus in his word; fruit comes from staying close.",
        ],
        "ask": "Which fruit would the people closest to me say they see least in me?",
    },

    # ================================================================== every day
    {
        "name": "Take up your cross daily",
        "part": "Every day",
        "summary": "Following Jesus is a daily choice to put him first and self second.",
        "plain": (
            "Jesus said that anyone who follows him must deny himself and take up his cross daily. Paul "
            "could say, 'I die daily', and, 'I am crucified with Christ: nevertheless I live'. Each day "
            "begins with offering ourselves to God as a living sacrifice: our plans, our bodies and our "
            "time."),
        "verses": [
            {"reference": "Luke 9:23", "who": "Jesus", "note": "Deny yourself, take up your cross daily, and follow Jesus."},
            {"reference": "Galatians 2:20", "who": "Paul", "hero": "paul", "note": "The old self was crucified with Christ; now Christ lives in me."},
            {"reference": "Romans 12:1", "who": "Paul", "hero": "paul", "note": "Offer yourself to God as a living sacrifice."},
            {"reference": "1 Corinthians 15:31", "who": "Paul", "hero": "paul", "note": "Paul said he died to himself every day."},
        ],
        "build": [
            "Begin each day by giving it to God in one sentence: 'not my will, but thine'.",
            "Say no to yourself once each day for someone else's sake.",
        ],
        "ask": "Where did I choose myself over Christ this week?",
    },
    {
        "name": "Daily bread, daily prayer",
        "part": "Every day",
        "summary": "God invites us to come to him every day for what we need, and to keep a rhythm of prayer.",
        "plain": (
            "Jesus taught us to ask for this day's bread, not a year's supply, so that we come back to the "
            "Father every day. David prayed 'Evening, and morning, and at noon'. The psalms speak of a God "
            "who 'daily loadeth us with benefits'. Prayer is not an emergency line but the rhythm of the "
            "day."),
        "verses": [
            {"reference": "Matthew 6:11", "who": "Jesus", "note": "Ask the Father for today's bread."},
            {"reference": "Psalms 55:17", "who": "David", "hero": "david", "note": "Evening, morning and noon, David prayed, and God heard."},
            {"reference": "Psalms 5:3", "who": "David", "hero": "david", "note": "Begin the day by directing your prayer to God, and look up."},
            {"reference": "Psalms 68:19", "who": "David", "hero": "david", "note": "God loads us with good things every day."},
            {"reference": "Luke 11:1", "who": "The disciples", "note": "Seeing Jesus pray, his disciples asked him to teach them."},
        ],
        "build": [
            "Set three moments in your day for a short prayer.",
            "Pray the Lord's Prayer once a day this week, slowly.",
        ],
        "ask": "Do I pray only when I am in trouble?",
    },
    {
        "name": "Search the Scriptures daily",
        "part": "Every day",
        "summary": "The plan is written down. Read it every day, and check what you hear against it.",
        "plain": (
            "The Bereans are praised because they 'searched the scriptures daily, whether those things "
            "were so', even checking what Paul taught them. Moses told Israel to keep God's words in their "
            "hearts and talk about them at home and on the road. Paul says, 'Let the word of Christ dwell "
            "in you richly'."),
        "verses": [
            {"reference": "Acts 17:11", "who": "Luke, in Acts", "note": "The Bereans checked the Scriptures every day to see if what they heard was true."},
            {"reference": "Deuteronomy 6:6-7", "who": "Moses", "hero": "moses", "note": "Keep God's words in your heart, and talk about them all day long."},
            {"reference": "Psalms 1:2", "who": "A psalmist", "note": "Blessed is the one who delights in God's law and thinks on it day and night."},
            {"reference": "Colossians 3:16", "who": "Paul", "hero": "paul", "note": "Let the word of Christ live in you richly."},
        ],
        "build": [
            "Read one chapter a day; a Gospel is a good place to start.",
            "When you hear a sermon or a post about God, look up the verses for yourself.",
        ],
        "ask": "Do I know the plan well enough to notice when someone changes it?",
    },
    {
        "name": "Encourage one another daily",
        "part": "Every day",
        "summary": "No one builds alone. God's people are to strengthen each other every day.",
        "plain": (
            "Hebrews says to 'exhort one another daily', because sin hardens a heart that is left alone. "
            "The first believers met every day, ate together with glad hearts and praised God, and the "
            "Lord added to them daily. Paul tells the church to comfort and build up one another."),
        "verses": [
            {"reference": "Hebrews 3:13", "who": "The letter to the Hebrews", "note": "Encourage each other every day, so no one is hardened by sin."},
            {"reference": "Acts 2:46-47", "who": "Luke, in Acts", "note": "The first believers met daily, ate together gladly, and the church grew."},
            {"reference": "1 Thessalonians 5:11", "who": "Paul", "hero": "paul", "note": "Comfort one another and build each other up."},
            {"reference": "Proverbs 27:17", "who": "Solomon", "note": "Friends sharpen each other, as iron sharpens iron."},
        ],
        "build": [
            "Send a message of encouragement to someone who is struggling.",
            "Share a meal with another believer this week.",
        ],
        "ask": "Who has God put near me that I could strengthen?",
    },
    {
        "name": "Walk in the Spirit",
        "part": "Every day",
        "summary": "The Christian life does not run on willpower. The Holy Spirit leads, teaches and gives strength for each step.",
        "plain": (
            "Paul says, 'Walk in the Spirit, and ye shall not fulfil the lust of the flesh'. Those who are "
            "led by the Spirit of God are his children. Jesus promised that the Spirit would teach us all "
            "things, bring his words to mind, and guide us into all truth. Walking is step by step: "
            "listening, obeying, and keeping in step."),
        "verses": [
            {"reference": "Galatians 5:16", "who": "Paul", "hero": "paul", "note": "Walk by the Spirit, and you will not carry out the desires of the flesh."},
            {"reference": "Galatians 5:25", "who": "Paul", "hero": "paul", "note": "If the Spirit gives us life, let us keep in step with him."},
            {"reference": "Romans 8:14", "who": "Paul", "hero": "paul", "note": "Those led by God's Spirit are God's children."},
            {"reference": "John 14:26", "who": "Jesus", "note": "The Spirit teaches us and reminds us of what Jesus said."},
            {"reference": "John 16:13", "who": "Jesus", "note": "The Spirit of truth guides us into all truth."},
        ],
        "build": [
            "Before a decision, stop and ask the Spirit to guide you.",
            "When a verse comes to mind at the right moment, thank God and act on it.",
        ],
        "ask": "Am I trying to live the Christian life in my own strength?",
    },
    {
        "name": "Guard your words and thoughts",
        "part": "Every day",
        "summary": "What we think about becomes what we say and do. Guard the heart, and fill the mind with what is good.",
        "plain": (
            "Proverbs says to keep your heart with all diligence, 'for out of it are the issues of life'. "
            "David prayed that the words of his mouth and the meditation of his heart would please God. "
            "Paul tells believers to bring every thought captive to Christ, and to think on whatever is "
            "true, honest, just, pure and lovely."),
        "verses": [
            {"reference": "Proverbs 4:23", "who": "Solomon", "note": "Guard your heart, because your whole life flows from it."},
            {"reference": "Psalms 19:14", "who": "David", "hero": "david", "note": "A prayer: let my words and my thoughts please you, LORD."},
            {"reference": "2 Corinthians 10:5", "who": "Paul", "hero": "paul", "note": "Bring every thought captive and make it obey Christ."},
            {"reference": "Philippians 4:8", "who": "Paul", "hero": "paul", "note": "Think about whatever is true, honest, just, pure and lovely."},
        ],
        "build": [
            "Pray Psalm 19:14 before you speak or post.",
            "Notice one thought that keeps pulling you down, and answer it with a truth from Scripture.",
        ],
        "ask": "Would I be happy for God to read my thoughts and messages from this week?",
    },
    {
        "name": "Do good while you can",
        "part": "Every day",
        "summary": "Faith shows itself in good works. When you know the good you should do, do it.",
        "plain": (
            "Jesus 'went about doing good', and he told his followers to let their light shine so that "
            "others would glorify the Father. Paul says not to grow weary in doing good, but to do good to "
            "everyone as we have the chance. James is blunt: knowing the good we should do and not doing "
            "it is sin."),
        "verses": [
            {"reference": "Acts 10:38", "who": "Peter", "hero": "peter", "note": "Jesus went about doing good and healing, for God was with him."},
            {"reference": "Matthew 5:16", "who": "Jesus", "note": "Let your good works shine so that people give glory to God."},
            {"reference": "Galatians 6:9-10", "who": "Paul", "hero": "paul", "note": "Don't grow tired of doing good; do good to everyone while you have the chance."},
            {"reference": "Proverbs 3:27", "who": "Solomon", "note": "Don't hold back good when it is in your power to do it."},
            {"reference": "James 4:17", "who": "James", "note": "Knowing the good you ought to do and not doing it is sin."},
        ],
        "build": [
            "Do the good thing you have been putting off.",
            "Ask each day: who can I help who cannot help me back?",
        ],
        "ask": "What good do I already know I should do, and have not done?",
    },

    # ================================================================== solving problems
    {
        "name": "Pray before you act",
        "part": "Solving problems God's way",
        "summary": "The first step with any problem is to take it to God. He promises wisdom and peace to those who ask.",
        "plain": (
            "When the king asked Nehemiah what he wanted, Nehemiah prayed before he answered. When David "
            "came home to a burned city and his own men spoke of stoning him, he 'encouraged himself in "
            "the LORD his God' and asked God what to do before he did anything. James promises wisdom to "
            "anyone who asks, and Paul promises a peace that guards the heart."),
        "verses": [
            {"reference": "Philippians 4:6-7", "who": "Paul", "hero": "paul", "note": "Pray about everything, with thanks, and God's peace will guard you."},
            {"reference": "James 1:5", "who": "James", "note": "If you lack wisdom, ask God; he gives generously."},
            {"reference": "Proverbs 3:5-6", "who": "Solomon", "note": "Trust the LORD, not your own understanding, and he will direct your path."},
            {"reference": "Nehemiah 2:4-5", "who": "Nehemiah", "hero": "nehemiah", "note": "Between the king's question and his answer, Nehemiah prayed."},
            {"reference": "1 Samuel 30:6", "who": "David", "hero": "david", "note": "In the worst moment, David found his strength in the LORD."},
        ],
        "example": {
            "title": "Nehemiah's prayer before the king",
            "reference": "Nehemiah 2:1-8",
            "text": (
                "Nehemiah was the king's cupbearer, grieving over the broken walls of Jerusalem. When the "
                "king asked, 'For what dost thou make request?', Nehemiah silently 'prayed to the God of "
                "heaven', then asked boldly and wisely. The king gave him all he asked, and Nehemiah said "
                "it was 'according to the good hand of my God upon me'."),
        },
        "build": [
            "Before you reply, react or decide, stop and pray, even for ten seconds.",
            "Ask God for wisdom about this particular problem, and expect him to give it.",
        ],
        "ask": "Have I prayed about this, or only worried and planned?",
    },
    {
        "name": "Look at yourself first",
        "part": "Solving problems God's way",
        "summary": "Before you fix someone else, deal with your own part. It is the beam in your own eye that blurs the view.",
        "plain": (
            "Jesus said to cast the beam out of your own eye first, 'and then shalt thou see clearly'. "
            "That does not mean ignoring the other person's fault; it means seeing it clearly, without "
            "self-righteousness. Paul says to restore someone who has fallen 'in the spirit of meekness', "
            "remembering that you could be tempted too. The psalmist asks God to search his own heart."),
        "verses": [
            {"reference": "Matthew 7:3-5", "who": "Jesus", "note": "Take the beam out of your own eye, then you will see clearly to help your brother."},
            {"reference": "Galatians 6:1", "who": "Paul", "hero": "paul", "note": "Restore someone gently, watching yourself, because you could fall too."},
            {"reference": "Psalms 139:23-24", "who": "David", "hero": "david", "note": "A prayer: search me, God, and show me any wrong way in me."},
            {"reference": "Lamentations 3:40", "who": "Lamentations", "note": "Let us examine our ways and turn back to the LORD."},
        ],
        "build": [
            "Write down your own part in the problem, however small, before you write down theirs.",
            "Pray Psalm 139:23-24 and mean it.",
        ],
        "ask": "What would the other person say my part in this is?",
    },
    {
        "name": "Hear the whole matter",
        "part": "Solving problems God's way",
        "summary": "Don't decide before you have listened. Every story sounds right until the other side is heard.",
        "plain": (
            "Proverbs warns that answering before hearing is 'folly and shame', and that the first to state "
            "his case seems right until someone else examines him. Moses told Israel's judges to hear both "
            "sides, to treat the small and the great alike, and not to fear anyone, 'for the judgment is "
            "God's'. Even Nicodemus reminded the council that the law does not judge anyone before hearing "
            "him."),
        "verses": [
            {"reference": "Proverbs 18:13", "who": "Solomon", "note": "Answering before you have heard is foolish and shameful."},
            {"reference": "Proverbs 18:17", "who": "Solomon", "note": "The first to speak seems right, until the other side is heard."},
            {"reference": "Deuteronomy 1:16-17", "who": "Moses", "hero": "moses", "note": "Hear both sides, treat everyone alike, and fear no one: judgement belongs to God."},
            {"reference": "James 1:19", "who": "James", "note": "Be quick to listen, slow to speak and slow to anger."},
            {"reference": "John 7:51", "who": "Nicodemus", "note": "Our law judges no one without first hearing him."},
        ],
        "build": [
            "Before you take sides, ask for the other side of the story, and listen to the end.",
            "Repeat back what you heard before you give your answer.",
        ],
        "ask": "Have I heard everyone involved, or only the one who reached me first?",
    },
    {
        "name": "Go to them privately",
        "part": "Solving problems God's way",
        "summary": "Jesus gave a clear path for a wrong between believers: go alone first, then with one or two others, then to the church.",
        "plain": (
            "If someone wrongs you, Jesus said, go and tell him his fault 'between thee and him alone'. If "
            "he listens, you have won your brother. Only if he refuses do you take one or two others, and "
            "only after that the church. Proverbs agrees: settle it with your neighbour himself, and don't "
            "spread it. And if you remember that someone has something against you, go to him first, even "
            "before you worship."),
        "verses": [
            {"reference": "Matthew 18:15-17", "who": "Jesus", "note": "Go alone first; then with one or two witnesses; then to the church."},
            {"reference": "Matthew 5:23-24", "who": "Jesus", "note": "If someone has something against you, be reconciled before you bring your gift."},
            {"reference": "Proverbs 25:9", "who": "Solomon", "note": "Talk it over with your neighbour himself, and don't pass on what was said in confidence."},
            {"reference": "Leviticus 19:17", "who": "The Law of Moses", "note": "Don't hate your brother in your heart; speak to him plainly."},
        ],
        "build": [
            "If you have told others about a wrong but not the person, go to them first.",
            "Plan what you will say: the fault, plainly and gently, with the aim of winning them back.",
            "If the wrong is abuse or a crime, or you are not safe, go straight to people who can protect you and to the authorities. This path is for people who can safely talk, not for danger.",
        ],
        "ask": "Have I talked to them, or only about them?",
    },
    {
        "name": "Seek wise counsel",
        "part": "Solving problems God's way",
        "summary": "Hard problems are not meant to be solved alone. God works through godly advisers and through his people together.",
        "plain": (
            "Proverbs says 'in the multitude of counsellors there is safety'. When Moses was wearing "
            "himself out judging every dispute, his father-in-law Jethro gave him wise advice, and Moses "
            "listened. When the early church was divided over whether Gentile believers must keep the law "
            "of Moses, the apostles and elders met, listened, weighed the Scriptures, and reached a "
            "decision that 'seemed good to the Holy Ghost, and to us'."),
        "verses": [
            {"reference": "Proverbs 11:14", "who": "Solomon", "note": "Where there is no counsel people fall; with many advisers there is safety."},
            {"reference": "Proverbs 12:15", "who": "Solomon", "note": "A fool thinks his own way is right; the wise listen to advice."},
            {"reference": "Exodus 18:17-19", "who": "Jethro, to Moses", "hero": "moses", "note": "This is too heavy for you to carry alone; listen to my counsel."},
            {"reference": "Acts 15:28", "who": "The apostles and elders", "note": "Their decision seemed good to the Holy Spirit and to them together."},
        ],
        "example": {
            "title": "The council at Jerusalem",
            "reference": "Acts 15:1-31",
            "text": (
                "A sharp dispute arose over whether Gentile believers had to be circumcised. Instead of "
                "splitting, the church sent Paul and Barnabas to Jerusalem. The apostles and elders met, "
                "heard Peter, Barnabas and Paul tell what God had done, and listened to James show that the "
                "prophets agreed. They wrote one letter together, and when it was read, the believers "
                "'rejoiced for the consolation'."),
        },
        "build": [
            "Name two mature believers you could ask about this problem, and ask one of them this week.",
            "Listen to advice you don't want to hear as carefully as advice you do.",
        ],
        "ask": "Am I asking for counsel, or only for agreement?",
    },
    {
        "name": "Make peace, not a victory",
        "part": "Solving problems God's way",
        "summary": "The aim is not to win but to be reconciled. As far as it depends on you, live at peace with everyone.",
        "plain": (
            "When the herdsmen of Abram and Lot quarrelled, Abram said, 'Let there be no strife, I pray "
            "thee', and gave Lot first choice of the land. Abigail rode out to stop David taking revenge, "
            "and David thanked God for her. Jesus called peacemakers the children of God, and Paul says, "
            "'as much as lieth in you, live peaceably with all men'."),
        "verses": [
            {"reference": "Genesis 13:8-9", "who": "Abram, to Lot", "hero": "abraham", "note": "Let there be no quarrel between us; we are family. You choose first."},
            {"reference": "1 Samuel 25:32-33", "who": "David, to Abigail", "hero": "david", "note": "David blessed Abigail for keeping him from revenge."},
            {"reference": "Matthew 5:9", "who": "Jesus", "note": "Peacemakers are blessed; they will be called children of God."},
            {"reference": "Romans 12:18", "who": "Paul", "hero": "paul", "note": "As far as it depends on you, live at peace with everyone."},
            {"reference": "James 3:18", "who": "James", "note": "Peacemakers sow in peace and reap righteousness."},
        ],
        "example": {
            "title": "Abram gives Lot the choice",
            "reference": "Genesis 13:5-18",
            "text": (
                "There was not enough land for both families and their flocks, and their herdsmen began to "
                "fight. Abram was the elder and had every right to choose first. Instead he said, 'we be "
                "brethren', and let Lot take whatever land he wanted. Abram gave up the better pasture and "
                "kept the peace, and afterwards God promised him all the land he could see."),
        },
        "build": [
            "Ask what you could give up to keep the peace, without giving up what is right.",
            "Make the first move toward someone you are at odds with.",
        ],
        "ask": "Do I want to be proved right, or to be reconciled?",
    },
    {
        "name": "Leave the revenge to God",
        "part": "Solving problems God's way",
        "summary": "Never pay back evil for evil. God is the judge; our part is to do right, and even to do good to the one who wronged us.",
        "plain": (
            "David had King Saul at his mercy in a cave and would not harm him: 'The LORD judge between me "
            "and thee'. Jesus, when he was insulted, did not insult back, but 'committed himself to him "
            "that judgeth righteously'. Paul writes, 'Vengeance is mine; I will repay, saith the Lord', and "
            "tells us to overcome evil with good."),
        "verses": [
            {"reference": "Romans 12:17-19", "who": "Paul", "hero": "paul", "note": "Don't repay evil for evil or avenge yourself; leave it to God."},
            {"reference": "1 Peter 2:23", "who": "Peter", "hero": "peter", "note": "Jesus did not hit back, but entrusted himself to the righteous Judge."},
            {"reference": "Proverbs 20:22", "who": "Solomon", "note": "Don't say you will pay them back; wait for the LORD."},
            {"reference": "1 Samuel 24:12", "who": "David, to Saul", "hero": "david", "note": "Let the LORD judge between us; my hand will not touch you."},
            {"reference": "Deuteronomy 32:35", "who": "The song of Moses", "hero": "moses", "note": "Vengeance belongs to God."},
        ],
        "example": {
            "title": "David spares Saul",
            "reference": "1 Samuel 24:1-22",
            "text": (
                "Saul was hunting David to kill him, and one day he walked into the very cave where David "
                "was hiding. David's men said God had handed him over. David only cut off the edge of "
                "Saul's robe, and even that troubled his conscience. He called out to Saul and left the "
                "judgement to God, and Saul wept and said, 'Thou art more righteous than I'."),
        },
        "build": [
            "When you want to get even, pray for the person instead.",
            "Leaving revenge to God is not the same as hiding wrong. A crime or a danger should still be reported to the proper authorities.",
        ],
        "ask": "Am I waiting for God to act, or planning to act for him?",
    },
    {
        "name": "Forgive as you were forgiven",
        "part": "Solving problems God's way",
        "summary": "A problem between people is not settled until it is forgiven. We forgive because Christ has forgiven us.",
        "plain": (
            "Paul says to bear with and forgive one another, 'if any man have a quarrel against any: even "
            "as Christ forgave you, so also do ye'. Jesus told Peter to forgive not seven times but seventy "
            "times seven, and to forgive whenever we stand praying. Forgiving does not mean pretending "
            "nothing happened: Jesus said to rebuke a brother who sins, and to forgive him when he repents. "
            "Proverbs adds that it is a man's glory 'to pass over a transgression'."),
        "verses": [
            {"reference": "Colossians 3:13", "who": "Paul", "hero": "paul", "note": "If you have a quarrel with anyone, forgive, as Christ forgave you."},
            {"reference": "Matthew 18:21-22", "who": "Peter and Jesus", "hero": "peter", "note": "Not seven times, but seventy times seven: stop counting."},
            {"reference": "Luke 17:3-4", "who": "Jesus", "note": "Rebuke a brother who wrongs you, and forgive him when he repents, every time."},
            {"reference": "Mark 11:25", "who": "Jesus", "note": "When you pray, forgive anything you hold against anyone."},
            {"reference": "Ephesians 4:31-32", "who": "Paul", "hero": "paul", "note": "Put away bitterness; be kind and forgive, as God forgave you in Christ."},
            {"reference": "Proverbs 19:11", "who": "Solomon", "note": "Good sense is slow to anger, and it is glory to overlook an offence."},
        ],
        "example": {
            "title": "Joseph forgives his brothers",
            "reference": "Genesis 45:1-15",
            "text": (
                "Joseph's brothers had sold him into slavery. Years later, as ruler of Egypt, he had them "
                "in his power. He tested them first and saw that they had changed. Then he wept, told them, "
                "'I am Joseph your brother', and said, 'be not grieved, nor angry with yourselves'. He saw "
                "God's hand in what they had meant for evil, and he kissed them and provided for their "
                "families."),
        },
        "build": [
            "Name the person you need to forgive, and tell God you are letting go of the debt.",
            "Forgiving is not the same as trusting again at once. Trust is rebuilt over time; forgiveness can be given now.",
        ],
        "ask": "Am I holding a debt against someone, when God has forgiven me far more?",
    },
    {
        "name": "Fix the need, not just the complaint",
        "part": "Solving problems God's way",
        "summary": "Good solutions deal with the real cause, share the load, and put the right people in the right place.",
        "plain": (
            "When the Greek-speaking widows were being missed in the daily sharing of food, the apostles "
            "did not dismiss the complaint or try to do it all themselves. They asked the church to choose "
            "seven men 'of honest report, full of the Holy Ghost and wisdom' to see to it, and the word of "
            "God kept spreading. Jethro showed Moses the same wisdom: share the work with able, honest "
            "people. Paul adds, 'Let all things be done decently and in order'."),
        "verses": [
            {"reference": "Acts 6:1-4", "who": "The twelve apostles", "note": "The apostles answered a complaint by choosing trusted people to meet the need."},
            {"reference": "Exodus 18:21-22", "who": "Jethro, to Moses", "hero": "moses", "note": "Share the load with capable, honest people who fear God."},
            {"reference": "1 Corinthians 14:40", "who": "Paul", "hero": "paul", "note": "Let everything be done properly and in order."},
            {"reference": "1 Corinthians 6:5", "who": "Paul", "hero": "paul", "note": "Is there no one wise enough among you to settle a dispute between believers?"},
        ],
        "example": {
            "title": "The first complaint in the church",
            "reference": "Acts 6:1-7",
            "text": (
                "As the church grew, the widows of the Greek-speaking believers were being overlooked when "
                "food was shared out. The complaint could have split the church. The apostles called "
                "everyone together, asked them to choose seven trusted, Spirit-filled men, prayed over "
                "them and handed them the work. All seven had Greek names. The widows were cared for, and "
                "'the word of God increased'."),
        },
        "build": [
            "Ask what is really causing the problem, not only who is upset.",
            "Share the work: who else is able and trustworthy to help carry it?",
        ],
        "ask": "Does my solution fix the cause, or only quiet the complaint?",
    },

    # ================================================================== understanding the times
    {
        "name": "Men who understood the times",
        "part": "Understanding the times",
        "summary": "God wants his people to understand their own day, and to know what to do in it.",
        "plain": (
            "When David was becoming king, the men of Issachar were praised as those 'that had "
            "understanding of the times, to know what Israel ought to do'. Jesus rebuked people who could "
            "read the weather but not 'the signs of the times'. Paul says to walk wisely, 'Redeeming the "
            "time, because the days are evil', understanding what the will of the Lord is. Understanding "
            "the times always leads to knowing what to do."),
        "verses": [
            {"reference": "1 Chronicles 12:32", "who": "The men of Issachar", "note": "They understood the times and knew what Israel should do."},
            {"reference": "Matthew 16:2-3", "who": "Jesus", "note": "You can read the sky; can you not read the signs of the times?"},
            {"reference": "Romans 13:11-12", "who": "Paul", "hero": "paul", "note": "Know the time: wake up, and put on the armour of light."},
            {"reference": "Ephesians 5:15-17", "who": "Paul", "hero": "paul", "note": "Live wisely, make the most of the time, and understand the Lord's will."},
        ],
        "build": [
            "Pick one issue in the news and ask: what does Scripture say, and what should I do?",
            "Pray for wisdom to see your times through God's eyes, not only through your feed.",
        ],
        "ask": "Do I understand what is happening around me, and what God wants me to do about it?",
    },
    {
        "name": "What God has revealed",
        "part": "Understanding the times",
        "summary": "Daniel was told that knowledge would increase at the time of the end. What God reveals is ours to live by; what he keeps secret is his.",
        "plain": (
            "Daniel was told to seal his book 'even to the time of the end', when 'many shall run to and "
            "fro, and knowledge shall be increased', and 'the wise shall understand'. Some things are "
            "understood more fully as history unfolds. But Moses set the boundary: 'The secret things "
            "belong unto the LORD our God', while what is revealed belongs to us, 'that we may do' it. "
            "Understanding grows; the gospel does not change. Paul warns that even an angel preaching "
            "another gospel must be refused."),
        "verses": [
            {"reference": "Daniel 12:4", "who": "An angel, to Daniel", "hero": "daniel", "note": "Seal the book until the time of the end, when knowledge will increase."},
            {"reference": "Daniel 12:9-10", "who": "An angel, to Daniel", "hero": "daniel", "note": "The words are sealed until the end; the wise will understand."},
            {"reference": "Deuteronomy 29:29", "who": "Moses", "hero": "moses", "note": "Secret things belong to God; what he has revealed is ours to obey."},
            {"reference": "Proverbs 25:2", "who": "Solomon", "note": "God conceals, and it is an honour to search things out."},
            {"reference": "Galatians 1:8", "who": "Paul", "hero": "paul", "note": "Refuse any other gospel, even from an angel."},
            {"reference": "Hebrews 13:8", "who": "The letter to the Hebrews", "note": "Jesus Christ is the same yesterday, today and for ever."},
        ],
        "build": [
            "When someone claims a new revelation, test it against what is already written.",
            "Study one prophecy with care this month, using the whole Bible and not a single verse.",
        ],
        "ask": "Am I looking for new truth, or for a deeper grasp of the truth already given?",
    },
    {
        "name": "Test what you hear",
        "part": "Understanding the times",
        "summary": "Not every voice that speaks about God speaks for God. Test every teaching by Scripture and by its fruit.",
        "plain": (
            "John says, 'believe not every spirit, but try the spirits whether they are of God'. Paul says, "
            "'Prove all things; hold fast that which is good'. Isaiah gives the measuring line: 'To the law "
            "and to the testimony'. Jesus warned that many would come in his name and deceive many, and Paul "
            "foresaw a time when people would collect teachers to tell their itching ears what they wanted "
            "to hear."),
        "verses": [
            {"reference": "1 John 4:1", "who": "John", "note": "Don't believe every spirit; test whether it is from God."},
            {"reference": "1 Thessalonians 5:21", "who": "Paul", "hero": "paul", "note": "Test everything; hold on to what is good."},
            {"reference": "Isaiah 8:20", "who": "Isaiah", "note": "If they don't speak according to God's word, there is no light in them."},
            {"reference": "Matthew 24:4-5", "who": "Jesus", "note": "Don't be deceived: many will come in Jesus' name."},
            {"reference": "2 Timothy 4:3-4", "who": "Paul", "hero": "paul", "note": "People will gather teachers who tell them what they want to hear."},
        ],
        "build": [
            "Before you share a message about God, check it against the Bible.",
            "Ask of any teacher: does this point me to Jesus, and does it agree with the whole of Scripture?",
        ],
        "ask": "Do I believe things because they are written, or because they are popular?",
    },
    {
        "name": "Perilous times",
        "part": "Understanding the times",
        "summary": "Scripture describes the last days plainly so that we are not surprised, and tells us to hold on to what we have learned.",
        "plain": (
            "Paul told Timothy that in the last days people would be 'lovers of their own selves' and "
            "'lovers of pleasures more than lovers of God', keeping a form of godliness but denying its "
            "power. Jesus said love would grow cold as wickedness increased, and that life would go on as in "
            "the days of Noah and Lot until judgement came. Isaiah warned against calling evil good and good "
            "evil. The answer is not panic but faithfulness: 'continue thou in the things which thou hast "
            "learned'."),
        "verses": [
            {"reference": "2 Timothy 3:1-5", "who": "Paul", "hero": "paul", "note": "In the last days people will love themselves, money and pleasure more than God."},
            {"reference": "Matthew 24:12", "who": "Jesus", "note": "As wickedness increases, the love of many will grow cold."},
            {"reference": "Luke 17:26-28", "who": "Jesus", "note": "As in the days of Noah and Lot, life will go on as usual until the end."},
            {"reference": "Isaiah 5:20", "who": "Isaiah", "note": "Woe to those who call evil good and good evil."},
            {"reference": "2 Timothy 3:14-15", "who": "Paul", "hero": "paul", "note": "Keep on in what you have learned from the Scriptures."},
        ],
        "build": [
            "Read 2 Timothy 3:1-5 and ask honestly which of these has crept into your own life.",
            "Let the state of the world drive you to Scripture, not to fear.",
        ],
        "ask": "Am I shaped more by the spirit of the age, or by the word of God?",
    },
    {
        "name": "In the world, not of it",
        "part": "Understanding the times",
        "summary": "Jesus does not take his people out of the world. He keeps them from its evil and sends them to shine in it.",
        "plain": (
            "Jesus prayed, not that the Father would take his disciples out of the world, but that he would "
            "keep them from the evil. Daniel lived in Babylon and served its king, yet 'purposed in his "
            "heart that he would not defile himself'. Paul says not to be conformed to this world but "
            "transformed, and to shine 'as lights in the world'. John reminds us that the world is passing "
            "away, but whoever does the will of God lives for ever."),
        "verses": [
            {"reference": "John 17:15-16", "who": "Jesus", "note": "Jesus prayed that his people would be kept from evil, not taken out of the world."},
            {"reference": "Daniel 1:8", "who": "Daniel", "hero": "daniel", "note": "Daniel decided in his heart not to defile himself in Babylon."},
            {"reference": "Romans 12:2", "who": "Paul", "hero": "paul", "note": "Don't be squeezed into the world's mould; be transformed."},
            {"reference": "1 John 2:15-17", "who": "John", "note": "The world is passing away; whoever does God's will lives for ever."},
            {"reference": "Philippians 2:15", "who": "Paul", "hero": "paul", "note": "Shine like lights in a crooked world."},
        ],
        "build": [
            "Decide ahead, like Daniel, one line you will not cross at work or online.",
            "Look for one way to be a light right where you are.",
        ],
        "ask": "Would the people I work with know that I belong to Christ?",
    },
    {
        "name": "Redeem the time",
        "part": "Understanding the times",
        "summary": "Time is short and precious. Spend it on what lasts.",
        "plain": (
            "Moses prayed, 'So teach us to number our days, that we may apply our hearts unto wisdom'. Jesus "
            "said he must do the Father's work 'while it is day: the night cometh, when no man can work'. "
            "Paul tells believers to walk wisely towards those outside the church, 'redeeming the time'. "
            "There is a season for everything, and the wise use theirs for what matters for ever."),
        "verses": [
            {"reference": "Psalms 90:12", "who": "Moses", "hero": "moses", "note": "Teach us to count our days, so that we grow wise."},
            {"reference": "John 9:4", "who": "Jesus", "note": "Work while it is day; the night is coming when no one can work."},
            {"reference": "Colossians 4:5", "who": "Paul", "hero": "paul", "note": "Be wise with outsiders, and make the most of the time."},
            {"reference": "Ecclesiastes 3:1", "who": "The Preacher", "note": "There is a season for everything."},
        ],
        "build": [
            "Choose one hour this week, taken from something that doesn't matter, for something that lasts.",
            "Put down your phone for one meal and give your full attention to the people with you.",
        ],
        "ask": "If I had only this year, what would I stop, and what would I start?",
    },

    # ================================================================== ready for his return
    {
        "name": "Watch and pray",
        "part": "Ready for his return",
        "summary": "No one knows when Jesus will return, so his command to everyone is the same: watch.",
        "plain": (
            "Jesus compared himself to a man who went on a journey and gave each servant his work. 'And "
            "what I say unto you I say unto all, Watch.' Watching means staying spiritually awake: not "
            "weighed down by the 'cares of this life', but praying always. Paul says the day of the Lord "
            "comes like a thief, but believers are children of the day who stay awake and sober."),
        "verses": [
            {"reference": "Mark 13:33-37", "who": "Jesus", "note": "You don't know when the master is coming, so keep watch."},
            {"reference": "Luke 21:34-36", "who": "Jesus", "note": "Don't let the cares of life weigh you down; watch and pray always."},
            {"reference": "1 Thessalonians 5:2-6", "who": "Paul", "hero": "paul", "note": "The day comes like a thief, but children of the light stay awake."},
            {"reference": "Revelation 16:15", "who": "Jesus, in John's vision", "note": "I come as a thief; blessed is the one who keeps watch."},
        ],
        "build": [
            "Remember each day that he may come. Let that shape how you spend it.",
            "Notice which cares are weighing your heart down, and hand them to God.",
        ],
        "ask": "If Jesus came now, would he find me awake?",
    },
    {
        "name": "Keep your lamp full",
        "part": "Ready for his return",
        "summary": "Readiness cannot be borrowed at the last minute. Keep your faith supplied now.",
        "plain": (
            "In Jesus' story, ten young women waited for the bridegroom. Five took oil for their lamps, and "
            "five did not. When the cry came at midnight the foolish ones went to buy oil, and while they "
            "were gone, 'the door was shut'. Jesus said to be like servants dressed and ready with their "
            "lights burning, who open the moment their master knocks."),
        "verses": [
            {"reference": "Matthew 25:1-4", "who": "Jesus", "note": "Five took oil for their lamps, and five did not."},
            {"reference": "Matthew 25:10", "who": "Jesus", "note": "Those who were ready went in, and the door was shut."},
            {"reference": "Matthew 25:13", "who": "Jesus", "note": "Keep watch, because you don't know the day or the hour."},
            {"reference": "Luke 12:35-37", "who": "Jesus", "note": "Be dressed and ready, with your lamps burning."},
        ],
        "build": [
            "Keep a daily time with God, so your lamp does not run dry.",
            "Don't lean on someone else's faith; know him for yourself.",
        ],
        "ask": "Is my faith my own, or am I borrowing someone else's oil?",
    },
    {
        "name": "Be found faithful at work",
        "part": "Ready for his return",
        "summary": "Jesus gave each of us work to do until he comes. He is looking for faithful servants, not idle watchers.",
        "plain": (
            "In the parable of the pounds, the nobleman told his servants, 'Occupy till I come'. Jesus asked "
            "who the faithful and wise steward is, and answered: the one his lord 'shall find so doing' when "
            "he comes. The servant who was faithful with a little hears, 'Well done, thou good and faithful "
            "servant'. Paul says stewards must 'be found faithful', and that work done for the Lord is never "
            "wasted."),
        "verses": [
            {"reference": "Luke 19:13", "who": "Jesus", "note": "Put what I have given you to work until I come."},
            {"reference": "Luke 12:42-43", "who": "Jesus", "note": "Blessed is the servant his master finds at work when he comes."},
            {"reference": "Matthew 25:21", "who": "Jesus", "note": "Well done, good and faithful servant."},
            {"reference": "1 Corinthians 4:2", "who": "Paul", "hero": "paul", "note": "Stewards must be found faithful."},
            {"reference": "1 Corinthians 15:58", "who": "Paul", "hero": "paul", "note": "Keep working for the Lord; it is never in vain."},
        ],
        "build": [
            "Name the gifts and work God has trusted you with, and do one of them well this week.",
            "Don't stop doing good because the end seems near, or because it seems far away.",
        ],
        "ask": "What would Jesus find me doing with what he has given me?",
    },
    {
        "name": "Tell the good news",
        "part": "Ready for his return",
        "summary": "The end will come after the gospel is preached to all nations. Every believer has a part in telling it.",
        "plain": (
            "Jesus said the gospel of the kingdom 'shall be preached in all the world for a witness unto all "
            "nations; and then shall the end come'. Before he ascended, he sent his followers to make "
            "disciples of all nations, and promised them power from the Holy Ghost. Paul asks how people can "
            "believe in someone they have never heard of. Getting ready for his return includes helping "
            "others get ready too."),
        "verses": [
            {"reference": "Matthew 24:14", "who": "Jesus", "note": "The gospel will be preached to all nations, and then the end will come."},
            {"reference": "Matthew 28:19-20", "who": "Jesus", "note": "Go and make disciples of all nations; Jesus is with you always."},
            {"reference": "Acts 1:8", "who": "The risen Jesus", "note": "You will receive power and be my witnesses to the ends of the earth."},
            {"reference": "Romans 10:14-15", "who": "Paul", "hero": "paul", "note": "How will they believe in him if they have never heard?"},
        ],
        "build": [
            "Pray by name for one person who does not know Jesus, and look for a chance to tell them what he means to you.",
            "Support someone who takes the gospel where it has not yet gone.",
        ],
        "ask": "Who in my life has heard the good news from me?",
    },
    {
        "name": "Live clean and at peace",
        "part": "Ready for his return",
        "summary": "The hope of his coming is a reason to live a holy life now, so that he finds us at peace and without spot.",
        "plain": (
            "Peter asks, since everything will be dissolved, 'what manner of persons ought ye to be'? His "
            "answer: holy and godly, and diligent to be found 'in peace, without spot, and blameless'. John "
            "says that everyone who has this hope purifies himself. Paul says the grace of God teaches us to "
            "live soberly, righteously and godly now, 'Looking for that blessed hope'."),
        "verses": [
            {"reference": "2 Peter 3:11-14", "who": "Peter", "hero": "peter", "note": "Since all this will pass away, live holy lives and be found at peace."},
            {"reference": "1 John 3:2-3", "who": "John", "note": "Everyone who hopes to see him purifies himself."},
            {"reference": "Titus 2:11-13", "who": "Paul", "hero": "paul", "note": "Grace teaches us to live godly lives while we wait for our blessed hope."},
            {"reference": "1 Thessalonians 5:23", "who": "Paul", "hero": "paul", "note": "May God keep you blameless, spirit, soul and body, until Jesus comes."},
            {"reference": "Hebrews 12:14", "who": "The letter to the Hebrews", "note": "Pursue peace with everyone, and holiness."},
        ],
        "build": [
            "Make right one relationship you would not want to leave broken when he comes.",
            "Confess and turn from one habit you would be ashamed for him to find.",
        ],
        "ask": "What does the hope of his coming change about how I live this week?",
    },
    {
        "name": "Know how he will come",
        "part": "Ready for his return",
        "summary": "Don't be shaken by rumours or date-setters. When Jesus comes, the whole world will see it.",
        "plain": (
            "Jesus warned that if anyone says, 'Lo, here is Christ, or there; believe it not'. His coming "
            "will be like lightning across the whole sky, not a secret for a few. The angels said he will "
            "come back 'in like manner' as he went, and John saw that 'every eye shall see him'. Paul told "
            "the Thessalonians not to be 'soon shaken in mind' by claims that the day had already come. We "
            "do not know the day, but we know the one who is coming."),
        "verses": [
            {"reference": "Matthew 24:23-27", "who": "Jesus", "note": "Don't believe claims that Christ is here or there; his coming will be like lightning."},
            {"reference": "Acts 1:11", "who": "Two angels, at the ascension", "note": "This same Jesus will come back in the same way you saw him go."},
            {"reference": "Revelation 1:7", "who": "John's vision", "note": "He comes with the clouds, and every eye will see him."},
            {"reference": "2 Thessalonians 2:1-3", "who": "Paul", "hero": "paul", "note": "Don't be shaken or deceived by claims that the day has already come."},
        ],
        "build": [
            "Be wary of anyone who sets dates, or claims Christ has come in secret.",
            "Let the certainty of his coming give you calm, not fear.",
        ],
        "ask": "Am I more interested in the timing of his return than in being ready for it?",
    },
]

TEST = [
    {"question": "Does it agree with Scripture?",
     "ask": "A resolution that goes against what God has written is not his plan, however well it seems to work.",
     "reference": "Isaiah 8:20"},
    {"question": "Does it honour God?",
     "ask": "Could I do this openly in his name, and for his glory?",
     "reference": "1 Corinthians 10:31"},
    {"question": "Is it done in love?",
     "ask": "Love for God, and real good for everyone involved, including the other side.",
     "reference": "1 Corinthians 16:14"},
    {"question": "Is it true?",
     "ask": "Nothing hidden, twisted or half-told: the truth, spoken in love.",
     "reference": "Ephesians 4:15"},
    {"question": "Is it just and merciful?",
     "ask": "Fair to everyone, merciful where mercy is due, and humble before God.",
     "reference": "Micah 6:8"},
    {"question": "Have I dealt with my own part?",
     "ask": "Have I owned and put right what I did wrong, before pointing at anyone else?",
     "reference": "Matthew 7:5"},
    {"question": "Did I hear every side?",
     "ask": "Did I listen to everyone involved before I decided?",
     "reference": "Proverbs 18:13"},
    {"question": "Was it handled God's way?",
     "ask": "Privately first, then with others only if needed; not by gossip, pressure or revenge.",
     "reference": "Matthew 18:15"},
    {"question": "Does it make peace?",
     "ask": "Does it aim at reconciliation, as far as it depends on me, and not just at winning?",
     "reference": "Romans 12:18"},
    {"question": "Is it wisdom from above?",
     "ask": "Pure, peaceable, gentle, open to reason, full of mercy and good fruit, without favouritism or pretence.",
     "reference": "James 3:17"},
    {"question": "Do I have God's peace about it?",
     "ask": "After prayer, does the peace of Christ settle my heart, or is there a check I keep ignoring?",
     "reference": "Colossians 3:15"},
    {"question": "Would I be glad for Jesus to find me doing this?",
     "ask": "If he came as this was being settled, would I stand before him with confidence, or be ashamed?",
     "reference": "1 John 2:28"},
]

WARNINGS = [
    {"sign": "Envy or bitterness is driving it", "reference": "James 3:14-16"},
    {"sign": "It has to be kept hidden", "reference": "John 3:20-21"},
    {"sign": "It was rushed, without prayer or counsel", "reference": "Proverbs 19:2"},
    {"sign": "It pays someone back", "reference": "Romans 12:19"},
    {"sign": "It protects my pride", "reference": "Proverbs 16:18"},
    {"sign": "It spreads the matter, or stirs up division", "reference": "Proverbs 6:16-19"},
]
