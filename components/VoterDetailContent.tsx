'use client';
import {useEffect,useMemo,useState} from 'react';
import {getResidents,updateResident} from '../lib/supabase';
import type {Resident} from '../lib/types';
import StatusBadge from '../shared/StatusBadge';

const tabs=['Overview','Call Center','Door-to-Door','Candidate Meeting','Election Day','Remarks','Assignments'];
export default function VoterDetailContent(){
 const [rows,setRows]=useState<Resident[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[active,setActive]=useState('Overview'),[saving,setSaving]=useState(false),[saved,setSaved]=useState('');
 useEffect(()=>{getResidents().then(setRows).catch(e=>setError(e.message||'Unable to load voter')).finally(()=>setLoading(false))},[]);
 const id=typeof window!=='undefined'?new URLSearchParams(window.location.search).get('id'):null;
 const resident=useMemo(()=>rows.find(r=>String(r.id)===String(id))||rows[0],[rows,id]);
 const [draft,setDraft]=useState<Partial<Resident>>({}); useEffect(()=>{if(resident)setDraft(resident)},[resident]);
 async function save(){if(!resident)return;setSaving(true);setSaved('');try{const updated=await updateResident(resident.id,draft);setRows(x=>x.map(r=>r.id===updated.id?updated:r));setSaved('Saved successfully')}catch(e:any){setError(e.message||'Save failed')}finally{setSaving(false)}}
 if(loading)return <div className="panel">Loading voter profile…</div>; if(error&&!resident)return <div className="panel text-rose-700">{error}</div>; if(!resident)return <div className="panel">No voter record found.</div>;
 return <div className="space-y-6"><section className="panel"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="muted">Resident profile</p><h1 className="text-3xl font-bold">{resident.name||'Unnamed resident'}</h1><p className="mt-2 text-slate-500">{resident.national_id||'No ID'} · {resident.house||resident.lives_in||'Address unavailable'}</p></div><div className="flex flex-wrap gap-2"><StatusBadge status={draft.vote_status}/><StatusBadge status={draft.phone_status}/><StatusBadge status={draft.d2d_status}/></div></div></section>
 <div className="flex gap-2 overflow-x-auto pb-1">{tabs.map(t=><button key={t} onClick={()=>setActive(t)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${active===t?'bg-calm-700 text-white':'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{t}</button>)}</div>
 <section className="panel space-y-5"><h2 className="section-title">{active}</h2>
 {active==='Overview'&&<div className="grid gap-4 md:grid-cols-2"><Field label="Name" value={draft.name||''} onChange={v=>setDraft({...draft,name:v})}/><Field label="National ID" value={draft.national_id||''} onChange={v=>setDraft({...draft,national_id:v})}/><Field label="Official address" value={draft.house||''} onChange={v=>setDraft({...draft,house:v})}/><Field label="Living now" value={draft.lives_in||''} onChange={v=>setDraft({...draft,lives_in:v})}/><Field label="Phone" value={draft.phone||''} onChange={v=>setDraft({...draft,phone:v})}/></div>}
 {active==='Call Center'&&<div className="grid gap-4 md:grid-cols-2"><Select label="Phone status" value={draft.phone_status||'need-call'} options={['need-call','called']} onChange={v=>setDraft({...draft,phone_status:v as any})}/><Select label="Reach status" value={draft.reach_status||'not-reached'} options={['not-reached','reached']} onChange={v=>setDraft({...draft,reach_status:v as any})}/></div>}
 {active==='Door-to-Door'&&<Select label="Visit result" value={draft.d2d_status||'not-visited'} options={['not-visited','reach','not-home','live-in-another-place']} onChange={v=>setDraft({...draft,d2d_status:v as any})}/>} 
 {active==='Candidate Meeting'&&<Select label="Support level" value={draft.support_level||'not-guaranteed'} options={['not-guaranteed','guaranteed']} onChange={v=>setDraft({...draft,support_level:v as any})}/>} 
 {active==='Election Day'&&<Select label="Vote intention" value={draft.vote_status||'not-decided'} options={['not-decided','will-vote','not-vote']} onChange={v=>setDraft({...draft,vote_status:v as any})}/>} 
 {active==='Remarks'&&<label className="block"><span className="mb-2 block text-sm font-semibold">Remarks</span><textarea className="input-base min-h-40 w-full" value={draft.remarks||''} onChange={e=>setDraft({...draft,remarks:e.target.value})}/></label>}
 {active==='Assignments'&&<div className="soft-card text-sm text-slate-500">Assignment records are stored separately in resident_assignments and can be connected in the next integration stage.</div>}
 <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">{saved&&<span className="text-sm text-emerald-700">{saved}</span>}{error&&<span className="text-sm text-rose-700">{error}</span>}<button className="btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':'Save voter update'}</button></div></section></div>;
}
function Field({label,value,onChange}:{label:string,value:string,onChange:(v:string)=>void}){return <label><span className="mb-2 block text-sm font-semibold">{label}</span><input className="input-base w-full" value={value} onChange={e=>onChange(e.target.value)}/></label>}
function Select({label,value,options,onChange}:{label:string,value:string,options:string[],onChange:(v:string)=>void}){return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><select className="input-base w-full" value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{o.replaceAll('-',' ')}</option>)}</select></label>}