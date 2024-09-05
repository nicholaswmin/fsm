[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm]

> A finite-state machine is a mathematical model of computation.  
> It is an abstract machine that can be in exactly one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

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

> standalone, w/o subclassing:

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
listed as a transition `action`.

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

```bash
node --run test
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

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
