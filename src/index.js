import valid from './schema.js'

class FSM {
  #state
  
  constructor(states, ctx = this) {
    this.states = valid.states(states)
    this.#state = Object.keys(states).at(0)

    Object.values(states)
      .flatMap(Object.entries, this)
      .filter(this.constructor.missing, this)
      .forEach(this.add, this)

    Object.freeze(Object.assign(this, ctx))
  }
  
  get state() { 
    return this.#state 
  }

  static missing([fn]) { 
    return !Object.hasOwn(this, fn) 
  }
  
  static fnName(s) { 
    return `on${s.charAt(0).toUpperCase()}${s.slice(1)}` 
  }
  
  static onInvalid() { 
    return false 
  }
  
  add([ tr, state ]) {
    this[tr] = (...args) => {
      return Object.hasOwn(this.states[this.state], tr) 
        ? this.fn(tr, ...args) 
        : this.constructor.onInvalid?.call(this, tr, ...args) || false
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
