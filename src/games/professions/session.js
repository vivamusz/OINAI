export function cleanCompleted(value,professions){
 return Array.isArray(value)?[...new Set(value)].filter(id=>professions.some(p=>p.id===id)):[];
}
export function initialProfessionSession(done=[],professions=[]){
 return {phase:'map',active:null,step:0,choice:null,feedback:null,done:cleanCompleted(done,professions),run:0};
}
export function reduceProfessionSession(state,action,professions){
 const prof=professions.find(p=>p.id===state.active);
 if(action.type==='reset')return {...initialProfessionSession([],professions),run:state.run+1};
 if(action.type==='open'&&state.phase==='map'){
  if(!professions.some(p=>p.id===action.id))return state;
  return {...state,active:action.id,phase:'play',step:0,choice:null,feedback:null,run:state.run+1};
 }
 if(action.type==='map')return {...state,phase:'map',active:null,step:0,choice:null,feedback:null};
 if(action.type==='browse'&&state.phase==='finale')return {...state,phase:'map',active:null};
 if(action.type==='finish'&&state.done.length===professions.length)return {...state,phase:'finale',active:null};
 if(state.phase!=='play'||!prof)return state;
 const q=prof.quiz[state.step];
 if(action.type==='answer'){
  if(state.choice!==null||!Number.isInteger(action.index)||!q.choices[action.index])return state;
  const correct=q.choices[action.index].ok;
  const last=state.step===prof.quiz.length-1;
  return {...state,choice:action.index,feedback:correct?'correct':'retry',done:correct&&last?cleanCompleted([...state.done,prof.id],professions):state.done};
 }
 if(action.type==='retry'&&state.feedback==='retry')return {...state,choice:null,feedback:null};
 if(action.type==='next'&&state.feedback==='correct'){
  return state.step+1===prof.quiz.length?{...state,phase:'solved'}:{...state,step:state.step+1,choice:null,feedback:null};
 }
 return state;
}
