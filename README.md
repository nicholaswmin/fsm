[![test-url][test-badge]][test-url] [![dep-url][dep-badge]][dep-url] 

# fsm

> a bare-minimum [Finite-State Machine][fsm] with an emphasis on 
> [correctness](#setup-correctness)

## Install

```bash
npm i @nicholaswmin/fsm
```

## Example

> only throws on invalid transitions
> ... and that's pretty much it

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


## Setup correctness

This FSM prioritizes small scope, small size and a specific emphasis on 
setup *correctness*. 

Validations ensure the FSM is setup with correct `states` & `actions`, 
as much as possible.

Example: 

```js
const gate = new FSM({
  states: {
    locked: { 
      lock: {  
        to: 'unlocked',  actions: [3] // <-- must be a string
      } 
    }
  },
  // .. rest of args
})

// Throws: TypeError: "state.0.actions.0" must be a valid String, got: number
```

## Test 

```bash
node --run test
```

> code coverage output at: `test/lcov.info`

## Contributing

Follows [Semver][sv], [Conventional Commits][ccom]

## Authors

[@nicholaswmin][nicholaswmin]

## License 

[MIT License][license]

[test-badge]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[test-url]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml
[dep-badge]: https://img.shields.io/badge/dependencies-0-b.svg
[dep-url]: https://blog.author.io/npm-needs-a-personal-trainer-537e0f8859c6

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/

[nicholaswmin]: https://github.com/nicholaswmin
[license]: ./LICENSE
