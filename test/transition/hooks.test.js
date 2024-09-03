import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

const resetCalls = ({ mock }) => mock.resetCalls()

test('#transitionFn() calls hooks', async t => {
  let turnstile = null, hooks = {
    onCoin: t.mock.fn(), onPush: t.mock.fn(), 
    onClosed: t.mock.fn(), onOpened: t.mock.fn()
  }

  t.beforeEach(() => {
    Object.values(hooks).forEach(resetCalls)

    turnstile = new FSM({ 
      closed:   { coin: 'opened' },
      opened:   { push: 'closed' }
    }, hooks)
  })
  
  await t.test('calling transition method', async t => { 
    function captureState() { return this.state }

    t.beforeEach(() => turnstile.coin('foo', 'bar'))
    t.before(() => {
      hooks.onCoin.mock.mockImplementation(captureState)
      hooks.onOpened.mock.mockImplementation(captureState)
    })

    t.after(() => {
      hooks.onCoin.mock.restore()
      hooks.onOpened.mock.restore()
    })
    
    await t.test('calls transition hook', async t => {        
      await t.test('once', t => {
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 1)
      })
      
      
      await t.test('before the state changes', t => {
        t.assert.strictEqual(hooks.onCoin.mock.calls[0].result, 'closed')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(hooks.onCoin.mock.calls[0].arguments.length, 2)
        t.assert.ok(hooks.onCoin.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(hooks.onCoin.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        t.assert.strictEqual(
          hooks.onCoin.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
    
    await t.test('transitions to defined state', t => {  
      t.assert.strictEqual(turnstile.state, 'opened')
    })
    
    await t.test('calls state change hook', async t => {  
      await t.test('once', t => {
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 1)
      })
      
      await t.test('after the state changes', t => {
        t.assert.strictEqual(hooks.onOpened.mock.calls[0].result, 'opened')
      })
      
      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(hooks.onOpened.mock.calls[0].arguments.length, 2)
        t.assert.ok(hooks.onOpened.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(hooks.onOpened.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('with access to instance "this"', t => {
        t.assert.strictEqual(
          hooks.onOpened.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
    
    await t.test('does not call other transition hooks', t => {  
      t.assert.strictEqual(hooks.onPush.mock.callCount(), 0)
      t.assert.strictEqual(hooks.onClosed.mock.callCount(), 0)
    })
  })
})
