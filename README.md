[![tests][tests-badge]][tests] [![cov][cov-badge]][cov]

# fsm

> minimal [finite-state machine][fsm]

## Install

> [1kb][size], zero dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> implementing a gate as an FSM:

```js
import FSM from '@nicholaswmin/fsm'

class Gate extends FSM {
  constructor() {
    super({
      locked:   { 
        unlock: { to: 'unlocked', actions: ['open']  },
        pick:   { to: 'unlocked', actions: ['open']  } 
      },
      unlocked: { lock: { to: 'locked',  actions: ['close']  } }
    })
  }
  
  open()  { console.log('gate opened ...') }
  close() { console.log('gate closed ...') }
}
```

then:

```js
const gate = new Gate()

// transition state
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// `TransitionError`
```

... or standalone, w/o subclassing:

```js
const gate = new FSM({
  locked:   { 
    pick:   { to: 'unlocked', actions: ['open']  },
    unlock: { to: 'unlocked', actions: ['open']  }
  },
  unlocked: { lock: { to: 'locked',  actions: ['close']  } }
}, {
  open:  () => { console.log('gate opened ...') },
  close: () => { console.log('gate closed ...') }
})
```

requires a 2nd argument, `ctx`, which should implement *every* method
listed in transition `actions`.


## API 


### `new FSM(states, ctx)`

Construct an `FSM`, see example above.

| name     | type     | desc.                                    | default  |
|----------|----------|------------------------------------------|----------|
| `states` | `Object` | list of all possible `states`            | required |
| `ctx`    | `Object` | obj. implementing all transition actions | `this`   | 

> 1st listed state is set as the initial state.  

> the `ctx` object is only required when instantiating as a standalone unit.


### `.state` 

stores the *current* `state` 


### `.transition(name)` 

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

While this FSM does few things it strives to perform them as correctly
as possible with an emphasis on catching errors on construction-time rather
than run-time.

In addition to an extensive test suite, it's constructor arguments are 
validated for type, shape, mapping actions to defined methods etc..

Additionally, & to protect against accidental meddling with it's internals, 
both the arguments & the FSM itself are rendered immutable via `Object.freeze`. 

## Test 

```bash
node --run test
```

> tests are excluded from `npm publish`

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

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
