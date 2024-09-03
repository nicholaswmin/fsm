[![test-url][test-badge]][test-url] [![cov-url][cov-badge]][cov-url]

# fsm

> minimal [Finite-state machine][fsm]

## Install

> [~1kb][size], zero dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> simply throws on an invalid transition

```js
import FSM from '@nicholaswmin/fsm'

const gate = new FSM({
  init: 'locked',
  states: {
    locked: { unlock: { to: 'unlocked', actions: ['open']  } },
    unlocked: { lock: { to: 'locked', actions: ['close']  } }
  },
  
  actions: {
    open:  () => console.log('opened gate'),
    close: () => console.log('closed gate')
  }
})

// transition to another state ...
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked' ...

gate.transition('unlock')
// throws: `TransitionError`
```


## API 

### `new FSM({ init, states, actions })`

| name      | type     | description                |
|-----------|----------|----------------------------|
| `init`    | `String` | Initial State              |
| `states`  | `Object` | List of possible `states`  |
| `actions` | `Object` | List of `actions`          |

Construct an `FSM`, see example above.

### `fsm.state` 

Current `state` 

### `fsm.transition(name)` 

Transition to another state, if allowed.  
Otherwise a`TransitionError` is thrown.


| name    | type     | description      |
|---------|----------|------------------|
| `name`  | `String` | Transition name  |


Calls can be chained, like so: 

```js
gate.transition('unlock').transition('lock')
```


## Integrity safeguards

To safeguard against runtime errors, the input arguments are validated, 
then both the arguments & the FSM are [`frozen`][obj-freeze].

## Test 

```bash
node --run test
```

> tests are excluded from `npm publish`

## Authors

[@nicholaswmin][nicholaswmin]

## License 

[MIT-0][license]

[test-badge]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[test-url]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml

[cov-badge]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg?branch=main
[cov-url]: https://coveralls.io/github/nicholaswmin/fsm?branch=main
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[obj-freeze]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
