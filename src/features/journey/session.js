import {initialVisual,restoreVisual,reduceVisual} from './visual-session.js';
import {journey,questions} from './data.js';
const statuses=['notStarted','completed','skipped'];
export const STORAGE='oinai-journey-safe-world-v1';
export const initialJourney=()=>({version:1,journeyId:journey.id,phase:'intro',index:0,paused:false,status:Object.fromEntries(journey.activities.map(a=>[a.id,'notStarted'])),quiz:{index:0,choice:null,feedback:null},visual:initialVisual()});
export function reduceJourney(s,a){
 if(a.type==='reset')return initialJourney();
 if(a.type==='start')return s.phase==='intro'?{...s,phase:'active'}:s;
 if(s.phase!=='active')return s;
 if(a.type==='resume')return {...s,paused:false};
 if(s.paused)return s;
 if(a.type==='pause')return {...s,paused:true};
 if(a.type==='finish')return {...s,phase:'complete'};
 const step=journey.activities[s.index];
 const advance=v=>s.index===journey.activities.length-1?{...v,phase:'complete'}:{...v,index:s.index+1};
 if(a.type==='jump')return Number.isInteger(a.index)&&a.index>=0&&a.index<journey.activities.length?{...s,index:a.index}:s;
 if(a.type==='skip')return advance({...s,status:{...s.status,[step.id]:s.status[step.id]==='completed'?'completed':'skipped'}});
 if(a.type==='next')return s.status[step.id]!=='notStarted'?advance(s):s;
 if(['sequence','pack','reflect'].includes(a.type)){if(s.status[step.id]==='completed')return s;const visual=reduceVisual(s.visual,a,step.id);return visual===s.visual?s:{...s,visual};}
 if(a.type==='confirm'&&((step.id==='discussion'&&s.visual.sequence.length<3)||(step.id==='printable'&&s.visual.packed.length<3)))return s;
 if(a.type==='confirm')return step.type!=='game'?{...s,status:{...s.status,[step.id]:'completed'}}:s;
 if(step.type!=='game'||s.status.choices==='completed')return s;
 const q=questions[s.quiz.index];if(!q)return s;
 if(a.type==='answer'){
  if(s.quiz.choice!==null||!Number.isInteger(a.choice)||a.choice<0||a.choice>=q.options.length)return s;
  return {...s,quiz:{...s.quiz,choice:a.choice,feedback:a.choice===q.correct?'correct':'retry'}};
 }
 if(a.type==='retry'&&s.quiz.feedback==='retry')return {...s,quiz:{...s.quiz,choice:null,feedback:null}};
 if(a.type==='questionNext'&&s.quiz.feedback==='correct'){
  const index=s.quiz.index+1;
  return {...s,quiz:{index,choice:null,feedback:null},status:index===questions.length?{...s.status,choices:'completed'}:s.status};
 }
 return s;
}
export function restoreJourney(raw){
 try{
  const v=JSON.parse(raw),q=v?.quiz;
  if(v?.version!==1||v.journeyId!==journey.id||!['intro','active','complete'].includes(v.phase)||typeof v.paused!=='boolean'||!Number.isInteger(v.index)||v.index<0||v.index>=journey.activities.length)throw Error();
  if(!q||!Number.isInteger(q.index)||q.index<0||q.index>questions.length)throw Error();
  if(!journey.activities.every(a=>statuses.includes(v.status?.[a.id])))throw Error();
  if((v.status.choices==='completed')!==(q.index===questions.length))throw Error();
  if(q.choice===null){if(q.feedback!==null)throw Error();}
  else{const question=questions[q.index];if(!question||!Number.isInteger(q.choice)||q.choice<0||q.choice>=question.options.length||q.feedback!==(q.choice===question.correct?'correct':'retry'))throw Error();}
  if(v.phase==='intro'&&(v.index!==0||v.paused||q.index!==0||q.choice!==null||Object.values(v.status).some(x=>x!=='notStarted')))throw Error();
  if(v.phase==='complete'&&v.paused)throw Error();
  return {version:1,journeyId:journey.id,phase:v.phase,index:v.index,paused:v.paused,status:Object.fromEntries(journey.activities.map(a=>[a.id,v.status[a.id]])),quiz:{index:q.index,choice:q.choice,feedback:q.feedback},visual:restoreVisual(v.visual)};
 }catch{return initialJourney();}
}
