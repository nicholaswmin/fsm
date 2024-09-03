import test from 'node:test'

import { fsm } from '../../src/index.js'

test('from JSON', async t => {
  let turnstile
  
  t.beforeEach( t => {  
    turnstile = fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  })
    
  await t.test('#fsm(json)', async t => { 
    let revived, hooks, onPush

    t.beforeEach(async t => {  
      hooks = {
        onPush: t.mock.fn(),
        onOpened: t.mock.fn()
      }

      turnstile.coin()

      revived = fsm(JSON.stringify(turnstile), hooks)
      
      onPush = t.mock.method(hooks, 'onPush')
    })
    
    await t.test('preserves type', t => {
      t.assert.strictEqual(revived.constructor.name, 'Object')
    })
    
    await t.test('preserves state', t => {
      t.assert.strictEqual(revived.state, 'opened')
    })
    
    await t.test('transitioning to next state', async t => {
      t.beforeEach(() => revived.push())

      await t.test('transitions to next state', t => {
        t.assert.strictEqual(revived.state, 'closed')
      })
      
      await t.test('does not affect last instance', t => {
        t.assert.strictEqual(turnstile.state, 'opened')
        t.assert.strictEqual(revived.state, 'closed')
      })

      await t.test('transitions to next state', t => {
        t.assert.strictEqual(revived.state, 'closed')
      })
      
      await t.test('fires hooks', t => {
        t.assert.strictEqual(onPush.mock.callCount(), 1)
      })
    })
  })
})
