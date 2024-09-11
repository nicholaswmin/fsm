import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() 1 to 1 state', async t => {
  let turnstile

  await t.test('calling 2 distinct allowed transitions, foo & bar', async t => {
    t.beforeEach(() => {
      turnstile = new FSM({ 
        locked:     { coin: 'unlocked', push: 'locked' },
        unlocked:   { coin: 'unlocked', push: 'locked' },
        outoforder: { coin: 'unlocked', push: 'locked' }
      })
    })

    await t.test('inits in correct state', t => {  
      t.assert.strictEqual(turnstile.state, 'locked')
    })
    
    await t.test('calling transition-method foo()', async t => {      
      t.beforeEach(() => {
        turnstile.coin()
      })
  
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'unlocked')
      })
    })
    
    await t.test('calling next transition-method: bar()', async t => {      
      t.beforeEach(() => {
        turnstile.coin()
        turnstile.push()
      })
  
      await t.test('transitions to next defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'locked')
      })
    })
  })
})
