import test from 'node:test'
import FSM from '../../index.js'

test('#construct parameter: "actions"', async t => {
  await t.test('missing', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'locked',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } },
        }
      }), {
        name: 'TypeError',
        message: /actions missing/ 
      })
    })
  })

  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'locked',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } },
          unlocked: { lock: { to: 'locked', actions: ['close']  } }
        },
        actions: ''
      }), {
        name: 'TypeError',
        message: /actions exp. object/ 
      })
    })
  })

  await t.test('has 0 actions', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'locked',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } },
          unlocked: { lock: { to: 'locked', actions: ['close']  } }
        },
        actions: {}
      }), {
        name: 'RangeError',
        message: /no actions/ 
      })
    })
  })

  await t.test('action not an Function', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'locked',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } },
          unlocked: { lock: { to: 'locked', actions: ['close']  } }
        },
        actions: { open:  '' }
      }), {
        name: 'TypeError',
        message: /action.0 exp. function/ 
      })
    })
  })
  
  await t.test('action not used in any state actions', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'locked',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } },
          locked: { unlock: { to: 'unlocked', actions: ['close']  } },
        },
        actions: { 
          open:  () => {},
          close:  () => {},
          foo:  () => {}
        }
      }), {
        name: 'RangeError',
        message: /action: open not used in a transition/
      })
    })
  })
})
