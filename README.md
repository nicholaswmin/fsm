[![test-url][test-badge]][test-url] [![coverage-workflow][coverage-badge]][coverage-report] [![dep-url][dep-badge]][dep-url] 

# fsm

> minimal [Finite-state machine][fsm]

## Install

```bash
npm i @nicholaswmin/fsm
```

## Example

> throws on invalid transitions ... & that's pretty much it.

```js
import FSM from '@nicholaswmin/fsm'

const gate = new FSM({
  init: 'locked',
  states: {
    locked: { unlock: { to: 'unlocked', actions: ['open']  } },
    unlocked: { lock: { to: 'locked', actions: ['close']  } }
  },
  
  actions: {
    open:  () => console.log('open ...'),
    close: () => console.log('close ...')
  }
})

// transition state
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// throws: `InvalidTransitionError`
```


## API 

#### `new FSM({ init, states, actions })`

Construct a new `FSM`, see example above for details.

#### `fsm.transition(name)` 

Transition from one state to another, if allowed.

#### `fsm.state` 

The current `state` 


## Correctness

Prioritizes a small scope, small filesize & *setup correctness*,   
so it's strict about its setup:

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

[coverage-badge]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg?branch=main
[coverage-report]: https://coveralls.io/github/nicholaswmin/fsm?branch=main

[dep-badge]: https://img.shields.io/badge/dependencies-0-b.svg
[dep-url]: https://bundlephobia.com/package/@nicholaswmin/fsm

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
