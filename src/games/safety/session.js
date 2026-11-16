export const initialSession=()=>({phase:'intro',stage:0,question:0,choice:null,feedback:null,completed:0});
export function reduceSession(state,action,stages){
 if(action.type==='reset') return initialSession();
 if(action.type==='start') return state.phase==='intro'?{...initialSession(),phase:'play'}:state;
 if(state.phase!=='play') return state;
 const item=stages[state.stage]?.cards[state.question];
 if(!item)return state;
 if(action.type==='answer'){
  if(state.choice!==null || !Number.isInteger(action.index) || action.index<0 || action.index>=(item.options?.length??3))return state;
  const correct=action.index===item.correct;
  return {...state,choice:action.index,feedback:correct?'correct':'retry',completed:state.completed+(correct?1:0)};
 }
 if(action.type==='retry' && state.feedback==='retry')return {...state,choice:null,feedback:null};
 if(action.type==='next' && state.feedback==='correct'){
  if(state.question+1<stages[state.stage].cards.length)return {...state,question:state.question+1,choice:null,feedback:null};
  if(state.stage+1<stages.length)return {...state,stage:state.stage+1,question:0,choice:null,feedback:null};
  return {...state,phase:'recap',choice:null,feedback:null};
 }
 return state;
}
