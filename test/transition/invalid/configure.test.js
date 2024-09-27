import test from 'node:test'
import { fsm } from '../../../src/index.js'

test('#transitionFn() configuring invalid transition behavior', async t => {
  t.before(() => process.env.ALLOW_METHOD_MOCKS = '1')
  t.after(() => delete process.env.ALLOW_METHOD_MOCKS)   

  await t.test('attemping an invalid transition', async t => {
    await t.test('calls the invalid method', async t => {
      let turnstile, hooks, onInvalid = t.mock.fn()

      t.before(() => {
        hooks = {
          onCoin() {},
          onPush() {},
      
          onOpened() {},
          onClosed() {},
          onInvalid
        }
    
        turnstile = fsm({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        }, hooks)

        turnstile.push('foo', 'bar')
      })

      await t.test('is called once', t => {
        t.assert.strictEqual(onInvalid.mock.callCount(), 1)
      })

      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onInvalid.mock.calls[0].arguments.length, 3)
      })

      await t.test('1st argument is the transition name', t => {
        t.assert.strictEqual(onInvalid.mock.calls[0].arguments[0], 'push')
      })

      await t.test('the rest come from the transition method', t => {
        t.assert.ok(onInvalid.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onInvalid.mock.calls[0].arguments.includes('bar'))
      })

      await t.test('has access to instance "this"', t => {
        t.assert.strictEqual(
          onInvalid.mock.calls[0].this.constructor.name, 'Object'
        )
      })
    })
    

    await t.test('overriding the method to throw', async t => {
      let turnstile, hooks

      t.before(() => {
        hooks = {
          onCoin() {},
          onOpened() {},
          onInvalid() {
            throw Error('not allowed')
          }
        }
    
        turnstile = fsm({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        }, hooks)
      })
      
      await t.test('throws the error', async t => {
        t.assert.throws(() => {
          turnstile.push()
        }, {
          message: /not allowed/
        })
      })
      
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
    })
    

    await t.test('overriding the method to return true', async t => {
      let turnstile, hooks, returned

      t.before(() => {
        hooks = {
          onCoin() {},
          onOpened() {},
          onInvalid() { return true }
        }
    
        turnstile = fsm({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        }, hooks)
        
        returned = turnstile.push()
      })
      
      await t.test('returns true', async t => {
        t.assert.strictEqual(returned, true)
      })
      
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
    })
  })
  
  
  await t.test('deleting the method on the original class', async t => {
    let turnstile, hooks, returned

    t.before(() => {
      hooks = {
        onCoin() {},
        onOpened() {},
        onInvalid() { return true }
      }
      
      delete hooks.onInvalid

      turnstile = fsm({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      }, hooks)

      returned = turnstile.push()
    })
    
    await t.test('returns false', async t => {
      t.assert.strictEqual(returned, false)
    })

    await t.test('does not transition', t => { 
      t.assert.strictEqual(turnstile.state, 'closed')
    })
  })
})
