import test from 'node:test'
import { Sync as FSM } from '../../../src/index.js'

const resetCalls = ({ mock }) => mock.resetCalls(),
  restoreOnInvalid = () => {  FSM.onInvalid = () => false }

test('#transitionFn() customising invalid transition behavior', async t => {
  let turnstile = null, 
      onInvalid = t.mock.fn(),
      hooks = { onCoin: t.mock.fn(), onOpened: t.mock.fn() }
  
  t.beforeEach(() => {
    Object.values({ ...hooks, onInvalid })
      .forEach(resetCalls)

    turnstile = new FSM({ 
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, hooks)
  })
  
  t.beforeEach(() => resetCalls(onInvalid))

  await t.test('instantiates', t => {  
    t.assert.strictEqual(turnstile.state, 'closed')
  })
  
  await t.test('attemping an invalid transition', async t => {     
    await t.test('method call signature', async t => {
      const onInvalid = t.mock.fn()

      t.before(() => { 
        FSM.onInvalid = onInvalid
        turnstile.push('foo', 'bar')
      })

      t.after(restoreOnInvalid)

      await t.test('is called once', t => {  
        t.assert.strictEqual(onInvalid.mock.callCount(), 1)
      })

      await t.test('with variadic arguments', t => {
        t.assert.strictEqual(onInvalid.mock.calls[0].arguments.length, 2)
      })
      
      await t.test('passed from the transition method', t => {
        t.assert.ok(onInvalid.mock.calls[0].arguments.includes('foo'))
        t.assert.ok(onInvalid.mock.calls[0].arguments.includes('bar'))
      })
      
      await t.test('with access to instance "this"', t => {
        t.assert.strictEqual(
          onInvalid.mock.calls[0].this.constructor.name, 'Sync'
        )
      })
    })
 
    await t.test('behavior set to throw Error', async t => {
      let returnedValue = null

      t.before(() => {
        FSM.onInvalid = () => { throw new Error('Transition not allowed') }
      })

      t.after(restoreOnInvalid)

      await t.test('throws error', t => {  
        t.assert.throws(() => {
          returnedValue = turnstile.push()
        }, {
          message: /not allowed/
        })
      })
      
      await t.test('does not return false', t => {  
        t.assert.notStrictEqual(returnedValue, false)
      })
  
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
      
      await t.test('does not call hooks', t => {
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 0)
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
      })
    })
    
    await t.test('behavior set to return true', async t => {
      let returnedValue = null

      t.before(() => { 
        FSM.onInvalid = () => true 
        returnedValue = turnstile.push()
      })

      t.after(restoreOnInvalid)

      await t.test('returns true', t => {  
        t.assert.strictEqual(returnedValue, true)
      })
  
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
      
      await t.test('does not call hooks', t => {
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 0)
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
      })
    })
    
    await t.test('behavior method is deleted', async t => {
      t.before(() => {  delete FSM.onInvalid })
      t.after(restoreOnInvalid)

      await t.test('transition method does not throw', t => {  
        t.assert.doesNotThrow(() => turnstile.push())
      })
      
      await t.test('returns false', t => {  
        t.assert.strictEqual(turnstile.push(), false)
      })
      
      await t.test('does not transition', t => { 
        t.assert.strictEqual(turnstile.state, 'closed')
      })
      
      await t.test('does not call hooks', t => {
        t.assert.strictEqual(hooks.onCoin.mock.callCount(), 0)
        t.assert.strictEqual(hooks.onOpened.mock.callCount(), 0)
      })
    })
  })
})
