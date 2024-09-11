import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() calls hooks', async t => {
  let turnstile = null, onCoin = t.mock.fn(), onPush = t.mock.fn(), 
      onClosed = t.mock.fn(), onOpened = t.mock.fn()

  t.beforeEach(() => {
    ;[onCoin, onPush, onClosed, onOpened].forEach(fn => fn.mock.resetCalls())

    turnstile = new FSM({ 
      closed:   { coin: 'opened' },
      opened:   { push: 'closed' }
    }, {
      onCoin, onPush, onClosed, onOpened
    })
  })

  
  await t.test('calling transition method', async t => { 
    function captureState() { return this.state }

    t.beforeEach(() => turnstile.coin('foo', 'bar'))
    t.before(() => {
      onCoin.mock.mockImplementation(captureState)
      onOpened.mock.mockImplementation(captureState)
    })

    t.after(() => {
      onCoin.mock.restore()
      onOpened.mock.restore()
    })
    
    
    await t.test('calls transition hook', async t => {        
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
        t.assert.strictEqual(onCoin.mock.calls[0].this.constructor.name, 'Sync')
      })
    })
    
    
    await t.test('transitions to defined state', t => {  
      t.assert.strictEqual(turnstile.state, 'opened')
    })
    
    
    await t.test('calls state change hook', async t => {  
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
        t.assert.strictEqual(
          onOpened.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
    
    
    await t.test('does not call other transition hooks', t => {  
      t.assert.strictEqual(onPush.mock.callCount(), 0)
      t.assert.strictEqual(onClosed.mock.callCount(), 0)
    })
  })
})
