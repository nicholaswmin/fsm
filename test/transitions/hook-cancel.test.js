import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() hook: onTransition cancels transition', async t => {
  let turnstile = null, onCoin = t.mock.fn(), onUnlocked = t.mock.fn()

  t.beforeEach(() => {
    onCoin.mock.resetCalls()
    onUnlocked.mock.resetCalls()

    turnstile = new FSM({ 
      locked  : { coin: 'unlocked', push: 'locked' },
      unlocked: { coin: 'unlocked', push : 'locked' }
    }, { onCoin, onUnlocked })
  })
  
  await t.test('inits in correct state', t => {  
    t.assert.strictEqual(turnstile.state, 'locked')
  })
  
  await t.test('onTransitionChange does not return anything', async t => {      
    await t.test('calling transition foo()', async t => {  
      turnstile.coin()

      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'locked')
      })
    })
  })

  await t.test('onTransitionChange returns false', async t => {      
    await t.test('calling transition foo()', async t => {  
      t.before(() => {
        onCoin.mock.mockImplementationOnce(() => false)
      })
        
      turnstile.coin()

      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'locked')
      })   

      await t.test('onStateChanged hook not called', t => {  
         t.assert.strictEqual(onUnlocked.mock.callCount(), 0)
      })
    })
  })
})
