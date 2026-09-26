"""Paul's Letters (Romans – Philemon), General Letters (Hebrews – Jude) and Revelation."""

_PRISON = " It is one of Paul's four 'prison letters' (with Ephesians, Philippians, Colossians and Philemon), usually dated to his house arrest in Rome, c. AD 60–62 (Acts 28:30)."
_PASTORAL = (
    " 1 and 2 Timothy and Titus are called the 'Pastoral Epistles'. The early church accepted them "
    "as Paul's; many modern scholars think a follower wrote them in his name, pointing to "
    "differences in vocabulary and church order, while others hold they come from Paul's last years.")

BOOKS = [
    # ------------------------------------------------------------ Paul
    {
        "name": "Romans",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to the Christians in Rome.",
        "summary": "Paul's fullest explanation of the gospel: all have sinned, all may be justified by faith in Christ, and nothing can separate us from God's love.",
        "author": "Paul the apostle",
        "author_note": "Pauline authorship is undisputed. Paul dictated it to Tertius (16:22) while in Corinth, probably staying with Gaius, before taking the collection to Jerusalem (15:25).",
        "date": "c. AD 57",
        "audience": "The church in Rome, Jews and Gentiles, which Paul had not yet visited",
        "setting": "Written from Corinth at the end of Paul's third journey",
        "origin": (
            "Paul planned to visit Rome on his way to Spain and wrote to set out the gospel he "
            "preached. Romans has shaped Christian thought more than almost any other book: it was "
            "central to the conversions of Augustine, Luther and John Wesley."),
        "description": (
            "Paul is 'not ashamed of the gospel'. Gentiles and Jews alike are guilty — 'all have "
            "sinned' — but are 'justified freely by his grace through the redemption that is in "
            "Christ Jesus', as Abraham was justified by faith. United with Christ, believers are "
            "dead to sin and alive to God; 'there is therefore now no condemnation', and nothing "
            "can separate them from God's love. Chapters 9–11 wrestle with Israel's unbelief and "
            "God's faithfulness. The letter ends with practical living: be 'a living sacrifice', "
            "love one another, respect authorities, and welcome one another."),
        "themes": ["Justification by faith", "Grace", "Life in the Spirit", "Israel and the Gentiles", "Living sacrifice"],
        "outline": [
            {"chapters": "1:1-3:20", "title": "All have sinned"},
            {"chapters": "3:21-5:21", "title": "Justified by faith"},
            {"chapters": "6-8", "title": "New life in Christ and the Spirit"},
            {"chapters": "9-11", "title": "God's plan for Israel and the nations"},
            {"chapters": "12-16", "title": "Living the gospel; greetings"},
        ],
        "key_verses": ["Romans 1:16", "Romans 3:23-24", "Romans 5:8", "Romans 6:23", "Romans 8:28", "Romans 12:1"],
        "key_people": ["Paul", "Phebe", "Priscilla and Aquila", "Tertius"],
        "christ": "Christ is the one 'whom God hath set forth to be a propitiation through faith in his blood' (3:25), the second Adam whose obedience brings life to many (5:19).",
        "peoples": ["romans", "israelites", "greeks"],
    },
    {
        "name": "1 Corinthians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's first surviving letter to the church in Corinth.",
        "summary": "Paul answers a divided, troubled church on unity, morality, marriage, worship and spiritual gifts — and writes the great chapters on love and resurrection.",
        "author": "Paul the apostle, with Sosthenes",
        "author_note": "Pauline authorship is undisputed. Paul wrote from Ephesus (16:8). He mentions an earlier letter (5:9), now lost.",
        "date": "c. AD 53–55",
        "audience": "The church Paul founded in Corinth (Acts 18)",
        "setting": "Written from Ephesus during Paul's third journey",
        "origin": (
            "Corinth was a wealthy, cosmopolitan port. Reports from 'them which are of the house "
            "of Chloe' and a letter of questions from the church prompted Paul's reply."),
        "description": (
            "The church is split into factions ('I am of Paul; and I of Apollos'). Paul answers "
            "with the 'foolishness' of Christ crucified. He deals with sexual immorality, lawsuits "
            "between believers, marriage and singleness, food offered to idols, order in worship "
            "and the Lord's Supper. The church is one body with many members and gifts, and the "
            "greatest way is love (chapter 13). Chapter 15 sets out the gospel of Christ's "
            "resurrection and the believer's future resurrection body."),
        "themes": ["Unity", "The cross", "Holiness", "Love", "Resurrection"],
        "outline": [
            {"chapters": "1-4", "title": "Divisions and the wisdom of the cross"},
            {"chapters": "5-7", "title": "Immorality, lawsuits and marriage"},
            {"chapters": "8-10", "title": "Food offered to idols and Christian freedom"},
            {"chapters": "11-14", "title": "Worship, spiritual gifts and love"},
            {"chapters": "15-16", "title": "The resurrection; the collection"},
        ],
        "key_verses": ["1 Corinthians 1:18", "1 Corinthians 10:13", "1 Corinthians 13:13", "1 Corinthians 15:3-4"],
        "key_people": ["Paul", "Sosthenes", "Apollos", "Cephas (Peter)", "Chloe's household"],
        "christ": "'Christ our passover is sacrificed for us' (5:7), and he is 'the firstfruits of them that slept' (15:20).",
        "peoples": ["greeks", "israelites", "romans"],
    },
    {
        "name": "2 Corinthians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's second surviving letter to the church in Corinth.",
        "summary": "Paul's most personal letter: strength in weakness, the ministry of reconciliation, generous giving, and a defence of his apostleship.",
        "author": "Paul the apostle, with Timothy",
        "author_note": "Pauline authorship is undisputed. Some scholars think it combines parts of more than one letter, including the 'tearful letter' Paul mentions (2:4).",
        "date": "c. AD 55–56",
        "audience": "The church in Corinth and believers in Achaia",
        "setting": "Written from Macedonia after Titus brought news from Corinth",
        "origin": (
            "After a painful visit and a severe letter, Paul was relieved to hear that most of the "
            "church had repented, but rival 'super apostles' were still undermining him."),
        "description": (
            "Paul praises 'the God of all comfort', explains his changed travel plans, and forgives "
            "the offender. His ministry is glorious yet carried in 'earthen vessels'. 'If any man be "
            "in Christ, he is a new creature', and God has given 'the ministry of reconciliation'. "
            "He urges generosity to the poor believers in Jerusalem: 'God loveth a cheerful giver.' "
            "In the last chapters he reluctantly lists his sufferings and tells of his 'thorn in the "
            "flesh' and God's answer: 'My grace is sufficient for thee.'"),
        "themes": ["Comfort in suffering", "Reconciliation", "Generosity", "Strength in weakness"],
        "outline": [
            {"chapters": "1-7", "title": "Paul's ministry and reconciliation"},
            {"chapters": "8-9", "title": "The collection for Jerusalem"},
            {"chapters": "10-13", "title": "Paul defends his apostleship"},
        ],
        "key_verses": ["2 Corinthians 4:7", "2 Corinthians 5:17", "2 Corinthians 5:21", "2 Corinthians 12:9"],
        "key_people": ["Paul", "Timothy", "Titus"],
        "christ": "'For he hath made him to be sin for us, who knew no sin; that we might be made the righteousness of God in him' (5:21).",
        "peoples": ["greeks", "israelites"],
    },
    {
        "name": "Galatians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to the churches of Galatia, in central Asia Minor (modern Turkey).",
        "summary": "Paul's urgent defence of the gospel of grace: we are justified by faith in Christ, not by the works of the law, and called to freedom in the Spirit.",
        "author": "Paul the apostle",
        "author_note": "Pauline authorship is undisputed. Scholars debate whether it went to southern Galatia (the churches of Acts 13–14), making it perhaps Paul's earliest letter, or to ethnic Galatians further north.",
        "date": "c. AD 48–55",
        "audience": "The churches of Galatia",
        "setting": "Teachers had told the Gentile believers they must be circumcised and keep the Law",
        "origin": (
            "Galatians is the only letter in which Paul skips his usual thanksgiving: 'I marvel "
            "that ye are so soon removed… unto another gospel.' Luther called it his favourite "
            "letter."),
        "description": (
            "Paul shows that his gospel came by revelation from Christ, and recounts rebuking Peter "
            "at Antioch. No one is justified by works of the law but by faith, as Abraham was; the "
            "law was a schoolmaster to bring us to Christ, and in him there is 'neither Jew nor "
            "Greek… bond nor free… male nor female'. Believers are sons, not slaves. 'Stand fast "
            "therefore in the liberty wherewith Christ hath made us free' — freedom to serve one "
            "another in love, walking in the Spirit and bearing his fruit."),
        "themes": ["Justification by faith", "Freedom", "Law and promise", "The fruit of the Spirit"],
        "outline": [
            {"chapters": "1-2", "title": "Paul's gospel is from God"},
            {"chapters": "3-4", "title": "Justified by faith, not by the law"},
            {"chapters": "5-6", "title": "Freedom and life in the Spirit"},
        ],
        "key_verses": ["Galatians 2:20", "Galatians 5:1", "Galatians 5:22-23", "Galatians 6:9"],
        "key_people": ["Paul", "Peter", "James", "Barnabas", "Titus"],
        "christ": "'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me' (2:20).",
        "peoples": ["greeks", "israelites"],
    },
    {
        "name": "Ephesians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter 'to the saints which are at Ephesus'.",
        "summary": "The riches of God's grace in Christ, the church as one body of Jew and Gentile, and how to walk worthy of that calling.",
        "author": "Paul the apostle",
        "author_note": "The letter names Paul as author and was accepted as his from the earliest times. Some modern scholars think a disciple wrote it; others note it may have been a circular letter, since 'at Ephesus' is missing from some early manuscripts." + _PRISON,
        "date": "c. AD 60–62",
        "audience": "The church at Ephesus and neighbouring churches",
        "setting": "Written from prison, probably in Rome",
        "origin": (
            "Paul had spent about three years in Ephesus (Acts 19–20). Unlike his other letters, "
            "Ephesians answers no specific problem, and reads like a meditation on God's eternal "
            "purpose in Christ."),
        "description": (
            "The first half is praise: chosen before the foundation of the world, redeemed, sealed "
            "with the Spirit. 'By grace are ye saved through faith… not of works.' Christ has "
            "broken down the wall between Jew and Gentile to make 'one new man'. The second half "
            "applies it: walk worthy in unity, put off the old man, be filled with the Spirit, "
            "submit to one another in marriage, family and work, and 'put on the whole armour of "
            "God'."),
        "themes": ["Grace", "Union with Christ", "The church", "Unity", "Spiritual warfare"],
        "outline": [
            {"chapters": "1-3", "title": "Our riches in Christ"},
            {"chapters": "4-6", "title": "Walking worthy of our calling"},
        ],
        "key_verses": ["Ephesians 2:8-9", "Ephesians 4:32", "Ephesians 6:11"],
        "key_people": ["Paul", "Tychicus"],
        "christ": "God purposes 'to gather together in one all things in Christ' (1:10); Christ loved the church and gave himself for it (5:25).",
        "peoples": ["greeks", "israelites", "romans"],
    },
    {
        "name": "Philippians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to the believers in Philippi, a Roman colony in Macedonia.",
        "summary": "A letter of joy written from prison: to live is Christ, have his humble mind, press toward the prize, and be content in all things.",
        "author": "Paul the apostle, with Timothy",
        "author_note": "Pauline authorship is undisputed." + _PRISON,
        "date": "c. AD 61–62",
        "audience": "The church at Philippi, the first church in Europe (Acts 16)",
        "setting": "Written from prison, probably in Rome",
        "origin": (
            "The Philippians had sent Paul a gift by Epaphroditus, who fell dangerously ill. Paul "
            "sent him back with this warm letter of thanks, in which 'joy' and 'rejoice' appear "
            "about sixteen times."),
        "description": (
            "Paul rejoices that his chains have spread the gospel: 'to live is Christ, and to die "
            "is gain.' He urges unity and humility, quoting an early hymn of Christ who 'made "
            "himself of no reputation… and became obedient unto death, even the death of the "
            "cross', and whom God highly exalted. He counts his impressive past as loss for "
            "Christ and presses 'toward the mark'. He closes: 'Rejoice in the Lord alway', 'be "
            "careful for nothing', and 'I can do all things through Christ which strengtheneth me.'"),
        "themes": ["Joy", "Humility", "Knowing Christ", "Contentment", "Partnership in the gospel"],
        "outline": [
            {"chapters": "1", "title": "Paul's chains advance the gospel"},
            {"chapters": "2", "title": "The mind of Christ"},
            {"chapters": "3", "title": "Knowing Christ; pressing on"},
            {"chapters": "4", "title": "Rejoice, pray, be content"},
        ],
        "key_verses": ["Philippians 1:21", "Philippians 2:5-8", "Philippians 4:6-7", "Philippians 4:13"],
        "key_people": ["Paul", "Timothy", "Epaphroditus", "Euodias and Syntyche"],
        "christ": "The great hymn of Philippians 2:6-11: Christ humbled himself to the cross, and 'every knee should bow… and every tongue confess that Jesus Christ is Lord'.",
        "peoples": ["romans", "greeks", "israelites"],
    },
    {
        "name": "Colossians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to the believers at Colosse, in the Lycus valley of Asia Minor.",
        "summary": "Christ is supreme over all creation and all powers; believers are complete in him and need nothing added.",
        "author": "Paul the apostle, with Timothy",
        "author_note": "The letter names Paul and was accepted as his in the early church; some modern scholars question it. It is closely linked to Philemon, carried by the same messengers." + _PRISON,
        "date": "c. AD 60–62",
        "audience": "The church at Colosse, founded by Epaphras",
        "setting": "Written from prison, probably in Rome",
        "origin": (
            "Paul had never visited Colosse. Epaphras brought news of teaching that mixed "
            "philosophy, Jewish rules and angel worship, suggesting Christ was not enough."),
        "description": (
            "Christ is 'the image of the invisible God, the firstborn of every creature: for by "
            "him were all things created'; 'in him dwelleth all the fulness of the Godhead "
            "bodily'. So believers should not be taken captive by philosophy, food laws or angel "
            "worship. Risen with Christ, they are to 'set your affection on things above', put on "
            "compassion, forgiveness and love, and do everything 'heartily, as to the Lord'."),
        "themes": ["The supremacy of Christ", "Completeness in Christ", "New life", "Heavenly-mindedness"],
        "outline": [
            {"chapters": "1-2", "title": "Christ over all; warnings against false teaching"},
            {"chapters": "3-4", "title": "New life in Christ; greetings"},
        ],
        "key_verses": ["Colossians 1:16", "Colossians 2:9", "Colossians 3:2", "Colossians 3:23"],
        "key_people": ["Paul", "Timothy", "Epaphras", "Tychicus", "Onesimus", "Luke"],
        "christ": "Colossians 1:15-20 is one of the highest descriptions of Christ in Scripture: creator, sustainer, head of the church, and reconciler of all things by the blood of his cross.",
        "peoples": ["greeks", "israelites"],
    },
    {
        "name": "1 Thessalonians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's first letter to the church at Thessalonica, capital of Macedonia.",
        "summary": "Encouragement to a young, persecuted church: keep growing in holiness, and take comfort that the Lord will return and the dead in Christ will rise.",
        "author": "Paul, with Silvanus (Silas) and Timothy",
        "author_note": "Pauline authorship is almost universally accepted. It is probably the earliest of Paul's letters, and one of the oldest books of the New Testament.",
        "date": "c. AD 50–51",
        "audience": "The new church in Thessalonica (Acts 17)",
        "setting": "Written from Corinth shortly after Paul was forced to leave Thessalonica",
        "origin": (
            "Paul had to flee Thessalonica after only a few weeks. Timothy returned with good news "
            "of their faith and questions about believers who had died."),
        "description": (
            "Paul thanks God that they 'turned to God from idols to serve the living and true God'. "
            "He recalls his gentle ministry among them 'as a nurse cherisheth her children', and "
            "urges holiness and quiet, honest work. Those who have died in Christ are not lost: "
            "'the Lord himself shall descend from heaven with a shout… and the dead in Christ "
            "shall rise first.' The day of the Lord will come as a thief, so they should be ready: "
            "'Rejoice evermore. Pray without ceasing. In every thing give thanks.'"),
        "themes": ["Faith, hope and love", "Holiness", "The return of Christ", "Comfort"],
        "outline": [
            {"chapters": "1-3", "title": "Thanksgiving and Paul's ministry among them"},
            {"chapters": "4-5", "title": "Holy living and the Lord's coming"},
        ],
        "key_verses": ["1 Thessalonians 4:16-17", "1 Thessalonians 5:16-18"],
        "key_people": ["Paul", "Silas", "Timothy"],
        "christ": "Believers 'wait for his Son from heaven… even Jesus, which delivered us from the wrath to come' (1:10).",
        "peoples": ["greeks", "israelites"],
    },
    {
        "name": "2 Thessalonians",
        "group": "pauline-epistles",
        "name_meaning": "Paul's second letter to the church at Thessalonica.",
        "summary": "The day of the Lord has not yet come; stand firm in persecution, and do not be idle while you wait.",
        "author": "Paul, with Silvanus (Silas) and Timothy",
        "author_note": "The letter names Paul and ends with his own handwritten greeting (3:17). The early church accepted it; some modern scholars think it was written later in his name.",
        "date": "c. AD 51",
        "audience": "The church in Thessalonica",
        "setting": "Written from Corinth, a few months after 1 Thessalonians",
        "origin": (
            "Someone had unsettled the church with a claim — perhaps in a forged letter — that "
            "'the day of Christ is at hand', and some had stopped working."),
        "description": (
            "Paul encourages the persecuted believers that God will give them rest when Jesus is "
            "revealed from heaven. The day of the Lord will not come until 'a falling away' and "
            "the revealing of 'that man of sin', whom the Lord will destroy 'with the brightness "
            "of his coming'. Meanwhile they should stand fast, and those who refuse to work should "
            "not eat: 'be not weary in well doing.'"),
        "themes": ["Perseverance", "The day of the Lord", "Diligent work"],
        "outline": [
            {"chapters": "1", "title": "Encouragement in persecution"},
            {"chapters": "2", "title": "The day of the Lord and the man of sin"},
            {"chapters": "3", "title": "Prayer, work and discipline"},
        ],
        "key_verses": ["2 Thessalonians 3:3", "2 Thessalonians 3:13"],
        "key_people": ["Paul", "Silas", "Timothy"],
        "christ": "Christ will be 'glorified in his saints, and to be admired in all them that believe' in that day (1:10).",
        "peoples": ["greeks"],
    },
    {
        "name": "1 Timothy",
        "group": "pauline-epistles",
        "name_meaning": "Paul's first letter to Timothy, his 'own son in the faith'.",
        "summary": "Instructions to a young pastor in Ephesus on sound teaching, prayer, church leaders, and godliness with contentment.",
        "author": "Paul the apostle",
        "author_note": "The letter names Paul as author." + _PASTORAL,
        "date": "c. AD 62–64",
        "audience": "Timothy, leading the church in Ephesus",
        "setting": "Written after Paul's first Roman imprisonment, from Macedonia (1:3)",
        "origin": (
            "Paul had left Timothy in Ephesus to stop false teachers obsessed with myths and "
            "genealogies, and wrote to guide him in ordering the church's life."),
        "description": (
            "Paul warns against false teaching and gives thanks that 'Christ Jesus came into the "
            "world to save sinners; of whom I am chief'. He calls for prayer for all, including "
            "rulers, since there is 'one mediator between God and men, the man Christ Jesus'. He "
            "sets out the qualifications for bishops (overseers) and deacons, the care of widows "
            "and the honour of elders. 'Let no man despise thy youth.' The love of money is 'the "
            "root of all evil', but 'godliness with contentment is great gain'."),
        "themes": ["Sound doctrine", "Church leadership", "Godliness", "Contentment"],
        "outline": [
            {"chapters": "1", "title": "Charge against false teaching"},
            {"chapters": "2-3", "title": "Prayer, worship and church leaders"},
            {"chapters": "4-6", "title": "Timothy's own ministry and conduct"},
        ],
        "key_verses": ["1 Timothy 1:15", "1 Timothy 2:5", "1 Timothy 4:12", "1 Timothy 6:6"],
        "key_people": ["Paul", "Timothy"],
        "christ": "'God was manifest in the flesh, justified in the Spirit, seen of angels… received up into glory' (3:16).",
        "peoples": ["greeks", "romans"],
    },
    {
        "name": "2 Timothy",
        "group": "pauline-epistles",
        "name_meaning": "Paul's second letter to Timothy.",
        "summary": "Paul's last letter, from a Roman prison facing death: guard the gospel, endure hardship, preach the word — 'I have finished my course'.",
        "author": "Paul the apostle",
        "author_note": "The letter names Paul as author and is full of personal details." + _PASTORAL,
        "date": "c. AD 64–67",
        "audience": "Timothy",
        "setting": "Written from Paul's final imprisonment in Rome, shortly before his execution under Nero",
        "origin": (
            "Deserted by most, with only Luke beside him, Paul asks Timothy to come quickly and "
            "bring his cloak and books. Church tradition says he was beheaded in Rome soon after."),
        "description": (
            "'God hath not given us the spirit of fear; but of power, and of love, and of a sound "
            "mind.' Paul urges Timothy not to be ashamed of the gospel, to endure hardness 'as a "
            "good soldier of Jesus Christ', and to handle the word rightly. Hard times will come, "
            "but 'all scripture is given by inspiration of God'. 'Preach the word; be instant in "
            "season, out of season.' Paul's farewell: 'I have fought a good fight, I have finished "
            "my course, I have kept the faith.'"),
        "themes": ["Faithfulness to the end", "Scripture", "Endurance", "Passing on the gospel"],
        "outline": [
            {"chapters": "1-2", "title": "Be strong and guard the gospel"},
            {"chapters": "3-4", "title": "Preach the word; Paul's farewell"},
        ],
        "key_verses": ["2 Timothy 1:7", "2 Timothy 2:15", "2 Timothy 3:16-17", "2 Timothy 4:7"],
        "key_people": ["Paul", "Timothy", "Lois and Eunice", "Luke", "Mark", "Demas"],
        "christ": "Christ 'hath abolished death, and hath brought life and immortality to light through the gospel' (1:10).",
        "peoples": ["romans", "greeks"],
    },
    {
        "name": "Titus",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to Titus, his Greek co-worker.",
        "summary": "Setting the churches of Crete in order: appoint godly elders, teach sound doctrine, and let grace produce good works.",
        "author": "Paul the apostle",
        "author_note": "The letter names Paul as author." + _PASTORAL,
        "date": "c. AD 63–65",
        "audience": "Titus, left in Crete",
        "setting": "Crete, after Paul's release from his first Roman imprisonment",
        "origin": (
            "Titus was an uncircumcised Greek convert whom Paul trusted with difficult tasks "
            "(Galatians 2:3; 2 Corinthians 8). Paul quotes a Cretan poet, Epimenides: 'The "
            "Cretians are alway liars.'"),
        "description": (
            "Paul tells Titus to appoint elders in every city who hold fast the faithful word, and "
            "to silence false teachers. He gives instructions for older and younger men and women "
            "and for servants, because 'the grace of God that bringeth salvation hath appeared to "
            "all men', teaching godly living. God saved us 'not by works of righteousness which we "
            "have done, but according to his mercy', so believers should be careful to maintain "
            "good works."),
        "themes": ["Church order", "Sound doctrine", "Grace and good works"],
        "outline": [
            {"chapters": "1", "title": "Appointing elders; false teachers"},
            {"chapters": "2", "title": "Sound teaching for every group"},
            {"chapters": "3", "title": "Saved by mercy for good works"},
        ],
        "key_verses": ["Titus 2:11-12", "Titus 3:5"],
        "key_people": ["Paul", "Titus", "Zenas", "Apollos"],
        "christ": "We look for 'the glorious appearing of the great God and our Saviour Jesus Christ; who gave himself for us' (2:13-14).",
        "peoples": ["greeks", "israelites"],
    },
    {
        "name": "Philemon",
        "group": "pauline-epistles",
        "name_meaning": "Paul's letter to Philemon, a believer in Colosse.",
        "summary": "A personal appeal: receive back Onesimus, your runaway slave, 'not now as a servant, but… a brother beloved'.",
        "author": "Paul the apostle, with Timothy",
        "author_note": "Pauline authorship is undisputed." + _PRISON,
        "date": "c. AD 60–62",
        "audience": "Philemon, Apphia, Archippus and the church in their house",
        "setting": "Written from prison; carried with Colossians",
        "origin": (
            "Onesimus had run away from his master Philemon — perhaps after stealing from him — "
            "and met Paul, who led him to Christ. Paul sends him back with this short letter."),
        "description": (
            "Paul thanks God for Philemon's love. Instead of commanding, he appeals 'for love's "
            "sake' for Onesimus ('useful'), who was once unprofitable but is now profitable. Paul "
            "asks Philemon to receive him as he would Paul himself: 'If he hath wronged thee, or "
            "oweth thee ought, put that on mine account… I will repay it.'"),
        "themes": ["Forgiveness", "Reconciliation", "Brotherhood in Christ"],
        "outline": [
            {"chapters": "1:1-7", "title": "Greeting and thanksgiving"},
            {"chapters": "1:8-22", "title": "The appeal for Onesimus"},
            {"chapters": "1:23-25", "title": "Greetings"},
        ],
        "key_verses": ["Philemon 1:16", "Philemon 1:18"],
        "key_people": ["Paul", "Philemon", "Onesimus", "Apphia", "Archippus"],
        "christ": "Paul's offer to pay Onesimus' debt pictures Christ, who took our debt on himself so we could be received by the Father.",
        "peoples": ["greeks", "romans"],
    },
    # ------------------------------------------------------------ general letters
    {
        "name": "Hebrews",
        "group": "general-epistles",
        "name_meaning": "Named for its readers: Jewish ('Hebrew') Christians.",
        "summary": "Jesus is better — than angels, Moses, the priesthood and the sacrifices — so hold fast in faith, like the heroes of Hebrews 11.",
        "author": "Unknown",
        "author_note": "The letter does not name its author. Paul, Barnabas, Apollos, Luke and others have been proposed; the church father Origen concluded, 'who wrote the epistle, in truth God knows.' The author knew Timothy (13:23).",
        "date": "Probably before AD 70, since it speaks of Temple sacrifices as still being offered",
        "audience": "Jewish Christians tempted to drift back to the old ways",
        "setting": "A community facing persecution; greetings are sent from 'they of Italy'",
        "origin": (
            "Hebrews calls itself 'the word of exhortation' (13:22) and reads like a sermon. It is "
            "written in the most polished Greek of the New Testament and explains the Old "
            "Testament's priesthood and sacrifices in the light of Christ."),
        "description": (
            "God has spoken finally 'by his Son', who is greater than the angels and than Moses. "
            "Jesus is the great high priest 'after the order of Melchisedec', who sympathises with "
            "our weakness and offered himself once for all, bringing a new and better covenant. "
            "Readers are warned not to drift or harden their hearts. Chapter 11 calls the roll of "
            "faith, from Abel to the prophets, and chapter 12 urges: run the race, 'looking unto "
            "Jesus the author and finisher of our faith'."),
        "themes": ["The superiority of Christ", "High priesthood", "The new covenant", "Faith", "Perseverance"],
        "outline": [
            {"chapters": "1-4", "title": "Christ greater than angels and Moses"},
            {"chapters": "5-10", "title": "Christ our high priest and perfect sacrifice"},
            {"chapters": "11-13", "title": "Faith, endurance and holy living"},
        ],
        "key_verses": ["Hebrews 4:12", "Hebrews 4:15", "Hebrews 11:1", "Hebrews 12:2", "Hebrews 13:8"],
        "key_people": ["Jesus", "Melchisedec", "Moses", "Abraham", "the heroes of faith"],
        "christ": "Hebrews is devoted to Christ's person and work: the Son, the high priest, the mediator of a better covenant, and the once-for-all sacrifice for sins.",
        "peoples": ["israelites", "egyptians"],
    },
    {
        "name": "James",
        "group": "general-epistles",
        "name_meaning": "Named after James (Jacob), 'a servant of God and of the Lord Jesus Christ'.",
        "summary": "Practical wisdom for real faith: endure trials, be doers of the word, tame the tongue, and show your faith by your works.",
        "author": "James, the Lord's brother (traditional)",
        "author_note": "Most identify the author with James the brother of Jesus (Matthew 13:55; Galatians 1:19), leader of the Jerusalem church (Acts 15), who was martyred c. AD 62 according to Josephus. Some scholars date the letter later.",
        "date": "c. AD 45–62",
        "audience": "'The twelve tribes which are scattered abroad' — Jewish Christians",
        "setting": "Written from Jerusalem to believers facing poverty and oppression",
        "origin": (
            "James echoes Jesus' Sermon on the Mount more than any other letter. Luther once called "
            "it 'an epistle of straw', but it complements Paul: true faith is never alone."),
        "description": (
            "'Count it all joy when ye fall into divers temptations', and ask God for wisdom. Be "
            "'doers of the word, and not hearers only'. Do not favour the rich over the poor. "
            "'Faith, if it hath not works, is dead', as Abraham and Rahab showed. The tongue is a "
            "fire that no man can tame. Submit to God, resist the devil, and do not boast about "
            "tomorrow. Be patient until the Lord comes, and pray: 'The effectual fervent prayer of "
            "a righteous man availeth much.'"),
        "themes": ["Living faith", "Trials", "The tongue", "Wealth and poverty", "Prayer"],
        "outline": [
            {"chapters": "1", "title": "Trials, temptation and doing the word"},
            {"chapters": "2", "title": "Favouritism; faith and works"},
            {"chapters": "3", "title": "The tongue and true wisdom"},
            {"chapters": "4-5", "title": "Humility, patience and prayer"},
        ],
        "key_verses": ["James 1:5", "James 1:22", "James 2:26", "James 4:7", "James 5:16"],
        "key_people": ["James", "Abraham", "Rahab", "Job", "Elijah"],
        "christ": "James calls Jesus 'the Lord of glory' (2:1) and applies his teaching throughout.",
        "peoples": ["israelites"],
    },
    {
        "name": "1 Peter",
        "group": "general-epistles",
        "name_meaning": "The first letter of the apostle Peter.",
        "summary": "Hope for believers suffering as strangers in the world: a living hope, a holy calling, and Christ's example in suffering.",
        "author": "Peter the apostle",
        "author_note": "Peter wrote 'by Silvanus' (5:12), who may have helped with the fluent Greek. He sends greetings from 'Babylon', generally taken as a code name for Rome. Some scholars think it was written after Peter's death in his name.",
        "date": "c. AD 62–64",
        "audience": "Christian 'strangers scattered' in five provinces of Asia Minor",
        "setting": "Believers facing slander and growing persecution",
        "origin": (
            "Tradition says Peter was crucified in Rome under Nero, c. AD 64–68. This letter "
            "prepares churches for the 'fiery trial' to come."),
        "description": (
            "God has given believers 'a lively hope by the resurrection of Jesus Christ' and an "
            "inheritance that cannot fade. They are 'a chosen generation, a royal priesthood, an "
            "holy nation'. Peter calls them to holy living among unbelievers, respect for "
            "authorities, and gentle witness, 'ready always to give an answer… of the hope that is "
            "in you'. Christ suffered, leaving an example. Elders are to shepherd the flock, and all "
            "are to cast their care on God and resist the devil."),
        "themes": ["Living hope", "Suffering and glory", "Holiness", "Identity as God's people"],
        "outline": [
            {"chapters": "1:1-2:10", "title": "Salvation and our new identity"},
            {"chapters": "2:11-4:19", "title": "Living as strangers; suffering well"},
            {"chapters": "5", "title": "Shepherds and the flock; standing firm"},
        ],
        "key_verses": ["1 Peter 1:3", "1 Peter 2:9", "1 Peter 3:15", "1 Peter 5:7"],
        "key_people": ["Peter", "Silvanus", "Mark"],
        "christ": "Christ 'his own self bare our sins in his own body on the tree… by whose stripes ye were healed' (2:24), echoing Isaiah 53.",
        "peoples": ["romans", "israelites", "babylonians"],
    },
    {
        "name": "2 Peter",
        "group": "general-epistles",
        "name_meaning": "The second letter of the apostle Peter.",
        "summary": "Peter's last words: grow in grace and knowledge, beware of false teachers, and be ready — the Lord is not slack but patient.",
        "author": "Peter the apostle (as the letter states)",
        "author_note": "The letter names Peter, who writes knowing his death is near (1:14) and recalls the transfiguration. Its authorship was doubted by some even in the early church, and many modern scholars date it later; it was accepted into the canon by the 4th century.",
        "date": "c. AD 64–68 (if by Peter)",
        "audience": "The same readers as 1 Peter (3:1)",
        "setting": "Written shortly before Peter's martyrdom",
        "origin": (
            "2 Peter shares much of its content with Jude. It is the only New Testament book to "
            "refer to Paul's letters as 'scriptures' (3:15-16)."),
        "description": (
            "God has given everything needed for life and godliness; add to your faith virtue, "
            "knowledge, self-control, patience, godliness, kindness and love. Peter saw Christ's "
            "glory on the holy mount, and prophecy came as 'holy men of God spake as they were "
            "moved by the Holy Ghost'. False teachers will come, but judgement is certain. Scoffers "
            "ask 'Where is the promise of his coming?' — yet God is 'not willing that any should "
            "perish', and the day of the Lord will come as a thief."),
        "themes": ["Spiritual growth", "The reliability of Scripture", "False teaching", "Christ's return"],
        "outline": [
            {"chapters": "1", "title": "Grow in grace; the sure word"},
            {"chapters": "2", "title": "False teachers and their judgement"},
            {"chapters": "3", "title": "The day of the Lord"},
        ],
        "key_verses": ["2 Peter 1:21", "2 Peter 3:9", "2 Peter 3:18"],
        "key_people": ["Peter", "Paul", "Noah", "Lot", "Balaam"],
        "christ": "Peter was an eyewitness of Christ's majesty when the Father said 'This is my beloved Son' (1:16-18).",
        "peoples": ["israelites"],
    },
    {
        "name": "1 John",
        "group": "general-epistles",
        "name_meaning": "The first letter of the apostle John.",
        "summary": "Assurance for believers: walk in the light, love one another, believe that Jesus came in the flesh — 'that ye may know that ye have eternal life'.",
        "author": "John the apostle (traditional)",
        "author_note": "The letter does not name its author, but its style and vocabulary closely match John's Gospel, and early tradition (Irenaeus, Polycarp) credits the apostle John, who writes as an eyewitness ('that which… we have looked upon, and our hands have handled').",
        "date": "c. AD 85–95",
        "audience": "Churches probably around Ephesus",
        "setting": "Some had left the church, denying that Jesus Christ had come in the flesh",
        "origin": (
            "1 John reads more like a sermon than a letter. It gives tests of genuine faith — "
            "believing the truth about Jesus, obeying his commandments, and loving one another — "
            "to reassure believers unsettled by false teachers."),
        "description": (
            "'God is light, and in him is no darkness at all.' If we confess our sins, he is "
            "faithful to forgive. Whoever says he knows God but does not keep his commandments or "
            "love his brother is a liar. Test the spirits: every spirit that confesses that Jesus "
            "Christ is come in the flesh is of God. 'God is love', and 'We love him, because he "
            "first loved us.' The letter closes with assurance: 'he that hath the Son hath life.'"),
        "themes": ["God is light", "God is love", "Assurance", "Truth about Christ", "Obedience"],
        "outline": [
            {"chapters": "1-2", "title": "Walking in the light"},
            {"chapters": "3-4", "title": "Children of God; love one another"},
            {"chapters": "5", "title": "Faith that overcomes; assurance of life"},
        ],
        "key_verses": ["1 John 1:9", "1 John 4:8", "1 John 4:19", "1 John 5:13"],
        "key_people": ["John"],
        "christ": "'We have an advocate with the Father, Jesus Christ the righteous: and he is the propitiation for our sins' (2:1-2).",
        "peoples": ["greeks"],
    },
    {
        "name": "2 John",
        "group": "general-epistles",
        "name_meaning": "The second letter of John.",
        "summary": "A short note to 'the elect lady': walk in truth and love, and do not welcome teachers who deny Christ came in the flesh.",
        "author": "'The elder' — John the apostle (traditional)",
        "author_note": "The writer calls himself 'the elder'. Tradition identifies him with the apostle John; some think 'John the elder' was a different leader in Ephesus. 2 and 3 John are the two shortest books of the Bible.",
        "date": "c. AD 85–95",
        "audience": "'The elect lady and her children' — probably a local church",
        "setting": "Travelling teachers spreading false ideas about Christ",
        "origin": (
            "The letter would fit on a single sheet of papyrus. It applies the teaching of 1 John "
            "to the practical question of hospitality."),
        "description": (
            "The elder rejoices that some are walking in truth, and repeats the commandment 'that "
            "we love one another'. Many deceivers do not confess that Jesus Christ is come in the "
            "flesh; the readers are not to receive them into their house or bid them God speed. "
            "He hopes to visit soon and speak 'face to face'."),
        "themes": ["Truth", "Love", "Discernment"],
        "outline": [
            {"chapters": "1:1-6", "title": "Walk in truth and love"},
            {"chapters": "1:7-13", "title": "Beware of deceivers"},
        ],
        "key_verses": ["2 John 1:6"],
        "key_people": ["The elder", "The elect lady"],
        "christ": "Whoever abides in the doctrine of Christ 'hath both the Father and the Son' (verse 9).",
        "peoples": [],
    },
    {
        "name": "3 John",
        "group": "general-epistles",
        "name_meaning": "The third letter of John.",
        "summary": "A personal note praising Gaius for hospitality to travelling missionaries and rebuking proud Diotrephes.",
        "author": "'The elder' — John the apostle (traditional)",
        "author_note": "The same 'elder' as 2 John. It is the shortest book of the Bible by word count in Greek.",
        "date": "c. AD 85–95",
        "audience": "Gaius, a beloved friend",
        "setting": "A local church where Diotrephes refused to welcome the elder's messengers",
        "origin": (
            "3 John gives a rare glimpse of everyday church life at the end of the first century: "
            "letters, travelling preachers, and a power struggle."),
        "description": (
            "The elder prays for Gaius's health and rejoices that he walks in truth. He commends "
            "Gaius for helping travelling brethren who went out 'for his name's sake'. Diotrephes, "
            "'who loveth to have the preeminence', refuses them and gossips against the elder. "
            "Demetrius has a good report. 'Follow not that which is evil, but that which is good.'"),
        "themes": ["Hospitality", "Truth", "Humility in leadership"],
        "outline": [
            {"chapters": "1:1-8", "title": "Gaius commended"},
            {"chapters": "1:9-14", "title": "Diotrephes and Demetrius"},
        ],
        "key_verses": ["3 John 1:4", "3 John 1:11"],
        "key_people": ["The elder", "Gaius", "Diotrephes", "Demetrius"],
        "christ": "The missionaries went out 'for his name's sake' (verse 7) — the name of Christ.",
        "peoples": ["greeks"],
    },
    {
        "name": "Jude",
        "group": "general-epistles",
        "name_meaning": "Named after Jude (Judas), 'the servant of Jesus Christ, and brother of James'.",
        "summary": "An urgent call to 'earnestly contend for the faith' against ungodly men who turn grace into an excuse for sin.",
        "author": "Jude, brother of James",
        "author_note": "Jude identifies himself as the brother of James, so most take him to be Jude (Judas), a brother of Jesus (Matthew 13:55). He quotes the book of Enoch (1 Enoch 1:9) and refers to a dispute over Moses' body found in Jewish tradition.",
        "date": "c. AD 65–80",
        "audience": "Believers threatened by false teachers",
        "setting": "Men had 'crept in unawares', denying the Lord and living immorally",
        "origin": (
            "Jude meant to write about 'the common salvation' but felt he had to write a warning "
            "instead. Much of it is closely parallel to 2 Peter 2."),
        "description": (
            "Jude reminds his readers of past judgements — Israel in the wilderness, the fallen "
            "angels, Sodom and Gomorrah — and compares the false teachers to Cain, Balaam and "
            "Korah: 'clouds they are without water… wandering stars'. Believers are to build "
            "themselves up in the faith, pray in the Holy Ghost, keep themselves in God's love, and "
            "show mercy. It ends with one of the Bible's great doxologies: 'Now unto him that is "
            "able to keep you from falling…'"),
        "themes": ["Contending for the faith", "Judgement on the ungodly", "Perseverance", "God's keeping power"],
        "outline": [
            {"chapters": "1:1-4", "title": "Contend for the faith"},
            {"chapters": "1:5-19", "title": "The false teachers and their doom"},
            {"chapters": "1:20-25", "title": "Keep yourselves; the doxology"},
        ],
        "key_verses": ["Jude 1:3", "Jude 1:24-25"],
        "key_people": ["Jude", "Michael the archangel", "Enoch"],
        "christ": "Believers are 'preserved in Jesus Christ' (verse 1) and look for 'the mercy of our Lord Jesus Christ unto eternal life' (verse 21).",
        "peoples": ["israelites", "egyptians"],
    },
    # ------------------------------------------------------------ prophecy
    {
        "name": "Revelation",
        "group": "prophecy",
        "name_meaning": "Greek Apokalypsis, 'unveiling' — 'The Revelation of Jesus Christ' (1:1).",
        "summary": "The risen Christ speaks to seven churches, and visions reveal the Lamb on the throne, the defeat of evil and the new heaven and new earth.",
        "author": "John (traditionally the apostle)",
        "author_note": "The writer names himself John, a servant exiled on the island of Patmos 'for the word of God' (1:9). Early writers such as Justin Martyr and Irenaeus identified him with the apostle; others, from Dionysius of Alexandria onward, noted differences in style from John's Gospel.",
        "date": "c. AD 95, under Emperor Domitian (Irenaeus); some date it c. AD 68",
        "audience": "Seven churches in the Roman province of Asia (western Turkey)",
        "setting": "Patmos; churches facing emperor worship, persecution and compromise",
        "origin": (
            "Revelation is apocalyptic prophecy, full of symbols drawn from Daniel, Ezekiel, "
            "Zechariah and Isaiah: numbers, beasts, lampstands, seals and trumpets. It promises a "
            "blessing to those who read and keep it (1:3)."),
        "description": (
            "John sees the risen Christ among seven golden lampstands and writes his messages to "
            "Ephesus, Smyrna, Pergamos, Thyatira, Sardis, Philadelphia and Laodicea. In heaven he "
            "sees God's throne and the Lamb that was slain, who alone can open the sealed scroll. "
            "Seals, trumpets and bowls of judgement fall on a rebellious world; the dragon and the "
            "beasts make war on the saints; 'Babylon the great' falls. Christ returns as King of "
            "kings, Satan is defeated, the dead are judged, and God makes all things new: 'God "
            "shall wipe away all tears from their eyes.' The book ends: 'Even so, come, Lord Jesus.'"),
        "themes": ["Christ's victory", "Faithful witness", "Judgement", "Worship", "The new creation"],
        "outline": [
            {"chapters": "1", "title": "The vision of the risen Christ"},
            {"chapters": "2-3", "title": "Letters to the seven churches"},
            {"chapters": "4-5", "title": "The throne and the Lamb"},
            {"chapters": "6-16", "title": "Seals, trumpets and bowls"},
            {"chapters": "17-19", "title": "The fall of Babylon; Christ returns"},
            {"chapters": "20", "title": "The thousand years and the final judgement"},
            {"chapters": "21-22", "title": "The new heaven, new earth and new Jerusalem"},
        ],
        "key_verses": ["Revelation 1:8", "Revelation 3:20", "Revelation 21:4", "Revelation 22:20"],
        "key_people": ["John", "Jesus Christ", "the seven churches", "Michael", "the dragon", "the beast"],
        "christ": "The whole book is 'the Revelation of Jesus Christ': the Alpha and Omega, the Lamb that was slain, the faithful witness, and the King of kings who makes all things new.",
        "peoples": ["romans", "babylonians", "israelites", "greeks"],
    },
]
