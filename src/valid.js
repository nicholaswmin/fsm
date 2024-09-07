const rangeErr = msg => {
  throw RangeError(msg)
}, 

typeErr = msg => {
  throw TypeError(msg)
}, 

shape = (v, name, defs = []) => {
  if (!Object.keys(valid.type(v, 'object', name)).length) 
    rangeErr(`${name} empty`)

  defs.forEach(({ key, type, optional }) => !v[key] 
    ? optional
      ? v
      : typeErr(`${name} missing: .${key}`)
    : valid[type](v[key], `${name}.${key}`))
  
  return v
}, 

defined = (v, name) => typeof v === 'undefined' 
  ? typeErr(`${name} missing`) 
  : v
,

run = function(run, k, prev) {
  const name = `run.${k}`, method = this[run]

  valid.string(run, name)

  if (!method || typeof method !== 'function')
    throw TypeError(`${name}: ${run}() not found`)

  Object.freeze(run)
},

transition = function(transition, j) {
  const name = `transition.${j}`,
    { runs, to } = transition

  shape(transition, name, [
    { key: 'to', type: 'string' },
    { key: 'runs', type: 'array', optional: true }
  ])
  
  if (runs && runs.map)
    runs.map(run, this)

  if (!this.states[to])
    throw RangeError(`state "${to}" missing`)
  
  Object.freeze(transition)
},

state = function(state, i) {
  shape(state, `state.${i}`)

  Object.values(state).forEach(transition, this)
  
  return Object.freeze(state)
}

const valid =  {
  array: (v, name) => !Array.isArray(v) 
    ? typeErr(`${name} exp. array, is: ${typeof v}`)
    : v,

  type: (v, type, name) => typeof defined(v, name) !== type 
    ? typeErr(`${name} exp. ${type}, is: ${typeof v}`)
    : v,
    
  string: (v, name) => valid.type(v, 'string', name).includes(' ') 
    ? rangeErr(`${name} has space`) 
    : !v.length
      ? rangeErr(`${name} empty`)
      : v,

  states: function(states) {
    this.states = shape(states, 'states')
  
    Object.values(states).forEach(state, this)
  
    return Object.freeze(states)
  }
}

export default valid
