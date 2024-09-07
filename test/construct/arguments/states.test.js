import test from 'node:test'
import FSM from '../../../src/fsm.js'

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
        message: /transition.0 exp. object, is: number/ 
      })
    })
  })
  
  await t.test('transition.to property', async t => {    
    await t.test('missing', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { to: 'locked', runs: ['open'] } },
              unlocked: { lock: { runs: ['open'] } }
            }) 
          }
          
          open() {}
        }), {
          name: 'TypeError',
          message: /transition.0 missing: .to/ 
        })
      })
    })  

    await t.test('"transition.to" not a string', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { to: 3, runs: ['foo'] } }
            }) 
          }
        }), {
          name: 'TypeError',
          message: /transition.0.to exp. string, is: number/ 
        })
      })
      
      await t.test('"transition.to" has whitespace', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: ' open', runs: ['foo'] } }
              }) 
            }
          }), {
            name: 'RangeError',
            message: /has space/ 
          })
        })
      })
      
      await t.test('"transition.to" not listed as a state', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', runs: [] } }
              }) 
            }
          }), {
            name: 'RangeError',
            message: /state "open" missing/ 
          })
        })
      })
    })
  })

  await t.test('"transition.runs" property', async t => {      
    await t.test('not set', async t => {
      await t.test('allows it', t => {
        t.assert.doesNotThrow(() => new (class Gate extends FSM {
          constructor() { 
            super({
              locked: { unlock: { to: 'unlocked' } },
              unlocked: { unlock: { to: 'locked' } }
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
                locked: { unlock: { to: 'open', runs: 30 } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /runs exp. array/ 
          })
        })
      })
      
      await t.test('empty', async t => {
        await t.test('allows it', t => {
          t.assert.doesNotThrow(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'unlocked', runs: [] } },
                unlocked: { unlock: { to: 'locked', runs: [] } }
              }) 
            }
          }))
        })
      })
    })
    
    await t.test('includes run', async t => {
      await t.test('not a string', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', runs: [5] } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /run.0 exp. string/ 
          })
        })
      })
      
      await t.test('has whitespace', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', runs: ['fooFn '] } }
              }) 
            }
          }), {
            name: 'RangeError',
            message: /has space/ 
          })
        })
      })
      
      
      await t.test('missing from "this"', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', runs: ['fooFn'] } }
              }) 
            }
          }), {
            name: 'TypeError',
            message: /not found/ 
          })
        })
      })
      
      await t.test('missing as "this.method()" ', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new (class Gate extends FSM {
            constructor() { 
              super({
                locked: { unlock: { to: 'open', runs: ['fooFn'] } }
              }) 
              
              this.fooFn = 'foo!'
            }
          }), {
            name: 'TypeError',
            message: /not found/ 
          })
        })
      })
    })
  })
})
