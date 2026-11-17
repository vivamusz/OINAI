import React,{useEffect,useMemo,useReducer,useRef,useState} from 'react';
import data from './data.json';
import {text} from './text.js';
import {initialProfessionSession,reduceProfessionSession} from './session.js';
import Dialog from '../../components/Dialog.jsx';
import Illustration from '../../components/Illustration.jsx';
import {answerArt,asset,portrait,choiceImage} from './art.js';
import './professions.css';

const STORAGE='oinai-professions-completed-v1';
const tr=(value,lang)=>value[lang];
function loadSession(){try{return initialProfessionSession(JSON.parse(localStorage.getItem(STORAGE)||'[]'),data.professions)}catch{return initialProfessionSession([],data.professions)}}
function shuffledIndices(length){const order=Array.from({length},(_,i)=>i);for(let i=length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;}
function AnswerPicture({image}){
 const art=answerArt[image.split('/').pop()];
 return art?<Illustration src={asset(art.file)} cell={art.cell} columns={4} rows={4}/>:<Illustration src={asset(choiceImage(image))}/>;
}
export default function ProfessionsGame({lang,onBack,onPlaying,muted=true}){
 const [state,dispatch]=useReducer((s,a)=>reduceProfessionSession(s,a,data.professions),undefined,loadSession);
 const [dialog,setDialog]=useState(null),[storageOk,setStorageOk]=useState(true);
 const heading=useRef(null),audio=useRef(null),u=text[lang];
 const prof=data.professions.find(p=>p.id===state.active);
 const orders=useMemo(()=>prof?.quiz.map(q=>shuffledIndices(q.choices.length))??[],[state.active,state.run]);
 const q=prof?.quiz[state.step];
 const opened=state.phase==='solved'?5:state.step+(state.feedback==='correct'?1:0);
 useEffect(()=>{onPlaying(state.phase==='play');return()=>onPlaying(false)},[state.phase,onPlaying]);
 useEffect(()=>{heading.current?.focus();window.scrollTo({top:0,behavior:'instant'})},[state.phase,state.active,state.step]);
 useEffect(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state.done));setStorageOk(true)}catch{setStorageOk(false)}},[state.done]);
 useEffect(()=>()=>{audio.current?.close().catch(()=>{})},[]);
 useEffect(()=>{if(muted&&audio.current){const ctx=audio.current;audio.current=null;ctx.close().catch(()=>{})}},[muted]);
 function answer(index){
  if(state.choice!==null)return;
  dispatch({type:'answer',index});
  if(!muted){try{
   const Context=window.AudioContext||window.webkitAudioContext;
   const ctx=audio.current||(audio.current=new Context());
   ctx.resume().catch(()=>{});const oscillator=ctx.createOscillator(),gain=ctx.createGain();
   oscillator.frequency.value=q.choices[index].ok?660:330;gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);
   oscillator.connect(gain);gain.connect(ctx.destination);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect()};oscillator.start();oscillator.stop(ctx.currentTime+.2);
  }catch{}}
 }
 function toMap(){if(state.phase==='play'){setDialog('leave')}else dispatch({type:'map'})}
 const dialogArt=<Illustration src={asset(portrait(prof?.id||'teacher'))}/>;
 return <main className="safety-page professions-page">
  <div className="game-toolbar"><button className="quiet" onClick={onBack}>← {u.home}</button><div className="profession-tools">{state.phase!=='map'&&<button className="quiet" onClick={toMap}>{u.map}</button>}</div></div>
  {state.phase==='map'?<section className="panel profession-map-panel">
   <div className="profession-title-row"><div><h1 ref={heading} tabIndex={-1}>{u.title}</h1><p>{u.intro}</p></div><span className="profession-progress">{u.progress}: <b>{state.done.length} / 7</b></span></div>
   <p className="map-hint">{u.hint}</p>
   <div className="profession-map-layout"><div className="city-map">
    <img src={asset(data.map.image)} alt={u.map}/>
    <svg viewBox={data.map.viewBox} aria-label={u.map}>{data.professions.map(p=><g key={p.id}><path data-map-profession={p.id} d={p.map.d} tabIndex={0} role="button" aria-label={`${tr(p.title,lang)}${state.done.includes(p.id)?` · ${u.completed}`:''}`} onClick={()=>dispatch({type:'open',id:p.id})} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();dispatch({type:'open',id:p.id})}}}/><g aria-hidden="true" className="city-badge" transform={`translate(${p.map.cx},${p.map.cy})`}><circle r="24"/><text textAnchor="middle" dominantBaseline="central">{state.done.includes(p.id)?'✓':data.professions.indexOf(p)+1}</text></g></g>)}</svg>
   </div><div className="profession-list">{data.professions.map((p,i)=><button data-profession={p.id} key={p.id} onClick={()=>dispatch({type:'open',id:p.id})} className={state.done.includes(p.id)?'completed':''}><img src={asset(portrait(p.id))} alt=""/><span><small>{String(i+1).padStart(2,'0')}</small><b>{tr(p.title,lang)}</b>{state.done.includes(p.id)&&<em>{u.completed} ✓</em>}</span></button>)}</div></div>
   <div className="profession-map-footer"><p>{u.adult}<small>{storageOk?u.saved:u.notSaved}</small></p>{state.done.length===7&&<button className="primary" onClick={()=>dispatch({type:'finish'})}>{u.finish}</button>}{state.done.length>0&&<button className="secondary" onClick={()=>setDialog('reset')}>{u.reset}</button>}</div>
  </section>:state.phase==='play'||state.phase==='solved'?<section className="panel profession-play-panel">
   <div className="profession-title-row"><div><p className="eyebrow">{u.title} · {u.progress}: {state.done.length}/7</p><h1 ref={heading} tabIndex={-1}>{tr(prof.title,lang)}</h1></div><span className="profession-progress">{u.pieces}: <b>{opened} / 5</b></span></div>
   <div className="profession-play-layout"><div className="profession-puzzle-column"><div className="profession-puzzle" style={{aspectRatio:data.board.aspectRatio}} role="img" aria-label={`${tr(prof.title,lang)} · ${u.pieces}: ${opened}/5`}>
    <img className={`puzzle-guide ${opened===5?'complete':''}`} src={asset(opened===5?prof.original:prof.guide)} alt=""/>
    {opened<5&&data.pieceOrder.slice(0,opened).map(id=>{const p=prof.pieces.find(piece=>piece.id===id);return <img key={id} className="puzzle-piece" src={asset(p.src)} alt="" style={{left:`${p.x*100}%`,top:`${p.y*100}%`,width:`${p.w*100}%`,height:`${p.h*100}%`}}/>})}
   </div><div className="puzzle-progress" aria-hidden="true">{data.pieceOrder.map((id,i)=><span key={id} className={i<opened?'open':''}>{i<opened?'✓':i+1}</span>)}</div><p className="puzzle-help">{u.puzzle}</p></div>
   <div className="profession-question">{state.phase==='solved'?<div className="profession-solved"><img src={asset(portrait(prof.id))} alt=""/><h2>{u.solved}</h2><p>{tr(prof.title,lang)} · 5 / 5</p><button className="primary" onClick={()=>dispatch({type:state.done.length===7?'finish':'map'})}>{state.done.length===7?u.finish:u.mapNext} →</button></div>:<>
    <p className="eyebrow">{u.question} {state.step+1} / 5</p><h2>{tr(q.q,lang)}</h2>
    <div className="profession-answers">{orders[state.step].map(index=>{const c=q.choices[index];return <button data-prof-answer={index} key={index} disabled={state.choice!==null} className={`profession-answer ${state.choice===index?state.feedback:''}`} onClick={()=>answer(index)}><AnswerPicture image={c.image}/><span>{tr(c.text,lang)}</span></button>})}</div>
    {state.feedback&&<div className={`profession-feedback ${state.feedback}`} role="status"><p>{state.feedback==='correct'?u.right:u.wrong}</p>{prof.id==='doctor'&&state.step===2&&<small>{u.medicine}</small>}<button className="primary" onClick={()=>dispatch({type:state.feedback==='retry'?'retry':'next'})}>{state.feedback==='retry'?u.retry:state.step===4?u.reveal:u.next} →</button></div>}
   </>}</div></div>
  </section>:<section className="panel profession-finale"><h1 ref={heading} tabIndex={-1}>{u.finalTitle}</h1><p className="lead">{u.finalText}</p><img className="profession-finale-picture" src={asset(data.finale.image)} alt=""/><div className="final-professions">{data.professions.map(p=><span key={p.id}>{tr(p.title,lang)} ✓</span>)}</div><div className="recap-actions"><button className="primary" onClick={()=>setDialog('reset')}>{u.again}</button><button className="secondary" onClick={()=>dispatch({type:'browse'})}>{u.browse}</button><button className="secondary" onClick={onBack}>{u.home}</button></div></section>}
  {!storageOk&&state.phase!=='map'&&<p className="storage-note" role="status">{u.notSaved}</p>}
  {dialog&&<Dialog title={dialog==='reset'?u.resetTitle:u.leaveTitle} close={()=>setDialog(null)} label={u.close} art={dialogArt}><p>{dialog==='reset'?u.resetText:u.leaveText}</p><div className="dialog-actions"><button className="secondary" onClick={()=>setDialog(null)}>{dialog==='reset'?u.cancel:u.stay}</button><button className="primary" onClick={()=>{dispatch({type:dialog==='reset'?'reset':'map'});setDialog(null)}}>{dialog==='reset'?u.confirm:u.leave}</button></div></Dialog>}
 </main>;
}
