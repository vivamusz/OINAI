export function createChapterSession(definition){
 const initial=()=>({version:definition.version,chapterId:definition.id,phase:'intro',active:0,paused:false,stations:Object.fromEntries(definition.stations.map(s=>[s.id,{status:'notStarted',index:0,choice:null,feedback:null,signal:null}]))});
 function reduce(s,a){
  if(a.type==='reset')return initial();
  if(a.type==='start')return s.phase==='intro'?{...s,phase:'active'}:s;
  if(s.phase!=='active')return s;
  if(a.type==='resume')return {...s,paused:false};
  if(s.paused)return s;
  if(a.type==='pause')return {...s,paused:true};
  if(a.type==='finish')return {...s,phase:'complete'};
  if(a.type==='jump')return Number.isInteger(a.index)&&definition.stations[a.index]?{...s,active:a.index}:s;
  const station=definition.stations[s.active],current=s.stations[station.id];
  const update=patch=>({...s,stations:{...s.stations,[station.id]:{...current,...patch}}});
  const next=v=>s.active===definition.stations.length-1?{...v,phase:'complete'}:{...v,active:s.active+1};
  if(a.type==='skip')return next(update({status:current.status==='completed'?'completed':'skipped'}));
  if(a.type==='next')return current.status==='notStarted'?s:next(s);
  if(station.kind==='movement'){
   if(a.type==='signal'&&Number.isInteger(a.index)&&station.signals[a.index])return update({signal:a.index});
   if(a.type==='confirm')return update({status:'completed'});
   return s;
  }
  if(current.status==='completed')return s;
  const q=station.questions[current.index];if(!q)return s;
  if(a.type==='answer'&&current.choice===null&&Number.isInteger(a.index)&&a.index>=0&&a.index<q.options.length)return update({choice:a.index,feedback:a.index===q.correct?'correct':'retry'});
  if(a.type==='retry'&&current.feedback==='retry')return update({choice:null,feedback:null});
  if(a.type==='nextQuestion'&&current.feedback==='correct'){const index=current.index+1;return update({index,choice:null,feedback:null,status:index===station.questions.length?'completed':'notStarted'});}
  return s;
 }
 function restore(raw){
  try{
   const v=JSON.parse(raw);
   if(v?.version!==definition.version||v.chapterId!==definition.id||!['intro','active','complete'].includes(v.phase)||!Number.isInteger(v.active)||!definition.stations[v.active]||typeof v.paused!=='boolean'||(v.phase!=='active'&&v.paused))throw Error();
   const result={...initial(),phase:v.phase,active:v.active,paused:v.paused};
   for(const station of definition.stations){
    const r=v.stations?.[station.id];if(!r||!['notStarted','completed','skipped'].includes(r.status)||!Number.isInteger(r.index)||r.index<0||r.index>station.questions.length)throw Error();
    if(station.kind==='choice'){
     if((r.status==='completed')!==(r.index===station.questions.length)||r.signal!==null)throw Error();
     if(r.choice===null){if(r.feedback!==null)throw Error();}
     else{const q=station.questions[r.index];if(!q||!Number.isInteger(r.choice)||r.choice<0||r.choice>=q.options.length||r.feedback!==(r.choice===q.correct?'correct':'retry'))throw Error();}
    }else if(r.index!==0||r.choice!==null||r.feedback!==null||(r.signal!==null&&(!Number.isInteger(r.signal)||!station.signals[r.signal])))throw Error();
    if(v.phase==='intro'&&(v.active!==0||r.status!=='notStarted'||r.index!==0||r.choice!==null||r.signal!==null))throw Error();
    result.stations[station.id]={status:r.status,index:r.index,choice:r.choice,feedback:r.feedback,signal:r.signal};
   }
   return result;
  }catch{return initial();}
 }
 return {initial,reduce,restore,storage:`oinai-chapter-${definition.id}-v${definition.version}`};
}
