import test from 'node:test'

import FSM from '../../src/fsm.js'

test('Serialisation', async t => {
  class Gate extends FSM {
    constructor() {
      super({
        locked: { unlock: { to: 'unlocked', runs: ['open'] }},
        unlocked: { lock: { to: 'locked' } }
      })
    }

    open() {}
  }

  let json = null, gate = new Gate()

  await t.test('has initial state', t => {
    t.assert.strictEqual(gate.state, 'locked')
  })

  await t.test('transitions to new state', t => {
    gate.transition('unlock')
    t.assert.strictEqual(gate.state, 'unlocked')
  })

  await t.test('calling JSON.stringify(fsm)', async t => {
    await t.test('outputs valid JSON', t => {
      json = JSON.stringify(gate)
      t.assert.doesNotThrow(() => JSON.parse(json), 'Unparseable JSON')
    })
  })
})
