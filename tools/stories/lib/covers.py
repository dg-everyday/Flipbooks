# -*- coding: utf-8 -*-
"""One cover concept per story book. Each cover shows the book's hinge image, keeps the book's own
restraint rules, and carries the title as its only text.

Fields: scene (what is in the picture), why (how it names the book's hinge), light, title_zone (where
the title sits so it has clean ground behind it), avoid (what must not appear).
"""

COVERS = {
    "the-fourth-man-in-the-fire": {  # The Fourth Man in the Fire — Daniel 3
        "scene": "The mouth of a vast Babylonian brick furnace, seen from outside, filling the lower two "
                 "thirds of the frame. Inside, in white-hot flame, four upright figures walk unhurried: "
                 "three young Hebrew men in Babylonian court dress — long coats, hosen and hats — "
                 "untouched by the fire, and beside them a fourth figure rendered only as presence and "
                 "light, the one shape the fire does not illuminate. Burnt rope lies in ash at their feet. "
                 "Far behind, a towering narrow gold statue stands as a hard vertical against the sky.",
        "why": "The fourth figure in the fire (Daniel 3:25) is the answer to the king's challenge and the "
               "book's title.",
        "light": "White-hot core through orange to soot inside the furnace; dusty ochre and sand outside; "
                 "the gold image the brightest vertical.",
        "title_zone": "Top third, over the dark soot-smudged sky above the furnace.",
        "avoid": "No face, wings or halo on the fourth figure. No burning bodies. No modern dress.",
    },
    "a-great-way-off": {  # A Great Way Off — Luke 15
        "scene": "A long bleached dirt road running down from a hilltop farm with a lamp-lit doorway. Far "
                 "down the road, small and thin, a young man in ragged clothes walks home with his head "
                 "down. Running toward him down the road, robe hitched up, closing the distance, is his "
                 "father — an older man with a grey beard. The gap between them is the whole picture.",
        "why": "“When he was yet a great way off, his father saw him … and ran” (Luke 15:20) — the "
               "father closes the distance himself.",
        "light": "White glare and bleached dust on the road; the farm behind in warm ochre and lamp-gold, "
                 "the only warm light.",
        "title_zone": "Top third, over the pale sky above the farm.",
        "avoid": "No haloes. The father must be running, not waiting. No pigs, no far-country scenes.",
    },
    "into-his-hand": {  # Into His Hand — Genesis 39
        "scene": "Inside a cold grey stone Egyptian prison built with the same palm-column spacing and "
                 "doorway shape as a wealthy villa. A young Hebrew man in a plain undyed under-tunic stands "
                 "in the centre, holding the prison keeper's ring of keys in his open hand; a single warm "
                 "lamp lights him. Through the doorway behind him, faint and far, the white sunlit villa he "
                 "once ran.",
        "why": "Twice everything is given into his hand — “all that he had he put into his hand” in the "
               "house (Genesis 39:4), and the prison keeper “committed to Joseph’s hand all the prisoners” "
               "(39:22). The keys in his hand are the rhyme.",
        "light": "Cold grey stone with one warm lamp; hard white light and black shadow through the door.",
        "title_zone": "Top third, over the dark stone wall above the doorway.",
        "avoid": "No figure, light effect or symbol for the LORD. No Potiphar's wife on the cover. No "
                 "nudity.",
    },
    "and-ruth-with-her": {  # And Ruth With Her — Ruth 1–2
        "scene": "Two widows on a bleached stone road climbing toward a small walled hill town. The older "
                 "woman, Naomi, walks a little ahead, worn and grey. Beside her, not behind, walks the "
                 "young Moabite woman Ruth in Moabite dress and headcloth, carrying a bundle in her arms. "
                 "At the edge of the frame, the first rows of ripe barley catch the light.",
        "why": "Ruth goes where Naomi goes (Ruth 1:16); they arrive “in the beginning of barley harvest” "
               "(1:22).",
        "light": "White glare on the road, almost colourless — with barley gold arriving at the frame's "
                 "edge as the only saturated colour.",
        "title_zone": "Top third, over the pale sky above the hill town.",
        "avoid": "No figure, light effect or symbol for the LORD. No men threatening Ruth. No haloes.",
    },
    "one-thing-thou-lackest": {  # One Thing Thou Lackest — Mark 10
        "scene": "A dusty first-century road between dry-stone walls. In the centre, a man in fine "
                 "deep-blue dyed cloth kneels in the dust, looking up — the only saturated colour in the "
                 "picture. Standing before him, seen from behind so his face is not shown, is Jesus in "
                 "undyed wool; the disciples stand a little way off.",
        "why": "He came running and kneeled (Mark 10:17), and “Jesus beholding him loved him” (10:21).",
        "light": "Hard mid-morning sun on a dust-white road, olive-grey walls, short black shadows.",
        "title_zone": "Top third, over the pale sky above the road.",
        "avoid": "No halo or glow. Jesus' face not shown. No treasure, servants or estate. No other "
                 "saturated colour.",
    },
    "for-his-oaths-sake": {  # For His Oath's Sake — Mark 6
        "scene": "A lamp-lit birthday supper in a Herodian hall, crowded with officials, officers and "
                 "wealthy guests on dining couches, every face turned toward the king. In the foreground, "
                 "King Herod's right hand — heavy gold signet ring — raised to swear an oath. At the far "
                 "edge of the frame, a stone stair drops away into cold blue-black darkness toward the "
                 "prison.",
        "why": "“For his oath's sake, and for their sakes which sat with him” (Mark 6:26) — the oath and "
               "the watching room decide it.",
        "light": "Warm lamp-gold and wine-dark shadows in the hall; a thin cold blue from the stair.",
        "title_zone": "Top third, over the dark rafters of the hall.",
        "avoid": "No dancing girl. No execution, no head, no charger. No blood. No Jesus.",
    },
    "help-thou-mine-unbelief": {  # Help Thou Mine Unbelief — Mark 9
        "scene": "Lower half: a dusty valley crowd, and in its centre a worn father kneeling in the dust "
                 "beside his small son, face turned up. A hand reaches into the frame to take the boy's "
                 "hand. Upper half, far behind: a bare high mountain with a pale cloud resting on its "
                 "summit.",
        "why": "The father's cry, “Lord, I believe; help thou mine unbelief” (Mark 9:24), under the "
               "mountain where the voice said “hear him.”",
        "light": "Hot valley dust and ochre below; high thin cold light and a pale cloud above.",
        "title_zone": "Top third, over the sky and cloud around the summit.",
        "avoid": "No figure in the cloud. No spirit, creature or shadow-shape. No close-up of the boy in a "
                 "fit. No halo or glow.",
    },
    "where-art-thou": {  # Where Art Thou? — Genesis 3
        "scene": "A garden-orchard at dusk, wind streaming through the trees. Half hidden among the tree "
                 "trunks, a man and a woman in aprons of sewn fig leaves look out toward an empty path, "
                 "afraid. On one branch in the middle distance, a large olive-and-bronze serpent lies "
                 "coiled, its lower body hidden in leaves. Near the centre, one fruit tree hung with small "
                 "unfamiliar pale-gold fruit.",
        "why": "“They heard the voice of the LORD God walking in the garden in the cool of the day: and "
               "Adam and his wife hid themselves” (Genesis 3:8) — and then the call, “Where art thou?”",
        "light": "Evening, long blue shadows, the last warm light cooling; wind in every leaf.",
        "title_zone": "Top third, over the dusk sky above the trees.",
        "avoid": "No figure, silhouette or glow for the LORD God. No apple. Nothing explicit — the man and "
                 "woman are covered by their aprons and the foliage. No human face on the serpent.",
    },
    "while-he-lingered": {  # While He Lingered — Genesis 19
        "scene": "Cold grey dawn at the gate of a walled city on a plain. Two men in plain dusty cloaks "
                 "lead four people out through the gate by the hand: an anxious man in fine robes, his "
                 "wife in a head covering, and their two young daughters. The city behind them is still "
                 "and dark.",
        "why": "“While he lingered, the men laid hold upon his hand … the LORD being merciful unto him” "
               "(Genesis 19:16).",
        "light": "Cold grey first light, blue shadows in the gateway, the faintest dawn on the horizon.",
        "title_zone": "Top third, over the grey dawn sky above the city wall.",
        "avoid": "No wings, halo or glow on the two men. No crowd, no violence. No fire yet, no one "
                 "burning. No figure for the LORD. No pillar of salt on the cover.",
    },
    "too-many-for-me": {  # Too Many for Me — Judges 7
        "scene": "Night. In the foreground, one Israelite farmer-soldier in plain wool faces us, holding a "
                 "small flaming clay lamp high in his left hand and a ram's-horn trumpet to his mouth in "
                 "his right. Behind him, a thin ring of three hundred such lamps encircles a vast dark "
                 "valley of black tents and camels.",
        "why": "They “held the lamps in their left hands, and the trumpets in their right hands” (Judges "
               "7:20) — hands too full to hold a sword.",
        "light": "Blue-black night; the ring of lamps as the brightest thing in the picture; scattered "
                 "orange campfires in the valley.",
        "title_zone": "Top third, over the night sky above the ring of lamps.",
        "avoid": "No sword in any Israelite hand. No wounds, bodies or blood. No figure for the LORD.",
    },
    "how-much-more": {  # How Much More — Luke 11
        "scene": "Early morning on a quiet hillside of olive trees above a road. Jesus kneels alone in "
                 "prayer among the olives; a little way off his disciples sit and wait, watching. Far "
                 "below, one village doorway glows with lamplight.",
        "why": "“As he was praying in a certain place, when he ceased, one of his disciples said … Lord, "
               "teach us to pray” (Luke 11:1).",
        "light": "Soft early-morning light, olive green and dust, a wide pale sky.",
        "title_zone": "Top third, over the pale morning sky above the olive trees.",
        "avoid": "No halo or glow. No figure, light from above or dove for the Father or the Holy Spirit. "
                 "No identifiable landmark.",
    },
    "forbid-them-not": {  # Forbid Them Not — Mark 10
        "scene": "A sunlit village courtyard east of the Jordan, its plain wooden gate standing wide open "
                 "behind. Jesus crouches at a child's eye level with a small child lifted in one arm and "
                 "his other hand resting on the head cloth of a little girl of about four in a faded ochre "
                 "tunic; more small children crowd round his knees. In the open gateway behind, the "
                 "disciples stand aside with their arms lowered, and parents lead more children in.",
        "why": "“Suffer the little children to come unto me, and forbid them not” (Mark 10:14); “he took "
               "them up in his arms, put his hands upon them, and blessed them” (Mark 10:16).",
        "light": "Warm morning light, dusty ochre and stone, olive and faded blue; the courtyard brighter "
                 "than the lane beyond the gate.",
        "title_zone": "Top third, over the pale sky and dry hills above the courtyard wall.",
        "avoid": "No halo or glow. No sentimental, doll-like children. No image of the kingdom. No anger "
                 "on Jesus' face. No mothers-only crowd — fathers and older siblings too.",
    },
    "all-things-new": {  # All Things New — Revelation 21–22
        "scene": "From a bare mountain summit in the foreground, a weathered man in plain undyed wool, seen "
                 "from behind, looks out beside a tall figure in white linen with a golden girdle. Filling "
                 "the middle distance, a vast walled city descends out of the sky toward a new, green "
                 "earth that runs to the horizon with no sea anywhere: a wall of clear green jasper, open "
                 "gates of pearl, and gold like clear glass, with light coming from within it.",
        "why": "“Behold, I make all things new” (Revelation 21:5), and the city he is shown: “that great "
               "city, the holy Jerusalem, descending out of heaven from God” (21:10).",
        "light": "No sun in the sky; clear light from the city itself — gold, crystal and pearl — over a "
                 "fresh green land.",
        "title_zone": "Top third, over the pale sky above the descending city.",
        "avoid": "No figure, throne or face in the sky. No lamb. No woman or bride. No wings or halo on "
                 "the angel. No sea. No spires or fantasy castle.",
    },
}
