[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> `states` at any given time.   
> The change from one state to another is called a `transition`.

Finite-state machines are modelling constructs which allow expressing a piece 
of logic *declaratively*.   
They can only exist in *one*, *always-valid* state at any given time, 
rendering them inherently safe, by design.[^1]

This implementation allows constructing simple, robust & expressive FSMs.

Minimal, bundles `~ 850 bytes` with zero dependencies.  
Backed by a comprehensive test suite.

## Install 

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

The above FSM has the following rules:

- If `state:closed` & `transition:coin` is triggered, set `state:opened`
- If `state:opened` & `transition:push` is triggered, set `state:closed`

The initial state is set as the 1st `state` row.  

## Transition methods

> allow transitioning from one `state` to another, if allowed.

These are automatically created & named using the provided transition names.   
This renders an expressive & domain-specific API.

For example, this: 

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

creates these transition methods:

```js
turnstile.coin()
turnstile.push()
```

which are also be chainable:

```js
turnstile.coin().push()
// state: closed
```

> note: The `Async` FSM does not support chaining.

### Invalid transitions

Attempting to trigger a transition not listed under the current state:

- returns `false`
= state does not change  
- no hook methods are run

> example: current `state:closed` only lists the `coin` transition.  
> attempting any other transition, i.e `push`, is invalid.

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

console.log('returned:', turnstile.push())
// returned: false
// state: 'closed'
```

This behavior can be overriden, like so: 

```js
FSM.onInvalid = () => {
  throw new Error('Transition not allowed')
}

const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()
```

> note: `FSM.setOnInvalid` must be set *before* creating an instances.  
> It does not retroactively alter the behavior of existing instances.

## Hooks

Hooks are methods which are called at specific transition phases,   
optionally altering the transition behavior.

Each transition adds: 

- 1 transition hook
- 1 state hook
 
To define a hook, pass an object as the 2nd argument which implements 
the required hooks as methods.

> example: define a state hook for `state:opened`.

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onOpened() {
    console.log('turnstile is open')
  }
})

turnstile.coin()
// turnstile is open
```

> note: hooks are named after the transition or the state, prefixed with `on`.   
>
> i.e: transition `coin` names its transition hook: `onCoin`  
> i.e: state `opened` names its state hook: `onOpened`  

### Transition hooks 
 
> called when transition is triggered, *before* the state is changed:

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

Transition methods can pass arguments to relevant hooks, assumed to be
variadic: [^2]

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
      
    // cancel the transition
    return false
  }
})

console.log(turnstile.state)
// state: closed

await turnstile.coin()
// state: closed 
```

> note: transition hooks *must* be marked as `async`

## Subclassing

Instead of providing an object for the hooks, ditch it & just implement any 
required hooks as subclass methods. 

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

> note: the `ctx` argument can be used if you prefer 
> *Composition Over Inheritance*.

## API docs

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


## Validations

This implementation attempts to shift errors at *contruction time* rather 
than *run time*.  

It does so by validating it's state-transition table against `undefined`, 
invalidly typed or unreasonable inputs.
Validation errors contain exact paths and clear, unambiguous descriptions of 
the error.

Additionally, this implementation freezes it's internals to guard against
accidental modifications by reference, via it's arguments. 

As such, `FSM` instances should be considered *immutable*.

## Test 

> unit-tests & coverage:

```bash
node --run test
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

[turn]: https://en.wikipedia.org/wiki/Finite-state_machine#Example:_coin-operated_turnstile
[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table
[dfsm]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton
[ndfsm]: https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton

[profs]: https://github.com/TheProfs
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
