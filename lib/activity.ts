'use client';
import {supabase} from './supabase';

function deviceInfo(){
 const ua=navigator.userAgent;
 const device=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)?'Mobile':'Desktop';
 const browser=/Edg\//.test(ua)?'Edge':/Chrome\//.test(ua)?'Chrome':/Firefox\//.test(ua)?'Firefox':/Safari\//.test(ua)?'Safari':'Other browser';
 const operating_system=/Windows/i.test(ua)?'Windows':/Android/i.test(ua)?'Android':/iPhone|iPad|iPod/i.test(ua)?'iOS':/Mac OS/i.test(ua)?'macOS':/Linux/i.test(ua)?'Linux':'Other';
 return {device,browser,operating_system,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||''};
}
export function recordActivity(route:string,event_type:'page_view'|'login'='page_view'){
 const send=(location?:GeolocationPosition)=>supabase.functions.invoke('track-activity',{body:{route,event_type,...deviceInfo(),latitude:location?.coords.latitude,longitude:location?.coords.longitude,location_accuracy:location?Math.round(location.coords.accuracy):undefined}}).catch(()=>{});
 if(typeof navigator==='undefined'||!navigator.geolocation){send();return}
 navigator.geolocation.getCurrentPosition(send,()=>send(),{enableHighAccuracy:false,maximumAge:600000,timeout:10000});
}
