import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() transition hook cancels transition', async t => {
  let turnstile = null, onCoin = t.mock.fn(), onOpened = t.mock.fn()

  t.beforeEach(() => {
    onCoin.mock.resetCalls()
    onOpened.mock.resetCalls()

    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, { onCoin, onOpened })
  })
  
  
  await t.test('inits in correct state', t => {  
    t.assert.strictEqual(turnstile.state, 'closed')
  })
  
  
  await t.test('transition hook does not return a value', async t => {      
    await t.test('calling transition method', async t => {  
      t.beforeEach(() => turnstile.coin())

      
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'opened')
      })
    })
  })

  
  await t.test('transition hook explicitly returns false', async t => {      
    await t.test('calling transition method', async t => {  
      t.before(() => onCoin.mock.mockImplementationOnce(() => false))
        
      turnstile.coin()

      
      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'closed')
      })   

      
      await t.test('state hook not called', t => {  
         t.assert.strictEqual(onOpened.mock.callCount(), 0)
      })
    })
  })
})
