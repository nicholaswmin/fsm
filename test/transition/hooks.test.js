import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() calls hooks', async t => {
  let turnstile 
  
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '1')
  
  t.after(() => process.env.ALLOW_METHOD_MOCKS = '0')     

  class Turnstile extends FSM {
    constructor() {
      super({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    }
    
    onCoin() { }
    onPush() {}

    onOpened() {}
    onClosed() {}
  }

  t.beforeEach(() => {
    turnstile = new Turnstile()
  })
  
  await t.test('calling transition method', async t => {     
    const captureState = function() { return this.state }

    await t.test('calls transition hook', async t => {    
      let onCoin
      
      t.beforeEach(() => {
        onCoin = t.mock.method(turnstile, 'onCoin', captureState)
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
        t.assert.strictEqual(mock.calls[0].this.constructor.name, 'Turnstile')
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
        t.assert.strictEqual(mock.calls[0].this.constructor.name, 'Turnstile')
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
