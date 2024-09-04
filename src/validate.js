const validate =  {}

const isTransition = (v, i, j) => {
  const name = `state.${i}.transition.${i}`  

  validate.string(v.to, `${name}.to`)
  
  if (!Object.hasOwn(v, 'actions'))
    new TypeError(`${name} missing actions property`)
  
  if (!!v.actions && !Array.isArray(v.actions))
    throw new TypeError(
      `${name}.actions exp. array, got: ${typeof v.actions}`
    )
  
  if (!!v.actions)
    v.actions.map((a, i) => validate.string(a, `${name}.actions.${i}`))
      
  return v
}

const isAction = (v, i) => {
  const err = typeof v !== 'function'
    ? new TypeError(`action.${i} exp. function, got: ${typeof v}`)
    : null
  
  if (err) throw err 
}

const actionsPresent = (v, actions = {}) => {
  const inActions = v => Object.keys(actions).includes(v)
  
  Object.values(v).forEach((s, i) => {
    Object.values(s).map((t, j) => {
      !!t.actions && t.actions.forEach((action, k) => {
        if (!inActions(action))
          throw new TypeError([
            `state.${i}.transition.${j}.actions.${k}:`,
             `${action} not present in actions`
          ].join(' ')) 
      })
    })
  })
  
  return v
}

const actionsUtilised = (v, states = {}) => {
  const stateHasActions = v => 
    Object.values(states)
      .some(s => Object.values(s)
        .some(t => !!t.actions && t.actions.includes(v)))

  Object.values(v).map((fn, i) => {
    if (!stateHasActions(fn.name))
      throw new RangeError(`action: ${fn.name} not used in a transition`)
  })
  
  return v
}

const hasState = (state, states) => {
  if (!!!states[state])
    throw new TypeError(`state: ${state} does not exist`)
}

const statesHaveActions = (states, actions) => {
  actionsPresent(states, actions)
  actionsUtilised(actions, states)
  
  return states
}

validate.string = (v, name) => {
  if (typeof v === 'undefined')
    throw new TypeError(`${name} is missing`)
  
  if (typeof v !== 'string')
    throw new TypeError(`${name} exp. string, got: ${typeof v}`)
  
  if (v.includes(' '))
    throw new TypeError(`${name} string cannot contain whitespace`)

  if (v.trim().length < 1)
    throw new RangeError(`${name} is empty`)

  return v
}

validate.actions = v => {
  if (typeof v === 'undefined')
    throw new TypeError('actions missing')
  
  if (typeof v === 'object')
    if (!Object.keys(v).length)
      throw new RangeError('no actions found')
    else 
      Object.values(v).forEach((action, i) => isAction(action, i))
  else 
    throw new TypeError(`actions exp. object, got: ${typeof v}`)

  return v
}

validate.states = v => {
  if (typeof v === 'undefined')
    throw new TypeError('states is missing')
  else 
    if (typeof v === 'object') 
      if (Object.keys(v).length === 0)
        throw new RangeError('no states found')
      else
        Object.values(v).forEach((s, i) => {
          if (!Object.values(s).length)
            throw new RangeError(`state.${i} has no transitions`)
          else 
            Object.values(v).forEach((s, i) => 
              Object.values(s).forEach((t, j) => {
                if (typeof t !== 'object')
                  throw new TypeError([
                    `state.${i}.transition.${j} exp. object`, 
                    `got: ${typeof t}`
                  ].join(', '))
                else 
                  isTransition(t, i, j)
            }))
        })
    else 
     throw new TypeError(`states exp. object, got: ${typeof v}`)

  return v
}

validate.init = v => {
  if (typeof v === 'undefined')
    throw new TypeError('init missing')

  return validate.string(v, 'init')
}

export { validate, hasState, statesHaveActions }
