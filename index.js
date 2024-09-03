import { TransitionError } from './src/err.js'
import {  
  vString, vInit, vStates, vActions, initExists, vActionsMatchStates 
} from './src/valid.js'

class FSM {
  #state = null

  get state() { return this.#state }

  constructor({ init, states, actions }) {
    this.#state = vInit(init)

    Object.defineProperties(this, {
      states:  { value: vStates(states, actions)  },
      actions: { value: vActions(actions, states) }
    })
    
    vActionsMatchStates(states, actions)
    initExists(init, states) 
  }
  
  transition(name) { 
    name = vString(name, 'transition name')
    
    const hasTransition = state => Object.keys(state).includes(name)
    const exists = Object.values(this.states).some(hasTransition)
    const allowed = Object.values(this.states[this.state]).map(({ to }) => to)
    const transition = this.states[this.state][name]

    if (!exists)
      throw new TransitionError(`transition: ${name} does not exist`)
    
    if (!transition) 
      throw new TransitionError([
        `Invalid transition: "${name}"`,
        `Curr. state: "${this.state}" can transition to: "${allowed.join(', ')}"`
      ].join('. '))

    transition.actions.forEach(name => this.actions[name].call(this))
    
    this.#state = transition.to

    return this
  }
}

export default FSM
