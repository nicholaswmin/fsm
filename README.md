[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm]

> A mathematical model of computation.  
> It is an abstract machine that can be in exactly one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

Ever ruminated if the elevator you just stepped in could malfunction and 
decapitate you?   
It won't. It's modelled as an FSM which allows it to `move` only if state is: 
`doors-closed`.

This implementation is remarkably simple, well-tested & safe against 
invalid [transition-tables][stt].

## Install

> [990 bytes][size], 0 dependencies

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

usage:

```js
const gate = new Gate()

// transition
gate.transition('unlock')

console.log(gate.state)
// state: 'unlocked'

gate.transition('unlock')
// `TransitionError`
```

> another example: standalone, w/o subclassing:

```js
const gate = new FSM({
  locked:   { 
    pick:   { to: 'unlocked', actions: ['open']  },
    unlock: { to: 'unlocked', actions: ['open']  }
  },
  unlocked: { lock: { to: 'locked',  actions: ['close']  } }
}, {
  open:  () => { console.log('opened ..') },
  close: () => { console.log('closed ..') }
})
```

## API 


### `new FSM(states, ctx)`

Construct an `FSM`, see example above.

| name     | type     | desc.                          | default  | required  |
|----------|----------|--------------------------------|----------|-----------|
| `states` | `object` | list of possible `states`      | n/a      | yes       |
| `ctx`    | `object` | implements transition actions  | `this`   | no        |

> 1st state in `states` is set as the *initial* state.  

### `.state` 

The current `state`.  


### `.transition(name)` 

Transition to another state, if allowed.  
Otherwise a `TransitionError` is thrown.


| name     | type     | desc.           | required |
|----------|----------|-----------------|----------|
| `name`   | `string` | transition name | yes      |


calls can be chained: 

```js
gate.transition('unlock').transition('lock')
```

## Test 

> unit-tests & coverage:

```bash
node --run test
```

> mutation testing:

```bash
node --run test:mutation
```

> tests are excluded from `npm publish`

## Authors

[@nicholaswmin][author]

## License 

[MIT][license]

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm@latest

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
