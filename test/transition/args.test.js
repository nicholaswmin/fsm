import test from 'node:test'

import FSM from '../../src/fsm.js'

test('#transition: function parameters', async t => {
  class Gate extends FSM {
    constructor() {
      super({
        locked:   { unlock: { to: 'unlocked', runs: ['open']  } },
        unlocked: { lock: { to: 'locked',  runs: ['close']  } }
      })
    }
    
    open()  { console.log('gate opened ...') }
    close() { console.log('gate closed ...') }
  }
  
  const gate = new Gate()

  await t.test('transition name not passed', async t => {    
    await t.test('throws a descriptive TypeError', t => {
      t.assert.throws(() => gate.transition(), {
        name: 'TypeError',
        message: /transition missing/
      })
    })
  })

  
  await t.test('transition name not a string', async t => {    
    await t.test('throws a descriptive TypeError', t => {
      t.assert.throws(() => gate.transition(1), {
        name: 'TypeError',
        message: /transition exp. string/
      })
    })
  })
  

  await t.test('transition name empty', async t => {    
    await t.test('throws a descriptive RangeError', t => {
      t.assert.throws(() => gate.transition(''), {
        name: 'RangeError',
        message: /transition empty/
      })
    })
  })
  

  await t.test('transition name padded with whitespace', async t => {    
    await t.test('throws a descriptive TypeError', t => {
      t.assert.throws(() => gate.transition(' unlock'), {
        name: 'RangeError',
        message: /has space/
      })
    })
  })
})
