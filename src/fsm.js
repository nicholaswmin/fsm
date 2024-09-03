import { valid } from './valid.js'

class TransitionError extends Error {
  constructor(message) {
    super(message)
    this.error = this.constructor.name
    this.name = this.constructor.name
  }
}

class FSM {
  #ctx = this
  #state = null
  #states = null

  get state() { return this.#state }

  constructor(states, ctx = this) {
    this.#ctx = valid.type(ctx, 'object', 'ctx')
    this.#states = valid.states.call(ctx, states)
    this.#state = Object.keys(this.#states).at(0)

    Object.freeze(this)
  }
  
  transition(name) { 
    name = valid.string(name, 'transition')

    const hasTransition = state => Object.keys(state).includes(name)
    const exists = Object.values(this.#states).some(hasTransition)
    const current = this.#states[this.#state]
    const allowedTs = Object.keys(current)
      .map(name => `"${name}" for state: "${current[name].to}"`)
      .join(', ')

    const transition = this.#states[this.#state][name]

    if (!exists)
      throw new TransitionError(`transition: ${name} does not exist`)
    
    if (!transition) 
      throw new TransitionError([
        `Transition: "${name}" not allowed`,
        `Current state: "${this.state}" can only: ${allowedTs}`
      ].join('. '))
    
    if (Object.hasOwn(transition, 'actions'))
      transition.actions.forEach(name => this.#ctx[name].call(this.#ctx))
    
    this.#state = transition.to

    return this
  }
}

export default FSM
