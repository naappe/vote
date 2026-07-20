'use client';
import {useEffect,useMemo,useState} from 'react';
import {getResidents} from '../lib/supabase';
import {mockActivity} from '../lib/mockData';
import type {DashboardStats,Resident} from '../lib/types';
import VoteStatusChart from './VoteStatusChart';
import PhoneStatusChart from './PhoneStatusChart';
import ReachProgressBar from './ReachProgressBar';
import ActivityFeed from './ActivityFeed';
import StatusBadge from '../shared/StatusBadge';

const empty:DashboardStats={total:0,willVote:0,undecided:0,notVote:0,needCall:0,called:0,reached:0,notReached:0,visited:0,unvisited:0};
export default function DashboardContent(){
 const [residents,setResidents]=useState<Resident[]>([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState(''); const [error,setError]=useState('');
 useEffect(()=>{getResidents().then(setResidents).catch(e=>setError(e.message||'Unable to load campaign')).finally(()=>setLoading(false))},[]);
 const stats=useMemo(()=>residents.reduce((s,r)=>{s.total++; if(r.vote_status==='will-vote')s.willVote++; else if(r.vote_status==='not-vote')s.notVote++; else s.undecided++; if(r.phone_status==='called')s.called++; else s.needCall++; const reached=r.reach_status==='reached'||r.phone_status==='called'||r.vote_status==='will-vote'||r.vote_status==='not-vote'||r.support_level==='guaranteed'; if(reached)s.reached++;else s.notReached++; if(r.d2d_status&&r.d2d_status!=='not-visited')s.visited++;else s.unvisited++; return s;},{...empty}),[residents]);
 const visible=residents.filter(r=>[r.name,r.national_id,r.house,r.phone].join(' ').toLowerCase().includes(query.toLowerCase())).slice(0,8);
 if(loading)return <div className="panel">Connecting to the campaign database…</div>;
 if(error)return <div className="panel text-rose-700">{error}</div>;
 return <div className="space-y-6"><section className="rounded-3xl border border-calm-100 bg-gradient-to-br from-white to-calm-100 p-6 shadow-soft md:p-8"><p className="text-xs font-bold uppercase tracking-[.2em] text-calm-500">Live campaign care</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">A calm, logical view of every resident interaction.</h2><p className="mt-4 max-w-2xl text-slate-500">Calls, door-to-door visits, voting intention, reach status and remarks remain connected to one resident record.</p></section><div className="grid gap-5 xl:grid-cols-3"><VoteStatusChart stats={stats}/><PhoneStatusChart stats={stats}/><ReachProgressBar stats={stats}/></div><div className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]"><section className="panel"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="muted">Residents requiring attention</p><h2 className="section-title">Priority worklist</h2></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, ID, house or phone" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-calm-500"/></div><div className="space-y-2">{visible.map(r=><article key={String(r.id)} className="soft-card flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><b className="block">{r.name||'Unnamed resident'}</b><span className="text-xs text-slate-500">{r.national_id||'No ID'} · {r.house||r.lives_in||'Address unavailable'} {r.phone?`· ${r.phone}`:''}</span></div><div className="flex flex-wrap gap-2"><StatusBadge status={r.vote_status}/><StatusBadge status={r.phone_status}/><StatusBadge status={r.d2d_status}/></div></article>)}</div></section><ActivityFeed items={mockActivity}/></div></div>;
}
