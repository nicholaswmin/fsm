const vd =  {}

vd.shape = (v, name, defs = []) => {
  vd.type(v, 'object', name)

  if (!Object.keys(v).length) 
    throw RangeError(`${name} empty`)

  defs.forEach(({ key, type, optional }) => { 
    if (!Object.hasOwn(v, key))
      if (optional)
        return
      else
        throw TypeError(`${name} missing: .${key}`)

    if (type !== 'array')
      return vd[type](v[key], `${name}.${key}`) 
    
    if (!Array.isArray(v[key]))
      throw TypeError(`${name}.${key} exp. array, is: ${typeof v}`)
  })
  
  return v
}

vd.type = (v, type, name) => {
  v = vd.defined(v, name)

  if (typeof v !== type)
    throw TypeError(`${name} exp. ${type}, is: ${typeof v}`)
  
  return v
}

vd.defined = (v, name) => {
  if (!v && v != 0)
    throw TypeError(`${name} missing`)

  return v
}

vd.string = (v, name) => {
  v = vd.type(v, 'string', name)
  
  if (v.includes(' '))
    throw RangeError(`${name} has space`)

  if (!v.length)
    throw RangeError(`${name} empty`)

  return v
}

vd.run = function(run, k, prev) {
  const name = `run.${k}`
  const method = this[run]

  vd.string(run, name)

  if (!method || typeof method !== 'function')
    throw TypeError(`${name}: ${run}() not found`)

  return Object.freeze(run)
}

vd.transition = function(v, transition, i, j) {
  const name = `transition.${j}`,
    { runs, to } = transition

  vd.shape(transition, name, [
    { key: 'to', type: 'string' },
    { key: 'runs', type: 'array', optional: true }
  ])

  Object.values(runs || {})
    .map((run, k) => vd.run.call(this, run, k, name))

  if (!v[to])
    throw RangeError(`state "${to}" missing`)
  
  Object.freeze(transition)
}

vd.state = function(v, state, i) {
  vd.shape(state, `state.${i}`)

  Object.values(state)
    .forEach((transition, j) => 
      vd.transition.call(this, v, transition, i, j))
  
  return Object.freeze(state)
}

vd.states = function(v) {
  vd.defined(v, 'states')
  vd.shape(v, 'states')

  Object.values(v).forEach((state, i) => vd.state.call(this, v, state, i))

  return Object.freeze(v)
}

export default vd
