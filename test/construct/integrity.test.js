import test from 'node:test'

import FSM from '../../index.js'

const valid = {
  init: 'locked',
  states: {
    locked: { unlock: { to: 'unlocked', actions: ['open'] } },
    unlocked: { lock: { to: 'locked', actions: ['close'] } }
  },
  actions: { 
    open:  () => {},
    close: () => {}
  }
}

test('FSM integrity', async t => {
  await t.test('prevents overwriting internals', async t => {
    const fsm = new FSM(valid)

    await t.test('prevents "states" modifications', t => {  
      t.assert.throws(() => fsm.states = 'foo', {
        message: /object is not extensible/ 
      })
    })
    
    await t.test('prevents "action" modifications', t => {
      t.assert.throws(() => fsm.actions = 'bar', {
        message: /object is not extensible/ 
      })
    })
    
    await t.test('prevents FSM modifications', t => {
      t.assert.throws(() => fsm.transition = 'foo', {
        message: /object is not extensible/ 
      })
    })
    
    await t.test('prevents "state" modifications', t => {
      t.assert.throws(() => fsm.state = 'baz', {
        message: /has only a getter/ 
      })
    })
    
    await t.test('prevents modifications by reference', t => {  
      t.assert.throws(() => {
        valid.actions.open = () => { throw new Error('overriden') }
      }, {
        message: /Cannot assign to read only/
      })
    })
  })
})
