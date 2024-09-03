import test from 'node:test'

import StateMachine from '../../index.js'

test('#transition: function parameters', async t => {
  const gate = new StateMachine({
    init: 'locked',
    states: {
      locked: { unlock: { to: 'unlocked', actions: ['open']  } },
      unlocked: { lock: { to: 'locked', actions: ['close']  } }
    },
    
    actions: {
      open:  () => {},
      close: () => {}
    }
  })

  await t.test('transition name is undefined', async t => {    
    await t.test('throws a descriptive TypeError', t => {
      t.assert.throws(() => gate.transition(), {
        name: 'TypeError',
        message: /"transition name" is missing/
      })
    })
  })

  
  await t.test('transition name is not a string', async t => {    
    await t.test('throws a descriptive TypeError', t => {
      t.assert.throws(() => gate.transition(1), {
        name: 'TypeError',
        message: /"transition name" must be a valid String/
      })
    })
  })
  

  await t.test('transition name is an empty string', async t => {    
    await t.test('throws a descriptive RangeError', t => {
      t.assert.throws(() => gate.transition(''), {
        name: 'RangeError',
        message: /"transition name" must have length/
      })
    })
  })
})
