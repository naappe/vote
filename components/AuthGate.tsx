'use client';
import {useEffect,useState} from 'react';
import type {Session} from '@supabase/supabase-js';
import {supabase} from '../lib/supabase';
import AuthControl from './AuthControl';

let cachedSession:Session|null|undefined;
let sessionRequest:Promise<Session|null>|null=null;
function readSession(){
 if(cachedSession!==undefined)return Promise.resolve(cachedSession);
 if(!sessionRequest)sessionRequest=supabase.auth.getSession().then(({data})=>{
  cachedSession=data.session;sessionRequest=null;return cachedSession;
 }).catch(()=>{sessionRequest=null;return null});
 return sessionRequest;
}
export default function AuthGate({children}:{children:React.ReactNode}){
 const [session,setSession]=useState<Session|null>(()=>cachedSession??null);
 const [ready,setReady]=useState(()=>cachedSession!==undefined);
 useEffect(()=>{
  let active=true;
  readSession().then(next=>{if(active){setSession(next);setReady(true)}});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
   cachedSession=next;setSession(next);setReady(true);
  });
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 if(!ready)return <div className="grid min-h-screen place-items-center bg-calm-50 p-6"><div className="h-14 w-48 animate-pulse rounded-2xl bg-primary-light"/></div>;
 if(!session)return <main className="grid min-h-screen place-items-center bg-calm-50 p-5"><section className="panel w-full max-w-md text-center"><div className="brand-mark mx-auto">VO</div><p className="eyebrow mt-5">Secure campaign access</p><h1 className="mt-2 text-3xl">Login required</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-body">Campaign residents, reports and operational data are hidden until an authorised user signs in.</p><div className="mt-6 flex justify-center"><AuthControl/></div></section></main>;
 return <>{children}</>;
}
