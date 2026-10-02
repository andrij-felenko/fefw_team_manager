// Class advice for the picker: earlier classes that train what the later chosen classes need.
import {BY} from "../data/fighters.js";
import {TIERS,CLS,RANKS} from "../data/classes.js";
import {fit,holders,holdersAll,access} from "./rules.js";

// recommend 1–3 classes of an earlier stage that train the skills the later chosen classes need
export function recommend(n,ti,path){
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
