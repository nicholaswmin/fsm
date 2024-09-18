import test from 'node:test'
import { Sync as FSM } from '../../../src/index.js'

test('#transitionFn() transition not allowed from current state ', async t => {
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '1')
  t.after(() => delete process.env.ALLOW_METHOD_MOCKS)   

  let turnstile, onCoin, onOpened
  
  class Turnstile extends FSM {
    constructor() {
      super({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    }
    
    onCoin()   {}
    onOpened() {}
  }
  
  t.beforeEach(() => {
    turnstile = new Turnstile()
    
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
        turnstile.coin() 
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
        t.assert.strictEqual(onOpened.mock.callCount(), 1)
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
        t.assert.strictEqual(onCoin.mock.callCount(), 0)
        t.assert.strictEqual(onOpened.mock.callCount(), 0)
      })
    })
  })
})
