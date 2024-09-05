import test from 'node:test'
import FSM from '../../index.js'

test('#construct: with valid arguments', async t => {
  const args = {
    locked:   { 
      unlock: { to: 'unlocked', actions: ['open']  },
      pick:   { to: 'unlocked', actions: ['open']  } 
    },
    unlocked: { lock: { to: 'locked',  actions: ['close']  } }
  }
  
  class Gate extends FSM {
    constructor() {
      super({
        locked:   { 
          unlock: { to: 'unlocked', actions: ['open']  },
          pick:   { to: 'unlocked', actions: ['open']  } 
        },
        unlocked: { lock: { to: 'locked',  actions: ['close']  } }
      })
    }
    
    open()  { console.log('gate opened ...') }
    close() { console.log('gate closed ...') }
  }
 
  await t.test('as subclass instance', async t => {
    await t.test('all arguments valid', async t => {
      await t.test('does not throw', t => {
        t.assert.doesNotThrow(() => new Gate())
      })
      
      await t.test('sets 1st state as the initial', t => {
        const gate = new Gate()
  
        t.assert.ok(!Object.hasOwn(gate, 'state'), 'missing prop: gate.state')
        t.assert.strictEqual(gate.state, 'locked')
      })
    })
  })
  
  await t.test('as standalone instance', async t => {
    await t.test('all arguments valid', async t => {
      await t.test('does not throw', t => {
        t.assert.doesNotThrow(() => new Gate())
      })
      
      await t.test('sets 1st state as the initial', t => {
        const gate = new FSM(args, {
          open:  () => { console.log('gate opened ...') },
          close: () => { console.log('gate closed ...') }
        })
  
        t.assert.ok(!Object.hasOwn(gate, 'state'), 'missing prop: gate.state')
        t.assert.strictEqual(gate.state, 'locked')
      })
    })
  })
})
