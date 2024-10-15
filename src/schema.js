import { has, is } from './is.js'

const transition = function([ input, state ], i, arr) {
  const name = `${input}.${state}`, fname = `${name}:${state}`

  Object.hasOwn(this, is.string(state, fname)) || 
    has.err.range(fname, 'missing')
},
  
state = function([ name, state ], i, arr) {
  Object.entries(is.object(state, name)).map(transition, this)
}

export default {  
  state: function(states, v) {
    Object.keys(states).includes(v) || has.err.range(v, 'missing')
    
    return v
  },

  states: function (v) {
    const clone = structuredClone(v)
    Object.entries(is.empty(is.object(v, 'states'), 'states'))
      .forEach(state, v)

    return clone
  }
}
