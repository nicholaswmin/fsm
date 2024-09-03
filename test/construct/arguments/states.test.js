import test from 'node:test'
import FSM from '../../../index.js'

class Gate extends FSM {
  constructor() { super() }
}

test('#construction parameter: "states"', async t => {
  await t.test('not set', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => (new class Gate extends FSM {
        constructor() { super() }
      }), {
        name: 'TypeError',
        message: /states missing/ 
      })
    })
  })

  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new (class Gate extends FSM {
        constructor() { 
          super('') 
        }
      }), {
        name: 'TypeError',
        message: /states exp. object/ 
      })
    })
  })
  
  await t.test('lists 0 states', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new (class Gate extends FSM {
        constructor() { 
          super({}) 
        }
      }), {
        name: 'RangeError',
        message: /states empty/ 
      })
    })
  })
  
  await t.test('lists 0 transitions', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new (class Gate extends FSM {
        constructor() { 
          super({
            locked: {}
          }) 
        }
      }), {
        name: 'RangeError',
        message: /state.0 empty/ 
      })
    })

    await t.test('transition not an object', t => {
      t.assert.throws(() => new (class Gate extends FSM {
        constructor() { 
          super({
            locked: { unlock: 3 }
          }) 
        }
      }), {
        name: 'TypeError',
        message: /state.0.transitions.0 exp. object, got: number/ 
      })
    })
  })
  
  await t.test('transition.to property', async t => {    
    await t.test('missing', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { actions: ['foo'] } }
            }) 
          }
        }), {
          name: 'TypeError',
          message: /state.0.transitions.0 missing: .to/ 
        })
      })
    })  

    await t.test('"transition.to" not a string', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { to: 3, actions: ['foo'] } }
            }) 
          }
        }), {
          name: 'TypeError',
          message: /state.0.transitions.0.to exp. string, got: number/ 
        })
      })
      
      await t.test('"transition.to" has whitespace', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: ' open', actions: ['foo'] } }
              }) 
            }
          }), {
            name: 'RangeError',
            message: /whitespace/ 
          })
        })
      })
    })
  })

  await t.test('"transition.actions" property', async t => {      
    await t.test('not set', async t => {
      await t.test('allows it', t => {
        t.assert.doesNotThrow(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { to: 'open' } }
            }) 
          }
        }))
      })
    })

    await t.test('is set', async t => {
      await t.test('as a non-array', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: 30 } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /state.0.transitions.0.actions exp. array/ 
          })
        })
      })
      
      await t.test('empty', async t => {
        await t.test('allows it', t => {
          t.assert.doesNotThrow(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: [] } }
              }) 
            }
          }))
        })
      })
    })
    
    await t.test('includes action', async t => {
      await t.test('not a string', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: [5] } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /state.0.transitions.0.actions.0 exp. string/ 
          })
        })
      })
      
      await t.test('has whitespace', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: ['fooFn '] } }
              }) 
            }
          }), {
            name: 'RangeError',
            message: /has whitespace/ 
          })
        })
      })
      
      
      await t.test('missing from "this"', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: ['fooFn'] } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /transitions.0.actions.0: missing: .fooFn()/ 
          })
        })
      })
      
      await t.test('missing as "this.method()" ', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', actions: ['fooFn'] } }
              }) 
              
              this.fooFn = 'foo!'
            }
          }), {
            name: 'TypeError',
            message: /transitions.0.actions.0: missing: .fooFn()/ 
          })
        })
      })
    })
  })
})
