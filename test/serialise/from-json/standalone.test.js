import test from 'node:test'

import { Sync as FSM } from '../../../src/index.js'

test('deserializing - standalone', async t => {
  let turnstile, onPush = t.mock.fn()
  
  await t.beforeEach( t => {  
    onPush.mock.resetCalls()

    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, { onPush })
  })
    
  await t.test('w/o hooks argument', async t => { 
    let revived

    t.beforeEach(async t => {  
      turnstile.coin()

      revived = FSM.parse(JSON.stringify(turnstile))
    })
    
    await t.test('preserves type', t => {
      t.assert.strictEqual(revived.constructor.name, 'Sync')
    })
    
    await t.test('preserves state', t => {
      t.assert.strictEqual(revived.state, turnstile.state)
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
      
      await t.test('does not fire hooks', t => {
        t.assert.strictEqual(onPush.mock.callCount(), 0)
      })
    })
  })
  
  await t.test('with hooks argument', async t => { 
    let revived

    t.beforeEach(async t => {  
      turnstile.coin()

      revived = FSM.parse(JSON.stringify(turnstile), { onPush })
    })
    
    await t.test('transitioning to next state', async t => {
      t.beforeEach(() => revived.push())
      
      await t.test('fires hooks', t => {
        t.assert.strictEqual(onPush.mock.callCount(), 1)
      })
    })
  })
})
