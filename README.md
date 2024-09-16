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
  * [Configurable behaviour](#configuring-behaviour)
- [Hooks](#transition-hooks)
  * [Transition hooks](#transition-hooks)
    + [Transition cancellations](#transition-cancellations)
  * [State hooks](#state-hooks)
  * [Passing arguments](#passing-arguments)
- [Asynchronous transitions](#asynchronous-transitions)
- [Subclassing](#subclassing)
  * [Composition over Inheritance](#composition-over-inheritance)
- [Serialising & Deserialising](#serialising-to-json)
  * [Subclassing for improved ergonomics](#composition-over-inheritance)
- [API](#api)
  * [`new FSM(states, hooks)`](#-new-fsm-states--hooks--)
  * [`static FSM.onInvalid`](#-static-fsmoninvalid-)
  * [`static FSM.parse(json, hooks)`](#-static-fsm.parse-)
  * [`fsm.state`](#-fsmstate-)
- [Validations](#validations)
- [Tests](#test)
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

The invalid behaviour can be configured by overriding `static onInvalid`:

```js
class NoisyFSM extends FSM {
  static onInvalid(transition) {
    throw Error(`cannot ${transition} from ${this.state}`)
  }
}

const turnstile = new NoisyFSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()
// Error: cannot push from: closed
```

... `onInvalid` accepts variadic arguments: [^2]

```js
class NoisyFSM extends FSM {
  static onInvalid(transition, arg1, arg2) {
    console.log(arg1, arg2)
    // ... rest of code
  }
}

const turnstile = new NoisyFSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push('foo', 'bar')
// foo, bar
```

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
`hooks` argument.

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

The `hooks` argument can still be used for *Composition over Inheritance*.

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

### Serialising to JSON

Serialise it to [JSON][json] using [JSON.stringify)][JSON.stringify], 

```js
const turnstile = new FSM({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.coin()
// state: opened

const json = JSON.stringify(turnstile)
// do whatever, save in DB, file ..
```

... revive it back to it's last state using `FSM.parse(json)`:

```js
const revived = FSM.parse(json)
// state: opened 

revived.push()
// state: closed
```

The caveat is that any preregistered [hooks](#transition-hooks) are *not* 
automatically re-registered.

Although you can re-register them manually, like so:

```js
// assume hooks = object with hook functions/methods
const revived = FSM.parse(json, hooks)
```

this can quickly become unergonomic. 

So ...

## Use subclassing when serialising

Subclassing makes much more sense & doesn't need to re-registering anything.

Just `JSON.stringify()` and `.parse()` it back:

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  onPush() { console.log('got a coin') }
}

const turnstile = new Turnstile()

turnstile.coin()
// state: opened

const json = JSON.stringify(turnstile)
const revived = Turnstile.parse(json)

revived.push()
// pushed ..
// state: closed
```

> note: make sure you `Turnstile.parse(json)`, on the child class, rather than 
> `FSM.parse(json)` using the generic `FSM`; which still works because of the 
> Liskov Principle and all that but ultimately is not what you'd want.

Beyond a certain point, you'd want to be subclassing anyway.


## API

### `new FSM(states, hooks)`

Construct an `FSM`

| name     | type     | desc.                           | default  |
|----------|----------|---------------------------------|----------|
| `states` | `object` | a [state-transition table][stt] | required |
| `hooks`  | `object` | implements transition hooks     | `this`   |

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

Can be overriden, which configures the invalid behaviour.

| name        | type       | desc.             | default        |
|-------------|------------|-------------------|----------------|
| `onInvalid` | `function` | invalid behaviour | `return false` |


### `static FSM.parse(json, hooks)` 

Deserialise/revive an instance from it's [JSON][json].   
You can serialise an instance using: `JSON.stringify(fsm)`

| name     | type     | desc.                             | default  |
|----------|----------|-----------------------------------|----------|
| `json`   | `string` | result of `JSON.stringify(fsm)`   | required |
| `hooks`  | `object` | implements transition hooks       | optional |

> note: use subclassing so you won't ever need to pass a `hooks` argument

> note: use the correponding `ChildClass.parse` when deserialising.

### `JSON.stringify(fsm)`

Returns a [JSON][json] of the FSM, for storing in a database, file, freezer ..
The JSON contains the in stance type in case you need to look it up for
choosing the correct class for parsing/deserialising:

```js
const turnstile = new Turnstile()

turnstile.coin()

// { "name":"Turnstile", "states": {"closed ...
```


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

As such, `FSM` instances, while obviously not strictly [*immutable*][imut], 
are non-modifiable.

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

## Todos

[Todos][todos]

## Authors

[@nicholaswmin][author]

## License 

[The MIT License][license]

### Footnotes 

[^1]: There are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm].  
      This documentation describes a specific type of state machine, the 
      [*Deterministic finite automaton*][dfsm] which can only exist in 1 state.
      
      This documentation specifically avoids the formal terminology from   
      Automata Theory because it's really just bunch of outdated terminology  
      that makes simple concepts sound much harder than they are.
    
      *"automaton"* is the academic term from automata theory meaning 
      *"automatic machine"*. ..yes, me smart, big words.

[^2]: Means: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`
      
[^3]: The SOLID principles emphasize *preferring* (not replace) Composition over 
      Inheritance because inheritance creates a strong `is-a` coupling 
      relationship that ends up doing too much or even results in a wrong 
      behavior, like the canonical 
      [Circle/Ellipsis problem][circle-ellipsis].
      
      In the case of FSMs *none* of the above apply. 
      
      - A light switch `is-an` example of an FSM, like a `Duck` `is-an` animal.
      - A turnstile `is-a` clear & unambigous FSM. 
      
      An FSM subclass can be entirely replaced with it's parent without any 
      change in behavior, at all, which satisfies the Liskov principle.
      
      Additionally, the FSM creates it's methods dynamically, based on `states`; 
      you're not polluting the child with unused methods.

      There isn't much of an argument to make for Composition in this case.
      

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
[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[workers]: https://nodejs.org/api/worker_threads.html
[circle-ellipsis]: https://en.wikipedia.org/wiki/Circle%E2%80%93ellipse_problem

[contr-guide]: ./.github/CONTRIBUTING.md
[todo]: ./.github/TODO.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
