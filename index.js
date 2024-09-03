import { TransitionError } from './src/errors.js'
import {  
  vString, vInit, vStates, vActions, initExists, vActionsMatchStates
} from './src/validate.js'

class FSM {
  #state = null
  #states = null
  #actions = null

  get state() { return this.#state }

  constructor({ init, states, actions }) {
    this.#state = vInit(init)
    this.#states = vStates(states)
    this.#actions = vActions(actions)
    
    initExists(init, vActionsMatchStates(this.#states, this.#actions)) 

    ;[this.#states, this.#actions, this].map(Object.freeze)
  }
  
  transition(name) { 
    name = vString(name, 'transition name')
    
    const hasTransition = state => Object.keys(state).includes(name)
    const exists = Object.values(this.#states).some(hasTransition)
    const current = this.#states[this.#state]
    const allowed = Object.values(current).map(s => `"${s.to}"`)
    const transition = this.#states[this.#state][name]

    if (!exists)
      throw new TransitionError(`transition: ${name} does not exist`)
    
    if (!transition) 
      throw new TransitionError([
        `Cannot transition to: "${name}"`,
        `Curr. state: "${this.state}" can transition to: ${allowed.join(', ')}`
      ].join('. '))
    
    console.log(this.#actions)
    transition.actions.forEach(name => this.#actions[name].call(this))
    
    this.#state = transition.to

    return this
  }
}

export default FSM
