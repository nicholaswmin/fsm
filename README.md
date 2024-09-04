[![tests][tests-badge]][tests] [![cov][cov-badge]][cov]

# fsm

> minimal [finite-state machine][fsm]

## Install

> [~1kb][size], zero dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> just throws on invalid transitions

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
| `init`    | `String` | Initial `state`            |
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


## Integrity safeguards

Despite it's simple design, this FSM is designed & intended for production use. 

In addition to an extensive test suite, it emphasizes catching issues 
at *construction-time*, rather than *run-time*. 

As a result, constructor arguments are strictly validated.  
The validation errors contain descriptive error messages.

For example: 

```js
// ... rest ommited for brevity

states: {
  locked: { 
    unlock: { 
      to: 'unlocked', actions: [' open'] // <-- oops

// throws: 
// TypeError: state.0.transition.0.actions.0 string cannot contain whitespace
```

Additionally, to protect against meddling with it's internals *by-reference*,   
the arguments & the FSM are frozen & rendered immutable via `Object.freeze`. 

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
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm@latest

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[state-table]: https://en.wikipedia.org/wiki/State-transition_table
[nyt]: https://www.nytimes.com/1883/12/15/archives/decapitated-by-an-elevator.html

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
