import test from 'node:test'
import { Async as FSM } from '../../src/index.js'

test('async #transitionFn()', async t => {
  let turnstile = null, onCoin = t.mock.fn(), onOpened = t.mock.fn()

  t.beforeEach(() => {
    onCoin.mock.resetCalls()
    onOpened.mock.resetCalls()

    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, { onCoin, onOpened })
  })

  
  await t.test('transitioning via await transition-method', async t => {
    await t.test('inits in correct state', t => {  
      t.assert.strictEqual(turnstile.state, 'closed')
    })
    
    
    await t.test('calling transition-method await foo()', async t => {        
      await t.test('transitions to defined state', async t => {  
        await turnstile.coin()
        t.assert.strictEqual(turnstile.state, 'opened')
      })
    })
  })
  

  await t.test('async onTransitionChange returns false', async t => {      
    await t.test('calling transition foo()', async t => {  
      t.before(() => {
        onCoin.mock.mockImplementationOnce(() => {
          return new Promise(resolve => 
            setTimeout(resolve.bind(null, false), 50))
        })
      })
        
      
      await t.test('state does not change', async t => {  
        await turnstile.coin()
        t.assert.strictEqual(turnstile.state, 'closed')
      })   

      
      await t.test('onStateChanged hook not called', t => {  
         t.assert.strictEqual(onOpened.mock.callCount(), 0)
      })
    })
  })
})
