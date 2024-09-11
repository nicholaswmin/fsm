import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() each transition maps to 1 state', async t => {
  let turnstile

  await t.test('calling 2 distinct allowed transitions, foo & bar', async t => {
    t.beforeEach(() => {
      turnstile = new FSM({ 
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    })

    await t.test('inits in correct state', t => {  
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
    
    await t.test('sync transition methods are chainable', async t => {      
      t.beforeEach(() => turnstile.coin().push())
  
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'closed')
      })
    })
  })
})
