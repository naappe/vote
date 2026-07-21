'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {PartyLegend} from '../shared/PartyIdentity';

const pages:Record<string,{title:string;eyebrow:string;dot:string;active:string}>= {
 '/':{title:'Operations Dashboard',eyebrow:'Campaign overview',dot:'bg-blue-500',active:'bg-blue-600'},
 '/voter-management':{title:'Residents',eyebrow:'Read-only resident master',dot:'bg-blue-500',active:'bg-blue-600'},
 '/voter-detail':{title:'Resident Profile',eyebrow:'Resident identity and section results',dot:'bg-blue-500',active:'bg-blue-600'},
 '/call-center':{title:'Call Center',eyebrow:'Phone outreach results',dot:'bg-violet-500',active:'bg-violet-600'},
 '/door-to-door':{title:'Door-to-Door',eyebrow:'Field visit results',dot:'bg-emerald-500',active:'bg-emerald-600'},
 '/election-day':{title:'Election Day',eyebrow:'Turnout operations',dot:'bg-rose-500',active:'bg-rose-600'},
 '/admin-verification':{title:'Contact Verification',eyebrow:'Correction review queue',dot:'bg-cyan-500',active:'bg-cyan-600'},
 '/reports':{title:'Reports',eyebrow:'Cross-section analytics',dot:'bg-slate-700',active:'bg-slate-800'},
 '/notifications':{title:'Notifications',eyebrow:'Items needing attention',dot:'bg-amber-500',active:'bg-amber-600'},
 '/settings':{title:'Settings',eyebrow:'System configuration',dot:'bg-slate-500',active:'bg-slate-700'}
};
function normalize(path:string){const clean=path.replace(/^\/Vote(?=\/|$)/i,'')||'/';return clean==='/'?'/':clean.replace(/\/$/,'')}
export default function Header(){
 const current=normalize(usePathname()),page=pages[current]||pages['/'];
 const mobile=[['Dashboard','/'],['Residents','/voter-management/'],['Calls','/call-center/'],['Visits','/door-to-door/'],['Election','/election-day/'],['Verify','/admin-verification/'],['Reports','/reports/']];
 return <><header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:min-h-20 lg:px-8"><div className="flex min-w-0 items-center gap-3"><span className={`h-10 w-1.5 rounded-full ${page.dot}`}/><div className="min-w-0"><p className="eyebrow truncate">{page.eyebrow}</p><h1 className="truncate text-lg sm:text-xl">{page.title}</h1></div></div><div className="flex items-center gap-3"><div className="hidden xl:block"><PartyLegend/></div><Link prefetch={false} href="/notifications/" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-body shadow-card"><span>●</span><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"/></Link><div className="grid h-11 w-11 place-items-center rounded-full bg-navy text-xs font-extrabold text-white">MM</div></div></header><nav className="sticky top-16 z-20 flex gap-2 overflow-x-auto border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur lg:hidden">{mobile.map(([label,href])=>{const target=href==='/'?'/':href.replace(/\/$/,'');return <Link prefetch={false} key={href} href={href} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold text-white ${current===target?page.active:'bg-slate-400'}`}>{label}</Link>})}</nav></>
}
