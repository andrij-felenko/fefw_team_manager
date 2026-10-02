// The page's fixed parts: language and direction, title, headings and labels, the source note, the flags' state.
import {LANG,tr,pick} from "../core/i18n.js";
import {$} from "../core/utils.js";
import {S,save} from "../core/state.js";

// the fixed texts of index.html (data-i18n), in Ukrainian and English
const T={
  h_squad:["Загін","Squad"], h_all:["Усі бійці","All fighters"], h_classes:["Класи","Classes"],
  hide_blocked:["сховати недоступні","hide unavailable"],
  title:["Heroic Games · конструктор","Heroic Games · squad planner"],
  src:['Фанатський планувальник, не пов\'язаний з Nintendo чи Intelligent Systems. Дані: сторінки персонажів і класів <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, вимоги класів і умови вербування <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, стать і вік <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> і <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, обмеження <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; вересень 2026. Ранги — мінімум для іспиту (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Приріст у класі = власний приріст + надбавка класу (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Вік — до перестрибування в часі. Боєць може бути лише в одному загоні. Усе зберігається лише в цьому браузері.',
       'Fan-made planner, not affiliated with Nintendo or Intelligent Systems. Data: character and class pages on <a href="https://fortunesweave.wiki.fextralife.com/Characters" target="_blank" rel="noopener">Fextralife</a>, class requirements and recruitment conditions from <a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/620256" target="_blank" rel="noopener">Game8</a>, gender and age from <a href="https://fireemblemwiki.org/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fire Emblem Wiki</a> and <a href="https://fireemblem.fandom.com/wiki/List_of_characters_in_Fire_Emblem:_Fortune%27s_Weave" target="_blank" rel="noopener">Fandom</a>, restrictions from <a href="https://www.thegamer.com/fire-emblem-fortunes-weave-how-to-change-class/" target="_blank" rel="noopener">TheGamer</a>; September 2026. Ranks are the exam minimum (E+ &lt; D &lt; C &lt; B &lt; A &lt; S). Growth in a class = personal growth + class modifier (<a href="https://game8.co/games/Fire-Emblem-Fortunes-Weave/archives/618974" target="_blank" rel="noopener">Game8</a>, <a href="https://serenesforest.net/fortunes-weave/characters/growth-rates/" target="_blank" rel="noopener">Serenes Forest</a>). Ages are before the timeskip. A fighter can be in one squad only. Everything is saved in this browser only.']
};
export function renderStatic(){
  document.documentElement.lang=LANG; document.documentElement.dir=LANG==="ar"?"rtl":"ltr";
  document.title=pick(T.title);
  document.querySelectorAll("[data-i18n]").forEach(function(el){el.textContent=pick(T[el.dataset.i18n])});
  $("srcNote").innerHTML=pick(T.src);
  applyFolds();
  document.querySelectorAll(".lang button").forEach(function(b){var on=b.dataset.lang===LANG;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
}
// a section's heading folds and unfolds it; the choice is kept
function applyFolds(){
  document.querySelectorAll(".fold").forEach(function(b){var k=b.dataset.fold, shut=!!S.fold[k];
    b.setAttribute("aria-expanded",!shut); $("fold-"+k).hidden=shut});
}
export function bindFolds(){
  document.querySelectorAll(".fold").forEach(function(b){b.addEventListener("click",function(){
    var k=b.dataset.fold; if(S.fold[k])delete S.fold[k];else S.fold[k]=1; save(); applyFolds()})});
}
