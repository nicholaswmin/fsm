import test from 'node:test'
import FSM from '../../index.js'

test('#construct parameter: "init"', async t => {  
  await t.test('missing', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } }
        },
        actions: {  open:  () => {} }
      }), {
        name: 'TypeError',
        message: /"init" parameter missing/ 
      })
    })
  })
  
  await t.test('not a String', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 3,
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } }
        },
        actions: {  open:  () => {} }
      }), {
        name: 'TypeError',
        message: /"init" must be a valid String/ 
      })
    })
  })
  
  await t.test('is empty', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => new FSM({ 
        init: '',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } }
        },
        actions: {  open:  () => {} }
      }), {
        name: 'RangeError',
        message: /"init" must have length/ 
      })
    })
  })
  
  await t.test('does not exist as a state', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => new FSM({ 
        init: 'foo',
        states: {
          locked: { unlock: { to: 'unlocked', actions: ['open']  } }
        },
        actions: {  open:  () => {} }
      }), {
        name: 'TypeError',
        message: /state: "foo" does not exist/ 
      })
    })
  })
})
