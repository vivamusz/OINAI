import React from 'react';
// Reuse only the illustration regions of the supplied concept; labels remain HTML.
export default function Artwork({rect,className=''}){
 const [x,y,w,h]=rect;
 return <div aria-hidden="true" className={`artwork ${className}`} style={{aspectRatio:`${w}/${h}`}}><img draggable="false" src={`${import.meta.env.BASE_URL}assets/oinai-concept.png`} alt="" style={{width:`${1672/w*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`}}/></div>;
}
