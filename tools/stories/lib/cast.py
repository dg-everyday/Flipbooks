# -*- coding: utf-8 -*-
"""Fixed looks for every recurring figure in each book, so an image generator draws the same
person on every page. Each entry stays inside that book's own character notes, style bible and
restraint rules. Jesus and Peter are described identically in both Mark volumes."""

JESUS = ("A first-century Galilean man of about thirty. Olive-brown skin, dark hair, short dark beard. "
         "Undyed wool tunic and cloak, worn sandals. No halo, no glow, no spotlight, no European "
         "features; hard to pick out of a group in wide shots.")
PETER = ("A sturdy fisherman in his forties. Broad shoulders, sun-darkened skin, grey-flecked dark "
         "beard. Undyed wool, head cloth.")

CAST = {
    # ------------------------------------------------------------ Daniel 3
    "the-fourth-man-in-the-fire": [
        ("NEBUCHADNEZZAR", "King of Babylon, in his fifties. Powerful build, dark curled beard in the "
         "Babylonian style, tall royal headdress, richly embroidered fringed robes, gold armlets. The "
         "one figure whose face visibly changes — his rage in v.19 is his key beat."),
        ("SHADRACH, MESHACH AND ABEDNEGO", "Three young Hebrew men in their twenties, in Babylonian court "
         "dress — long coats, hosen and hats — and in exactly the same clothes on every page, including "
         "after the furnace, untouched. Shadrach: the tallest, short dark beard, steady. Meshach: the "
         "slightest and youngest-looking, light beard. Abednego: fuller beard, watchful eyes. They always "
         "speak together, in one balloon with three tails."),
        ("THE FOURTH MAN", "Seen only inside the furnace. Presence and light, not a portrait: no rendered "
         "face, no wings, no halo. The one thing in the panel the fire does not light. Never shown leaving "
         "the furnace. Speaks no line."),
        ("THE HERALD", "A crier in official robes with a staff, mid-proclamation."),
        ("THE CERTAIN CHALDEANS", "A group of courtiers in layered wool and fringed mantles, drawn together "
         "and rarely told apart."),
        ("THE MOST MIGHTY MEN", "Big soldiers in scale armour and conical helms. Their deaths at the furnace "
         "mouth are shown only as collapse and recoil, never as burning bodies."),
        ("THE OFFICIALS OF THE PROVINCES", "Princes, governors, captains, judges, treasurers, counsellors and "
         "sheriffs in layered wool and fringed mantles — a crowd kept low and wide."),
        ("THE GOLDEN IMAGE", "A towering, narrow gold statue on the plain of Dura, much taller than it is "
         "wide. The text does not describe its form, so keep it plain. The brightest thing in any panel it "
         "appears in, always a hard vertical, and still standing at the end."),
    ],
    # ------------------------------------------------------------ Luke 15
    "a-great-way-off": [
        ("THE FATHER", "An older landowner in his sixties. Grey beard, weathered face, strong working hands, "
         "undyed wool. The only figure in the book who moves toward people; he runs on Page Five."),
        ("THE YOUNGER SON", "In his early twenties. His silhouette changes across the book: well fed in good "
         "clothes when he leaves; gaunt and ragged in the far country; still thin, but in the best robe, a "
         "signet ring and shoes, after he returns."),
        ("THE ELDER SON", "In his late twenties. Sun-darkened, work-worn, in working clothes; folded arms and "
         "working hands. Never shown inside the house after v.25."),
        ("THE SERVANT WHO IS ASKED", "A young, careful household servant in a plain tunic."),
        ("THE HOUSEHOLD SERVANTS", "Men and women of the household in simple tunics; the reaction shots."),
        ("THE CITIZEN OF THAT COUNTRY", "A prosperous landowner of a Hellenistic provincial city. One panel, "
         "no dialogue."),
        ("THE FAR-COUNTRY COMPANIONS", "Nameless faces, gone the moment the money is. Never shown in "
         "debauchery; waste is shown as spill, excess and mess."),
        ("THE SWINE AND THE HUSKS", "Well-fed pigs; the husks are carob pods. The pigs look better fed than "
         "the man."),
        ("THE ROBE, THE RING AND THE SHOES", "The father's own best robe, a signet ring, and sandals — drawn "
         "as three separate things the reader can count."),
        ("NEVER SHOWN", "The killing of the fatted calf (show only the fires and the crowd). The harlots of "
         "v.30. The audience of Luke 15:1–2."),
    ],
    # ------------------------------------------------------------ Genesis 39
    "into-his-hand": [
        ("JOSEPH", "A young Hebrew, visibly too young for the job he does, and very good at it; “a goodly "
         "person, and well favoured.” Undyed foreign cloth among Egyptian white linen throughout, so he "
         "never quite belongs. From Page One he wears the steward's seal; from Page Five his outer garment "
         "is gone and he wears only the plain under-tunic he fled in."),
        ("POTIPHAR'S WIFE", "The mistress of the house. Composed and entirely unhurried, in fine white linen "
         "with kohl and a broad collar. Never a caricature and never sexualised; her power is positional."),
        ("POTIPHAR", "An officer of Pharaoh, captain of the guard. A busy professional soldier in Egyptian "
         "officer's linen and collar; tired, not cruel. Speaks no line."),
        ("THE KEEPER OF THE PRISON", "The prison warden, drawn deliberately like Potiphar in posture and "
         "framing so the two rhyme. Speaks no line."),
        ("THE MEN OF THE HOUSE", "Egyptian household servants in white linen; the silent jury."),
        ("THE ISHMEELITES", "Desert traders with camels. One panel only."),
        ("THE GARMENT", "Plain, undyed working cloth, nothing decorative — the same silhouette in every panel "
         "it appears in."),
        ("NEVER SHOWN", "The LORD — no figure, no light effect, no symbol, anywhere. No nudity and no "
         "depicted assault."),
    ],
    # ------------------------------------------------------------ Ruth 1-2
    "and-ruth-with-her": [
        ("NAOMI", "An Israelite woman in her fifties in undyed wool and a Judean head covering. She grows "
         "visibly older on the road and no younger afterwards; the change shows in her eyes and hands, not "
         "her posture."),
        ("RUTH", "A young Moabite widow in her twenties. Moabite dress and headcloth that differ quietly in "
         "pattern from Judean dress, so she reads as foreign in every crowd. She is the one who carries "
         "things; in chapter two she has something in her arms in nearly every panel, and the load grows."),
        ("ORPAH", "A young Moabite widow in her twenties in the same Moabite dress as Ruth; drawn "
         "sympathetically, with a proper farewell panel."),
        ("BOAZ", "A landowner in his late forties, sturdy, grey-streaked beard, in good but practical wool. "
         "Always in the field with his men, never a patron at a distance."),
        ("ELIMELECH, MAHLON AND CHILION", "Naomi's husband and two young sons, drawn once, briefly and "
         "warmly, on Page One only."),
        ("THE SERVANT SET OVER THE REAPERS", "A careful, middle-aged foreman."),
        ("THE YOUNG MEN AND THE MAIDENS", "Boaz's reapers and his women workers in working clothes. The "
         "danger is shown only as watchfulness and distance; nothing happens to Ruth."),
        ("ALL THE CITY", "The women and townspeople of Bethlehem at the gate, moving as one chorus."),
        ("THE BARLEY", "The only saturated colour in the book — barley gold — arriving at Page Five Panel 2 "
         "and never leaving."),
        ("NEVER SHOWN", "The LORD — no figure, no light effect, no symbol, in any panel."),
    ],
    # ------------------------------------------------------------ Mark 10
    "one-thing-thou-lackest": [
        ("JESUS", JESUS + " His face is the subject of exactly one panel, Page Three Panel 2."),
        ("THE MAN WHO RAN", "A man in early adulthood in fine deep-blue dyed cloth and good leather sandals — "
         "the only saturated colour in the book, from Page One Panel 2 until he leaves on Page Four Panel "
         "3. Sincere and likeable; never drawn as a villain."),
        ("PETER", PETER + " Eager and sympathetic, never mocked."),
        ("THE DISCIPLES", "The twelve, ordinary men in undyed wool on a dusty road; they share one balloon "
         "when they speak together."),
        ("THE CAMEL AND THE NEEDLE", "A real loaded camel and a real sewing needle, drawn at true scale — no "
         "gate, nothing that suggests a way through."),
        ("NEVER SHOWN", "The poor (named once, never drawn). The man's wealth as treasure, estate or "
         "servants — it lives only in what he wears. No one chasing him."),
    ],
    # ------------------------------------------------------------ Mark 6
    "for-his-oaths-sake": [
        ("KING HEROD", "A cultivated ruler in his forties. Olive skin, dark hair, neatly trimmed dark beard. "
         "Fine dyed robes of deep blue and purple over linen. One heavy gold signet ring on his right hand "
         "— this ringed hand is a recurring motif. No crown; his rank shows in his clothes and his ring. "
         "Never a leering tyrant: his fear, gladness and sorrow must all read as sincere."),
        ("JOHN THE BAPTIST", "A gaunt man in his thirties. Weathered olive skin, long unkempt dark hair and "
         "beard, steady eyes. Rough undyed cloth. Iron at his wrists after his arrest."),
        ("HERODIAS", "A woman in her late thirties. Composed and still. Dark hair dressed high, fine linen, "
         "gold jewellery. Never smiles, never gloats."),
        ("THE DAMSEL", "Herodias' daughter. A young girl, clearly a child of about twelve. Modest long dress, "
         "hair in plain braids. Never drawn dancing."),
        ("THE EXECUTIONER", "A guard in a plain soldier's tunic. Face turned away or in shadow; sword "
         "sheathed. Never shown at the act."),
        ("THE GUESTS", "Three groups at the supper: officials in fine robes, officers in military dress, and "
         "wealthy landowners in rich wool. Well fed, watchful."),
        ("COURTIERS, SERVANTS AND JOHN'S DISCIPLES", "Ordinary people of first-century Galilee in undyed "
         "wool and linen, head cloths, worn sandals."),
        ("NEVER SHOWN", "Jesus, Philip and Elias are named in the text but never drawn. The dance, the "
         "execution and the head are never drawn; the charger is always covered."),
    ],
    # ------------------------------------------------------------ Mark 9
    "help-thou-mine-unbelief": [
        ("JESUS", JESUS + " On Pages One to Three only, while transfigured, his garments burn pure white and "
         "his face stays in soft shadow — the face is never the light source. After Page Three Panel 5 he "
         "is ordinary again."),
        ("PETER", PETER),
        ("JAMES", "A tall, lean man in his thirties with a full dark beard. Undyed wool."),
        ("JOHN (THE DISCIPLE)", "The youngest of the three, slight, with a short dark beard. Undyed wool."),
        ("MOSES", "An elderly man with a long white beard in a plain robe. No glow, no tablets of the law, no "
         "horns of light."),
        ("ELIAS", "A lean, weathered older man with grey hair and beard in a plain dark cloak. No glow, no "
         "chariot, no mantle as a prop."),
        ("THE FATHER", "A working man in his forties. Dust on his clothes, worn sandals, tired eyes. Never "
         "weak — frightened and honest."),
        ("THE BOY", "His son. A small boy of about eight to ten (Mark gives no age; draw him clearly young). "
         "Plain tunic. His fits are shown only as falls and dust, never as close-ups of his face."),
        ("THE SCRIBES", "Teachers of the law in long fringed robes and head coverings."),
        ("THE DISCIPLES BELOW AND THE CROWD", "Ordinary people of first-century Galilee in undyed wool and "
         "linen, head cloths, worn sandals."),
        ("NEVER SHOWN", "The speaker of the voice from the cloud (draw only the cloud). The spirit, in any "
         "form — no creature, no shadow-shape, no face in smoke. Elias who is come (v.13)."),
    ],
    # ------------------------------------------------------------ Genesis 3
    "where-art-thou": [
        ("THE MAN (ADAM)", "An adult man in his twenties. Olive-brown skin, dark curly hair and short beard, "
         "strong build. Staged modestly at all times: before Page Three Panel 6 only with distance, foliage "
         "and framing; from Page Three Panel 6 wearing an apron of sewn fig leaves; from Page Eight Panel 2 "
         "wearing a plain coat of skin."),
        ("THE WOMAN (EVE)", "An adult woman in her twenties. Olive-brown skin, very long dark hair falling "
         "over her shoulders. Same modest staging and the same three coverings as the man."),
        ("THE SERPENT", "A large, beautiful snake with olive and bronze patterned scales and animal eyes. "
         "Never a human face, never a man, an angel or a dragon. Until Page Six Panel 2 it is coiled along a "
         "branch with its lower body hidden in the leaves; from Page Six Panel 2 it lies on the ground."),
        ("THE TREE IN THE MIDST OF THE GARDEN", "An ordinary, beautiful fruit tree. Its fruit is small, oval "
         "and unfamiliar, pale gold with a blue-green bloom — never an apple, never any fruit a reader could "
         "name. Use exactly this fruit every time it appears."),
        ("THE CHERUBIM AND THE FLAMING SWORD", "Tall presences of light at the east gate, with no faces and no "
         "wings. The sword is a ring of flame turning in every direction."),
        ("NEVER SHOWN", "The LORD God, in any form — no figure, silhouette, glow, hands or footprints. His "
         "presence is the evening wind moving the trees; his words come from off-panel."),
    ],
}

CAST["while-he-lingered"] = [
    ("LOT", "A prosperous city man in his fifties. Olive skin, greying dark beard, fine dyed robes and a "
     "good head cloth. Anxious rather than heroic; never a caricature."),
    ("THE TWO MEN", "Two travellers in plain, dusty cloaks, one taller and bearded, one clean-shaven and "
     "slighter; grave and calm. They look like men. No wings, no halo, no glow, ever."),
    ("LOT'S WIFE", "A woman of the city in her forties, in good dyed clothes and a head covering. In her last "
     "panel she is seen only from behind."),
    ("LOT'S TWO DAUGHTERS", "Two young women in modest dress and head coverings. Never shown at the door or "
     "before the crowd; they never speak."),
    ("THE SONS IN LAW", "Young men of Sodom, woken in the night, laughing."),
    ("THE MEN OF SODOM", "A large crowd of men, old and young, with torches, at night. Shown as numbers, "
     "noise, anger and pressure on a door — never sexualised."),
    ("ABRAHAM", "An old man with a long white beard in undyed tent-dweller's wool, with a staff, alone on a "
     "height at dawn."),
    ("PLACES", "Sodom: a walled mud-brick and stone city with a gate on a green plain. Lot's house: stone, "
     "flat roof, a heavy wooden door. Zoar: a small walled town at the plain's edge."),
    ("NEVER SHOWN", "The LORD, in any form. Anyone burning. Any face or figure in the pillar of salt, which "
     "is a plain white pillar about the height of a woman."),
]

CAST["too-many-for-me"] = [
    ("GIDEON", "A farmer turned leader in his thirties. Olive-brown skin, dark hair and short dark beard, "
     "lean and weathered, in plain undyed wool with a leather belt and little armour. Serious, never "
     "swaggering."),
    ("PHURAH", "Gideon's servant, a young man with a short beard in plain wool, always close at Gideon's "
     "shoulder."),
    ("THE THREE HUNDRED", "Ordinary Israelite farmers in undyed wool and head cloths. In the night attack "
     "each holds a small flaming clay lamp in his left hand and a ram's-horn trumpet in his right; no "
     "drawn sword, ever."),
    ("ISRAEL'S ARMY", "Thousands of the same ordinary men, never mocked when they go home."),
    ("THE HOST OF MIDIAN", "Desert peoples in dark robes and head cloths, with black goat-hair tents and "
     "great numbers of camels filling a valley. In the battle: confusion, silhouettes and glints only."),
    ("THE DREAMER AND HIS FELLOW", "Two tired Midianite soldiers by a low fire inside a tent."),
    ("THE MEN OF EPHRAIM", "Israelite men holding river crossings."),
    ("NEVER SHOWN", "The LORD, in any form. Wounds, bodies or blood. Oreb and Zeeb, alive or dead, and "
     "their heads."),
]

CAST["how-much-more"] = [
    ("JESUS", JESUS + " Teaches sitting down among the disciples."),
    ("THE DISCIPLE WHO ASKS", "A young man of about twenty in plain undyed wool, with a short dark beard and "
     "an earnest face. Unnamed."),
    ("THE DISCIPLES", "Ordinary Galilean men in undyed wool and head cloths, sitting and listening; none "
     "individually named."),
    ("PARABLE FIGURES", "Drawn only in PARABLE panels, in the parable treatment: THE MAN AT MIDNIGHT (a "
     "villager with a small clay lamp); THE FRIEND BEHIND THE DOOR (a sleepy householder on a mat with his "
     "children asleep beside him); THE TRAVELLER (dusty, road-worn); THE FATHER AND SON (a village father "
     "and his small boy at a meal). They must not look like any of the disciples."),
    ("NEVER SHOWN", "The heavenly Father, in any form. The Holy Spirit — no dove, no light, no symbol. John "
     "the Baptist and his disciples. Nothing frightening in the stone, serpent or scorpion, which are never "
     "handed to the child."),
]

CAST["forbid-them-not"] = [
    ("JESUS", JESUS + " At ease with children; crouches or sits to meet them and lifts them easily. His "
     "anger on Page Two Panel 2 is aimed at the disciples and never turned toward a child."),
    ("THE DISCIPLES", "Ordinary men in undyed wool and head cloths, none individually named. On Page One "
     "they bar the courtyard gate with outstretched arms; on Page Four they stand aside, arms lowered."),
    ("THE PARENTS", "Village men and women east of the Jordan in working clothes of undyed and faded "
     "wool — fathers as well as mothers, and older siblings leading younger ones."),
    ("THE SMALL GIRL", "About four years old, olive-brown skin, dark hair under a small head cloth, a faded "
     "ochre tunic. In every page; the reader's way in. Not named."),
    ("HER FATHER", "A lean working man in his thirties, short dark beard, dusty wool. Gentle with her."),
    ("THE CHILDREN", "Small children from babies in arms to about six, in plain tunics; ordinary and "
     "unposed, never doll-like."),
    ("PLACES", "A village of low stone houses on a dry slope east of the Jordan; a house with a walled "
     "courtyard and a plain wooden gate onto a dusty lane."),
    ("NEVER SHOWN", "Any halo or glow on Jesus. Any image of the kingdom of God. Words for the disciples, "
     "parents or children. Jesus' anger directed at a child. Anything that makes the children look "
     "frightened of him."),
]

CAST["all-things-new"] = [
    ("JOHN", "A weathered man in plain undyed wool and a head cloth, grey in his dark beard, with a wax "
     "writing tablet and stylus. The text gives no age. Small in the wide panels; never at the centre of "
     "the city."),
    ("THE ANGEL", "One of the seven angels of the vials. Looks like a tall man, grave and calm, in pure "
     "white linen with a golden girdle across his breast (Revelation 15:6). No wings, no halo. From Page "
     "Four he carries a golden measuring reed taller than himself."),
    ("THE TWELVE ANGELS AT THE GATES", "Tall still figures in the same white linen, one at each gate; no "
     "wings, no halo, no action."),
    ("THE NATIONS AND THE KINGS", "Men, women and children of many lands and many kinds of dress, walking "
     "in through open gates; the kings among them carry gifts."),
    ("HIS SERVANTS", "Always seen from behind, faces turned toward the light beyond the frame; no forehead "
     "and no name ever shown."),
    ("THE CITY", "A vast walled city, as high as it is wide: a wall of clear green jasper on twelve "
     "courses of different-coloured stone; twelve open gates, each cut from one pearl, three to a side; "
     "gold like clear glass; one golden street with a clear river down its middle and trees on both "
     "banks. No temple, spires or domes; no sun or moon above it."),
    ("PATMOS", "A small rocky Aegean island of grey stone, thorn and scrub, grey sea on every side. Only "
     "on Page One Panel 1 and Page Ten Panels 3–6."),
    ("NEVER SHOWN", "He that sat upon the throne, and the throne itself, which stays beyond the frame. The "
     "Lamb, in any form. Jesus, who is heard and not seen. The Spirit — no dove. The bride as a woman. The "
     "lake of fire and anyone outside the city. Any legible name."),
]

# Action-line wording that assumed a double-width panel, restated for an equal 2 x 3 grid.
GRID_FIXES = [
    ("The splash panel of the book, wider than the others.", "The key panel of the book."),
    ("The widest panel in the book, spanning the page.", "The key panel of the book."),
    ("The widest panel on the page, and", "The key panel on the page, and"),
]
