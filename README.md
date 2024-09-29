[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  § 
> It is an abstract machine that can be in one of a finite number of `states`.  
> The change from one state to another is called a `transition`.

Finite-state machines are constructs which allow expressing a piece of logic 
[*declaratively*][declaratively].  

Minimal, `< 1KB` without dependencies, published with [provenance][provenance].

- [Install](#install)
- [Basic Example](#basic-example)
  + [Defining an FSM](#defining-fsms)
  + [Transitioning between states](#transitions-between-states)
  + [Getting the current state](#current-state)
- [Creating FSMs from existing objects](#creating-fsms-from-existing-objects)
- [Transition hooks](#transition-hooks)
- [State hooks](#state-hooks)
  * [Transition cancellations](#transition-cancellations)
  * [Passing arguments](#passing-arguments)
- [Asynchronous transitions](#asynchronous-transitions)
- [Serialising to JSON](#serialising-to-json)
- [API](#api)
  * [`fsm(states, hooks)`](#fsmstates-hooks)
  * [`fsm(json, hooks)`](#fsmjson-hooks)
  * [`fsm.state`](#fsmstate)
  * [`JSON.stringify(fsm)`](#jsonstringifyfsm)
  * [`hooks.onInvalid`](#hooksoninvalid)
- [Validations](#validations)
- [Tests](#test)
- [Contributing](#contributing)
- [Authors](#authors)
- [License](#license)

## Install 

```bash
npm i @nicholaswmin/fsm
```

## Basic example

> example: modelling a [turnstile][turn] mechanism as an FSM.

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

### Defining FSMs

FSMs must define a [state-transition table][stt] upfront.

In our case, it's an object which:

- Lists possible `states`.
- Each `state` lists it's allowed `transitions`.
- Each `transition` points to a new `state`.

and has the following shape:

```js
{
  stateA: { transitionB: 'stateB' },
  stateB: { transitionA: 'stateA' }
}
```

> A concrete example: 
> the [turnstile][turn] gate:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

This turnstile: 

- Has 2 possible *states*: `closed` or `opened`. 
- Has 2 possible *transitions*: `coin` and `push`.  
- Starts out with `state: closed`

and these rules:

When `state: closed`:
- Can trigger `coin` transition, moving it to: `state: opened`.

When `state: opened`:
- Can trigger `push` transition, moving it to: `state: closed`.

### Transition between states

A *transition* can be triggered by calling it as a method.   
i.e: `fsm.coin()` triggers the `coin` transition.

If the `current state` **lists the transition**, the transition completes and 
the state succesfuly changes:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
// state: closed

// triggering the "coin" transition
turnstile.coin()

// state: opened

// good!
```

If a triggered transition **is not listed** under the `current state`, the 
`transition` is silently cancelled & the `state` stays the same:

```js
const turnstile = fsm({
  broken: { glue: 'closed' },
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
// state: broken 

// triggering the "coin" transition

turnstile.coin()

// does nothing ...

console.log(turnstile.state)
// state: broken

// oops, state is still "broken"
```

The transition behaviour [can be customised](#custom-invalid-behavior)

## Transform existing objects to FSMs

Subclasses which `extend` other classes, cannot use further inheritance to 
implement FSM behaviours since multiple inheritance is not supported in JS.[^2]

In these cases you can pass the object as 2nd argument of: `fsm(stable, obj)` 
and the FSM setup will take place on the provided object instead of an 
internal one.

> example: `Turnstile` below functions as both an [`EventEmitter`][ee] & `FSM`:

```js
class Turnstile extends EventEmitter {
  constructor() {
    super()

    fsm({
      closed: { coin: 'opened' },
      opened: { push: 'closed' }
    }, this)
  }
}

const turnstile = new Turnstile()

// works as EventEmitter.

turnstile.emit('foo')

// works as an FSM as well.

turnstile.coin()

// state: opened
```

> the above is a similar concept to using a [Mixin][mixin].

## Custom invalid behaviour

The invalid behaviour can be configured by passing an object which implements 
an `onInvalid` method.

> example: throw a `RangeError` if triggered transition is not allowed under 
> current state.

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onInvalid: function(transition) {
    throw RangeError(`cannot ${transition} from ${this.state}`)
  }
})

turnstile.push()
// RangeError: cannot push from: closed
```

... `onInvalid` accepts variadic arguments: [^3]

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

## Hook methods

Hooks are optional methods, called at specific transition phases.  

Pass an object implementing hook methods as 2nd parameter of `fsm(stable, obj)`:

## Transition hooks

- Called *before* the state is changed.
- Can [cancel a transition](#transition-cancellations).

Must be named: `on<transition-name>`, replacing `<transition-name>` with the 
actual transition name.

> example: implementing both transition hooks:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onCoin: function() {
    console.log('got a coin')
  },
  
  onPush: function() {
    console.log('got pushed')
  }
})

turnstile.coin()
// "got a coin"

turnstile.push()
// "got pushed"
```

## State hooks

- Called *after* the state is changed.

Must be named: `on<state-name>`, replacing `<state-name>` with the state name.

> example: implement both state hooks:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onOpened: function() {
    console.log('its open')
  },

  onClosed: function() {
    console.log('its closed')
  }
})

turnstile.coin()
// "its open"

turnstile.push()
// "its closed"
```

## Transition cancellations

Transition hooks can cancel the transition by explicitly returning `false`.

- Cancelled transitions don't change the *state*.  
- Subsequent `state hook` methods are not called.

> example: a turnstile requiring `50c` coins 
> to let people through:

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
// state: closed

// state still "closed",

// add more money?

turnstile.coin(50)
// state: opened
```

> note: cancellations require returning `false`, not just "falsy".

## Passing arguments 

Transition methods can pass arguments to relevant hooks, assumed to be
variadic: [^3]

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

Either mark methods as [`async`][async] or return a [`Promise`][promise].  

Then simply: `await fsm.transition()`.

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  async onCoin(coins) {
    // 2 second async delay ...
    await new Promise(res => setTimeout(res, 2000))
  }
})

await turnstile.coin()
// waiting 2 seconds ...

// state: closed
```

## Serialising to JSON

Use `JSON.stringify(fsm)` to convert to JSON:

```js
// set hooks in own object now,
// for reusing when reviving
const hooks = {
  onCoin() { console.log('got a coin') }
  onPush() { console.log('pushed ...') }
}

const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, hooks)

turnstile.coin()
// got a coin
// state: opened

const json = JSON.stringify(turnstile)
// save it somewhere ..
```

### Reviving from JSON

... and revive using `fsm(json)`:

```js
const revived = fsm(json, hooks)
// state: opened 

revived.push()
// pushed ..
// state: closed
```

## API

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

### `hooks.onInvalid` 

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

This implementation attempts to catch errors at *contruction time* rather 
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
      
[^2]: Javascript does not support multiple inheritance.  
      This is usually for the better, since it tends to create inflexibly 
      strong relationships; but there are still cases where it's the most 
      appropriate choice.
      
[^3]: Describes a function that takes an non-finite/infinite no of arguments.   
      Also called functions of *"n-arity"* where "arity" = number of arguments. 
      
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm

[declaratively]: https://en.wikipedia.org/wiki/Declarative_programming
[ee]: https://nodejs.org/docs/latest/api/events.html#class-eventemitter
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
[provenance]: https://search.sigstore.dev/?logIndex=134861482

[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
