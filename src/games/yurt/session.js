import {parts,lessons} from './data.js';
export const initialYurt=()=>({phase:'intro',count:3,step:0,completed:0,choice:null,feedback:null,run:0});
export function choicesFor(state){
 const target=lessons[state.count]?.[state.step];
 if(!target)return [];
 const i=parts.findIndex(p=>p.id===target);
 const ids=[target,parts[(i+2)%parts.length].id,parts[(i+4)%parts.length].id];
 const rotation=(state.step+state.run)%3;
 return [...ids.slice(rotation),...ids.slice(0,rotation)];
}
export function reduceYurt(state,action){
 if(action.type==='reset')return {...initialYurt(),count:state.count,run:state.run+1};
 if(action.type==='length')return state.phase==='intro'&&Object.hasOwn(lessons,action.count)?{...state,count:Number(action.count)}:state;
 if(action.type==='start')return state.phase==='intro'?{...state,phase:'play'}:state;
 if(state.phase!=='play')return state;
 if(action.type==='answer'){
  if(state.choice!==null||!choicesFor(state).includes(action.id))return state;
  const correct=action.id===lessons[state.count][state.step];
  return {...state,choice:action.id,feedback:correct?'correct':'retry',completed:state.completed+(correct?1:0)};
 }
 if(action.type==='retry'&&state.feedback==='retry')return {...state,choice:null,feedback:null};
 if(action.type==='next'&&state.feedback==='correct')return state.step+1===state.count?{...state,phase:'complete',choice:null,feedback:null}:{...state,step:state.step+1,choice:null,feedback:null};
 return state;
}
