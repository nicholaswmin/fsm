import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#constructor prevents overwriting internals', async t => {
  let turnstile,  args = null
  
  t.beforeEach(() => {
    args = {
      locked:   { coin: 'unlocked', push: 'locked' },
      unlocked: { coin: 'unlocked', push: 'locked' }
    }
    
    turnstile = new FSM(args)
  })


  await t.test('instantiates OK', t => {  
    t.assert.ok(turnstile)
    t.assert.strictEqual(turnstile.state, 'locked')
  })


  await t.test('setting property externally', async t => {  
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        turnstile.state = 'foo'
      }, {
        name: 'TypeError',
        message: /has only a getter/ 
      })
    })
    
    await t.test('state does not change', t => {  
      t.assert.strictEqual(turnstile.state, 'locked')
    })
  })
  

  await t.test('overwriting passed argument deep-property', async t => {  
    args.locked.coin = 'foo'

    await t.test('state-changing methods work', async t => {  
      t.beforeEach(() => turnstile.coin())

      await t.test('state changes', t => {  
        t.assert.strictEqual(turnstile.state, 'unlocked')
      })
    })
  })
})
