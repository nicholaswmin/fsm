[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm]

> A finite-state machine is a mathematical model of computation.
> It is an abstract machine that can be in exactly one of a finite number of 
> states at any given time.  
> The change from one state to another is called a transition.

## Install

> [1kb][size], 0 dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> a gate as an FSM:

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
  
  open()  { console.log('opened ..') }
  close() { console.log('closed ..') }
}
```

then:

```js
const gate = new Gate()

// transition
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// `TransitionError`
```

## API 


### `new FSM(states, ctx)`

Construct an `FSM`, see example above.

| name     | type     | desc.                                | default  |
|----------|----------|--------------------------------------|----------|
| `states` | `Object` | list of possible `states`            | required |
| `ctx`    | `Object` | obj. implementing transition actions | `this`   | 

> 1st listed state is set as the initial state.  

> the `ctx` object is only required when instantiating as a standalone unit.


### `.state` 

read *current* `state` 


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

## Test 

```bash
node --run test
```

> tests are excluded from `npm publish`

## Authors

[@nicholaswmin][author]

## License 

MIT

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm@latest

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine

[author]: https://github.com/nicholaswmin
