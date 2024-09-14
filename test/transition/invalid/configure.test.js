import test from 'node:test'
import { Sync as FSM } from '../../../src/index.js'

test('#transitionFn() configuring invalid transition behavior', async t => {
  await t.test('attemping an invalid transition', async t => {
    await t.test('calls the invalid method', async t => {
      let turnstile = null, onInvalid = t.mock.fn()

      t.before(() => {
        FSM.onInvalid = onInvalid

        turnstile = new FSM({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        })

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
          onInvalid.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
    

    await t.test('overriding the method to throw', async t => {
      let NoisyFSM = null, turnstile = null

      t.before(() => {
        class NoisyFSM extends FSM {
          static onInvalid() {
            throw new Error('not allowed')
          }
        }
        
        turnstile = new NoisyFSM({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        })
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
      let NoisyFSM = null, turnstile = null, returned = null

      t.before(() => {
        class ShadyFSM extends FSM {
          static onInvalid() {
            return true
          }
        }
        
        turnstile = new ShadyFSM({
          closed: { coin: 'opened' },
          opened: { push: 'closed' }
        })
        
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
    let turnstile = null, returned = null

    t.before(() => {
      delete FSM.onInvalid

      turnstile = new FSM({
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })

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
