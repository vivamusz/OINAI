export const initialVisual=()=>({sequence:[],packed:[],reflection:null,sequenceError:false,packError:false});
export function restoreVisual(v){
 if(v===undefined)return initialVisual();
 if(!v||!Array.isArray(v.sequence)||v.sequence.length>3||v.sequence.some((n,i)=>n!==i)||!Array.isArray(v.packed)||v.packed.some(n=>!Number.isInteger(n)||n<0||n>2)||new Set(v.packed).size!==v.packed.length||!(v.reflection===null||Number.isInteger(v.reflection)&&v.reflection>=0&&v.reflection<3)||typeof v.sequenceError!=='boolean'||typeof v.packError!=='boolean')throw Error('Invalid visual progress');
 return {sequence:[...v.sequence],packed:[...v.packed],reflection:v.reflection,sequenceError:v.sequenceError,packError:v.packError};
}
export function reduceVisual(v,a,step){
 if(!Number.isInteger(a.item))return v;
 if(a.type==='sequence'&&step==='discussion'&&a.item>=0&&a.item<3&&!v.sequence.includes(a.item))return a.item===v.sequence.length?{...v,sequence:[...v.sequence,a.item],sequenceError:false}:{...v,sequenceError:true};
 if(a.type==='pack'&&step==='printable'&&a.item>=0&&a.item<5&&!v.packed.includes(a.item))return a.item<3?{...v,packed:[...v.packed,a.item],packError:false}:{...v,packError:true};
 if(a.type==='reflect'&&step==='reflection'&&a.item>=0&&a.item<3)return {...v,reflection:a.item};
 return v;
}
