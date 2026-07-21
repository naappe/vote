'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import {getResidents} from '../lib/supabase';
import type {DashboardStats,Resident} from '../lib/types';
import VoteStatusChart from './VoteStatusChart';
import PhoneStatusChart from './PhoneStatusChart';
import ReachProgressBar from './ReachProgressBar';

const empty:DashboardStats={total:0,willVote:0,undecided:0,notVote:0,needCall:0,called:0,reached:0,notReached:0,visited:0,unvisited:0};
type SectionCard={title:string;href:string;accent:string;values:{label:string;value:number}[]};
type DashboardResident=Resident&{vote_assigned_by?:string|null;transport_status?:string|null;has_voted?:boolean|null};

export default function DashboardContent(){
 const [residents,setResidents]=useState<Resident[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{getResidents().then(setResidents).catch(e=>setError(e.message||'Unable to load campaign')).finally(()=>setLoading(false))},[]);
 const stats=useMemo(()=>residents.reduce((s,r)=>{s.total++;if(r.vote_status==='will-vote')s.willVote++;else if(r.vote_status==='not-vote')s.notVote++;else s.undecided++;if(r.phone_status==='called')s.called++;else s.needCall++;const reached=r.reach_status==='reached'||r.phone_status==='called'||r.vote_status==='will-vote'||r.vote_status==='not-vote'||r.support_level==='guaranteed';if(reached)s.reached++;else s.notReached++;if(r.d2d_status&&r.d2d_status!=='not-visited')s.visited++;else s.unvisited++;return s;},{...empty}),[residents]);
 const sections=useMemo<SectionCard[]>(()=>{
  const rows=residents as DashboardResident[];
  const assigned=rows.filter(r=>Boolean(r.vote_assigned_by)).length;
  const transport=rows.filter(r=>r.transport_status==='need-transport').length;
  const voted=rows.filter(r=>Boolean(r.has_voted)).length;
  const withRemarks=rows.filter(r=>Boolean(r.remarks&&r.remarks.trim())).length;
  const missingPhone=rows.filter(r=>!r.phone||!r.phone.trim()).length;
  return [
   {title:'Residents',href:'/residents/',accent:'bg-sky-500',values:[{label:'Total',value:stats.total},{label:'Reached',value:stats.reached},{label:'Pending',value:stats.notReached}]},
   {title:'Call Center',href:'/call-center/',accent:'bg-cyan-500',values:[{label:'Need call',value:stats.needCall},{label:'Called',value:stats.called},{label:'Coverage',value:stats.total?Math.round(stats.called/stats.total*100):0}]},
   {title:'Door-to-Door',href:'/door-to-door/',accent:'bg-emerald-500',values:[{label:'Pending',value:stats.unvisited},{label:'Completed',value:stats.visited},{label:'Coverage',value:stats.total?Math.round(stats.visited/stats.total*100):0}]},
   {title:'Assignments',href:'/assignments/',accent:'bg-violet-500',values:[{label:'Assigned',value:assigned},{label:'Unassigned',value:Math.max(0,stats.total-assigned)},{label:'Coverage',value:stats.total?Math.round(assigned/stats.total*100):0}]},
   {title:'Transportation',href:'/transportation/',accent:'bg-amber-500',values:[{label:'Need transport',value:transport},{label:'Not needed',value:Math.max(0,stats.total-transport)},{label:'Open',value:transport}]},
   {title:'Election Day',href:'/election-day/',accent:'bg-rose-500',values:[{label:'Voted',value:voted},{label:'Remaining',value:Math.max(0,stats.total-voted)},{label:'Turnout',value:stats.total?Math.round(voted/stats.total*100):0}]},
   {title:'Contact Verification',href:'/contact-verification/',accent:'bg-orange-500',values:[{label:'Missing phone',value:missingPhone},{label:'With phone',value:Math.max(0,stats.total-missingPhone)},{label:'Review',value:missingPhone}]},
   {title:'Remarks',href:'/remarks/',accent:'bg-fuchsia-500',values:[{label:'With remarks',value:withRemarks},{label:'No remarks',value:Math.max(0,stats.total-withRemarks)},{label:'Records',value:withRemarks}]},
   {title:'Reports',href:'/reports/',accent:'bg-indigo-500',values:[{label:'Will vote',value:stats.willVote},{label:'Not decided',value:stats.undecided},{label:'Not vote',value:stats.notVote}]}
  ];
 },[residents,stats]);
 if(loading)return <div className="panel"><div className="h-24 animate-pulse rounded-card bg-primary-light"/></div>;
 if(error)return <div className="error-banner">{error}</div>;
 return <div className="space-y-5">
  <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Live campaign analysis</p><h1 className="mt-1">Operations dashboard</h1><p className="mt-1 text-sm text-body">Every section shows its current workload and opens directly to the relevant records.</p></div><div className="status-chip bg-emerald-50 text-emerald-700">{stats.total.toLocaleString()} residents loaded</div></section>
  <div className="grid gap-4 xl:grid-cols-3"><VoteStatusChart stats={stats}/><PhoneStatusChart stats={stats}/><ReachProgressBar stats={stats}/></div>
  <section><div className="mb-3 flex items-center justify-between"><div><p className="eyebrow">Section results</p><h2 className="mt-1">Workload and progress</h2></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{sections.map(section=><Link prefetch href={section.href} key={section.title} className="group rounded-xl border border-border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"><div className="flex items-center gap-3"><span className={`h-2.5 w-2.5 rounded-full ${section.accent}`}/><h3 className="font-semibold group-hover:text-primary">{section.title}</h3><span className="ml-auto text-sm text-body">Open →</span></div><div className="mt-4 grid grid-cols-3 gap-2">{section.values.map((item,index)=><div key={item.label} className="rounded-lg bg-slate-50 px-3 py-3"><strong className="block text-lg font-semibold text-navy">{index===2&&['Coverage','Turnout'].includes(item.label)?`${item.value}%`:item.value.toLocaleString()}</strong><span className="mt-1 block text-[11px] text-body">{item.label}</span></div>)}</div></Link>)}</div></section>
 </div>;
}