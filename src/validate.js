const vString=(v,name)=>{const err=typeof v==='undefined'?new TypeError(`"${name}" is missing`):typeof v==='string'?v.length>0?null:new RangeError(`string: "${name}" must have length, is empty`):new TypeError(`"${name}" must be a valid String, got: ${typeof v}`)
if(err)throw err
return v}
const isTransition=(v,i,j)=>{const name=`state.${i}.transition.${i}`
vString(v.to,`${name}.to`)
if(!Object.hasOwn(v,'actions'))
new TypeError(`${name} must have an "actions" property`)
if(!Array.isArray(v.actions))
throw new TypeError(`${name}.actions must be an Array, is: ${typeof v.actions}`)
if(!v.actions.length)
throw new RangeError(`${name} must have some actions, has 0`)
v.actions.forEach((a,i)=>vString(a,`${name}.actions.${i}`))
return v}
const isAction=(v,i)=>{const err=typeof v!=='function'?new TypeError(`action.${i} must be a Function, got: ${typeof v}`):null
if(err)throw err}
const vActions=v=>{if(typeof v==='undefined')
throw new TypeError('"actions" parameter is missing')
if(typeof v==='object')
if(!Object.keys(v).length)
throw new RangeError('"actions" object must have some actions, has none')
else Object.values(v).forEach((action,i)=>isAction(action,i))
else throw new TypeError(`"actions" must be an Object, got: ${typeof v}`)
return v}
const vStates=v=>{if(typeof v==='undefined')
throw new TypeError('"states" parameter is missing')
else if(typeof v==='object')
if(Object.keys(v).length===0)
throw new RangeError('states object must have some states, has none')
else Object.values(v).forEach((s,i)=>{if(!Object.values(s).length)
throw new RangeError(`state.${i} must have transitions, has 0`)
else Object.values(v).forEach((s,i)=>Object.values(s).forEach((t,j)=>{if(typeof t!=='object')
throw new TypeError([`state.${i}.transition.${j} must be an Object`,`got: ${typeof t}`].join(', '))
else isTransition(t,i,j)}))})
else throw new TypeError(`states must be an Object, got: ${typeof v}`)
return v}
const vInit=v=>{const err=typeof v==='undefined'?new TypeError('"init" parameter missing'):null
if(err)throw err
return vString(v,'init')}
const vActionsPresent=(v,actions={})=>{const inActions=v=>Object.keys(actions).includes(v)
Object.values(v).forEach((s,i)=>{Object.values(s).map((t,j)=>{t.actions.forEach((action,k)=>{if(!inActions(action))
throw new TypeError([`state.${i}.transition.${j}.actions.${k}:`,`"${action}" not present in actions`].join(' '))})})})
return v}
const vActionsUtilised=(v,states={})=>{const inStateActions=v=>{return Object.values(states).some(s=>Object.values(s).some(t=>t.actions.includes(v)))}
Object.values(v).map((fn,i)=>{if(!inStateActions(fn.name))
throw new RangeError(`action: "${fn.name}" not used in any state actions`)})
return v}
const initExists=(init,states)=>{if(!Object.keys(states).includes(init))
throw new RangeError(`"init" state: "${init}" is not a valid state`)}
const vActionsMatchStates=(states,actions)=>{vActionsPresent(states,actions)
vActionsUtilised(actions,states)
return states}
export{vString,vInit,vActions,vStates,initExists,vActionsMatchStates}
