[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> `states` at any given time.   
> The change from one state to another is called a `transition`.

Finite-state machines are modelling constructs which allow expressing a piece 
of logic *declaratively*, in a concise yet precise manner. They can only exist 
in *one, always-valid* state at any given time, rendering them inherently safe, 
by design.[^1]

This minimal implementation allows constructing production-grade FSMs which 
are expressive, simple and robust.  

## Install 

`~ 850 bytes` gzipped, zero-dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> canonical FSM example, a [turnstile mechanism][turn]

```js
import { Sync as FSM } from '@nicholaswmin/fsm'

const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.coin()
// state: opened

turnstile.push()
// state: closed
```

## Transition methods

> transition from one `state` to another, if allowed.

They are created based on the transition names given in the `states` argument.   
This renders an expressive & domain-specific API.

For example, this: 

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

creates methods:

```js
turnstile.coin()
// state: opened

turnstile.push()
// state: closed
```

which are also be chainable:

```js
turnstile.coin().push()
// state: closed
```

> note: method-chaining is only supported on the syncronous `SyncFSM`.

### Invalid transitions

Attempting to trigger a transition which isn't listed under the current
state will throw an `Error`.

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()
// Error: push() not allowed in state:closed
```

## Hooks

Hooks are functions/methods which are called at specific transition phases, 
optionally altering the transition behavior.

Each transition adds: 

- 1 transition hook, named as: `on<TransitionName>`
- 1 state-change hook, named as: `on<StateName>`

where `TransitionName`, `StateName` are the given transition and state names,
respectively.
 
The 2nd argument accepts an object, optionally implementing some or all hooks.    
The `FSM` looks up for these hook methods on an object which should be provided
as the 2nd argument `ctx`. 

The following section provides an example.

Assuming these transitions:

```js
closed: { coin: 'opened' },
opened: { push: 'closed' }
```

### Transition hooks 
 
> called when transition is triggered, *before* the state changes:

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin() {
    console.log('coin dropped!, state:', this.state)
  }
})

turnstile.onCoin()
// coin dropped!, state: closed

console.log(turnstile.state)
// state: opened
```

### State hooks 

> called when a transition completes, *after* the state changes:

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onClosed() {
    console.log('closed')
  },
  onOpened() {
    console.log('opened')
  }
})

turnstile.coin()
// opened!

turnstile.push()
// closed!

```

## Transition cancellations

Transition hooks may cancel a transition by explicitly returning `false`.

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin(coin) {
    return coin >= 50
  }
})

turnstile.coin(30)
// state: closed 

turnstile.coin(50)
// state: opened
```

> note: `undefined`, `null`, `0` etc. are *falsy* values but not `false`.

## Passing arguments 

Transition methods can pass variadic arguments to relevant hooks [^2]:

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin: () => console.log(arg1, arg2)
})

turnstile.insertCoin('foo', 'bar')

// foo, bar

```

## Asynchronous transitions

Asynchronous FSMs can be constructed from the exported `Async` FSM:

```js
import { Async as FSM } from '@nicholaswmin/fsm'

const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  async onCoin: coins => {
    // a whatever async call ...
    await db('select * from....'')
      
    // decided to cancel the transition
    return false
  }
})

console.log(turnstile.state)
// state: closed

await turnstile.coin()
// state: closed 
```

> note: transition hooks *must* be marked as `async`.  
> ... and of course, transition methods must be called with `await`.

## Subclassing

Instead of providing a `ctx` argument, any hooks should be implemented as 
methods directly on the subclass itself. 

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  onCoin() {
    console.log('coin dropped!')
  }
}

const turnstile = new Turnstile()

turnstile.coin()
// coin dropped!

console.log(turnstile.state)
// state: opened
```

## API 

### `new FSM(states, ctx)`

Construct an `FSM`

| name     | type     | desc.                           | default  |
|----------|----------|---------------------------------|----------|
| `states` | `object` | a [state-transition table][stt] | required |
| `ctx`    | `object` | implements transition hooks     | `this`   |

`states` must have the following shape:

```js
state: { transition: 'state' },
state: { transition: 'state' }
```

> each `state` can list zero, one or multiple transitions.  
> 1st state is set as the *initial* state.  

### `.state` 

The current `state`. Read-only.


## Guards

This implementation attempts to shift errors at *contruction-time* rather 
than *run-time*.  
It does so by validating it's state-transition table against `undefined`, 
invalidly-typed or unreasonable `states` inputs.

It also freezes it's internals to guard against accidental modifications 
by-reference, via it's arguments. 

As such, `FSM` instances should be considered *immutable*.

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

### Footnotes 

[^1]: There are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm], where "automaton"
      is just a fancy term from automata theory for "automatic machine".    
      This documentation describes a specific type of state machine, the 
      [*Deterministic finite automaton*][dfsm] which can only exist in 1 state.

[^2]: Just a fancy term for: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`
      

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm
[size]: https://bundlephobia.com/package/@nicholaswmin/fsm@latest

[turn]: https://en.wikipedia.org/wiki/Finite-state_machine#Example:_coin-operated_turnstile
[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table
[dfsm]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton
[ndfsm]: https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton

[profs]: https://github.com/TheProfs
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
