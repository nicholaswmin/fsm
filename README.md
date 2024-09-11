[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

Finite-state machines are a practical method to express a piece of logic 
*declaratively*, in a structured and concise manner that even a 5-year old can 
understand. They can only exist in *one, always-valid* state at any given time, 
which renders them inherently safe, by design.[^1]

This implementation is remarkably small, minimal, well-tested & robust.  

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
  locked:   { insertCoint: 'unlocked', push: 'locked' },
  unlocked: { insertCoint: 'unlocked', push: 'locked' }
})

// state: locked

turnstile.insertCoin()
// state: unlocked

turnstile.push()
// state: locked
```

## Transition methods

Transition methods and hooks are automatically created from the provided 
`states`, which renders an expressive & domain-specific API.

For example, this: 

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
})
```

creates an FSM with these methods:

```js
turnstile.insertCoin()
// state: 'unlocked'

turnstile.push()
// state: 'locked'
```

### Non-allowed transitions

Attempting to trigger a transition which isn't allowed under the current
state will throw an `Error`.


```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked' },
  unlocked: { push: 'locked' }
})

turnstile.push()
// Error: 'push' now allowed in `state:locked`

turnstile.insertCoin()
// state: unlocked 

turnstile.push()
// state: locked
```

transition methods are chainable:

```js
turnstile.insertCoin().push()
```

## Hooks

The 2nd argument accepts an object implementing hook methods.  
Hooks are called at specific transition phases, optionally altering the 
transition behavior.

Same example:

```js
locked:   { insertCoin: 'unlocked', push: 'locked' },
unlocked: { insertCoin: 'unlocked', push: 'locked' }
```

### Transition hooks 
 
> called when transition is triggered, *before* the state changes:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: () => console.log('coin dropped!'),
  onPush: () => console.log('pushed!')
})
```

### State hooks 

> called when a transition completes, *after* the state changes:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onLocked: () => console.log('locked!'),
  onUnlocked: () => console.log('unlocked!')
})
```

> note: lambda functions lexically bind their `this` value, so if you need to 
> read i.e: `this.state` from within a hook you *must* use a regular 
> `function`:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: function() {
    console.log('current state', this.state)
  }
})
```

## Transition cancellations

Transition hooks can *cancel* a transition by explicitly returning `false`.

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: () => coins => coins.length < 5
})

turnstile.insertCoin([5, 5, 5])
// state: still 'locked'

turnstile.insertCoin([5, 5, 5, 5, 5])
// state: 'unlocked'
```

> note: `undefined` or `0` are falsy values but not `false`.

## Arguments 

Transition methods can pass variadic arguments to relevant hooks:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: () => console.log('coin', arg1, arg2)
})

turnstile.insertCoin('foo', 'bar')

// 'coin', 'foo', 'bar'

```

## Asynchronous transitions

Asynchronous FSMs can be constructed from the exported `Async` FSM:

```js
import { Async as FSM } from '@nicholaswmin/fsm'

const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  async onCoin: coins => {
    // a whatever async call ...
    await db('select * from....'')
    
    return false
  }
})

console.log(turnstile.state)
// initial state: locked

await turnstile.addCoin()
// state: unlocked

turnstile.push()
// state: locked
```

## API 

### `new FSM(states, ctx)`

Construct an `FSM`

| name     | type     | desc.                           | default  |
|----------|----------|---------------------------------|----------|
| `states` | `object` | a [state-transition table][stt] | required |
| `ctx`    | `object` | implements transition hooks     | `this`   |

> 1st state is set as the *initial* state.  

### `.state` 

The current `state`.  
Read-only.

... and that's all. 

## Guards

This implementation attempts to shift errors at *contruction-time* rather 
than *run-time*.  
It does so by validating it's state-transition table against `undefined`, 
invalidly-typed or unreasonable `states` inputs.

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

## Footnotes 

[^1]: There are variants of state machines which can have multiple states, 
      i.e the [*Non-deterministic finite automaton*][ndfsm], where "automaton"
      is just a fancy term from automata theory for "automatic machine".    
      This documentation describes a specific type of state machine, the 
      [*Deterministic finite automaton*][dfsm] which can only exist in 1 state.

[^2]: Fancy word for: "takes an infinite number of arguments".   
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
