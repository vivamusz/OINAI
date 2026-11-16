import React from 'react';

// Shared renderer: future games can pass a PECS image directly, or an atlas cell.
// Text stays in HTML so that an illustration never fixes the interface language.
export default function Illustration({src,cell,columns=1,rows=1,className=''}){
 if(cell===undefined)return <img className={`game-illustration ${className}`} src={src} alt="" aria-hidden="true" draggable="false"/>;
 const x=cell%columns,y=Math.floor(cell/columns);
 return <span aria-hidden="true" className={`game-illustration atlas-illustration ${className}`} style={{backgroundImage:`url("${src}")`,backgroundSize:`${columns*100}% ${rows*100}%`,backgroundPosition:`${columns>1?x/(columns-1)*100:0}% ${rows>1?y/(rows-1)*100:0}%`}}/>;
}
