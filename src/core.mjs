export const SHAPES=['text','box','circle','arrow','line','bar'];
const string={type:'string'};const number={type:'number'};
const obj=p=>({type:'object',properties:p,required:Object.keys(p),additionalProperties:false});
export const lessonSchema=obj({title:string,summary:string,scenes:{type:'array',items:obj({title:string,cues:{type:'array',items:obj({narration:string,shapes:{type:'array',items:obj({kind:{type:'string',enum:SHAPES},text:string,x:number,y:number,w:number,h:number,color:{type:'string',enum:['ink','teal','orange','purple']}})}})}})},quiz:obj({question:string,options:{type:'array',items:string},answer:{type:'integer'},explanation:string})});
export function validateLesson(l){
 const str=(v,n)=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
 if(!l||!str(l.title,100)||!str(l.summary,300)||!Array.isArray(l.scenes)||l.scenes.length<2||l.scenes.length>8)throw Error('Invalid lesson structure');
 let words=0;
 for(const s of l.scenes){if(!str(s.title,80)||!Array.isArray(s.cues)||s.cues.length<1||s.cues.length>5)throw Error('Invalid scene');
 for(const c of s.cues){if(!str(c.narration,1000)||!Array.isArray(c.shapes)||c.shapes.length>12)throw Error('Invalid cue');words+=c.narration.trim().split(/\s+/).length;
 for(const p of c.shapes){if(!SHAPES.includes(p.kind)||typeof p.text!=='string'||p.text.length>100||!['ink','teal','orange','purple'].includes(p.color)||![p.x,p.y,p.w,p.h].every(Number.isFinite)||p.x<0||p.x>900||p.y<0||p.y>520||Math.abs(p.w)>900||Math.abs(p.h)>520)throw Error('Invalid drawing');}}
 }
 if(words<120||words>500)throw Error('Lesson length outside bounds');
 const q=l.quiz;if(!q||!str(q.question,300)||!Array.isArray(q.options)||q.options.length!==3||!q.options.every(x=>str(x,120))||!Number.isInteger(q.answer)||q.answer<0||q.answer>2||!str(q.explanation,500))throw Error('Invalid quiz');
 return l;
}
export function timeline(lesson){let time=0;return lesson.scenes.flatMap((s,scene)=>s.cues.map((c,cue)=>{const duration=Math.max(4,c.narration.trim().split(/\s+/).length/2.25);const item={...c,scene,cue,start:time,duration};time+=duration;return item;}));}
export function cueAt(cues,time){return Math.max(0,cues.findLastIndex(c=>c.start<=time));}
export function boardAt(lesson,scene,cue){return lesson.scenes[scene].cues.slice(0,cue+1).flatMap(c=>c.shapes);}
