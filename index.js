import { TransitionError } from './src/errors.js'
import { validate, hasState, statesHaveActions } from './src/validate.js'

class FSM {
  #state = null
  #states = null
  #actions = null

  get state() { return this.#state }

  constructor({ init, states, actions }) {
    this.#state = validate.init(init)
    this.#states = validate.states(states)
    this.#actions = validate.actions(actions)
    
    hasState(init, statesHaveActions(this.#states, this.#actions)) 

    ;[this.#states, this.#actions, this].map(Object.freeze)
  }
  
  transition(name) { 
    name = validate.string(name, 'transition name')
    
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
    
    transition.actions.forEach(name => this.#actions[name].call(this))
    
    this.#state = transition.to

    return this
  }
}

export default FSM
