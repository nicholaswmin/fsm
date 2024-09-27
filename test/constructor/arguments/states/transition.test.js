import test from 'node:test'
import { fsm } from '../../../../src/index.js'

test('#argument: "states.<state>.<transition>"', async t => {

  await t.test('not a string', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        fsm({
          closed: { coin: 'opened' },
          opened: { push: {}       }
        })
      }, {
        name: 'TypeError',
        message: /str/ 
      })
    })
  })

  await t.test('empty string', async t => {
    await t.test('throws descriptive RangeError', t => {
      t.assert.throws(() => {
        fsm({
          closed: { coin: 'opened' },
          opened: { push: ''       }
        })
      }, {
        name: 'RangeError',
        message: /empty/ 
      })
    })
  })
  
  await t.test('has whitespace', async t => {
    await t.test('between characters', async t => {
      await t.test('throws descriptive RangeError', t => {
        t.assert.throws(() => {
          fsm({
            closed: { coin: 'ope ned' },
            opened: { push: 'closed'  }
          })
        }, {
          name: 'RangeError',
          message: /has spaces/ 
        })
      })
    })
    
    
    await t.test('at beginning & end', async t => {
      await t.test('throws descriptive RangeError', t => {
        t.assert.throws(() => {
          fsm({
            closed: { coin: 'opened ' },
            opened: { push: 'closed'  }
          })
        }, {
          name: 'RangeError',
          message: /has spaces/ 
        })
      })
    })
    
    await t.test('not defined as state', async t => {
      await t.test('throws descriptive TypeError', t => {
        t.assert.throws(() => {
          fsm({ 
            closed: { coin: 'opened' },
            opened: { push: 'foobar'  }
          })
        }, {
          name: 'RangeError',
          message: /foobar missing/ 
        })
      })
    })
  })
})
