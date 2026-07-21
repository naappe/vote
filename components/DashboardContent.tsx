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
import {ResidentCard,ResidentFields} from '../shared/ResidentCard';

const empty:DashboardStats={total:0,willVote:0,undecided:0,notVote:0,needCall:0,called:0,reached:0,notReached:0,visited:0,unvisited:0};
export default function DashboardContent(){
 const [residents,setResidents]=useState<Resident[]>([]);const [loading,setLoading]=useState(true);const [query,setQuery]=useState('');const [error,setError]=useState('');
 useEffect(()=>{getResidents().then(setResidents).catch(e=>setError(e.message||'Unable to load campaign')).finally(()=>setLoading(false))},[]);
 const stats=useMemo(()=>residents.reduce((s,r)=>{s.total++;if(r.vote_status==='will-vote')s.willVote++;else if(r.vote_status==='not-vote')s.notVote++;else s.undecided++;if(r.phone_status==='called')s.called++;else s.needCall++;const reached=r.reach_status==='reached'||r.phone_status==='called'||r.vote_status==='will-vote'||r.vote_status==='not-vote'||r.support_level==='guaranteed';if(reached)s.reached++;else s.notReached++;if(r.d2d_status&&r.d2d_status!=='not-visited')s.visited++;else s.unvisited++;return s;},{...empty}),[residents]);
 const visible=residents.filter(r=>[r.name,r.national_id,r.house,r.phone].join(' ').toLowerCase().includes(query.toLowerCase())).slice(0,8);
 if(loading)return <div className="panel"><div className="h-24 animate-pulse rounded-card bg-primary-light"/></div>;
 if(error)return <div className="error-banner">{error}</div>;
 return <div className="space-y-6"><section className="page-hero"><p className="eyebrow">Campaign overview</p><h1 className="mt-3 max-w-2xl">Operations dashboard</h1></section><div className="grid gap-5 xl:grid-cols-3"><VoteStatusChart stats={stats}/><PhoneStatusChart stats={stats}/><ReachProgressBar stats={stats}/></div><div className="grid gap-5 xl:grid-cols-[1.45fr_.55fr]"><section className="panel"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Priority residents</p><h2 className="mt-1">Worklist</h2></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, ID, house or phone" className="field sm:max-w-sm"/></div><div className="grid gap-3 sm:grid-cols-2">{visible.map(r=><ResidentCard key={String(r.id)} resident={r} actions={<div className="flex flex-wrap gap-2"><StatusBadge status={r.vote_status}/><StatusBadge status={r.phone_status}/><StatusBadge status={r.d2d_status}/></div>}><ResidentFields resident={r}/></ResidentCard>)}</div></section><ActivityFeed items={mockActivity}/></div></div>;
}
