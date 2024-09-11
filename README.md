[![tests][testb]][tests] [![cov][covb]][cov]

# fsm

> a [finite-state machine][fsm] 

> A state machine, is a mathematical model of computation.  
> It is an abstract machine that can be in one of a finite number of
> *states* at any given time.   
> The change from one state to another is called a *transition*.

Finite-state machines are a practical method to express a piece of logic 
**declaratively**, in a structured & concise manner that even a 5-year old can 
understand.

By definition, a state machine can only be in *one, always-valid*[^1] state at 
any  given time, which renders it inherently safe, by-design.

This implementation:

- is remarkably small. `~ 850 bytes`, zero dependencies.
- has a minimal API. Does one-thing, one-thing only and does it well.
- has strict validations & a comprehensive test-suite.
- allows synchronous and asynchronous transitions.

Used in production at [Bitpaper][profs], open-sourced here.

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

## Transition Methods & Hooks

Transition methods and hooks are automatically created from the provided 
`input`.  

This renders an expressive & idiomatic API, dictated by the input you provide 
upon instantiation.

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

2 *transition hooks*  
> called when transition is triggered, but *before* the state changes:

```js
turnstile.onInsertCoin = () => console.log('coin dropped!')
turnstile.onPush = () => console.log('turnstile pushed!')
```

> note: lambdas/arrow functions lexically bind their `this` value, so if you 
> need to read i.e: `this.state` from within a hook you *must* use a regular 
> `function`.

2 *state hooks*  
> called when the transition completes, *after* the state changes:

```js
turnstile.onLocked = () => console.log('turnstile locked!')
turnstile.onUnlocked = () => console.log('turnstile unlocked!')
```

### Arguments 

The transition methods allow variadic[^2] arguments to the relevant transition 
hooks:

```js
turnstile.insertCoin('foo', 'bar')

turnstile.onInsertCoin = (arg1, arg2) => console.log(arg1, arg2)
// foo, bar

turnstile.onUnlocked = (arg1, arg2) => console.log(arg1, arg2)
// foo, bar
```

## Rejecting a state change

A transition hook can optionally reject a state change by explicitly returning
`false`.

```js
turnstile.onCoin = coins => coins.length < 5

turnstile.insertCoin([5, 5, 5])

// state: 'locked' 
// change was cancelled

turnstile.insertCoin([5, 5, 5, 5, 5])

// state: 'unlocked'
```

## `async/await`

Asynchronous FSMs can be constructed from the exported `Async` FSM:

```js
import { Async as FSM } from '@nicholaswmin/fsm'

const turnstile = new FSM({
  locked:   { insertCoin: 'unlocked', push: 'locked' },
  unlocked: { insertCoin: 'unlocked', push: 'locked' }
})

turnstile.onCoin = async coins => {
  await db('select * from....'') // an async call, whatever ...
  
  return false
}

console.log(turnstile.state)
// initial state: locked

await turnstile.addCoin()
// state: unlocked

turnstile.push()
// state: locked
```

## Docs 

### `new FSM(states, ctx)`

Construct an `FSM`

| name     | type     | desc.                           | default  |
|----------|----------|---------------------------------|----------|
| `states` | `object` | a [state-transition table][stt] | required |
| `ctx`    | `object` | implements transition `runs`    | `this`   |

> 1st state is set as the *initial* state.  


### `.state` 

The current `state`.  
Read-only.

... and that's all. 

## Guards

This implementation attempts to shift errors at *contruction-time* rather 
than give you a nasty surprise at *run-time*.

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

Follows [Semver][sv], [Conventional Commits][ccom]

- must have > 90% unit-test coverage.
- must have > 85% mutation-tests score.
- must not have any runtime dependencies.
  - should not have any dev. dependencies.
- must be < 1000 bytes, gzipped.

> "must", "must not", "should" etc. follow [RFC:2119][rfc2119].

## Authors

[@nicholaswmin][author]

## License 

[The MIT License][license]

[testb]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml/badge.svg
[tests]: https://github.com/nicholaswmin/fsm/actions/workflows/tests.yml

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
      called [*Non-deterministric finite automatons*][ndfsm], where *automaton*
      is just a fancy term from automata theory for "automatic machine".    
      This documentation is concerned about a specific variant of state machine, 
      the [*Deterministic finite automaton*][dfsm] which can only exist in 
      one-state at any point in time.

[^2]: Fancy word for: "takes an infinite number of arguments".   
      Also called function of "n-arity" where "arity" = number of arguments.   
      i.e: nullary: `f = () => {}`, unary: `f = x => {}`,   
      binary: `f = (x, y) => {}`, ternary `f = (a,b,c) => {}` ...   
      n-ary/variadic: `f = (...args) => {}`
