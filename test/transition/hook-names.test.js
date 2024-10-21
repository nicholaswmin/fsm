import test from 'node:test'
import { fsm } from '../../src/index.js'

// Superlight, verify fix for:
// - https://github.com/nicholaswmin/fsm/issues/1 

test('#transitionFn(), polysyllable-named hooks', async t => {
  let turnstile, hooks

  t.beforeEach(() => {
    hooks = {
      onCoinDropped() {},
      onOpenedLock() {},
    }

    turnstile = fsm({
      closedLock: { coinDropped: 'openedLock' },
      openedLock: { pushThrough: 'closedLock' }
    }, hooks)
  })
  
  await t.test('calling polysyllabic transition method', async t => {     
    await t.test('calls polysyllabic transition hook', async t => {    
      const onCoinDropped = t.mock.method(hooks, 'onCoinDropped')

      turnstile.coinDropped('foo', 'bar')

      await t.test('once', t => {
        t.assert.strictEqual(onCoinDropped.mock.callCount(), 1)
      })
    })

    
    await t.test('calls polysyllabic state change hook', async t => {  
      const onOpenedLock = t.mock.method(turnstile, 'onOpenedLock')
      
      turnstile.coinDropped('foo', 'bar')

      await t.test('once', t => {
        t.assert.strictEqual(onOpenedLock.mock.callCount(), 1)
      })
    })
  })
})
