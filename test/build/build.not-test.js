// this test runs at the end of `node --run build`, only.   
// not meant to be run with unit-tests, hence the `.not-test.js` extension.

import test from 'node:test'

import packageJSON from '../../package.json' with { 'type': 'json' }
const { Sync, Async } = await import(`../../${packageJSON.main}`)

test('build: importing from dist/ runs OK', async t => {
  let turnstile = null, onCoin = t.mock.fn()

  await t.test('sync FSM', async t => {
    t.before(() => {
      turnstile = new Sync({ 
        locked:     { coin: 'unlocked', push: 'locked' },
        unlocked:   { coin: 'unlocked', push: 'locked' }
      }, { onCoin })
    })

    t.assert.strictEqual(turnstile.state, 'locked')
    turnstile.coin()
    t.assert.strictEqual(turnstile.state, 'unlocked')
  })
  
  await t.test('async FSM', async t => {
    t.before(() => {
      turnstile = new Async({ 
        locked:     { coin: 'unlocked', push: 'locked' },
        unlocked:   { coin: 'unlocked', push: 'locked' }
      }, { onCoin })
    })

    onCoin.mock.mockImplementationOnce(() => {
      return new Promise(resolve => 
        setTimeout(resolve.bind(null, false), 50))
    })

    t.assert.strictEqual(turnstile.state, 'locked')
    turnstile.coin()
    t.assert.strictEqual(turnstile.state, 'locked')
  })
})
