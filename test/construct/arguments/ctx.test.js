import test from 'node:test'
import FSM from '../../../index.js'

class Gate extends FSM {
  constructor() { super() }
}

test('#construction parameter: "ctx"', async t => {
  const open = t.mock.fn()

  await t.test('not set', async t => {
    class Gate extends FSM {
      constructor() { 
        super({
          locked:   {  unlock: { to: 'unlocked', actions: ['open']  }},
          unlocked: { lock: { to: 'locked',  actions: ['open']  } }
        })
      }

      open() { open(this.state) }
    }

    t.beforeEach(() => {
      open.mock.resetCalls()
    })
    
    await t.test('defaults to instance "this"', async t => {
      await t.test('looks up action methods on instance "this"', t => {    
        const gate = new Gate()
  
        gate.transition('unlock')
  
        t.assert.strictEqual(open.mock.callCount(), 1)
      })
      
      await t.test('"this" context set as instance "this"', t => {      
        let gate 
  
        t.before(() => {
          gate = new Gate()
          gate.transition('unlock')
        })
  
        t.assert.strictEqual(open.mock.calls.length, 1)
        t.assert.strictEqual(
          open.mock.calls.map(c => c.arguments).flat().at(0), 
          'locked', 
          'expected to capture "this.state" in method & pass as arg.'
        )
      })
    })
  })
  
  await t.test('set as external object', async t => {
    let Gate, ctx = null

    t.beforeEach(() => {
      open.mock.resetCalls()
      
      Gate = class Gate extends FSM {
        constructor() { 
          super({
            locked:   {  unlock: { to: 'unlocked', actions: ['open']  }},
            unlocked: { lock: { to: 'locked',  actions: ['open']  } }
          }, ctx)
        }
  
        open() { open(this.state) }
      }
    })
    
    await t.test('set as non-object', async t => {
      t.before(() => {
        ctx = 'foo'
      })

      await t.test('throws TypeError', async t => {
        t.assert.throws(() => new Gate(), {
          name: 'TypeError',
          message: /ctx exp. object/
        })
      })
    })
    
    await t.test('actions as properties instead of methods', async t => {
      t.before(() => {
        ctx = {
          open: 'foo'
        }
      })

      await t.test('throws TypeError', async t => {
        t.assert.throws(() => new Gate(), {
          name: 'TypeError',
          message: /state.0.transitions.0.actions.0: exp. function/
        })
      })
    })
    
    
    await t.test('set as object', async t => {
      t.before(() => {
        ctx = {
          state: 'foo',
          open: function() { open(this.state) }
        }
      })

      await t.test('sets context to provided "ctx"', async t => {
        await t.test('looks up action methods on provided "ctx"', t => {    
          const gate = new Gate()
    
          gate.transition('unlock')
    
          t.assert.strictEqual(open.mock.callCount(), 1)
        })
        
        await t.test('"this" context set as provided ctx "this"', t => {      
          let gate 
    
          t.before(() => {
            gate = new Gate()
            gate.transition('unlock')
          })
          
  
          t.assert.strictEqual(open.mock.calls.length, 1)
          t.assert.strictEqual(
            open.mock.calls.map(c => c.arguments).flat().at(0), 
            'foo', 
            'expected to capture "external.state" in method & pass as arg.'
          )
        })
      })
    })
  })
})
