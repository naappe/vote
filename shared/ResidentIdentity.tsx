import type {Resident} from '../lib/types';
import {PartyBadge} from './PartyIdentity';

export function ResidentPhoto({resident,size='md'}:{resident:Resident;size?:'sm'|'md'|'lg'}){
 const initials=(resident.name||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const cls=size==='lg'?'h-20 w-20':size==='sm'?'h-10 w-10':'h-14 w-14';
 return resident.photo_url?<img src={resident.photo_url} alt={resident.name||'Resident'} loading="lazy" className={`${cls} shrink-0 rounded-xl border border-border object-cover bg-white`}/>:<div className={`${cls} grid shrink-0 place-items-center rounded-xl border border-border bg-primary-light text-xs font-extrabold text-primary`}>{initials}</div>
}

export function ResidentIdentity({resident,compact=false}:{resident:Resident;compact?:boolean}){
 return <div className="flex min-w-0 items-center gap-3"><ResidentPhoto resident={resident} size={compact?'sm':'md'}/><div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><b className="truncate text-navy">{resident.name||'Unnamed resident'}</b><PartyBadge party={resident.party}/></div><p className="truncate text-xs text-body">{resident.national_id||'No ID'} · {resident.lives_in||resident.house||'Location not recorded'}</p></div></div>
}

export function PartyFilter({value,onChange}:{value:string;onChange:(value:string)=>void}){
 return <div className="party-filter" role="group" aria-label="Party filter">{['all','PNC','MDP','Other'].map(p=><button type="button" key={p} onClick={()=>onChange(p)} className={`party-filter-button ${value===p?'party-filter-active':''} ${p==='PNC'?'party-filter-pnc':p==='MDP'?'party-filter-mdp':p==='Other'?'party-filter-other':''}`}>{p==='all'?'All parties':p}</button>)}</div>
}

export function matchesParty(resident:Resident,party:string){if(party==='all')return true;const value=(resident.party||'').toUpperCase();if(party==='Other')return value!=='PNC'&&value!=='MDP';return value===party}
