import test from 'node:test'

import StateMachine from '../../index.js'

test('#transition', async t => {
  const openFn = t.mock.fn(), closeFn = t.mock.fn()
  const gate = new StateMachine({
    init: 'locked',
    states: {
      locked: { unlock: { to: 'unlocked', actions: ['open']  } },
      unlocked: { lock: { to: 'locked', actions: ['close']  } }
    },
    
    actions: {
      open:  () => openFn(),
      close: () => closeFn()
    }
  })
  
  
  await t.test('starts in init state', async t => {
    t.assert.strictEqual(gate.current, 'locked')
  })

  
  await t.test('transition is allowed', async t => {
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())
    
    await t.test('transitions to new state', t => {
      t.assert.doesNotThrow(() => gate.transition('unlock'))
      t.assert.strictEqual(gate.current, 'unlocked')
    })
    
    await t.test('invokes the new state action', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 1)
      t.assert.strictEqual(closeFn.mock.callCount(), 0)
    })
  })
  

  await t.test('transition not allowed', async t => {
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())

    await t.test('throws a InvalidTransitionError', t => {
      t.assert.throws(() => gate.transition('unlock'), {
        name: 'InvalidTransitionError',
        message: /can only transition/ 
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
        error: 'UnknownTransitionError',
        message: /"foo" does not exist/ 
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
      t.assert.strictEqual(gate.current, 'locked')
    })
    
    await t.test('invokes the new state action', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 0)
      t.assert.strictEqual(closeFn.mock.callCount(), 1)
    })
  })
})
