"""Food for Thought, section 7: Lessons from the Bible's table. Fields as in diet.py.

People who ate well, and people who fed the wrong appetite. Each links to the
person's entry in Bible Characters or Heroes and Villains, where there is one
(see_also, first).
"""

SECTION = "Lessons from the Bible's table"

TABLE = [
    {
        "name": "Good for food, pleasant to the eyes",
        "person": "Eve",
        "areas": ["Mind", "Body"],
        "food": ["Genesis 3:6"],
        "read": ["Genesis 3:1-6", "1 John 2:15-17"],
        "guards": "The lust of the flesh, the eyes, and the pride of life",
        "feeds": (
            "Eve 'saw that the tree was good for food, and that it was pleasant to the eyes, and a tree to be desired "
            "to make one wise'. John names the same three pulls in every age: 'the lust of the flesh, and the lust of "
            "the eyes, and the pride of life'. Temptation still comes through appetite, sight and pride."),
        "serving": "When something tempts you today, ask which of the three it appeals to.",
        "hunger": [
            "You doubt that God's limits are good for you.",
            "What looks good decides what you do.",
            "You want to be wise on your own terms.",
        ],
        "chew": "Which of the three pulls, flesh, eyes or pride, catches you most?",
        "see_also": [("bible-characters", "eve"), ("guidance-for-life", "temptation")],
    },
    {
        "name": "One morsel of meat",
        "person": "Esau",
        "areas": ["Body", "Mind"],
        "food": ["Hebrews 12:16"],
        "read": ["Genesis 25:29-34", "Hebrews 12:16-17"],
        "guards": "Trading what lasts for what is wanted now",
        "feeds": (
            "Esau came in hungry and traded his birthright for a bowl of stew: 'what profit shall this birthright do "
            "to me?' Hebrews remembers him as the one 'who for one morsel of meat sold his birthright.' A moment's "
            "appetite cost him what could not be bought back."),
        "serving": "Before a choice today, ask what you would be giving up for what you want right now.",
        "hunger": [
            "Instant satisfaction wins over lasting good.",
            "You think, it is only this once.",
            "Spiritual blessings feel less real than present wants.",
        ],
        "chew": "What birthright might you be trading for a bowl of stew?",
        "see_also": [("bible-characters", "esau")],
    },
    {
        "name": "I saw, I coveted, I took",
        "person": "Achan",
        "areas": ["Mind"],
        "food": ["Joshua 7:21"],
        "read": ["Joshua 7:19-21"],
        "guards": "The steps from looking to hiding",
        "feeds": (
            "Achan's confession shows how sin grows: 'When I saw among the spoils a goodly Babylonish garment… then I "
            "coveted them, and took them; and, behold, they are hid in the earth in the midst of my tent'. Seeing, "
            "wanting, taking, hiding: each step was a chance to stop."),
        "serving": "If you catch yourself wanting something that is not yours today, stop at the first step.",
        "hunger": [
            "You let your eyes linger on what you should not have.",
            "Wanting turns into planning.",
            "There is something hidden in your tent.",
        ],
        "chew": "At which step, seeing, wanting, taking or hiding, do you usually stop, if you stop at all?",
        "see_also": [("commandments-of-god", "do-not-covet"), ("commandments-of-god", "do-not-steal")],
    },
    {
        "name": "From the roof he saw",
        "person": "David",
        "areas": ["Mind", "Body"],
        "food": ["2 Samuel 11:2"],
        "read": ["2 Samuel 11:1-4", "Psalms 51:1-4"],
        "guards": "Idleness and wandering eyes",
        "feeds": (
            "'At the time when kings go forth to battle', 'David tarried still at Jerusalem.' He was idle, he looked, "
            "and 'from the roof he saw a woman washing herself'. He kept looking, enquired, and sent for her. The fall "
            "of a great man began with being in the wrong place with nothing to do."),
        "serving": "Fill one idle stretch of today with something useful or good.",
        "hunger": [
            "Idle time leads your eyes and thoughts astray.",
            "You keep looking after the first glance.",
            "You feel too strong or too important to fall.",
        ],
        "chew": "Where are you when you should be at the battle?",
        "see_also": [("heroes-and-villains", "david"), ("commandments-of-god", "do-not-commit-adultery"),
                     ("poems-songs-and-wisdom", "create-in-me-a-clean-heart")],
    },
    {
        "name": "He wist not",
        "person": "Samson",
        "areas": ["Body", "Spirit"],
        "food": ["Judges 16:20"],
        "read": ["Judges 16:15-20"],
        "guards": "Playing with temptation until strength is gone",
        "feeds": (
            "Delilah pressed Samson 'daily with her words', and he played along until he told her everything. When he "
            "woke, he said he would go out 'as at other times before'. 'And he wist not that the LORD was departed "
            "from him.' Play with temptation long enough, and strength goes without our noticing."),
        "serving": "Name one temptation you have been playing with, and end the game today.",
        "hunger": [
            "You think you can stop whenever you choose.",
            "You stay close to what weakens you.",
            "You count on past strength to carry you.",
        ],
        "chew": "What are you toying with that could cost you your strength?",
        "see_also": [("bible-characters", "samson")],
    },
    {
        "name": "Followed afar off",
        "person": "Peter",
        "areas": ["Mind", "Spirit"],
        "food": ["Luke 22:54"],
        "read": ["Matthew 26:33-35", "Luke 22:54-62"],
        "guards": "Overconfidence and drifting from Jesus",
        "feeds": (
            "Peter promised, 'Though I should die with thee, yet will I not deny thee.' That night 'Peter followed afar "
            "off', sat down with the crowd by the fire, and denied Jesus three times. The fall began with distance. "
            "Yet when 'the Lord turned, and looked upon Peter', he wept, and was later restored."),
        "serving": "Close one gap today between you and Jesus: a prayer, a confession or a public word for him.",
        "hunger": [
            "You are sure you would never fall.",
            "You follow Jesus at a safe distance.",
            "You blend in with the crowd to avoid trouble.",
        ],
        "chew": "In what part of life are you following Jesus from far off?",
        "see_also": [("heroes-and-villains", "peter"), ("guidance-for-life", "standing-for-your-faith")],
    },
    {
        "name": "How then can I do this great wickedness",
        "person": "Joseph",
        "areas": ["Body"],
        "food": ["Genesis 39:9"],
        "read": ["Genesis 39:7-12"],
        "guards": "Staying near temptation",
        "feeds": (
            "Joseph was tempted 'day by day', yet he refused: 'how then can I do this great wickedness, and sin against "
            "God?' He saw sin as against God first. When he was caught and cornered, he did not argue; he 'left his "
            "garment in her hand, and fled'."),
        "serving": "Decide today what you will do, and where you will go, the moment a familiar temptation corners you.",
        "hunger": [
            "Sin feels like it hurts no one.",
            "You stay to argue with temptation.",
            "Daily pressure is wearing you down.",
        ],
        "chew": "What would it mean for you to leave your garment and run?",
        "see_also": [("heroes-and-villains", "joseph"), ("commandments-of-god", "flee-sexual-sin")],
    },
    {
        "name": "Purposed in his heart",
        "person": "Daniel",
        "areas": ["Spirit", "Body"],
        "food": ["Daniel 1:8"],
        "read": ["Daniel 1:8-16"],
        "guards": "Compromise; deciding beforehand",
        "feeds": (
            "A captive in Babylon, offered the king's food, 'Daniel purposed in his heart that he would not defile "
            "himself with the portion of the king’s meat'. He decided before the plate was set in front of him, and "
            "asked respectfully for another way. God honoured him for it."),
        "serving": "Settle one matter in your heart today, before the pressure comes.",
        "hunger": [
            "You decide in the moment, under pressure.",
            "You go along with what everyone else does.",
            "You have never settled what you will not do.",
        ],
        "chew": "What have you purposed in your heart, and what have you left undecided?",
        "see_also": [("heroes-and-villains", "daniel"), ("guidance-for-life", "standing-for-your-faith")],
    },
]
