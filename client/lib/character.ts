export interface GameCharacter {
  characterName: string;
  animeNameEnglish: string;
  alternateName: string[];
  hint1: string;
  hint2: string;
  imageUrl: string;
}

export const characterDatabase: GameCharacter[] = [
  {
    characterName: "itachi uchiha",
    animeNameEnglish: "naruto",
    alternateName: ["itachi", "uchiha", "the crow of the akatsuki", "clan killer", "naruto shippuden", "ns"],
    hint1: "A rogue ninja who wears a black cloak adorned with red clouds.",
    hint2: "He sacrificed his entire clan to protect his younger brother, Sasuke.",
    imageUrl: "/images/characters/itachi-uchiha.webp"
  },
  {
    characterName: "monkey d. luffy",
    animeNameEnglish: "one piece",
    alternateName: ["luffy", "monkey", "straw hat", "straw hat luffy", "op"],
    hint1: "A rubber-bodied pirate captain on a quest to find the ultimate treasure.",
    hint2: "He wears a straw hat and loves eating massive amounts of meat.",
    imageUrl: "/images/characters/monkey-d-luffy.webp"
  },
  {
    characterName: "gojo satoru",
    animeNameEnglish: "jujutsu kaisen",
    alternateName: ["gojo", "satoru", "the strongest", "jjk"],
    hint1: "The strongest sorcerer who wears a dark blindfold to limit his sensory input.",
    hint2: "He possesses bright blue eyes and controls the power of infinity.",
    imageUrl: "/images/characters/gojo-satoru.webp"
  },
  {
    characterName: "lelouch lamperouge",
    animeNameEnglish: "code geass",
    alternateName: ["lelouch", "lamperouge", "zero", "lulu", "code geass: lelouch of the rebellion"],
    hint1: "An exiled prince who uses the persona of an absolute, masked rebel leader.",
    hint2: "His left eye holds the power of absolute obedience.",
    imageUrl: "/images/characters/lelouch-lamperouge.webp"
  },
  {
    characterName: "eren yaeger",
    animeNameEnglish: "attack on titan",
    alternateName: ["eren", "yaeger", "yeager", "shingeki no kyojin", "aot", "snk"],
    hint1: "A boy who swore to destroy every last giant monster after losing his mother.",
    hint2: "He can transform into a giant himself and eventually initiates the Rumbling.",
    imageUrl: "/images/characters/eren-yaeger.webp"
  },
  {
    characterName: "light yagami",
    animeNameEnglish: "death note",
    alternateName: ["light", "yagami", "kira", "dn"],
    hint1: "A genius high school student who finds a notebook dropped by a death god.",
    hint2: "He attempts to become the god of a new world by executing criminals.",
    imageUrl: "/images/characters/light-yagami.webp"
  },
  {
    characterName: "roronoa zoro",
    animeNameEnglish: "one piece",
    alternateName: ["zoro", "roronoa", "pirate hunter", "op"],
    hint1: "A green-haired swordsman with an unbelievably terrible sense of direction.",
    hint2: "He fights using three swords, holding the third one in his mouth.",
    imageUrl: "/images/characters/roronoa-zoro.webp"
  },
  {
    characterName: "killua zoldyck",
    animeNameEnglish: "hunter x hunter",
    alternateName: ["killua", "zoldyck", "hxh"],
    hint1: "A silver-haired boy from an infamous, elite family of deadly assassins.",
    hint2: "He is Gon's best friend and transmutes his aura into high-voltage electricity.",
    imageUrl: "/images/characters/killua-zoldyck.webp"
  },
  {
    characterName: "goku",
    animeNameEnglish: "dragon ball z",
    alternateName: ["son goku", "kakarot", "dragon ball", "dbz", "dbs"],
    hint1: "An alien martial artist sent to Earth who constantly seeks stronger opponents.",
    hint2: "He transforms into a golden-haired warrior when pushed to his absolute limits.",
    imageUrl: "/images/characters/goku.webp"
  },
  {
    characterName: "ken kaneki",
    animeNameEnglish: "tokyo ghoul",
    alternateName: ["ken", "kaneki", "eyepatch", "tg"],
    hint1: "A college student who turns into a flesh-eating monster after an organ transplant.",
    hint2: "His hair turns white from torture, and he wears a signature leather mask.",
    imageUrl: "/images/characters/ken-kaneki.webp"
  },
  {
    characterName: "tanjiro kamado",
    animeNameEnglish: "demon slayer",
    alternateName: ["tanjiro", "kamado", "kimetsu no yaiba", "kny"],
    hint1: "A kind-hearted coal seller who travels with his sister in a wooden box.",
    hint2: "He uses water and sun breathing styles to battle demons.",
    imageUrl: "/images/characters/tanjiro-kamado.webp"
  },
  {
    characterName: "levi ackerman",
    animeNameEnglish: "attack on titan",
    alternateName: ["levi", "ackerman", "humanity's strongest soldier", "aot", "snk"],
    hint1: "A short, clean-freak captain who leads the Special Operations Squad.",
    hint2: "He wields blades with an inverted grip to spin through giant opponents.",
    imageUrl: "/images/characters/levi-ackerman.webp"
  },
  {
    characterName: "ryomen sukuna",
    animeNameEnglish: "jujutsu kaisen",
    alternateName: ["sukuna", "ryomen", "king of curses", "jjk"],
    hint1: "An ancient, four-armed curse master sealed inside twenty mummified fingers.",
    hint2: "He resides inside a high school boy's body and cuts down enemies instantly.",
    imageUrl: "/images/characters/ryomen-sukuna.webp"
  },
  {
    characterName: "naruto uzumaki",
    animeNameEnglish: "naruto",
    alternateName: ["naruto", "uzumaki", "seventh hokage", "hero of the leaf", "naruto shippuden", "ns"],
    hint1: "An energetic, orange-clad orphan boy who dreams of leading his village.",
    hint2: "He houses a giant, nine-tailed orange fox sealed inside his stomach.",
    imageUrl: "/images/characters/naruto-uzumaki.webp"
  },
  {
    characterName: "saitama",
    animeNameEnglish: "one punch man",
    alternateName: ["saitama", "caped baldy", "opm"],
    hint1: "An incredibly average hero who is deeply bored by his absolute dominance.",
    hint2: "He defeats every single opponent with just a single strike.",
    imageUrl: "/images/characters/saitama.webp"
  },
  {
    characterName: "edward elric",
    animeNameEnglish: "fullmetal alchemist",
    alternateName: ["edward", "elric", "fullmetal", "fullmetal alchemist brotherhood", "fmab", "fma", "ed"],
    hint1: "A brilliant state alchemist with an auto-mail metal arm and leg.",
    hint2: "He lost his limbs and his brother's body in a failed attempt to resurrect their mother.",
    imageUrl: "/images/characters/edward-elric.webp"
  },
  {
    characterName: "l lawliet",
    animeNameEnglish: "death note",
    alternateName: ["l", "lawliet", "ryuzaki", "dn"],
    hint1: "The world's greatest detective who keeps his identity a closely guarded secret.",
    hint2: "He always sits in an unusual hunched posture and has a heavy sweet tooth.",
    imageUrl: "/images/characters/l-lawliet.webp"
  },
  {
    characterName: "sasuke uchiha",
    animeNameEnglish: "naruto",
    alternateName: ["sasuke", "uchiha", "shadow hokage", "naruto shippuden", "ns"],
    hint1: "The last loyalist-born survivor of his clan, focused purely on avenging them.",
    hint2: "He wields the sharingan eye and attacks using black flames and lightning.",
    imageUrl: "/images/characters/sasuke-uchiha.webp"
  },
  {
    characterName: "kakashi hatake",
    animeNameEnglish: "naruto",
    alternateName: ["kakashi", "hatake", "copy ninja", "sixth hokage", "naruto shippuden", "ns"],
    hint1: "A silver-haired mentor who covers his left eye and always carries a romance novel.",
    hint2: "He is famous for copying over a thousand techniques with his transplanted sharingan.",
    imageUrl: "/images/characters/kakashi-hatake.webp"
  },
  {
    characterName: "vegeta",
    animeNameEnglish: "dragon ball z",
    alternateName: ["vegeta", "prince of saiyans", "dragon ball", "dbz", "dbs"],
    hint1: "An incredibly proud alien prince who starts as a brutal planetary invader.",
    hint2: "He becomes Goku's lifelong rival, pushing himself to achieve god-like power.",
    imageUrl: "/images/characters/vegeta.webp"
  },
  {
    characterName: "ichigo kurosaki",
    animeNameEnglish: "bleach",
    alternateName: ["ichigo", "kurosaki", "substitute soul reaper", "orange head"],
    hint1: "An orange-haired high schooler who can see ghosts and wields an oversized black sword.",
    hint2: "He became a substitute soul reaper to protect his family from dark spirits.",
    imageUrl: "/images/characters/ichigo-kurosaki.webp"
  },
  {
    characterName: "guts",
    animeNameEnglish: "berserk",
    alternateName: ["guts", "black swordsman", "struggler"],
    hint1: "A tragic, heavily scarred warrior who carries a massive slab of iron as a sword.",
    hint2: "He wears the berserker armor and fights demons to hunt down his former commander.",
    imageUrl: "/images/characters/guts.webp"
  },
  {
    characterName: "gon freecss",
    animeNameEnglish: "hunter x hunter",
    alternateName: ["gon", "freecss", "hxh"],
    hint1: "A cheerful, green-clad boy who leaves his island home with a fishing rod.",
    hint2: "He took the hunter exam to find his legendary, elusive father.",
    imageUrl: "/images/characters/gon-freecss.webp"
  },
  {
    characterName: "mikasa ackerman",
    animeNameEnglish: "attack on titan",
    alternateName: ["mikasa", "ackerman", "aot", "snk"],
    hint1: "A top-tier soldier who wears a red scarf gifted by her childhood savior.",
    hint2: "She is completely devoted to protecting Eren, fighting titans with ruthless efficiency.",
    imageUrl: "/images/characters/mikasa-ackerman.webp"
  },
  {
    characterName: "shoto todoroki",
    animeNameEnglish: "my hero academia",
    alternateName: ["shoto", "todoroki", "mha", "bnha"],
    hint1: "A student hero with a distinct red-and-white hair split and a scarred left eye.",
    hint2: "His superpower allows him to control fire on one side and ice on the other.",
    imageUrl: "/images/characters/shoto-todoroki.webp"
  },
  {
    characterName: "izuku midoriya",
    animeNameEnglish: "my hero academia",
    alternateName: ["izuku", "midoriya", "deku", "mha", "bnha"],
    hint1: "A green-haired, formerly powerless boy who endlessly takes notes on heroes.",
    hint2: "He inherited the mighty 'one for all' power from his idol, All Might.",
    imageUrl: "/images/characters/izuku-midoriya.webp"
  },
  {
    characterName: "rin tohsaka",
    animeNameEnglish: "fate/stay night",
    alternateName: ["rin", "tohsaka", "fate", "ubw"],
    hint1: "A twin-tailed high school student who secretly functions as a high-tier gem mage.",
    hint2: "She accidentally summons Archer as her servant in the Holy Grail War.",
    imageUrl: "/images/characters/rin-tohsaka.webp"
  },
  {
    characterName: "kurisu makise",
    animeNameEnglish: "steins;gate",
    alternateName: ["kurisu", "makise", "christina", "assistant", "sg"],
    hint1: "A genius neuroscience researcher who meets a self-proclaimed mad scientist.",
    hint2: "She helps build a time machine using a modified microwave oven.",
    imageUrl: "/images/characters/kurisu-makise.webp"
  },
  {
    characterName: "rintaro okabe",
    animeNameEnglish: "steins;gate",
    alternateName: ["rintaro", "okabe", "hououin kyouma", "kyouma", "sg"],
    hint1: "A dramatic, lab-coat-wearing young man who claims to battle an organization.",
    hint2: "He discovers the ability to send text messages back in time.",
    imageUrl: "/images/characters/rintaro-okabe.webp"
  },
  {
    characterName: "erza scarlet",
    animeNameEnglish: "fairy tail",
    alternateName: ["erza", "scarlet", "titania", "ft"],
    hint1: "A commanding, red-haired wizard who loves sweets and keeps her guild in line.",
    hint2: "Her magic lets her instantly swap between a vast armory of magical armor.",
    imageUrl: "/images/characters/erza-scarlet.webp"
  },
  {
    characterName: "yusuke urameshi",
    animeNameEnglish: "yu yu hakusho",
    alternateName: ["yusuke", "urameshi", "spirit detective", "yyh"],
    hint1: "A green-uniformed street punk who gets hit by a car saving a little kid.",
    hint2: "He is brought back to life as a spirit detective and shoots energy from his fingers.",
    imageUrl: "/images/characters/yusuke-urameshi.webp"
  },
  {
    characterName: "nezuko kamado",
    animeNameEnglish: "demon slayer",
    alternateName: ["nezuko", "kamado", "kimetsu no yaiba", "kny"],
    hint1: "A young girl transformed into a demon who fights to protect humans.",
    hint2: "She avoids biting anyone by keeping a green bamboo muzzle in her mouth.",
    imageUrl: "/images/characters/nezuko-kamado.webp"
  },
  {
    characterName: "yuno gasai",
    animeNameEnglish: "future diary",
    alternateName: ["yuno", "gasai", "mirai nikki"],
    hint1: "A pink-haired schoolgirl who is completely, violently obsessed with her classmate.",
    hint2: "She uses her diary to predict every move of her beloved Yukiteru.",
    imageUrl: "/images/characters/yuno-gasai.webp"
  },
  {
    characterName: "saber",
    animeNameEnglish: "fate/stay night",
    alternateName: ["artoria pendragon", "artoria", "saber", "fate"],
    hint1: "A blonde warrior class servant who fights with an invisible legendary sword.",
    hint2: "He is the spirit of King Arthur summoned into modern times.",
    imageUrl: "/images/characters/saber.webp"
  },
  {
    characterName: "kaguya shinomiya",
    animeNameEnglish: "kaguya-sama: love is war",
    alternateName: ["kaguya", "shinomiya", "kaguya-sama"],
    hint1: "A wealthy, genius vice president of an elite school's student council.",
    hint2: "She plays intricate psychological mind games to force her crush to confess first.",
    imageUrl: "/images/characters/kaguya-shinomiya.webp"
  },
  {
    characterName: "roy mustang",
    animeNameEnglish: "fullmetal alchemist",
    alternateName: ["roy", "mustang", "flame alchemist", "fullmetal alchemist brotherhood", "fmab", "fma"],
    hint1: "A charismatic military commander who wears specialized spark-creating gloves.",
    hint2: "He uses alchemy to ignite absolute firestorms with a simple snap of his fingers.",
    imageUrl: "/images/characters/roy-mustang.webp"
  },
  {
    characterName: "spike spiegel",
    animeNameEnglish: "cowboy bebop",
    alternateName: ["spike", "spiegel", "space cowboy"],
    hint1: "A lanky, green-haired bounty hunter who flies a red spaceship named Swordfish II.",
    hint2: "He is a master of martial arts trying to escape his past with the Red Dragon Syndicate.",
    imageUrl: "/images/characters/spike-spiegel.webp"
  },
  {
    characterName: "rimuru tempest",
    animeNameEnglish: "that time i got reincarnated as a slime",
    alternateName: ["rimuru", "tempest", "slime iseakai", "tensura"],
    hint1: "A salaryman who gets stabbed and starts his next life as a blue, jelly-like monster.",
    hint2: "He possesses a predator skill that absorbs enemies and mimics their magic.",
    imageUrl: "/images/characters/rimuru-tempest.webp"
  },
  {
    characterName: "byakuya kuchiki",
    animeNameEnglish: "bleach",
    alternateName: ["byakuya", "kuchiki", "6th division captain"],
    hint1: "The elegant, strictly formal head of a noble soul reaper house.",
    hint2: "His sword scatters into millions of tiny, razor-sharp cherry blossom blades.",
    imageUrl: "/images/characters/byakuya-kuchiki.webp"
  },
  {
    characterName: "shinji ikari",
    animeNameEnglish: "neon genesis evangelion",
    alternateName: ["shinji", "ikari", "eva-01 pilot", "nge", "evangelion"],
    hint1: "A deeply conflicted teenager forced by his cold father to pilot a giant robot.",
    hint2: "He struggles with extreme self-doubt while piloting Evangelion Unit-01.",
    imageUrl: "/images/characters/shinji-ikari.webp"
  },
  {
    characterName: "hisoka morow",
    animeNameEnglish: "hunter x hunter",
    alternateName: ["hisoka", "morow", "the magician", "hxh"],
    hint1: "A creepy, clown-faced fighter obsessed with finding strong opponents to harvest.",
    hint2: "His primary power is a pink, sticky substance known as Bungee Gum.",
    imageUrl: "/images/characters/hisoka-morow.webp"
  },
  {
    characterName: "mob",
    animeNameEnglish: "mob psycho 100",
    alternateName: ["shigeo kageyama", "shigeo", "kageyama", "mob", "mp100"],
    hint1: "A socially awkward middle schooler with a bowl cut who keeps his emotions shut.",
    hint2: "When his inner emotional counter hits 100%, his psychic powers go completely berserk.",
    imageUrl: "/images/characters/mob.webp"
  },
  {
    characterName: "dazai osamu",
    animeNameEnglish: "bungo stray dogs",
    alternateName: ["dazai", "osamu", "bsd"],
    hint1: "A detective in a tan trench coat who is bizarrely obsessed with finding a beautiful double suicide.",
    hint2: "His touch completely nullifies any active supernatural ability.",
    imageUrl: "/images/characters/dazai-osamu.webp"
  },
  {
    characterName: "usagi tsukino",
    animeNameEnglish: "sailor moon",
    alternateName: ["usagi", "tsukino", "sailor moon", "princess serenity"],
    hint1: "A clumsy, emotional schoolgirl with long blonde hair tied in twin-tails.",
    hint2: "She transforms into a cosmic guardian of love and justice using a crescent wand.",
    imageUrl: "/images/characters/usagi-tsukino.webp"
  },
  {
    characterName: "senku ishigami",
    animeNameEnglish: "dr. stone",
    alternateName: ["senku", "ishigami", "science boy"],
    hint1: "A genius high school student with green, celery-like hair who wakes up in a stone world.",
    hint2: "He aims to rebuild human civilization using nothing but the power of science.",
    imageUrl: "/images/characters/senku-ishigami.webp"
  },
  {
    characterName: "denji",
    animeNameEnglish: "chainsaw man",
    alternateName: ["denji", "chainsaw", "hero of hell", "csm"],
    hint1: "A poor boy who makes a deal with a tiny orange dog to pay off his father's debts.",
    hint2: "He grows mechanical chainsaws out of his head and arms when pulling a cord on his chest.",
    imageUrl: "/images/characters/denji.webp"
  },
  {
    characterName: "alucard",
    animeNameEnglish: "hellsing",
    alternateName: ["alucard", "vampire king", "dracula", "hellsing ultimate"],
    hint1: "An ancient, red-coated vampire who works for a secret organization hunting other monsters.",
    hint2: "He fights using dual custom handguns loaded with explosive silver bullets.",
    imageUrl: "/images/characters/alucard.webp"
  },
  {
    characterName: "mikey",
    animeNameEnglish: "tokyo revengers",
    alternateName: ["manjiro sano", "manjiro", "sano", "mikey", "invincible mikey", "tr"],
    hint1: "A short, blonde delinquent leader who carries immense charisma and loves children's meals.",
    hint2: "He is known as the invincible leader of the Tokyo Manji Gang.",
    imageUrl: "/images/characters/mikey.webp"
  },
  {
    characterName: "frieren",
    animeNameEnglish: "frieren: beyond journey's end",
    alternateName: ["frieren", "sousou no frieren", "the mage"],
    hint1: "An elf mage who spends centuries wandering and collecting seemingly useless magic tricks.",
    hint2: "Her journey begins after the death of the hero she defeated the demon king with.",
    imageUrl: "/images/characters/frieren.webp"
  }
];