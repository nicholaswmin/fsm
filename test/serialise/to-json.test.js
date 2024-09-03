import test from 'node:test'

import { Sync as FSM } from '../../src/index.js'

test('serialising', async t => {
  const turnstile = new FSM({ 
    closed:   { coin: 'opened' },
    opened:   { push: 'closed' }
  })
  
  await t.test('calling JSON.stringify(fsm)', async t => {  
    const json = JSON.stringify(turnstile)
  
    await t.test('returns JSON', t => {  
      t.assert.ok(json.length > 0, 'json string is empty')
    })
  
    await t.test('with length', t => {  
      t.assert.ok(json.length > 0, 'json string is empty')
    })
    
    await t.test('is valid & parseable', t => {  
      t.assert.doesNotThrow(() => JSON.parse(json))
    })
  })
  
  await t.test('2 instances produce equal json', t => {  
    const turnstile1 = new FSM({ 
      closed:   { coin: 'opened' },
      opened:   { push: 'closed' }
    })
    
    const turnstile2 = new FSM({ 
      closed:   { coin: 'opened' },
      opened:   { push: 'closed' }
    })
    
    turnstile1.coin()
    turnstile2.coin()
    
    t.assert.deepStrictEqual(turnstile1.toJSON(), turnstile2.toJSON())
  })
})
