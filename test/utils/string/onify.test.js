import test from 'node:test'
import utils from '../../../src/utils.js'

// - Polysyllabic test case fixes: https://github.com/nicholaswmin/fsm/issues/1

test('#utils String.onify(str)', async t => {
  const result = utils.String.onify('foo')

  await t.test('returns a result', t => {     
    t.assert.ok(result, `${result} is falsy`)
  })

  await t.test('returns a string', t => {     
    t.assert.strictEqual(typeof result, 'string')
  })

  await t.test('passing an all-lowercase string', async t => {     
    const result = utils.String.onify('foo')

    await t.test('appends "on"', async t => {     
      t.assert.ok(result.startsWith('on'), `got: ${result} instead`)
      
      await t.test('just once', t => {     
        t.assert.strictEqual(result.split('on').length, 2)
      })
    })
    
    await t.test('uppercases 1st char', async t => {     
      t.assert.strictEqual(result[2], 'F')

      await t.test('remainder is unchanged', t => {     
        t.assert.strictEqual(result.split('onF').slice(1).join(''), 'oo')
      })
    })
  })
})

test('#String.onify(str) monosyllabic string argument', async t => {
  await t.test('passing a monosyllabic camelCase string', async t => {     
    const result = utils.String.onify('fooBar')
    
    await t.test('appends "on"', async t => {     
      t.assert.ok(result.startsWith('on'), `got: ${result} instead`)
  
      await t.test('just once', t => {     
        t.assert.strictEqual(result.split('on').length, 2)
      })
    })
    
    await t.test('uppercases 1st char', async t => {     
      t.assert.strictEqual(result[2], 'F')
  
      await t.test('remainder is unchanged', t => {     
        t.assert.strictEqual(result.split('onF').slice(1).join(''), 'ooBar')
      })
    })
  })
})

test('#String.onify(str) polysyllabic str argument', async t => {
  await t.test('passing a polysyllabic camelCase string', async t => {     
    const result = utils.String.onify('fooBarBaz')

    await t.test('appends "on"', async t => {     
      t.assert.ok(result.startsWith('on'), `got: ${result} instead`)

      await t.test('just once', t => {     
        t.assert.strictEqual(result.split('on').length, 2)
      })
    })
    
    await t.test('uppercases 1st char', async t => {     
      t.assert.strictEqual(result[2], 'F')

      await t.test('remainder is unchanged', t => {   
        t.assert.strictEqual(result.split('onF').slice(1).join(''), 'ooBarBaz')
      })
    })
  })
})


test('String.onify invalid argument', async t => {
  await t.test('passed nothing', t => {     
    return t.assert.throws(() => utils.String.onify(), {
      name: 'TypeError'
    })
  })
  
  await t.test('passed a non-string', async t => {     
    await t.test('throws a TypeError', t => {     
      return t.assert.throws(() => utils.String.onify(351), {
        name: 'TypeError'
      })
    })
  })

  await t.test('passed empty string', async t => {     
    await t.test('throws a RangeError', t => {     
      return t.assert.throws(() => utils.String.onify(' '), {
        name: 'RangeError'
      })
    })
  })    
})
