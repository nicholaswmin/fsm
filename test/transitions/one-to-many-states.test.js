import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() some transitions map to many(*) states', async t => {
  let turnstile

  t.beforeEach(() => {
    turnstile = new FSM({ 
      closed: { coin: 'opened', break: 'broken' },
      opened: { push: 'closed'                  },
      broken: { fix : 'closed', push:  'opened' }
    })
  })

  
  await t.test('inits in correct state', t => {  
    t.assert.ok(turnstile)
    t.assert.strictEqual(turnstile.state, 'closed')
  })
  
  
  await t.test('calling 1:1 transition', async t => {      
    t.beforeEach(() => turnstile.break())
    
    
    await t.test('transitions to defined state', async t => {  
      t.assert.strictEqual(turnstile.state, 'broken')
      
      
      await t.test('calling a 1:* transition', async t => {
        t.beforeEach(() => turnstile.push())

        
        await t.test('transitions to defined state', async t => {  
          t.assert.strictEqual(turnstile.state, 'opened')
          
          
          await t.test('calling same transition, in another state', async t => {
            t.beforeEach(() => turnstile.push())
    
            
            await t.test('transitions to the other state', t => {  
              t.assert.strictEqual(turnstile.state, 'closed')
            })
          })  
        })
      })   
    })
  })
})
