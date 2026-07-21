'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {getHouseOptions,getPartyOptions,getResidentsPage} from '../lib/supabase';
import type {HouseOption,PartyOption} from '../lib/supabase';
import type {Resident} from '../lib/types';
import StatusBadge from '../shared/StatusBadge';

const PAGE_SIZE=25;

type ViewMode='list'|'gallery';

export default function VoterManagementContent(){
 const [rows,setRows]=useState<Resident[]>([]);
 const [houses,setHouses]=useState<HouseOption[]>([]);
 const [parties,setParties]=useState<PartyOption[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [query,setQuery]=useState('');
 const [debouncedQuery,setDebouncedQuery]=useState('');
 const [filter,setFilter]=useState('all');
 const [house,setHouse]=useState('all');
 const [party,setParty]=useState('all');
 const [houseSearch,setHouseSearch]=useState('');
 const [page,setPage]=useState(1);
 const [count,setCount]=useState(0);
 const [view,setView]=useState<ViewMode>('list');

 useEffect(()=>{getHouseOptions().then(setHouses).catch(()=>setHouses([]));getPartyOptions().then(setParties).catch(()=>setParties([]))},[]);
 useEffect(()=>{const timer=window.setTimeout(()=>setDebouncedQuery(query),300);return()=>window.clearTimeout(timer)},[query]);
 useEffect(()=>setPage(1),[debouncedQuery,filter,house,party]);
 useEffect(()=>{
  let active=true;setLoading(true);setError('');
  getResidentsPage({page,pageSize:PAGE_SIZE,search:debouncedQuery,filter,house,party})
   .then(result=>{if(active){setRows(result.rows);setCount(result.count)}})
   .catch(e=>{if(active)setError(e instanceof Error?e.message:'Unable to load residents')})
   .finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[page,debouncedQuery,filter,house,party]);

 const pages=Math.max(1,Math.ceil(count/PAGE_SIZE));
 const range=useMemo(()=>{if(count===0)return'0';const start=(page-1)*PAGE_SIZE+1;const end=Math.min(page*PAGE_SIZE,count);return`${start.toLocaleString()}–${end.toLocaleString()}`},[page,count]);
 const visibleHouses=useMemo(()=>houses.filter(item=>item.name.toLowerCase().includes(houseSearch.toLowerCase())).slice(0,80),[houses,houseSearch]);
 const selectedHouse=houses.find(item=>item.name===house);
 const selectedParty=parties.find(item=>item.name===party);
 const hasFilters=Boolean(query||filter!=='all'||house!=='all'||party!=='all');
 function clearFilters(){setQuery('');setFilter('all');setHouse('all');setParty('all');setHouseSearch('')}

 return <div className="space-y-6">
  <section className="rounded-3xl bg-gradient-to-br from-[#17324D] via-[#183B57] to-[#0F5960] p-6 text-white shadow-xl md:p-8">
   <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
    <div><p className="text-xs font-bold uppercase tracking-[.22em] text-teal-100">Campaign operations</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">Residents</h1><p className="mt-2 max-w-2xl text-sm text-slate-200 md:text-base">Search residents, select a party or house, and switch between list and gallery view.</p></div>
    <div className="grid grid-cols-2 gap-3 sm:flex"><Metric label="Results" value={count.toLocaleString()}/><Metric label="Houses" value={houses.length.toLocaleString()}/></div>
   </div>
  </section>

  <section className="panel overflow-visible">
   <div className="grid gap-3 xl:grid-cols-[minmax(240px,1fr)_minmax(220px,.8fr)_180px_210px_auto]">
    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Search resident</span><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span><input className="field pl-9" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, ID, phone or address" autoComplete="off"/></div></label>

    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">House</span><div className="relative"><input className="field pr-10" list="house-options" value={house==='all'?houseSearch:house} onChange={e=>{setHouseSearch(e.target.value);setHouse('all')}} onBlur={()=>{const match=houses.find(h=>h.name.toLowerCase()===houseSearch.trim().toLowerCase());if(match){setHouse(match.name);setHouseSearch('')}}} placeholder="Search or select house"/><button type="button" aria-label="Clear house" onClick={()=>{setHouse('all');setHouseSearch('')}} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100">×</button><datalist id="house-options">{visibleHouses.map(item=><option key={item.name} value={item.name}>{item.count} residents</option>)}</datalist></div>{selectedHouse&&<span className="mt-1 block text-xs font-semibold text-teal-700">{selectedHouse.count} residents in {selectedHouse.name}</span>}</label>

    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Party</span><select className="field" value={party} onChange={e=>setParty(e.target.value)}><option value="all">All parties</option>{parties.map(item=><option key={item.name} value={item.name}>{item.name} ({item.count})</option>)}</select>{selectedParty&&<span className="mt-1 block text-xs font-semibold text-teal-700">{selectedParty.count} residents in {selectedParty.name}</span>}</label>

    <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Campaign status</span><select className="field" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All statuses</option><option value="will-vote">Will vote</option><option value="not-decided">Not decided</option><option value="not-vote">Not voting</option><option value="need-call">Need call</option><option value="called">Called</option><option value="not-visited">Not visited</option><option value="reach">Visited / reached</option><option value="guaranteed">Guaranteed</option></select></label>

    <div className="flex items-end"><button type="button" className="action w-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 xl:w-auto" onClick={clearFilters} disabled={!hasFilters}>Clear filters</button></div>
   </div>
  </section>

  <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
   <PartySummary label="All parties" value={parties.reduce((sum,item)=>sum+item.count,0)} active={party==='all'} onClick={()=>setParty('all')}/>
   {parties.map(item=><PartySummary key={item.name} label={item.name} value={item.count} active={party===item.name} onClick={()=>setParty(item.name)}/>) }
  </section>

  {error&&<div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

  <section className="panel overflow-hidden p-0">
   <div className="border-b border-slate-200 px-5 py-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="font-bold text-slate-900">Resident directory</h2><p className="text-sm text-slate-500">Showing {range} of {count.toLocaleString()}</p></div><div className="flex flex-wrap items-center gap-2">{party!=='all'&&<span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700 ring-1 ring-teal-200">Party: {party}</span>}{house!=='all'&&<span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">House: {house}</span>}<div className="ml-0 flex rounded-xl border border-slate-200 bg-slate-50 p-1 sm:ml-2"><button type="button" onClick={()=>setView('list')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view==='list'?'bg-white text-teal-700 shadow-sm':'text-slate-500'}`}>List</button><button type="button" onClick={()=>setView('gallery')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view==='gallery'?'bg-white text-teal-700 shadow-sm':'text-slate-500'}`}>Gallery</button></div></div></div></div>

   {view==='list'?<ListView rows={rows} loading={loading}/>:<GalleryView rows={rows} loading={loading}/>} 

   <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm sm:flex-row"><span className="text-slate-500">Page {page} of {pages}</span><div className="flex gap-2"><button className="action border border-slate-200 bg-white text-slate-700" disabled={loading||page===1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Previous</button><button className="action bg-[#0F8B8D] text-white shadow-sm hover:bg-[#0C7476]" disabled={loading||page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))}>Next</button></div></div>
  </section>
 </div>;
}

function ListView({rows,loading}:{rows:Resident[];loading:boolean}){return <div className="overflow-x-auto" aria-busy={loading}><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-slate-50"><tr className="border-b border-slate-200 text-[11px] uppercase tracking-[.12em] text-slate-500"><th className="p-4">Resident</th><th className="p-4">National ID</th><th className="p-4">Official address</th><th className="p-4">Phone</th><th className="p-4">Party</th><th className="p-4">Vote</th><th className="p-4">Call</th><th className="p-4">Visit</th></tr></thead><tbody>{loading?Array.from({length:7}).map((_,i)=><tr key={i} className="border-b border-slate-100"><td colSpan={8} className="p-4"><div className="h-12 animate-pulse rounded-xl bg-slate-100"/></td></tr>):rows.length?rows.map(r=><tr key={String(r.id)} className="border-b border-slate-100 transition hover:bg-[#F7FAFC]"><td className="p-4"><div className="flex items-center gap-3"><ResidentPhoto resident={r}/><div className="min-w-0"><Link prefetch={false} href={`/voter-detail/?id=${encodeURIComponent(String(r.id))}`} className="block truncate font-bold text-slate-900 hover:text-teal-700">{r.name||'Unnamed resident'}</Link><div className="truncate text-xs text-slate-500">{r.lives_in||'Living address not recorded'}</div></div></div></td><td className="p-4 font-medium text-slate-600">{r.national_id||'—'}</td><td className="p-4 text-slate-600">{r.house||'—'}</td><td className="p-4 text-slate-600">{r.phone||'—'}</td><td className="p-4"><PartyBadge party={r.party}/></td><td className="p-4"><StatusBadge status={r.vote_status}/></td><td className="p-4"><StatusBadge status={r.phone_status}/></td><td className="p-4"><StatusBadge status={r.d2d_status}/></td></tr>):<EmptyState/>}</tbody></table></div>}

function GalleryView({rows,loading}:{rows:Resident[];loading:boolean}){if(loading)return <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({length:6}).map((_,i)=><div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100"/>)}</div>;if(!rows.length)return <div className="p-14"><div className="mx-auto max-w-sm text-center"><div className="text-3xl">⌕</div><h3 className="mt-3 font-bold text-slate-900">No residents found</h3><p className="mt-1 text-sm text-slate-500">Try another party, house, search, or status.</p></div></div>;return <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{rows.map(r=><article key={String(r.id)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"><div className="flex items-start gap-4"><ResidentPhoto resident={r} large/><div className="min-w-0 flex-1"><Link prefetch={false} href={`/voter-detail/?id=${encodeURIComponent(String(r.id))}`} className="block truncate text-lg font-extrabold text-slate-900 hover:text-teal-700">{r.name||'Unnamed resident'}</Link><p className="mt-1 text-sm font-medium text-slate-500">{r.national_id||'No national ID'}</p><div className="mt-2"><PartyBadge party={r.party}/></div></div></div><dl className="mt-5 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-400">House</dt><dd className="text-right font-semibold text-slate-700">{r.house||'—'}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Phone</dt><dd className="text-right font-semibold text-slate-700">{r.phone||'—'}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Living now</dt><dd className="truncate text-right font-semibold text-slate-700">{r.lives_in||'—'}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2"><StatusBadge status={r.vote_status}/><StatusBadge status={r.phone_status}/><StatusBadge status={r.d2d_status}/></div><Link prefetch={false} href={`/voter-detail/?id=${encodeURIComponent(String(r.id))}`} className="action mt-5 w-full bg-[#0F8B8D] text-white hover:bg-[#0C7476]">Open resident</Link></article>)}</div>}

function EmptyState(){return <tr><td colSpan={8} className="p-14 text-center"><div className="mx-auto max-w-sm"><div className="text-3xl">⌕</div><h3 className="mt-3 font-bold text-slate-900">No residents found</h3><p className="mt-1 text-sm text-slate-500">Try another party, house, search, or campaign status.</p></div></td></tr>}
function Metric({label,value}:{label:string;value:string}){return <div className="min-w-28 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur"><div className="text-2xl font-extrabold">{value}</div><div className="text-xs font-semibold text-slate-200">{label}</div></div>}
function PartySummary({label,value,active,onClick}:{label:string;value:number;active:boolean;onClick:()=>void}){return <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left transition ${active?'border-teal-500 bg-teal-50 shadow-sm':'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'}`}><div className="text-2xl font-extrabold text-slate-900">{value.toLocaleString()}</div><div className={`mt-1 text-sm font-bold ${active?'text-teal-700':'text-slate-500'}`}>{label}</div></button>}
function ResidentPhoto({resident,large=false}:{resident:Resident;large?:boolean}){const initials=(resident.name||'?').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();const size=large?'h-20 w-20 rounded-2xl text-lg':'h-12 w-12 rounded-2xl text-xs';return resident.photo_url?<img src={resident.photo_url} alt={resident.name?`${resident.name} photo`:'Resident photo'} className={`${size} shrink-0 border border-slate-200 object-cover shadow-sm`} loading="lazy" referrerPolicy="no-referrer"/>:<div className={`grid ${size} shrink-0 place-items-center bg-gradient-to-br from-slate-100 to-slate-200 font-extrabold text-slate-600`}>{initials}</div>}
function PartyBadge({party}:{party?:string|null}){if(!party||party==='Unspecified')return <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">Unspecified</span>;const key=party.toUpperCase();const cls=key==='PNC'?'bg-teal-50 text-teal-700 ring-teal-200':key==='MDP'?'bg-yellow-50 text-yellow-800 ring-yellow-200':'bg-slate-50 text-slate-700 ring-slate-200';return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${cls}`}>{party}</span>}
