[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] is a mathematical model of computation.   
> It is an abstract machine that can be in one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

This implementation is simple, well-tested & safe against 
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

If you're sticking to *Composition over Inheritance*, just instantiate it 
standalons & assigning it as a member.

Pass `this`/or an object implementing any `runs` methods, as the 2nd argument.

```js
class Gate {
  // optional: 
  // allow reading state with `gate.state`
  get state() { return this.fsm.state }

  constructor() {
    this.fsm = new FSM({
      locked:   { 
        unlock: { to: 'unlocked', runs: ['open'] },
        pick:   { to: 'unlocked', runs: ['open'] } 
      },
      unlocked: { 
        lock: { to: 'locked',  runs: ['close'] } 
      }
    }, this)
  }

  open()  { console.log('opened ..') }
  close() { console.log('closed ..') }
}

const gate = new Gate()

gate.fsm.transition('unlock')
gate.state // 'unlocked'
```

or entirely standalone:

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
  open()  { console.log('opened ..') }
  close() { console.log('closed ..') }
})
```


## Docs 

### `new FSM(states, ctx)`

Construct an `FSM`

| name     | type     | desc.                           | default  |
|----------|----------|---------------------------------|----------|
| `states` | `object` | a [state-transition table][stt] | required |
| `ctx`    | `object` | implements transition `runs`    | `this`   |

> 1st state is set as the *initial* state.  


### `.state` 

The current `state`.  
Read-only.


### `.transition(name, arg1, arg2, ...)` 

Transition to another state, if allowed.   
Otherwise a `TransitionError` is thrown.

Passes arguments to listed `runs`, assumed to be variadic[^2].

| name     | type     | desc.              |
|----------|----------|------------------- |
| `name`   | `string` | transition name    |
| `arg*`   | `any`    | arbitrary argument |

Additionally, it's chainable: 

```js
const last = gate.transition('unlock')
    .transition('lock')
    .state

console.lost(last)
// 'locked'
```

### `static .fromJSON(json)` 

Revives a serialised FSM from a `JSON`.

| name     | type     | desc.                        |
|----------|----------|----------------------------- |
| `json`   | `string` | `JSON.stringify(fsm)` value  |

#### Example:

```js
const gate = (new Gate).transition('unlock')
const json = JSON.stringify(gate)

console.log(gate.state)
// 'unlocked'

// some time passes ...

const revived = FSM.fromJSON(json)

console.log(revived instanceof FSM, revived.state)
// true, 'unlocked'
```

## Guards

This implementation validates it's state-transition table against `undefined`
or invalidly-typed `states`, `transition` and `runs`. 
It also freezes it's internals to guard against accidental modifications 
by-reference, via it's arguments. 


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

[The MIT License][license]

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm@latest

[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table

[author]: https://github.com/nicholaswmin
[license]: ./LICENSE

[^1]: FSMs require passing a [state-transition table][stt].   
      This table lists all possible `states`, each `state` listing which 
      `transition` to another `state` is allowed from it,   
      asasuming it's the current `state`.

[^2]: Passing a state-transition table as an argument turns a *state machine**,
      into a *finite-state* machine.   
      Whatever the number of `states` in that table, they are not *infinite*, 
      making this state-machine, *finite*.
       
[^2]: Attempting a `transition` to a `state` which isn't listed as allowed
      in the *current* `state` is refused. The current `state` stays the same. 

[^3]: The refusal to transition to an invalid `state` according to some rules 
      is the 1 and only responsibility of a state machine.   
      An FSM which has ended in `>1 state` or in an `invalid state` has failed
      it's only job.

[^4]: Fancy word for: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,   
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}` ...   
      n-ary/variadic: `f = (...args) => {}`
