import test from 'node:test'
import { fsm } from '../../src/index.js'

test('#transitionFn() 1:1 transition:state', async t => {
  let turnstile
  
  await t.test('calling 2 distinct & allowed transitions', async t => {
    t.beforeEach(() => {
      turnstile = fsm({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    })

    await t.test('instantiates', t => {  
      t.assert.strictEqual(turnstile.state, 'closed')
    })
    
    await t.test('calling transition method', async t => {      
      t.beforeEach(() => turnstile.coin())
  
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'opened')
      })
      
      await t.test('calling next transition method', async t => {      
        t.beforeEach(() => turnstile.push())
        
        await t.test('transitions to defined state', t => {  
          t.assert.strictEqual(turnstile.state, 'closed')
        })
      })
    })
  })
})
