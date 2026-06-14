// Swedish word bank for the Words flashcard exerciser.
//
// Three word types, each with all the forms a learner needs to drill:
//   verbs       — infinitiv, imperativ, presens, preteritum, supinum
//   nouns       — gender (en/ett), indefinite/definite singular & plural
//   adjectives  — grundform (en), ett-form, plural/definite, komparativ, superlativ
//
// Words are chunked into 50-word "tasks" (groups). To add more, just append
// rows below — new groups form automatically once a list passes a multiple of 50.

// ── Verbs ──────────────────────────────────────────────────────────────────
// [ infinitiv, english, imperativ, presens, preteritum, supinum ]
const VERB_ROWS = [
  ["tala", "to speak, talk", "tala", "talar", "talade", "talat"],
  ["arbeta", "to work", "arbeta", "arbetar", "arbetade", "arbetat"],
  ["titta", "to look, watch", "titta", "tittar", "tittade", "tittat"],
  ["fråga", "to ask", "fråga", "frågar", "frågade", "frågat"],
  ["svara", "to answer", "svara", "svarar", "svarade", "svarat"],
  ["öppna", "to open", "öppna", "öppnar", "öppnade", "öppnat"],
  ["stanna", "to stay, stop", "stanna", "stannar", "stannade", "stannat"],
  ["börja", "to begin", "börja", "börjar", "började", "börjat"],
  ["sluta", "to finish, quit", "sluta", "slutar", "slutade", "slutat"],
  ["spela", "to play", "spela", "spelar", "spelade", "spelat"],
  ["handla", "to shop", "handla", "handlar", "handlade", "handlat"],
  ["laga", "to cook, fix", "laga", "lagar", "lagade", "lagat"],
  ["städa", "to clean (tidy)", "städa", "städar", "städade", "städat"],
  ["betala", "to pay", "betala", "betalar", "betalade", "betalat"],
  ["resa", "to travel", "res", "reser", "reste", "rest"],
  ["köpa", "to buy", "köp", "köper", "köpte", "köpt"],
  ["läsa", "to read", "läs", "läser", "läste", "läst"],
  ["ringa", "to call (phone)", "ring", "ringer", "ringde", "ringt"],
  ["stänga", "to close", "stäng", "stänger", "stängde", "stängt"],
  ["hjälpa", "to help", "hjälp", "hjälper", "hjälpte", "hjälpt"],
  ["tänka", "to think", "tänk", "tänker", "tänkte", "tänkt"],
  ["känna", "to feel, know", "känn", "känner", "kände", "känt"],
  ["höra", "to hear", "hör", "hör", "hörde", "hört"],
  ["köra", "to drive", "kör", "kör", "körde", "kört"],
  ["lära", "to learn, teach", "lär", "lär", "lärde", "lärt"],
  ["leva", "to live (be alive)", "lev", "lever", "levde", "levt"],
  ["bo", "to live (reside)", "bo", "bor", "bodde", "bott"],
  ["tro", "to believe", "tro", "tror", "trodde", "trott"],
  ["sy", "to sew", "sy", "syr", "sydde", "sytt"],
  ["nå", "to reach", "nå", "når", "nådde", "nått"],
  ["dricka", "to drink", "drick", "dricker", "drack", "druckit"],
  ["äta", "to eat", "ät", "äter", "åt", "ätit"],
  ["sova", "to sleep", "sov", "sover", "sov", "sovit"],
  ["skriva", "to write", "skriv", "skriver", "skrev", "skrivit"],
  ["springa", "to run", "spring", "springer", "sprang", "sprungit"],
  ["ge", "to give", "ge", "ger", "gav", "gett"],
  ["ta", "to take", "ta", "tar", "tog", "tagit"],
  ["se", "to see", "se", "ser", "såg", "sett"],
  ["gå", "to go, walk", "gå", "går", "gick", "gått"],
  ["stå", "to stand", "stå", "står", "stod", "stått"],
  ["få", "to get, may", "få", "får", "fick", "fått"],
  ["komma", "to come", "kom", "kommer", "kom", "kommit"],
  ["sitta", "to sit", "sitt", "sitter", "satt", "suttit"],
  ["ligga", "to lie (down)", "ligg", "ligger", "låg", "legat"],
  ["dö", "to die", "dö", "dör", "dog", "dött"],
  ["förstå", "to understand", "förstå", "förstår", "förstod", "förstått"],
  ["veta", "to know (a fact)", "vet", "vet", "visste", "vetat"],
  ["säga", "to say", "säg", "säger", "sade", "sagt"],
  ["göra", "to do, make", "gör", "gör", "gjorde", "gjort"],
  ["heta", "to be called", "het", "heter", "hette", "hetat"],
];

// ── Nouns ──────────────────────────────────────────────────────────────────
// [ gender, indefinite, definite, indef. plural, def. plural, english ]
const NOUN_ROWS = [
  ["en", "bil", "bilen", "bilar", "bilarna", "car"],
  ["en", "bok", "boken", "böcker", "böckerna", "book"],
  ["ett", "hus", "huset", "hus", "husen", "house"],
  ["en", "katt", "katten", "katter", "katterna", "cat"],
  ["en", "hund", "hunden", "hundar", "hundarna", "dog"],
  ["ett", "bord", "bordet", "bord", "borden", "table"],
  ["en", "stol", "stolen", "stolar", "stolarna", "chair"],
  ["ett", "äpple", "äpplet", "äpplen", "äpplena", "apple"],
  ["en", "banan", "bananen", "bananer", "bananerna", "banana"],
  ["ett", "barn", "barnet", "barn", "barnen", "child"],
  ["en", "flicka", "flickan", "flickor", "flickorna", "girl"],
  ["en", "pojke", "pojken", "pojkar", "pojkarna", "boy"],
  ["en", "kvinna", "kvinnan", "kvinnor", "kvinnorna", "woman"],
  ["en", "man", "mannen", "män", "männen", "man"],
  ["ett", "land", "landet", "länder", "länderna", "country"],
  ["en", "stad", "staden", "städer", "städerna", "city"],
  ["ett", "rum", "rummet", "rum", "rummen", "room"],
  ["en", "dörr", "dörren", "dörrar", "dörrarna", "door"],
  ["ett", "fönster", "fönstret", "fönster", "fönstren", "window"],
  ["en", "lärare", "läraren", "lärare", "lärarna", "teacher"],
  ["en", "elev", "eleven", "elever", "eleverna", "pupil"],
  ["en", "vän", "vännen", "vänner", "vännerna", "friend"],
  ["en", "familj", "familjen", "familjer", "familjerna", "family"],
  ["ett", "jobb", "jobbet", "jobb", "jobben", "job"],
  ["en", "dag", "dagen", "dagar", "dagarna", "day"],
  ["en", "natt", "natten", "nätter", "nätterna", "night"],
  ["en", "vecka", "veckan", "veckor", "veckorna", "week"],
  ["en", "månad", "månaden", "månader", "månaderna", "month"],
  ["ett", "år", "året", "år", "åren", "year"],
  ["en", "timme", "timmen", "timmar", "timmarna", "hour"],
  ["en", "morgon", "morgonen", "morgnar", "morgnarna", "morning"],
  ["en", "kväll", "kvällen", "kvällar", "kvällarna", "evening"],
  ["ett", "namn", "namnet", "namn", "namnen", "name"],
  ["en", "gata", "gatan", "gator", "gatorna", "street"],
  ["ett", "tåg", "tåget", "tåg", "tågen", "train"],
  ["en", "buss", "bussen", "bussar", "bussarna", "bus"],
  ["en", "cykel", "cykeln", "cyklar", "cyklarna", "bicycle"],
  ["ett", "kök", "köket", "kök", "köken", "kitchen"],
  ["en", "måltid", "måltiden", "måltider", "måltiderna", "meal"],
  ["ett", "glas", "glaset", "glas", "glasen", "glass"],
  ["en", "kopp", "koppen", "koppar", "kopparna", "cup"],
  ["en", "tallrik", "tallriken", "tallrikar", "tallrikarna", "plate"],
  ["en", "gaffel", "gaffeln", "gafflar", "gafflarna", "fork"],
  ["en", "kniv", "kniven", "knivar", "knivarna", "knife"],
  ["en", "sked", "skeden", "skedar", "skedarna", "spoon"],
  ["ett", "brev", "brevet", "brev", "breven", "letter"],
  ["en", "penna", "pennan", "pennor", "pennorna", "pen"],
  ["ett", "papper", "papperet", "papper", "papperen", "paper"],
  ["en", "telefon", "telefonen", "telefoner", "telefonerna", "phone"],
  ["en", "dator", "datorn", "datorer", "datorerna", "computer"],
];

// ── Adjectives ───────────────────────────────────────────────────────────────
// [ grundform (en), ett-form, plural/definite, komparativ, superlativ, english ]
const ADJ_ROWS = [
  ["stor", "stort", "stora", "större", "störst", "big"],
  ["liten", "litet", "små", "mindre", "minst", "small"],
  ["ny", "nytt", "nya", "nyare", "nyast", "new"],
  ["gammal", "gammalt", "gamla", "äldre", "äldst", "old"],
  ["ung", "ungt", "unga", "yngre", "yngst", "young"],
  ["lång", "långt", "långa", "längre", "längst", "long, tall"],
  ["kort", "kort", "korta", "kortare", "kortast", "short"],
  ["hög", "högt", "höga", "högre", "högst", "high, tall"],
  ["låg", "lågt", "låga", "lägre", "lägst", "low"],
  ["bra", "bra", "bra", "bättre", "bäst", "good"],
  ["dålig", "dåligt", "dåliga", "sämre", "sämst", "bad"],
  ["snäll", "snällt", "snälla", "snällare", "snällast", "kind"],
  ["glad", "glatt", "glada", "gladare", "gladast", "happy"],
  ["ledsen", "ledset", "ledsna", "ledsnare", "ledsnast", "sad"],
  ["trött", "trött", "trötta", "tröttare", "tröttast", "tired"],
  ["snabb", "snabbt", "snabba", "snabbare", "snabbast", "fast"],
  ["långsam", "långsamt", "långsamma", "långsammare", "långsammast", "slow"],
  ["lätt", "lätt", "lätta", "lättare", "lättast", "easy, light"],
  ["svår", "svårt", "svåra", "svårare", "svårast", "difficult"],
  ["tung", "tungt", "tunga", "tyngre", "tyngst", "heavy"],
  ["dyr", "dyrt", "dyra", "dyrare", "dyrast", "expensive"],
  ["billig", "billigt", "billiga", "billigare", "billigast", "cheap"],
  ["varm", "varmt", "varma", "varmare", "varmast", "warm"],
  ["kall", "kallt", "kalla", "kallare", "kallast", "cold"],
  ["ren", "rent", "rena", "renare", "renast", "clean"],
  ["smutsig", "smutsigt", "smutsiga", "smutsigare", "smutsigast", "dirty"],
  ["vacker", "vackert", "vackra", "vackrare", "vackrast", "beautiful"],
  ["ful", "fult", "fula", "fulare", "fulast", "ugly"],
  ["stark", "starkt", "starka", "starkare", "starkast", "strong"],
  ["svag", "svagt", "svaga", "svagare", "svagast", "weak"],
  ["rik", "rikt", "rika", "rikare", "rikast", "rich"],
  ["fattig", "fattigt", "fattiga", "fattigare", "fattigast", "poor"],
  ["tjock", "tjockt", "tjocka", "tjockare", "tjockast", "thick, fat"],
  ["tunn", "tunt", "tunna", "tunnare", "tunnast", "thin"],
  ["röd", "rött", "röda", "rödare", "rödast", "red"],
  ["blå", "blått", "blåa", "blåare", "blåast", "blue"],
  ["grön", "grönt", "gröna", "grönare", "grönast", "green"],
  ["gul", "gult", "gula", "gulare", "gulast", "yellow"],
  ["svart", "svart", "svarta", "svartare", "svartast", "black"],
  ["vit", "vitt", "vita", "vitare", "vitast", "white"],
  ["arg", "argt", "arga", "argare", "argast", "angry"],
  ["hungrig", "hungrigt", "hungriga", "hungrigare", "hungrigast", "hungry"],
  ["törstig", "törstigt", "törstiga", "törstigare", "törstigast", "thirsty"],
  ["viktig", "viktigt", "viktiga", "viktigare", "viktigast", "important"],
  ["rolig", "roligt", "roliga", "roligare", "roligast", "fun, funny"],
  ["tråkig", "tråkigt", "tråkiga", "tråkigare", "tråkigast", "boring"],
  ["vänlig", "vänligt", "vänliga", "vänligare", "vänligast", "friendly"],
  ["säker", "säkert", "säkra", "säkrare", "säkrast", "safe, sure"],
  ["öppen", "öppet", "öppna", "öppnare", "öppnast", "open"],
  ["mörk", "mörkt", "mörka", "mörkare", "mörkast", "dark"],
];

export const VERBS = VERB_ROWS.map(([infinitiv, en, imperativ, presens, preteritum, supinum], i) => ({
  type: "verb", id: `verb-w${i}`, headword: infinitiv, en,
  infinitiv, imperativ, presens, preteritum, supinum,
}));

export const NOUNS = NOUN_ROWS.map(([gender, indef, def, indefPlural, defPlural, en], i) => ({
  type: "noun", id: `noun-w${i}`, headword: `${gender} ${indef}`, en,
  gender, indef, def, indefPlural, defPlural,
}));

export const ADJECTIVES = ADJ_ROWS.map(([base, ett, plural, comparative, superlative, en], i) => ({
  type: "adjective", id: `adj-w${i}`, headword: base, en,
  base, ett, plural, comparative, superlative,
}));

// Form rows shown when the card is revealed — [label, value] pairs.
export function wordForms(w) {
  if (w.type === "verb") {
    return [
      ["Infinitiv", `att ${w.infinitiv}`],
      ["Imperativ", w.imperativ],
      ["Presens", w.presens],
      ["Preteritum", w.preteritum],
      ["Supinum", `har ${w.supinum}`],
    ];
  }
  if (w.type === "noun") {
    return [
      ["Obestämd singular", `${w.gender} ${w.indef}`],
      ["Bestämd singular", w.def],
      ["Obestämd plural", w.indefPlural],
      ["Bestämd plural", w.defPlural],
    ];
  }
  return [
    ["Grundform (en)", w.base],
    ["Ett-form", w.ett],
    ["Plural / bestämd", w.plural],
    ["Komparativ", w.comparative],
    ["Superlativ", w.superlative],
  ];
}

const GROUP_SIZE = 50;

const TYPES = [
  { type: "verb", label: "Verbs", icon: "directions_run",
    blurb: "Infinitiv · imperativ · presens · preteritum", words: VERBS },
  { type: "noun", label: "Nouns", icon: "inventory_2",
    blurb: "en/ett · singular & plural forms", words: NOUNS },
  { type: "adjective", label: "Adjectives", icon: "palette",
    blurb: "Grundform · komparativ · superlativ", words: ADJECTIVES },
];

function chunk(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Categories with their 50-word groups (tasks).
export const CATEGORIES = TYPES.map((t) => ({
  type: t.type,
  label: t.label,
  icon: t.icon,
  blurb: t.blurb,
  total: t.words.length,
  groups: chunk(t.words, GROUP_SIZE).map((words, i) => ({
    id: `${t.type}-${i + 1}`,
    type: t.type,
    label: t.label,
    icon: t.icon,
    number: i + 1,
    words,
  })),
}));

export const ALL_GROUPS = CATEGORIES.flatMap((c) => c.groups);

export const getGroup = (id) => ALL_GROUPS.find((g) => g.id === id) || null;
