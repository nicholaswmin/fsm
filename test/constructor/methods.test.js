import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#constructor adds transition-methods', async t => {
  let turnstile


  t.beforeEach(() => {
    turnstile = new FSM({ 
      locked:   { coin: 'unlocked', push: 'locked' },
      unlocked: { coin: 'unlocked', push: 'locked' }
    })
  })
 

  await t.test('instantiates', t => {
    t.assert.ok(turnstile)
  })
  

  await t.test('adds transition-methods', async t => {
    t.assert.strictEqual(typeof turnstile.coin, 'function')
    
    await t.test('for each transition', t => {
      t.assert.strictEqual(typeof turnstile.push, 'function')
    })

    await t.test('transition-methods cannot be modified', async t => {  
      t.assert.throws(() => {
        delete turnstile.coin
      }, {
        name: 'TypeError',
        message: /Cannot delete/ 
      })
    })
  })
  

  await t.test('transition-method defined in multiple states', async t => {
    t.beforeEach(() => {
      turnstile = new FSM({ 
        locked:   { coin: 'unlocked', push: 'locked' },
        unlocked: { coin: 'unlocked', push: 'locked', coin: 'unlocked' }
      })
    })
    

    await t.test('adds only 1 method for all occurences', t => {
      t.assert.strictEqual(typeof turnstile.push, 'function')
      t.assert.strictEqual(typeof turnstile.coin, 'function')
    })
  })
})
