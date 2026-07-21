'use client';
import {useEffect,useMemo,useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {getSharedAssignmentProgress,getSharedResidents,getWorkflowShare,submitSharedAssignments} from '../lib/operations';
import type {SharedAssignmentRecord,WorkflowShare} from '../lib/operations';
import type {Resident} from '../lib/types';
import {ResidentCard,ResidentFields} from '../shared/ResidentCard';

type ViewMode='all'|'selected'|'not-selected';

export default function WorkflowShareContent(){
 const token=useSearchParams().get('token')||'';
 const [rows,setRows]=useState<Resident[]>([]);
 const [share,setShare]=useState<WorkflowShare|null>(null);
 const [progress,setProgress]=useState<SharedAssignmentRecord[]>([]);
 const [loading,setLoading]=useState(true);
 const [submitting,setSubmitting]=useState(false);
 const [error,setError]=useState('');
 const [success,setSuccess]=useState('');
 const [query,setQuery]=useState('');
 const [view,setView]=useState<ViewMode>('not-selected');
 const [selected,setSelected]=useState<Set<string>>(new Set());
 const [pickerOpen,setPickerOpen]=useState(false);
 const [pickerQuery,setPickerQuery]=useState('');

 async function load(){
  if(!token){setError('Missing share token.');setLoading(false);return}
  try{
   const item=await getWorkflowShare(token);
   setShare(item);
   const [residentRows,assignmentRows]=await Promise.all([
    getSharedResidents(item),
    getSharedAssignmentProgress(item)
   ]);
   setRows(residentRows);
   setProgress(assignmentRows);
  }catch(e){
   setError(e instanceof Error?e.message:'Unable to load assignment link');
  }finally{
   setLoading(false);
  }
 }

 useEffect(()=>{load()},[token]);

 const assignmentMode=share?.workflow==='assignments'&&share.can_update;
 const assigneeName=(share?.status_filter||'').trim();
 const ownProgress=useMemo(()=>progress.filter(item=>item.assignee_name.trim().toLowerCase()===assigneeName.toLowerCase()),[progress,assigneeName]);
 const savedIds=useMemo(()=>new Set(ownProgress.map(item=>String(item.resident_id))),[ownProgress]);
 const totalSelected=savedIds.size+selected.size;
 const filtered=useMemo(()=>rows.filter(r=>residentMatches(r,query)),[rows,query]);
 const visible=useMemo(()=>filtered.filter(r=>{
  const id=String(r.id),isSelected=savedIds.has(id)||selected.has(id);
  if(view==='selected')return isSelected;
  if(view==='not-selected')return !isSelected;
  return true;
 }),[filtered,view,savedIds,selected]);
 const selectableVisible=useMemo(()=>visible.filter(r=>!savedIds.has(String(r.id))),[visible,savedIds]);
 const pickerRows=useMemo(()=>rows.filter(r=>residentMatches(r,pickerQuery)),[rows,pickerQuery]);

 function toggle(id:string){
  if(savedIds.has(id))return;
  setSelected(current=>{
   const next=new Set(current);
   next.has(id)?next.delete(id):next.add(id);
   return next;
  });
 }

 function toggleVisible(){
  setSelected(current=>{
   const next=new Set(current);
   const ids=selectableVisible.map(r=>String(r.id));
   const allSelected=ids.length>0&&ids.every(id=>next.has(id));
   ids.forEach(id=>allSelected?next.delete(id):next.add(id));
   return next;
  });
 }

 async function submit(){
  if(!share)return;
  if(!assigneeName){setError('This link has no assignee name.');return}
  setSubmitting(true);setError('');setSuccess('');
  try{
   const count=await submitSharedAssignments(share,assigneeName,[...selected]);
   setSuccess(`${count} resident${count===1?'':'s'} saved for ${assigneeName}.`);
   setSelected(new Set());
   setView('selected');
   setPickerOpen(false);
   await load();
  }catch(e){
   setError(e instanceof Error?e.message:'Unable to save assignments');
  }finally{
   setSubmitting(false);
  }
 }

 if(loading)return <main className="mx-auto max-w-6xl p-5"><div className="h-32 animate-pulse rounded-2xl bg-primary-light"/></main>;

 return <main className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
  <header className="panel">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="eyebrow">Assignee</p><h1 className="mt-1">{assigneeName||'Assignment'}</h1><p className="mt-1 text-sm text-body">{totalSelected} of {rows.length} selected</p></div>
    {selected.size>0&&<button className="btn-primary" disabled={submitting} onClick={submit}>{submitting?'Saving…':`Save ${selected.size}`}</button>}
   </div>
  </header>

  {error&&<div className="error-banner">{error}</div>}
  {success&&<div className="info-banner"><b className="text-navy">{success}</b></div>}

  {!error&&assignmentMode&&<section className="panel sticky top-0 z-10">
   <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
    <input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, ID, mobile, address or box"/>
    <button type="button" className="btn-primary" onClick={()=>{setPickerQuery(query);setPickerOpen(true)}}>Select resident</button>
    <button className="btn-secondary" disabled={!selectableVisible.length} onClick={toggleVisible}>{selectableVisible.length&&selectableVisible.every(r=>selected.has(String(r.id)))?'Unselect visible':'Select visible'}</button>
   </div>
   <div className="mt-3 grid grid-cols-3 gap-2">
    <FilterButton active={view==='all'} onClick={()=>setView('all')} label="All" count={rows.length}/>
    <FilterButton active={view==='selected'} onClick={()=>setView('selected')} label="Selected" count={totalSelected}/>
    <FilterButton active={view==='not-selected'} onClick={()=>setView('not-selected')} label="Not selected" count={Math.max(0,rows.length-totalSelected)}/>
   </div>
  </section>}

  {!error&&<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map(r=>{
   const id=String(r.id),saved=savedIds.has(id),checked=selected.has(id);
   return <ResidentCard key={id} resident={r} selected={checked} onClick={()=>assignmentMode&&!saved&&toggle(id)} actions={saved?<span className="status-chip bg-emerald-50 text-emerald-700">Selected</span>:<label className="flex items-center gap-2 text-sm font-semibold text-body"><input type="checkbox" checked={checked} onChange={()=>toggle(id)} onClick={e=>e.stopPropagation()} className="h-5 w-5"/> {checked?'Ready to save':'Select resident'}</label>}><ResidentFields resident={r}/></ResidentCard>
  })}</section>}

  {!error&&!visible.length&&<div className="empty-state">No residents in this group.</div>}

  {pickerOpen&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Select residents">
   <section className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
    <header className="flex items-center justify-between border-b border-border px-4 py-4 sm:px-6">
     <div><p className="eyebrow">Resident picker</p><h2 className="mt-1 text-xl">Select residents</h2><p className="mt-1 text-sm text-body">{selected.size} ready to save</p></div>
     <button type="button" className="btn-secondary" onClick={()=>setPickerOpen(false)}>Close</button>
    </header>
    <div className="border-b border-border p-4 sm:p-6">
     <input autoFocus className="field" value={pickerQuery} onChange={e=>setPickerQuery(e.target.value)} placeholder="Search name, ID, mobile, address or box"/>
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-3 sm:p-5">
     {pickerRows.map(r=>{
      const id=String(r.id),saved=savedIds.has(id),checked=selected.has(id);
      return <button type="button" key={id} disabled={saved} onClick={()=>toggle(id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${saved?'cursor-default border-emerald-200 bg-emerald-50':checked?'border-primary bg-primary-light':'border-border bg-white hover:border-primary/40'}`}>
       <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm font-bold ${saved||checked?'border-primary bg-primary text-white':'border-slate-300 bg-white text-transparent'}`}>✓</span>
       <span className="min-w-0 flex-1"><strong className="block truncate text-navy">{r.name||'Unnamed resident'}</strong><span className="mt-1 block truncate text-xs text-body">{r.national_id||`Resident ${r.id}`} · {r.house||r.lives_in||'Address unavailable'} · {r.phone||'No mobile'}</span></span>
       <span className="shrink-0 text-xs font-semibold text-body">{saved?'Saved':checked?'Selected':'Select'}</span>
      </button>;
     })}
     {!pickerRows.length&&<div className="empty-state">No matching residents.</div>}
    </div>
    <footer className="flex flex-col gap-2 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
     <p className="text-sm text-body">Choose residents here, then save the assignment.</p>
     <div className="flex gap-2"><button type="button" className="btn-secondary flex-1 sm:flex-none" onClick={()=>setPickerOpen(false)}>Done selecting</button>{selected.size>0&&<button type="button" className="btn-primary flex-1 sm:flex-none" disabled={submitting} onClick={submit}>{submitting?'Saving…':`Save ${selected.size}`}</button>}</div>
    </footer>
   </section>
  </div>}
 </main>;
}

function residentMatches(resident:Resident,query:string){
 const normalized=query.trim().toLowerCase();
 if(!normalized)return true;
 return [resident.name,resident.national_id,resident.phone,resident.house,resident.lives_in,resident.election_box,resident.id].join(' ').toLowerCase().includes(normalized);
}

function FilterButton({active,onClick,label,count}:{active:boolean;onClick:()=>void;label:string;count:number}){
 return <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-3 text-left transition ${active?'border-primary bg-primary-light text-primary':'border-border bg-card text-body hover:border-primary/40'}`}><span className="block text-xs font-semibold">{label}</span><strong className="mt-1 block text-lg text-navy">{count}</strong></button>;
}
