import test from 'node:test'
import { Sync as FSM } from '../../../../src/index.js'

test('#argument: "states.<state>"', async t => {
  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        new FSM({ locked: [] })
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  await t.test('without keys', async t => {
    await t.test('does not throw', t => {
      t.assert.doesNotThrow(() => {
        new FSM({  locked: {} })
      })
    })
  })
})
