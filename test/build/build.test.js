import test from 'node:test'

import packageJSON from '../../package.json' with { 'type': 'json' }
const { Sync, Async } = await import(`../../${packageJSON.main}`)

test('package.json "main" entry, works OK', async t => {
  let turnstile = null, onCoin = t.mock.fn()

  await t.test('sync FSM', async t => {
    t.before(() => {
      turnstile = new Sync({ 
        locked:     { coin: 'unlocked', push: 'locked' },
        unlocked:   { coin: 'unlocked', push: 'locked' }
      }, { onCoin })
    })

    await t.test('inits in correct state', t => {  
      t.assert.strictEqual(turnstile.state, 'locked')
    })
    
    await t.test('calling transition-method await foo()', async t => {     
      t.before(() => turnstile.coin())
   
      await t.test('transitions to defined state', async t => {  
        t.assert.strictEqual(turnstile.state, 'unlocked')
      })
    })
  })
  
  await t.test('async FSM', async t => {
    t.before(() => {
      turnstile = new Async({ 
        locked:     { coin: 'unlocked', push: 'locked' },
        unlocked:   { coin: 'unlocked', push: 'locked' }
      }, { onCoin })
    })

    await t.test('inits in correct state', t => {  
      t.assert.strictEqual(turnstile.state, 'locked')
    })
    
    await t.test('onTransitionChange returns false', async t => {  
      await t.test('calling transition-method await foo()', async t => {      
        onCoin.mock.mockImplementationOnce(() => {
          return new Promise(resolve => 
            setTimeout(resolve.bind(null, false), 50))
        })
        
        t.before(() => turnstile.coin())
    
        await t.test('state does not change', async t => {  
          t.assert.strictEqual(turnstile.state, 'locked')
        })
      })    
    })
  })
})
