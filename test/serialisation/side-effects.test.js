import test from 'node:test'

import FSM from '../../src/fsm.js'

test('#fromJSON() is side-effects free', async t => {
  let gate, revived = null, open = t.mock.fn()

  class Gate extends FSM {
    constructor() {
      super({
        locked: { unlock: { to: 'unlocked', runs: ['open'] }},
        unlocked: { lock: { to: 'locked' } }
      })
    }

    open() { open() }
  }

  t.beforeEach(() => {
    gate = (new Gate()).transition('unlock')
    open.mock.resetCalls()
  })
  
  await t.test('with argument: JSON.stringify(fsm)', async t => {
    revived = Gate.fromJSON(JSON.stringify(gate))
  })

  await t.test('returns a revived instance, which:', async t => {
    t.assert.strictEqual(revived.constructor.name, 'Gate')

    await t.test('strictly equals serialised instance', t => {
      t.assert.deepStrictEqual(revived, gate)
    })
    
    await t.test('is set at last state of serialised', t => {
      t.assert.strictEqual(revived.state, gate.state)
    })
    
    await t.test('is distinct from serialised instance', t => {
      gate.transition('lock')
      t.assert.notStrictEqual(revived.state, gate.state)
    })
    
    await t.test('continuing revived transitions', async t => {
      await t.test('transitions to new state', t => {
        revived.transition('lock')

        t.assert.strictEqual(revived.state, 'locked')
      })
      
      await t.test('invokes actions', t => {
        revived.transition('unlock')
        t.assert.strictEqual(open.mock.callCount(), 1)
      })
    })
  })
})
