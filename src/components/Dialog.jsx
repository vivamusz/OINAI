import React,{useEffect,useRef} from 'react';
export default function Dialog({title,children,close,label,art}){
 const ref=useRef(null);
 useEffect(()=>{const d=ref.current;d.showModal();return ()=>d.close()},[]);
 return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();close()}} onClick={e=>{if(e.target===e.currentTarget)close()}}><div className="dialog-scenery" aria-hidden="true">{art}</div><div className="dialog-body"><button className="close-dialog" onClick={close} aria-label={label}>×</button><h2 id="dialog-title">{title}</h2>{children}</div></dialog>;
}
