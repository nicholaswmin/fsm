import valid from './valid.js'

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
  static #json = null

  get state() { return this.#state }

  constructor(states, ctx = this) {
    this.#ctx = valid.type(ctx, 'object', 'ctx')
    this.#states = valid.states.call(ctx, JSON.parse(FSM.#json) || states)
    this.#state = Object.keys(this.#states).at(0)

    Object.freeze(this)
  }
  
  transition(name, ...args) { 
    name = valid.string(name, 'transition')

    const hasTransition = state => Object.keys(state).includes(name)
    const exists = Object.values(this.#states).some(hasTransition)
    const current = this.#states[this.#state]
    const allowedTs = Object.keys(current)
      .map(name => `"${name}" for state: "${current[name].to}"`)
      .join(', ')

    const transition = this.#states[this.#state][name]

    if (!exists)
      throw new TransitionError(`transition: ${name} missing`)
    
    if (!transition) 
      throw new TransitionError([
        `"${name}" not allowed`,
        `state: "${this.state}" can: ${allowedTs}`
      ].join('. '))
    
    if (Object.hasOwn(transition, 'runs'))
      transition.runs.forEach(name => this.#ctx[name].call(this.#ctx, ...args))
    
    this.#state = transition.to

    return this
  }
  
  toJSON() {
    return { 
      [this.#state]: this.#states[this.#state], ...this.#states 
    }
  }
  
  static fromJSON(json, ctx) { 
    FSM.#json = json
    const instance = new this(undefined, ctx)
    FSM.#json = null 
    
    return instance
  }
}

export default FSM
