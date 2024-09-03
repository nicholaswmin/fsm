import valid from './schema.js'

class FSM {
  static onInvalid = s => { return false }
  static fnName = s => `on${s.charAt(0).toUpperCase()}${s.slice(1)}`
  static missing = ([fn]) => !Object.hasOwn(this, fn)

  #state
  
  get state() { return this.#state }

  constructor(states, ctx = this) {
    this.states = valid.states(states)
    this.#state = Object.keys(states).at(0)

    Object.values(states)
      .flatMap(Object.entries, this)
      .filter(this.constructor.missing, this)
      .forEach(this.add, this)

    return Object.freeze(Object.assign(this, ctx))
  }
  
  add([ tr, state ]) {
    this[tr] = (...args) => {
      return Object.hasOwn(this.states[this.state], tr) 
        ? this.fn(tr, ...args) 
        : this.constructor.onInvalid?.call(this, ...args) || false
    }
  }   
  
  transition(tr, ...args) {
    const state = this.states[this.#state][tr]
    this.#state = state
    this[this.constructor.fnName(state)]?.(...args)
    
    return this
  }
}

class Async extends FSM {
  async fn(tr, ...args) {
    return await this[this.constructor.fnName(tr)]?.(...args) === false 
      ? this : this.transition(tr)
  } 
}

class Sync extends FSM  {
  fn(tr, ...args) {
    return this[this.constructor.fnName(tr)]?.(...args) === false 
      ? this : this.transition(tr, ...args)
  } 
}

export { Sync, Async }
