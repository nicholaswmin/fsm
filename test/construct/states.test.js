import test from 'node:test'
import FSM from '../../index.js'

test('#construct parameter: "states"', async t => {
  await t.test('no parameters', async t => {
    await t.test('throws TypeError', async t => {
      t.assert.throws(() => new FSM(), { name: 'TypeError' })
    })
  })
  
  await t.test('states', async t => {
    await t.test('missing', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new FSM({ 
          init: 'foo',
          actions: {  open:  () => {} }
        }), {
          name: 'TypeError',
          message: /states is missing/ 
        })
      })
    })

    await t.test('not an object', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new FSM({ 
          init: 'foo',
          states: '',
          actions: {  open:  () => {} }
        }), {
          name: 'TypeError',
          message: /states exp. object/ 
        })
      })
    })
    
    await t.test('has 0 states', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new FSM({ 
          init: 'foo',
          states: {},
          actions: {  open:  () => {} }
        }), {
          name: 'RangeError',
          message: /no states found/ 
        })
      })
    })
    
    await t.test('state has 0 transitions', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => new FSM({ 
          init: 'foo',
          states: {
            locked: {  }
          },
          actions: {  open:  () => {} }
        }), {
          name: 'RangeError',
          message: /state.0 has no transitions/ 
        })
      })

      await t.test('"state.transition" is not an object', t => {
        t.assert.throws(() => new FSM({ 
          init: 'foo',
          states: {
            locked: { unlock: 3 }
          },
          actions: {  open:  () => {} }
        }), {
          name: 'TypeError',
          message: /state.0.transition.0 exp. object, got: number/ 
        })
      })
    })

    await t.test('transition has "actions" property', async t => {      
      await t.test('"state.actions" is not an Array', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new FSM({ 
            init: 'foo',
            states: {
              locked:   { unlock: { to: 'unlocked', actions: 3 } },
            },
            actions: {  open:  () => {} }
          }), {
            name: 'TypeError',
            message: /state.0.transition.0.actions exp. array/ 
          })
        })
      })
      
      await t.test('"state.actions[0]" has 0 actions', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.doesNotThrow(() => new FSM({ 
            init: 'locked',
            states: {
              locked: { unlock: { to: 'unlocked', actions: [] } },
              unlocked: { lock: { to: 'locked', actions: ['close'] } }
            },
            actions: {  close:  () => {} }
          }))
        })
      })
      
      await t.test('"state.actions[0]" action is not a String', async t => {
        await t.test('throws descriptive TypeError', t => {
          t.assert.throws(() => new FSM({ 
            init: 'foo',
            states: {
              locked: { unlock: { to: 'unlocked', actions: [3] } }
            },
            actions: {  open:  () => {} }
          }), {
            name: 'TypeError',
            message: /state.0.transition.0.actions.0 exp. string/ 
          })
        })
      })
      
      await t.test('"state.action not present in "actions"', async t => {
        await t.test('throws descriptive RangeError', t => {
          t.assert.throws(() => new FSM({ 
            init: 'foo',
            states: {
              locked: { unlock: { to: 'unlocked', actions: ['open'] } }
            },
            actions: { close:  () => {} }
          }), {
            name: 'TypeError',
            message: /state.0.transition.0.actions.0: open not present/ 
          })
        })
      })
    })
  })
})
