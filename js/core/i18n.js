// Fire Emblem: Fortune's Weave squad planner: languages.
import {setLangTables} from "./terms.js";
// every visible string exists in Ukrainian and English; tr(uk, en) picks the current one
export let LANG="en";
// the current language and its game terms change together
export function setLang(l){LANG=l;setLangTables(l)}
// Languages are listed by how many people it is the national language of (the population of the countries and regions
// where it is the nation's own language, e.g. Ireland for Irish, Wales for Welsh, plus the people living abroad), roughly, largest first.
// Ukrainian and English are written in the code as tr("uk","en") pairs; the other languages look the English text up
// in L10N (one file per language in js/l10n/), falling back to English when a phrase is missing
const LANGS=[["en","English"],["es","Español"],["ar","العربية"],["pt","Português"],["de","Deutsch"],["fr","Français"],["tr","Türkçe"],["it","Italiano"],["uk","Українська"],["pl","Polski"],["nl","Nederlands"],["ro","Română"],["hu","Magyar"],["el","Ελληνικά"],["cs","Čeština"],["sv","Svenska"],["be","Беларуская"],["ga","Gaeilge"],["da","Dansk"],["nb","Norsk"],["fi","Suomi"],["ka","ქართული"],["lt","Lietuvių"],["cy","Cymraeg"],["crh","Qırımtatarca"]];
// phrases of the other languages: js/l10n/<code>.js, loaded the first time that language is used
const L10N={};
export function loc(en){if(LANG==="en")return en;var d=L10N[LANG];return d&&d[en]!=null?d[en]:en}
export function tr(uk,en){return LANG==="uk"?uk:loc(en)}
export function pick(a){return LANG==="uk"?a[0]:loc(a[1])}
// runs cb once the language's phrases are in (at once for English, Ukrainian and languages already loaded);
// if the file can't be loaded the page stays in English rather than breaking
export function withLang(l,cb){
  if(l==="en"||l==="uk"||L10N[l]||!LANGS.some(function(p){return p[0]===l})){cb();return}
  import("../l10n/"+l+".js").then(function(m){L10N[l]=m.default},function(){}).then(function(){cb()});
}
export function fmt(t,o){return t.replace(/\{(\w+)\}/g,function(m,k){return o[k]!=null?o[k]:m})}
