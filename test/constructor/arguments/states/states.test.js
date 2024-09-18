import test from 'node:test'
import { Sync as FSM } from '../../../../src/index.js'


test('#argument: "states"', async t => {
  await t.test('missing', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        new (class Turnstile extends FSM {
          constructor() {
            super()
          }
        })()
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        new FSM(3)
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  await t.test('without states', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => {
        new FSM({})
      }, {
        name: 'RangeError',
        message: /empty/ 
      })
    })
  })
})
