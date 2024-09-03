import test from 'node:test'
import FSM from '../../index.js'

test('#construct', async t => {
  const valid = {
    init: 'locked',
    states: {
      locked:   { unlock: { to: 'unlocked', actions: ['open']  } },
      unlocked: { lock: { to: 'locked', actions: ['close']     } }
    },
    actions: { 
      open:  () => {},
      close: () => {}
    }
  }

  await t.test('all parameters valid', async t => {
    await t.test('does not throw', t => {
      t.assert.doesNotThrow(() => new FSM(valid))
    })
    
    await t.test('has set initial state', t => {
      const fsm = new FSM(valid)

      t.assert.ok(!Object.hasOwn(fsm, 'state'), 'missing fsm prop "state"')
      t.assert.strictEqual(fsm.state, 'locked')
    })
  })
})
