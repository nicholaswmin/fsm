import { TransitionError } from './src/errors.js'
import { vd } from './src/validate.js'

class FSM {
  #ctx = this
  #state = null
  #states = null

  get state() { return this.#state }

  constructor(states, ctx = this) {
    this.#ctx = vd.object(ctx, 'ctx')
    this.#states = vd.states.call(ctx, states)
    this.#state = Object.keys(this.#states).at(0)

    Object.freeze(this)
  }
  
  transition(name) { 
    name = vd.string(name, 'transition name')

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
    
    if (Object.hasOwn(transition, 'actions'))
      transition.actions.forEach(name => this.#ctx[name].call(this.#ctx))
    
    this.#state = transition.to

    return this
  }
}

export default FSM
