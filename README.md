[![tests][tests-badge]][tests] [![cov][cov-badge]][cov]

# fsm

> minimal [Finite-state machine][fsm]

## Install

> [~1kb][size], 0-dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> throws on invalid transitions

```js
import FSM from '@nicholaswmin/fsm'

const gate = new FSM({
  init: 'locked',
  states: {
    locked: { unlock: { to: 'unlocked', actions: ['open']  } },
    unlocked: { lock: { to: 'locked', actions: ['close']  } }
  },
  
  actions: {
    open:  () => console.log('opened'),
    close: () => console.log('closed')
  }
})

// transition state
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// `TransitionError`
```


## API 

### `new FSM({ init, states, actions })`

| name      | type     | desc.                      |
|-----------|----------|----------------------------|
| `init`    | `String` | Initial State              |
| `states`  | `Object` | List of possible `states`  |
| `actions` | `Object` | List of `actions`          |

Construct an `FSM`, see example above.

### `fsm.state` 

Current `state` 

### `fsm.transition(name)` 

Transition to another state, if allowed.  
Otherwise a `TransitionError` is thrown.


| name    | type     | desc.       |
|---------|----------|-------------|
| `name`  | `String` | transition  |


calls can be chained: 

```js
gate.transition('unlock').transition('lock')
```


## Safeguards

input arguments are strongly validated, then both arguments & FSM are 
frozen via `Object.freeze`.

## Test 

```bash
node --run test
```

> excluded from `npm publish`

## Authors

[@nicholaswmin][author]

## License 

[MIT-0][license]

[tests-badge]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml

[cov-badge]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
