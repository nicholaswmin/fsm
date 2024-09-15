import test from 'node:test'

import { Sync as FSM } from '../../../src/index.js'

test('deserializing - subclass', async t => {
  let turnstile, onPush = t.mock.fn()

  class Turnstile extends FSM {
    constructor() {
      super({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    }
    
    onPush(...args) {
      return onPush(...args)
    }
  }
  
  await t.beforeEach( t => {  
    onPush.mock.resetCalls()

    turnstile = new Turnstile()
  })
    
  await t.test('#ChildClass.parse(json)', async t => { 
    let revived

    t.beforeEach(async t => {  
      turnstile.coin()

      revived = Turnstile.parse(JSON.stringify(turnstile))
    })
    
    await t.test('preserves type', t => {
      t.assert.strictEqual(revived.constructor.name, 'Turnstile')
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
