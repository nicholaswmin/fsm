import test from 'node:test'

import { fsm } from '../../src/index.js'

test('serialising', async t => {
  let turnstile, hooks

  t.beforeEach(() => {
    hooks = {
      onCoin() {},
      onPush() {},
  
      onOpened() {},
      onClosed() {}
    }

    turnstile = fsm({
      closed: { coin: 'opened', break: 'broken' },
      opened: { push: 'closed'                  },
      broken: { fix : 'closed', push:  'opened' }
    }, hooks)
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
    const turnstile1 = fsm({
      closed: { coin: 'opened', break: 'broken' },
      opened: { push: 'closed'                  },
      broken: { fix : 'closed', push:  'opened' }
    })

    const turnstile2 = fsm({
      closed: { coin: 'opened', break: 'broken' },
      opened: { push: 'closed'                  },
      broken: { fix : 'closed', push:  'opened' }
    })

    turnstile1.coin()
    turnstile2.coin()
    
    t.assert.deepStrictEqual(turnstile1.toJSON(), turnstile2.toJSON())
  })
})
