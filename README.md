[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> A [finite-state machine][fsm] is an abstract machine that can be in one of a 
> finite number of states.    
> The change from one `state` to another is called a `transition`.

This package constructs *stupidly-simple* FSM's which express their logic 
declaratively & safely.[^1]
  
`< 1KB`, zero dependencies & [provenance][prov].

### Basic

- [Install](#install)
- [Example](#example)
- [Usage](#usage)

### Advanced

- [FSM as a mixin](#fsm-as-a-mixin)
- [Hooks](#hook-methods)
- [Hook arguments](#hook-arguments)
- [Transition cancellations](#transition-cancellations)
- [Configurable error handling](#configurable-error-handling)
- [Asynchronous transitions](#asynchronous-transitions)
- [Serialising to JSON](#serialising-to-json)
  
### API

- [`fsm(states, hooks)`](#fsmstates-hooks)
- [`fsm(json, hooks)`](#fsmjson-hooks)
- [`fsm.state`](#fsmstate)
- [`hooks.onInvalid`](#hooksoninvalid)
- [`JSON.stringify(fsm)`](#jsonstringifyfsm)

### Meta

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

// 1) define an FSM

const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

// 2) trigger "coin" transition

turnstile.coin()
// state: opened

// 3) trigger "push" transition

turnstile.push()
// state: closed

// 4) log current state

console.log(turnstile.state)
// "closed"
```

## Usage

The following:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})
```

defines an FSM with 2 possible `states`, each allowing a single `transition`.

- `state: closed`: allows `transition: coin` which sets: `state: opened`
- `state: opened`: allows `transition: push` which sets: `state: closed`

Transitions are triggered by calling them as a method:

> i.e: assuming `foo`, `bar` transitions instead of `coin`, `push`:

```js
const turnstile = fsm({
  closed: { foo: 'opened' },
  opened: { bar: 'closed' }
})

turnstile.foo()
turnstile.bar()
```

Transitions that aren't listed under current `state` throw a `TransitionError`:

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

turnstile.push()
// TransitionError: 
// current state: "closed" has no transition: "push"
```

The current `state` can be read through `fsm.state`:

```js
const turnstile = fsm({
  closed: { foo: 'opened' },
  opened: { bar: 'closed' }
})

console.log(turnstile.state)
// "closed"
```

## FSM as a `mixin`

Passing an object as 2nd argument to: `fsm(states, obj)` sets FSM behaviour
on the provided object.

This is similar to using a [`mixin`][mixin], useful in cases like subclassing 
where further inheritance cannot be used to add FSM behaviours in addition 
to the extended behaviour.[^2]

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


## Hook arguments 

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

## Configurable error handling

The behaviour of invalid transitions can be configured by an `onInvalid` hook.

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

> note: the `transition` is set as 1st argument but
> additional arguments can be passed, [as shown above](#hook-arguments)

## Asynchronous transitions

Mark relevant hooks as [`async`][async] and `await` the transition:

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

Simply use [`JSON.stringify`][JSON.stringify]:

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

`states` must have the following abstract shape:

```js
state: { 
  transition: 'next-state',
  transition: 'next-state' 
},
state: { transition: 'next-state' }
```

- The 1st state in `states` is set as the *initial* state.    
- Each `state` can list zero, one or many transitions.   
- The `next-state` must exist as a `state`.  

### `fsm(json, hooks)` 

Revive an instance from it's [JSON][json].   

#### Arguments

| name     | type     | desc.                         | default  |
|----------|----------|-------------------------------|----------|
| `json`   | `string` | `JSON.stringify(fsm)` result  | required |

### `fsm.state` 

The current `state`. Read-only.    

| name     | type     | default       |
|----------|----------|---------------|
| `state`  | `string` | current state | 

### `hooks.onInvalid` 

Called when an invalid transition is triggered.  
Can be overriden, which configures the invalid behaviour.

| name        | type       | desc.             | default                  |
|-------------|------------|-------------------|--------------------------|
| `onInvalid` | `function` | invalid behaviour | throws `transitionError` |

#### Arguments

| name         | type       | desc.             |
|--------------|------------|-------------------|
| `transition` | `String`   | transition name   |


### `JSON.stringify(fsm)`

Returns a [JSON][json] of the FSM.

```js
const turnstile = fsm({
  closed: { coin: 'opened' },
  opened: { push: 'closed' }
})

JSON.stringify(turnstile)

// {"state":"closed","states":{"closed" ... }
```

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

[Contribution Guide][contr-guide]

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
      You haven't been decapitated by an elevator (yet) because it's sequence
      of operations is modelled as an FSM.

      Formally, this documentation describes a 
      [*Deterministic finite automaton*][dfsm] which exists in only 1 state.
      
      Formal terminology is unnecessarily complex for the purposes of this
      documentation therefore its intentionally avoided.  
      i.e: *"automaton"* is an academic term from [automata theory][automata] 
      meaning *"automatic machine"*.
      
[^2]: FSMs are rare but perfect candidates for *inheritance* because usually
      something `is-an` FSM.  
      However, Javascript doesn't support *multiple inheritance* so inheriting 
      `FSM` would create issues when inheriting other behaviours.

      *Composition* is also problematic since it namespaces the behaviour, 
      causing it to lose it's expressiveness.  
      i.e `light.fsm.turnOn` feels misplaced compared to `light.turnOn`.
      
[^3]: A function that accepts an infinite number of arguments.   
      Also called: functions of *"n-arity"* where "arity" = number of arguments. 
      
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/test.yml

[covb]: https://coveralls.io/repos/github/nicholaswmin/fsm/badge.svg
[cov]: https://coveralls.io/github/nicholaswmin/fsm

[ee]: https://nodejs.org/docs/latest/api/events.html#class-eventemitter
[turn]: https://en.wikipedia.org/wiki/Finite-state_machine#Example:_coin-operated_turnstile
[fsm]: https://en.wikipedia.org/wiki/Finite-state_machine
[stt]: https://en.wikipedia.org/wiki/State-transition_table
[dfsm]: https://en.wikipedia.org/wiki/Deterministic_finite_automaton
[ndfsm]: https://en.wikipedia.org/wiki/Nondeterministic_finite_automaton
[falsy]: https://developer.mozilla.org/en-US/docs/Glossary/Falsy
[async]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
[JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
[json]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
[mixin]: https://developer.mozilla.org/en-US/docs/Glossary/Mixin
[automata]: https://en.wikipedia.org/wiki/Automata_theory

[prov]: https://search.sigstore.dev/?logIndex=134861482
[contr-guide]: ./.github/CONTRIBUTING.md
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE
