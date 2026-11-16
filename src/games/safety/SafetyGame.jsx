import React,{useReducer,useState,useRef,useEffect} from 'react';
import {stages,recap} from './data.js';
import {initialSession,reduceSession} from './session.js';
import {ui,tr} from '../../content.js';
import Dialog from '../../components/Dialog.jsx';
import SafetyArt,{friendsImage,stageArt,questionArt} from './SafetyArt.jsx';

export default function SafetyGame({lang,onBack,onPlaying}){
 const [state,dispatch]=useReducer((s,a)=>reduceSession(s,a,stages),undefined,initialSession);
 const [review,setReview]=useState(0),[resetOpen,setResetOpen]=useState(false);
 const title=useRef(null);const u=ui[lang];
 const total=stages.reduce((n,s)=>n+s.cards.length,0);
 useEffect(()=>{onPlaying(state.phase==='play');return ()=>onPlaying(false)},[state.phase,onPlaying]);
 useEffect(()=>{title.current?.focus();window.scrollTo({top:0,behavior:'instant'})},[state.phase,state.stage,state.question]);
 const stage=stages[state.stage],item=stage?.cards[state.question];
 const nextLabel=state.question+1===stage?.cards.length?(state.stage+1===stages.length?u.finish:u.nextStage):u.next;
 const reset=()=>{dispatch({type:'reset'});setReview(0);setResetOpen(false)};
 return <main className="safety-page">
  <div className="game-toolbar"><button className="quiet" onClick={onBack}>← {u.back}</button><span className="lesson-label">{u.safety}</span></div>
  {state.phase==='intro'?<section className="welcome panel">
   <div className="welcome-story"><div className="welcome-copy">
   <p className="eyebrow">{u.five}</p><h1 ref={title} tabIndex={-1}>{u.safety}</h1><p className="lead">{u.intro}</p></div><img className="friends-picture" src={friendsImage} alt="" aria-hidden="true"/></div>
   <ol className="stage-preview">{stages.map((s,i)=><li key={s.id}><SafetyArt name={stageArt[i]}/><small>{String(i+1).padStart(2,'0')}</small><b>{tr(s.title,lang)}</b></li>)}</ol>
   <p className="adult-note">{u.adult}</p><button className="primary start" onClick={()=>dispatch({type:'start'})}>{u.start} →</button><p className="call-note">{u.note}</p>
  </section>:state.phase==='play'?<section className="play panel">
   <ol className="stage-track" aria-label={u.five}>{stages.map((s,i)=><li key={s.id} aria-label={tr(s.title,lang)} aria-current={i===state.stage?'step':undefined} className={i<state.stage?'finished':i===state.stage?'current':''}><span className="track-art"><SafetyArt name={stageArt[i]}/><span className="track-number">{i<state.stage?'✓':i+1}</span></span><b>{tr(s.title,lang)}</b></li>)}</ol>
   <div className="progress-caption"><span>{u.stage} {state.stage+1}/5 · {u.question} {state.question+1}/{stage.cards.length}</span><span>{u.learned}: {state.completed}/{total}</span></div>
   <progress max={total} value={state.completed} aria-label={u.learned}/>
   <div className="question-layout"><div className="scene" aria-hidden="true"><SafetyArt name={questionArt[stage.id][state.question]}/><div className="scene-caption">{tr(stage.title,lang)}</div></div><div className="question-content"><p className="eyebrow">{tr(stage.title,lang)}</p><h1 ref={title} tabIndex={-1}>{tr(item.q,lang)}</h1><p className="question-intro">{tr(stage.intro,lang)}</p>
    <div className={`answers ${stage.id==='numbers'?'numbers':''}`}>
     {item.options.map((option,index)=><button key={index} data-answer={index} disabled={state.choice!==null} className={`answer ${state.choice===index?(state.feedback==='correct'?'correct':'incorrect'):''}`} onClick={()=>dispatch({type:'answer',index})}><span className="answer-letter" aria-hidden="true">{state.choice===index?(state.feedback==='correct'?'✓':'↻'):String.fromCharCode(65+index)}</span>{stage.id==='services'&&state.question<2&&<SafetyArt className="option-picture" name={(state.question===0?['fireTruck','police','ambulance']:['police','ambulance','fireTruck'])[index]}/>} {stage.id==='numbers'&&<SafetyArt className="phone-mini" name="phone"/>}<span>{tr(option,lang)}</span></button>)}
    </div>
   </div></div>
   {state.feedback&&<div className={`feedback ${state.feedback}`} role="status"><SafetyArt className="feedback-mascot" name="teacherTalk"/><div className="feedback-copy"><strong>{state.feedback==='correct'?u.good:u.wrong}</strong><p>{tr(item.why,lang)}</p></div>{state.feedback==='retry'?<button className="primary" onClick={()=>dispatch({type:'retry'})}>{u.retry} ↻</button>:<button className="primary" onClick={()=>dispatch({type:'next'})}>{nextLabel} →</button>}</div>}
  </section>:<section className="recap panel">
   <div className="recap-story"><img className="friends-picture" src={friendsImage} alt="" aria-hidden="true"/><div className="recap-heading"><div><p className="eyebrow">{u.learned}: {state.completed}/{total}</p><h1 ref={title} tabIndex={-1}>{u.recap}</h1><p>{u.recapIntro}</p></div></div></div>
   <div className="recap-tabs" aria-label={u.poster}>{recap.map((r,i)=><button key={i} aria-pressed={review===i} className={review===i?'selected':''} onClick={()=>setReview(i)}><SafetyArt name={stageArt[i]}/>{tr(r.title,lang)}</button>)}</div>
   <article className="poster" aria-live="polite"><div className="poster-art" aria-hidden="true"><SafetyArt name={stageArt[review]}/></div><div><p className="eyebrow">{review+1} / 5</p><h2>{tr(recap[review].title,lang)}</h2><p className="poster-rule">{tr(recap[review].rule,lang)}</p><div className="teacher-question"><b>{u.teacherQuestion}</b><p>{tr(recap[review].ask,lang)}</p></div></div></article>
   <div className="poster-controls"><button className="secondary" onClick={()=>setReview(i=>(i+4)%5)}>← {u.previous}</button><button className="secondary" onClick={()=>setReview(i=>(i+1)%5)}>{u.next} →</button></div>
   <div className="recap-actions"><button className="primary" onClick={()=>setResetOpen(true)}>↻ {u.again}</button><button className="secondary" onClick={onBack}>{u.end} ✓</button></div>
  </section>}
  {resetOpen&&<Dialog art={<SafetyArt name="teacherTalk"/>} title={u.restartTitle} close={()=>setResetOpen(false)} label={u.close}><p>{u.restartText}</p><div className="dialog-actions"><button className="secondary" onClick={()=>setResetOpen(false)}>{u.cancel}</button><button className="primary" onClick={reset}>{u.again}</button></div></Dialog>}
 </main>;
}
