[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] is an abstract machine that can be in one of 
> a finite number of `states`.   
> The change from one `state` to another `state` is called a `transition`.

This package constructs simple FSM's that express their
logic [*declaratively*][declaratively] & *safely*.[^1]
    
Bundles `< 1KB`, zero dependencies, published with [provenance][provenance].

### Basic

- [Install](#install)
- [Example](#example)

### Advanced

- [Transform existing objects to FSMs](#transform-existing-objects-to-fsms)
- [Hooks](#hook-methods)
- [Cancellations](#transition-cancellations)
- [Passing arguments](#passing-arguments)
- [Custom invalid behaviour](#custom-invalid-behaviour)
- [Asynchronous transitions](#asynchronous-transitions)
- [Serialising to JSON](#serialising-to-json)
  
### API

- [`fsm(states, hooks)`](#-fsm-states--hooks--)
- [`fsm(json, hooks)`](#-fsm-json--hooks--)
- [`fsm.state`](#-fsmstate-)
- [`hooks.onInvalid`](#-hooksoninvalid-)
- [`JSON.stringify(<fsm>)`](#-jsonstringify--fsm---)

### Meta

- [Validations](#validations)
- [Test](#test)
- [Authors](#authors)
- [License](#license)

## Install 

```bash
npm i @nicholaswmin/fsm
```

## Example

> A [turnstile][turn] that unlocks with a coin.  
> When unlocked you can push through it after which it locks again:

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

The above defines 2 possible `states`, each allowing a single `transition`:

- `state: closed`: allows `transition: coin` which sets: `state: opened`
- `state: opened`: allows `transition: push` which sets: `state: closed`

> note: a `state` can have zero, one, or many `transitions`.

Transitions are triggered by calling them as a method:

> i.e: assuming `foo`, `bar` transitions instead of `coin`, `push`:

```js
const turnstile = fsm({
  closed: { foo: 'opened' },
  opened: { bar: 'closed' }
})

// state: closed
turnstile.foo()
// state: opened
turnstile.bar()
// state: closed
```

The *current* `state` can be read via the `fsm.state` property:

```js
const turnstile = fsm({
  closed: { foo: 'opened' },
  opened: { bar: 'closed' }
})

console.log(turnstile.state)
// "closed"
```

Triggering a `transition` that's not listed in current `state` will 
throw an `InvalidTransitionError`:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()

// InvalidTransitionError: 
// current state: "closed" has no transition: "push"
```

The invalid behaviour can be [customised](#custom-invalid-behaviour).

## Transform existing objects to FSMs

You can pass your own objects to setup as FSM's.

Some cases, for example subclasses which `extend` other classes, 
cannot use further inheritance to implement FSM behaviours in addition to their
current behaviour, since multiple inheritance is not supported in JS.[^2]

In these cases (or similar others), pass the object as 2nd argument 
of: `fsm(states, obj)` & the FSM will be setup on the provided object.

> example: A `Turnstile` functioning as both an [`EventEmitter`][ee] & an `FSM`:

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

## Hook methods

Hooks are optional methods, called at specific transition phases.  

They must be set as `hooks` methods; the 2nd argument of `fsm(states, hooks)` & 
named accordingly.

## Transition hooks

Called *before* the state is changed & can optionally 
[cancel a transition](#transition-cancellations).

Must be named: `on<transition-name>`, where `<transition-name>` is an actual 
`transition` name.

> example:

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

Called *after* the state is changed.

Must be named: `on<state-name>`, where `<state-name>` is an actual `state` name.

> example:

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

Transition hooks can cancel the transition by returning `false`.

Cancelled transitions don't change the *state* nor call any `state hooks`.

> cancel transition to `state: opened` if the coin is less than `50c`:

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

> note: cancellations must explicitly return `false`, not just [`falsy`][falsy].

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


## Custom invalid behaviour

The invalid behaviour can be configured by implementing an `onInvalid` hook:

> example: log a warning & fail silently, without throwing an `Error`:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  onInvalid: function(transition) {
    console.warn(`cannot ${transition} from ${this.state}`)
    
    return false
  }
})

turnstile.push()
// warning: cannot push from: closed
// false
```

It also accepts variadic arguments: [^3]

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

## Asynchronous transitions

Either mark methods as [`async`][async] or return a [`Promise`][promise].  

Then simply `await` the transition:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
}, {
  async onCoin(coins) {
    await new Promise(res => setTimeout(res, 2000))
  }
})

await turnstile.coin()
// 2 seconds pass ...

// state: closed
```

## Serialising to JSON

Convert to JSON using `JSON.stringify`:

```js
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

const json = JSON.stringify(turnstile)
```

... then revive with:

```js
const revived = fsm(json, hooks)
// state: opened 

revived.push()
// pushed ..
// state: closed
```

> note: `hooks` are not serialised so they must be passed again when reviving, 
> as demonstrated above.

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

This is feature-complete but for any bug/security fixes, read:

[Contribution guide][contr-guide]

## Authors

[@nicholaswmin][author]

## License 

[The MIT License][license]

### Footnotes 

[^1]: A finite-state machine can only exist in *one* and *always-valid* state.  
      It requires defining all possible states & the rules under which it can 
      transition from one state to another.

      Software in safety-critical industries *require* the use of FSM models 
      as part of their certification.  
      You haven't been decapitated by an elevator (yet) because it's FSM model 
      does not allow transitions to `state: moving` unless `state: door-closed`.

      While there are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm],   
      this documentation describes the most common type of state machine,
      the [*Deterministic finite automaton*][dfsm] which exists in only 1 state.

      *"automaton"* is an academic term from [automata theory][automata] meaning 
      *"automatic machine"*, plural: *"automata"*.  
      Formal terminology is unnecessarily complex for the purposes of this
      documentation therefore its intentionally avoided.
      
[^2]: Javascript does not support *multiple inheritance*, a commonly misused 
      mechanism that easily leads to various modelling issues.
      
      Composition, the usual alternative, namespaces the API of the composited 
      behaviour which doesn't feel idiomatic when it comes to FSMs.
      
[^3]: Describes a function that takes an non-finite/infinite no. of arguments.   
      Also called: functions of *"n-arity"* where "arity" = number of arguments. 
      
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
[falsy]: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[workers]: https://nodejs.org/api/worker_threads.html
[mixin]: https://developer.mozilla.org/en-US/docs/Glossary/Mixin
[automata]: https://en.wikipedia.org/wiki/Automata_theory

[provenance]: https://search.sigstore.dev/?logIndex=134861482
[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
