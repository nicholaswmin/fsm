import valid from './schema.js'
import utils from './utils.js'

class InvalidTransitionError extends Error {}

class FSM {
  constructor() {
    return Object.defineProperty(this, 'fsm', { value: {} })
  }
}

const throwInvalidTransition = function(state, transition) {
  const message = `current state: "${state}" has no transition: "${transition}"`

  throw new InvalidTransitionError(message)
} 

const parseStateArguments = _states => typeof _states === 'string' 
  ? JSON.parse(_states) 
  : { 
    states: valid.states(_states), 
    state: valid.state(_states, Object.keys(_states).at(0))
  }

const parseContextArguments = _ctx => _ctx 
  ? Object.defineProperty(_ctx, 'fsm', { value: {} })
  : new FSM()

const defineTransitionMethod = function([ transition, state ]) {
  if (typeof this[transition] !== 'undefined')
    return

  return Object.defineProperty(this, transition, { 
    value: (...args) => {
      const currentState = this.fsm.states[this.fsm._state]
      const canTransition = Object.hasOwn(currentState, transition) 
      const transitionFn = this[utils.String.onify(transition)]

      if (!canTransition)
        return throwInvalidTransition(this.fsm._state, transition)
      
      const transitionResult = transitionFn?.call(this, ...args)
      const transitionIfAllowed = res => res === false 
        ? this 
        : this.fsm.transition(transition, ...args) 

      return transitionResult?.then 
        ? transitionResult.then(transitionIfAllowed)
        : transitionIfAllowed(transitionResult)
    }
  })
}

const definePrivateState = (ctx, { states, state }) => 
  Object.defineProperties(ctx.fsm, {
    _state: {
    value: state,
    writable: true
    },
  
    states: {
      enumerable: false,
      value: states
    },

    transition: {
      value: function(transition, ...args) {
        const state = ctx.fsm.states[ctx.fsm._state][transition]
      
        ctx.fsm._state = state
  
        ctx[utils.String.onify(state)]?.(...args)
        
        return ctx.state
      }
    }
  })

const definePublicState = ctx => Object.defineProperties(ctx, {
  state: {
    enumerable: true,
    get() {
      return ctx.fsm._state
    }
  },

  toJSON: {
    configurable: true,
    value: function() {
      return {
        ...ctx,
        states: this.fsm.states
      }
    }
  }
})

const fsm = (_states, _ctx) => {
  const ctx = parseContextArguments(_ctx)  
  const { states, state } = parseStateArguments(_states, _ctx)

  definePrivateState(ctx, { states, state })
  definePublicState(ctx)

  Object.values(states)
    .flatMap(Object.entries, ctx)
    .filter(utils.Object.lacksOwnEntryProperty, ctx)
    .forEach(defineTransitionMethod, ctx)

  return ctx
}

export { fsm }
