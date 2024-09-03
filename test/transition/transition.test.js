import test from 'node:test'

import StateMachine from '../../index.js'

test('#transition is chainable', async t => {
  const openFn = t.mock.fn(), closeFn = t.mock.fn()
  const gate = new StateMachine({
    init: 'locked',
    states: {
      locked: { unlock: { to: 'unlocked', actions: ['open'] } },
      unlocked: { lock: { to: 'locked', actions: ['close'] } }
    },

    actions: {
      open: () => openFn(),
      close: () => closeFn()
    }
  })


  await t.test('chaining .transition() calls', async t => {
    t.before(t => openFn.mock.resetCalls(), closeFn.mock.resetCalls())

    await t.test('does not throw', t => {
      t.assert.doesNotThrow(() => gate.transition('unlock').transition('lock'))
    })

    await t.test('transitions to final state', t => {
      t.assert.strictEqual(gate.state, 'locked')
    })

    await t.test('invokes state actions', t => {
      t.assert.strictEqual(openFn.mock.callCount(), 1)
      t.assert.strictEqual(closeFn.mock.callCount(), 1)
    })
  })
})
