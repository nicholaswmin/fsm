[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

Finite-state machines are a practical method to express a piece of logic 
*declaratively*, in a structured and concise manner that even a 5-year old can 
understand.

Additionally, state machines can only exist in *one, always-valid* state at any 
given time, which renders them inherently safe, by design.[^1]

This implementation is remarkably small, extremely simple and robust.   
Does one thing, one thing only & does it well.

Used in production at [Bitpaper][profs].

## Install 

`~ 850 bytes`, no dependencies

```bash
npm i @nicholaswmin/fsm
```

## Example

> canonical FSM example, a [turnstile mechanism][turn]

```js
// or `{ Async as FSM }` for the `async` version
import { Sync as FSM } from '@nicholaswmin/fsm'

const turnstile = new FSM({
  locked:   { insertCoint: 'unlocked', push: 'locked' },
  unlocked: { insertCoint: 'unlocked', push: 'locked' }
})

console.log(turnstile.state)
// initial state: locked

turnstile.insertCoin()
// state: unlocked

turnstile.push()
// state: locked
```

## Transition methods

Transition methods and hooks are automatically created from the provided 
`states`, which renders an expressive & domain-specific API.

For example, this input: 

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
})
```

creates an FSM with: 

2 *transition methods*  
> allow transitions from one state to another, if allowed from current state.

```js
turnstile.insertCoin()
// state: 'unlocked'

turnstile.push()
// state: 'locked'
```

## Transition hooks

2nd argument accepts an object implementing transition/state-change hooks.

These hooks are called in specific transition phases & can optionally alter
the behavior of the transition.

For the same example:

```js
locked:   { insertCoin: 'unlocked', push: 'locked' },
unlocked: { insertCoin: 'unlocked', push: 'locked' }
```

adds:

2 *transition hooks*  
> called when transition is triggered, but *before* the state changes:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: () => console.log('coin dropped!'),
  onPush: () => console.log('pushed!')
})
```

2 *state hooks*  
> called when the transition completes, *after* the state changes:

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onLocked: () => console.log('locked!'),
  onUnlocked: () => console.log('unlocked!')
})
```

> note: lambdas/arrow functions lexically bind their `this` value, so if you 
> need to read i.e: `this.state` from within a hook you *must* use a regular 
> `function`.


### Method arguments 

The transition methods allow variadic[^2] arguments to the relevant transition 
hooks:

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

## Cancelling transitions

A transition hook can optionally *cancel* a transition by explicitly returning
`false`.

```js
const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
}, {
  onInsertCoin: () => coins => coins.length < 5
})

turnstile.insertCoin([5, 5, 5])
// onInsertCoin() returned false, 
// state: stays 'locked'

turnstile.insertCoin([5, 5, 5, 5, 5])
// onInsertCoin() returned `true`, 
// state: 'unlocked'
```

> note: the transition hook must explicitly return `false`, not a falsy value.  
> i.e `undefined` or `0` are falsy but not `false`.

## `async/await`

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

## Contributing

- must follow [Semver][sv], should follow [Conventional Commits][ccom].
- must have > 95% unit-test coverage, > 85% mutation-tests score.
- must not have any runtime dependencies, should not have any dev. dependencies.
- must be < 1000 bytes, gzipped.

> "must", "must not" etc. follow [RFC:2119][rfc2119].

### Build 

Bundle to `dist/`

```bash 
node --run build
```

### Lint

```bash 
node --run lint
```

## Authors

[@nicholaswmin][author]

## License 

[The MIT License][license]

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
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt

[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/

[profs]: https://github.com/TheProfs
[author]: https://github.com/nicholaswmin
[license]: ./LICENSE

[^1]: There are variants of state machines which can have multiple states, 
      called [*Non-deterministic finite automatons*][ndfsm], where "automaton"
      is just a fancy term from automata theory for "automatic machine".    
      This documentation is concerned about a specific variant of state machine, 
      the [*Deterministic finite automaton*][dfsm] which can only exist in 
      one-state at any point in time.

[^2]: Fancy word for: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}`, 
      n-ary/variadic: `f = (...args) => {}`
