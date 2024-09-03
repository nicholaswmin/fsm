const validate =  {}

const isTransition = (v, i, j) => {
  const name = `state.${i}.transition.${i}`  

  validate.string(v.to, `${name}.to`)
  
  if (!Object.hasOwn(v, 'actions'))
    new TypeError(`${name} must have an "actions" property`)
  
  if (!Array.isArray(v.actions))
    throw new TypeError(
      `${name}.actions must be an Array, is: ${typeof v.actions}`
    )
  
  if (!v.actions.length)
    throw new RangeError(`${name} must have some actions, has 0`)
  
  v.actions.forEach((a, i) => validate.string(a, `${name}.actions.${i}`))
      
  return v
}

const isAction = (v, i) => {
  const err = typeof v !== 'function'
    ? new TypeError(`action.${i} must be a Function, got: ${typeof v}`)
    : null
  
  if (err) throw err 
}

const actionsPresent = (v, actions = {}) => {
  const inActions = v => Object.keys(actions).includes(v)
  
  Object.values(v).forEach((s, i) => {
    Object.values(s).map((t, j) => {
      t.actions.forEach((action, k) => {
        if (!inActions(action))
          throw new TypeError([
            `state.${i}.transition.${j}.actions.${k}:`,
             `"${action}" not present in actions`
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
        .some(t => t.actions.includes(v)))

  Object.values(v).map((fn, i) => {
    if (!stateHasActions(fn.name))
      throw new RangeError(`action: "${fn.name}" not used in a transition`)
  })
  
  return v
}

const hasState = (state, states) => {
  if (!!!states[state])
    throw new TypeError(`state: "${state}" does not exist`)
}

const statesHaveActions = (states, actions) => {
  actionsPresent(states, actions)
  actionsUtilised(actions, states)
  
  return states
}

validate.string = (v, name) => {
  if (typeof v === 'undefined')
    throw new TypeError(`"${name}" is missing`)
  
  if (typeof v !== 'string')
    throw new TypeError(`"${name}" must be a valid String, got: ${typeof v}`)
  
  if (v.length < 1)
    throw new RangeError(`string: "${name}" must have length, is empty`)

  return v
}

validate.actions = v => {
  if (typeof v === 'undefined')
    throw new TypeError('"actions" parameter is missing')
  
  if (typeof v === 'object')
    if (!Object.keys(v).length)
      throw new RangeError('"actions" object must have some actions, has none')
    else 
      Object.values(v).forEach((action, i) => isAction(action, i))
  else 
    throw new TypeError(`"actions" must be an Object, got: ${typeof v}`)

  return v
}

validate.states = v => {
  if (typeof v === 'undefined')
    throw new TypeError('"states" parameter is missing')
  else 
    if (typeof v === 'object') 
      if (Object.keys(v).length === 0)
        throw new RangeError('states object must have some states, has none')
      else
        Object.values(v).forEach((s, i) => {
          if (!Object.values(s).length)
            throw new RangeError(`state.${i} must have transitions, has 0`)
          else 
            Object.values(v).forEach((s, i) => 
              Object.values(s).forEach((t, j) => {
                if (typeof t !== 'object')
                  throw new TypeError([
                    `state.${i}.transition.${j} must be an Object`, 
                    `got: ${typeof t}`
                  ].join(', '))
                else 
                  isTransition(t, i, j)
            }))
        })
    else 
     throw new TypeError(`states must be an Object, got: ${typeof v}`)

  return v
}

validate.init = v => {
  if (typeof v === 'undefined')
    throw new TypeError('"init" parameter missing')

  return validate.string(v, 'init')
}

export { validate, hasState, statesHaveActions }
