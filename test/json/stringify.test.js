import test from 'node:test'

import { Sync as FSM } from '../../src/index.js'

test('serialising', async t => {
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '0')
  t.after(() => delete process.env.ALLOW_METHOD_MOCKS)   

  let turnstile 

  class Turnstile extends FSM {
    constructor() {
      super({
        closed: { coin: 'opened', break: 'broken' },
        opened: { push: 'closed'                  },
        broken: { fix : 'closed', push:  'opened' }
      })
    }
  }
  
  t.beforeEach(() => {
    turnstile = new Turnstile()
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
    const turnstile1 = new Turnstile(), 
          turnstile2 = new Turnstile()

    turnstile1.coin()
    turnstile2.coin()
    
    t.assert.deepStrictEqual(turnstile1.toJSON(), turnstile2.toJSON())
  })
})
