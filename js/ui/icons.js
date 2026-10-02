// Icons: the skill and mount sprite in index.html (ic), and the inline marks drawn by the page.
export function ic(k){return '<svg class="ic"><use href="#i-'+k+'"/></svg>'}
// a fighter the game itself puts in the squad: a scroll instead of the word "story"
export const STORY_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3.5C4 2.4 4.9 1.5 6 1.5H18C19.1 1.5 20 2.4 20 3.5S19.1 5.5 18 5.5H6C4.9 5.5 4 4.6 4 3.5Z'+
  'M4 20.5C4 19.4 4.9 18.5 6 18.5H18C19.1 18.5 20 19.4 20 20.5S19.1 22.5 18 22.5H6C4.9 22.5 4 21.6 4 20.5Z"/>'+
  '<path fill-rule="evenodd" d="M6 5H18V19H6Z M8.5 8.4H15.5V9.7H8.5Z M8.5 11.3H15.5V12.6H8.5Z M8.5 14.2H13.5V15.5H8.5Z"/></svg>';
// the rating marks: damage, evasion, defense, overall
export const RT_SVG=['<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 14.1 8.3 20.9 5.5 17.1 11.3 22.8 15.1 15.7 15.3 16.4 22.5 12 16.8 7.6 22.5 8.3 15.3 1.2 15.1 6.9 11.3 3.1 5.5 9.9 8.3Z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 19.5C3.5 11 8.6 5.6 14.6 5.9" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/><path d="M13 1.6 21 6.2 13.3 10.5Z"/><path d="M9.5 21C10.4 15.6 13.4 12.2 18.6 11.9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.6 20.6 4.6V11C20.6 16.6 16.9 20.6 12 22.6 7.1 20.6 3.4 16.6 3.4 11V4.6Z"/></svg>',
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8 14.9 8.6 22.2 9.2 16.6 14 18.3 21.2 12 17.4 5.7 21.2 7.4 14 1.8 9.2 9.1 8.6Z"/></svg>'];
// the recruit-paths mark: a road that forks
export const PATHS_SVG='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15V8.5M8 8.5 3.5 4.5V1.8M8 8.5l4.5-4M1.8 3.4 3.5 1.6 5.2 3.4M10.6 2.4h2.6v2.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
