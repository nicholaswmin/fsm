import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#transitionFn() attemping unlisted transition', async t => {
  let turnstile
  

  t.before(() => {
    turnstile = new FSM({ 
      unlocked: { push:   'broken'   },
      broken  : { repair: 'unlocked' }
    })
  })
  
  await t.test('inits in correct state', t => {  
    t.assert.strictEqual(turnstile.state, 'unlocked')
  })

  await t.test('calling transition foo()', async t => {  
    await t.test('transitions to "bar" which only lists: bar()', async t => {  
      t.assert.strictEqual(turnstile.push().state, 'broken')
    })

    await t.test('calling transition foo() again', async t => {  
      await t.test('throws descriptive Error', async t => {
        t.assert.throws(() => {
          turnstile.push()
        }, {
          name: 'Error',
          message: /push from: broken/ 
        })
        
        t.assert.strictEqual(turnstile.state, 'broken')
      })

      await t.test('state does not change', t => {  
        t.assert.strictEqual(turnstile.state, 'broken')
      })
    })
    
    await t.test('correctly calling "bar"', async t => {  
      t.before(() => turnstile.repair())
      
      await t.test('transitions to defined state', t => {  
        t.assert.strictEqual(turnstile.state, 'unlocked')
      })
    })
  })
})
