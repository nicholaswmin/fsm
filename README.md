[![test-url][test-badge]][test-url] [![cov-url][cov-badge]][cov-url]

# :infinity: fsm

> [~1kb][size-url], minimal [Finite-state machine][fsm]

## Install

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

// transition state ...
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked' ...

gate.transition('unlock')
// throws: `TransitionError`
```


## API 

#### `new FSM({ init, states, actions })`

Construct an `FSM`, see example above.

#### `fsm.transition(name)` 

Transition to another state, if allowed.

#### `fsm.state` 

Current `state` 


## Setup validations

Prioritizes a small scope, small filesize & *setup correctness*, so it's 
fairly strict about it's setup:

```js
const gate = new FSM({
  init: 'locked',
  states: {
    locked: { 
      // ... 
      unlock: {  
        actions: ['open'] // <-- declares `open` ...
      }
    }
  },
  
  actions: {
    close: () => { } // <-- (!) ... but only `close` defined
  }
})

// Throws:
// RangeError: state.0.transition.0.actions.0: "open" not present in actions
```


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
[size-url]: https://bundlephobia.com/package/@nicholaswmin/fsm

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
