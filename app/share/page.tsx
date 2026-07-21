import {Suspense} from 'react';
import WorkflowShareContent from '../../components/WorkflowShareContent';
export default function Page(){return <Suspense fallback={<main className="p-6">Loading shared worklist…</main>}><WorkflowShareContent/></Suspense>}
