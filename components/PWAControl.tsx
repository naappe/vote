'use client';
import {useEffect,useState} from 'react';

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};

export default function PWAControl(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null),[installed,setInstalled]=useState(false),[online,setOnline]=useState(true);
 useEffect(()=>{
  if('serviceWorker'in navigator)navigator.serviceWorker.register('/Vote/sw.js').catch(()=>{});
  const standalone=window.matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
  setInstalled(standalone);setOnline(navigator.onLine);
  const beforeInstall=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallPromptEvent)};
  const appInstalled=()=>{setInstalled(true);setPromptEvent(null)};
  const onlineHandler=()=>setOnline(true),offlineHandler=()=>setOnline(false);
  window.addEventListener('beforeinstallprompt',beforeInstall);
  window.addEventListener('appinstalled',appInstalled);
  window.addEventListener('online',onlineHandler);window.addEventListener('offline',offlineHandler);
  return()=>{window.removeEventListener('beforeinstallprompt',beforeInstall);window.removeEventListener('appinstalled',appInstalled);window.removeEventListener('online',onlineHandler);window.removeEventListener('offline',offlineHandler)};
 },[]);
 async function install(){if(!promptEvent)return;await promptEvent.prompt();const choice=await promptEvent.userChoice;if(choice.outcome==='accepted')setInstalled(true);setPromptEvent(null)}
 if(!online)return <span className="status-chip bg-amber-50 text-amber-700">Offline</span>;
 if(installed)return <span className="hidden status-chip bg-emerald-50 text-emerald-700 sm:inline-flex">Desktop app</span>;
 if(!promptEvent)return null;
 return <button type="button" className="btn-secondary whitespace-nowrap" onClick={install}>Install app</button>;
}
