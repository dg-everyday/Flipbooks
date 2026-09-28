"""Commandments of God: the Ten Commandments, one entry each, in order.

Fields (all but name, group, testament, told_in and summary are optional):

  name, epithet   the commandment's name, and its words (or a line of them)
  number          1 to 10, for the Ten Commandments only
  group           one of GROUPS in build_commandments.py
  testament       Old or New
  by              [{name, hero?}]: who gave or spoke it (hero: an id on
                  heroes-and-villains.html); by_label replaces "Given by"
  to, where       who it was given to, and where
  told_in         the passage; also_in: parallels and where it is taken up again
  words           references for the commandment's own words; the build adds the text
  summary         one sentence
  story           where it comes from
  meaning         what it means, and how Jesus and the apostles carry it on
  daily           how it applies to daily life today
  try_it          one practical step, in our own modern words (not Scripture: no single quotes)
  key_verses      other verses to read with it; the build adds the text

The Ten Commandments are numbered as most Protestant and Orthodox churches number
them. Catholic and Lutheran churches join the first two into one and divide the
last into two; the page says so.

Scripture in 'single quotes' must be word for word KJV (the build checks it).
"""

SINAI = {
    "group": "The Ten Commandments",
    "testament": "Old",
    "by_label": "Spoken by",
    "by": [{"name": "God, from Mount Sinai"}],
    "to": "Israel, through Moses",
    "where": "Mount Sinai",
}

TEN = [
    {
        **SINAI, "number": 1,
        "name": "No other gods",
        "epithet": "Thou shalt have no other gods before me",
        "told_in": "Exodus 20:1-3",
        "also_in": ["Deuteronomy 5:6-7", "Matthew 4:10", "1 John 5:21"],
        "words": ["Exodus 20:2-3"],
        "summary": "The first commandment: the God who rescued Israel from slavery is to be their only God.",
        "story": (
            "Three months after leaving Egypt, Israel camped before Mount Sinai. The mountain smoked and shook, "
            "and 'God spake all these words'. The commandments begin not with a rule but with a rescue: 'I am "
            "the LORD thy God, which have brought thee out of the land of Egypt, out of the house of bondage.' "
            "Then comes the first command: 'Thou shalt have no other gods before me.'"),
        "meaning": (
            "God's law starts with grace: he saved first, and then asked for loyalty. Anything we trust, love or "
            "fear more than God becomes a god. Jesus answered the tempter with this command: 'Thou shalt worship "
            "the Lord thy God, and him only shalt thou serve' (Matthew 4:10)."),
        "daily": (
            "Notice what quietly takes God's place: money, success, approval, a relationship, even a good cause. "
            "Put God first in your time, your choices and your trust."),
        "try_it": "Before you check your phone tomorrow morning, spend the first minutes of the day with God.",
        "key_verses": ["Matthew 4:10", "Matthew 6:24"],
    },
    {
        **SINAI, "number": 2,
        "name": "No graven images",
        "epithet": "Thou shalt not make unto thee any graven image",
        "told_in": "Exodus 20:4-6",
        "also_in": ["Deuteronomy 4:15-19", "Exodus 32:1-8", "John 4:24"],
        "words": ["Exodus 20:4-6"],
        "summary": "God is not to be worshipped through images or likenesses, because no image can show who he is.",
        "story": (
            "At Sinai the people heard God's voice from the fire, but 'ye saw no manner of similitude' "
            "(Deuteronomy 4:15). So they were not to make an image of anything in heaven, on earth or in the sea, "
            "or bow down to one. Weeks later, while Moses was still on the mountain, they made a golden calf and "
            "called it the god who had brought them out of Egypt."),
        "meaning": (
            "The first commandment is about which God we worship; the second is about how. God cannot be shaped, "
            "carried or controlled. The command carries a promise too: mercy 'unto thousands of them that love "
            "me, and keep my commandments.' Jesus said, 'God is a Spirit: and they that worship him must worship "
            "him in spirit and in truth' (John 4:24)."),
        "daily": (
            "We rarely carve idols now, but we still shrink God to a size we can manage: a lucky charm, a vending "
            "machine, a god who always agrees with us. Let God be who the Bible says he is."),
        "try_it": "Read a psalm about God's greatness, such as Psalm 145, and let it enlarge a picture of God that has grown too small.",
        "key_verses": ["John 4:24", "1 John 5:21"],
    },
    {
        **SINAI, "number": 3,
        "name": "God's name",
        "epithet": "Thou shalt not take the name of the LORD thy God in vain",
        "told_in": "Exodus 20:7",
        "also_in": ["Leviticus 19:12", "Matthew 5:33-37", "Matthew 6:9"],
        "words": ["Exodus 20:7"],
        "summary": "God's name is not to be used emptily: not in careless curses, and not to back up false promises.",
        "story": (
            "In Israel a name stood for the person. To take God's name 'in vain' was to use it for nothing, or "
            "for a lie: swearing falsely by it, cursing with it, or claiming his authority for one's own ends. "
            "The law adds, 'ye shall not swear by my name falsely, neither shalt thou profane the name of thy "
            "God' (Leviticus 19:12)."),
        "meaning": (
            "It covers more than bad language. Those who carry God's name, as his people do, can take it in vain "
            "by living in a way that dishonours it. Jesus taught his disciples to pray first, 'Hallowed be thy "
            "name', and to keep their word so plainly that no oath is needed: 'let your communication be, Yea, "
            "yea; Nay, nay' (Matthew 5:37)."),
        "daily": (
            "Speak God's name with respect, keep your promises without needing to swear, and remember that people "
            "judge God by how his people live."),
        "try_it": "Keep one promise today exactly as you made it, and let your yes mean yes.",
        "key_verses": ["Matthew 5:37", "Matthew 6:9"],
    },
    {
        **SINAI, "number": 4,
        "name": "The sabbath day",
        "epithet": "Remember the sabbath day, to keep it holy",
        "told_in": "Exodus 20:8-11",
        "also_in": ["Deuteronomy 5:12-15", "Mark 2:23-28", "Hebrews 4:9-10"],
        "words": ["Exodus 20:8-11"],
        "summary": "One day in seven set apart for rest and for God, for everyone in the household, servants and animals included.",
        "story": (
            "'Six days shalt thou labour, and do all thy work: But the seventh day is the sabbath of the LORD thy "
            "God.' No one was to work that day: not children, not servants, not animals, not the foreigner in "
            "town. Exodus grounds it in creation, for God rested on the seventh day. Deuteronomy adds the memory "
            "of slavery: 'remember that thou wast a servant in the land of Egypt' (Deuteronomy 5:15)."),
        "meaning": (
            "The sabbath is a gift before it is a rule: a slave never gets a day off, and God's people do. Jesus "
            "said, 'The sabbath was made for man, and not man for the sabbath' (Mark 2:27), and he healed on it. "
            "Christians keep this command in different ways, many gathering on Sunday, the day of the "
            "resurrection, and all see in it the deeper rest God gives (Hebrews 4:9-10)."),
        "daily": (
            "Your worth is not measured by how much you produce. Set aside regular time to stop, to rest, to "
            "worship, and to enjoy God and the people around you."),
        "try_it": "Choose a day this week to put work aside for rest, worship and the people you love, and plan it now.",
        "key_verses": ["Mark 2:27", "Hebrews 4:9"],
    },
    {
        **SINAI, "number": 5,
        "name": "Honour your father and mother",
        "epithet": "Honour thy father and thy mother",
        "told_in": "Exodus 20:12",
        "also_in": ["Deuteronomy 5:16", "Ephesians 6:1-4", "Mark 7:9-13"],
        "words": ["Exodus 20:12"],
        "summary": "Children of every age are to honour their father and mother, the first commandment with a promise attached.",
        "story": (
            "The fifth commandment turns from God to people, and begins at home: 'Honour thy father and thy "
            "mother: that thy days may be long upon the land which the LORD thy God giveth thee.' Jesus rebuked "
            "religious leaders who let people avoid supporting their aged parents by declaring their money a "
            "gift to God (Mark 7:10-13)."),
        "meaning": (
            "To honour is to give weight to: respect, gratitude and, in old age, care. Paul calls it 'the first "
            "commandment with promise' (Ephesians 6:2), and he has a word for parents too: 'provoke not your "
            "children to wrath' (Ephesians 6:4). From the cross, Jesus made sure his mother would be cared for "
            "(John 19:26-27)."),
        "daily": (
            "Honour does not always mean agreeing, and it is harder when parents have failed. But it always means "
            "respect, gratitude where you can give it, and care as they grow older."),
        "try_it": "Call or visit a parent or an older relative today, and thank them for one specific thing.",
        "key_verses": ["Ephesians 6:2-3", "Proverbs 23:22"],
    },
    {
        **SINAI, "number": 6,
        "name": "Do not kill",
        "epithet": "Thou shalt not kill",
        "told_in": "Exodus 20:13",
        "also_in": ["Genesis 9:6", "Matthew 5:21-24", "1 John 3:15"],
        "words": ["Exodus 20:13"],
        "summary": "Human life is not ours to take, because every person is made in the image of God.",
        "story": (
            "The sixth commandment is four words in English: 'Thou shalt not kill.' The Hebrew word is the one "
            "used for murder, the unlawful taking of a human life, which is why many modern translations say "
            "“You shall not murder”. Behind it stands Genesis: 'for in the image of God made he man' (Genesis "
            "9:6)."),
        "meaning": (
            "Jesus went to the root: anger and contempt are murder in the heart. 'Whosoever is angry with his "
            "brother without a cause shall be in danger of the judgment' (Matthew 5:22), and he told his hearers "
            "to be reconciled before they brought a gift to the altar. John adds, 'Whosoever hateth his brother "
            "is a murderer' (1 John 3:15)."),
        "daily": (
            "Value life at every stage, and guard your heart against the anger, contempt and bitterness that grow "
            "into violence of word or deed."),
        "try_it": "If there is someone you are angry with, take one step toward making peace with them today.",
        "key_verses": ["Matthew 5:22", "1 John 3:15"],
    },
    {
        **SINAI, "number": 7,
        "name": "Do not commit adultery",
        "epithet": "Thou shalt not commit adultery",
        "told_in": "Exodus 20:14",
        "also_in": ["Proverbs 5:15-20", "Matthew 5:27-28", "Hebrews 13:4"],
        "words": ["Exodus 20:14"],
        "summary": "Marriage is to be kept faithful, and the covenant between husband and wife protected.",
        "story": (
            "'Thou shalt not commit adultery.' The seventh commandment guards marriage, the covenant at the heart "
            "of the family. The law, the prophets and the proverbs all treat unfaithfulness as betrayal, and "
            "Proverbs urges a husband to 'rejoice with the wife of thy youth' (Proverbs 5:18)."),
        "meaning": (
            "Jesus again went to the heart: to look at someone with lust is adultery already committed in the "
            "heart (Matthew 5:28). Hebrews says, 'Marriage is honourable in all, and the bed undefiled' (Hebrews "
            "13:4). God's intention is joyful, faithful love, and faithfulness begins with the eyes and the "
            "imagination."),
        "daily": (
            "Protect your marriage, or a future one, by what you look at, the friendships you allow, and the "
            "honesty you keep with your husband or wife."),
        "try_it": "Do one thoughtful thing today that tells your husband or wife, I choose you again. If you are not married, pray for a marriage you know.",
        "key_verses": ["Matthew 5:28", "Hebrews 13:4"],
    },
    {
        **SINAI, "number": 8,
        "name": "Do not steal",
        "epithet": "Thou shalt not steal",
        "told_in": "Exodus 20:15",
        "also_in": ["Leviticus 19:11-13", "Exodus 22:1", "Ephesians 4:28"],
        "words": ["Exodus 20:15"],
        "summary": "Other people's property is to be respected, and a living earned honestly.",
        "story": (
            "'Thou shalt not steal.' The law spelled it out for daily business: 'Ye shall not steal, neither deal "
            "falsely, neither lie one to another' (Leviticus 19:11), and a worker's wages were not to be held "
            "back overnight (Leviticus 19:13). What was stolen had to be repaid, often several times over "
            "(Exodus 22:1)."),
        "meaning": (
            "Paul turns the command from a prohibition into a new way of living: 'Let him that stole steal no "
            "more: but rather let him labour, working with his hands the thing which is good, that he may have "
            "to give to him that needeth' (Ephesians 4:28). The opposite of stealing is not only honesty, but "
            "generosity."),
        "daily": (
            "Stealing includes cheating on time, taxes, copyright or expenses, and not paying what we owe. Work "
            "honestly, pay fairly and promptly, and give."),
        "try_it": "Pay back anything you owe, even something small, or return something you borrowed.",
        "key_verses": ["Ephesians 4:28"],
    },
    {
        **SINAI, "number": 9,
        "name": "Do not bear false witness",
        "epithet": "Thou shalt not bear false witness against thy neighbour",
        "told_in": "Exodus 20:16",
        "also_in": ["Deuteronomy 19:15-19", "Proverbs 6:16-19", "Ephesians 4:25"],
        "words": ["Exodus 20:16"],
        "summary": "We are not to lie about other people, in court or in conversation.",
        "story": (
            "'Thou shalt not bear false witness against thy neighbour.' In Israel a case could turn on witnesses, "
            "so a lie could cost someone their property or their life, and a false witness was given the "
            "punishment he had meant for the other (Deuteronomy 19:18-19). Proverbs lists 'A false witness that "
            "speaketh lies' among the things the LORD hates (Proverbs 6:19)."),
        "meaning": (
            "Jesus himself was condemned by false witnesses (Mark 14:56). The command reaches beyond the "
            "courtroom to gossip, slander and half-truths that damage someone's name. Paul writes, 'putting away "
            "lying, speak every man truth with his neighbour' (Ephesians 4:25)."),
        "daily": (
            "Before you repeat something about someone, ask: is it true, is it kind, is it mine to share? Defend "
            "people's reputations when they are not there."),
        "try_it": "Say something good about someone who is not in the room.",
        "key_verses": ["Ephesians 4:25", "Proverbs 12:22"],
    },
    {
        **SINAI, "number": 10,
        "name": "Do not covet",
        "epithet": "Thou shalt not covet",
        "told_in": "Exodus 20:17",
        "also_in": ["Romans 7:7", "Luke 12:15", "1 Timothy 6:6-8"],
        "words": ["Exodus 20:17"],
        "summary": "The last commandment reaches inside: we are not to set our hearts on what belongs to someone else.",
        "story": (
            "The first nine commandments mostly concern what we do. The tenth is about what we want: 'Thou shalt "
            "not covet thy neighbour's house, thou shalt not covet thy neighbour's wife … nor any thing that is "
            "thy neighbour's.' Paul said it was this commandment that showed him his own heart: 'I had not known "
            "lust, except the law had said, Thou shalt not covet' (Romans 7:7)."),
        "meaning": (
            "Coveting is where stealing, adultery and many lies begin. Jesus warned, 'Take heed, and beware of "
            "covetousness' (Luke 12:15), because life does not consist in what we own. The cure is contentment: "
            "'godliness with contentment is great gain' (1 Timothy 6:6)."),
        "daily": (
            "Comparison drives covetousness, and screens feed it all day long. Practise gratitude for what you "
            "have, and rejoice when others are blessed."),
        "try_it": "Write down five things you are thankful for, and mute one account that keeps you wanting what others have.",
        "key_verses": ["Luke 12:15", "1 Timothy 6:6"],
    },
]
