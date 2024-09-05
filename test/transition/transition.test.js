import test from 'node:test'

import FSM from '../../src/fsm.js'

test('#transition', async t => {
  const open = t.mock.fn(), close = t.mock.fn(), pick = t.mock.fn()

  class Gate extends FSM {
    constructor() {
      super({
        locked:   { 
          unlock: { to: 'unlocked', runs: ['open']  },
          pick:   { to: 'unlocked', runs: ['open', 'pick']  } 
        },
        unlocked: { lock: { to: 'locked' } }
      })
    }
    
    open()  { open()  }
    pick()  { pick()  }
    close() { close() }
  }
  
  const gate = new Gate()
  

  await t.test('has initial state', async t => {
    t.assert.strictEqual(gate.state, 'locked')
  })

  
  await t.test('current state allows attempted transition', async t => {
    t.before(t => [open, close, pick].map(({ mock }) => mock.resetCalls()))
    
    await t.test('transitions to new state', t => {
      t.assert.doesNotThrow(() => gate.transition('pick'))
      t.assert.strictEqual(gate.state, 'unlocked')
    })
    
    await t.test('invokes all runs from new state', t => {
      t.assert.strictEqual(open.mock.callCount(), 1)
      t.assert.strictEqual(pick.mock.callCount(), 1)

      t.assert.strictEqual(close.mock.callCount(), 0)
    })
    
    await t.test('allows call chaining', t => {
      t.assert.doesNotThrow(() => gate.transition('lock').transition('unlock'))
      t.assert.strictEqual(gate.state, 'unlocked')
    })
  })
  

  await t.test('current state does not allow attempted transition', async t => {
    const gate = new Gate()

    t.before(() => {
      ;[open, close, pick].map(({ mock }) => mock.resetCalls())
    })

    await t.test('throws TransitionError', t => {
      t.assert.throws(() => gate.transition('lock'), {
        name: 'TransitionError'
      })
    })
    
    await t.test('error message includes passed transition', t => {
      t.assert.throws(() => gate.transition('lock'), {
        message: /"lock" not allowed. / 
      })
    })
    
    await t.test('error message lists available transitions', t => {
      t.assert.throws(() => gate.transition('lock'), {
        message: /"unlock" for state: "unlocked", "pick" for state: "unlocked"/ 
      })
    })

    await t.test('does not invoke any runs', t => {
      t.assert.strictEqual(open.mock.callCount(), 0)
      t.assert.strictEqual(close.mock.callCount(), 0)
    })
  })
  

  await t.test('transition missing', async t => {    
    t.before(t => [open, close, pick].map(({ mock }) => mock.resetCalls()))

    await t.test('throws TransitionError', t => {
      t.assert.throws(() => gate.transition('foo'), {
        error: 'TransitionError',
        message: /foo missing/ 
      })
    })
    
    await t.test('does not invoke any runs', t => {
      t.assert.strictEqual(open.mock.callCount(), 0)
      t.assert.strictEqual(close.mock.callCount(), 0)
    })
  })
  

  await t.test('transition name matches previous state', async t => {    
    t.before(t => [open, close, pick].map(({ mock }) => mock.resetCalls()))

    await t.test('transitions to new state', t => {
      t.assert.doesNotThrow(() => gate.transition('lock'))
      t.assert.strictEqual(gate.state, 'locked')
    })
    
    await t.test('invokes new state runs, if they exist', t => {
      t.assert.strictEqual(open.mock.callCount(), 0)
    })
  })
})
