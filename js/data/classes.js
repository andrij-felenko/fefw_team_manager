// Game data: the class tiers (exam skills, license rules), the weapons each class may wield and the skill families.
// Sources are listed in README.md.
import {pick} from "../core/i18n.js";

// tiers; names and license requirements in both languages
export const TIERS=[
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
export function tname(i){return pick(TIERS[i].name)}
export function treq(i){return pick(TIERS[i].req)}
export const NOTES={locks:["замки","lockpicking"],smith:["10 посилень мистецтв → доглядач храму Смірноса","enhance combat arts 10× → Smyrnos temple caretaker"]};
export const TEMPLE_UK={Mars:"Марса",Smyrnos:"Смірноса",Aurora:"Аврори",Kalla:"Калли",Credna:"Кредни",Jura:"Юри"};
export const CLS={};
TIERS.forEach(function(t,ti){t.list.forEach(function(c){
  var r=c[1].split(" ").map(function(s){var p=s.split(":");return {k:p[0],rk:p[1]}});
  CLS[c[0]]={name:c[0],r:r,w:r.map(function(x){return x.k}),x:c[2]||{},tier:ti};
})});
export const TIER_OF={}; TIERS.forEach(function(t,i){t.list.forEach(function(c){TIER_OF[c[0]]=i})});
export const RANKS=["E+","D","C","B","A","S"];
// skill families for the squad summary; a fighter usually maxes only one physical weapon of his class
export const GROUPS=[[["Зброя","Weapons"],["sw","sp","ax","bo","br"]],[["Магія","Magic"],["wm","bm"]],[["Рух","Movement"],["in","ri","fl"]],[["Броня","Armor"],["he"]],[["Інше","Other"],["au"]]];
export const PHYS=GROUPS[0][1];
// weapons each class may wield (Game8 class pages, September 2026) — often more than its exam asks for,
// e.g. Priest can punch, Caladrius can use a sword; Valkyrium and Troubadour are magic only
export const CW={"Gladiator":"sw br ax","Hunter":"bo sw","Soldier":"sp sw ax","Ornius Rider":"sp sw ax","Diviner":"sw br ax wm bm",
"Myrmidon":"sp sw","Brigand":"sw br ax","Pugilist":"br","Archer":"bo","Rogue":"bo sw","Armored Knight":"sp sw ax","Light Cavalry":"sp sw ax",
"Charioteer":"bo","Armored Ornius Rider":"sp sw ax","Wing Soldier":"sp sw","Priest":"br ax wm bm","Shaman":"sw br wm bm",
"Warrior":"sw br ax","Shido":"sp sw","Dancer":"bo sw","Blacksmith":"ax bm","Sniper":"bo","Forest Knight":"bo sw","Ranger":"bo sw",
"Cataphract":"sp sw ax","Guardian":"sp wm","Elephant Rider":"","Dreadnought":"sp ax","Bardinger":"sp sw ax","Dragoon":"sp sw ax",
"Caladrius":"sp sw ax bm","Ovate":"sw br wm bm","Bishop":"br ax wm bm","Troubadour":"wm bm",
"Swordmaster":"sp sw","High Savant":"sw bm","Battlemaster":"sw br ax","War Monk":"br wm","Bow Adept":"bo","Bow Knight":"bo sw",
"Shadow Seeker":"bo sw","Sentinel":"sp wm","Castle Knight":"sp ax","Orichaldia":"sp sw ax","Great Knight":"sp sw ax",
"Celestial Trooper":"sp sw","Bau Lord":"sp sw ax","Druid":"sw br bm","Wiseman":"br ax wm","Valkyrium":"wm bm"};
