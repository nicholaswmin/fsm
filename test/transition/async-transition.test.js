import test from 'node:test'
import { Async as FSM } from '../../src/index.js'

test('async #transitionFn()', async t => {
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '1')
  t.after(() => delete process.env.ALLOW_METHOD_MOCKS)   

  let turnstile, onCoin, onPush, onOpened

  class Turnstile extends FSM {
    constructor() {
      super({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    }
    
    async onCoin() {}
    async onPush() {}
    async onOpened() {}
  }

  await t.test('transitioning via await transition-method', async t => {
    t.beforeEach(() => {
      turnstile = new Turnstile()
    })

    await t.test('instantiates', t => {
      t.assert.strictEqual(turnstile.state, 'closed')
    })

    await t.test('await transition-method', async t => {
      await t.test('returns truthy value', async t => {
        t.assert.ok(!!(await turnstile.coin(), 'got non-truthy value'))
      })

      await t.test('transitions to defined state', async t => {
        await turnstile.coin()
        t.assert.strictEqual(turnstile.state, 'opened')
      })
    })
  })

  await t.test('async transition hook returns false', async t => {
    t.beforeEach(async () => {
      turnstile = new Turnstile()
      
      onOpened = t.mock.method(turnstile, 'onOpened')
      onPush = t.mock.method(turnstile, 'onPush')
      onCoin = t.mock.method(turnstile, 'onCoin', async function () {
        await new Promise(resolve => setTimeout(resolve, 20))

        return false
      })
      
      turnstile.coin()
    })

    await t.test('calling transition method', async t => {
      await t.test('state does not change', async t => {
        t.assert.strictEqual(turnstile.state, 'closed')
      })

      await t.test('state hook is not called', t => {
        t.assert.strictEqual( onOpened.mock.callCount(), 0)
      })
    })
  })

  await t.test('async invalid hook', async t => {
    await t.test('behavior set to throw Error', async t => {
      class NoisyTurnstile extends FSM {
        static async onInvalid() {
          await new Promise(resolve => setTimeout(resolve, 20))
          
          throw new Error('not allowed')
        }
        
        constructor() {
          super({
            closed: { coin: 'opened' },
            opened: { push: 'closed' }
          })
        }
        
        async onCoin() {}
        async onPush() {}
        async onOpened() {}
      }
      
      t.beforeEach(() => {
        turnstile = new NoisyTurnstile()

        onOpened = t.mock.method(turnstile, 'onOpened')
        onPush = t.mock.method(turnstile, 'onPush')
        onCoin = t.mock.method(turnstile, 'onCoin', async function () {
          await new Promise(resolve => setTimeout(resolve, 20))
  
          return false
        })
        
        turnstile.coin()
      })

      await t.test('rejects with error', async t => {  
        await t.assert.rejects(() => {
          return turnstile.push()
        }, {
          message: /not allowed/
        })
      })
  
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })

      await t.test('state hook is not called', t => {
        t.assert.strictEqual(onOpened.mock.callCount(), 0)
        t.assert.strictEqual(onPush.mock.callCount(), 0)
      })
    })
  })
})
