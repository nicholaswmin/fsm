import test from 'node:test'
import { Sync as FSM } from '../../../../src/index.js'

test('#argument: "states.<state>.<transition>"', async t => {

  await t.test('not a string', async t => {
    await t.test('throws descriptive TypeError', t => {
      t.assert.throws(() => {
        new FSM({ 
          locked:   { coin: 'unlocked', push: 'locked' },
          unlocked: { coin: {},         push: 'locked' }
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
        new FSM({ 
          locked:   { coin: 'unlocked', push: 'locked' },
          unlocked: { coin: '',         push: 'locked' }
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
          new FSM({ 
            locked:   { coin: 'unlocked', push: 'locked' },
            unlocked: { coin: 'lock ed', push: 'locked' }
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
          new FSM({ 
            locked:   { coin: '  unlocked ', push: 'locked' },
            unlocked: { coin: 'locked',      push: 'locked' }
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
          new FSM({ 
            locked:   { coin: 'unlocked', push: 'locked' },
            unlocked: { coin: 'foobared', push: 'locked' }
          })
        }, {
          name: 'RangeError',
          message: /foobared missing/ 
        })
      })
    })
  })
})
