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
    const current = this.states[this.state]
    const allowed = Object.values(current).map(({ to }) => to)
    const transition = current[name]

    if (!exists)
      throw new TransitionError(`transition: ${name} does not exist`)
    
    if (!transition) 
      throw new TransitionError([
        `Invalid transition: "${name}"`,
        `Curr. state: "${this.state}" can transition to: "${allowed.join(', ')}"`
      ].join('. '))

    const old = this.state
    const latest = transition.to
    const { actions } = transition

    this.#state = latest

    actions.forEach(name => this.actions[name].call(this, old, latest))
    
    return this
  }
}

export default FSM
