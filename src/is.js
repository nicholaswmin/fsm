const is = {}, has = {
  err: {
    range: (n, msg = 'empty') => { throw RangeError(`${n} ${msg}`) },
    type: (v, n, e = 'object', t) => { 
      throw TypeError(`${n} exp: ${e}, got: ${t || typeof v}`) 
    }
  }
}

is.type = (val, t, n) => typeof val !== t ? has.err.type(val, n, t) : val

is.space = (val, n) => val.includes(' ') ? has.err.range(n, 'has spaces') : val

is.empty = (val, n) => val.length === 0 || Object.keys(val).length === 0
    ? has.err.range(n) : val

is.object = (val, n) => is.type(val, 'object', n) && val !== null
  ? Array.isArray(val)
    ? has.err.type(val, n, 'object', 'array')
    : val : val

is.string = (val, n) => is.space(is.empty(is.type(val, 'string', n), n), n)

export { has, is }
