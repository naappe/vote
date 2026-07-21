'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';

export default function LegacyVoterDetailRedirect(){
 const [target,setTarget]=useState('/resident-profile/');
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const id=params.get('id');
  const base=window.location.pathname.replace(/\/voter-detail\/?$/i,'');
  const destination=`${base}/resident-profile/${id?`?id=${encodeURIComponent(id)}`:''}`;
  setTarget(destination);
  window.location.replace(destination);
 },[]);
 return <main className="grid min-h-screen place-items-center bg-background p-6"><section className="master-card max-w-lg text-center"><div className="brand-mark mx-auto">VO</div><p className="eyebrow mt-5">Redirecting</p><h1 className="mt-2">Opening resident profile</h1><p className="mt-3 text-sm text-body">This older resident link has been upgraded to the current profile page.</p><Link href={target} className="btn-primary mt-6">Continue to resident profile</Link></section></main>
}
