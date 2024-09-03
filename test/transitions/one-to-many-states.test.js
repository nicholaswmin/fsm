import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() 1 to many states', async t => {
  let turnstile

  t.beforeEach(() => {
    turnstile = new FSM({ 
      locked  : { coin: 'unlocked', break: 'broken' },
      unlocked: { coin: 'unlocked', push : 'locked' },
      broken  : { push: 'unlocked', coin : 'locked' }
    })
  })

  await t.test('inits in correct state', t => {  
    t.assert.ok(turnstile)
    t.assert.strictEqual(turnstile.state, 'locked')
  })
  
  await t.test('calling unique methods foo(), bar()', async t => {      
    t.beforeEach(() => {
      turnstile.coin()
      turnstile.push()
    })
    
    await t.test('transitions to defined state', async t => {  
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'locked')
      })        
      
      await t.test('calling non-unique baz()', async t => {      
        t.beforeEach(() => {
          turnstile.break()
        })

        await t.test('transitions to defined state', t => {  
          t.assert.strictEqual(turnstile.state, 'broken')
        })      
        
        await t.test('calling non-unique quux()', async t => {      
          t.beforeEach(() => {
            turnstile.coin()
          })

          await t.test('transitions to defined state', t => {  
            t.assert.strictEqual(turnstile.state, 'locked')
          })      
        })
      })
    })
  })
})
