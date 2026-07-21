'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {getCallCenterQueue,saveCallCenterResult} from '../lib/supabase';
import type {CallOutcome,Resident,SupportLevel,VoteStatus} from '../lib/types';
import {PartyFilter,ResidentIdentity} from '../shared/ResidentIdentity';
import {ResidentCard,ResidentFields} from '../shared/ResidentCard';

const outcomes:CallOutcome[]=['pending','connected','busy','not-answer','out-of-coverage','disconnected','wrong-number'];
const text=(value:string)=>value.replace(/-/g,' ').replace(/\b\w/g,m=>m.toUpperCase());

export default function CallCenterContent(){
 const [rows,setRows]=useState<Resident[]>([]),[count,setCount]=useState(0),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [searchInput,setSearchInput]=useState(''),[partyInput,setPartyInput]=useState('all'),[statusInput,setStatusInput]=useState('all'),[outcomeInput,setOutcomeInput]=useState('all');
 const [search,setSearch]=useState(''),[party,setParty]=useState('all'),[status,setStatus]=useState('all'),[outcome,setOutcome]=useState('all'),[selected,setSelected]=useState<Resident|null>(null);
 function load(){setLoading(true);getCallCenterQueue({search,party,phoneStatus:status,outcome,pageSize:100}).then(r=>{setRows(r.rows);setCount(r.count);setError('')}).catch(e=>setError(e.message)).finally(()=>setLoading(false))}
 useEffect(()=>{load()},[search,party,status,outcome]);
 function applySearch(){setSearch(searchInput.trim());setParty(partyInput);setStatus(statusInput);setOutcome(outcomeInput)}
 function reset(){setSearchInput('');setPartyInput('all');setStatusInput('all');setOutcomeInput('all');setSearch('');setParty('all');setStatus('all');setOutcome('all')}
 return <div className="space-y-4">
  <section className="page-hero"><p className="eyebrow">Call Center</p><h1 className="mt-2">Phone outreach</h1><p className="mt-2 text-sm text-body">{count.toLocaleString()} residents</p></section>
  <section className="panel space-y-4"><PartyFilter value={partyInput} onChange={setPartyInput}/><div className="grid gap-3 lg:grid-cols-[1fr_190px_210px_auto_auto]"><input className="field" value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')applySearch()}} placeholder="Search name, ID, phone or address"/><select className="field" value={statusInput} onChange={e=>setStatusInput(e.target.value)}><option value="all">All call statuses</option><option value="need-call">Need call</option><option value="called">Called</option></select><select className="field" value={outcomeInput} onChange={e=>setOutcomeInput(e.target.value)}><option value="all">All call results</option>{outcomes.map(item=><option key={item} value={item}>{text(item)}</option>)}</select><button className="btn-primary" onClick={applySearch}>Search</button><button className="btn-secondary" onClick={reset}>Reset</button></div></section>
  {error&&<div className="error-banner">{error}</div>}
  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{loading?Array.from({length:6}).map((_,i)=><div key={i} className="h-72 animate-pulse rounded-card bg-primary-light"/>):rows.map(r=><ResidentCard key={String(r.id)} resident={r} actions={<button onClick={()=>setSelected(r)} className="btn-primary w-full">Record call</button>}><ResidentFields resident={r}/><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><Box label="Attempts" value={String(r.call_attempts||0)}/><Box label="Last result" value={text(r.call_outcome||'pending')}/></div></ResidentCard>)}</section>
  {!loading&&!rows.length&&<div className="empty-state">No residents match the selected filters.</div>}
  {selected&&<CallForm resident={selected} close={()=>setSelected(null)} saved={()=>{setSelected(null);load()}}/>}
 </div>
}

function CallForm({resident,close,saved}:{resident:Resident;close:()=>void;saved:()=>void}){
 const [outcome,setOutcome]=useState<CallOutcome>((resident.call_outcome as CallOutcome)||'pending'),[vote,setVote]=useState<VoteStatus>(resident.vote_status||'not-decided'),[support,setSupport]=useState<SupportLevel>(resident.support_level||'not-guaranteed'),[agent,setAgent]=useState(resident.recorded_by||''),[saving,setSaving]=useState(false),[error,setError]=useState('');
 const connected=outcome==='connected';
 async function submit(){setSaving(true);setError('');try{await saveCallCenterResult(resident.id,{outcome,vote_status:connected?vote:'not-decided',support_level:connected?support:'not-guaranteed',recorded_by:agent});saved()}catch(e){setError(e instanceof Error?e.message:'Save failed')}finally{setSaving(false)}}
 return <div className="fixed inset-0 z-50 flex justify-end bg-navy/40"><aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><header className="sticky top-0 border-b border-border bg-white p-5"><div className="flex justify-between gap-3"><ResidentIdentity resident={resident}/><button className="btn-ghost" onClick={close}>Close</button></div></header><div className="space-y-5 p-5"><ChoiceGroup title="Call result" values={outcomes} selected={outcome} choose={v=>setOutcome(v as CallOutcome)}/>{connected&&<><ChoiceGroup title="Vote answer" values={['will-vote','not-decided','not-vote']} selected={vote} choose={v=>setVote(v as VoteStatus)}/><ChoiceGroup title="Support" values={['guaranteed','not-guaranteed']} selected={support} choose={v=>setSupport(v as SupportLevel)}/></>}<div className="notice-card"><p className="text-sm text-body">Operational comments are stored in the central Remarks section.</p><Link prefetch href={`/remarks/?resident=${encodeURIComponent(String(resident.id))}&section=call-center`} className="btn-secondary mt-3 w-full">Add remark</Link></div><input className="field" value={agent} onChange={e=>setAgent(e.target.value)} placeholder="Agent name"/>{error&&<div className="error-banner">{error}</div>}<div className="grid gap-2 sm:grid-cols-2"><button className="btn-secondary" onClick={close}>Cancel</button><button disabled={saving} onClick={submit} className="btn-primary">{saving?'Saving…':'Save and return'}</button></div></div></aside></div>
}
function ChoiceGroup({title,values,selected,choose}:{title:string;values:string[];selected:string;choose:(v:string)=>void}){return <section><h3>{title}</h3><div className="mt-3 grid grid-cols-2 gap-2">{values.map(v=><button key={v} onClick={()=>choose(v)} className={`rounded-lg border p-3 text-sm font-semibold ${selected===v?'border-primary bg-primary-light text-primary':'border-border text-body'}`}>{text(v)}</button>)}</div></section>}
function Box({label,value}:{label:string;value:string}){return <div className="rounded-lg bg-slate-50 p-3"><span className="block text-body">{label}</span><b className="block truncate text-navy">{value}</b></div>}