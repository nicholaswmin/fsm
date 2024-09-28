import test from 'node:test'
import { fsm } from '../../src/index.js'

// This is a non-standard, a bit awkward test, meant to test cases
// where there could be multiple, identically-named transitions, 
// defined under different states, each laeding to a different state
// every time its defined.
// 
// In the example below, transition `push` is defined twice, 
// `opened` & `broken` states. 
// 
// - In the `opened` state it leads to state `closed` 
// - In the `broken` state it leads to state `opened`
// 
// This is a valid use-case.

test('#transitionFn(), 1:* transition:states', async t => {
  const turnstile = fsm({
    closed: { coin: 'opened', break: 'broken' },
    opened: { push: 'closed'                  },
    broken: { fix : 'closed', push:  'opened' }
  })

  await t.test('instantiates', t => {  
    t.assert.ok(turnstile)
    t.assert.strictEqual(turnstile.state, 'closed')
  })

  await t.test('calling 1:1 transition', async t => {      
    t.before(() => turnstile.break())
    
    await t.test('transitions to next state', t => {  
      t.assert.strictEqual(turnstile.state, 'broken')
    })
  })

  await t.test('calling 1:* transition, leading to state A', async t => {      
    t.before(() => turnstile.push())
    
    await t.test('transitions to state A', t => {  
      t.assert.strictEqual(turnstile.state, 'opened')
    })
  })
  
  await t.test('calling same 1:* transition, leading to state B', async t => {      
    t.before(() => turnstile.push())
    
    await t.test('transitions to state B', t => {  
      t.assert.strictEqual(turnstile.state, 'closed')
    })
  })
})
