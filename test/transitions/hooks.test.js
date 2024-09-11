import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() calls hooks: onTransition, onStateChanged', async t => {
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

    t.beforeEach(() => turnstile.coin())
    t.before(() => {
      onCoin.mock.mockImplementation(captureState)
      onUnlocked.mock.mockImplementation(captureState)
    })

    t.after(() => {
      onCoin.mock.restore()
      onUnlocked.mock.restore()
    })
    
    await t.test('calls onTransition()', async t => {        
      await t.test('calls once', t => {
        t.assert.strictEqual(onCoin.mock.callCount(), 1)
      })
      
      await t.test('called before the state changes', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].result, 'locked')
      })
      
      await t.test('function "this" set as instance "this"', t => {
        t.assert.strictEqual(onCoin.mock.calls[0].this.constructor.name, 'Sync')
      })
    })
    
    await t.test('transitions to defined state', t => {  
      t.assert.strictEqual(turnstile.state, 'unlocked')
    })
    
    await t.test('calls onStateChanged()', async t => {  
      await t.test('calls once', t => {
        t.assert.strictEqual(onUnlocked.mock.callCount(), 1)
      })
      
      await t.test('called before the state changes', t => {
        t.assert.strictEqual(onUnlocked.mock.calls[0].result, 'unlocked')
      })
      
      await t.test('function "this" set as instance "this"', t => {
        const { mock } = onUnlocked

        t.assert.strictEqual(mock.calls[0].this.constructor.name, 'Sync')
      })
    })
    
    await t.test('does not call other transition hooks', t => {  
      t.assert.strictEqual(onPush.mock.callCount(), 0)
      t.assert.strictEqual(onLocked.mock.callCount(), 0)
    })
  })
})
