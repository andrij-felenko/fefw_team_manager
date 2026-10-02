// The planner itself: saved state and plans, the rules, ratings, drawing the page and its events.
// ---------- state ----------
var KEY="rt-konstruktor-v2", OLD="rt-konstruktor-v1";
function defTeams(){
  var t={leda:[],cai:[],die:[],the:[]};
  U.forEach(function(u){if(t[u.t]&&u.JJ[LI[u.t]]!=="-")t[u.t].push({n:u.n,path:["","","","",""]})});
  return t;
}
var S; try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.teams){
  S={teams:defTeams(),cur:"leda",sx:{},q:"",filter:"avail",forU:"",tierF:"",hideB:false};
  try{var o=JSON.parse(localStorage.getItem(OLD)); if(o&&o.team){
    S.teams.leda=o.team.map(function(x){if(x.sx)S.sx[x.n]=x.sx;return {n:x.n,cls:x.cls||""}});
    var inLeda={};S.teams.leda.forEach(function(x){inLeda[x.n]=1});
    ["cai","die","the"].forEach(function(k){S.teams[k]=S.teams[k].filter(function(x){return !inLeda[x.n]})});
  }}catch(e){}
}
S.sx=S.sx||{}; ["leda","cai","die","the"].forEach(function(k){S.teams[k]=S.teams[k]||[]});
// language: the visitor's saved choice, else English
LANG=S.lang||"en";
setLangTables();
// tier filter and open tiers are kept by tier number (older versions kept the Ukrainian name)
if(S.tierF&&!/^\d$/.test(S.tierF))S.tierF="";
if(S.open&&Object.keys(S.open).some(function(k){return !/^\d$/.test(k)}))S.open=null;
if(S.ttF==="інші фракції")S.ttF="other";
// each fighter plans a path: one class per tier (Beginner, Specialty, Advanced, Master, Divine)
LORDS.forEach(function(l){if(S.teams[l.id])S.teams[l.id]=S.teams[l.id].filter(function(x){return BY[x.n]})});
var TIER_OF={}; TIERS.forEach(function(t,i){t.list.forEach(function(c){TIER_OF[c[0]]=i})});
var RANKS=["E+","D","C","B","A","S"];
LORDS.forEach(function(l){(S.teams[l.id]||[]).forEach(function(x){
  if(!x.path){x.path=["","","","",""];if(x.cls&&TIER_OF[x.cls]!=null)x.path[TIER_OF[x.cls]]=x.cls}
  delete x.cls;
})});
// classes that count as "taken": Advanced and up. Beginner and Specialty repeat freely (e.g. two Priests for healers);
// a repeated Advanced class is allowed but flagged; a Master class belongs to one fighter per squad
function counted(x){return x.path.filter(function(c,i){return c&&i>1})}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
// ---------- plans ----------
// four plans side by side in this browser (save slots). The open one lives in S.teams / S.sx as before,
// the other three in S.slots (null — never opened). Language, filters and the end level are shared by all of them
var NSLOTS=4, FILE_APP="fe-fortunes-weave-planner";
S.slot=S.slot>=0&&S.slot<NSLOTS?S.slot|0:0;
S.slots=Array.isArray(S.slots)?S.slots.slice(0,NSLOTS):[];
while(S.slots.length<NSLOTS)S.slots.push(null);
S.slots[S.slot]=null;
function has(o,k){return Object.prototype.hasOwnProperty.call(o,k)}
function planOf(){return {teams:S.teams,sx:S.sx}}
// a plan from another slot or from someone's file: known fighters and classes only, each fighter in one squad,
// and the fighters the story gives a lord always in that lord's squad
function cleanPlan(p){
  if(!p||typeof p!=="object"||!p.teams||typeof p.teams!=="object")return null;
  var seen={}, out={teams:{},sx:{}};
  LORDS.forEach(function(l){
    out.teams[l.id]=[];
    (Array.isArray(p.teams[l.id])?p.teams[l.id]:[]).forEach(function(x){
      if(!x||typeof x.n!=="string"||!has(BY,x.n)||has(seen,x.n))return;
      seen[x.n]=1;
      var y={n:x.n,path:[0,1,2,3,4].map(function(i){var c=Array.isArray(x.path)?x.path[i]:"";
        return typeof c==="string"&&has(CLS,c)&&TIER_OF[c]===i?c:""})};
      if(x.main&&typeof x.main==="object")Object.keys(x.main).forEach(function(i){
        var ks=Array.isArray(x.main[i])?x.main[i].filter(function(k){return typeof k==="string"&&has(SK_EN,k)}):[];
        if(/^[0-4]$/.test(i)&&ks.length){y.main=y.main||{};y.main[i]=ks}
      });
      out.teams[l.id].push(y);
    });
  });
  U.forEach(function(u){LORDS.forEach(function(l){
    if(fixedIn(u,l.id)&&!has(seen,u.n)){seen[u.n]=1;out.teams[l.id].push({n:u.n,path:["","","","",""]})}
  })});
  if(p.sx&&typeof p.sx==="object")Object.keys(p.sx).forEach(function(n){
    if(has(BY,n)&&sxEditable(n)&&(p.sx[n]==="f"||p.sx[n]==="m"))out.sx[n]=p.sx[n]});
  return out;
}
function openPlan(p){
  S.teams=p.teams; S.sx=p.sx;
  if(!S.teams[S.cur].some(function(x){return x.n===S.forU}))S.forU="";
  OPEN=null;
}
// an empty slot starts like a first visit: each lord with the fighters the game gives them
function useSlot(i){
  if(i===S.slot||!(i>=0&&i<NSLOTS))return;
  var next=cleanPlan(S.slots[i])||{teams:defTeams(),sx:{}};
  S.slots[S.slot]=JSON.parse(JSON.stringify(planOf()));
  S.slots[i]=null; S.slot=i; openPlan(next);
  save(); renderAll();
}
// one file with all four plans: to keep as a backup or to send to someone
function exportPlans(){
  var d=new Date(), day=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  var data={app:FILE_APP,version:1,exported:d.toISOString(),open:S.slot,plans:S.slots.map(function(p,i){return i===S.slot?planOf():p})};
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:"application/json"}));
  a.download="fortunes-weave-plans-"+day+".json";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function(){URL.revokeObjectURL(a.href)},10000);
}
function notOurFile(){alert(tr("Цей файл не схожий на експорт планувальника.","This file isn't a planner export."))}
// the file replaces all four plans; if the page can't draw it, everything goes back as it was
function importPlans(text){
  var d=null; try{d=JSON.parse(text)}catch(e){}
  var plans=d&&d.app===FILE_APP&&Array.isArray(d.plans)?d.plans.slice(0,NSLOTS).map(cleanPlan):[];
  while(plans.length<NSLOTS)plans.push(null);
  var open=d?d.open|0:0; if(!(open>=0&&open<NSLOTS&&plans[open]))open=plans.findIndex(function(p){return p});
  if(open<0){notOurFile();return}
  if(!confirm(tr("Завантажити плани з цього файлу? Вони замінять усі чотири плани тут — спершу експортуй свої, якщо хочеш їх зберегти.",
                 "Load the plans from this file? They will replace all four plans here — export yours first if you want to keep them.")))return;
  var before=JSON.stringify(S);
  S.slots=plans; S.slot=open; openPlan(plans[open]); S.slots[open]=null;
  try{renderAll()}catch(err){S=JSON.parse(before);OPEN=null;renderAll();notOurFile();return}
  save();
}
function team(){return S.teams[S.cur]}
function lordOf(n){for(var k in S.teams){if(S.teams[k].some(function(x){return x.n===n}))return k}return null}
// gender from the infobox on fireemblemwiki.org; Gaitz and Kiroc are not stated there
var GENDER={};
"Leda Mu Olympia Catania Tialla Ultand Esmeralda Mikaela Theodora Lilian Sofia Alexandra Dante Fianna Halvin Inyoni Jasmine Loretta Ludia Ninae Noctula Nydine Sha_Lan Ursula"
  .split(" ").forEach(function(n){GENDER[n.replace("_"," ")]="f"});
"Buccar Sirocco Cai Peter Guzran Dietrich Fabio Yang_Jie Bonaventure Tobias Lysander Benditz Dadao Diego Goliath Io Jester Majide Nezha Nuzzuo Peppe Seteth Simon Zarcone"
  .split(" ").forEach(function(n){GENDER[n.replace("_"," ")]="m"});
// age before the timeskip (Part I): seen in game first, then fireemblemwiki.org infobox,
// Fextralife "Age" field, fireemblem.fandom.com (pre-timeskip value). After the timeskip everyone is +5.
var AGE={Leda:19,Buccar:49,Sirocco:20,Mu:15,Olympia:22,Cai:15,Tialla:15,Peter:15,Ultand:23,Dietrich:22,Esmeralda:17,
  Theodora:22,Bonaventure:49,Tobias:45,Catania:26,Guzran:37,Mikaela:35,"Yang Jie":39,Lysander:20,
  Lilian:18,Io:19,Kiroc:49,"Sha Lan":20,Zarcone:29,Seteth:1000,
  Simon:32,Ninae:471,Inyoni:25,Jasmine:38,Dante:23,Diego:19,Loretta:13,Ludia:17,Majide:28,Nydine:26,Ursula:79,Sofia:28};
var AGE_TXT={Seteth:"1000+"};
function ageTxt(n){return AGE[n]==null?"":(AGE_TXT[n]||String(AGE[n]))}
// over a hundred: the long-lived (Seteth, a Nabatean; Ninae, whose people the game leaves open).
function ageBand(n){var a=AGE[n];return a==null?"?":(a>=100?"long":(a<=18?"young":(a>=32?"old":"mid")))}
// gender is fixed in the game; gaps in the wiki are filled in by hand
function sxEditable(n){return !GENDER[n]}
function sxOf(n){return sxEditable(n)?(S.sx[n]||""):GENDER[n]}
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

// ---------- rules ----------
function fit(u,cn){var c=CLS[cn];if(!c)return {p:[],m:[]};
  return {p:c.w.filter(function(w){return u.F.indexOf(w)>=0}),m:c.w.filter(function(w){return u.X.indexOf(w)>=0})};}
function holdersAll(cn,except){var o=[];LORDS.forEach(function(l){S.teams[l.id].forEach(function(x){if(x.n!==except&&counted(x).indexOf(cn)>=0)o.push(x.n+" ("+lordUa(l.id)+")")})});return o}
// among fighters sharing an Advanced class, the "main" one is best prepared for it:
// the Specialty stage already trains its skills, and those skills are his strengths (green)
function prep(x,cn){
  var u=BY[x.n], C=CLS[cn], sp=CLS[x.path[1]], s=0;
  C.w.forEach(function(k){
    if(sp&&sp.w.indexOf(k)>=0)s+=1;
    if(u.F.indexOf(k)>=0)s+=0.5;
    if(u.X.indexOf(k)>=0)s-=0.5;
  });
  return s;
}
function mainHolder(cn){
  var best=null,bs=-1e9;
  team().forEach(function(x){if(x.path[2]!==cn)return;var s=prep(x,cn);if(s>bs){bs=s;best=x.n}});
  return best;
}
function holders(cn,except){if(TIER_OF[cn]<=1)return [];return team().filter(function(x){return x.n!==except&&counted(x).indexOf(cn)>=0}).map(function(x){return x.n})}
// a class another lord's path owns: not shown for this squad at all
function offPath(cn){var c=CLS[cn];return !!c&&((c.x.excl&&c.x.excl!==S.cur)||(c.x.route&&c.x.route.indexOf(S.cur)<0))}
function access(n,cn){
  var c=CLS[cn],u=BY[n],r={block:null,warn:null},sx=sxOf(n); if(!c||!u)return r;
  // Part I: each lord's path offers 11 of the 17 Advanced classes (matches the in-game count)
  if(c.x.excl&&c.x.excl!==S.cur)r.block=tr("лише на маршруті: ","only on the path of ")+lordUa(c.x.excl);
  else if(c.x.route&&c.x.route.indexOf(S.cur)<0)r.block=tr("лише на маршрутах: ","only on the paths of ")+c.x.route.map(lordUa).join(", ");
  else if(c.x.p3)r.block=tr("лише з Частини III","Part III only");
  else if(u.nm&&(c.w.indexOf("ri")>=0||c.w.indexOf("fl")>=0))r.block=tr("не може верхи чи в польоті","cannot ride or fly");
  else if(c.x.fem&&sx==="m")r.block=tr("лише для жінок","women only");
  // Master: one per squad, no exceptions. Advanced may repeat, the stage is flagged instead (see renderTeam)
  else if(TIER_OF[cn]===3&&holders(cn,n).length)r.block=tr("вже зайнято: ","already taken: ")+holders(cn,n).join(", ");
  // Divine classes come in Part III, when all four squads are one army: one holder across all of them
  else if(c.x.div&&holdersAll(cn,n).length)r.block=tr("вже зайнято: ","already taken: ")+holdersAll(cn,n).join(", ");
  if(!r.block&&c.x.fem&&sx!=="f")r.warn=tr("лише для жінок — вкажи стать","women only — set the gender");
  return r;
}

// ---------- pieces ----------
// the fighter's strengths, then weaknesses, as framed icons; the tooltip gives the name
function chips(u){
  if(!u.F.length&&!u.X.length)return '<span class="c-apt none">'+tr("схильностей не вказано","no aptitudes listed")+'</span>';
  return '<span class="c-apt">'+u.F.map(function(k){return skTile(k,"","","up")}).join("")+(u.F.length&&u.X.length?'<i class="gap"></i>':'')+
    u.X.map(function(k){return skTile(k,"","","dn")}).join("")+'</span>';
}
// a fighter the game itself puts in the squad: a scroll instead of the word "story"
var STORY_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3.5C4 2.4 4.9 1.5 6 1.5H18C19.1 1.5 20 2.4 20 3.5S19.1 5.5 18 5.5H6C4.9 5.5 4 4.6 4 3.5Z'+
  'M4 20.5C4 19.4 4.9 18.5 6 18.5H18C19.1 18.5 20 19.4 20 20.5S19.1 22.5 18 22.5H6C4.9 22.5 4 21.6 4 20.5Z"/>'+
  '<path fill-rule="evenodd" d="M6 5H18V19H6Z M8.5 8.4H15.5V9.7H8.5Z M8.5 11.3H15.5V12.6H8.5Z M8.5 14.2H13.5V15.5H8.5Z"/></svg>';
function homeTag(u){
  var where=lordOf(u.n);
  if(where&&where!==S.cur)return '<span class="tag lock">'+tr("у загоні: ","in squad: ")+lordUa(where)+'</span>';
  return '<span class="tag">'+(u.t?home(u.t):tr("вільний","free agent"))+'</span>';
}
// the lord's own squad as the game gives it (story joins and the tutorial recruit)
function fixedIn(u,lord){return u.t===lord&&u.JJ[LI[lord]]!=="-"}
// classes tied to a lord's path: exclusive ones first, then the ones only this path (and one other) has
function routeClasses(id){
  var ex=[],un=[];
  Object.keys(CLS).forEach(function(k){var x=CLS[k].x;if(x.excl===id)ex.push(k);else if(x.route&&x.route.indexOf(id)>=0)un.push(k)});
  return {ex:ex,un:un};
}
function ruleOf(C){
  var r=C.x.excl?tr("лише маршрут: ","only path: ")+lordUa(C.x.excl):(C.x.route?tr("лише маршрути: ","only paths: ")+C.x.route.map(lordUa).join(", "):(C.x.fem?tr("лише жінки","women only"):tr("будь-хто","anyone")));
  return r+(C.x.div?tr(" · один носій на всю армію"," · one holder in the whole army"):(C.x.one?tr(" · один носій у загоні"," · one per squad"):""));
}
function restr(c){
  var x=c.x,o=[];
  if(x.route&&x.route.indexOf(S.cur)>=0)o.push('<i class="mine">'+tr("клас маршруту","path class")+'</i>');
  if(x.temple)o.push('<i class="soft">'+tr("храм "+TEMPLE_UK[x.temple],x.temple+"'s temple")+'</i>');
  if(x.p3)o.push('<i class="soft">'+tr("з Частини III","from Part III")+'</i>');
  if(x.item)o.push('<i class="soft">'+tr("Ключ Діадеми + ","Key of the Diadem + ")+x.item+'</i>');
  if(x.note)o.push('<i class="soft">'+pick(NOTES[x.note])+'</i>');
  return o.length?'<div class="rs">'+o.join("")+'</div>':"";
}
// skill families for the squad summary; a fighter usually maxes only one physical weapon of his class
var GROUPS=[[["Зброя","Weapons"],["sw","sp","ax","bo","br"]],[["Магія","Magic"],["wm","bm"]],[["Рух","Movement"],["in","ri","fl"]],[["Броня","Armor"],["he"]],[["Інше","Other"],["au"]]];
var PHYS=GROUPS[0][1];
// weapons each class may wield (Game8 class pages, September 2026) — often more than its exam asks for,
// e.g. Priest can punch, Caladrius can use a sword; Valkyrium and Troubadour are magic only
var CW={"Gladiator":"sw br ax","Hunter":"bo sw","Soldier":"sp sw ax","Ornius Rider":"sp sw ax","Diviner":"sw br ax wm bm",
"Myrmidon":"sp sw","Brigand":"sw br ax","Pugilist":"br","Archer":"bo","Rogue":"bo sw","Armored Knight":"sp sw ax","Light Cavalry":"sp sw ax",
"Charioteer":"bo","Armored Ornius Rider":"sp sw ax","Wing Soldier":"sp sw","Priest":"br ax wm bm","Shaman":"sw br wm bm",
"Warrior":"sw br ax","Shido":"sp sw","Dancer":"bo sw","Blacksmith":"ax bm","Sniper":"bo","Forest Knight":"bo sw","Ranger":"bo sw",
"Cataphract":"sp sw ax","Guardian":"sp wm","Elephant Rider":"","Dreadnought":"sp ax","Bardinger":"sp sw ax","Dragoon":"sp sw ax",
"Caladrius":"sp sw ax bm","Ovate":"sw br wm bm","Bishop":"br ax wm bm","Troubadour":"wm bm",
"Swordmaster":"sp sw","High Savant":"sw bm","Battlemaster":"sw br ax","War Monk":"br wm","Bow Adept":"bo","Bow Knight":"bo sw",
"Shadow Seeker":"bo sw","Sentinel":"sp wm","Castle Knight":"sp ax","Orichaldia":"sp sw ax","Great Knight":"sp sw ax",
"Celestial Trooper":"sp sw","Bau Lord":"sp sw ax","Druid":"sw br bm","Wiseman":"br ax wm","Valkyrium":"wm bm"};
function wieldOf(c){var w=(CW[c.name]||"").split(" ").filter(Boolean);c.w.forEach(function(k){if((PHYS.indexOf(k)>=0||k==="wm"||k==="bm")&&w.indexOf(k)<0)w.push(k)});return w}
// physical weapons a class can hold: its exam weapons first, then the others it allows
function physOf(c){var e=c.w.filter(function(k){return PHYS.indexOf(k)>=0});wieldOf(c).forEach(function(k){if(PHYS.indexOf(k)>=0&&e.indexOf(k)<0)e.push(k)});return e}
function magOf(c){return wieldOf(c).filter(function(k){return k==="wm"||k==="bm"})}
// priority weapons of a stage: at least one, up to all of the class's physical weapons.
// Not chosen yet → one by default: the first the fighter is strong in, else the class's first weapon
function prioAt(x,ti){return prioFor(CLS[x.path[ti]],x,ti)}
// the same for any class put on that stage (the class list previews it before it is chosen).
// Only the class's own weapons (its exam weapons) can be priority; others it merely allows can't
function eligOf(c){return c.w.filter(function(k){return PHYS.indexOf(k)>=0})}
function prioFor(c,x,ti){
  if(!c)return [];
  var el=eligOf(c); if(!el.length)return [];
  var m=x.main&&x.main[ti]; if(typeof m==="string")m=[m]; // an earlier version stored a single weapon
  var own=(m||[]).filter(function(k){return el.indexOf(k)>=0});
  if(own.length)return own;
  var u=BY[x.n], good=el.filter(function(k){return u.F.indexOf(k)>=0&&u.X.indexOf(k)<0});
  return [good[0]||el[0]];
}
// one skill tile. st: "pr" chosen priority, "own" the class's own weapon (can be made priority),
// "al" allowed but not the class's own, "na" the class can't use it, "" a non-weapon exam skill;
// apt: "up" / "dn" the fighter's strength / weakness; rk: exam rank; main: "card-stage-skill" makes it a priority toggle
function skTile(k,st,rk,apt,main,on){
  var t=SK[k]+(rk?" "+rk:"")+(st==="pr"?tr(" · обрана пріоритетна"," · chosen priority"):st==="own"?tr(" · зброя класу"," · the class's own weapon"):
    st==="na"?tr(" · клас не дозволяє"," · the class can't use it"):st==="al"?tr(" · дозволена, але не зброя класу"," · allowed, not the class's own"):"")+
    (apt==="up"?tr(" · схильність"," · strength"):apt==="dn"?tr(" · слабкість"," · weakness"):"")+
    (main?tr(" · клікни, щоб змінити пріоритет"," · click to change priority"):"");
  return '<span class="sk-t'+(st?" "+st:"")+(apt?" "+apt:"")+'" title="'+esc(t)+'" aria-label="'+esc(t)+'"'+
    (main?' data-main="'+main+'" role="button" tabindex="0" aria-pressed="'+!!on+'"':' role="img"')+'>'+
    ic(k)+(rk?'<i class="sk-r">'+rk+'</i>':'')+'</span>';
}
function aptOf(u,k){return u?(u.X.indexOf(k)>=0?"dn":(u.F.indexOf(k)>=0?"up":"")):""}
// weapons always in the game's order, so the three stages line up column by column; then the other exam skills.
// On a class with several own physical weapons a click adds one to / drops it from the priority set
var WEAP=["sw","sp","ax","bo","br","bm","wm"];
// preview: the class is only shown in the class list, so nothing is clickable
function reqLine(c,u,x,ti,i,preview){
  var wl=wieldOf(c), el=eligOf(c), pr=x?prioFor(c,x,ti):[], pick=x&&!preview&&el.length>1;
  function rkOf(k){var q=c.r.filter(function(q){return q.k===k})[0];return q?q.rk:""}
  var other=c.r.filter(function(q){return WEAP.indexOf(q.k)<0});
  return '<span class="req">'+WEAP.map(function(k){
    var rk=rkOf(k), can=!!rk||wl.indexOf(k)>=0, on=pr.indexOf(k)>=0;
    return skTile(k,!can?"na":(on?"pr":(rk?"own":"al")),rk,aptOf(u,k),pick&&el.indexOf(k)>=0?i+"-"+ti+"-"+k:"",on);
  }).join("")+
  other.map(function(q){return skTile(q.k,"",q.rk,aptOf(u,q.k))}).join("")+'</span>';
}
// what the current lord needs to recruit this fighter: support / renown
function recTag(u){
  var s=u.JJ[LI[S.cur]];
  if(s==="L"||s==="-")return "";
  if(s[0]==="a")return ""; // comes with the story, nothing to recruit
  if(s==="P")return '<span class="c-rec">'+tr("Ч. III","Pt. III")+'</span>';
  var p=s.split("/");
  return '<span class="c-rec" title="'+tr("Гл. ","Ch. ")+p[0]+tr(" · підтримка "," · support ")+p[1]+tr(" · слава "," · renown ")+p[2]+(p[3]?' · '+esc(extra(p[3])):'')+'">'+
    tr("Підтримка ","Support ")+p[1]+' · '+tr("Слава ","Renown ")+p[2]+'</span>';
}
var OPEN=null; // which stage drawer is open: "cardIndex-stage"
// recommend 1–3 classes of an earlier stage that train the skills the later chosen classes need
function recommend(n,ti,path){
  var u=BY[n], need={}, later=[];
  for(var s=ti+1;s<4;s++){var cn=path[s];if(!cn)continue;later.push(cn);
    CLS[cn].r.forEach(function(q){need[q.k]=Math.max(need[q.k]||0,RANKS.indexOf(q.rk)+1)})}
  if(!later.length)return {list:[],to:[]};
  var scored=TIERS[ti].list.map(function(c){
    var C=CLS[c[0]], a=access(n,c[0]), hit=0, extra=0;
    C.w.forEach(function(k){if(need[k])hit+=1+need[k]/6;else extra++});
    return {c:c[0],score:hit-extra*0.5,hit:hit,bad:fit(u,c[0]).m.length,block:!!a.block||(C.x.div?holdersAll(c[0],n):holders(c[0],n)).length>0};
  }).filter(function(o){return o.hit>0&&!o.block});
  scored.sort(function(a,b){return b.score-a.score||a.bad-b.bad});
  return {list:scored.slice(0,3).map(function(o){return o.c}),to:later};
}
function pickList(n,sel,ti,i){
  var u=BY[n], rec=recommend(n,ti,team()[i].path);
  var order=TIERS[ti].list.filter(function(c){return !offPath(c[0])||c[0]===sel}).sort(function(a,b){
    var ra=rec.list.indexOf(a[0]),rb=rec.list.indexOf(b[0]);
    return (ra<0?99:ra)-(rb<0?99:rb);
  });
  return (rec.list.length?'<div class="rec-h">'+tr("Веде до: ","Leads to: ")+rec.to.join(", ")+'</div>':'')+
    (sel?'<button type="button" class="opt clear" data-set="'+i+'-'+ti+'" data-c="">'+tr("— прибрати клас","— remove class")+'</button>':'')+
    order.map(function(c){
      var isRec=rec.list.indexOf(c[0])>=0;
      var f=fit(u,c[0]),a=access(n,c[0]),C=CLS[c[0]];
      var taken=C.x.div?holdersAll(c[0],n):holders(c[0],n);
      var rt=rateAt(u,team()[i],ti,c[0]), rb=nameBand(rt);
      var oc=(taken.length||a.block?"taken":(f.m.length?"weak":""))+(isRec?" rec":"")+(rb?" rb-"+rb:"");
      // the stage's tile row as it would look with this class chosen
      var need=reqLine(C,u,team()[i],ti,i,true);
      var note=a.block?"⛔ "+a.block:(taken.length?tr("зайнято: ","taken: ")+taken.join(", "):(C.x.fem?tr("лише жінки","women only"):""));
      if(!a.block&&(C.x.excl===S.cur||(C.x.route&&C.x.route.indexOf(S.cur)>=0)))note=(note?note+" · ":"")+tr("клас маршруту ","path class of ")+lordUa(S.cur);
      // a blocked class cannot be picked at all
      return '<button type="button" class="opt '+oc+(c[0]===sel?" on":"")+'" data-set="'+i+'-'+ti+'" data-c="'+c[0]+'"'+(a.block&&c[0]!==sel?" disabled":"")+'>'+
        '<span class="o-n">'+(taken.length||a.block?"⊘ ":"")+c[0]+'</span>'+rateStrip(rt,true)+'<span class="o-r">'+need+'</span>'+
        (note?'<span class="o-x">'+note+'</span>':'')+'</button>';
    }).join("");
}
// how each skill has to grow along the chosen path
function progression(x,u){
  var cols=[],skills=[];
  x.path.forEach(function(cn,i){if(!cn||i<1||i>3)return;cols.push(i);CLS[cn].r.forEach(function(q){if(skills.indexOf(q.k)<0)skills.push(q.k)})});
  if(!cols.length)return "";
  var MK=MARKS[LANG]||MARKS.en;
  function rk(cn,k){var q=CLS[cn].r.filter(function(q){return q.k===k})[0];return q?RANKS.indexOf(q.rk):-1}
  // one rank bar per skill: E+ … S, filled to the highest rank the path needs, stage marks at the rank each stage asks for
  var h='<div class="prog"><div class="lbl">'+tr("Шлях навичок","Skill path")+" · "+[1,2,3].map(function(i){return MK[i]+" "+STAGE_S[i].toLowerCase()}).join(" · ")+'</div>';
  skills.forEach(function(k){
    var cl=u.X.indexOf(k)>=0?"m":(u.F.indexOf(k)>=0?"p":""), best=-1, marks={};
    cols.forEach(function(i){var v=rk(x.path[i],k);if(v<0)return;best=Math.max(best,v);(marks[v]=marks[v]||[]).push(MK[i])});
    h+='<div class="sk '+cl+'"><span class="sk-n">'+ic(k)+SK[k]+'</span><div class="track">'+
      RANKS.map(function(r,v){return '<span class="seg'+(v<=best?" on":"")+'">'+(marks[v]?'<em>'+marks[v].join(" ")+'</em>':'')+'<i>'+r+'</i></span>'}).join("")+
      '</div><b class="sk-g">'+RANKS[best]+'</b></div>';
  });
  return h+'</div>';
}
// which growth stats a skill needs. Stat roles (Game8/Fextralife): Str = physical damage, Mag = magic damage,
// Dex = hit and crit, Spd = avoid and attack speed (follow-ups), Def/Res = damage taken, Cha = gambit hit.
// Weapon traits (Game8): sword ×1.2 on follow-ups, axe hits hard but less accurately, bow is effective at range
// and lives on accuracy, gauntlets rely on avoid, black magic targets Resilience.
// d = direct (the weapon's damage/core), i = indirect (helps it land or repeat). Stat order: HP Str Mag Dex Spd Lck Def Res Cha
var REL={sw:{d:[1,4],i:[3]},sp:{d:[1],i:[3,4]},ax:{d:[1],i:[3,4]},bo:{d:[1,3],i:[4]},br:{d:[1,4],i:[3]},
  wm:{d:[2],i:[3,4]},bm:{d:[2],i:[3,4]},he:{d:[6],i:[0]},au:{d:[8],i:[]}};
// relevance for one stage: its class's skills, keeping only the priority weapons among physical ones
function relAt(x,ti){
  var c=CLS[x.path[ti]], r=[0,0,0,0,0,0,0,0,0], why=[[],[],[],[],[],[],[],[],[]]; if(!c)return null;
  var pr=prioAt(x,ti), ks=c.w.slice(); pr.forEach(function(k){if(ks.indexOf(k)<0)ks.push(k)});
  ks.forEach(function(k){
    if(PHYS.indexOf(k)>=0&&pr.indexOf(k)<0)return;
    var m=REL[k]; if(!m)return;
    m.d.forEach(function(s){r[s]=2;why[s].push(SK[k])});
    m.i.forEach(function(s){if(r[s]<1)r[s]=1;if(why[s].indexOf(SK[k])<0)why[s].push(SK[k])});
  });
  return {r:r,why:why};
}
// ---------- combat rating of a fighter in a class ----------
// Works on growth rates (own + class modifier), since base stats aren't known for everyone.
// Known mechanics (Game8/Fextralife): Str/Mag = damage; Spd = avoid and attack speed — 4 more than the foe means a
// second hit, for every weapon and magic; Dex = hit and crit, crit = triple damage; Def/Res = damage taken;
// Lck = avoiding enemy crits; Cha = gambit hit. Magic has limited uses, weapons don't.
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
// ---------- three ratings: damage, evasion, defense ----------
// Stats are what a fighter is expected to gain level by level along the path: growth = personal + class modifier
// (Game8), and before the Specialty class the base Commoner class adds nothing. Ideal levels (Game8): Specialty 20,
// Advanced 35, Master 45. A stage is judged at the level it is left: Specialty at 35, Advanced at 45, Master at the end.
// Damage: attack stat (Str or Mag, whichever the class can use) + Spd for follow-ups (AS +4 over the foe) + Dex for hit
// and crits (triple damage). Evasion: Spd (Avo) + Lck (lowers enemy crits). Defense: ½ HP + Def + Res. Res counts in full:
// spells add little Might (Fire 3, Thunder 5 against 8–13 for iron weapons, Game8), so a foe's magic is mostly his Mag
// and enough Res wipes it out — a good mage takes almost nothing from other mages.
// Scale: for each rating, the best fighter with the best class on every stage, grown to the end level, makes 100;
// the three scales are stretched so their maxima match. Overall = (the two best + half the weakest) / 2.5: two strong
// sides cover the third (damage + evasion needs no armour, damage + defense needn't dodge, a dodging wall holds a gap).
// Colours say how a rating compares with every fighter × class option of the same tier. The overall's colour uses the
// same rule on how far each side stands from the tier's average (in typical spreads), with the weakest side's hole capped.
var LV_AT=[1,20,35,45];
// flat bonus to basic stats while a fighter is in the class (Fextralife class pages, "Bonus Points to Basic Stats"),
// order HP Str Mag Dex Spd Lck Def Res Cha. It holds only while in that class, so a stage adds the bonus of its own class
var CB={"Myrmidon":[1,0,0,0,2,0,0,-1,0],"Brigand":[3,2,0,0,0,0,1,-1,0],"Pugilist":[2,1,0,0,1,0,2,-1,0],"Archer":[0,0,0,2,2,0,1,0,0],"Rogue":[0,0,0,1,3,1,0,1,-1],"Armored Knight":[2,1,0,0,-2,0,4,0,0],"Light Cavalry":[1,1,0,0,1,0,2,0,1],"Charioteer":[3,1,0,3,-2,0,3,0,1],"Armored Ornius Rider":[1,0,0,0,2,0,2,0,0],"Wing Soldier":[0,0,0,1,4,0,1,2,1],"Priest":[0,0,1,0,0,2,0,3,1],"Shaman":[0,0,2,1,1,0,0,2,-1],"Warrior":[4,4,0,0,1,0,0,0,0],"Shido":[3,0,0,3,7,0,0,0,0],"Dancer":[4,0,0,5,9,0,0,0,5],"Blacksmith":[5,1,1,0,1,0,3,1,0],"Sniper":[1,0,0,5,5,0,0,0,0],"Forest Knight":[1,0,0,2,5,0,1,0,0],"Ranger":[1,0,0,4,7,1,0,1,1],"Cataphract":[5,2,0,0,-1,0,5,0,0],"Guardian":[3,1,0,0,1,0,3,4,0],"Elephant Rider":[10,2,0,3,-5,0,7,0,3],"Dreadnought":[5,3,0,0,-5,0,9,-1,0],"Bardinger":[3,0,0,0,1,0,1,0,3],"Dragoon":[2,1,0,1,3,0,1,0,0],"Caladrius":[2,0,1,0,3,0,1,2,0],"Ovate":[1,0,4,4,3,0,0,4,-1],"Bishop":[1,0,3,0,1,3,0,5,3],"Troubadour":[0,0,1,1,1,0,1,2,3],"Swordmaster":[5,2,0,7,7,0,0,0,0],"High Savant":[5,2,2,3,3,0,2,0,0],"Battlemaster":[13,6,0,0,2,0,4,0,0],"War Monk":[5,2,0,2,5,0,2,4,0],"Bow Adept":[4,2,0,9,5,0,0,0,0],"Bow Knight":[3,2,0,5,7,0,2,0,0],"Shadow Seeker":[4,4,0,7,9,2,0,0,-2],"Sentinel":[5,4,0,4,2,0,4,5,0],"Castle Knight":[9,6,0,4,-6,0,13,-2,0],"Orichaldia":[7,3,0,3,2,0,2,0,2],"Great Knight":[12,5,0,2,-4,0,5,0,0],"Celestial Trooper":[3,0,0,3,5,0,0,5,2],"Bau Lord":[5,2,0,3,3,0,3,0,0],"Druid":[4,0,7,7,4,0,0,5,-2],"Wiseman":[4,0,5,2,2,4,0,9,2],"Valkyrium":[2,0,2,3,2,0,2,3,2]};
function withBonus(st,cn){var b=CB[cn];return b?st.map(function(v,k){return v+b[k]}):st}
function endLv(){return clamp(+S.endLv||60,46,99)}
function exitLv(ti){return ti<3?LV_AT[ti+1]:endLv()}
var AVG_MOD={};
function avgMod(ti){ // the tier's average modifier stands in for an earlier stage when the scale is built
  if(AVG_MOD[ti])return AVG_MOD[ti];
  var n=0, m=[0,0,0,0,0,0,0,0,0];
  TIERS[ti].list.forEach(function(c){var d=CG[c[0]];if(!d)return;n++;d.forEach(function(v,k){m[k]+=v})});
  return (AVG_MOD[ti]=m.map(function(v){return n?v/n:0}));
}
// expected gains up to the exit level of stage ti; mods[s] = modifier on stage s (none → the one before carries on)
function gainsTo(u,mods,ti){
  var st=u.g.map(function(v){return v*(LV_AT[1]-1)/100}), cur=null;
  for(var s=1;s<=ti;s++){
    if(mods[s])cur=mods[s];
    var n=exitLv(s)-LV_AT[s];
    u.g.forEach(function(v,k){st[k]+=Math.max(0,v+(cur?cur[k]:0))*n/100});
  }
  return st;
}
function rateIdx(st,C){
  var w=wieldOf(C), ph=!w.length||physOf(C).length>0, mg=magOf(C).length>0;
  var mag=mg&&(!ph||st[2]>st[1]), atk=mag?st[2]:st[1];
  return {v:[atk+0.5*st[4]+0.35*st[3], st[4]+0.4*st[5], 0.5*st[0]+st[6]+st[7]], mag:mag};
}
// the three weights: index 0 damage (attack stat filled in below), 1 evasion, 2 defense; stat order HP Str Mag Dex Spd Lck Def Res Cha
var RW=[null,[0,0,0,0,1,0.4,0,0,0],[0.5,0,0,0,0,0,1,1,0]];
function segPts(u,mod,n,w){var t=0;u.g.forEach(function(v,k){if(w[k])t+=w[k]*Math.max(0,v+(mod?mod[k]:0))*n/100});return t}
// the best any fighter can reach on each rating by the end level, picking the best class of every tier for it
var AXMAX={};
function axisMax(){
  var key=endLv(); if(AXMAX[key])return AXMAX[key];
  var ws=[[[0,1,0,0.35,0.5,0,0,0,0],[0,0,1,0.35,0.5,0,0,0,0]],[RW[1]],[RW[2]]];
  var best=ws.map(function(list){var top={v:0};list.forEach(function(w){U.forEach(function(u){
    var t=segPts(u,null,LV_AT[1]-1,w), cls=[];
    for(var ti=1;ti<=3;ti++){var n=exitLv(ti)-LV_AT[ti], b=-1, bc="";
      TIERS[ti].list.forEach(function(c){if(!CG[c[0]])return;var v=segPts(u,CG[c[0]],n,w);
        if(ti===3&&CB[c[0]])CB[c[0]].forEach(function(q,k){v+=(w[k]||0)*q});
        if(v>b){b=v;bc=c[0]}});
      t+=b; cls.push(bc)}
    if(t>top.v)top={v:t,n:u.n,cls:cls};
  })});return top});
  return (AXMAX[key]=best);
}
function ovOf(q){var s=q.slice().sort(function(a,b){return b-a});return (s[0]+s[1]+0.5*s[2])/2.5}
function ovRel(v,sc){var z=v.map(function(x,k){return (x-sc.zm[k])/sc.zs[k]}).sort(function(a,b){return b-a});return (z[0]+z[1]+0.5*Math.max(z[2],-1.5))/2.5}
function upper(a,v){var lo=0,hi=a.length;while(lo<hi){var m=(lo+hi)>>1;if(a[m]<=v)lo=m+1;else hi=m}return lo}
function share(a,v){return Math.min(99,Math.round(100*upper(a,v)/a.length))}
var SCALE={};
function scaleOf(ti){
  var key=ti+"-"+endLv(); if(SCALE[key])return SCALE[key];
  var rows=[], stl=[];
  U.forEach(function(u){TIERS[ti].list.forEach(function(c){
    if(!CG[c[0]])return;
    var mods=[null]; for(var s=1;s<ti;s++)mods.push(avgMod(s)); mods[ti]=CG[c[0]];
    var g=withBonus(gainsTo(u,mods,ti),c[0]); stl.push(g); rows.push(rateIdx(g,CLS[c[0]]).v);
  })});
  var mx=axisMax(), sc={a:[0,1,2].map(function(k){return rows.map(function(r){return r[k]}).sort(function(p,q){return p-q})})};
  // the overall's colour: each side measured in typical spreads above or below the tier's average, so a record
  // strength counts in full; the weakest side's hole is capped at 1.5 spreads, so it can't sink two strong sides
  sc.zm=[0,1,2].map(function(k){return rows.reduce(function(t,r){return t+r[k]},0)/rows.length});
  sc.zs=[0,1,2].map(function(k){return Math.sqrt(rows.reduce(function(t,r){return t+(r[k]-sc.zm[k])*(r[k]-sc.zm[k])},0)/rows.length)||1});
  sc.o=rows.map(function(r){return ovRel(r,sc)}).sort(function(p,q){return p-q});
  sc.m=[0,1,2,3,4,5,6,7,8].map(function(k){return stl.reduce(function(t,g){return t+g[k]},0)/stl.length});
  sc.sd=sc.m.map(function(m,k){return Math.sqrt(stl.reduce(function(t,g){return t+(g[k]-m)*(g[k]-m)},0)/stl.length)||1});
  return (SCALE[key]=sc);
}
function bandOf(p){return p>=90?"gold":p>=75?"silver":p>=55?"bronze":p>=30?"":"poor"}
// colour of the class name: the fighter's own verdict when known (ordinary = "unripe" green), else the global one
function nameBand(r){return !r?"":r.own?(bandOf(r.own[3])||"ord"):bandOf(r.o)}
// Paths. The master is usually picked first, so a class is judged on its own merit: for each class of a stage we take
// the best way this fighter can reach it (every Specialty × Advanced combination for a master), and where the earlier
// stages are still empty the numbers use that best way too. Chosen earlier classes are used as chosen.
var PCACHE={};
function stageCands(n,s){return TIERS[s].list.map(function(c){return c[0]}).filter(function(c){return CG[c]&&!access(n,c).block})}
function modsOf(path,ti){var m=[null];for(var s=1;s<ti;s++)m.push(path[s]&&CG[path[s]]?CG[path[s]]:null);m[ti]=null;return m}
// best filling of the empty earlier stages for class cn on stage ti; fixed[s] = a chosen class or ""
function bestFill(u,ti,cn,fixed){
  var key="f|"+u.n+"|"+ti+"|"+cn+"|"+fixed.join(",")+"|"+S.cur+"|"+endLv(); if(PCACHE[key])return PCACHE[key];
  var sc=scaleOf(ti), best=null, path=fixed.slice();
  (function walk(s){
    if(s>=ti){var mods=modsOf(path,ti); mods[ti]=CG[cn];
      var v=rateIdx(withBonus(gainsTo(u,mods,ti),cn),CLS[cn]).v, rel=ovRel(v,sc);
      if(!best||rel>best.rel)best={rel:rel,path:path.slice()}; return}
    if(fixed[s]){walk(s+1);return}
    stageCands(u.n,s).forEach(function(c){path[s]=c;walk(s+1)}); path[s]="";
  })(1);
  return (PCACHE[key]=best||{rel:0,path:fixed.slice()});
}
function potential(u,ti,cn){ // the class at its best for this fighter, whatever was chosen before
  var key="p|"+u.n+"|"+ti+"|"+cn+"|"+S.cur+"|"+endLv(); if(PCACHE[key])return PCACHE[key];
  var f=bestFill(u,ti,cn,["","","",""]), mods=modsOf(f.path,ti), mx=axisMax(); mods[ti]=CG[cn];
  var sv=rateIdx(withBonus(gainsTo(u,mods,ti),cn),CLS[cn]).v.map(function(q,k){return 100*q/mx[k].v});
  return (PCACHE[key]=sv.concat(ovOf(sv)));
}
// the fighter's own range on a stage: worst to best class, each at its best; five equal steps between them
function ownRange(u,x,ti){
  var key="r|"+u.n+"|"+ti+"|"+(x.path[ti]||"")+"|"+S.cur+"|"+endLv(); if(PCACHE[key])return PCACHE[key];
  var lo=[1e9,1e9,1e9,1e9], hi=[-1e9,-1e9,-1e9,-1e9];
  TIERS[ti].list.forEach(function(c){
    var cn=c[0]; if(!CG[cn]||(access(u.n,cn).block&&cn!==x.path[ti]))return;
    potential(u,ti,cn).forEach(function(q,k){lo[k]=Math.min(lo[k],q);hi[k]=Math.max(hi[k],q)});
  });
  return (PCACHE[key]={lo:lo,hi:hi});
}
// place in the fighter's own range → a mark bandOf reads: top 20% gold, then silver, bronze, green, poor
function ownMark(q,lo,hi){var f=hi-lo<1e-6?1:(q-lo)/(hi-lo);return f>=0.8?95:f>=0.6?80:f>=0.4?60:f>=0.2?40:10}
function rateAt(u,x,ti,cn){
  var C=CLS[cn]; if(!C||!CG[cn]||ti<1||ti>3)return null;
  var fixed=["","","",""]; for(var s=1;s<ti;s++)fixed[s]=x&&x.path[s]&&CG[x.path[s]]?x.path[s]:"";
  var way=x&&x.n?bestFill(u,ti,cn,fixed).path:fixed, mods=modsOf(way,ti); mods[ti]=CG[cn];
  var st=withBonus(gainsTo(u,mods,ti),cn), ix=rateIdx(st,C), sc=scaleOf(ti);
  var mx=axisMax(), p=[0,1,2].map(function(k){return share(sc.a[k],ix.v[k])});
  var sv=ix.v.map(function(v,k){return 100*v/mx[k].v}), ov=ovOf(sv);
  var z=st.map(function(v,k){return (v-sc.m[k])/sc.sd[k]}), rel=ovRel(ix.v,sc), own=null;
  if(x&&x.n){var R=ownRange(u,x,ti), pot=potential(u,ti,cn);own=pot.map(function(q,k){return ownMark(q,R.lo[k],R.hi[k])})}
  var filled=[]; for(var s2=1;s2<ti;s2++)if(!fixed[s2]&&way[s2])filled.push(way[s2]);
  return {p:p,o:share(sc.o,rel),own:own,n:u.n,filled:filled,pts:sv.map(Math.round).concat(Math.round(ov)),z:z,mag:ix.mag,ti:ti};
}
var RT_SVG=['<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 14.1 8.3 20.9 5.5 17.1 11.3 22.8 15.1 15.7 15.3 16.4 22.5 12 16.8 7.6 22.5 8.3 15.3 1.2 15.1 6.9 11.3 3.1 5.5 9.9 8.3Z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 19.5C3.5 11 8.6 5.6 14.6 5.9" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M13 1.6 21 6.2 13.3 10.5Z"/><path d="M9.5 21C10.4 15.6 13.4 12.2 18.6 11.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6 20.6 4.6V11C20.6 16.6 16.9 20.6 12 22.6 7.1 20.6 3.4 16.6 3.4 11V4.6Z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8 14.9 8.6 22.2 9.2 16.6 14 18.3 21.2 12 17.4 5.7 21.2 7.4 14 1.8 9.2 9.1 8.6Z"/></svg>'];
function rtName(k){return [tr("Урон","Damage"),tr("Ухилення","Evasion"),tr("Захист","Defense"),tr("Загальна","Overall")][k]}
// the tooltip explains in words: how good the rating is, what lifts or drags it, and for the overall a hint how to use the fighter
var RT_WORD={m:[["дуже сильний","сильний","вище середнього","середній","слабкий"],["very strong","strong","above average","average","weak"]],
  n:[["дуже сильне","сильне","вище середнього","середнє","слабке"],["very strong","strong","above average","average","weak"]]};
function rtWord(p,g){var b=["gold","silver","bronze","","poor"].indexOf(bandOf(p));return LANG==="uk"?RT_WORD[g][0][b]:loc(RT_WORD[g][1][b])}
function cap(t){t=String(t);return t.charAt(0).toUpperCase()+t.slice(1)}
function rtTip(r,k){
  var z=r.z, hi=function(i){return z[i]>=0.75}, lo=function(i){return z[i]<=-0.75}, out=[];
  function say(i,up,dn){if(hi(i))out.push(up);else if(lo(i))out.push(dn)}
  if(k===0){
    var a=r.mag?2:1;
    say(a,r.mag?tr("сильна магія","strong magic"):tr("сильний удар","hits hard"),r.mag?tr("слабка магія","weak magic"):tr("слабкий удар","hits softly"));
    say(4,tr("часто б'є двічі","often hits twice"),tr("рідко б'є двічі","rarely hits twice"));
    say(3,tr("добре влучає, частіше критує","accurate, crits more"),tr("частіше маже","misses more"));
  } else if(k===1){
    say(4,tr("ворог часто мазатиме","foes will often miss"),tr("мала швидкість — легко влучити","slow, easy to hit"));
    say(5,tr("рідко ловить крити","rarely takes crits"),tr("часто ловить крити","prone to crits"));
  } else if(k===2){
    say(0,tr("багато HP","lots of HP"),tr("мало HP","little HP"));
    say(6,tr("тримає удари зброї","takes weapon hits well"),tr("зброя б'є боляче","weapons hurt"));
    say(7,tr("магія майже не бере","magic barely hurts"),tr("магія б'є боляче","magic hurts"));
  }
  var mine=r.own?"\n"+cap(tr("для ","for ")+r.n+tr(" серед усіх класів етапу — "," among all classes of the tier — ")+(function(q){return q>=90?tr("один із найкращих","one of the best"):
      q>=75?tr("сильний","strong"):q>=55?tr("середній","middling"):q>=30?tr("слабший","weaker"):tr("з найгірших","among the worst")})(r.own[k])):"";
  var cmp=cap(tr("краще за ","beats ")+(k<3?r.p[k]:r.o)+tr("% варіантів етапу","% of the tier's options"));
  if(k<3)return rtName(k)+" "+r.pts[k]+" — "+rtWord(r.p[k],k===1?"n":"m")+(out.length?"\n"+out.map(cap).join("\n"):"")+"\n"+cmp+mine;
  // overall: which sides carry the fighter, and what that means on the map
  var o=[0,1,2].sort(function(a,b){return r.pts[b]-r.pts[a]}), P=r.p, weak=o[2];
  var top=[0,1,2].filter(function(i){return P[i]>=75});
  var hint=Math.min(P[0],P[1],P[2])>=30&&Math.max(P[0],P[1],P[2])-Math.min(P[0],P[1],P[2])<=20?tr("Без слабких місць.","No weak spot."):
    P[o[0]]>=55&&P[o[1]]>=55?(weak===2?tr("Б'є й ухиляється, але удару не тримає — не лишай під кількома ворогами.","Hits and dodges but can't take a hit — don't leave them under several foes."):
      weak===1?tr("Б'є й тримає удари — можна йти в лоб, ухилятися не треба.","Hits and takes hits — can go head-on, no need to dodge."):
      tr("Мало б'є, зате тримає все — ставити в прохід чи на передову.","Hits little but holds everything — put them in a gap or up front.")):
    top.length===1?[r.mag?tr("Сильна магія, решта слабша — бити здалеку й відходити.","Strong magic, the rest is weaker — cast from range and pull back."):
        tr("Сильний удар, решта слабша — бити й відходити, не підставлятися.","Hits hard, the rest is weaker — strike and pull back."),
      tr("Добре ухиляється, решта слабша — відволікати ворогів.","Dodges well, the rest is weaker — draw the foes' attention."),
      tr("Тримає удари, решта слабша — стояти попереду й прикривати інших.","Takes hits, the rest is weaker — stand in front and cover the others.")][top[0]]:
    r.o<30?tr("У цьому класі слабко — краще пошукати інший.","Weak in this class — look for another."):tr("Нічим особливо не виділяється.","Nothing stands out.");
  var via=r.filled&&r.filled.length?"\n"+tr("Бали пораховані з найкращим шляхом до цього класу: ","Points assume the best way to this class: ")+r.filled.join(" → "):"";
  var head=LANG==="uk"?"Загальна "+r.pts[3]+" — "+rtWord(r.o,"m")+" вибір.":fmt(loc("Overall {n} — {w} choice."),{n:r.pts[3],w:rtWord(r.o,"m")});
  return head+"\n"+hint+via+"\n"+cmp+mine;
}
function rateStrip(r,small){
  if(!r)return "";
  return '<span class="rt'+(small?" sm":"")+'">'+[0,1,2,3].map(function(k){var p=k<3?r.p[k]:r.o, b=bandOf(p);
    return '<span class="rt-t'+(k===3?" rt-o":"")+(b?" rb-"+b:"")+'" role="img" title="'+esc(rtTip(r,k))+'" aria-label="'+esc(rtTip(r,k))+'">'+RT_SVG[k]+'<i class="sk-r'+(r.own?" pb-"+(bandOf(r.own[k])||"ord"):"")+'">'+r.pts[k]+'</i></span>'}).join("")+'</span>';
}
function relCls(rel,i,mx,v){return rel&&rel.r[i]===2?"rd":(rel&&rel.r[i]===1?"ri":(v===mx?"hi":""))}
function relTip(rel,i){return rel&&rel.r[i]?" · "+(rel.r[i]===2?tr("важливо для: ","key for: "):tr("допомагає: ","helps: "))+rel.why[i].join(", "):""}
// growth in a class: own growth + class modifier, with the modifier shown under the number
function classGrow(u,cn,rel){
  var mod=CG[cn]; if(!mod)return "";
  var vals=u.g.map(function(v,i){return Math.max(0,v+mod[i])}), mx=Math.max.apply(null,vals);
  return '<div class="grow cg">'+vals.map(function(v,i){var d=mod[i];
    return '<div class="g '+(rel&&rel.r[i]===2?"gd":(rel&&rel.r[i]===1?"gi":""))+'"><i class="'+relCls(rel,i,mx,v)+'" style="height:'+Math.max(4,v)+'%" title="'+STAT[i]+' '+u.g[i]+(d>=0?" +":" ")+d+" = "+v+'%'+relTip(rel,i)+'"></i>'+
      '<span><b>'+v+'</b><em class="'+(d>0?"up":(d<0?"dn":""))+'">'+(d>0?"+"+d:(d<0?d:"·"))+'</em></span></div>'}).join("")+'</div>';
}
// personal growths; highlighted for the highest stage that has a class
function growBars(u,rel){
  var mx=Math.max.apply(null,u.g);
  return '<div class="grow">'+u.g.map(function(v,i){return '<div class="g '+(rel&&rel.r[i]===2?"gd":(rel&&rel.r[i]===1?"gi":""))+'"><i class="'+relCls(rel,i,mx,v)+'" style="height:'+Math.max(4,v)+'%" title="'+STAT[i]+' '+v+'%'+relTip(rel,i)+'"></i><span><b>'+v+'</b>'+STAT[i]+'</span></div>'}).join("")+'</div>';
}
function usedMap(){var m={};team().forEach(function(x){x.path.forEach(function(c){if(c)(m[c]=m[c]||[]).push(x.n)})});return m}

// ---------- render ----------
function renderStatic(){
  document.documentElement.lang=LANG; document.documentElement.dir=LANG==="ar"?"rtl":"ltr";
  document.title=pick(T.title);
  document.querySelectorAll("[data-i18n]").forEach(function(el){el.textContent=pick(T[el.dataset.i18n])});
  $("q").placeholder=pick(T.q_ph);
  $("srcNote").innerHTML=pick(T.src);
  $("ttF").innerHTML='<option value="">'+tr("Будь-яка команда турніру","Any tournament team")+'</option>'+TTNAMES.map(function(t){return '<option value="'+t+'">'+ttName(t)+'</option>'}).join("");
  $("ttF").value=S.ttF||"";
  document.querySelectorAll(".lang button").forEach(function(b){var on=b.dataset.lang===LANG;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
}
function renderTabs(){
  $("tabs").innerHTML=LORDS.map(function(l){
    return '<button type="button" data-lord="'+l.id+'" class="'+(l.id===S.cur?"on":"")+'" aria-pressed="'+(l.id===S.cur)+'"><span>'+l.name+'</span><small>'+lordUa(l.id)+' · '+S.teams[l.id].length+tr(" бійців"," fighters")+'</small></button>';
  }).join("");
  var L=LORDS.filter(function(l){return l.id===S.cur})[0];
  document.body.dataset.lord=S.cur;
  $("teamName").textContent=L.name;
  var rc=routeClasses(S.cur);
  $("teamSub").innerHTML=tr("Загін: ","Lord: ")+lordUa(S.cur)+tr(" · класи маршруту: "," · path classes: ")+
    rc.ex.map(function(c){return '<b class="rc-ex">'+c+'</b>'}).concat(rc.un.map(function(c){return '<span class="rc-un">'+c+'</span>'})).join(", ");
  $("filter").options[0].textContent=tr("Доступні: ","Available to ")+lordUa(S.cur);
}
function renderLegend(){
  var html=
    '<span><b style="color:var(--plus)">'+tr("зелене","green")+'</b> — '+tr("схильність","strength")+'</span><span><b style="color:var(--minus)">'+tr("фіолетове","purple")+'</b> — '+tr("слабкість","weakness")+'</span>'+
    '<span class="ln lt">'+[[skTile("sw","pr"),tr("обрана пріоритетна","chosen priority")],[skTile("sw","own"),tr("зброя класу, можна зробити пріоритетною","the class's own, can be priority")],
      [skTile("sw","al"),tr("дозволена, але не зброя класу","allowed, not the class's own")],
      [skTile("sw","na"),tr("клас не дозволяє","not allowed")],[skTile("ax","","","up"),tr("рамка — схильність","frame — strength")],
      [skTile("ax","","","dn"),tr("рамка — слабкість","frame — weakness")],[skTile("sp","","C"),tr("ранг для іспиту","exam rank")]]
      .map(function(p){return '<span>'+p[0]+p[1]+'</span>'}).join("")+'</span>'+
    '<span><i class="sw-rd"></i>'+tr("приріст, важливий для обраної зброї","growth key for the chosen weapons")+'</span><span><i class="sw-ri"></i>'+tr("допомагає їй","helps them")+'</span>'+
    '<span class="ln lt">'+[0,1,2,3].map(function(k){return '<span><span class="rt-t'+(k===3?" rt-o":"")+'">'+RT_SVG[k]+'</span>'+rtName(k)+'</span>'}).join("")+
      '<span>'+tr("бали з 100 (100 — найкраще можливе в грі до рівня кінця): урон = Сил або Маг + ½ Шв + 0,35 Спр · ухилення = Шв + 0,4 Уд · захист = ½ HP + Зах + Оп · загальна = (дві найкращі + ½ найслабшої) / 2,5; відсотки — у підказці",
        "points of 100 (100 — the best possible in the game by the end level): damage = Str or Mag + ½ Spd + 0.35 Dex · evasion = Spd + 0.4 Lck · defense = ½ HP + Def + Res · overall = (the two best + ½ the weakest) / 2.5; percentages are in the tooltip")+'</span></span>'+
    '<span class="ln">'+tr("тло плитки — порівняння з усіма бійцями; колір числа й назви класу — з іншими класами цього ж бійця на етапі (золото — найкращий варіант для бійця): ",
      "tile — compared with every fighter; the colour of the number and the class name — with the same fighter's other classes on the tier (gold is their best option): ")+'<b style="color:var(--gold)">'+tr("золото","gold")+'</b> 90+ · <b style="color:var(--silver)">'+tr("срібло","silver")+'</b> 75+ · '+
      '<b style="color:var(--bronze)">'+tr("бронза","bronze")+'</b> 55+ · <b>'+tr("звичайна","ordinary")+'</b> 30+ ('+tr("число — ","its number is ")+'<b style="color:var(--unripe)">'+tr("зелене, «недозріле»","green, “not ripe yet”")+'</b>) · <b style="color:var(--block)">'+tr("погана","poor")+'</b>'+
      tr(" · стати накопичуються по шляху: до 20 рівня власний ріст, далі з модифікатором класу, плюс бонус статів класу, в якому боєць зараз; спец. оцінюю на 35 рівні, прос. на 45, майстра на рівні ",
         " · stats build up along the path: own growth up to level 20, then with the class modifier, plus the stat bonus of the class the fighter is in; Specialty is judged at 35, Advanced at 45, Master at level ")+
      '<input type="number" id="endLv" min="46" max="99" value="'+endLv()+'" aria-label="'+tr("Рівень кінця гри","End-game level")+'"></span>';
  var open=$("legend").dataset.open; if(open==null)open=innerWidth>700?"1":"";
  $("legend").innerHTML='<details'+(open?' open':'')+'><summary>'+tr("Легенда","Legend")+'</summary><div class="lg">'+html+'</div></details>';
  $("legend").querySelector("details").addEventListener("toggle",function(){$("legend").dataset.open=this.open?"1":""});
}
function renderTeam(){
  PCACHE={};
  $("team").innerHTML=team().map(function(x,i){
    var u=BY[x.n]; if(!u)return "";
    var sx=sxOf(x.n), anyBad=false, anyDup=false;
    // the planner goes Specialty → Advanced → Master; Beginner carries nothing to plan and Divine is only in the class list
    var stages=[1,2,3].map(function(ti){var cn=x.path[ti];
      var c=CLS[cn], fl=[], key=i+"-"+ti, open=OPEN===key, clash=false, a=null;
      if(c){
        a=access(x.n,cn); var dup=holders(cn,x.n);
        if(a.block){fl.push('<span class="warn">⛔ '+a.block+'</span>');anyBad=true}
        if(a.warn)fl.push('<span class="warn">'+a.warn+'</span>');
        if(dup.length&&!a.block){
          var main=mainHolder(cn);
          if(main!==x.n){fl.push('<span class="warn">'+tr("дубль · головний: ","duplicate · main: ")+main+'</span>');anyDup=true;clash=true}
        }
      }
      var rt=c?rateAt(u,x,ti,cn):null, rb=nameBand(rt);
      return '<div class="stage'+(c?"":" empty")+(open?" open":"")+(clash||(a&&a.block)?" clash":"")+(rb&&!clash&&!(a&&a.block)?" rb-"+rb:"")+'">'+
        // stage name with the picker arrow under it on the left, so the class and its skills get the full width
        '<div class="st-row"><div class="st-l"><span class="st-t" title="'+STAGE[ti]+' · '+treq(ti)+'">'+STAGE_S[ti]+'</span>'+
          '<button type="button" class="pick" data-pick="'+key+'" aria-expanded="'+open+'" aria-label="'+STAGE[ti]+tr(": обрати клас",": choose class")+'">▾</button></div>'+
          '<span class="st-v">'+(c?'<b'+(rt?' title="'+rtTip(rt,3)+'"':'')+'>'+c.name+'</b>'+rateStrip(rt)+reqLine(c,u,x,ti,i):'<span class="muted">—</span>')+'</span></div>'+
        (c&&(fl.length||restr(c))?'<div class="st-note">'+restr(c)+(fl.length?'<div class="fit">'+fl.join("")+'</div>':'')+'</div>':'')+
        (c?classGrow(u,cn,relAt(x,ti)):'')+
        '<div class="drawer"'+(open?'':' hidden')+'>'+(open?pickList(x.n,cn,ti,i):'')+'</div>'+
      '</div>';
    }).join("");
    var cant=!(joinInfo(u,S.cur).ok||u.JJ[LI[S.cur]]==="L");
    return '<article class="card'+(anyDup?" dup":"")+(anyBad||cant?" bad":"")+'">'+
      '<div class="c-top">'+
        '<div class="c-line"><span class="c-name">'+esc(u.n)+'</span>'+
          (sxEditable(x.n)
            ?'<span class="sx" role="group" aria-label="'+tr("Стать","Gender")+'">'+[["f","♀"],["m","♂"],["","?"]].map(function(s){
               return '<button type="button" data-sx="'+s[0]+'" data-n="'+esc(x.n)+'" class="'+(sx===s[0]?"on":"")+'" aria-pressed="'+(sx===s[0])+'">'+s[1]+'</button>'}).join("")+'</span>'
            :'<span class="c-sx" title="'+(sx==="f"?tr("жінка","woman"):tr("чоловік","man"))+'">'+(sx==="f"?"♀":"♂")+'</span>')+
          chips(u)+'</div>'+
        // right side: the remove button; the game's own squad stays fixed
        '<div class="c-right">'+
        (fixedIn(u,S.cur)?'<span class="c-story" role="img" title="'+tr("Сюжет: гра дає цього бійця автоматично, прибрати не можна","Story: the game gives you this fighter, it can't be removed")+
          '" aria-label="'+tr("Сюжетний боєць","Story fighter")+'">'+STORY_SVG+'</span>'
          :'<button type="button" class="round" data-rm="'+i+'" aria-label="'+tr("Прибрати ","Remove ")+esc(u.n)+'" title="'+tr("Прибрати","Remove")+'">−</button>')+'</div></div>'+
      // under the name: age and, when it is not the squad being built, the home squad; recruit conditions on the right
      '<div class="c-sub"><span class="c-age" title="'+tr("Вік до перестрибування в часі","Age before the timeskip")+'">'+(ageTxt(x.n)?ageTxt(x.n)+tr(" р."," y")+(ageBand(x.n)==="long"?tr(sxOf(x.n)==="f"?" · довгожителька":" · довгожитель"," · long-lived"):""):tr("вік ?","age ?"))+'</span>'+
        (u.t&&u.t!==S.cur?'<span class="tag lock">'+home(u.t)+'</span>':'')+recTag(u)+'</div>'+
      (cant?'<div class="warn">⛔ '+lordUa(S.cur)+tr(" не може його завербувати"," cannot recruit this fighter")+'</div>':'')+
      growBars(u,relAt(x,x.path[3]?3:(x.path[2]?2:1)))+
      '<div class="path">'+stages+'</div>'+
      (x.path.slice(1,4).some(function(c){return c})?'<button type="button" class="ghost clear-all" data-clear="'+i+'">'+tr("Очистити класи","Clear classes")+'</button>':'')+
      progression(x,u)+
      '<div class="ability"><b>'+esc(ability(u).split(":")[0])+'</b>'+(ability(u).indexOf(":")>0?":"+esc(ability(u).slice(ability(u).indexOf(":")+1)):"")+'</div>'+
    '</article>';
  }).join("")||'<p class="src">'+tr("Загін порожній — додай бійців зі списку нижче.","The squad is empty — add fighters from the list below.")+'</p>';
  // squad summary: headcount by gender and age, then per stage how many fighters use each skill
  var f=0,mm=0,q=0,ab={young:0,mid:0,old:0,long:0,"?":0};
  team().forEach(function(x){
    var s=sxOf(x.n); if(s==="f")f++;else if(s==="m")mm++;else q++;
    ab[ageBand(x.n)]++;
  });
  // one fixed column per skill so the stages line up; weapons also show how many hold them as priority
  var head='<tr><th></th>'+GROUPS.map(function(g){return '<th colspan="'+g[1].length+'" class="gh">'+pick(g[0])+'</th>'}).join("")+'<th></th></tr>'+
    '<tr><th></th>'+GROUPS.map(function(g){return g[1].map(function(k,j){
      return '<th class="sk-h'+(j===0?" gs":"")+'" title="'+SK[k]+'">'+ic(k)+'<span>'+SK[k]+'</span></th>'}).join("")}).join("")+'<th class="nc">'+tr("без класу","no class")+'</th></tr>';
  var body=[1,2,3].map(function(ti){
    var use={},pri={},none=0;
    team().forEach(function(x){
      // an empty stage means the fighter stays in his previous class (e.g. keeps the Specialty class through Advanced)
      var src=ti; while(src>=1&&!x.path[src])src--;
      var c=src>=1?CLS[x.path[src]]:null; if(!c){none++;return}
      // no riding and no flying: the class fights on foot, so it counts as infantry
      var sk=c.w.slice(); prioAt(x,src).forEach(function(k){if(sk.indexOf(k)<0)sk.push(k)});
      if(sk.indexOf("ri")<0&&sk.indexOf("fl")<0&&sk.indexOf("in")<0)sk.push("in");
      sk.forEach(function(k){(use[k]=use[k]||[]).push(x.n+(src<ti?" ("+c.name+")":""))});
      prioAt(x,src).forEach(function(k){(pri[k]=pri[k]||[]).push(x.n)})});
    return '<tr><th class="st" title="'+STAGE[ti]+'">'+STAGE_S[ti]+'</th>'+GROUPS.map(function(g){return g[1].map(function(k,j){
      var n=use[k]?use[k].length:0, p=pri[k]?pri[k].length:0;
      return '<td class="'+(j===0?"gs":"")+(n?"":" z")+'" title="'+(n?use[k].join(", "):"")+(p?tr(" · пріоритет: "," · priority: ")+pri[k].join(", "):"")+'">'+
        // one white number when everyone holding it has it as priority; otherwise "total / priority"
        (n?'<b>'+n+'</b>'+(PHYS.indexOf(k)>=0&&p!==n?' / <span class="pr">'+p+'</span>':''):'−')+'</td>'}).join("")}).join("")+
      '<td class="nc">'+(none||'−')+'</td></tr>';
  }).join("");
  $("tstats").innerHTML='<div class="ts-head"><span class="ts-g"><b>'+team().length+'</b>'+tr(" бійців"," fighters")+' · ♂ <b>'+mm+'</b> · ♀ <b>'+f+'</b>'+(q?' · ? <b>'+q+'</b>':'')+'</span>'+
    '<span class="ts-g"><span title="'+tr("18 і менше","18 and under")+'">'+tr("підлітки","teens")+'</span> <b>'+ab.young+'</b> · <span title="19–31">'+tr("молоді","young")+'</span> <b>'+ab.mid+'</b> · <span title="32+">'+tr("дорослі","adults")+'</span> <b>'+ab.old+'</b>'+
      (ab.long?' · <span title="'+tr("понад 100 років","over 100 years")+'">'+tr("довгожителі","long-lived")+'</span> <b>'+ab.long+'</b>':'')+(ab["?"]?' · '+tr("невідомо","unknown")+' <b>'+ab["?"]+'</b>':'')+'</span></div>'+
    '<div class="ts-tbl"><table>'+head+body+'</table></div>';
  var distinct={};team().forEach(function(x){counted(x).forEach(function(c){distinct[c]=1})});
  $("meter").textContent=team().length+tr(" бійців · "," fighters · ")+Object.keys(distinct).length+tr(" різних класів (просунуті й майстер)"," distinct classes (Advanced & Master)");
}
// after the recruit line of the fighter list: how every path recruits them, as a small table
// (soonest path on green with ★); the mark is green when another path gets them sooner than the open lord's
var PATHS_SVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15V8.5M8 8.5 3.5 4.5V1.8M8 8.5l4.5-4M1.8 3.4 3.5 1.6 5.2 3.4M10.6 2.4h2.6v2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function pathRows(u){
  var rows=LORDS.map(function(l){return {id:l.id,s:u.JJ[LI[l.id]],w:joinWhen(u,l.id)}});
  var can=rows.filter(function(r){return r.w}).sort(function(a,b){return cmpWhen(a.w,b.w)});
  var cur=rows.filter(function(r){return r.id===S.cur})[0], best=can.length?can[0].w:null;
  return {all:can.concat(rows.filter(function(r){return !r.w})),best:best,cur:cur,sooner:!!(cur.w&&best&&best[0]<cur.w[0])};
}
function pathsMark(u){
  var P=pathRows(u);
  if(!P.all.some(function(r){return r.id!==S.cur&&r.w}))return "";
  if(u.JJ.every(function(s){return s===u.JJ[0]}))return ""; // the same on every path
  var label=(P.sooner?tr("На іншому маршруті — раніше","Sooner on another path")+". ":"")+tr("Вербування на кожному маршруті (★ — найраніше)","Recruiting on each path (★ soonest)");
  return '<span class="paths'+(P.sooner?" sooner":"")+'" tabindex="0" role="img" aria-label="'+esc(label)+'" data-paths="'+esc(u.n)+'">'+PATHS_SVG+'</span>';
}
// the card behind the mark. An extra condition shared by every path is written once under the table,
// a column appears only when the paths ask for different things (often different gold)
function pathsCard(u){
  var P=pathRows(u), best=P.best;
  var cond=function(c){var t=extra(c);return LANG==="en"?t.replace(" to "+u.n,""):t};
  var conds=P.all.filter(function(r){return r.w&&r.s.indexOf("/")>0}).map(function(r){return r.s.split("/")[3]||""});
  var same=conds.length>0&&conds.every(function(c){return c===conds[0]}), col=!same&&conds.length>0;
  var ch=tr("Гл. ","Ch. ").trim(), n=col?6:5;
  var h='<table class="pc"><thead><tr><th>'+tr("Маршрут","Path")+'</th><th class="n">'+ch+'</th><th class="n">'+tr("Підтримка ","Support ").trim()+
    '</th><th class="n">'+tr("Слава ","Renown ").trim()+'</th><th class="n">≈ '+ch+'</th>'+(col?'<th>'+tr("Умова","Condition")+'</th>':'')+'</tr></thead><tbody>';
  P.all.forEach(function(r){
    var top=r.w&&r.w[0]===best[0], s=r.s;
    h+='<tr class="'+(top?"best":"")+(r.id===S.cur?" cur":"")+'"><td class="ln">'+(top?"★ ":"")+esc(lordUa(r.id))+'</td>';
    if(!r.w||s==="P")h+='<td colspan="'+(n-1)+'" class="na">'+esc(joinInfo(u,r.id).txt)+'</td>';
    else if(s[0]==="a")h+='<td class="n">'+r.w[3]+'</td><td colspan="2" class="na">'+tr("автоматично","automatic")+'</td><td class="n">'+r.w[0]+'</td>'+(col?'<td></td>':'');
    else{var p=s.split("/");
      h+='<td class="n">'+p[0]+'</td><td class="n">'+p[1]+'</td><td class="n">'+p[2]+'</td><td class="n'+(r.w[0]>r.w[3]?" late":"")+'">'+r.w[0]+'</td>'+
        (col?'<td class="cd">'+esc(p[3]?cond(p[3]):"—")+'</td>':'');}
    h+='</tr>';
  });
  return (P.sooner?'<div class="pc-s">'+tr("На іншому маршруті — раніше","Sooner on another path")+'</div>':'')+
    '<div class="pc-h">'+tr("Вербування на кожному маршруті (★ — найраніше)","Recruiting on each path (★ soonest)")+'</div>'+h+'</tbody></table>'+
    (same&&conds[0]?'<div class="pc-x">'+tr("Умова","Condition")+': '+esc(cond(conds[0]))+'</div>':'')+
    '<div class="pc-n">'+tr("Слава росте повільно: приблизно 4 до Гл. 5, 8 до Гл. 8, 10 до Гл. 10","Renown grows slowly: about 4 by Ch. 5, 8 by Ch. 8, 10 by Ch. 10")+
    (P.all.some(function(r){return r.w&&r.w[0]>r.w[3]})?'; '+tr("помаранчеве «≈ Гл.» — пізніше через славу","orange “≈ Ch.” — later because of renown"):'')+'</div>';
}
function renderPool(){
  var q=(S.q||"").trim().toLowerCase();
  var list=U.filter(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n);
    if(S.filter==="avail"&&!ji.ok&&where!==S.cur)return false;
    if(S.filter==="free"&&where)return false;
    if(S.sxF&&sxOf(u.n)!==S.sxF)return false;
    if(S.ttF&&TT[u.n]!==S.ttF)return false;
    if(!q)return true;
    return (u.n+" "+u.F.map(function(k){return SK[k]}).join(" ")+" "+ability(u)).toLowerCase().indexOf(q)>=0;
  });
  $("pool").innerHTML=list.map(function(u){
    var ji=joinInfo(u,S.cur), where=lordOf(u.n), btn;
    if(where===S.cur)btn='<span class="tag">'+tr("у загоні","in squad")+'</span>';
    else if(where)btn='<button type="button" class="round" disabled title="'+tr("Вже в іншому загоні","Already in another squad")+'" aria-label="'+tr("Зайнятий","Taken")+'">+</button>';
    else if(!ji.ok)btn='<button type="button" class="round" disabled title="'+tr("Цей лідер не може завербувати","This lord cannot recruit them")+'" aria-label="'+tr("Недоступний","Unavailable")+'">+</button>';
    else btn='<button type="button" class="round add" data-add="'+esc(u.n)+'" title="'+tr("Додати в загін","Add to squad")+'" aria-label="'+tr("Додати ","Add ")+esc(u.n)+'">+</button>';
    return '<div class="row'+(where?" in":"")+'">'+
      '<div class="r-head"><span class="r-name">'+esc(u.n)+' <span class="tag"><b class="sxb">'+({f:"♀",m:"♂"}[sxOf(u.n)]||"?")+'</b>'+(ageTxt(u.n)?" · "+ageTxt(u.n)+tr(" р."," y"):"")+'</span></span>'+btn+'</div>'+
      '<div class="c-meta">'+homeTag(u)+uniqBadge(u)+'</div>'+
      '<div class="chips">'+chips(u)+'</div>'+
      '<div class="join'+(ji.ok?"":" no")+'">'+lordUa(S.cur)+': '+esc(ji.txt)+pathsMark(u)+'</div>'+
    '</div>';
  }).join("")||'<p class="src">'+tr("Нікого не знайдено.","Nobody found.")+'</p>';
}
function renderClassTools(){
  var names=team().map(function(x){return x.n});
  if(S.forU&&names.indexOf(S.forU)<0)S.forU="";
  $("forU").innerHTML='<option value="">'+tr("Для всього загону","For the whole squad")+'</option>'+names.map(function(n){return '<option value="'+esc(n)+'"'+(n===S.forU?" selected":"")+'>'+tr("Для: ","For: ")+esc(n)+'</option>'}).join("");
  $("tierF").innerHTML='<option value="">'+tr("Усі рівні","All tiers")+'</option>'+[1,2,3,4].map(function(i){return '<option value="'+i+'"'+(String(i)===S.tierF?" selected":"")+'>'+tname(i)+'</option>'}).join("");
  $("hideBlocked").checked=!!S.hideB;
}
function renderTiers(){
  var m=usedMap(), open=S.open||{1:1,2:1};
  var one=S.forU||null, ou=one?BY[one]:null;
  $("tiers").innerHTML=[1,2,3,4].filter(function(ti){return !S.tierF||String(ti)===S.tierF}).map(function(ti){
    var t=TIERS[ti], cells=[], used=0, list=t.list.filter(function(c){return !offPath(c[0])});
    list.forEach(function(c){
      var C=CLS[c[0]], who=C.x.div?(holdersAll(c[0],null).length?holdersAll(c[0],null):null):m[c[0]], st="", why="";
      if(who)used++;
      // who can take it at all: in principle, then in this squad
      var rule=ruleOf(C);
      if(one){
        var a=access(one,c[0]);
        if(S.hideB&&a.block)return;
        why=a.block?'<div class="why warn">⛔ '+one+tr(" не може: "," can't: ")+a.block+'</div>'
                   :'<div class="why good">'+one+tr(" може"," can")+(a.warn?' · <span class="warn">'+a.warn+'</span>':'')+'</div>';
        if(a.block)st="st-block";
      } else {
        var can=[],no=[],unk=[];
        team().forEach(function(x){var a=access(x.n,c[0]);if(a.block)no.push(x.n+" ("+a.block+")");else if(a.warn)unk.push(x.n);else can.push(x.n)});
        if(S.hideB&&!can.length&&!unk.length)return;
        if(!can.length&&!unk.length)st="st-block";
        if(C.x.div&&who&&!m[c[0]]&&!can.length)why='';
        else why='<div class="why">'+(can.length===team().length?'<span class="good">'+tr("можуть усі в загоні","everyone in the squad can")+'</span>':
             (can.length?'<span class="good">'+tr("можуть: ","can: ")+can.join(", ")+'</span>':(unk.length?'':'<span class="warn">'+tr("у загоні ніхто","nobody in the squad")+'</span>')))+
             (unk.length?(can.length?'<br>':'')+'<span class="warn">'+tr("вкажи стать: ","set gender: ")+unk.join(", ")+'</span>':'')+
             (no.length&&no.length<=3?'<br><span>'+tr("не можуть: ","can't: ")+no.join(", ")+'</span>':'')+'</div>';
      }
      cells.push('<div class="cl'+(who?" used":"")+(st?" "+st:"")+'"><div class="t">'+c[0]+'</div>'+
        '<div class="lbl">'+rule+'</div>'+
        reqLine(C,ou)+restr(C)+
        (who?'<div class="who">'+tr("зайнято: ","taken: ")+who.join(", ")+'</div>':'')+why+
      '</div>');
    });
    return '<details class="tier" data-t="'+ti+'"'+(open[ti]||S.tierF?" open":"")+'><summary><b>'+tname(ti)+'</b><span>'+tr("зайнято ","taken ")+used+tr(" з "," of ")+list.length+' · '+treq(ti)+'</span></summary><div class="cls">'+
      (cells.join("")||'<p class="src">'+tr("Тут нічого не підходить.","Nothing fits here.")+'</p>')+'</div></details>';
  }).join("");
}
function planSum(p){
  var n=0,w=0;
  LORDS.forEach(function(l){(p.teams&&p.teams[l.id]||[]).forEach(function(x){n++;(x.path||[]).forEach(function(c){if(c)w++})})});
  return fmt(tr("бійців: {n} · обрано класів: {w}","{n} fighters · {w} classes chosen"),{n:n,w:w});
}
function renderSlots(){
  var h='<span class="lb">'+tr("План","Plan")+'</span>';
  for(var i=0;i<NSLOTS;i++){
    var on=i===S.slot, p=S.slots[i];
    var tip=fmt(tr("План {n}","Plan {n}"),{n:i+1})+" · "+
      (on?tr("відкритий зараз","open now"):(p?planSum(p):tr("порожній — почнеться з нуля","empty — starts from scratch")))+
      " · "+tr("зберігається сам, у цьому браузері","saved automatically in this browser");
    h+='<button type="button" data-slot="'+i+'" class="'+(on?"on":(p?"":"empty"))+'" aria-pressed="'+on+'" title="'+esc(tip)+'">'+(i+1)+'</button>';
  }
  h+='<button type="button" id="exportBtn" title="'+esc(tr("Усі чотири плани в одному файлі · на резерв або щоб переслати",
      "All four plans in one file · to keep as a backup or send to a friend"))+'">'+tr("Експорт","Export")+'</button>'+
    '<button type="button" id="importBtn" title="'+esc(tr("Завантажити плани з файлу · замінить усі чотири плани тут",
      "Load plans from a file · replaces all four plans here"))+'">'+tr("Імпорт","Import")+'</button>';
  $("slots").innerHTML=h; $("slots").setAttribute("aria-label",tr("Слоти збереження","Save slots"));
}
function renderAll(){renderStatic();renderSlots();renderLegend();renderTabs();renderTeam();renderPool();renderClassTools();renderTiers()}

// ---------- events ----------
// a language loads on its first click; when flags are clicked quickly, the last click wins
var LANG_WANT=null;
document.querySelector(".lang").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
  var l=b.dataset.lang; LANG_WANT=l;
  withLang(l,function(){if(LANG_WANT!==l)return;LANG=l;S.lang=LANG;setLangTables();save();renderAll()})});
$("legend").addEventListener("change",function(e){if(e.target.id!=="endLv")return;S.endLv=+e.target.value;S.endLv=endLv();save();renderAll()});
// tooltips: titles become a small card, one fact per line (" · " separates facts); on touch screens a tap shows it.
// The recruit-paths mark (data-paths) gets a table instead
(function(){
  var tip=document.createElement("div"), cur=null, timer=null;
  tip.className="tip"; tip.setAttribute("role","tooltip"); tip.hidden=true; document.body.appendChild(tip);
  function textOf(el){if(el.hasAttribute("title")){el.dataset.tip=el.getAttribute("title");el.removeAttribute("title")}return el.dataset.tip||""}
  function hide(){tip.hidden=true;cur=null}
  function show(el){
    var pc=el.dataset.paths, t=pc?"":textOf(el); if(!pc&&!t){hide();return}
    cur=el; tip.classList.toggle("pcard",!!pc); tip.dir=document.documentElement.dir||"ltr";
    if(pc)tip.innerHTML=pathsCard(BY[pc]); else tip.textContent=t.replace(/ · /g,"\n");
    tip.hidden=false;
    var r=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
    var x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8), y=r.bottom+8;
    if(y+h>innerHeight-8)y=r.top-h-8;
    tip.style.left=x+"px"; tip.style.top=Math.max(8,y)+"px";
  }
  var TIPPED="[title],[data-tip],[data-paths]";
  document.addEventListener("mouseover",function(e){var el=e.target.closest&&e.target.closest(TIPPED);if(el!==cur){if(el)show(el);else hide()}});
  document.addEventListener("focusin",function(e){var el=e.target.closest&&e.target.closest(TIPPED);if(el)show(el)});
  document.addEventListener("focusout",hide);
  window.addEventListener("scroll",hide,true);
  document.addEventListener("touchstart",function(e){var el=e.target.closest&&e.target.closest(TIPPED);
    if(el){show(el);clearTimeout(timer);timer=setTimeout(hide,el.dataset.paths?9000:4000)}else hide()},{passive:true});
})();
$("slots").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;
  if(b.dataset.slot!=null)useSlot(+b.dataset.slot);
  else if(b.id==="exportBtn")exportPlans();
  else if(b.id==="importBtn")$("importFile").click()});
$("importFile").addEventListener("change",function(){var f=this.files&&this.files[0];this.value="";if(!f)return;
  if(f.size>2e6){notOurFile();return}
  var rd=new FileReader();rd.onload=function(){importPlans(String(rd.result))};rd.readAsText(f)});
$("tabs").addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;S.cur=b.dataset.lord;S.forU="";OPEN=null;save();renderAll()});
// add/remove a weapon from the stage's priority set; the last one cannot be removed
function toggleMain(el){
  var p=el.dataset.main.split("-"), x=team()[+p[0]], ti=+p[1], k=p[2];
  var cur=prioAt(x,ti).slice(), at=cur.indexOf(k);
  if(at>=0){if(cur.length===1)return;cur.splice(at,1)}else cur.push(k);
  x.main=x.main||{}; x.main[ti]=cur;
  save();renderTeam();
}
$("team").addEventListener("keydown",function(e){var m=e.target.closest("[data-main]");if(m&&(e.key==="Enter"||e.key===" ")){e.preventDefault();toggleMain(m)}});
$("team").addEventListener("click",function(e){
  var m=e.target.closest("[data-main]"); if(m){toggleMain(m);return}
  var b=e.target.closest("button"); if(!b)return;
  if(b.dataset.clear!==undefined){var xc=team()[+b.dataset.clear];xc.path=["","","","",""];xc.main={};OPEN=null;save();renderTeam();renderTiers();return}
  if(b.dataset.pick){OPEN=OPEN===b.dataset.pick?null:b.dataset.pick;renderTeam();return}
  if(b.dataset.set){var p=b.dataset.set.split("-"),xs=team()[+p[0]];xs.path[+p[1]]=b.dataset.c;
    if(xs.main)delete xs.main[+p[1]]; // new class: back to the default priority
    OPEN=null;save();renderTeam();renderTiers();return}
  if(b.dataset.rm!==undefined){if(fixedIn(BY[team()[+b.dataset.rm].n],S.cur))return;OPEN=null;team().splice(+b.dataset.rm,1);save();renderAll();return}
  if(b.dataset.sx!==undefined){S.sx[b.dataset.n]=b.dataset.sx;save();renderTeam();renderTiers()}
});
$("pool").addEventListener("click",function(e){var n=e.target.dataset.add;if(!n||lordOf(n))return;team().push({n:n,path:["","","","",""]});save();renderAll()});
$("q").value=S.q||""; $("filter").value=S.filter||"avail";
$("q").addEventListener("input",function(){S.q=this.value;save();renderPool()});
$("filter").addEventListener("change",function(){S.filter=this.value;save();renderPool()});
$("ttF").addEventListener("change",function(){S.ttF=this.value;save();renderPool()});
$("sxF").value=S.sxF||"";
$("sxF").addEventListener("change",function(){S.sxF=this.value;save();renderPool()});
$("forU").addEventListener("change",function(){S.forU=this.value;save();renderTiers()});
$("tierF").addEventListener("change",function(){S.tierF=this.value;save();renderTiers()});
$("hideBlocked").addEventListener("change",function(){S.hideB=this.checked;save();renderTiers()});
$("tiers").addEventListener("toggle",function(e){var t=e.target.dataset&&e.target.dataset.t;if(t==null||S.tierF)return;S.open=S.open||{1:1,2:1};
  if(e.target.open)S.open[t]=1;else delete S.open[t];save()},true);
withLang(LANG,renderAll);
