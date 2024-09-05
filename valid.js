const vd =  {}

vd.shape = (v, name, defs = []) => {
  vd.object(v, name)

  if (!Object.keys(v).length) 
    throw new RangeError(`${name} empty`)

  defs.forEach(({ key, type, required }) => {
    if (!Object.hasOwn(v, key))
      if (!required)
        return v[key]
      else
        throw new TypeError(`${name} missing property: ${key}`)
    
    if (type !== 'array')
      return !!vd[type] 
        ? vd[type](v[key], `${name}.${key}`) 
        : vd.type(v[key], type, `${name}.${key}`)
    
    if (!Array.isArray(v[key]))
      throw new TypeError(`${name}.${key} exp. array, got: ${typeof v}`)
  })
  
  return v
}

vd.type = (v, type, name) => {
  v = vd.defined(v, name)

  if (typeof v !== type)
    throw new TypeError(`${name} exp. ${type}, got: ${typeof v}`)
  
  return v
}

vd.defined = (v, name) => {
  if (typeof v === 'undefined')
    throw new TypeError(`${name} missing`)

  return v
}

vd.string = (v, name) => {
  v = vd.type(v, 'string', name)
  
  if (v.includes(' '))
    throw new RangeError(`${name} has whitespace`)

  if (!v.length)
    throw new RangeError(`${name} empty`)

  return v
}

vd.object = (v, name) => {
  v = vd.type(v, 'object', name)
  
  return v
}

vd.action = function(action, k, prev) {
  const name = `${prev}.actions.${k}`
  const method = this[action]

  vd.string(action, name)

  if (!method)
    throw new TypeError(`${name}: missing method: this.${action}()`)
  
  if (typeof method !== 'function')
    throw new TypeError(`${name}: exp. function, got: ${typeof method}`)

  return Object.freeze(action)
}

vd.transition = function(transition, i, j) {
  const name = `state.${i}.transitions.${j}`

  vd.shape(transition, name, [
    { key: 'to', type: 'string', required: true },
    { key: 'actions', type: 'array', required: false }
  ])

  Object.values(transition.actions || {})
    .map((action, k) => vd.action.call(this, action, k, name))
  
  Object.freeze(transition)
}

vd.state = function(state, i) {
  vd.shape(state, `state.${i}`)

  Object.values(state)
    .forEach((transition, j) => 
      vd.transition.call(this, transition, i, j))
  
  return Object.freeze(state)
}

vd.states = function(v) {
  vd.defined(v, 'states')
  vd.shape(v, 'states')

  Object.values(v).forEach((state, i) => vd.state.call(this, state, i))

  return Object.freeze(v)
}

export { vd }
