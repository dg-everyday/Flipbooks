"""The Gospels (Matthew – John) and Church History (Acts)."""

BOOKS = [
    {
        "name": "Matthew",
        "group": "gospels",
        "name_meaning": "Named after Matthew (also called Levi), the tax collector who became an apostle. Matthew means 'gift of the LORD'.",
        "summary": "Jesus is the promised King, the Son of David and Son of Abraham, who fulfils the Law and the Prophets and sends his disciples to all nations.",
        "author": "Matthew (Levi), apostle",
        "author_note": "The Gospel does not name its author, but the early church unanimously credited it to Matthew. Papias (c. AD 125) wrote that Matthew compiled Jesus' sayings in the Hebrew (or Aramaic) language. Many modern scholars think the author used Mark's Gospel as a source.",
        "date": "c. AD 50–70 (traditional); many scholars AD 80–90",
        "audience": "Jewish Christians, and the church as a whole",
        "setting": "Judea and Galilee, from Jesus' birth (c. 5 BC) to his resurrection (c. AD 30)",
        "origin": (
            "Matthew stands first in the New Testament as the bridge from the Old. It quotes the "
            "Old Testament more than any other Gospel, often with 'that it might be fulfilled', "
            "and gathers Jesus' teaching into five long discourses. It was the most widely used "
            "Gospel in the early church."),
        "description": (
            "It opens with the genealogy of 'Jesus Christ, the son of David, the son of Abraham', "
            "the visit of the wise men and the flight to Egypt. After his baptism and temptation "
            "Jesus preaches the Sermon on the Mount, heals, calls twelve disciples and teaches in "
            "parables of the kingdom of heaven. Peter confesses him as 'the Christ, the Son of the "
            "living God'. In Jerusalem he is rejected, crucified and raised, and he sends his "
            "disciples to 'teach all nations', promising 'I am with you alway'."),
        "themes": ["Jesus the King", "Fulfilment of Scripture", "The kingdom of heaven", "Discipleship", "Mission to all nations"],
        "outline": [
            {"chapters": "1-4", "title": "The King's birth and preparation"},
            {"chapters": "5-7", "title": "The Sermon on the Mount"},
            {"chapters": "8-18", "title": "Ministry and teaching in Galilee"},
            {"chapters": "19-25", "title": "To Jerusalem; teaching on the end"},
            {"chapters": "26-28", "title": "Death, resurrection and the Great Commission"},
        ],
        "key_verses": ["Matthew 1:21", "Matthew 5:17", "Matthew 16:16", "Matthew 28:19-20"],
        "key_people": ["Jesus", "Mary and Joseph", "John the Baptist", "Peter", "the twelve disciples", "Herod", "Pontius Pilate"],
        "christ": "Matthew's whole purpose: Jesus is Immanuel, 'God with us' (1:23), the Messiah-King in whom every promise is kept.",
        "peoples": ["israelites", "romans", "canaanites", "edomites", "samaritans"],
    },
    {
        "name": "Mark",
        "group": "gospels",
        "name_meaning": "Named after John Mark, companion of Peter and Paul.",
        "summary": "The shortest, fastest-moving Gospel: Jesus the Son of God, the servant who came 'to give his life a ransom for many'.",
        "author": "John Mark",
        "author_note": "Early tradition (Papias, c. AD 125, citing 'the elder') says Mark wrote down Peter's preaching as Peter's 'interpreter'. Mark's mother's house was a meeting place of the Jerusalem church (Acts 12:12), and Peter calls him 'my son' (1 Peter 5:13). Most scholars think Mark was the first Gospel written.",
        "date": "c. AD 55–70",
        "audience": "Gentile Christians, probably in Rome",
        "setting": "Galilee and Jerusalem, from John the Baptist to the empty tomb",
        "origin": (
            "Mark explains Jewish customs and translates Aramaic words ('Talitha cumi', "
            "'Ephphatha', 'Abba'), suggesting non-Jewish readers. Its oldest manuscripts end at "
            "16:8; verses 9–20 are absent from the earliest Greek copies (Codex Sinaiticus and "
            "Vaticanus), though they are found in most later manuscripts."),
        "description": (
            "Mark has no birth story; it begins with John the Baptist and Jesus' baptism and moves "
            "'straightway' from one scene to the next. Jesus heals, casts out devils, calms the "
            "storm and feeds thousands, yet repeatedly tells people to keep quiet about him. At "
            "Caesarea Philippi Peter confesses him as the Christ, and Jesus begins to teach that "
            "he must suffer. The last third of the book covers a single week: the entry into "
            "Jerusalem, the cross — where a Roman centurion says 'Truly this man was the Son of "
            "God' — and the empty tomb."),
        "themes": ["Jesus the Servant", "The Son of God", "Discipleship and the cross", "Faith and fear"],
        "outline": [
            {"chapters": "1:1-13", "title": "Preparation: John, baptism and temptation"},
            {"chapters": "1:14-8:26", "title": "Ministry in Galilee"},
            {"chapters": "8:27-10:52", "title": "On the way to Jerusalem"},
            {"chapters": "11-16", "title": "The last week, the cross and the empty tomb"},
        ],
        "key_verses": ["Mark 1:15", "Mark 8:34", "Mark 9:24", "Mark 10:45"],
        "key_people": ["Jesus", "John the Baptist", "Peter", "James and John", "Pilate", "Mary Magdalene"],
        "christ": "'For even the Son of man came not to be ministered unto, but to minister, and to give his life a ransom for many' (10:45).",
        "peoples": ["israelites", "romans", "phoenicians", "edomites"],
    },
    {
        "name": "Luke",
        "group": "gospels",
        "name_meaning": "Named after Luke, 'the beloved physician' and companion of Paul.",
        "summary": "A careful, orderly account of Jesus the Saviour of all people — the outcast, the poor, women and Gentiles — who came 'to seek and to save that which was lost'.",
        "author": "Luke the physician",
        "author_note": "Luke and Acts are two volumes by the same author, both addressed to Theophilus. Early tradition (the Muratorian Fragment, Irenaeus) names Luke, Paul's companion (Colossians 4:14; 2 Timothy 4:11), who joins the story in the 'we' passages of Acts. He says he investigated eyewitness accounts carefully (1:1-4).",
        "date": "c. AD 60–62 (before Acts) or AD 70–85",
        "audience": "Theophilus and Gentile readers",
        "setting": "Judea and Galilee, from the births of John and Jesus to the ascension",
        "origin": (
            "Luke writes as a historian, dating events by the rulers of the day (2:1-2; 3:1-2). "
            "About half of his Gospel is found only in Luke, including the Christmas story as most "
            "people know it and many of the best-loved parables."),
        "description": (
            "Luke tells of the angel Gabriel's visits to Zacharias and Mary, the birth in Bethlehem "
            "announced to shepherds, and the boy Jesus in the Temple. In Nazareth Jesus announces "
            "his mission from Isaiah 61. A long journey to Jerusalem (9:51–19:27) carries parables "
            "found only in Luke: the Good Samaritan, the prodigal son, the rich man and Lazarus, "
            "the Pharisee and the publican. After the cross, the risen Jesus walks with two "
            "disciples to Emmaus and explains the Scriptures, then ascends."),
        "themes": ["Salvation for all", "The poor and the outcast", "Prayer", "The Holy Spirit", "Joy"],
        "outline": [
            {"chapters": "1-2", "title": "The births of John and Jesus"},
            {"chapters": "3:1-4:13", "title": "Preparation for ministry"},
            {"chapters": "4:14-9:50", "title": "Ministry in Galilee"},
            {"chapters": "9:51-19:27", "title": "The journey to Jerusalem"},
            {"chapters": "19:28-24:53", "title": "Jerusalem: death, resurrection and ascension"},
        ],
        "key_verses": ["Luke 2:10-11", "Luke 15:20", "Luke 19:10", "Luke 24:6"],
        "key_people": ["Jesus", "Mary", "Zacharias and Elisabeth", "John the Baptist", "Zacchaeus", "Martha and Mary", "the disciples on the Emmaus road"],
        "christ": "Jesus is 'a Saviour, which is Christ the Lord' (2:11), the Son of Man who seeks the lost (19:10), whose sufferings and glory are the theme of 'all the scriptures' (24:27).",
        "peoples": ["israelites", "romans", "samaritans", "phoenicians"],
    },
    {
        "name": "John",
        "group": "gospels",
        "name_meaning": "Named after John, son of Zebedee, one of the twelve apostles; John means 'the LORD is gracious'.",
        "summary": "The Word made flesh: seven signs and seven 'I am' sayings reveal Jesus as the Son of God, 'that believing ye might have life through his name'.",
        "author": "John, son of Zebedee (traditional)",
        "author_note": "The Gospel names its source as 'the disciple whom Jesus loved' (21:20-24). Irenaeus (c. AD 180), who knew Polycarp, a disciple of John, says John wrote it at Ephesus. Some scholars attribute it to a circle of John's followers or to 'John the elder'. A papyrus fragment of John 18 (P52) is among the oldest New Testament manuscripts, often dated c. AD 125–175.",
        "date": "c. AD 85–95",
        "audience": "Believers and seekers across the Greek-speaking world",
        "setting": "Judea, Samaria and Galilee over about three years of ministry (three Passovers)",
        "origin": (
            "John wrote after the other Gospels, and about 90% of his material is not found in "
            "them. He states his purpose plainly: 'these are written, that ye might believe that "
            "Jesus is the Christ, the Son of God' (20:31)."),
        "description": (
            "'In the beginning was the Word… and the Word was God… And the Word was made flesh.' "
            "Jesus turns water into wine, tells Nicodemus he must be born again, and offers living "
            "water to a Samaritan woman. Seven signs, ending with the raising of Lazarus, show his "
            "glory, and he declares 'I am the bread of life… the light of the world… the good "
            "shepherd… the resurrection… the way, the truth, and the life… the true vine'. At the "
            "Last Supper he washes his disciples' feet and prays for them. After the cross, Thomas "
            "meets the risen Christ and says 'My Lord and my God'."),
        "themes": ["Jesus is God", "Believing and eternal life", "Light and darkness", "Love", "The Holy Spirit"],
        "outline": [
            {"chapters": "1:1-18", "title": "Prologue: the Word made flesh"},
            {"chapters": "1:19-12:50", "title": "The book of signs"},
            {"chapters": "13-17", "title": "The upper room: teaching and prayer"},
            {"chapters": "18-20", "title": "Arrest, crucifixion and resurrection"},
            {"chapters": "21", "title": "Epilogue: breakfast by the sea"},
        ],
        "key_verses": ["John 1:1", "John 1:14", "John 3:16", "John 14:6", "John 20:31"],
        "key_people": ["Jesus", "John the Baptist", "Nicodemus", "the woman of Samaria", "Lazarus, Martha and Mary", "Thomas", "Peter"],
        "christ": "John is written wholly about Christ: the eternal Word who 'was God', the Lamb of God, and the great 'I AM' (8:58).",
        "peoples": ["israelites", "samaritans", "romans", "greeks"],
    },
    {
        "name": "Acts",
        "group": "church-history",
        "name_meaning": "Full title 'The Acts of the Apostles' — the deeds of Jesus' apostles, especially Peter and Paul.",
        "summary": "The risen Christ sends the Holy Spirit, and the gospel spreads from Jerusalem through Judea and Samaria to Rome.",
        "author": "Luke the physician",
        "author_note": "Acts continues the 'former treatise' (Luke's Gospel) to Theophilus. In several passages the narrator says 'we', showing he travelled with Paul (16:10-17; 20:5–21:18; 27:1–28:16). Early tradition names Luke.",
        "date": "c. AD 62 (it ends with Paul still awaiting trial in Rome) or AD 70–85",
        "audience": "Theophilus and the wider church",
        "setting": "c. AD 30–62; from Jerusalem across the Roman world to Rome",
        "origin": (
            "Acts is the only history of the first generation of the church. Luke's details of "
            "places, officials and titles — proconsuls, politarchs, the Areopagus — have repeatedly "
            "been confirmed by inscriptions."),
        "description": (
            "Jesus ascends, promising power when the Holy Spirit comes. At Pentecost the Spirit "
            "falls, Peter preaches, and three thousand believe. The church grows despite "
            "persecution; Stephen is the first martyr. Philip takes the gospel to Samaria and an "
            "Ethiopian official; Saul, the persecutor, meets Jesus on the Damascus road; Peter "
            "baptises the Roman centurion Cornelius. From Antioch, Paul and his companions carry "
            "the gospel across Asia Minor and Greece. Arrested in Jerusalem, Paul appeals to Caesar "
            "and, after a shipwreck, preaches in Rome 'no man forbidding him'."),
        "themes": ["The Holy Spirit", "Witness", "The church", "The gospel for Jew and Gentile", "God's sovereignty over opposition"],
        "outline": [
            {"chapters": "1-7", "title": "Witness in Jerusalem"},
            {"chapters": "8-12", "title": "Witness in Judea and Samaria; Saul and Cornelius"},
            {"chapters": "13-20", "title": "Paul's missionary journeys"},
            {"chapters": "21-28", "title": "Paul's arrest, trials and journey to Rome"},
        ],
        "key_verses": ["Acts 1:8", "Acts 2:38", "Acts 4:12", "Acts 16:31"],
        "key_people": ["Peter", "John", "Stephen", "Philip", "Paul (Saul)", "Barnabas", "Silas", "Cornelius", "Lydia"],
        "christ": "Acts is the story of 'all that Jesus began both to do and teach' (1:1) continuing through his Spirit and his church.",
        "peoples": ["israelites", "samaritans", "romans", "greeks", "cushites", "egyptians", "medes", "elamites", "phoenicians"],
    },
]
