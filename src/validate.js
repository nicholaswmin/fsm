const valid =  {}

valid.shape = (v, name, defs = []) => {
  valid.object(v, name)

  if (!Object.keys(v).length) 
    throw new RangeError(`${name} empty`)

  defs.forEach(({ key, type, required }) => {
    if (!Object.hasOwn(v, key))
      if (!required)
        return v[key]
      else
        throw new TypeError(`${name} missing property: "${key}"`)
    
    if (type !== 'array')
      return !!valid[type] 
        ? valid[type](v[key], `${name}.${key}`) 
        : valid.type(v[key], type, `${name}.${key}`)
    
    if (!Array.isArray(v[key]))
      throw new TypeError(`${name}.${key} exp. array, got: ${typeof v}`)
  })
  
  return v
}

valid.type = (v, type, name) => {
  v = valid.defined(v, name)

  if (typeof v !== type)
    throw new TypeError(`${name} exp. ${type}, got: ${typeof v}`)
  
  return v
}

valid.defined = (v, name) => {
  if (typeof v === 'undefined')
    throw new TypeError(`${name} missing`)

  return v
}

valid.string = (v, name) => {
  v = valid.type(v, 'string', name)
  
  if (v.includes(' '))
    throw new RangeError(`${name} has whitespace`)

  if (!v.length)
    throw new RangeError(`${name} empty`)

  return v
}

valid.object = (v, name) => {
  v = valid.type(v, 'object', name)
  
  return v
}

valid.action = function(action, k, prev) {
  const name = `${prev}.actions.${k}`
  const method = this[action]

  valid.string(action, name)

  if (!method)
    throw new TypeError(`${name}: missing method: this.${action}()`)
  
  if (typeof method !== 'function')
    throw new TypeError(`${name}: exp. function, got: ${typeof method}`)

  return Object.freeze(action)
}

valid.transition = function(transition, i, j) {
  const name = `state.${i}.transitions.${j}`

  valid.shape(transition, name, [
    { key: 'to', type: 'string', required: true },
    { key: 'actions', type: 'array', required: false }
  ])

  Object.values(transition.actions || {})
    .map((action, k) => valid.action.call(this, action, k, name))
  
  Object.freeze(transition)
}

valid.state = function(state, i) {
  valid.shape(state, `state.${i}`)

  Object.values(state)
    .forEach((transition, j) => 
      valid.transition.call(this, transition, i, j))
  
  return Object.freeze(state)
}

valid.states = function(v) {
  valid.defined(v, 'states')
  valid.shape(v, 'states')

  Object.values(v).forEach((state, i) => valid.state.call(this, state, i))

  return Object.freeze(v)
}

export { valid }
