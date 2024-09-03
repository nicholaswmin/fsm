import test from 'node:test'
import { fsm } from '../../src/index.js'

test('async #transitionFn()', async t => {
  let turnstile, hooks, onCoin, onPush, onOpened

  await t.test('transitioning', async t => {
    t.beforeEach(() => {
      turnstile = fsm({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
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

  await t.test('transition hook returns false', async t => {
    t.beforeEach(() => {
      hooks = {
        async onCoin() {},
        async onPush() {},
        async onOpened() {}
      }

      turnstile = fsm({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      }, hooks)

      onOpened = t.mock.method(hooks, 'onOpened')
      onPush = t.mock.method(hooks, 'onPush')
      onCoin = t.mock.method(hooks, 'onCoin', async function () {
        await new Promise(resolve => setTimeout(resolve, 20))

        return false
      })
      
      return turnstile.coin()
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

  await t.test('transition not listed in current state', async t => {
    t.beforeEach(() => {
      turnstile = fsm({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      }, {
        async onPush() {},
        async onOpened() {}
      })

      onOpened = t.mock.method(turnstile, 'onOpened')
      onPush = t.mock.method(turnstile, 'onPush')
    })

    await t.test('rejects with descriptive error', async t => {  
      await t.assert.rejects(async () => {
        await turnstile.push()
      }, {
        message: /has no transition/
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
