import { UnknownTransitionError, InvalidTransitionError } from './src/err.js'
import {  
  vString, vInit, vStates, vActions, initExists, vActionsMatchStates 
} from './src/valid.js'

class StateMachine {
  #current

  get current() { return this.#current }

  constructor({ init, states, actions }) {
    this.#current = vInit(init)

    Object.defineProperties(this, {
      states:  { value: vStates(states, actions)  },
      actions: { value: vActions(actions, states) }
    })
    
    vActionsMatchStates(states, actions)
    initExists(init, states)
  }
  
  transition(transitionName) { 
    transitionName = vString(transitionName, 'transitionName')
    
    const hasTransition = state => Object.keys(state).includes(transitionName)
    const exists = Object.values(this.states).some(hasTransition)
    const current = this.states[this.current]
    const transition = current[transitionName]
    
    if (!exists)
      throw new UnknownTransitionError({ 
        transitionName 
      })
    
    if (!transition) 
      throw new InvalidTransitionError({ 
        transitionName, 
        current: this.current, 
        to: Object.values(current).at(0).to
      })

    const old = this.current
    const latest = transition.to
    this.#current = latest
    transition.actions.forEach(name => 
      this.actions[name].call(this, old, latest))
    
    return this
  }
}

export default StateMachine
