// Checks the translation files js/l10n/<code>.js without running them: each phrase line is "English text":"translation".
// Per language: phrases missing against every phrase any language has, placeholders ({n}, {w}, {t}) that differ from
// the English text, and a leading or trailing space the English text has and the translation lacks (or the reverse).
// Usage: node tools/check-l10n.mjs   (no dependencies; exit code 1 when something is found)
import {readdirSync,readFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const DIR=join(dirname(fileURLToPath(import.meta.url)),"..","js","l10n");
const langs={};
for(const f of readdirSync(DIR).filter(f=>f.endsWith(".js")).sort()){
  const d={file:f,map:new Map(),bad:[],dup:[]}; let inside=false;
  readFileSync(join(DIR,f),"utf8").split(/\r?\n/).forEach(function(l,i){
    if(!inside){inside=l.trim()==="export default {";return}
    if(l.trim()==="};"){inside=false;return}
    if(!l.trim())return;
    // a phrase line is a JSON key/value pair, so JSON.parse reads it without executing anything
    var pair; try{pair=Object.entries(JSON.parse("{"+l.replace(/,\s*$/,"")+"}"))}catch(e){d.bad.push(i+1);return}
    pair.forEach(function([k,v]){if(d.map.has(k))d.dup.push(k);d.map.set(k,v)});
  });
  langs[f.slice(0,-3)]=d;
}
const all=new Set(); Object.values(langs).forEach(function(d){d.map.forEach(function(v,k){all.add(k)})});
const holes=function(s){return (s.match(/\{\w+\}/g)||[]).sort().join(" ")};
const show=function(s){return JSON.stringify(s.length>70?s.slice(0,67)+"…":s)};
let total=0;
for(const [code,d] of Object.entries(langs)){
  const missing=[...all].filter(function(k){return !d.map.has(k)}), ph=[], sp=[];
  d.map.forEach(function(v,k){
    if(holes(k)!==holes(v))ph.push(k);
    if(/^\s/.test(k)!==/^\s/.test(v)||/\s$/.test(k)!==/\s$/.test(v))sp.push(k);
  });
  const n=missing.length+ph.length+sp.length+d.dup.length+d.bad.length; total+=n;
  console.log(code.padEnd(4)+String(d.map.size).padStart(4)+" phrases · missing "+missing.length+" · placeholders "+ph.length+" · spaces "+sp.length+
    (d.dup.length?" · duplicates "+d.dup.length:"")+(d.bad.length?" · unreadable lines "+d.bad.join(","):""));
  missing.forEach(function(k){console.log("       missing      "+show(k))});
  ph.forEach(function(k){console.log("       placeholders "+show(k)+" → "+show(d.map.get(k)))});
  sp.forEach(function(k){console.log("       spaces       "+show(k)+" → "+show(d.map.get(k)))});
  d.dup.forEach(function(k){console.log("       twice        "+show(k))});
}
console.log(Object.keys(langs).length+" translation files, "+all.size+" phrases in all: "+(total?total+" problem(s)":"no problems")+
  " (English and Ukrainian are written in the code and need no file)");
process.exitCode=total?1:0;
