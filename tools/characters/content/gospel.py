"""Bible characters: the life of Jesus, and the early church.

Same fields as beginnings.py.
"""

GOSPEL = [
    # ------------------------------------------------------------------ the life of Jesus
    {
        "name": "Jesus",
        "epithet": "The Christ, the Son of the living God",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "The Messiah",
        "era": "The first century",
        "family": [{"relation": "Mother", "id": "mary-mother-of-jesus"},
                   {"relation": "Raised by", "id": "joseph-of-nazareth"},
                   {"relation": "Brother", "id": "james-the-brother-of-jesus"},
                   {"relation": "Ancestor", "id": "david"}],
        "summary": "Born of Mary in Bethlehem, Jesus of Nazareth preached the kingdom of God, healed the sick, forgave sins, was crucified under Pontius Pilate, and rose from the dead on the third day.",
        "story": (
            "Jesus was born in Bethlehem and grew up in Nazareth, known as the carpenter's son. At about "
            "thirty he was baptised by John, and a voice from heaven said, 'This is my beloved Son, in whom "
            "I am well pleased.' He called twelve disciples, taught in parables, healed the sick, fed "
            "thousands, forgave sinners and ate with outcasts. He told his followers plainly that he would "
            "be killed and rise again. At Passover he was betrayed by Judas, condemned by the high priest's "
            "council, and crucified under Pontius Pilate. On the third day the tomb was empty, and he "
            "appeared to his disciples; after forty days he was taken up into heaven."),
        "importance": (
            "Jesus is the centre of the whole Bible: the Old Testament looks forward to him, and the New "
            "Testament is about him. He said, 'I am the way, the truth, and the life: no man cometh unto the "
            "Father, but by me' (John 14:6). Every other life on this page is read, in the end, in his "
            "light."),
        "known_for": ["The kingdom of God", "The cross", "The resurrection"],
        "told_in": ["Matthew 1-28", "Mark 1-16", "Luke 1-24", "John 1-21"],
        "also_in": ["Acts 1:1-11", "Philippians 2:5-11", "Hebrews 1:1-3"],
        "key_verses": ["John 3:16", "John 14:6"],
    },
    {
        "name": "Mary, mother of Jesus",
        "epithet": "The handmaid of the Lord",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Mother of Jesus",
        "era": "The first century",
        "hero": "mary-mother-of-jesus",
        "family": [{"relation": "Son", "id": "jesus"}, {"relation": "Husband", "id": "joseph-of-nazareth"},
                   {"relation": "Cousin", "id": "elisabeth"}],
        "summary": "A young woman of Nazareth chosen to be the mother of Jesus, who believed the angel's word, pondered all things in her heart, and stood by the cross.",
        "story": (
            "The angel Gabriel came to Mary, a virgin engaged to Joseph, and told her she would conceive by "
            "the Holy Ghost and bear the Son of the Highest. She answered, 'Behold the handmaid of the Lord; "
            "be it unto me according to thy word.' She visited her cousin Elisabeth and sang of God's mercy. "
            "She gave birth in Bethlehem and laid her son in a manger, and 'kept all these things, and "
            "pondered them in her heart.' At Cana she told the servants, 'Whatsoever he saith unto you, do "
            "it.' She stood by the cross, where Jesus gave her into John's care, and she was with the "
            "disciples praying after the ascension."),
        "importance": (
            "Mary's willing faith is the doorway through which God came into the world. Elisabeth greeted "
            "her, 'Blessed art thou among women', and called her 'the mother of my Lord' (Luke 1:42-43)."),
        "known_for": ["The angel's announcement", "The birth in Bethlehem", "At the cross"],
        "told_in": ["Luke 1:26-2:52", "John 2:1-12", "John 19:25-27"],
        "also_in": ["Matthew 1:18-2:23", "Acts 1:14"],
        "key_verses": ["Luke 1:38", "Luke 2:19"],
    },
    {
        "name": "Joseph of Nazareth",
        "epithet": "The carpenter who took Mary as his wife",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Carpenter; husband of Mary",
        "era": "The first century",
        "family": [{"relation": "Wife", "id": "mary-mother-of-jesus"}, {"relation": "Raised", "id": "jesus"}],
        "summary": "A carpenter of David's line, a just man, who took Mary as his wife, named Jesus, and protected the child by fleeing to Egypt.",
        "story": (
            "When Joseph found that Mary was with child, being 'a just man', he planned to end the "
            "engagement quietly. An angel told him in a dream not to fear, for the child was of the Holy "
            "Ghost, and to call him Jesus, 'for he shall save his people from their sins.' Joseph obeyed. "
            "After the wise men came, another dream warned him to flee from Herod, and he took the child and "
            "his mother to Egypt by night. Later he settled the family in Nazareth. When Jesus was twelve, "
            "Joseph and Mary searched Jerusalem for him and found him in the temple. The Gospels do not "
            "mention Joseph after that."),
        "importance": (
            "Joseph never speaks a recorded word, yet every time God spoke to him he acted at once. Through "
            "him Jesus was legally a son of David (Matthew 1:16, 20)."),
        "known_for": ["Obeying the dreams", "The flight to Egypt"],
        "told_in": ["Matthew 1:18-2:23", "Luke 2:1-52"],
        "key_verses": ["Matthew 1:20-21"],
    },
    {
        "name": "Elisabeth",
        "epithet": "The mother of John the Baptist",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Mother of John the Baptist",
        "era": "The first century",
        "family": [{"relation": "Husband", "name": "Zacharias"}, {"relation": "Son", "id": "john-the-baptist"},
                   {"relation": "Cousin", "id": "mary-mother-of-jesus"}],
        "summary": "A righteous woman, childless into old age, who bore John the Baptist and was the first to greet Mary as the mother of the Lord.",
        "story": (
            "Elisabeth and her husband Zacharias, a priest, 'were both righteous before God', but they had "
            "no child and were old. The angel Gabriel told Zacharias she would bear a son. When Mary came to "
            "visit, the baby leaped in Elisabeth's womb and she was filled with the Holy Ghost, crying, "
            "'Blessed art thou among women, and blessed is the fruit of thy womb.' At the boy's naming she "
            "insisted, 'Not so; but he shall be called John.'"),
        "importance": (
            "Elisabeth's joy at Mary's visit, before either child was born, is the first recognition of "
            "Jesus in the Gospels. Her story echoes Sarah's and Hannah's: God's promises coming through women "
            "who had waited long."),
        "known_for": ["A son in old age", "Greeting Mary"],
        "told_in": ["Luke 1:5-25", "Luke 1:39-66"],
        "key_verses": ["Luke 1:41-42"],
    },
    {
        "name": "John the Baptist",
        "epithet": "The voice in the wilderness",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Prophet",
        "era": "The first century",
        "hero": "john-the-baptist",
        "family": [{"relation": "Mother", "id": "elisabeth"}, {"relation": "Relative", "id": "jesus"}],
        "summary": "The prophet in the wilderness who called Israel to repent, baptised in the Jordan, pointed to Jesus as the Lamb of God, and was beheaded by Herod.",
        "story": (
            "John lived in the wilderness, wore camel's hair and ate locusts and wild honey. He preached, "
            "'Repent ye: for the kingdom of heaven is at hand', and baptised crowds in the Jordan. When Jesus "
            "came, John said, 'Behold the Lamb of God, which taketh away the sin of the world.' Of Jesus he "
            "said, 'He must increase, but I must decrease.' He told Herod Antipas it was not lawful to have "
            "his brother's wife, and was imprisoned and beheaded."),
        "importance": (
            "John was the forerunner promised by Isaiah and Malachi. Jesus said that 'among them that are "
            "born of women there hath not risen a greater than John the Baptist' (Matthew 11:11)."),
        "known_for": ["Baptism in the Jordan", "“Behold the Lamb of God”", "“He must increase”"],
        "told_in": ["Luke 1:57-80", "Matthew 3:1-17", "John 1:19-36", "Mark 6:14-29"],
        "also_in": ["Matthew 11:2-15", "John 3:25-30"],
        "key_verses": ["John 1:29", "John 3:30"],
    },
    {
        "name": "Herod the Great",
        "epithet": "The king who feared a child",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "King of Judaea",
        "era": "At the birth of Jesus",
        "hero": "herod-the-great",
        "summary": "The king of Judaea who received the wise men, feared the newborn King of the Jews, and ordered the killing of the young children of Bethlehem.",
        "story": (
            "When wise men came to Jerusalem asking, 'Where is he that is born King of the Jews?', Herod was "
            "troubled, and all Jerusalem with him. He learned from the chief priests that the Christ would "
            "be born in Bethlehem, and asked the wise men to bring him word so that he too could worship. "
            "Warned in a dream, they went home another way. Herod, furious, ordered the killing of all the "
            "children of Bethlehem two years old and under. Joseph had already fled with Jesus to Egypt, and "
            "the family came back after Herod died."),
        "importance": (
            "Herod was a great builder, including the temple Jesus knew, but the Gospel remembers him for "
            "his fear of a rival king. Matthew heard in his cruelty the old lament of Rachel weeping for her "
            "children (Matthew 2:17-18)."),
        "known_for": ["The wise men", "The children of Bethlehem"],
        "told_in": ["Matthew 2:1-22"],
        "also_in": ["Luke 1:5"],
        "key_verses": ["Matthew 2:2"],
    },
    {
        "name": "Peter",
        "epithet": "The rock",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "hero": "peter",
        "family": [{"relation": "Brother", "id": "andrew"}],
        "summary": "A Galilean fisherman who left his nets to follow Jesus, confessed him as the Christ, denied him three times, was restored, and led the first church.",
        "story": (
            "Simon was fishing with his brother Andrew when Jesus called them: 'Follow me, and I will make "
            "you fishers of men.' He walked on the water until he looked at the waves. He was the first to "
            "say, 'Thou art the Christ, the Son of the living God', and Jesus named him Peter, the rock. On "
            "the night of the arrest he swore he would never deny Jesus, and denied him three times before "
            "the cock crew. After the resurrection Jesus asked him three times, 'lovest thou me?', and told "
            "him to feed his sheep. At Pentecost Peter preached, and about three thousand believed."),
        "importance": (
            "Peter is proof that failure need not be final. The man who denied Jesus beside a fire became "
            "the preacher of Pentecost, opened the door to the Gentiles in Cornelius's house, and wrote two "
            "letters of the New Testament."),
        "known_for": ["Walking on water", "“Thou art the Christ”", "Three denials, three restorations"],
        "told_in": ["Matthew 4:18-20", "Matthew 16:13-19", "Luke 22:54-62", "John 21:15-19", "Acts 2:14-41"],
        "also_in": ["Acts 10:1-48", "1 Peter 1:1-2"],
        "key_verses": ["Matthew 16:16", "John 21:17"],
    },
    {
        "name": "Andrew",
        "epithet": "The one who brought his brother",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "family": [{"relation": "Brother", "id": "peter"}],
        "summary": "A fisherman and a disciple of John the Baptist, among the first to follow Jesus, who brought his brother Simon Peter to him.",
        "story": (
            "Andrew was one of the two disciples who heard John the Baptist call Jesus the Lamb of God and "
            "followed him. The first thing he did was find his brother Simon and tell him, 'We have found "
            "the Messias.' When five thousand needed feeding, it was Andrew who found the boy with five "
            "barley loaves and two small fishes. Later he helped some Greeks who wanted to see Jesus."),
        "importance": (
            "Andrew is remembered for bringing people to Jesus: his brother, a boy with his lunch, and "
            "strangers from Greece. He shows that a quiet introduction can change history."),
        "known_for": ["Bringing Peter", "The boy with the loaves"],
        "told_in": ["John 1:35-42", "John 6:8-9", "John 12:20-22"],
        "also_in": ["Mark 1:16-18"],
        "key_verses": ["John 1:41"],
    },
    {
        "name": "James, son of Zebedee",
        "epithet": "A son of thunder",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "family": [{"relation": "Brother", "id": "john-the-apostle"}, {"relation": "Father", "name": "Zebedee"}],
        "summary": "A fisherman, one of Jesus' three closest disciples, called a son of thunder, and the first apostle to die for his faith.",
        "story": (
            "James and his brother John were mending nets with their father Zebedee when Jesus called them, "
            "and they left the boat and their father. Jesus named them Boanerges, 'The sons of thunder.' With "
            "Peter they saw the transfiguration and were near Jesus in Gethsemane. They once asked to sit at "
            "his right and left in his glory, and Jesus asked whether they could drink his cup. James did: "
            "Herod Agrippa 'killed James the brother of John with the sword.'"),
        "importance": (
            "James was the first of the apostles to be martyred (Acts 12:2), keeping his word that he could "
            "drink the cup Jesus drank (Mark 10:38-39)."),
        "known_for": ["The son of thunder", "The transfiguration", "The first apostle martyred"],
        "told_in": ["Mark 1:19-20", "Mark 3:17", "Mark 9:2-8", "Mark 10:35-45"],
        "also_in": ["Acts 12:1-2"],
        "key_verses": ["Mark 10:39"],
    },
    {
        "name": "John the apostle",
        "epithet": "The disciple whom Jesus loved",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "family": [{"relation": "Brother", "id": "james-son-of-zebedee"},
                   {"relation": "Cared for", "id": "mary-mother-of-jesus"}],
        "summary": "A fisherman and one of Jesus' closest disciples, who stood at the cross, took Mary into his home, and by tradition wrote a Gospel, three letters and Revelation.",
        "story": (
            "John left his nets with his brother James to follow Jesus. Once he wanted to call down fire on "
            "a Samaritan village, and Jesus rebuked him. He was with Peter and James on the mountain of the "
            "transfiguration. At the Last Supper he leaned on Jesus' breast. At the cross Jesus said to him, "
            "'Behold thy mother', and from that hour he took Mary into his own home. He ran to the empty tomb "
            "with Peter, and later he and Peter were arrested together for preaching."),
        "importance": (
            "The writings that bear his name give us 'For God so loved the world' (John 3:16) and 'God is "
            "love' (1 John 4:8): the son of thunder became the apostle of love. Tradition holds that he "
            "outlived the other apostles."),
        "known_for": ["The beloved disciple", "At the cross", "“God is love”"],
        "told_in": ["Mark 1:19-20", "Luke 9:51-56", "John 13:23-25", "John 19:25-27", "John 20:1-10"],
        "also_in": ["Acts 3:1-4:22", "Revelation 1:9"],
        "key_verses": ["John 19:26-27", "1 John 4:8"],
    },
    {
        "name": "Matthew",
        "epithet": "The tax collector who followed",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "summary": "A tax collector at Capernaum who left his table to follow Jesus, and by tradition wrote the first Gospel.",
        "story": (
            "Jesus saw Matthew, also called Levi, sitting at the receipt of custom, and said to him, 'Follow "
            "me. And he arose, and followed him.' He gave a great feast in his house for Jesus, with many tax "
            "collectors and sinners. When the Pharisees complained, Jesus said, 'They that be whole need not "
            "a physician, but they that are sick.'"),
        "importance": (
            "Tax collectors were despised as collaborators with Rome, and Jesus chose one as an apostle. The "
            "Gospel that carries his name shows Jesus fulfilling the Old Testament again and again."),
        "known_for": ["Leaving the tax table", "A feast for sinners"],
        "told_in": ["Matthew 9:9-13", "Luke 5:27-32"],
        "also_in": ["Mark 2:14-17", "Acts 1:13"],
        "key_verses": ["Matthew 9:9"],
    },
    {
        "name": "Thomas",
        "epithet": "My Lord and my God",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle",
        "era": "The first century",
        "summary": "One of the twelve, remembered for doubting the resurrection until he saw Jesus, and then making the greatest confession in the Gospels.",
        "story": (
            "When Jesus decided to go back toward Jerusalem, where he had nearly been stoned, Thomas said, "
            "'Let us also go, that we may die with him.' At the Last Supper he asked, 'how can we know the "
            "way?' He was not with the others when the risen Jesus first appeared, and said, 'Except I shall "
            "see in his hands the print of the nails … I will not believe.' Eight days later Jesus showed him "
            "his hands and side, and Thomas answered, 'My Lord and my God.'"),
        "importance": (
            "Thomas's doubt led to the clearest confession of Jesus' divinity in the Gospels. Jesus answered, "
            "'blessed are they that have not seen, and yet have believed' (John 20:29)."),
        "known_for": ["Doubting", "“My Lord and my God”"],
        "told_in": ["John 11:16", "John 14:5-6", "John 20:24-29"],
        "also_in": ["John 21:2"],
        "key_verses": ["John 20:28-29"],
    },
    {
        "name": "Judas Iscariot",
        "epithet": "The betrayer",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Apostle who betrayed Jesus",
        "era": "The first century",
        "hero": "judas-iscariot",
        "summary": "One of the twelve, keeper of the money bag, who betrayed Jesus to the chief priests for thirty pieces of silver.",
        "story": (
            "Judas was chosen as one of the twelve and kept the common purse, from which, John says, he "
            "stole. He objected when Mary of Bethany poured costly ointment on Jesus. He went to the chief "
            "priests and asked, 'What will ye give me, and I will deliver him unto you?' They paid him thirty "
            "pieces of silver. In Gethsemane he led the soldiers and gave the sign with a kiss. When he saw "
            "Jesus condemned, he brought back the silver, saying, 'I have sinned in that I have betrayed the "
            "innocent blood', and went out and hanged himself."),
        "importance": (
            "Judas is the Bible's darkest warning that being close to Jesus is not the same as belonging to "
            "him. Even so, the betrayal served God's plan: Peter said the Scriptures had foretold it (Acts "
            "1:16)."),
        "known_for": ["Thirty pieces of silver", "The kiss in Gethsemane"],
        "told_in": ["Matthew 26:14-16", "Matthew 26:47-50", "Matthew 27:3-5"],
        "also_in": ["John 12:4-6", "John 13:21-30", "Acts 1:16-20"],
        "key_verses": ["Matthew 26:15", "Matthew 27:4"],
    },
    {
        "name": "Mary Magdalene",
        "epithet": "The first witness of the resurrection",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Disciple",
        "era": "The first century",
        "hero": "mary-magdalene",
        "summary": "A woman freed by Jesus from seven devils, who followed and supported him, stood at the cross, and was the first to see him risen.",
        "story": (
            "Jesus cast seven devils out of Mary called Magdalene, and she travelled with him and the twelve, "
            "helping to provide for them from her own means. She watched the crucifixion and saw where he "
            "was buried. Early on the first day of the week she came to the tomb and found it empty. Weeping, "
            "she did not recognise the risen Jesus until he said her name, 'Mary.' He sent her to the "
            "disciples, and she told them 'that she had seen the Lord.'"),
        "importance": (
            "Mary Magdalene was chosen to be the first witness of the resurrection and the first to carry "
            "the news. The Bible never calls her a prostitute; that idea came much later and is not in the "
            "text."),
        "known_for": ["Freed from seven devils", "At the cross", "Meeting the risen Jesus"],
        "told_in": ["Luke 8:1-3", "Mark 15:40-47", "John 20:1-18"],
        "also_in": ["Mark 16:9"],
        "key_verses": ["John 20:16", "John 20:18"],
    },
    {
        "name": "Martha",
        "epithet": "The busy host",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Disciple at Bethany",
        "era": "The first century",
        "family": [{"relation": "Sister", "id": "mary-of-bethany"}, {"relation": "Brother", "id": "lazarus"}],
        "summary": "A woman of Bethany who welcomed Jesus into her home, was gently corrected for her worry, and confessed him as the Christ at her brother's grave.",
        "story": (
            "When Jesus came to her house, Martha 'was cumbered about much serving' while her sister Mary "
            "sat listening, and she asked him to tell Mary to help. Jesus answered, 'Martha, Martha, thou art "
            "careful and troubled about many things: But one thing is needful.' When Lazarus died, Martha "
            "went out to meet Jesus, who told her, 'I am the resurrection, and the life.' She answered, 'I "
            "believe that thou art the Christ, the Son of God.'"),
        "importance": (
            "Martha's story is a gentle lesson about busyness, but she also made one of the great "
            "confessions of faith in the Gospels. 'Now Jesus loved Martha, and her sister, and Lazarus' "
            "(John 11:5)."),
        "known_for": ["“Martha, Martha”", "Her confession at the grave"],
        "told_in": ["Luke 10:38-42", "John 11:1-44", "John 12:1-2"],
        "key_verses": ["Luke 10:41-42", "John 11:25"],
    },
    {
        "name": "Mary of Bethany",
        "epithet": "She sat at his feet",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Disciple at Bethany",
        "era": "The first century",
        "family": [{"relation": "Sister", "id": "martha"}, {"relation": "Brother", "id": "lazarus"}],
        "summary": "Martha's sister, who sat at Jesus' feet to hear him, wept at Lazarus' tomb, and anointed Jesus with costly ointment before his death.",
        "story": (
            "While Martha served, Mary sat at Jesus' feet 'and heard his word', and Jesus said she had "
            "'chosen that good part.' When Lazarus died she fell at his feet weeping, and Jesus wept. Six days "
            "before the Passover she took a pound of very costly ointment of spikenard, anointed his feet and "
            "wiped them with her hair, and the house was filled with the scent. When Judas complained of the "
            "waste, Jesus said she had kept it for the day of his burial."),
        "importance": (
            "Mary shows devotion that gives its best without counting the cost. Matthew and Mark tell of the "
            "anointing without naming her, and there Jesus promises that what she did will be told wherever "
            "the gospel is preached (Matthew 26:13)."),
        "known_for": ["Sitting at Jesus' feet", "The costly ointment"],
        "told_in": ["Luke 10:38-42", "John 11:1-45", "John 12:1-8"],
        "also_in": ["Matthew 26:6-13", "Mark 14:3-9"],
        "key_verses": ["Luke 10:42", "John 12:3"],
    },
    {
        "name": "Lazarus",
        "epithet": "The friend Jesus raised",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Disciple at Bethany",
        "era": "The first century",
        "family": [{"relation": "Sister", "id": "martha"}, {"relation": "Sister", "id": "mary-of-bethany"}],
        "summary": "The brother of Martha and Mary, whom Jesus loved, who died and was raised to life after four days in the tomb.",
        "story": (
            "When Lazarus fell sick, his sisters sent word to Jesus, 'Lord, behold, he whom thou lovest is "
            "sick.' Jesus waited two days, and by the time he came Lazarus had been in the tomb four days. At "
            "the grave 'Jesus wept.' Then he had the stone taken away and cried with a loud voice, 'Lazarus, "
            "come forth', and the dead man came out, bound in grave clothes. Many believed, and the chief "
            "priests plotted to kill Lazarus too."),
        "importance": (
            "The raising of Lazarus is the last and greatest sign in John's Gospel, and it led straight to "
            "the plot to kill Jesus (John 11:53). It shows Jesus as the resurrection and the life, and a "
            "friend who weeps with those who weep."),
        "known_for": ["Four days in the tomb", "“Lazarus, come forth”"],
        "told_in": ["John 11:1-44", "John 12:1-11"],
        "key_verses": ["John 11:35", "John 11:43-44"],
    },
    {
        "name": "Nicodemus",
        "epithet": "The Pharisee who came by night",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Pharisee and ruler of the Jews",
        "era": "The first century",
        "family": [{"relation": "Buried Jesus with", "id": "joseph-of-arimathea"}],
        "summary": "A Pharisee and member of the council who came to Jesus by night, was told he must be born again, and later helped to bury him.",
        "story": (
            "Nicodemus came to Jesus by night and called him 'a teacher come from God.' Jesus told him, "
            "'Except a man be born again, he cannot see the kingdom of God', and Nicodemus asked how a man "
            "could be born when he was old. In that conversation Jesus spoke the words 'For God so loved the "
            "world.' Later Nicodemus spoke up for Jesus' right to a hearing before the council. After the "
            "crucifixion he brought about a hundred pound weight of myrrh and aloes and helped Joseph of "
            "Arimathea bury the body."),
        "importance": (
            "Nicodemus's journey from a secret night visit to a public act of devotion at the tomb shows "
            "faith growing slowly. The words Jesus spoke to him are among the best known in the Bible (John "
            "3:16)."),
        "known_for": ["A visit by night", "“Ye must be born again”", "Burying Jesus"],
        "told_in": ["John 3:1-21", "John 7:45-52", "John 19:38-42"],
        "key_verses": ["John 3:3", "John 3:16"],
    },
    {
        "name": "Zacchaeus",
        "epithet": "The tax collector in the tree",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Chief tax collector of Jericho",
        "era": "The first century",
        "summary": "A rich chief tax collector of Jericho who climbed a sycamore tree to see Jesus, welcomed him home, and gave back fourfold what he had taken.",
        "story": (
            "Zacchaeus was the chief among the publicans, rich, and short, so he ran ahead and climbed a "
            "sycamore tree to see Jesus pass. Jesus stopped, looked up and said, 'Zacchaeus, make haste, and "
            "come down; for to day I must abide at thy house.' The crowd grumbled that he had gone to be the "
            "guest of a sinner. Zacchaeus stood and said he would give half his goods to the poor and repay "
            "fourfold anyone he had cheated."),
        "importance": (
            "Zacchaeus shows that grace comes first and changes a life: Jesus welcomed him before he promised "
            "anything. Jesus summed up his mission in this story: 'For the Son of man is come to seek and to "
            "save that which was lost' (Luke 19:10)."),
        "known_for": ["The sycamore tree", "Repaying fourfold"],
        "told_in": ["Luke 19:1-10"],
        "key_verses": ["Luke 19:10"],
    },
    {
        "name": "Caiaphas",
        "epithet": "The high priest who condemned Jesus",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "High priest",
        "era": "The first century",
        "hero": "caiaphas",
        "summary": "The high priest who advised that one man should die for the people, and presided over the trial that condemned Jesus.",
        "story": (
            "After Lazarus was raised, the council feared the Romans would come. Caiaphas told them, 'it is "
            "expedient for us, that one man should die for the people, and that the whole nation perish "
            "not.' John notes that he spoke better than he knew, prophesying that Jesus would die for the "
            "nation. When Jesus was arrested he was brought to Caiaphas' house, and Caiaphas put him on oath "
            "to 'tell us whether thou be the Christ, the Son of God.' When Jesus answered, he tore his "
            "clothes and cried blasphemy."),
        "importance": (
            "Caiaphas shows religious power protecting itself; yet his cynical words said more than he "
            "meant, for Jesus did die for the people (John 11:51-52)."),
        "known_for": ["“One man should die for the people”", "The trial of Jesus"],
        "told_in": ["John 11:47-53", "Matthew 26:57-68", "John 18:13-28"],
        "also_in": ["Acts 4:5-7"],
        "key_verses": ["John 11:50"],
    },
    {
        "name": "Pontius Pilate",
        "epithet": "The governor who washed his hands",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Roman governor of Judaea",
        "era": "The first century",
        "hero": "pontius-pilate",
        "summary": "The Roman governor of Judaea who found no fault in Jesus, yet handed him over to be crucified to satisfy the crowd.",
        "story": (
            "The chief priests brought Jesus to Pilate, charging him with claiming to be a king. Pilate asked, "
            "'Art thou the King of the Jews?', and when Jesus spoke of truth, 'What is truth?' Again and "
            "again he said he found no fault in him. He offered to release Jesus or Barabbas, and the crowd "
            "chose Barabbas. His wife sent him a warning about a dream. In the end he took water, washed his "
            "hands before the crowd, and delivered Jesus to be crucified."),
        "importance": (
            "Pilate is named in the creeds as the one under whom Jesus suffered, fixing the gospel in real "
            "history. He is a warning about knowing what is right and doing what is safe."),
        "known_for": ["“What is truth?”", "Washing his hands"],
        "told_in": ["Matthew 27:1-26", "John 18:28-19:22"],
        "also_in": ["Luke 23:1-25", "Acts 4:27", "1 Timothy 6:13"],
        "key_verses": ["John 18:38", "Matthew 27:24"],
    },
    {
        "name": "Joseph of Arimathea",
        "epithet": "The rich man who gave his tomb",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Member of the council; secret disciple",
        "era": "The first century",
        "family": [{"relation": "Buried Jesus with", "id": "nicodemus"}],
        "summary": "A rich member of the council and a secret disciple, who asked Pilate for Jesus' body and laid it in his own new tomb.",
        "story": (
            "Joseph of Arimathea was a rich man, 'an honourable counsellor', who 'waited for the kingdom of "
            "God' and had not agreed with the council's decision. He was a disciple, 'but secretly for fear "
            "of the Jews.' After Jesus died he 'went in boldly unto Pilate, and craved the body of Jesus.' "
            "With Nicodemus he wrapped it in linen with spices and laid it in his own new tomb, cut out of "
            "the rock, and rolled a great stone against the door."),
        "importance": (
            "Joseph's courage came at the darkest moment, when the other disciples had fled. Isaiah had said "
            "the servant would be 'with the rich in his death' (Isaiah 53:9)."),
        "known_for": ["Asking for the body", "His own new tomb"],
        "told_in": ["Mark 15:42-47", "John 19:38-42"],
        "also_in": ["Matthew 27:57-60", "Luke 23:50-53"],
        "key_verses": ["Mark 15:43"],
    },
    {
        "name": "Herod Antipas",
        "epithet": "The ruler who killed John",
        "group": "The life of Jesus",
        "testament": "New",
        "role": "Tetrarch of Galilee",
        "era": "The first century",
        "hero": "herod-antipas",
        "family": [{"relation": "Father", "id": "herod-the-great"}],
        "summary": "The son of Herod the Great who ruled Galilee, had John the Baptist beheaded, and mocked Jesus at his trial.",
        "story": (
            "Herod Antipas married Herodias, his brother Philip's wife, and John the Baptist told him it was "
            "not lawful. He imprisoned John, yet 'Herod feared John, knowing that he was a just man and an "
            "holy', and heard him gladly. At his birthday feast he swore a rash oath to Herodias' daughter, "
            "and John was beheaded. When he heard of Jesus, he thought John had risen. At Jesus' trial Pilate "
            "sent Jesus to him; Herod hoped to see a miracle, questioned him at length, got no answer, and "
            "mocked him."),
        "importance": (
            "Jesus called him 'that fox' (Luke 13:32). Herod shows the danger of curiosity about God "
            "without repentance: he heard John gladly but never obeyed."),
        "known_for": ["The death of John", "Mocking Jesus"],
        "told_in": ["Mark 6:14-29", "Luke 23:6-12"],
        "also_in": ["Luke 13:31-32"],
        "key_verses": ["Mark 6:20"],
    },
    # ------------------------------------------------------------------ the early church
    {
        "name": "Stephen",
        "epithet": "The first martyr",
        "group": "The early church",
        "testament": "New",
        "role": "One of the seven",
        "era": "The first church",
        "hero": "stephen",
        "family": [{"relation": "Watched his death", "id": "paul"}],
        "summary": "One of the seven chosen to serve the church, full of faith and the Holy Ghost, who was stoned for his witness and died praying for his killers.",
        "story": (
            "Stephen was chosen with six others to care for the widows in the daily distribution, 'a man "
            "full of faith and of the Holy Ghost.' He did great wonders, and his opponents could not resist "
            "his wisdom, so they brought false witnesses against him. Before the council he told Israel's "
            "history and accused them of resisting the Holy Ghost. He saw heaven opened, 'and the Son of man "
            "standing on the right hand of God.' They stoned him, and he prayed, 'Lord, lay not this sin to "
            "their charge.' A young man named Saul stood by, consenting."),
        "importance": (
            "Stephen was the first to die for Christ, and he died like his Lord, forgiving. His death "
            "scattered the church and spread the gospel (Acts 8:1-4), and the young Saul who watched became "
            "the apostle Paul."),
        "known_for": ["The first martyr", "Heaven opened", "Forgiving his killers"],
        "told_in": ["Acts 6:1-8:2"],
        "also_in": ["Acts 22:20"],
        "key_verses": ["Acts 7:59-60"],
    },
    {
        "name": "Philip the evangelist",
        "epithet": "The evangelist",
        "group": "The early church",
        "testament": "New",
        "role": "One of the seven",
        "era": "The first church",
        "summary": "One of the seven, who preached in Samaria and explained Isaiah to an Ethiopian official on a desert road.",
        "story": (
            "Philip was chosen with Stephen to serve the church. When persecution scattered the believers, "
            "he went down to Samaria and preached Christ, and there was great joy in that city. An angel "
            "sent him to the desert road to Gaza, where an Ethiopian official was reading Isaiah in his "
            "chariot. 'Understandest thou what thou readest?' Philip asked, and he 'began at the same "
            "scripture, and preached unto him Jesus.' The man was baptised, and 'he went on his way "
            "rejoicing.' Philip later settled in Caesarea, where he had four daughters who prophesied."),
        "importance": (
            "Philip took the gospel across its first boundaries: to the Samaritans, whom Jews despised, and "
            "to an African official from beyond the empire. He is the only person the New Testament calls "
            "'the evangelist' (Acts 21:8)."),
        "known_for": ["Preaching in Samaria", "The Ethiopian's chariot"],
        "told_in": ["Acts 6:5", "Acts 8:4-40"],
        "also_in": ["Acts 21:8-9"],
        "key_verses": ["Acts 8:35"],
    },
    {
        "name": "Paul",
        "epithet": "The apostle to the Gentiles",
        "group": "The early church",
        "testament": "New",
        "role": "Apostle",
        "era": "The first church",
        "hero": "paul",
        "family": [{"relation": "Companion", "id": "barnabas"}, {"relation": "Companion", "id": "silas"},
                   {"relation": "Son in the faith", "id": "timothy"}, {"relation": "Companion", "id": "luke"}],
        "summary": "A Pharisee who persecuted the church until the risen Jesus met him on the road to Damascus, and who became the great missionary to the Gentiles and wrote much of the New Testament.",
        "story": (
            "Saul of Tarsus, a zealous Pharisee, approved of Stephen's death and set out to arrest believers. "
            "On the road to Damascus a light from heaven struck him blind and a voice said, 'Saul, Saul, why "
            "persecutest thou me?' He was baptised and began at once to preach Jesus. With Barnabas, and "
            "then Silas and others, he travelled across Asia Minor and Greece planting churches, often "
            "beaten, imprisoned and shipwrecked. Arrested in Jerusalem, he appealed to Caesar and was taken "
            "to Rome, where he went on preaching under guard."),
        "importance": (
            "Paul's thirteen letters, from Romans to Philemon, set out the gospel of grace: 'For by grace "
            "are ye saved through faith' (Ephesians 2:8). He carried the faith from a Jewish movement into "
            "the whole Roman world."),
        "known_for": ["The Damascus road", "Missionary journeys", "Thirteen letters"],
        "told_in": ["Acts 7:58-8:3", "Acts 9:1-30", "Acts 13-28"],
        "also_in": ["Galatians 1:11-24", "2 Corinthians 11:23-28", "Philippians 3:4-14"],
        "key_verses": ["Acts 9:4", "Galatians 2:20"],
    },
    {
        "name": "Barnabas",
        "epithet": "The son of consolation",
        "group": "The early church",
        "testament": "New",
        "role": "Apostle and missionary",
        "era": "The first church",
        "family": [{"relation": "Companion", "id": "paul"}],
        "summary": "A generous believer from Cyprus who vouched for Paul when others feared him, and went with him on his first missionary journey.",
        "story": (
            "Joses, a Levite from Cyprus, sold his land and laid the money at the apostles' feet; they called "
            "him Barnabas, 'The son of consolation.' When the newly converted Saul came to Jerusalem and the "
            "disciples were afraid of him, Barnabas brought him to the apostles. Sent to Antioch, he saw the "
            "grace of God there and was glad, and fetched Saul to help him. The church sent them out together "
            "to Cyprus and Asia Minor. Later they parted over whether to take John Mark again, and Barnabas "
            "took Mark."),
        "importance": (
            "Barnabas was 'a good man, and full of the Holy Ghost and of faith' (Acts 11:24). He believed in "
            "people when others did not: first Paul, then Mark, whom Paul later came to value (2 Timothy "
            "4:11)."),
        "known_for": ["Vouching for Paul", "The first missionary journey"],
        "told_in": ["Acts 4:36-37", "Acts 9:26-27", "Acts 11:22-30", "Acts 13-15"],
        "key_verses": ["Acts 11:23-24"],
    },
    {
        "name": "Silas",
        "epithet": "Paul's companion in prison",
        "group": "The early church",
        "testament": "New",
        "role": "Prophet and missionary",
        "era": "The first church",
        "family": [{"relation": "Companion", "id": "paul"}],
        "summary": "A leader of the Jerusalem church who travelled with Paul on his second journey and sang praises with him in the prison at Philippi.",
        "story": (
            "Silas was one of the 'chief men among the brethren' chosen to carry the Jerusalem council's "
            "letter to Antioch. When Paul and Barnabas parted, Paul chose Silas. At Philippi the two were "
            "beaten and fastened in the stocks, and at midnight they prayed and sang praises to God. An "
            "earthquake opened the doors, and the jailer and his household believed. Silas went on with Paul "
            "to Thessalonica, Berea and Corinth."),
        "importance": (
            "Silas shows faithfulness in hardship: songs at midnight in the stocks. He is very probably the "
            "Silvanus named with Paul and Timothy at the start of both letters to the Thessalonians, and "
            "the Silvanus who helped Peter write (1 Peter 5:12)."),
        "known_for": ["Songs at midnight", "The second journey"],
        "told_in": ["Acts 15:22-40", "Acts 16:19-40", "Acts 17:1-15"],
        "also_in": ["1 Thessalonians 1:1", "1 Peter 5:12"],
        "key_verses": ["Acts 16:25"],
    },
    {
        "name": "Timothy",
        "epithet": "Paul's son in the faith",
        "group": "The early church",
        "testament": "New",
        "role": "Missionary and pastor",
        "era": "The first church",
        "family": [{"relation": "Mentor", "id": "paul"}, {"relation": "Mother", "name": "Eunice"},
                   {"relation": "Grandmother", "name": "Lois"}],
        "summary": "A young believer from Lystra, taught the Scriptures by his mother and grandmother, who became Paul's closest co-worker and received two of his letters.",
        "story": (
            "Timothy's mother Eunice was a believing Jew and his father a Greek. From a child he had known "
            "the holy scriptures, and his grandmother Lois and his mother shared a sincere faith. Paul took "
            "him on his second journey and sent him again and again to troubled churches. Paul called him "
            "'my own son in the faith' and wrote to him, 'Let no man despise thy youth.' In his last letter, "
            "from prison, Paul asked him to come quickly."),
        "importance": (
            "Timothy shows the power of faith passed on at home, and of a mentor who believes in a young "
            "leader. Paul wrote, 'I have no man likeminded' (Philippians 2:20)."),
        "known_for": ["Faith from his mother and grandmother", "Paul's letters to him"],
        "told_in": ["Acts 16:1-3", "1 Timothy 1:1-4", "2 Timothy 1:1-7"],
        "also_in": ["Philippians 2:19-22", "2 Timothy 3:14-15"],
        "key_verses": ["1 Timothy 4:12", "2 Timothy 3:15"],
    },
    {
        "name": "Luke",
        "epithet": "The beloved physician",
        "group": "The early church",
        "testament": "New",
        "role": "Physician and historian",
        "era": "The first church",
        "family": [{"relation": "Companion", "id": "paul"}],
        "summary": "A physician and companion of Paul who, by long tradition, wrote the Gospel of Luke and the book of Acts.",
        "story": (
            "Paul calls him 'Luke, the beloved physician.' In Acts the story suddenly changes from 'they' to "
            "'we' at Troas, and from then on the writer travels with Paul: to Philippi, to Jerusalem, and "
            "through the shipwreck to Rome. Near the end, in prison, Paul wrote, 'Only Luke is with me.' "
            "Luke's Gospel opens with his careful research into everything 'from the very first'."),
        "importance": (
            "Luke's two books make up about a quarter of the New Testament. They give us the shepherds at "
            "Bethlehem, the parables of the good Samaritan and the prodigal son, and the whole story of the "
            "first church."),
        "known_for": ["The beloved physician", "The Gospel and Acts", "Paul's companion to Rome"],
        "told_in": ["Colossians 4:14", "Acts 16:10-17", "Acts 27:1-28:16"],
        "also_in": ["2 Timothy 4:11", "Philemon 1:24", "Luke 1:1-4"],
        "key_verses": ["Colossians 4:14", "Luke 1:3-4"],
    },
    {
        "name": "Lydia",
        "epithet": "The seller of purple",
        "group": "The early church",
        "testament": "New",
        "role": "Merchant of Thyatira",
        "era": "The first church",
        "summary": "A businesswoman from Thyatira and the first named believer in Europe, whose home in Philippi became the church's meeting place.",
        "story": (
            "At Philippi, Paul and his companions went down to the riverside on the sabbath, where women met "
            "to pray. Lydia, 'a seller of purple, of the city of Thyatira, which worshipped God', was "
            "listening, 'whose heart the Lord opened.' She and her household were baptised, and she urged "
            "the missionaries to stay in her house. After their release from prison, Paul and Silas went back "
            "to her house to encourage the believers."),
        "importance": (
            "Lydia is the first named convert in Europe (Acts 16:14-15). Her open heart led to an open home, "
            "and the church at Philippi began there."),
        "known_for": ["Purple cloth", "The first believer in Europe", "An open home"],
        "told_in": ["Acts 16:11-15", "Acts 16:40"],
        "key_verses": ["Acts 16:14"],
    },
    {
        "name": "Priscilla and Aquila",
        "epithet": "The couple who opened their home",
        "group": "The early church",
        "testament": "New",
        "role": "Tentmakers and teachers",
        "era": "The first church",
        "family": [{"relation": "Worked with", "id": "paul"}, {"relation": "Taught", "id": "apollos"}],
        "summary": "A Jewish couple, tentmakers like Paul, who worked with him, risked their lives for him, taught Apollos, and hosted churches in their home.",
        "story": (
            "Aquila and his wife Priscilla had left Rome when Claudius expelled the Jews. Paul stayed and "
            "worked with them in Corinth, 'for by their occupation they were tentmakers.' They went with him "
            "to Ephesus. When the eloquent Apollos preached there knowing only John's baptism, 'they took him "
            "unto them, and expounded unto him the way of God more perfectly.' A church met in their house "
            "in Ephesus, and later in Rome."),
        "importance": (
            "Paul called them 'my helpers in Christ Jesus', who 'have for my life laid down their own necks' "
            "(Romans 16:3-4). They show a marriage and a home given to the gospel, and Priscilla is usually "
            "named first."),
        "known_for": ["Tentmakers", "Teaching Apollos", "A church in their house"],
        "told_in": ["Acts 18:1-3", "Acts 18:18-26"],
        "also_in": ["Romans 16:3-5", "1 Corinthians 16:19", "2 Timothy 4:19"],
        "key_verses": ["Acts 18:26"],
    },
    {
        "name": "Apollos",
        "epithet": "The eloquent teacher",
        "group": "The early church",
        "testament": "New",
        "role": "Teacher",
        "era": "The first church",
        "family": [{"relation": "Taught by", "id": "priscilla-and-aquila"}],
        "summary": "An eloquent Jew from Alexandria, mighty in the Scriptures, who was taught more fully by Priscilla and Aquila and watered what Paul had planted in Corinth.",
        "story": (
            "Apollos, 'an eloquent man, and mighty in the scriptures', came to Ephesus teaching diligently "
            "about Jesus but knowing only the baptism of John. Priscilla and Aquila took him aside and "
            "explained the way of God more perfectly. He went on to Achaia, where 'he mightily convinced the "
            "Jews' from the Scriptures that Jesus was the Christ. In Corinth some believers began to say, "
            "'I am of Apollos', and Paul answered, 'I have planted, Apollos watered; but God gave the "
            "increase.'"),
        "importance": (
            "Apollos shows humility in a gifted man: he let a tentmaking couple teach him. Paul refused to "
            "let his name become a party badge: 'Who then is Paul, and who is Apollos, but ministers by whom "
            "ye believed' (1 Corinthians 3:5)."),
        "known_for": ["Eloquence", "Watering what Paul planted"],
        "told_in": ["Acts 18:24-28", "1 Corinthians 3:4-9"],
        "also_in": ["1 Corinthians 16:12", "Titus 3:13"],
        "key_verses": ["1 Corinthians 3:6"],
    },
    {
        "name": "James, the brother of Jesus",
        "epithet": "The brother who came to believe",
        "group": "The early church",
        "testament": "New",
        "role": "Leader of the Jerusalem church",
        "era": "The first church",
        "family": [{"relation": "Brother", "id": "jesus"}],
        "summary": "A brother of Jesus who did not believe during his ministry, saw the risen Lord, became leader of the church in Jerusalem, and by tradition wrote the letter of James.",
        "story": (
            "During Jesus' ministry, 'neither did his brethren believe in him.' After the resurrection Jesus "
            "appeared to James (1 Corinthians 15:7). He became a pillar of the Jerusalem church, and at the "
            "council about the Gentiles he gave the decision: they should not be troubled with the law of "
            "Moses beyond a few necessary things. Paul calls him the Lord's brother (Galatians 1:19)."),
        "importance": (
            "The letter of James insists that real faith shows itself in action: 'faith without works is "
            "dead' (James 2:26). The brother who once doubted became a leader of the church."),
        "known_for": ["From doubter to leader", "The Jerusalem council", "Faith and works"],
        "told_in": ["John 7:3-5", "Acts 15:13-21", "Galatians 1:19"],
        "also_in": ["1 Corinthians 15:7", "Galatians 2:9", "James 1:1"],
        "key_verses": ["James 2:17"],
    },
    {
        "name": "Cornelius",
        "epithet": "The first Gentile convert",
        "group": "The early church",
        "testament": "New",
        "role": "Roman centurion",
        "era": "The first church",
        "family": [{"relation": "Visited by", "id": "peter"}],
        "summary": "A Roman centurion at Caesarea who feared God, sent for Peter at an angel's word, and received the Holy Ghost with his household.",
        "story": (
            "Cornelius, a centurion of the Italian band, was 'a devout man, and one that feared God with all "
            "his house', who gave alms and prayed. An angel told him to send to Joppa for Peter. At the same "
            "time Peter saw a vision of unclean animals and heard, 'What God hath cleansed, that call not "
            "thou common.' Peter came to Cornelius's house and preached Jesus, and while he was still "
            "speaking the Holy Ghost fell on all who heard. Peter said, 'Of a truth I perceive that God is no "
            "respecter of persons.'"),
        "importance": (
            "Cornelius's household was the turning point that opened the church to the Gentiles. The "
            "Jerusalem church concluded, 'Then hath God also to the Gentiles granted repentance unto life' "
            "(Acts 11:18)."),
        "known_for": ["The angel's message", "Peter's vision", "The Gentiles receive the Spirit"],
        "told_in": ["Acts 10:1-48"],
        "also_in": ["Acts 11:1-18", "Acts 15:7-9"],
        "key_verses": ["Acts 10:34-35"],
    },
]
