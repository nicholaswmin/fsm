import test from 'node:test'
import { Sync as FSM } from '../../../src/index.js'

const resetCalls = ({ mock }) => mock.resetCalls()

test('#transitionFn() transition not allowed from current state ', async t => {
  let turnstile = null, hooks = {
    onCoin: t.mock.fn(), onPush: t.mock.fn(), 
    onClosed: t.mock.fn(), onOpened: t.mock.fn()
  }
  
  t.beforeEach(() => {
    Object.values(hooks).forEach(resetCalls)

    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
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
        turnstile.coin() 
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 1)
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 1)
      })
    })
    

    await t.test('not listed in current state', async t => {
      let returnedValue = null

      t.beforeEach(() => { returnedValue = turnstile.push() })

      await t.test('returns false', t => {  
        t.assert.strictEqual(returnedValue, false)
      })

      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
      
      await t.test('does not call hooks', t => {
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 0)
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
      })
    })
  })
})
