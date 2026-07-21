'use client';
import {useEffect,useMemo,useState} from 'react';

const slides=[
 {kicker:'Election readiness',title:'Every resident. Every contact. One clear operation.',copy:'Track outreach, visits, assignments, transport and turnout without changing the verified resident master.'},
 {kicker:'Section ownership',title:'Results stay inside the section that created them.',copy:'Call Center, Door-to-Door and Election Day use separate tables, filters and share links.'},
 {kicker:'Field confidence',title:'Designed for fast work on phones, tablets and desktops.',copy:'Clear photos, compact actions and party-specific filtering keep every queue focused.'}
];
const electionDate=new Date('2026-07-11T08:00:00+05:00').getTime();

export default function CampaignShowcase(){
 const [index,setIndex]=useState(0),[now,setNow]=useState(Date.now());
 useEffect(()=>{const slide=window.setInterval(()=>setIndex(v=>(v+1)%slides.length),6000);const clock=window.setInterval(()=>setNow(Date.now()),1000);return()=>{window.clearInterval(slide);window.clearInterval(clock)}},[]);
 const time=useMemo(()=>{const diff=Math.max(0,electionDate-now);return {days:Math.floor(diff/86400000),hours:Math.floor(diff/3600000)%24,minutes:Math.floor(diff/60000)%60,seconds:Math.floor(diff/1000)%60}},[now]);
 const current=slides[index];
 return <section className="campaign-showcase" aria-label="Campaign highlights">
  <div className="campaign-slide"><p className="campaign-kicker">{current.kicker}</p><h2>{current.title}</h2><p>{current.copy}</p><div className="campaign-dots">{slides.map((_,i)=><button type="button" aria-label={`Show slide ${i+1}`} key={i} onClick={()=>setIndex(i)} className={i===index?'campaign-dot-active':''}/>)}</div></div>
  <div className="campaign-countdown"><p className="campaign-kicker">Election countdown</p><div className="countdown-grid"><Time value={time.days} label="Days"/><Time value={time.hours} label="Hours"/><Time value={time.minutes} label="Minutes"/><Time value={time.seconds} label="Seconds"/></div><p className="countdown-date">11 July 2026 · Villimalé</p></div>
 </section>
}
function Time({value,label}:{value:number;label:string}){return <div><strong>{String(value).padStart(2,'0')}</strong><span>{label}</span></div>}
