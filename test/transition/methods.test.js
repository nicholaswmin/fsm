import test from 'node:test'
import { fsm } from '../../src/index.js'

test('#constructor adds transition methods', async t => {
  let turnstile

  t.beforeEach(() => {
    turnstile = fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed'  }
    })
  })
 
  await t.test('instantiates', t => {
    t.assert.ok(turnstile)
  })

  await t.test('adds transition-methods', async t => {
    const { NODE_ENV } = process.env

    t.assert.strictEqual(typeof turnstile.coin, 'function')

    await t.test('for each transition', t => {
      t.assert.strictEqual(typeof turnstile.push, 'function')
    })
      
    await t.test('When NODE_ENV not equals "test"', async t => {  
      await t.test('transition-methods cannot be modified', async t => {  
        t.assert.throws(() => {
          delete turnstile.coin
        }, {
          name: 'TypeError',
          message: /Cannot delete/ 
        })
      })
    })
  })
  

  await t.test('transition-method defined in multiple states', async t => {
    t.beforeEach(() => {
      turnstile = fsm({ 
        closed: { coin: 'opened', break: 'broken' },
        opened: { push: 'closed'                  },
        broken: { fix : 'closed', push:  'opened' }
      })
    })

    await t.test('adds 1 method per transition, regardless of states', t => {
      t.assert.strictEqual(typeof turnstile.push, 'function')
      t.assert.strictEqual(typeof turnstile.coin, 'function')
    })
  })
  
  await t.test('overwriting deep property of passed argument', async t => {  
    let args = null

    t.before(() => {
      args = {
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      }

      turnstile = fsm(args)

      args.opened.coin = 'foo'
    })

    await t.test('state-changing methods work', async t => {  
      t.beforeEach(() => turnstile.coin())

      await t.test('state changes', t => {  
        t.assert.strictEqual(turnstile.state, 'opened')
      })
    })
  })
})
