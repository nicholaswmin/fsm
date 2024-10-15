import test from 'node:test'
import { fsm } from '../../src/index.js'

test('#transitionFn() calls hooks', async t => {
  let turnstile, hooks

  t.beforeEach(() => {
    hooks = {
      onCoin() {},
      onPush() {},
  
      onOpened() {},
      onClosed() {}
    }

    turnstile = fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
  })
  
  await t.test('calling transition method', async t => {     
    const captureState = function() { return this.state }

    await t.test('calls transition hook', async t => {    
      let onCoin
      
      t.beforeEach(() => {
        onCoin = t.mock.method(hooks, 'onCoin', captureState)
        turnstile.coin('foo', 'bar')
      })

      await t.test('once', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
      })
      
      await t.test('once', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
      })
      
      await t.test('before the state changes', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].result, 'closed')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].arguments.length, 2)
        t.assert.ok(onCoin.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onCoin.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        const { mock } = onCoin

        t.assert.strictEqual(mock.calls[0].this.constructor.name, 'Object')
      })
    })
    
    await t.test('transitions to defined state', t => {  
      turnstile.coin('foo', 'bar')
      t.assert.strictEqual(turnstile.state, 'opened')
    })
    
    await t.test('calls state change hook', async t => {  
      let onOpened
      
      t.beforeEach(() => {
        onOpened = t.mock.method(turnstile, 'onOpened', captureState)
        turnstile.coin('foo', 'bar')
      })

      await t.test('once', t => {
        t.assert.strictEqual(onOpened.mock.callCount(), 1)
      })
      
      await t.test('after the state changes', t => {
        t.assert.strictEqual(onOpened.mock.calls[0].result, 'opened')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onOpened.mock.calls[0].arguments.length, 2)
        t.assert.ok(onOpened.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onOpened.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        const { mock } = onOpened
        t.assert.strictEqual(mock.calls[0].this.constructor.name, 'Object')
      })
    })
    
    await t.test('calls only the relevant hooks', async t => {
      const onCoin = t.mock.method(turnstile, 'onCoin'),
            onPush = t.mock.method(turnstile, 'onPush'),
            onOpened = t.mock.method(turnstile, 'onOpened'),
            onClosed = t.mock.method(turnstile, 'onClosed')

      turnstile.coin('foo', 'bar')
      
      await t.test('calls relevant hooks', t => {  
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
        t.assert.strictEqual(onOpened.mock.callCount(), 1)
      })

      await t.test('does not call irrelevant transition hook', t => {  
        t.assert.strictEqual(onPush.mock.callCount(), 0)
      })
      
      await t.test('does not call irrelevant state hook', t => {  
        t.assert.strictEqual(onClosed.mock.callCount(), 0)
      })
    })
  })
})
