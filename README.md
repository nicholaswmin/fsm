[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm]

> ... is a mathematical model of computation.  
> It is an abstract machine that can be in *one* of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

Ever ruminated if the elevator you just stepped in could malfunction and 
decapitate you?   
It wont. It's modelled as an FSM which only allows it to: `move` if state is: 
`doors-closed`.

This implementation is remarkably simple, well-tested & safe against 
invalid [transition tables][stt].

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
        unlock: { to: 'unlocked', runs: ['open'] },
        pick:   { to: 'unlocked', runs: ['open'] } 
      },
      unlocked: { 
        lock: { to: 'locked',  runs: ['close'] } 
      }
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

### Standalone

> FSM's tend to be a fundamental attribute so subclassing makes a lot of sense, 
> even when following the [Composition over Inheritance][coi] principle.

... but it also works standalone, like so:

```js
const gate = new FSM({
  locked:   { 
    unlock: { to: 'unlocked', runs: ['open'] },
    pick:   { to: 'unlocked', runs: ['open'] } 
  },
  unlocked: { 
    lock: { to: 'locked',  runs: ['close'] } 
  }
}, {
  open:  () => { console.log('opened ..') },
  close: () => { console.log('closed ..') }
})
```

## API 


### `new FSM(states, ctx)`

Construct an `FSM`

| name     | type     | desc.                               | default  |
|----------|----------|-------------------------------------|----------|
| `states` | `object` | the [state-transition table][stt]   | required |
| `ctx`    | `object` | obj. implementing transition `runs` | `this`   |

> 1st state is set as the *initial* state.  

> `ctx` is only required for standalone FSM's


### `.state` 

The current `state`.  


### `.transition(name)` 

Transition to another state, if allowed.  
Otherwise a `TransitionError` is thrown.


| name     | type     | desc.           |
|----------|----------|-----------------|
| `name`   | `string` | transition name |


calls can be chained: 

```js
gate.transition('unlock')
    .transition('lock')
```

## Guards

This implementation validates it's state-transition table against undefined
or invalidly typed `states`, `transition` and `runs`. It also freezes it's 
internals to guard against accidental modifications by-reference, via it's 
arguments. 

So while it attempts to guarantee that you will be able to transition 
to *a state*, it cannot guarantee whether you'll be allowed to transition 
to *the state you intended*.

It's up to you to verify that you haven't unwittingly created a never-ending 
roundabout of transitions since doing so would limit the applicability of
this implementation.

## Test 

> unit-tests & coverage:

```bash
node --run test
```

> mutation testing:

```bash
node --run test:mutation
```

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
[coi]: https://en.wikipedia.org/wiki/Composition_over_inheritance

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
