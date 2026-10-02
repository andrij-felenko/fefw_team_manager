// Small helpers shared by every part of the planner.
export function $(id){return document.getElementById(id)}
export function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
export function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
export function has(o,k){return Object.prototype.hasOwnProperty.call(o,k)}
export function cap(t){t=String(t);return t.charAt(0).toUpperCase()+t.slice(1)}
