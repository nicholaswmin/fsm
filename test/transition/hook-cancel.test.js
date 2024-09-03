import test from 'node:test'
import { fsm } from '../../src/index.js'

test('#transitionFn() transition hook cancels transition', async t => {
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '1')
  t.after(() => delete process.env.ALLOW_METHOD_MOCKS)   

  let turnstile, hooks

  t.beforeEach(() => {
    hooks = {
      onCoin() {},
      onOpened() {}
    }

    turnstile = fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
  })
  
  await t.test('instantiates', t => {  
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
      let onCoin, onOpened

      t.beforeEach(() => {
        onCoin = t.mock.method(hooks, 'onCoin', () => false)
        onOpened = t.mock.method(hooks, 'onOpened')

        turnstile.coin()
      })

      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'closed')
      })   

      await t.test('state hook not called', t => {  
         t.assert.strictEqual(onOpened.mock.callCount(), 0)
      })
    })
  })
})
