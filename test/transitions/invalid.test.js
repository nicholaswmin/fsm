import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() attemping invalid transitions', async t => {
  let turnstile
  
  t.before(() => {
    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  })
  
  
  await t.test('inits in correct state', t => {  
    t.assert.strictEqual(turnstile.state, 'closed')
  })

  
  await t.test('calling transition method', async t => {  
    await t.test('transitions to defined state', async t => {  
      t.assert.strictEqual(turnstile.coin().state, 'opened')
    })

    
    await t.test('calling same stransition method again', async t => {  
      await t.test('throws descriptive Error', async t => {
        t.assert.throws(() => {
          turnstile.coin()
        }, {
          name: 'Error',
          message: /coin from: opened/ 
        })
        
        t.assert.strictEqual(turnstile.state, 'opened')
      })

      
      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'opened')
      })
    })
    
    
    await t.test('calling the correct transition', async t => {  
      t.before(() => turnstile.push())
      
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'closed')
      })
    })
  })
})
