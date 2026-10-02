// Game data: the lords, every fighter (home squad, strengths, growths, how each path recruits them),
// the class tiers and the tournament teams. Sources are listed in README.md.
var LORDS=[
  {id:"leda",name:"Rose Tempest",uk:"Леда",en:"Leda"},
  {id:"cai",name:"Ribeira Winds",uk:"Цай",en:"Cai"},
  {id:"die",name:"House Lamine",uk:"Дітріх",en:"Dietrich"},
  {id:"the",name:"Megaira's Beacon",uk:"Теодора",en:"Theodora"}];
var LI={leda:3,cai:0,die:1,the:2}; // index into J (order: Cai | Dietrich | Theodora | Leda)
function lordUa(id){var l=LORDS.filter(function(l){return l.id===id})[0];return LANG==="uk"?l.uk:l.en}
function home(t){return {leda:tr("Загін Леди","Leda's squad"),cai:tr("Загін Цая","Cai's squad"),die:tr("Загін Дітріха","Dietrich's squad"),the:tr("Загін Теодори","Theodora's squad"),p3:tr("Частина III","Part III")}[t]}
function ic(k){return '<svg class="ic"><use href="#i-'+k+'"/></svg>'}

// n · t home team · c start class · f/u favorable/unfavorable · a ability (uk) · g growths · nm no mounted/flying
// J: how they join on each path "Cai|Dietrich|Theodora|Leda"; ch/support/renown/extra, a = auto, - = no, L = lord, P = Part III
var U=[
{n:"Leda",t:"leda",f:"bo wm in sw",u:"sp",a:"Blindside",g:[40,35,35,50,65,25,30,35,55],J:"-|-|-|L"},
{n:"Buccar",t:"leda",f:"ax sp",u:"wm bm",a:"Guardian's Duty: отримана шкода ×0.9",g:[50,50,20,40,25,30,45,20,35],J:"-|4/3/8/Clear Leda's Paralogue|5/3/8/Clear Leda's Paralogue|a1"},
{n:"Sirocco",t:"leda",f:"au wm bm sw",u:"he",a:"Goddess's Favor: після бою +5 HP",g:[40,40,40,50,45,50,35,35,45],J:"4/3/9/Give Sirocco a copy of the Monument Verse|5/3/9/Give Sirocco a copy of the Monument Verse|5/1/5/Give Sirocco a copy of the Monument Verse|a1"},
{n:"Mu",t:"leda",f:"ax br wm sw",u:"",a:"Signs of Growth: посилений приріст статів",g:[30,30,5,30,30,10,20,10,20],J:"4/3/9/Give Mu 3 Glirmosa|5/3/7/Give Mu 3 Glirmosa|5/3/9/Give Mu 3 Glirmosa|a1"},
{n:"Olympia",t:"leda",c:"Diviner",f:"ax wm",u:"sp",a:"Competitive Zeal: з магією Crit+10",g:[35,35,50,35,35,40,30,40,40],J:"4/3/8/Give Olympia Scarlet Drops|5/3/6/Give Olympia Scarlet Drops|5/3/9/Give Olympia Scarlet Drops|a3"},
{n:"Catania",t:"leda",f:"sp sw",u:"he",a:"Punishing Squall: якщо AS ≥ AS ворога +3, Hit+20",g:[35,35,35,50,55,40,30,35,45],J:"3/3/10|4/1/8|5/3/7|4/1/2"},
{n:"Cai",t:"cai",f:"wm ri sp sw",u:"bo fl",a:"Brio",g:[45,45,40,45,45,40,35,35,40],J:"L|-|-|-"},
{n:"Tialla",t:"cai",f:"au wm bm",u:"sw",a:"Tactician's Wit: +1 дальність мистецтв на союзників",g:[30,25,45,40,35,50,20,40,45],J:"a1|4/3/9/Clear Cai's Paralogue then give 3000 gold|5/3/10/Clear Cai's Paralogue then give 3000 gold|4/3/8/Clear Cai's Paralogue then give 3000 gold"},
{n:"Peter",t:"cai",f:"bo in",u:"he",a:"Steady Aim: +1 дальність лука в мистецтві",g:[40,35,20,60,45,35,30,25,30],J:"a1|4/3/9/Give Peter 1 Phantom Ginji|5/3/7/Give Peter 1 Phantom Ginji|4/3/10/Give Peter 1 Phantom Ginji"},
{n:"Ultand",t:"cai",c:"Diviner",f:"wm sp",u:"sw",a:"Patch Up: лікує сусіднього союзника після його бою",g:[45,40,40,40,35,55,35,45,50],J:"a6|4/3/5/Give Ultand Her Mother's Gift|5/3/6/Give Ultand Her Mother's Gift|4/3/8/Give Ultand Her Mother's Gift"},
{n:"Guzran",t:"cai",f:"br in sw",u:"wm bm",a:"Hot-Headed: Hit, Avo або Crit +10",g:[45,45,20,45,50,45,35,20,30],J:"3/1/2|4/3/8|5/3/8|4/1/3"},
{n:"Dietrich",t:"die",f:"in sw",u:"wm",a:"Murderous Intent",g:[50,15,30,60,50,50,40,30,60],J:"-|L|-|-"},
{n:"Fabio",t:"die",f:"au bm",u:"bo",a:"Dark Calling: Ddg−5 сусіднім ворогам",g:[40,25,50,40,35,35,30,45,30],J:"-|a1|-|4/3/9/Clear Dietrich's Paralogue and complete Fabio's request"},
{n:"Esmeralda",t:"die",f:"ax he sp",u:"sw",a:"Brawn: вага спорядження ×0.8",g:[55,55,20,35,35,35,45,25,30],J:"5/2/7/Complete Esmeralda's Request|a2|5/3/9/Complete Esmeralda's Request|4/3/6/Complete Esmeralda's Request"},
{n:"Mikaela",t:"die",c:"Gladiator",f:"ax bo in",u:"",a:"Veteran's Mettle: Hit+10 проти сусіднього ворога",g:[50,45,30,35,40,30,40,25,40],J:"5/3/5/Give 3000 Gold to Mikaela|a4|5/3/8/Give 3000 Gold to Mikaela|4/3/6/Give 3000 Gold to Mikaela"},
{n:"Yang Jie",t:"die",f:"ax wm",u:"ri sw",a:"Monkly Havoc: після вбивства повне HP (шанс = Уд/2)",g:[50,35,40,35,35,40,30,40,25],J:"3/2/3/Answer Yang Jie's 3 Questions Correctly|4/1/2|5/3/9/Answer Yang Jie's 3 Questions Correctly|4/3/8/Answer Yang Jie's 3 Questions Correctly"},
{n:"Theodora",t:"the",f:"au wm sp",u:"bm",a:"Royal Resolve",g:[70,50,30,40,40,30,40,30,50],J:"-|-|L|-"},
{n:"Bonaventure",t:"the",c:"Noble",f:"",u:"",a:"Sage Advice: Dex+3 сусіднім союзникам",g:[35,35,45,50,40,35,30,40,40],J:"-|-|a1|-"},
{n:"Tobias",t:"the",c:"Noble",f:"",u:"",a:"Power Arts: Atk+3 з бойовим мистецтвом",g:[55,60,15,30,25,40,45,20,35],J:"-|-|a1|-"},
{n:"Lysander",t:"the",c:"Ornius Rider",f:"ax fl ri sp",u:"br he sw",a:"Racing Attack: атакує першим → Avo+15",g:[45,40,25,35,50,30,40,25,30],J:"4/3/8/Give 5 Iron Spears to Lysander|4/3/6/Give 5 Iron Spears to Lysander|a4|4/3/7/Give 5 Iron Spears to Lysander"},
{n:"Lilian",t:"the",c:"Hunter",f:"bo in",u:"br",a:"Safety First: якщо ворог не контратакує, Hit+10",g:[35,35,30,55,40,50,30,35,25],J:"4/2/8/Give 5000 Gold to Lilian|4/2/8/Give 5000 Gold to Lilian|a4|4/2/7/Give 5000 Gold to Lilian"},
{n:"Sofia",t:"the",f:"bo wm",u:"ax",a:"Healing Knowledge: лікування магією +10 HP",g:[35,30,45,30,40,30,25,40,40],J:"3/3/9|4/3/9|5/1/2|4/3/7"},
{n:"Alexandra",f:"fl sp sw",u:"ax bm",a:"Silver Maiden: Hit/Avo+5 за кожного сусіднього союзника",g:[30,35,35,45,55,50,30,40,50],J:"7/2/7|7/3/8|8/1/6|7/3/10"},
{n:"Benditz",f:"bo ri",u:"",a:"Wheeled Warrior: у колісниці Hit+20",g:[50,35,20,50,35,30,35,25,35],J:"6/3/9|5/2/7|6/1/8|5/3/7"},
{n:"Dadao",f:"ax he",u:"wm bm sp",a:"One Chance: якщо ніхто не б'є двічі, Atk+5",g:[50,55,20,35,30,25,45,20,30],J:"5/3/7/Give 2 Kothar Gar to Dadao|4/3/10/Give 2 Kothar Gar to Dadao|5/2/5/Give 2 Kothar Gar to Dadao|4/2/5/Give 2 Kothar Gar to Dadao"},
{n:"Dante",f:"au wm bm",u:"br",a:"Stage Directions: Ddg+10 союзникам у радіусі 2",g:[30,30,45,40,40,45,20,40,30],J:"5/3/10/Give 8000 Gold to Dante|4/2/8/Give 8000 Gold to Dante|5/3/6/Give 8000 Gold to Dante|4/3/10/Give 8000 Gold to Dante"},
{n:"Diego",f:"bo in sw",u:"",a:"Caretaker: сусідні союзники не отримують подвійної атаки",g:[45,40,20,60,45,35,35,20,30],J:"3/3/10/Clear Orchel's Regret Paralogue|4/3/9/Clear Orchel's Regret Paralogue|5/2/8/Clear Orchel's Regret Paralogue|4/3/8/Clear Orchel's Regret Paralogue"},
{n:"Fianna",f:"wm bm",u:"br sw",a:"Graceful Light: лікування без витрат (шанс = Уд)",g:[30,35,55,40,30,25,20,45,40],J:"4/3/8/Give 3000 Gold to Fianna|4/3/7/Give 3000 Gold to Fianna|5/3/9/Give 3000 Gold to Fianna|5/3/5/Give 3000 Gold to Fianna"},
{n:"Gaitz",f:"ax ri sp",u:"wm bm",a:"Brave Assist: Def+3 сусіднім союзникам",g:[50,50,20,45,40,40,45,25,45],J:"-|4/3/10/Clear Bertrand's Paralogue and reach Chapter 12|-|-"},
{n:"Goliath",nm:1,f:"ax he",u:"",a:"Heavyweight Class: без кінних і літаючих класів, Bld+5",g:[55,60,5,30,15,35,50,20,20],J:"4/3/7/Give 3 Giants' Meat to Goliath|4/3/6/Give 3 Giants' Meat to Goliath|5/3/9/Give 3 Giants' Meat to Goliath|4/3/10/Give 3 Giants' Meat to Goliath"},
{n:"Halvin",f:"bo ri",u:"ax",a:"Adaptability: після бою Hit+2 до кінця карти (до +30)",g:[35,35,30,60,45,40,30,25,35],J:"5/3/5/Give 10 Dates (Material) to Halvin|4/3/9/Give 10 Dates (Material) to Halvin|5/3/7/Give 10 Dates (Material) to Halvin|4/3/7/Give 10 Dates (Material) to Halvin"},
{n:"Inyoni",f:"ax bo",u:"",a:"Heavy-Bow User: з луком Str+3",g:[40,50,20,40,35,40,40,30,30],J:"8/3/8/Give 6000 Gold to Inyoni|8/3/8/Give 6000 Gold to Inyoni|9/1/9/Give 4000 Gold to Inyoni|9/1/7/Give 3000 Gold to Inyoni"},
{n:"Io",f:"ax ri sp",u:"",a:"With my Steed: атакує першим → Shld+3, Ddg+30",g:[45,40,25,45,35,35,40,25,35],J:"3/3/10/Give 4000 Gold to Io|4/2/3/Give 800 Gold to Io|5/3/10/Give 4000 Gold to Io|4/1/6/Give 1500 Gold to Io"},
{n:"Jasmine",f:"ax he sp",u:"fl sw",a:"Expert Counter: якщо ворог атакує першим, Hit+20",g:[50,40,20,45,30,40,45,25,45],J:"6/1/8/Give 2000 Gold to Jasmine|6/3/9/Give 5000 Gold to Jasmine|7/3/8/Give 5000 Gold to Jasmine|6/2/4/Give 500 Gold to Jasmine"},
{n:"Jester",f:"bo in sw",u:"ax",a:"Blink of an Eye: після Swap Def+3",g:[40,35,15,45,60,40,35,25,40],J:"4/3/10/Complete Jester's Three Combat Quests|4/3/6/Complete Jester's Three Combat Quests|5/3/9/Complete Jester's Three Combat Quests|4/3/10/Complete Jester's Three Combat Quests"},
{n:"Kiroc",f:"bo",u:"",a:"Tyranny: якщо у ворога статус, Atk+3, Crit+10",g:[55,40,15,50,55,30,30,15,25],J:"6/3/8/Give 8 Pure Water to Kiroc|6/1/4/Give 3 Pure Water to Kiroc|7/3/10/Give 8 Pure Water to Kiroc|5/1/4/Give 3 Pure Water to Kiroc"},
{n:"Loretta",f:"sp sw",u:"he",a:"Steadfast: HP ≥ 50% → Avo+10",g:[35,35,35,40,55,30,30,40,30],J:"3/3/7/Give 3 Iron Swords to Loretta|4/3/9/Give 3 Iron Swords to Loretta|5/3/5/Give 3 Iron Swords to Loretta|4/3/5/Give 3 Iron Swords to Loretta"},
{n:"Ludia",f:"in sw",u:"ax bm",a:"Falcon: атакує першим → AS+3",g:[40,35,20,45,55,30,30,20,30],J:"4/3/9/Gather information at Callianeira Port and report back to Ludia|4/3/9/Gather information at Callianeira Port and report back to Ludia|5/3/7/Gather information at Callianeira Port and report back to Ludia|4/3/7/Gather information at Callianeira Port and report back to Ludia"},
{n:"Majide",f:"ax br",u:"bm",a:"Hellbent Axe: з сокирою Str+3",g:[65,50,15,30,20,25,40,10,5],J:"5/2/5/Admit That You Need Majide Three Times|4/3/8/Admit That You Need Majide Three Times|5/3/8/Admit That You Need Majide Three Times|4/3/9/Admit That You Need Majide Three Times"},
{n:"Nezha",f:"br in sw",u:"sp",a:"Quick Draw: атакує першим → Atk+3 (50%)",g:[45,55,25,50,45,30,35,25,25],J:"5/3/6/Give 3 Sandworm Meat to Nezha|4/3/10/Give 3 Sandworm Meat to Nezha|5/2/6/Give 3 Sandworm Meat to Nezha|4/3/9/Give 3 Sandworm Meat to Nezha"},
{n:"Ninae",f:"wm sp",u:"bo",a:"Spirits' Voices: проти магії Hit/Avo+10",g:[45,45,35,45,35,50,35,45,40],J:"3/3/6/Give 1 Paradise Fish to Ninae|4/3/8/Give 1 Paradise Fish to Ninae|5/3/6/Give 1 Paradise Fish to Ninae|4/3/8/Give 1 Paradise Fish to Ninae"},
{n:"Noctula",f:"ax br in",u:"sw",a:"Warrior's Clarity: після бою Avo+3",g:[50,45,20,40,45,35,40,20,30],J:"3/1/4|4/1/6|5/1/3|4/3/8"},
{n:"Nuzzuo",f:"bo sw",u:"",a:"Har Hali Wisdom: якщо ефективний проти ворога, Atk+3",g:[50,50,15,45,55,25,20,15,35],J:"6/2/6/Give 3 Iron Bows to Nuzzuo|8/1/9/Give 2 Iron Bows to Nuzzuo|9/1/6/Give 3 Iron Bows to Nuzzuo|8/3/9/Give 3 Iron Bows to Nuzzuo"},
{n:"Nydine",f:"ax fl ri",u:"br he",a:"Barge Through: проходить крізь ворогів (верхи)",g:[45,40,30,40,45,35,30,25,35],J:"3/1/6/Give 2 Bronze Axes to Nydine|4/2/5/Give 2 Bronze Axes to Nydine|5/3/5/Give 3 Iron Axes to Nydine|4/3/10/Give 3 Iron Axes to Nydine"},
{n:"Peppe",f:"bo in sw",u:"",a:"Hunter's Snare: у фазі ворога б'є першим (30%)",g:[30,30,25,45,60,45,30,30,30],J:"3/1/9/Clear Bertrand's Paralogue|4/3/8/Clear Bertrand's Paralogue|5/2/7/Clear Bertrand's Paralogue|-"},
{n:"Seteth",f:"au ax sp",u:"",a:"Ready for Battle: перший бій у фазі ворога б'є першим (50%)",g:[45,45,30,45,40,30,40,35,50],J:"3/3/6/Complete Seteth's Request|-|5/3/6/Complete Seteth's Request|4/3/10/Complete Seteth's Request"},
{n:"Sha Lan",c:"Diviner",f:"au wm sp",u:"sw",a:"Cooler Heads: після Draw Back — допоміжна магія",g:[35,30,45,50,35,35,30,45,40],J:"-|4/3/10/Clear Anatolia's Paralogue and answer questions correctly|-|4/3/8/Clear Anatolia's Paralogue and answer questions correctly"},
{n:"Simon",f:"ax in sw",u:"",a:"Close Call: виживає з 1 HP (шанс = Уд)",g:[50,50,20,40,35,50,40,25,35],J:"5/3/8/Pay 500 Gold and pick tails on coin toss|4/3/7/Pay 500 Gold and pick tails on coin toss|5/3/7/Pay 500 Gold and pick tails on coin toss|4/3/6/Pay 500 Gold and pick tails on coin toss"},
{n:"Ursula",f:"bo sw",u:"",a:"Management Skills: доступ до сховища в радіусі 2",g:[50,35,35,50,50,40,35,30,45],J:"4/3/10/Complete Talimun's Paralogue then select Agree 3 times|4/3/7/Complete Talimun's Paralogue then select Agree 3 times|5/3/9/Complete Talimun's Paralogue then select Agree 3 times|-"},
{n:"Zarcone",f:"ax sw",u:"wm bm",a:"Hatchet Man: з сокирою Hit+10",g:[40,30,20,60,35,30,30,25,15],J:"5/3/8/Refuse to pay thrice then pay Zarcone 10 Gold|4/3/7/Refuse to pay thrice then pay Zarcone 10 Gold|5/1/4/Refuse to pay thrice then pay Zarcone 10 Gold|4/2/5/Refuse to pay thrice then pay Zarcone 10 Gold"}
];
// personal abilities in English, as the wikis give them
var AB_EN={
"Buccar":"Guardian's Duty: reduces damage to 90% when attacked","Sirocco":"Goddess's Favor: after combat, restores 5 HP to unit",
"Mu":"Signs of Growth: enhanced basic stat growth on level up","Olympia":"Competitive Zeal: when equipped with magic, Crit+10",
"Catania":"Punishing Squall: if AS ≥ foe's AS+3, Hit+20 during combat","Tialla":"Tactician's Wit: Rng+1 to combat arts usable on allies",
"Peter":"Steady Aim: Rng+1 when attacking with a bow combat art","Ultand":"Patch Up: after an adjacent ally's combat, restores a little HP to that ally",
"Guzran":"Hot-Headed: grants one of Hit+10, Avo+10 or Crit+10 during combat","Fabio":"Dark Calling: inflicts Ddg−5 on adjacent foes",
"Esmeralda":"Brawn: reduces Wt of unit's equipment to 80%","Mikaela":"Veteran's Mettle: Hit+10 during combat against an adjacent foe",
"Yang Jie":"Monkly Havoc: after defeating a foe, recovers HP equal to max HP (trigger % = Lck/2)","Bonaventure":"Sage Advice: Dex+3 to adjacent allies",
"Tobias":"Power Arts: Atk+3 when attacking with a combat art","Lysander":"Racing Attack: if unit attacks first, Avo+15 during combat",
"Lilian":"Safety First: if foe cannot counter, Hit+10 during combat","Sofia":"Healing Knowledge: healing an ally with magic restores +10 HP",
"Alexandra":"Silver Maiden: Hit/Avo+5 for each adjacent ally","Benditz":"Wheeled Warrior: as a Charioteer, Hit+20",
"Dadao":"One Chance: if neither unit nor foe can follow up, Atk+5 during combat","Dante":"Stage Directions: Ddg+10 to allies within 2 spaces (trigger % = ally's Cha/2)",
"Diego":"Caretaker: adjacent allies cannot suffer a follow-up (trigger % = 5)","Fianna":"Graceful Light: healing with magic costs 0 (trigger % = Lck)",
"Gaitz":"Brave Assist: Def+3 to adjacent allies","Goliath":"Heavyweight Class: cannot change to cavalry or flying classes; Bld+5",
"Halvin":"Adaptability: after combat, Hit+2 until the end of the map (max +30)","Inyoni":"Heavy-Bow User: with a bow, Str+3",
"Io":"With my Steed: (cavalry) if unit attacks first, Shld+3, Ddg+30","Jasmine":"Expert Counter: if foe attacks first, Hit+20 during combat",
"Jester":"Blink of an Eye: after using Swap, Def+3 until the next phase","Kiroc":"Tyranny: if foe has a status effect, Atk+3, Crit+10",
"Loretta":"Steadfast: if HP ≥ 50%, Avo+10 during combat","Ludia":"Falcon: if unit attacks first, AS+3 during combat",
"Majide":"Hellbent Axe: with an axe, Str+3","Nezha":"Quick Draw: if unit attacks first, Atk+3 (trigger % = 50)",
"Ninae":"Spirits' Voices: if foe uses magic, Hit/Avo+10 during combat","Noctula":"Warrior's Clarity: after combat, Avo+3 until the next phase",
"Nuzzuo":"Har Hali Wisdom: if effective against foe, Atk+3","Nydine":"Barge Through: (cavalry) can move through foes' spaces",
"Peppe":"Hunter's Snare: in enemy phase, attacks first if foe is damaged (trigger % = 30)","Seteth":"Ready for Battle: attacks first in the first enemy-phase combat (trigger % = 50)",
"Sha Lan":"Cooler Heads: after Draw Back, can use assist magic","Simon":"Close Call: survives a lethal hit with 1 HP (trigger % = Lck)",
"Ursula":"Management Skills: storage access for unit and allies within 2 spaces","Zarcone":"Hatchet Man: with an axe, Hit+10"};
// special recruit requirements as Game8's "How to Recruit" pages give them (English), with Ukrainian translations
var EXTRA_UK={"Clear Leda's Paralogue":"пройти паралог Леди","Clear Dietrich's Paralogue and complete Fabio's request":"пройти паралог Дітріха й виконати прохання Фабіо",
"Clear Cai's Paralogue then give 3000 gold":"пройти паралог Цая, потім 3000 золота","Clear Bertrand's Paralogue":"пройти паралог Бертрана",
"Clear Bertrand's Paralogue and reach Chapter 12":"пройти паралог Бертрана й дійти до Гл. 12","Clear Orchel's Regret Paralogue":"пройти паралог Orchel's Regret",
"Clear Anatolia's Paralogue and answer questions correctly":"пройти паралог Анатолії й правильно відповісти на питання",
"Complete Talimun's Paralogue then select Agree 3 times":"пройти паралог Талімуна, потім 3 рази обрати «Agree»",
"Complete Jester's Three Combat Quests":"виконати 3 бойові квести Джестера","Complete Esmeralda's Request":"виконати прохання Есмеральди",
"Complete Seteth's Request":"виконати прохання Сетета","Answer Yang Jie's 3 Questions Correctly":"правильно відповісти на 3 питання",
"Admit That You Need Majide Three Times":"3 рази визнати, що він тобі потрібен","Refuse to pay thrice then pay Zarcone 10 Gold":"3 рази відмовити, потім заплатити 10 золота",
"Pay 500 Gold and pick tails on coin toss":"заплатити 500 золота й обрати решку, коли кидають монету",
"Gather information at Callianeira Port and report back to Ludia":"зібрати відомості в порту Callianeira й доповісти",
"Give Sirocco a copy of the Monument Verse":"дати копію Monument Verse","Give Ultand Her Mother's Gift":"віддати подарунок її матері",
"Give Olympia Scarlet Drops":"дати Scarlet Drops","Give Mu 3 Glirmosa":"дати 3 Glirmosa","Give Peter 1 Phantom Ginji":"дати 1 Phantom Ginji",
"Give 2 Kothar Gar to Dadao":"дати 2 Kothar Gar","Give 10 Dates (Material) to Halvin":"дати 10 Dates (матеріал)","Give 1 Paradise Fish to Ninae":"дати 1 Paradise Fish",
"Give 8 Pure Water to Kiroc":"дати 8 Pure Water","Give 3 Pure Water to Kiroc":"дати 3 Pure Water","Give 3 Giants' Meat to Goliath":"дати 3 Giants' Meat",
"Give 3 Sandworm Meat to Nezha":"дати 3 Sandworm Meat","Give 3 Iron Swords to Loretta":"дати 3 Iron Sword","Give 5 Iron Spears to Lysander":"дати 5 Iron Spear",
"Give 3 Iron Bows to Nuzzuo":"дати 3 Iron Bow","Give 2 Iron Bows to Nuzzuo":"дати 2 Iron Bow","Give 2 Bronze Axes to Nydine":"дати 2 Bronze Axe","Give 3 Iron Axes to Nydine":"дати 3 Iron Axe"};
function extra(s){
  if(!s)return ""; if(LANG==="en")return s;
  if(LANG==="uk"&&EXTRA_UK[s])return EXTRA_UK[s];
  var g=s.match(/^Give (\d+) Gold to /); // "Give 3000 Gold to Fianna" → "3000 gold"
  if(g)return fmt(tr("{n} золота","{n} gold"),{n:g[1]});
  return LANG==="uk"?s:loc(s);
}
function ability(u){return LANG==="uk"?u.a:loc(AB_EN[u.n]||u.a)}

// the animal each mounted class rides; a class takes any animal of its own family, and the class itself
// comes with a standard one (Game8 "Best Mounts and Abilities", Fandom wiki pages Horse, Ornius, Bau and Elephant Rider).
// Bau for Dragoon and Bau Lord: Fandom only so far
var MOUNT_OF={"Ornius Rider":"ornius","Armored Ornius Rider":"ornius","Caladrius":"ornius",
  "Light Cavalry":"horse","Charioteer":"horse","Forest Knight":"horse","Cataphract":"horse","Bardinger":"horse","Troubadour":"horse",
  "High Savant":"horse","Bow Knight":"horse","Orichaldia":"horse","Great Knight":"horse","Valkyrium":"horse","The Cavalier":"horse",
  "Wing Soldier":"pegasus","Celestial Trooper":"pegasus","Dragoon":"bau","Bau Lord":"bau","Elephant Rider":"elephant"};
// caught on Cai's path from Part I Ch. 5 with Lure and food on the world map (Game8 "How to Capture Animal Mounts");
// elephants come from a Part III side quest; Io and Alexandra join with their own
var MOUNTS={horse:{name:["кінь","horse"],food:"veg",del:"Monoceros",own:["Io","Rocinan"]},ornius:{name:["Ornius","Ornius"],food:"fish"},
  pegasus:{name:["пегас","pegasus"],food:"veg",del:"Falicorn",own:["Alexandra","Bucephalus"]},bau:{name:["Bau","Bau"],food:"meat"},
  elephant:{name:["слон","elephant"]}};
var MOUNT_KEYS=["horse","ornius","pegasus","bau","elephant"];
var FOOD={fish:["риба","fish"],veg:["овочі","vegetables"],meat:["м'ясо","meat"]};

// tiers; names and license requirements in both languages
var TIERS=[
 {name:["Початкові","Beginner"],req:["рівень 5 · слава 1","Level 5 · Renown 1"],list:[
  ["Gladiator","br:D ax:D sw:D"],["Hunter","bo:D sw:D"],["Soldier","ax:D sp:D"],["Ornius Rider","ri:E+ ax:D sp:D"],["Diviner","wm:D bm:D"]]},
 {name:["Спеціальні","Specialty"],req:["рівень 20 · слава 4","Level 20 · Renown 4"],list:[
  ["Myrmidon","sw:C"],["Brigand","ax:C sw:C"],["Pugilist","br:C"],["Archer","bo:C"],["Rogue","bo:C sw:C",{note:"locks"}],
  ["Armored Knight","he:E+ ax:C sp:C"],["Light Cavalry","ri:D sp:C sw:C"],["Charioteer","ri:D bo:C"],["Armored Ornius Rider","ri:D ax:C sp:C"],
  ["Wing Soldier","fl:D sp:C sw:C",{fem:1}],["Priest","wm:C"],["Shaman","bm:C"]]},
 {name:["Просунуті","Advanced"],req:["рівень 35 · слава 8","Level 35 · Renown 8"],list:[
  // excl: only on that lord's path (Game8: Dietrich's path has exclusive access to Blacksmith; Dancer is Leda's)
  // route: only on these lords' paths in Part I (Game8 "available to"); with excl and Elephant Rider this leaves 11 per path
  ["Warrior","br:B ax:B sw:B"],["Shido","sw:B"],["Dancer","bo:B sw:B",{one:1,excl:"leda"}],["Blacksmith","bm:D ax:C",{excl:"die",note:"smith"}],
  ["Sniper","bo:B"],["Forest Knight","ri:D bo:B"],["Ranger","bo:B sw:B",{route:["leda","die"],note:"locks"}],
  ["Cataphract","he:E+ ri:D ax:B sp:B",{route:["the"]}],["Guardian","sp:B",{route:["die","the"]}],["Elephant Rider","ri:C",{p3:1}],
  ["Dreadnought","he:D ax:B sp:B"],["Bardinger","ri:C sp:C sw:B"],["Dragoon","fl:C ax:B sp:B",{route:["cai","the"]}],
  ["Caladrius","ri:D bm:B",{route:["cai"]}],["Ovate","bm:B"],["Bishop","wm:B"],["Troubadour","ri:D wm:B bm:B",{route:["cai","leda"]}]]},
 {name:["Майстер","Master"],req:["рівень 45","Level 45"],list:[
  ["Swordmaster","sw:A",{temple:"Mars"}],["High Savant","ri:D bm:D sw:B",{temple:"Smyrnos"}],["Battlemaster","br:A ax:A sw:A"],
  ["War Monk","wm:D br:B",{temple:"Aurora"}],["Bow Adept","bo:A"],["Bow Knight","ri:D bo:A",{temple:"Kalla"}],["Shadow Seeker","bo:A sw:A",{note:"locks"}],
  ["Sentinel","sp:A"],["Castle Knight","he:C ax:A sp:A"],["Orichaldia","ri:B sp:A sw:A"],["Great Knight","he:D ri:D ax:A sp:A",{temple:"Credna"}],
  ["Celestial Trooper","fl:C sp:A sw:A",{fem:1}],["Bau Lord","fl:C ax:A sp:A"],["Druid","bm:A"],["Wiseman","wm:A"],["Valkyrium","ri:D wm:A bm:A",{temple:"Jura"}]]},
 {name:["Божественні","Divine"],req:["Частина III, розділ 4 · особливий предмет · один носій","Part III, section 4 · special item · one holder"],list:[
  ["The Blade","sw:S",{div:1,item:"Demonic Swordguard"}],["The Apsara","bo:C sw:A",{div:1,item:"Muses' Necklace"}],["The Eternal","br:S ax:S sw:S",{div:1,item:"Scales of Judgement"}],["The Godhand","wm:C br:S",{div:1,item:"Emperor's Sash"}],
  ["The Calamity","bo:S sw:S",{div:1,item:"Crystal of Darkness",note:"locks"}],["The Trident","sp:S",{div:1,item:"Trident"}],["The Cavalier","ri:A ax:S sp:S sw:S",{div:1,item:"Divinium Saddle"}],["The Avatar","wm:S bm:S",{div:1,item:"Lotus of Reincarnation"}]]}
];
function tname(i){return pick(TIERS[i].name)}
function treq(i){return pick(TIERS[i].req)}
var NOTES={locks:["замки","lockpicking"],smith:["10 посилень мистецтв → доглядач храму Смірноса","enhance combat arts 10× → Smyrnos temple caretaker"]};
var TEMPLE_UK={Mars:"Марса",Smyrnos:"Смірноса",Aurora:"Аврори",Kalla:"Калли",Credna:"Кредни",Jura:"Юри"};
// class growth-rate modifiers, HP Str Mag Dex Spd Lck Def Res Cha: Fextralife class pages, checked against Game8 class pages
// (September 2026); where they disagree (Light Cavalry, Charioteer, Ovate) Game8 is used
var CG={
"Gladiator":[10,10,0,0,0,0,0,0,0],"Hunter":[10,0,0,10,10,0,0,0,0],"Soldier":[10,5,0,5,-5,0,10,0,0],"Ornius Rider":[10,0,0,5,10,5,0,5,0],"Diviner":[5,-5,15,5,0,0,-5,10,0],
"Myrmidon":[10,0,0,10,15,5,0,0,5],"Brigand":[15,15,-5,0,5,0,5,0,5],"Pugilist":[15,10,-5,5,10,0,10,0,5],"Archer":[10,5,0,10,10,5,5,0,5],"Rogue":[10,0,0,10,15,5,0,5,0],
"Armored Knight":[10,10,-5,5,-5,0,25,-5,5],"Light Cavalry":[10,5,-5,0,5,5,5,0,10],"Charioteer":[10,5,-5,15,-5,5,10,0,10],"Armored Ornius Rider":[10,0,-5,5,10,5,10,0,5],
"Wing Soldier":[10,0,5,5,0,5,5,5,10],"Priest":[5,-5,10,5,5,15,-10,15,10],"Shaman":[5,-5,15,10,10,10,-10,10,0],
"Warrior":[20,20,-5,0,0,0,5,-5,5],"Shido":[10,5,0,10,15,5,0,-5,5],"Dancer":[15,5,0,10,25,10,0,5,20],"Blacksmith":[15,10,10,5,0,0,10,10,5],"Sniper":[10,5,0,20,10,5,5,5,5],
"Forest Knight":[10,5,0,10,10,5,5,5,5],"Ranger":[10,5,0,15,15,15,0,10,0],"Cataphract":[15,15,-5,0,-10,0,10,-5,5],"Guardian":[10,10,0,5,0,5,10,15,5],"Elephant Rider":[20,10,-5,-10,20,5,15,-5,10],
"Dreadnought":[15,15,-5,5,-10,0,30,-10,5],"Bardinger":[10,10,-5,0,0,5,5,10,10],"Dragoon":[15,5,0,5,0,10,10,10,5],"Caladrius":[15,0,10,10,5,5,10,10,5],"Ovate":[10,-5,20,15,5,10,-10,15,0],
"Bishop":[10,-5,15,0,0,20,-10,20,10],"Troubadour":[10,0,15,0,5,15,5,15,10],
"Swordmaster":[15,10,0,15,20,5,0,0,5],"High Savant":[10,15,15,5,10,5,5,5,5],"Battlemaster":[25,25,-5,5,-5,-5,10,-5,5],"War Monk":[15,10,0,0,15,5,5,15,5],"Bow Adept":[15,5,0,20,15,5,5,5,5],
"Bow Knight":[10,10,0,10,15,5,5,0,5],"Shadow Seeker":[15,5,0,25,15,15,0,10,0],"Sentinel":[15,15,0,5,5,5,10,15,5],"Castle Knight":[25,20,-5,5,-15,0,30,-10,5],"Orichaldia":[15,15,-5,5,0,5,5,5,10],
"Great Knight":[20,20,-5,0,-10,0,15,-10,5],"Celestial Trooper":[15,5,-5,5,10,15,5,15,10],"Bau Lord":[15,5,0,0,5,10,10,10,5],"Druid":[10,-5,30,10,15,10,-10,20,0],"Wiseman":[10,-5,20,5,0,20,-10,25,10],
"Valkyrium":[10,0,15,5,5,15,5,10,10]};
var CLS={};
TIERS.forEach(function(t,ti){t.list.forEach(function(c){
  var r=c[1].split(" ").map(function(s){var p=s.split(":");return {k:p[0],rk:p[1]}});
  CLS[c[0]]={name:c[0],r:r,w:r.map(function(x){return x.k}),x:c[2]||{},tier:ti};
})});
U.forEach(function(u){u.F=u.f?u.f.split(" "):[];u.X=u.u?u.u.split(" "):[];u.JJ=u.J.split("|")});
var BY={}; U.forEach(function(u){BY[u.n]=u});

// Heroic Games bracket teams (fireemblemwiki.org list of characters) — only used by the list filter
var TT={};
[["Fiery Mane","Goliath Jester Dante Gaitz"],["Tale of the Moon","Simon Ludia Fianna Ursula"],
 ["Linaria Dewdrops","Diego Loretta Ninae Seteth"],["Pale Raven","Nezha Dadao Halvin Sha_Lan"],
 ["other","Jasmine Alexandra Benditz Zarcone Kiroc Inyoni Peppe"]]
 .forEach(function(t){t[1].split(" ").forEach(function(n){TT[n.replace("_"," ")]=t[0]})});
var TTNAMES=["Fiery Mane","Tale of the Moon","Linaria Dewdrops","Pale Raven","other"];
function ttName(t){return t==="other"?tr("інші фракції","other factions"):t}
// which lords can recruit them at all; a badge only when not all four can
function uniqBadge(u){
  if(u.t==="p3"||u.JJ.indexOf("L")>=0)return "";
  var ok=LORDS.filter(function(l){return u.JJ[LI[l.id]]!=="-"}).map(function(l){return lordUa(l.id)});
  if(ok.length===4)return "";
  var no=LORDS.filter(function(l){return u.JJ[LI[l.id]]==="-"}).map(function(l){return lordUa(l.id)});
  return '<span class="tag uniq">'+(ok.length<=2?tr("лише: ","only: ")+ok.join(", "):tr("немає в: ","not with: ")+no.join(", "))+'</span>';
}
// renown grows slowly over the whole playthrough, so a low chapter with a high renown is not early.
// Renown by chapter in Game8's 100% walkthrough (Cai's path): Ch. 3 → 1, Ch. 4 → 3, Ch. 5 → 4, Ch. 6 → 5,
// Ch. 7 → 6–7, Ch. 8 → 7–8, Ch. 10 → 10. RENOWN_CH[r]: the chapter by which renown r is there, roughly
var RENOWN_CH=[0,3,4,4,5,6,7,8,8,9,10];
// when a path gets this fighter, to compare paths: [estimated chapter, renown, support, chapter], lower is sooner.
// The estimate is the later of the chapter and the chapter that brings the renown; joining on its own beats
// the same chapter with conditions. null: this path can't recruit them (or it is their lord)
function joinWhen(u,lord){
  var s=u.JJ[LI[lord]];
  if(s==="-"||s==="L")return null;
  if(s==="P")return [99,0,0,99];
  if(s[0]==="a"){var c=+s.slice(1);return [c,0,0,c]}
  var p=s.split("/"), ch=+p[0], r=+p[2];
  return [Math.max(ch,RENOWN_CH[r]||r),r,+p[1],ch];
}
function cmpWhen(a,b){for(var i=0;i<4;i++)if(a[i]!==b[i])return a[i]-b[i];return 0}
function joinInfo(u,lord){
  var s=u.JJ[LI[lord]];
  if(s==="-")return {ok:false,txt:tr("не вербується","not recruitable")};
  if(s==="L")return {ok:false,txt:tr("лідер","lord")};
  if(s==="P")return {ok:true,txt:tr("Частина III","Part III")};
  if(s[0]==="a")return {ok:true,txt:tr("авто, Гл. ","automatic, Ch. ")+s.slice(1)};
  var p=s.split("/");
  return {ok:true,txt:tr("Гл. ","Ch. ")+p[0]+tr(" · підтримка "," · support ")+p[1]+tr(" · слава "," · renown ")+p[2]+(p[3]?" · "+extra(p[3]):"")};
}

