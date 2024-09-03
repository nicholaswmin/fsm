import test from 'node:test'
import { Sync as FSM } from '../../src/index.js'

test('#constructor extending to subclass', async t => {
  class Turnstile extends FSM {
    constructor() {
      super({
        locked: { coin: 'unlocked', push: 'locked' },
        unlocked: { coin: 'unlocked', push: 'locked' }
      })
    }
  }
  
  let turnstile = new Turnstile()

  await t.test('instantiates', t => {
    t.assert.ok(turnstile, 'turnstile is falsy')
  })
  
  await t.test('has .state property', t => {
    t.assert.ok(!!turnstile.state, 'Cannot find prop: "state"')
  })

  await t.test('initial state set as 1st in "states"', t => {
    t.assert.strictEqual(turnstile.state, 'locked')
  })

  await t.test('adds transition-methods', async t => {
    t.assert.strictEqual(typeof turnstile.coin, 'function')
    t.assert.strictEqual(typeof turnstile.push, 'function')
  })
  
  await t.test('preexisting method matches transition-method name', async t => {
    class Turnstile extends FSM {
      constructor() {
        super({
          locked: { coin: 'unlocked', push: 'locked' },
          unlocked: { coin: 'unlocked', push: 'locked' }
        })
      }
      
      coin() { return 'not-overwritten' }
    }

    await t.test('overwrites preexisting', async t => {
      turnstile = new Turnstile()

      t.assert.notStrictEqual(turnstile.coin(), 'not-overwritten')
    })
  })
})
