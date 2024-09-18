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
  * [Configure invalid behaviour](#configure-invalid-behaviour)
- [Hooks](#transition-hooks)
  * [Transition hooks](#transition-hooks)
    + [Transition cancellations](#transition-cancellations)
  * [State hooks](#state-hooks)
  * [Passing arguments](#passing-arguments)
- [Asynchronous transitions](#asynchronous-transitions)
- [Serialising & Deserialising](#serialising-to-json)
- [API](#api)
  * [`new FSM(states, hooks)`](#-new-fsm-states)
  * [`fsm.state`](#-fsmstate-)
  * [`static FSM.onInvalid`](#-static-fsmoninvalid-)
  * [`static FSM.parse(json, hooks)`](#-static-fsm.parse-)
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

class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
}

const turnstile = new Turnstile()

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

They are automaticaly created & named after the provided transitions, 
which renders an expressive & domain-specific API.

For example, the following FSM: 

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
}
```

... has 2 transitions: 

- `coin`  
- `push`

... therefore it has 2 identically-named methods:

```js
const turnstile = new Turnstile()

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
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
}

const turnstile = new Turnstile()

console.log(turnstile.push())
// false
// state: 'closed'
```

> the transition was invalid so the `state` did not change.

### Configure invalid behaviour

The invalid behaviour can be configured by overriding `static onInvalid`.

> Example: throw an `Error` instead of silently ignoring the invalid 
> transition:

```js
class NoisyTurnstile extends FSM {
  static onInvalid(transition) {
    throw Error(`cannot ${transition} from ${this.state}`)
  }

  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
}

const turnstile = new Turnstile()

turnstile.push()
// Error: cannot push from: closed
```

... `onInvalid` accepts variadic arguments: [^2]

```js
class Turnstile extends FSM {
  static onInvalid(transition, arg1, arg2) {
    console.log(arg1, arg2)
  }
  
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
}

const turnstile = new Turnstile()

turnstile.push('foo', 'bar')
// foo, bar
```

## Hooks

Hooks are methods which are called at specific transition phases,   
optionally altering the transition behavior.

A valid transition attempt will call:

### A *transition hook*

> named `on<transition-name>`

i.e 

- transition: `coin` calls method `onCoin`
- transition: `push` calls method `onPush`

> transition hooks are always called *before* the state is changed.

If the transition completes & the state changes, it then calls:

### A *state hook*

> named `on<state-name>`

- state `opened` calls method `onOpened`
- state `closed` calls method `onClosed`


> note: hooks are only called if they exist. They are optional.

### Example

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
    
    // transition hooks

    onCoin() {
      console.log('got a coin')
    }
    
    onPush() {
      console.log('pushed')
    }
    
    // state hooks

    onOpened() {
      console.log('its open')
    }
    
    onClosed() {
      console.log('now closed')
    }
  }
}
```

then: 

```js
const turnstile = new Turnstile()

turnstile.coin()
// - got a coin
// state: opened
// - its open


turnstile.push()
// - pushed
// state: closed
// - now closed
```

### Transition cancellations

Transition hooks may cancel thex transition by explicitly returning  `false`.

- A cancelled transition does not change the *state*.  
- The `state hook` method is not called.


> example: the following turnstile only works with `50c` coins:

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  onCoin(coin) {
    return coin >= 50
  }
}

const turnstile = new Turnstile()

turnstile.coin(30)
// state: closed 
// - state didnt change,
//   still closed!

turnstile.coin(50)
// state: opened
// - now it did ...
```

> note: cancellations must return `false`, not "falsy" values.

## Passing arguments 

Transition methods can pass arguments to relevant hooks, assumed to be
variadic: [^2]

```js
class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  onCoin(one, two) {
    return console.log(one, two)
  }
}

const turnstile = new Turnstile()

turnstile.coin('foo', 'bar')

// foo, bar

```

## Asynchronous transitions

The exact same process, just use exported `Async` FSMs and mark hooks
as [`async`][async] functions.

```js
import { Async as FSM } from '@nicholaswmin/fsm'

class Turnstile extends FSM {
  constructor() {
    super({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    })
  }
  
  async onCoin(coins) {
    // assume it's an async call ...
    await db('select * from....')
      
    // .. decided to cancel
    return false
  }
}

const turnstile = new Turnstile()

console.log(turnstile.state)
// state: closed
// - transition cancelled, 
//   state stays the same

await turnstile.coin()
// state: closed
```

> note: transition hooks *must* be marked as `async` & properly `await`-ed.

### Serialising to JSON

Business as-usual, with [JSON.stringify][JSON.stringify]:

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

  onCoin() {
    console.log('pushed ..')
  }
}

const turnstile = new Turnstile()

turnstile.coin()
// got a coin ..
// state: opened

const json = JSON.stringify(turnstile)
// save it somewhere ..
```

... & revive using `<FSM>.parse(json)`:

```js
const revived = Turnstile.parse(json)
// state: opened 

revived.push()
// pushed ..
// state: closed
```

> note: `<FSM>.parse` is a placeholder.  
>
> Use the subclass you captured the `json` from to parse it back. 
> i.e: `Turnstile.parse`, or `Elevator.parse` etc ... 


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


### `fsm.state` 

The current `state`. Read-only.    
Available on `this`.

| name     | type     | default       |
|----------|----------|---------------|
| `state`  | `string` | current state | 

### `static FSM.onInvalid` 

Called when an invalid transition is fired, 
providing behaviour for invalid transitions.  

Can be overriden, which configures the invalid behaviour.

| name        | type       | desc.             | default        |
|-------------|------------|-------------------|----------------|
| `onInvalid` | `function` | invalid behaviour | `return false` |

#### Arguments

| name         | type       | desc.             |
|--------------|------------|-------------------|
| `transition` | `String`   | transition name   |


### `static FSM.parse(json)` 

Deserialise/revive an instance from it's [JSON][json].   
You can serialise an instance using: `JSON.stringify(fsm)`


#### Arguments

| name     | type     | desc.                             | default  |
|----------|----------|-----------------------------------|----------|
| `json`   | `string` | result of `JSON.stringify(fsm)`   | required |

> note: use subclassing so you won't ever need to pass a `hooks` argument

> note: use the correponding `ChildClass.parse` when deserialising.

### `JSON.stringify(<fsm>)`

#### Arguments

| name      | type  | desc.                                  |
|-----------|-------|----------------------------------------|
| `<fsm>`   | `FSM` | An `FSM` instance                      |
| ...       | ...   | rest of `JSON.stringify` arguments ... |

Returns a [JSON][json] of the FSM.

```js
const turnstile = new Turnstile()

turnstile.coin()

// { "name":"Turnstile", "states": {"closed ...
```

> `json.name` can be used for looking-up the correct class for parsing.


## Validations

This implementation attempts to shift errors at *contruction time* rather 
than *run time*.  

It does so by validating it's state-transition table against `undefined`, 
invalidly typed or unreasonable inputs.
Validation errors contain exact paths and clear, unambiguous descriptions of 
the error.

Additionally, this implementation freezes it's internals to guard against
accidental modifications by reference, via it's arguments. 

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
      
      This documentation specifically avoids formal terminology from   
      Automata Theory because it's really just a bunch of outdated terms  
      that tend to make simple concepts sound much harder than they are.
    
      *"automaton"* is the academic term from automata theory meaning 
      *"automatic machine"*.

[^2]: Simply means it takes an infinite number of arguments.    
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
[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[workers]: https://nodejs.org/api/worker_threads.html
[mixin]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends#mix-ins

[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
