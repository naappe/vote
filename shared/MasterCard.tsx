import type {HTMLAttributes,ReactNode} from 'react';

type MasterCardProps=HTMLAttributes<HTMLElement>&{
 children:ReactNode;
 as?:'article'|'section'|'div';
 interactive?:boolean;
};

export function MasterCard({children,as='article',interactive=true,className='',...props}:MasterCardProps){
 const Component=as;
 return <Component className={`master-card ${interactive?'':'master-card-static'} ${className}`.trim()} {...props}>{children}</Component>;
}

export function CardHeader({children,className=''}:{children:ReactNode;className?:string}){
 return <div className={`card-header ${className}`.trim()}>{children}</div>;
}

export function CardBody({children,className=''}:{children:ReactNode;className?:string}){
 return <div className={`card-body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({children,className=''}:{children:ReactNode;className?:string}){
 return <div className={`card-footer ${className}`.trim()}>{children}</div>;
}

export function MasterMetricCard({label,value,children,className=''}:{label:string;value:ReactNode;children?:ReactNode;className?:string}){
 return <MasterCard className={`metric-card ${className}`.trim()}><div><p className="eyebrow">{label}</p><strong className="mt-2 block text-3xl text-navy">{value}</strong></div>{children&&<div className="mt-3 text-sm text-body">{children}</div>}</MasterCard>;
}
