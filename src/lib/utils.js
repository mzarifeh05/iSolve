/** Prefer the requested translation, then the other language. */
export function localized(record,field,language='en'){
  if(!record)return '';
  const preferred=language.startsWith('ar')?'ar':'en';
  const value=record[`${field}_${preferred}`],fallback=record[`${field}_${preferred==='ar'?'en':'ar'}`];
  return typeof value==='string'&&value.trim()?value:typeof fallback==='string'?fallback:'';
}
export function initials(name=''){return name.trim().split(/\s+/).filter(Boolean).slice(0,2).map(part=>[...part][0]).join('');}
