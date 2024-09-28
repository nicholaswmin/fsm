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

This implementation constructs simple, robust & expressive FSMs.   

Minimal, bundles `~ 850 bytes` without dependencies.  

- [Usage](#usage)
- [Basic Example](#example)
- [Existing objects to FSMs](#converting-existing-objects-to-fsms)
- [Minimal API](#minimal-api)
- [Transition methods](#transition-methods)
  * [Invalid transitions](#invalid-transitions)
  * [Custom invalid behaviour](#custom-invalid-behaviour)
- [Hooks](#hooks)
  * [Transition hooks](#hooks)
    + [Transition cancellations](#transition-cancellations)
  * [State hooks](#hooks)
  * [Passing arguments](#passing-arguments)
- [Asynchronous transitions](#asynchronous-transitions)
- [Serialising & Deserialising](#serialising-to-json)
- [API specs](#api)
  * [`fsm(states, hooks)`](fsmstates-hooks)
  * [`fsm(json, hooks)`](#fsmjson-hooks)
  * [`fsm.state`](#fsmstate)
  * [`JSON.stringify(fsm)`](#jsonstringifyfsm)
  * [`mixin.onInvalid`](#mixinoninvalid)
- [Validations](#validations)
- [Tests](#test)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Usage 

```bash
npm i @nicholaswmin/fsm
```

## Example

> example: modelling a [turnstile mechanism][turn]

```js
import { fsm } from '@nicholaswmin/fsm'

const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.coin()
// state: opened

turnstile.push()
// state: closed

console.log(turnstile.state)
// "closed"
```

The above FSM simply expresses:

- If `state: closed` & `transition: coin` is triggered, set `state: opened`
- If `state: opened` & `transition: push` is triggered, set `state: closed`

## Converting existing objects to FSMs

The 2nd argument can take any existing `Object` & transform it into an FSM.

This feature allows classes/objects to behave like FSM's, even if they are 
already subclasses.

> example: A class behaving as both an `EventEmitter` & an `FSM`:

```js
import EventEmitter from 'node:events'
import { fsm } from './src/index.js'

class Turnstile extends EventEmitter {
  constructor() {
    super()
    fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, this) // pass `this` here
  }
}

// ... Turnstile is:

const turnstile = new Turnstile()

// ... an EventEmitter

turnstile.emit('foo', 'bar')

// ... and an FSM

turnstile.coin()

console.log(turnstile.state)
// "opened"
```

> this is a similar concept as using a [Mixin][mixin].

## Minimal API

An FSM will always expose the following API:

- A `state` property, reflecting the *current state*.
- Transition methods, for triggering *transitions* between states.

> example: transitioning between states

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

console.log(fsm.state) 
// "closed"

// trigger a transition
fsm.coin() 

console.log(fsm.state) 
// "opened"

// trigger another transition
fsm.push() 
  
console.log(fsm.state) 
// "closed"
```

## Transition methods

They are automaticaly created & named after the provided transitions, 
which renders an expressive & domain-specific API.

For example, the following FSM: 

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

... specifies 2 transitions: 

- `coin`  
- `push`

... this creates 2 identically-named methods:

```js
turnstile.coin()
// state: opened

turnstile.push()
// state: closed
```

... for triggering those transitions.

## Invalid transitions

Triggering a transition that's not listed under the current state:

- returns `false`
- the state does not change  
- no hook methods are run

> example: state `closed` only lists a `coin` transition, so attempting 
> `push` while `state:closed` is invalid:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

console.log(turnstile.push())
// false
// state: 'closed'
```

> the transition was invalid so the `state` did not change.

## Custom invalid behaviour

The invalid behaviour can be configured by passing an object implementing 
an `onInvalid` method.

> Example: throw an `Error` instead of silently ignoring the invalid 
> transition:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onInvalid: function() {
    throw Error(`cannot ${transition} from ${this.state}`)
  }
})

turnstile.push()
// Error: cannot push from: closed
```

... `onInvalid` accepts variadic arguments: [^2]

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onInvalid: function(transition, arg1, arg2) {
    console.log(arg1, arg2)
  }
})

turnstile.push('foo', 'bar')
// foo, bar
```

## Hooks

Hooks are optional methods, called at specific transition phases,   
optionally altering the transition behavior.

There's 2 types of hooks.

### *Transition hooks*

- Called *before* the state is changed.
- Can optionally [cancel a transition](#transition-cancellations)
- Follow naming convention: `on<transition-name>`, where `<transition-name>`
  is the actual transition name.

i.e:

- transition: `coin` calls method `onCoin`
- transition: `push` calls method `onPush`

### *State hooks*

- Called *after* the state is changed.
- Follow naming convention: `on<state-name>`, where `<state-name>`
  is the actual state name.

i.e:

- state `opened` calls method `onOpened`
- state `closed` calls method `onClosed`

### Example

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  // transition hooks

  onCoin: function() {
    console.log('got a coin')
  },
  
  onPush: function() {
    console.log('pushed')
  },
  
  // state hooks

  onOpened: function() {
    console.log('its open')
  },
  
  onClosed: function() {
    console.log('now closed')
  }
})

turnstile.coin()
// - got a coin
// state: opened
// - its open


turnstile.push()
// - pushed
// state: closed
// - now closed
```

## Transition cancellations

Transition hooks can cancel the transition by explicitly returning `false`.

- A cancelled transition does not change the *state*.  
- The `state hook` method is not called.

> example: the following turnstile only works with `50c` coins:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin(coin) {
    return coin >= 50
  }
})

turnstile.coin(30)
// state: closed, no change

turnstile.coin(50)
// state: opened, changed
```

> note: cancellations must return `false`, not "falsy" values.

## Passing arguments 

Transition methods can pass arguments to relevant hooks, assumed to be
variadic: [^2]

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin(one, two) {
    return console.log(one, two)
  }
})

turnstile.coin('foo', 'bar')
// foo, bar
```

## Asynchronous transitions

Just mark any passed async methods as [`async`][async] 
or return a [`Promise`][promise].

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  async onCoin(coins) {
    // some async call ...
    await db('select * from....')
      
    // .. decided to cancel
    return false
  }
})

turnstile.coin('foo', 'bar')
// foo, bar

console.log(turnstile.state)
// state: closed
// - transition cancelled, 
//   state stays the same

await turnstile.coin()
// state: closed
```

## Serialising to JSON

Simply use `JSON.stringify(fsm)`:

```js
// pull hooks in own object,
// for reuseing when reviving
const hooks = {
  onCoin() { console.log('got a coin') }
  onPush() { console.log('pushed ...') }
}

const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, hooks)

turnstile.coin()
// state: opened

const json = JSON.stringify(turnstile)
// save it somewhere ..
```

... revive using `fsm(json)`:

```js
const revived = fsm(json, hooks)
// state: opened 

revived.push()
// state: closed
```

## API Specs

### `fsm(states, hooks)`

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

### `fsm(json, hooks)` 

Deserialise/revive an instance from it's [JSON][json].   
You can serialise an instance using: `JSON.stringify(fsm)`

#### Arguments

| name     | type     | desc.                             | default  |
|----------|----------|-----------------------------------|----------|
| `json`   | `string` | result of `JSON.stringify(fsm)`   | required |

### `fsm.state` 

The current `state`. Read-only.    
Available on `this`.

| name     | type     | default       |
|----------|----------|---------------|
| `state`  | `string` | current state | 

### `mixin.onInvalid` 

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


### `JSON.stringify(<fsm>)`

#### Arguments

| name      | type  | desc.                                  |
|-----------|-------|----------------------------------------|
| `<fsm>`   | `FSM` | An `FSM` instance                      |
| ...       | ...   | rest of `JSON.stringify` arguments ... |

Returns a [JSON][json] of the FSM.

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

JSON.stringify(turnstile)

// {"state":"closed","states":{"closed" ... }
```

## Validations

This implementation attempts to shift errors at *contruction time* rather 
than *run time*.  

It does so by validating it's state-transition table against `undefined`, 
invalidly typed or unreasonable inputs.
Validation errors contain exact paths and clear, unambiguous descriptions of 
the error.

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

[^1]: While there are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm],   
      this documentation describes a specific type of state machine,
      the [*Deterministic finite automaton*][dfsm] which exists in only 1 state.
      
      Formal terminology from Automata Theory is avoided; it's confusing
      for the average reader and tends to make simple concepts sound harder 
      than they are.
    
      *"automaton"* is the academic term from automata theory meaning 
      *"automatic machine"*.

[^2]: Describes a function that takes an non-finite/infinite no of arguments.   
      Also called functions of *"n-arity"* where "arity" = number of arguments. 
      
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
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[workers]: https://nodejs.org/api/worker_threads.html
[mixin]: https://developer.mozilla.org/en-US/docs/Glossary/Mixin

[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
