import {STATUS_STYLES,statusLabel} from '../lib/voterConstants';

export default function StatusBadge({status,label}:{status?:string|null;label?:string}){
  const key=status||'not-decided';
  return <span className={`status-chip ${STATUS_STYLES[key]||'bg-slate-100 text-body'}`}>{label||statusLabel(key)}</span>;
}