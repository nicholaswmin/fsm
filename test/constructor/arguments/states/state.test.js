import test from 'node:test'
import { Sync as FSM } from '../../../../src/index.js'

test('#argument: "states.<state>"', async t => {
  await t.test('not an object', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        new FSM({ closed: [] })
      }, {
        name: 'TypeError',
        message: /exp. object/ 
      })
    })
  })

  
  await t.test('without transitions', async t => {
    await t.test('does not throw', t => {
      t.assert.doesNotThrow(() => {
        new FSM({ closed: {} })
      })
    })
  })
  
  
  await t.test('1 transition', async t => {
    await t.test('does not throw', t => {
      new FSM({ 
        closed: { coin: 'opened' },
        opened: { push: 'closed' }
      })
    })
  })
  

  await t.test('multiple transitions', async t => {
    await t.test('does not throw', t => {
      t.assert.doesNotThrow(() => {
        new FSM({ 
          closed: { coin: 'opened',  break: 'broken' },
          opened: { push: 'closed'                   },
          broken: {}
        })
      })
    })
  })
})
