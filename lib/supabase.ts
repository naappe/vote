import {createClient} from '@supabase/supabase-js';
import type {Resident} from './types';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL||'https://espezmdpkoixnfchomqb.supabase.co';
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||'sb_publishable_xP8z74zcMuCkj6xlu1bJ3w_Kudqbcu1';
export const supabase=createClient(url,key);

export async function getResidents():Promise<Resident[]>{
  const pageSize=1000; const rows:Resident[]=[];
  for(let from=0;;from+=pageSize){
    const {data,error}=await supabase.from('campaign').select('*').order('id',{ascending:true}).range(from,from+pageSize-1);
    if(error) throw error;
    rows.push(...((data||[]) as Resident[]));
    if((data||[]).length<pageSize) break;
  }
  return rows;
}

export async function updateResident(id:Resident['id'],changes:Partial<Resident>){
  const {data,error}=await supabase.from('campaign').update(changes).eq('id',id).select().single();
  if(error) throw error;
  return data as Resident;
}
