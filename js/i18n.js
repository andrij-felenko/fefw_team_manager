// Fire Emblem: Fortune's Weave squad planner: languages. Loaded first, then js/data.js and js/app.js.
// ---------- language ----------
// every visible string exists in Ukrainian and English; tr(uk, en) picks the current one
var LANG="en";
// Languages are listed by how many people it is the national language of (the population of the countries and regions
// where it is the nation's own language, e.g. Ireland for Irish, Wales for Welsh, plus the people living abroad), roughly, largest first.
// Ukrainian and English are written in the code as tr("uk","en") pairs; the other languages look the English text up
// in L10N (one file per language in js/l10n/), falling back to English when a phrase is missing
var LANGS=[["en","English"],["es","Español"],["ar","العربية"],["pt","Português"],["de","Deutsch"],["fr","Français"],["tr","Türkçe"],["it","Italiano"],["uk","Українська"],["pl","Polski"],["nl","Nederlands"],["ro","Română"],["hu","Magyar"],["el","Ελληνικά"],["cs","Čeština"],["sv","Svenska"],["be","Беларуская"],["ga","Gaeilge"],["da","Dansk"],["nb","Norsk"],["fi","Suomi"],["ka","ქართული"],["lt","Lietuvių"],["cy","Cymraeg"],["crh","Qırımtatarca"]];
// phrases of the other languages: js/l10n/<code>.js, loaded the first time that language is used
var L10N={};
function loc(en){if(LANG==="en")return en;var d=L10N[LANG];return d&&d[en]!=null?d[en]:en}
function tr(uk,en){return LANG==="uk"?uk:loc(en)}
function pick(a){return LANG==="uk"?a[0]:loc(a[1])}
// runs cb once the language's phrases are in (at once for English, Ukrainian and languages already loaded);
// if the file can't be loaded the page stays in English rather than breaking
function withLang(l,cb){
  if(l==="en"||l==="uk"||L10N[l]||!LANGS.some(function(p){return p[0]===l})){cb();return}
  var sc=document.createElement("script"); sc.src="js/l10n/"+l+".js";
  sc.onload=sc.onerror=function(){cb()};
  document.head.appendChild(sc);
}
function fmt(t,o){return t.replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m})}
var T={
  h_squad:["Загін","Squad"], h_all:["Усі бійці","All fighters"], h_classes:["Класи","Classes"],
  f_free:["Ще ні в якому загоні","Not in any squad yet"], f_all:["Усі","Everyone"],
  sx_any:["Будь-яка стать","Any gender"], sx_f:["♀ Жінки","♀ Women"], sx_m:["♂ Чоловіки","♂ Men"],
  hide_blocked:["сховати недоступні","hide unavailable"],
  q_ph:["Пошук за іменем або навичкою (сокира, політ…)","Search by name or skill (axe, flying…)"],
  title:["Heroic Games · конструктор","Heroic Games · squad planner"],
  src:['Фанатський планувальник, не пов\'язаний з Nintendo чи Intelligent Systems. Дані: сторінки персонажів і класів <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, вимоги класів і умови вербування <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, стать і вік <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> і <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, обмеження <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; вересень 2026. Ранги — мінімум для іспиту (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Приріст у класі = власний приріст + надбавка класу (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Вік — до перестрибування в часі. Боєць може бути лише в одному загоні. Усе зберігається лише в цьому браузері.',
       'Fan-made planner, not affiliated with Nintendo or Intelligent Systems. Data: character and class pages on <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, class requirements and recruitment conditions from <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, gender and age from <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> and <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, restrictions from <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; September 2026. Ranks are the exam minimum (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Growth in a class = personal growth + class modifier (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Ages are before the timeskip. A fighter can be in one squad only. Everything is saved in this browser only.']
};
var SK,STAT,STAGE,STAGE_S;
var SK_UK={sw:"меч",sp:"спис",ax:"сокира",bo:"лук",br:"рукопашка",wm:"біла магія",bm:"чорна магія",au:"підтримка",he:"броня",ri:"їзда",fl:"політ",in:"піхота"};
var SK_EN={sw:"sword",sp:"spear",ax:"axe",bo:"bow",br:"brawling",wm:"white magic",bm:"black magic",au:"authority",he:"heavy armor",ri:"riding",fl:"flying",in:"infantry"};
var STAT_UK=["HP","Сил","Маг","Спр","Шв","Уд","Зах","Оп","Чар"], STAT_EN=["HP","Str","Mag","Dex","Spd","Lck","Def","Res","Cha"];
var STAGE_UK=["Початковий","Спеціальний","Просунутий","Майстер","Божественний"], STAGE_EN=["Beginner","Specialty","Advanced","Master","Divine"];
var STAGE_S_UK=["Поч.","Спец.","Прос.","Майст.","Бож."], STAGE_S_EN=["Beg.","Spec.","Adv.","Mast.","Div."];
// skills, stats and tiers in the other languages; order as in SK_EN / STAT_EN / STAGE_EN. Spanish, French, German and
// Italian use Nintendo's official Three Houses / Engage names (FE Wiki), Dutch the official Echoes names for weapons and magic
var TERMS={
 es:{sk:["espada","lanza","hacha","arco","puños","magia blanca","magia negra","mando","coraza","equitación","vuelo","infantería"],
   st:["PV","Fue","Mag","Hab","Vel","Sue","Def","Res","Car"],stage:["Novel","Especialidad","Avanzada","Suprema","Divina"],short:["Nov.","Esp.","Avan.","Sup.","Div."],mk:["N","E","A","S"]},
 ro:{sk:["sabie","suliță","topor","arc","pumni","magie albă","magie neagră","autoritate","armură grea","călărie","zbor","infanterie"],
   st:["PV","For","Mag","Dex","Vit","Nor","Apr","Rez","Far"],stage:["Începător","Specialitate","Avansat","Maestru","Divin"],short:["Înc.","Spec.","Av.","Maes.","Div."],mk:["Î","S","A","M"]},
 pl:{sk:["miecz","włócznia","topór","łuk","pięści","biała magia","czarna magia","autorytet","ciężki pancerz","jazda konna","latanie","piechota"],
   st:["PŻ","Sił","Mag","Zrę","Szy","Szc","Obr","Odp","Ur"],stage:["Początkowa","Specjalna","Zaawansowana","Mistrzowska","Boska"],short:["Pocz.","Spec.","Zaaw.","Mistrz.","Bosk."],mk:["P","S","Z","M"]},
 fr:{sk:["épée","lance","hache","arc","mêlée","magie blanche","magie noire","autorité","cuirassier","cavalerie","aérien","infanterie"],
   st:["PV","Frc","Mag","Tec","Vit","Cha","Déf","Rés","Chm"],stage:["Novice","Spécialité","Élite","Suprême","Divine"],short:["Nov.","Spéc.","Élite","Supr.","Div."],mk:["N","Sp","É","Su"]},
 de:{sk:["Schwert","Lanze","Axt","Bogen","Faust","Weißmagie","Schwarzmagie","Autorität","Rüstung","Reiten","Fliegen","Infanterie"],
   st:["KP","Stä.","Mag.","Beh.","Ges.","Glk.","Ver.","Res.","Chm."],stage:["Primarstufe","Spezialstufe","Oberstufe","Ultimastufe","Göttlich"],short:["Prim.","Spez.","Ober.","Ult.","Gött."],mk:["P","S","O","U"]},
 sv:{sk:["svärd","spjut","yxa","båge","nävar","vit magi","svart magi","auktoritet","tung rustning","ridning","flygning","infanteri"],
   st:["HP","Sty","Mag","Fsk","Snb","Tur","För","Mot","Cha"],stage:["Nybörjare","Specialist","Avancerad","Mästare","Gudomlig"],short:["Nyb.","Spec.","Av.","Mäst.","Gud."],mk:["N","S","A","M"]},
 fi:{sk:["miekka","keihäs","kirves","jousi","nyrkit","valkoinen magia","musta magia","auktoriteetti","raskas panssari","ratsastus","lento","jalkaväki"],
   st:["HP","Voi","Mag","Tai","Nop","Onn","Puo","Vas","Kar"],stage:["Aloittelija","Erikois","Edistynyt","Mestari","Jumalallinen"],short:["Aloit.","Erik.","Edist.","Mest.","Jum."],mk:["A","Er","Ed","M"]},
 it:{sk:["spada","lancia","ascia","arco","pugni","magia bianca","magia nera","comando","corazza","equitazione","volo","fanteria"],
   st:["PS","For","Mag","Des","Vel","Fort","Dif","Res","Car"],stage:["Principiante","Specialità","Avanzata","Master","Divina"],short:["Princ.","Spec.","Avanz.","Master","Div."],mk:["P","S","A","M"]},
 nl:{sk:["zwaard","lans","bijl","boog","vuisten","witte magie","zwarte magie","autoriteit","zware wapenrusting","rijden","vliegen","infanterie"],
   st:["HP","Kra","Mag","Vaa","Snel","Gel","Ver","Wee","Cha"],stage:["Beginner","Specialist","Gevorderd","Meester","Goddelijk"],short:["Beg.","Spec.","Gev.","Mst.","God."],mk:["B","S","G","M"]},
 pt:{sk:["espada","lança","machado","arco","punhos","magia branca","magia negra","autoridade","armadura pesada","equitação","voo","infantaria"],
   st:["PV","For","Mag","Des","Vel","Sor","Def","Res","Car"],stage:["Iniciante","Especialidade","Avançada","Mestre","Divina"],short:["Inic.","Esp.","Avanç.","Mest.","Div."],mk:["I","E","A","M"]},
 tr:{sk:["kılıç","mızrak","balta","yay","yumruk","beyaz büyü","kara büyü","otorite","ağır zırh","binicilik","uçuş","piyade"],
   st:["CP","Güç","Büy","Bec","Hız","Şns","Sav","Dir","Kar"],stage:["Başlangıç","Uzmanlık","İleri","Usta","İlahi"],short:["Başl.","Uzm.","İleri","Usta","İlh."],mk:["B","Uz","İ","Us"]},
 hu:{sk:["kard","lándzsa","fejsze","íj","ököl","fehér mágia","fekete mágia","tekintély","nehézpáncél","lovaglás","repülés","gyalogság"],
   st:["ÉP","Erő","Mág","Ügy","Seb","Sze","Véd","Ell","Báj"],stage:["Kezdő","Specialista","Haladó","Mester","Isteni"],short:["Kezd.","Spec.","Had.","Mest.","Ist."],mk:["K","S","H","M"]},
 el:{sk:["σπαθί","δόρυ","τσεκούρι","τόξο","γροθιές","λευκή μαγεία","μαύρη μαγεία","κύρος","βαριά πανοπλία","ιππασία","πτήση","πεζικό"],
   st:["ΠΖ","Δύν","Μαγ","Επι","Ταχ","Τύχ","Άμυ","Αντ","Γοη"],stage:["Αρχάριος","Ειδίκευση","Προχωρημένος","Δάσκαλος","Θεϊκός"],short:["Αρχ.","Ειδ.","Προχ.","Δάσκ.","Θεϊκ."],mk:["Α","Ε","Π","Δ"]},
 nb:{sk:["sverd","spyd","øks","bue","never","hvit magi","svart magi","autoritet","tung rustning","ridning","flyging","infanteri"],
   st:["HP","Sty","Mag","Fer","Fart","Flaks","Fors","Mot","Sja"],stage:["Nybegynner","Spesialist","Avansert","Mester","Guddommelig"],short:["Nyb.","Spes.","Av.","Mest.","Gud."],mk:["N","S","A","M"]},
 lt:{sk:["kardas","ietis","kirvis","lankas","kumščiai","baltoji magija","juodoji magija","autoritetas","sunkieji šarvai","jojimas","skraidymas","pėstininkai"],
   st:["GT","Jėg","Mag","Vikr","Greit","Sėkm","Gyn","Atsp","Žav"],stage:["Pradedantysis","Specialybė","Pažengęs","Meistras","Dieviškas"],short:["Prad.","Spec.","Paženg.","Meistr.","Diev."],mk:["P","S","Pž","M"]},
 crh:{sk:["qılıç","mızraq","balta","yay","yumruqlar","aq sihir","qara sihir","nufuz","ağır zırh","at minüv","uçuv","piyade"],
   st:["Can","Küç","Sih","Çev","Tez","Bah","Qor","Muq","Caz"],stage:["Başlanğıç","Mutehassıslıq","İlerlegen","Usta","İlâhiy"],short:["Başl.","Mut.","İler.","Usta","İlâh."],mk:["B","M","İ","U"]},
 ka:{sk:["ხმალი","შუბი","ცული","მშვილდი","მუშტები","თეთრი მაგია","შავი მაგია","ავტორიტეტი","მძიმე აბჯარი","ცხენოსნობა","ფრენა","ქვეითი ჯარი"],
   st:["სიც","ძალ","მაგ","მოხ","სის","იღბ","დაც","მდგ","ხიბ"],stage:["დამწყები","სპეციალობა","დაწინაურებული","ოსტატი","ღვთაებრივი"],short:["დამწ.","სპეც.","დაწ.","ოსტ.","ღვთ."],mk:["დ","ს","დწ","ო"]},
 cs:{sk:["meč","kopí","sekera","luk","pěsti","bílá magie","černá magie","autorita","těžké brnění","jízda","létání","pěchota"],
   st:["HP","Síl","Mag","Zruč","Rych","Štěs","Obr","Odol","Char"],stage:["Začátečník","Specializace","Pokročilá","Mistr","Božská"],short:["Zač.","Spec.","Pokr.","Mistr","Bož."],mk:["Z","S","P","M"]},
 ga:{sk:["claíomh","sleá","tua","bogha","doirne","draíocht gheal","draíocht dhubh","údarás","armúr trom","marcaíocht","eitilt","coisithe"],
   st:["HP","Nrt","Dra","Dea","Lua","Ádh","Cos","Fri","Mea"],stage:["Tosaitheoir","Speisialtacht","Ardleibhéal","Máistir","Diaga"],short:["Tos.","Spei.","Ard.","Máist.","Dia."],mk:["T","S","A","M"]},
 cy:{sk:["cleddyf","gwaywffon","bwyell","bwa","dyrnau","hud gwyn","hud du","awdurdod","arfwisg drom","marchogaeth","hedfan","milwyr traed"],
   st:["HP","Cry","Hud","Deh","Cyf","Lwc","Amd","Gwr","Swy"],stage:["Dechreuwr","Arbenigol","Uwch","Meistr","Dwyfol"],short:["Dech.","Arben.","Uwch","Meistr","Dwyf."],mk:["D","A","U","M"]},
 be:{sk:["меч","дзіда","сякера","лук","кулакі","белая магія","чорная магія","аўтарытэт","цяжкая браня","язда","палёт","пяхота"],
   st:["HP","Сіл","Маг","Спр","Хут","Уд","Абр","Суп","Чар"],stage:["Пачатковы","Спецыяльны","Прасунуты","Майстар","Боскі"],short:["Пач.","Спец.","Прас.","Майст.","Боск."],mk:["П","С","Пр","М"]},
 ar:{sk:["سيف","رمح","فأس","قوس","قبضات","سحر أبيض","سحر أسود","سلطة","درع ثقيل","ركوب","طيران","مشاة"],
   st:["صحة","قوة","سحر","براعة","سرعة","حظ","دفاع","مقاومة","جاذبية"],stage:["مبتدئ","متخصص","متقدم","خبير","إلهي"],short:["مبتدئ","متخصص","متقدم","خبير","إلهي"],mk:["0","1","2","3"]},
 da:{sk:["sværd","spyd","økse","bue","næver","hvid magi","sort magi","autoritet","tung rustning","ridning","flyvning","infanteri"],
   st:["HP","Sty","Mag","Fær","Hur","Held","For","Mod","Cha"],stage:["Begynder","Specialist","Avanceret","Mester","Guddommelig"],short:["Beg.","Spec.","Av.","Mest.","Gud."],mk:["B","S","A","M"]}};
var MARKS={uk:["П","С","Пр","М"],en:["B","S","A","M"]};
function setLangTables(){
  var t=TERMS[LANG];
  if(LANG==="uk"){SK=SK_UK;STAT=STAT_UK;STAGE=STAGE_UK;STAGE_S=STAGE_S_UK}
  else if(!t){SK=SK_EN;STAT=STAT_EN;STAGE=STAGE_EN;STAGE_S=STAGE_S_EN}
  else{SK={};Object.keys(SK_EN).forEach(function(k,i){SK[k]=t.sk[i]});STAT=t.st;STAGE=t.stage;STAGE_S=t.short}
  if(t)MARKS[LANG]=t.mk;
}

