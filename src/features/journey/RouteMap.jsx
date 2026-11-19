import React from 'react';
import Illustration from '../../components/Illustration.jsx';
const points=[[18,87],[33,54],[56,77],[70,46],[87,25]];
export const storySrc=import.meta.env.BASE_URL+'assets/adal/story-cards.png';
export function StoryArt({cell}){return <Illustration src={storySrc} cell={cell} columns={5} rows={4}/>}
export default function RouteMap({chapter,state,lang,onSelect}){return <div className="adal-map" aria-label={lang==='kk'?'Саяхат бағыты':'Карта путешествия'}>
<img src={import.meta.env.BASE_URL+'assets/adal/route-map.png'} alt=""/>
{chapter.stations.map((s,i)=><button key={s.id} data-chapter-station={s.id} className="adal-map-stop" style={{left:points[i][0]+'%',top:points[i][1]+'%'}} aria-current={state.active===i?'step':undefined} onClick={()=>onSelect(i)}><strong>{state.stations[s.id].status==='completed'?'✓':i+1}</strong><span>{s.title[lang]}</span></button>)}
<div className="adal-traveller" style={{left:points[state.active][0]+'%',top:points[state.active][1]+'%'}}><StoryArt cell={17}/></div>
</div>}
