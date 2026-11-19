import React,{useState} from 'react';
import {StoryArt} from './RouteMap.jsx';
import SafetyArt from '../../games/safety/SafetyArt.jsx';
export default function PictureActivity({station,progress,lang,dispatch,u}){
 const [selected,setSelected]=useState(null),match=station.kind==='match',locked=progress.choice!==null;
 const active=progress.attemptItem===null?null:station.questions[progress.attemptItem];
 function place(target,item=selected){if(item!==null&&!locked){dispatch({type:'place',item,target});setSelected(null)}}
 return <div className="picture-activity"><p>{lang==='kk'?'Суретті таңда, содан кейін оның орнын бас.':'Выбери картинку, затем нажми на её место.'} {progress.placed.length} / {station.questions.length}</p>
 <div className="picture-pool">{station.questions.map((q,i)=><button key={i} data-picture={i} aria-pressed={selected===i} disabled={locked||progress.placed.includes(i)} draggable={!locked&&!progress.placed.includes(i)} onDragStart={e=>{setSelected(i);e.dataTransfer.setData('text/plain',String(i))}} onClick={()=>setSelected(i)}><StoryArt cell={match?14+i:i}/><span>{progress.placed.includes(i)?'✓ ':''}{q.prompt[lang]}</span></button>)}</div>
 <div className="picture-targets">{station.questions[0].options.map((option,i)=><button key={i} data-place={i} disabled={locked||progress.status==='completed'} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(/^\d+$/.test(value))place(i,Number(value))}} onClick={()=>place(i)}>{match?<SafetyArt name={['police','fireTruck','ambulance'][i]}/>:<strong className="basket-symbol">{i===0?'✓':'↺'}</strong>}<b>{option[lang]}</b><span>{progress.placed.filter(n=>station.questions[n].correct===i).map(n=><span className="placed-thumbnail" key={n}><StoryArt cell={match?14+n:n}/></span>)}</span></button>)}</div>
 {active&&<div className="journey-feedback" role="status"><b>{progress.feedback==='correct'?u.correct:u.wrong}</b><p>{active.explanation[lang]}</p><button className="primary" data-chapter-question-next onClick={()=>dispatch({type:progress.feedback==='correct'?'nextQuestion':'retry'})}>{progress.feedback==='correct'?u.questionNext:u.retry}</button></div>}
 </div>
}
