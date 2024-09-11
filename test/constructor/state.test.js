import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#constructor initial state', async t => {
  let turnstile


  t.beforeEach(() => {
    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  })
 

  await t.test('instantiates', t => {
    t.assert.ok(turnstile)
  })
  

  await t.test('has .state property', t => {
    t.assert.ok(!!turnstile.state, 'Cannot find prop: "state"')
  })
  

  await t.test('initial state set as 1st in "states"', t => {
    t.assert.strictEqual(turnstile.state, 'closed')
  })
  

  await t.test('is read-only', async t => {  
    await t.test('setting it externally', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => {
          turnstile.state = 'foo'
        }, {
          name: 'TypeError',
          message: /has only a getter/ 
        })
      })
      

      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'closed')
      })
    })
  })
})
