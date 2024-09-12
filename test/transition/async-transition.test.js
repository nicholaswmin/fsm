import test from 'node:test'
import { Async as FSM } from '../../src/index.js'

const resetCalls = ({ mock }) => mock.resetCalls()

test('async #transitionFn()', async t => {
  let turnstile = null,
    hooks = { 
      onCoin: t.mock.fn(), 
      onOpened: t.mock.fn(), 
      onPush: t.mock.fn() 
    }

  t.beforeEach(() => {
    Object.values(hooks).forEach(resetCalls)

    turnstile = new FSM({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
  })

  await t.test('transitioning via await transition-method', async t => {
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
    await t.test('calling transition method', async t => {
      t.before(() => {
        hooks.onCoin.mock.mockImplementationOnce(() => {
          return new Promise(resolve =>
            setTimeout(resolve.bind(null, false), 1))
        })
      })

      await t.test('state does not change', async t => {
        await turnstile.coin()
        t.assert.strictEqual(turnstile.state, 'closed')
      })

      await t.test('state hook is not called', t => {
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
      })
    })
  })

  await t.test('async invalid hook', async t => {
    await t.test('behavior set to throw Error', async t => {
      t.before(() => {
        FSM.onInvalid = async () => {
          await new Promise(resolve =>
            setTimeout(resolve.bind(null, false), 1))
          
          throw Error('not allowed')
        }
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
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
        t.assert.strictEqual(hooks.onPush.mock.callCount(), 0)
      })
    })
  })
})
