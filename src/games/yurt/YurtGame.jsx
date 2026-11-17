import React,{useEffect,useReducer,useRef,useState} from 'react';
import {parts,lessons,text} from './data.js';
import {initialYurt,reduceYurt,choicesFor} from './session.js';
import Illustration from '../../components/Illustration.jsx';
import Dialog from '../../components/Dialog.jsx';
import './yurt.css';
const asset=name=>`${import.meta.env.BASE_URL}assets/yurt/${name}`;
const getPart=id=>parts.find(p=>p.id===id);
function PartArt({cell}){return <Illustration src={asset('parts-atlas.png')} cell={cell} columns={4} rows={2}/>;}
function Board({part,u,lang}){return <figure className="yurt-board"><div className="yurt-scene"><img src={asset('cutaway.png')} alt={u.board}/>{part&&<span className="yurt-marker" aria-hidden="true" style={{left:`${part.x}%`,top:`${part.y}%`}}>✓</span>}</div><figcaption>{part?<><b>{u.location}: </b>{part.place[lang]}</>:u.board}</figcaption></figure>;}
export default function YurtGame({lang,onBack,onPlaying}){
 const [state,dispatch]=useReducer(reduceYurt,undefined,initialYurt);
 const [review,setReview]=useState(null),[resetOpen,setResetOpen]=useState(false);
 const heading=useRef(null),u=text[lang],part=getPart(lessons[state.count][state.step]);
 const learned=lessons[state.count].map(getPart);
 const shown=state.phase==='complete'?getPart(review)||learned[0]:state.feedback==='correct'?part:null;
 useEffect(()=>{onPlaying(state.phase==='play');return()=>onPlaying(false)},[state.phase,onPlaying]);
 useEffect(()=>{heading.current?.focus();window.scrollTo({top:0,behavior:'instant'})},[state.phase,state.step]);
 function reset(){dispatch({type:'reset'});setReview(null);setResetOpen(false);}
 return <main className="safety-page yurt-page"><div className="game-toolbar"><button className="quiet" onClick={onBack}>← {u.home}</button><span className="lesson-label">{u.title}</span></div>
 {state.phase==='intro'?<section className="panel yurt-intro"><div className="yurt-welcome"><div><p className="eyebrow">OINAI · 3–6</p><h1 ref={heading} tabIndex={-1}>{u.title}</h1><p className="lead">{u.intro}</p><p>{u.adult}</p></div><PartArt cell={7}/></div><fieldset className="yurt-length"><legend>{u.choose}</legend>{[3,5,7].map((n,i)=><button key={n} data-yurt-length={n} aria-pressed={state.count===n} onClick={()=>dispatch({type:'length',count:n})}>{u[['short','medium','long'][i]]}</button>)}</fieldset><button className="primary yurt-start" onClick={()=>dispatch({type:'start'})}>{u.start} →</button><p className="yurt-note">{u.note}</p></section>:
 state.phase==='play'?<section className="panel yurt-play"><div className="progress-caption"><span>{u.question} {state.step+1} / {state.count}</span><span>{u.learned}: {state.completed} / {state.count}</span></div><progress max={state.count} value={state.completed} aria-label={u.learned}/><div className="yurt-game-layout"><Board part={shown} u={u} lang={lang}/><div className="yurt-task"><p className="eyebrow">{u.find}</p><h1 ref={heading} tabIndex={-1}>{part.name[lang]}</h1><p>{u.hint}</p><div className="yurt-choices">{choicesFor(state).map(id=>{const option=getPart(id);return <button key={id} data-yurt-answer={id} disabled={state.choice!==null} className={`yurt-choice ${state.choice===id?state.feedback:''}`} onClick={()=>dispatch({type:'answer',id})}><PartArt cell={option.cell}/><span>{option.name[lang]}</span></button>})}</div>{state.feedback&&<div className={`yurt-feedback ${state.feedback}`} role="status"><strong>{state.feedback==='correct'?u.right:u.wrong}</strong>{state.feedback==='correct'&&<p>{part.description[lang]}</p>}<button className="primary" onClick={()=>dispatch({type:state.feedback==='retry'?'retry':'next'})}>{state.feedback==='retry'?u.retry:state.step+1===state.count?u.finish:u.next} →</button></div>}</div></div></section>:
 <section className="panel yurt-finale"><div className="yurt-final-heading"><PartArt cell={7}/><div><p className="eyebrow">{u.learned}: {state.completed} / {state.count}</p><h1 ref={heading} tabIndex={-1}>{u.finalTitle}</h1><p className="lead">{u.finalText}</p></div></div><p>{u.review}</p><div className="yurt-review" aria-label={u.learned}>{learned.map(p=><button key={p.id} data-yurt-review={p.id} aria-pressed={shown.id===p.id} onClick={()=>setReview(p.id)}><PartArt cell={p.cell}/><span>{p.name[lang]}</span></button>)}</div><div className="yurt-game-layout"><Board part={shown} u={u} lang={lang}/><div className="yurt-review-copy" aria-live="polite"><h2>{shown.name[lang]}</h2><p>{shown.description[lang]}</p></div></div><div className="recap-actions"><button className="primary" onClick={()=>setResetOpen(true)}>{u.again}</button><button className="secondary" onClick={onBack}>{u.home}</button></div></section>}
 {resetOpen&&<Dialog title={u.resetTitle} close={()=>setResetOpen(false)} label={u.close} art={<PartArt cell={7}/>}><p>{u.resetText}</p><div className="dialog-actions"><button className="secondary" onClick={()=>setResetOpen(false)}>{u.cancel}</button><button className="primary" onClick={reset}>{u.again}</button></div></Dialog>}
 </main>;
}
