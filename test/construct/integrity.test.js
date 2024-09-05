import test from 'node:test'

import FSM from '../../src/fsm.js'

test('Integrity', async t => {
  await t.test('prevents overwriting internals', async t => {
    class Gate extends FSM {
      constructor(args) { super(args) }
      open()  { console.log('gate opened ...') }
      close() { console.log('gate closed ...') }
    }
    
    const args = {
      locked: {  pick: { to: 'unlocked', runs: ['open']  }  },
      unlocked: { lock: { to: 'locked',  runs: ['close']  } }
    }
    
    const gate = new Gate(args)

    await t.test('prevents meddling with internals', t => {  
      t.assert.throws(() => gate.state = 'foo', {
        message: /has only a getter/ 
      })
    })

    
    await t.test('prevents method overrides', t => {
      t.assert.throws(() => gate.transition = 'foo', {
        message: /object is not extensible/ 
      })
    })
    
    await t.test('prevents meddling by-reference', t => {  
      t.assert.throws(() => {
        args.locked.pick.runs = ['nonExistentFn']
      }, {
        message: /Cannot assign to read only/
      })
      
      t.assert.doesNotThrow(() => gate.transition('pick'))
    })
  })
})
