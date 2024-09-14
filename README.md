[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> `states` at any given time.   
> The change from one state to another is called a `transition`.

Finite-state machines are modelling constructs which allow expressing a piece 
of logic [*declaratively*][declaratively].   

They can only exist in one, always-valid state at any given time, 
rendering them *inherently safe*, by design.[^1]

This implementation allows constructing simple, robust & expressive FSMs.

Minimal, bundles `~ 850 bytes` with zero dependencies.  
Backed by a comprehensive test suite.

- [Install](#install)
- [Example](#example)
- [Transition methods](#transition-methods)
  * [Invalid transitions](#invalid-transitions)
- [Transition hooks](#transition-hooks)
  * [Transition cancellations](#transition-cancellations)
- [State hooks](#state-hooks)
- [Passing arguments](#passing-arguments)
- [Asynchronous transitions](#asynchronous-transitions)
- [Subclassing](#subclassing)
  * [Composition over Inheritance](#composition-over-inheritance)
- [API docs](#api-docs)
  * [`new FSM(states, ctx)`](#-new-fsm-states--ctx--)
  * [`static FSM.onInvalid`](#-static-fsmoninvalid-)
  * [`fsm.state`](#-fsmstate-)
- [Validations](#validations)
- [Test](#test)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Install 

```bash
npm i @nicholaswmin/fsm
```

## Example

> example: a [turnstile mechanism][turn]

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

The above FSM simply expresses:

- If `state:closed` & `transition:coin` is triggered, set `state:opened`
- If `state:opened` & `transition:push` is triggered, set `state:closed`

## Transition methods

Transition methods allow transitioning from one `state` to another, 
if allowed under the `current state`.

They are created and named after the provided transitions, 
which renders an expressive & domain-specific API.

For example: 

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

... has 2 transitions: 

- `coin`  
- `push`

... therefore it creates 2 identically named transition methods:

```js
turnstile.coin()
// state: opened
turnstile.push()
// state: closed
```

... which are also chainable:

```js
turnstile.coin().push()
// state: closed
```

### Invalid transitions

Triggering a transition that's not listed under the current state:

- returns `false`
- the state does not change  
- no hook methods are run

> example: state `closed` only lists a `coin` transition, so attempting 
> `push` while `state:closed` is invalid:

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

console.log(turnstile.push())
// false
// state: 'closed'
```

> the transition was invalid so the `state` did not change.

### Configuring behaviour

The invalid behaviour can be configured, by reassigning `FSM.onInvalid`:

```js
FSM.onInvalid = function(arg) {
  if (arg === 'foo')
    throw new Error('bar')

  throw new Error('baz')
}

const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()
// Error: baz

turnstile.push('foo')
// Error: bar
```

> note: `static FSM.onInvalid` retroactively alters the behaviour of all 
> instances, even instances created before `onInvalid` was set.

## Hooks

Hooks are methods which are called at specific transition phases,   
optionally altering the transition behavior.

Each transition adds: 

- 1 transition hook
- 1 state hook
 
To define a hook, pass an object as the 2nd argument which implements 
the required hooks as methods.

If an appropriately named hook is found, it's called, otherwise it's ignored.

> example: a hook that gets called when `state:opened`.

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
// state: opened

// turnstile is open
```

> note: hooks must be named after the transition or the state, prefixed 
> with `on`.   
>
> i.e: transition `coin` looks for a transition hook named: `onCoin`  
> i.e: state `opened` looks for a state hook named: `onOpened`  

### Transition hooks 
 
> called when a transition is triggered, *before* the state is changed:

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin() {
    console.log('got a coin, state:', this.state)
  }
})

turnstile.onCoin()
// got a coin, state: closed

console.log(turnstile.state)
// state: opened
```

### Transition cancellations

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

> note: cancellations require returning `false`, not "falsy" values.


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

## Passing arguments 

Transition methods can pass arguments to relevant hooks, assumed to be
variadic: [^2]

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin: (one, two) => console.log(one, two)
})

turnstile.insertCoin('foo', 'bar')

// foo, bar

```

## Asynchronous transitions

Asynchronous FSMs can be constructed using `Async` FSM.

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

Just implement any required hooks as subclass methods and don't pass a 2nd 
`ctx` argument.

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  onCoin() {
    console.log('got a coin')
  }
}

const turnstile = new Turnstile()

turnstile.coin()
// got a coin

console.log(turnstile.state)
// state: opened
```

### Composition over Inheritance

The `ctx` argument can still be used for *Composition over Inheritance*.

```js
class Turnstile {
  constructor() {
    this.fsm = new FSM({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, {
      onCoin: () => {
        console.log('got a coin')
      }
    })
  }
}

turnstile.fsm.coin()
// got a coin

console.log(turnstile.fsm.state)
// state: opened
```

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

> The 1st state in `states` is set as the *initial* state.  
> each `state` can list `zero`, `one` or `many` transitions.    

### `static FSM.onInvalid` 

Called when an invalid transition is fired, 
providing behaviour for invalid transitions.  

Can be overriden, reconfiguring the invalid behaviour.

| name        | type       | desc.             | default        |
|-------------|------------|-------------------|----------------|
| `onInvalid` | `function` | invalid behaviour | `return false` |


### `fsm.state` 

The current `state`. Read-only.

| name     | type     | default       |
|----------|----------|---------------|
| `state`  | `string` | current state | 


## Validations

This implementation attempts to shift errors at *contruction time* rather 
than *run time*.  

It does so by validating it's state-transition table against `undefined`, 
invalidly typed or unreasonable inputs.
Validation errors contain exact paths and clear, unambiguous descriptions of 
the error.

Additionally, this implementation freezes it's internals to guard against
accidental modifications by reference, via it's arguments. 

As such, `FSM` instances should be considered [*immutable*][imut].

## Test 

> unit tests:

```bash
node --test
```

> test coverage:

```bash
node --test --experimental-test-coverage
```

## Contributing

[Contribution guide][contr-guide]

## Authors

[@nicholaswmin][author]

## License 

[The MIT License][license]

### Footnotes 

[^1]: There are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm].  
      This documentation describes a specific type of state machine, the 
      [*Deterministic finite automaton*][dfsm] which can only exist in 1 state.  
      
      *"automaton"* is just the fancy academic term from automata theory 
      meaning *"automatic machine"*. 

[^2]: Just a fancy term for: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`
      

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm

[declaratively]: https://en.wikipedia.org/wiki/Declarative_programming
[turn]: https://en.wikipedia.org/wiki/Finite-state_machine#Example:_coin-operated_turnstile
[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table
[dfsm]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton
[ndfsm]: https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton
[imut]: https://en.wikipedia.org/wiki/Immutable_object

[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
