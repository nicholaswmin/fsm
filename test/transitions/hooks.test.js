import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() calls transition & state hooks', async t => {
  let turnstile = null, onCoin = t.mock.fn(), onPush = t.mock.fn(), 
      onLocked = t.mock.fn(), onUnlocked = t.mock.fn()

  t.beforeEach(() => {
    ;[onCoin, onPush, onLocked, onUnlocked].forEach(fn => fn.mock.resetCalls())

    turnstile = new FSM({ 
      locked:     { coin: 'unlocked', push: 'locked' },
      unlocked:   { coin: 'unlocked', push: 'locked' },
      outoforder: { coin: 'unlocked', push: 'locked' }
    }, {
      onCoin, onPush, onLocked, onUnlocked
    })
  })

  await t.test('calling transition foo()', async t => { 
    function captureState() { return this.state }

    t.beforeEach(() => turnstile.coin('foo', 'bar'))
    t.before(() => {
      onCoin.mock.mockImplementation(captureState)
      onUnlocked.mock.mockImplementation(captureState)
    })

    t.after(() => {
      onCoin.mock.restore()
      onUnlocked.mock.restore()
    })
    
    await t.test('calls transition hook', async t => {        
      await t.test('once', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
      })
      
      await t.test('before the state changes', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].result, 'locked')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].arguments.length, 2)
        t.assert.ok(onCoin.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onCoin.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].this.constructor.name, 'Sync')
      })
    })
    
    await t.test('transitions to defined state', t => {  
      t.assert.strictEqual(turnstile.state, 'unlocked')
    })
    
    await t.test('calls state change hook', async t => {  
      await t.test('once', t => {
        t.assert.strictEqual(onUnlocked.mock.callCount(), 1)
      })
      
      await t.test('after the state changes', t => {
        t.assert.strictEqual(onUnlocked.mock.calls[0].result, 'unlocked')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onUnlocked.mock.calls[0].arguments.length, 2)
        t.assert.ok(onUnlocked.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onUnlocked.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        t.assert.strictEqual(
          onUnlocked.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
    
    await t.test('does not call other transition hooks', t => {  
      t.assert.strictEqual(onPush.mock.callCount(), 0)
      t.assert.strictEqual(onLocked.mock.callCount(), 0)
    })
  })
})
