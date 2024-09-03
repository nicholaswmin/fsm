import test from 'node:test'

import StateMachine from '../../index.js'

test('#transition', async t => {
  const openFn = t.mock.fn(), closeFn = t.mock.fn()
  const gate = new StateMachine({
    init: 'locked',
    states: {
      locked: { 
        unlock: { to: 'unlocked', actions: ['open']  },
        pick:   { to: 'unlocked', actions: ['open']  } 
      },
      unlocked: { lock: { to: 'locked', actions: ['close']  } },
    },
    
    actions: {
      open:  () => openFn(),
      close: () => closeFn()
    }
  })
  
  
  await t.test('starts in init state', async t => {
    t.assert.strictEqual(gate.state, 'locked')
  })

  
  await t.test('can transition to current state', async t => {
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())
    
    await t.test('transitions to new state', t => {
      t.assert.doesNotThrow(() => gate.transition('unlock'))
      t.assert.strictEqual(gate.state, 'unlocked')
    })
    
    await t.test('invokes the new state action', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 1)
      t.assert.strictEqual(closeFn.mock.callCount(), 0)
    })
    
    await t.test('allows call chaining', t => {
      t.assert.doesNotThrow(() => gate.transition('lock').transition('pick'))
      t.assert.strictEqual(gate.state, 'unlocked')
    })
  })
  

  await t.test('cannot transition from current state', async t => {
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())

    await t.test('throws a InvalidTransitionError', t => {
      t.assert.throws(() => gate.transition('unlock'), {
        name: 'TransitionError',
        message: /can transition to/ 
      })
    })

    await t.test('does not invoke action', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 0)
      t.assert.strictEqual(closeFn.mock.callCount(), 0)
    })
  })
  

  await t.test('transition does not exist', async t => {    
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())

    await t.test('throws a descriptive UnknownTransitionError', t => {
      t.assert.throws(() => gate.transition('foo'), {
        error: 'TransitionError',
        message: /foo does not exist/ 
      })
    })
    
    await t.test('does not invoke action again', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 0)
      t.assert.strictEqual(closeFn.mock.callCount(), 0)
    })
  })
  

  await t.test('transition name matches previous state', async t => {    
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())

    await t.test('transitions to new state', t => {
      t.assert.doesNotThrow(() => gate.transition('lock'))
      t.assert.strictEqual(gate.state, 'locked')
    })
    
    await t.test('invokes the new state action', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 0)
      t.assert.strictEqual(closeFn.mock.callCount(), 1)
    })
  })
})
