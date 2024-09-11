import valid from './schema.js'

class FSM {
  #state
  
  get state() { return this.#state }

  constructor(states, ctx = this) {
    this.states = valid.states(states)
    this.#state = Object.keys(states).at(0)

    Object.values(states)
      .flatMap(Object.entries, this)
      .filter(this.missing, this)
      .forEach(this.add, this)

    return Object.freeze(Object.assign(this, ctx))
  }
  
  add([ tr, state ]) {
    this[tr] = () => this.can(tr).fn(tr, state)
  } 
  
  transition(tr) {
    const state = this.states[this.#state][tr]
    this.#state = state
    this[this.fnName(state)]?.()
    
    return this
  }

  can(tr) {
    if (this.states[this.state][tr])
      return this

    throw Error(`cant: ${tr} from: ${this.state}`)
  }

  fnName = s => `on${s.charAt(0).toUpperCase()}${s.slice(1)}`
  missing = ([fn]) => !Object.hasOwn(this, fn)
}

class Async extends FSM {
  async fn(tr, state) {
    return await this[this.fnName(tr)]?.() === false 
      ? this : this.transition(tr)
  } 
}

class Sync extends FSM  {
  fn(tr, state) {
    return this[this.fnName(tr)]?.() === false 
      ? this : this.transition(tr)
  } 
}

export { Sync, Async }
