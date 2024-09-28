import test from 'node:test'
import { fsm } from '../../../../src/index.js'


test('#argument: "states"', async t => {
  await t.test('missing', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        fsm()
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        fsm(3)
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  await t.test('without states', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => {
        fsm({})
      }, {
        name: 'RangeError',
        message: /empty/ 
      })
    })
  })
})
