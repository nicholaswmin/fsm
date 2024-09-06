import test from 'node:test'
import FSM from '../../../src/fsm.js'

class Gate extends FSM {
  constructor() { super() }
}

test('#construction parameter: "ctx"', async t => {
  let gate = null, open = t.mock.fn()
  
  t.beforeEach(() => open.mock.resetCalls())
  
  await t.test('when subclassed', async t => {
    class Gate extends FSM {
      constructor() { 
        super({
          locked:   {  unlock: { to: 'unlocked', runs: ['open']  }},
          unlocked: { lock: { to: 'locked',  runs: ['open']  } }
        })
      }

      open() { open(this.state) }
    }

    t.beforeEach(() => gate = new Gate())
    

    await t.test('not set', async t => {

      await t.test('defaults to instance "this"', async t => {

        await t.test('looks up run methods on instance "this"', t => {    
          gate.transition('unlock')
    
          t.assert.strictEqual(open.mock.callCount(), 1)
        })
        
        await t.test('"this" context set as instance "this"', t => {      
          t.before(() => gate.transition('unlock'))
    
          t.assert.strictEqual(open.mock.calls.length, 1)
          t.assert.strictEqual(
            open.mock.calls.map(c => c.arguments).flat().at(0), 
            'locked', 
            'expected to capture "this.state" in method & pass as arg.'
          )
        })
      })
    })
  })
  
  await t.test('when standalone', async t => {    

    await t.test('lists 0 runs', async t => {

      await t.test('ctx not passed', async t => {  

        await t.test('does not throw', async t => {
          t.assert.doesNotThrow(() => new FSM({
            locked: { unlock: { to: 'unlocked' } },
            unlocked: { lock: { to: 'locked' } }
          }))
        })
      })
    })
    
    await t.test('lists at least 1 run', async t => {
      
      await t.test('not set', async t => {
        
        await t.test('throws TypeError', async t => {
          t.assert.throws(() => new FSM({
            locked: { unlock: { to: 'unlocked', runs: ['open'] } },
            unlocked: { lock: { to: 'locked' } }
          }), {
            name: 'TypeError'
          })
        })
      })

      await t.test('not typeof object', async t => {

        await t.test('throws TypeError', async t => {
          t.assert.throws(() => new FSM({
            locked: { unlock: { to: 'unlocked' } },
            unlocked: { lock: { to: 'locked' } }
          }, 'foo'), {
            name: 'TypeError',
            message: /ctx exp. object/
          })
        })
      })
      
      await t.test('runs present but not typeof functions', async t => {

        await t.test('throws TypeError', async t => {
          t.assert.throws(() => new FSM({
            locked: { unlock: { to: 'unlocked', runs: ['open'] } },
            unlocked: { lock: { to: 'locked' } }
          }, {
            open: 'foo'
          }), {
            name: 'TypeError',
            message: /not found/
          })
        })
      })
      
      await t.test('runs present & typeof function', async t => {

        t.beforeEach(() => {
          gate = new FSM({
            locked: { unlock: { to: 'unlocked', runs: ['open'] } },
            unlocked: { lock: { to: 'locked' } }
          }, {
            state: 'foo',
            open: function() { open(this.state) }
          })
        })
  
        await t.test('sets context to provided "ctx"', async t => {
          t.before(() => gate.transition('unlock'))
  
          await t.test('looks up run methods on provided "ctx"', t => {        
            gate.transition('unlock')
      
            t.assert.strictEqual(open.mock.callCount(), 1)
          })
        })
        
        await t.test('"this" context set as provided ctx "this"', t => {      
          t.before(() => gate.transition('unlock'))
  
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
