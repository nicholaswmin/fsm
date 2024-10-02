import test from 'node:test'
import { fsm } from '../../src/index.js'

test('#transitionFn() transition not allowed from current state ', async t => {
  let turnstile, hooks, onCoin, onOpened
  
  t.beforeEach(() => {
    hooks = {
      onCoin() {},
      onOpened() {}
    }

    turnstile = fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
    
    onCoin = t.mock.method(turnstile, 'onCoin')
    onOpened = t.mock.method(turnstile, 'onOpened')
  })

  await t.test('instantiates', t => {  
    t.assert.strictEqual(turnstile.state, 'closed')
  })
  
  await t.test('attemping a transition', async t => {  
    await t.test('listed in current state', async t => {
      let returnedValue = null

      t.beforeEach(() => { returnedValue = turnstile.coin() })

      await t.test('returns truthy value', t => {  
        t.assert.ok(returnedValue, 'transition method returned value !truthy')
      })

      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'opened')
      })
      
      await t.test('calls relevant hooks', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
        t.assert.strictEqual(onOpened.mock.callCount(), 1)
      })
    })
    

    await t.test('not listed in current state', async t => {
      await t.test('throws a descriptive error', t => {  
        t.assert.throws(() => {
          turnstile.push()
        }, {
          message: /has no transition/
        })
      })

      await t.test('does not transition', t => {
        t.assert.throws(() => turnstile.push())

        t.assert.strictEqual(turnstile.state, 'closed')
      })
      
      await t.test('does not call hooks', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 0)
        t.assert.strictEqual(onOpened.mock.callCount(), 0)
      })
    })
  })
})
