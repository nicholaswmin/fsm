[![test-url][test-badge]][test-url] [![dep-url][dep-badge]][dep-url] 

# fsm

> a bare-minimum [finite-state machine][fsm] with an emphasis on 
> [correctness](#setup-correctness)

## Install

```bash
npm i @nicholaswmin/fsm
```

## Example

> only throws on invalid transitions
> ... and that's pretty much it

```js
const gate = new StateMachine({
  init: 'locked',
  states: {
    locked:   { lock: { to: 'unlocked',  actions: ['open']  } },
    unlocked: { unlock: { to: 'locked',  actions: ['close'] } }
  },
  
  actions: {
    open:  () => console.log('opening ...'),
    close: () => console.log('closing ...')
  }
})

// initial state: 'locked'

gate.transition('unlock')
console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// throws: `InvalidTransitionError`
```


## API 

### `new FSM({ init, states, actions })`

Construct a new `FSM`, see example above for details.

### `fsm.transition(name)` 

Transition from one state to another, if allowed.

`name`: `String` : The transition name

### `fsm.state` 

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

Follows [Semver][sv], [Conventional Commits][ccom] & 100% unit-test coverage

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
