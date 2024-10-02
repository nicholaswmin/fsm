# Contributing

- [Conventions](#conventions)
- [Publishing](#publishing)
- [Design philosophy](#design-philosophy)
  - [Zero Maintenance](#zero-maintenance)
  - [Minimal API](#minimal-api)
  - [Robust](#robust)

## Conventions

- [Github Flow][gh-flow]
- [Conventional Commits][ccom]
- [Semver][sv]

## Publishing

Publish a [Github Release][gh-rel].   
It auto-publishes to [npm][npm] with build [provenance][provenance].

> example: publishing a new release:

```bash
gh release create v1.7.1
```

> note: use the version as a release title.

Current releases can be listed using:

```bash
gh release list
```

## Design goals

The following are goals are central to this implementation:

- [Zero maintenance](#zero-maintenance)
- [Minimal API](#minimal-api)
- [Robust](#robust)

### Zero Maintenance  

> *safe* for long-term use without requiring any maintenance.   
> It should work without generating any warnings, security advisories etc.

- Must not have dependencies, in any form:
  - no runtime dependencies
  - no `devDependencies`
  - no 3rd party services, i.e: coveralls
- Must not use proposal-stage language features
- Should not use Node APIs, i.e: `fs`
- Must use `test-runner` thresholds for coverage
- Must add a README indicator of tests status
- CI tests on: 
  - `engine` Node version.
  - `latest` Node version.
- Should use Github Actions for CI

### Minimal API

> An API so simple, it doesn't need to be looked up twice.  
> Does that one thing, only; without any bells & whistles.

- Must satisfy the spec
- Must not implement extras
- Must not allow configuration
- Should be concise instead of detailed
- Must use native APIs where applicable:
  - i.e: Assume a feature i.e: *"Get instance `JSON`"*:
  - `JSON.stringify(fsm)` is idiomatic, well-known & easy to remember. Good.
  - `fsm.asJSON()` is specific to us, must be looked-up & memorised. Bad.

### Robust

> The package should complain unless provided with *exact* input; however,  
> when given the input, it should carry out the task flawlessly.

- Must catch errors at *construction time*, not *run time* 
- Must implement a high-quality unit-test suite
- Must have 99% test-coverage
- Must use test-runner thresholds for coverage test
- Must have strict argument validations.
- Must `throw` on incorrect argument.
- Must not sanitise or normalise input.
- Must `throw` if a property/method will be overwriten
- Must create immutable FSMs
- Must throw custom `Error`s

## Guidelines

### Documentation

- 2 lines max of description then a copy/pasteable example.
- If "it" requires a long explanation, "it" probably sucks. Reconsider "it".
- No opinions, personal fluff or jargon. Shut up :)
- Test code examples before pushing.

## Publishing

> `npm publish` with [build provenance][provenance]
>>>>>>> main

> example: publishing a new release:

```bash
gh release create v1.7.1
```

> reminder: versioning *must* follow Semver guidelines.

List current releases using:

```bash
gh release list
```

## Design philosophy

These design goals are **central** to this implementation.

- [Zero maintenance](#zero-maintenance)
- [Minimal API](#minimal-api)
- [Robust](#robust)

### Zero Maintenance  

> A package *safe* for long-term use without requiring any maintenance.   
> It should work without generating any warnings, security advisories etc.

> The key words: *"must"*, *"must not"*, *"should"*, *"should not"* are to be 
> interpreted as described in [RFC 2119][2119].

- Must not have dependencies, in any form:
  - no runtime dependencies, no `devDependencies`
  - no 3rd party services, i.e: coveralls
- Must not use proposal-stage language features
- Should not use Node APIs, i.e: `fs`
- Must use `test-runner` thresholds for coverage
- Must add a README indicator of tests status
- CI tests on: 
  - `engine` Node version.
  - `latest` Node version.
- Should use Github Actions for CI

### Minimal API

> An API so simple, it doesn't need to be looked up twice.  
> Does that one thing, only; without any bells & whistles.

- Must satisfy the spec
- Must not implement extras
- Must not allow configuration
- Should be concise instead of detailed
- Must use native APIs where applicable:
  - i.e: Assume a feature i.e: *"Get instance `JSON`"*:
  - `JSON.stringify(fsm)` is idiomatic, well-known & easy to remember. Good.
  - `fsm.asJSON()` is specific to us, must be looked-up & memorised. Bad.

### Robust

> The package should complain unless provided with *exact* input; however,  
> when given the input, it should carry out the task flawlessly.

- Must catch errors at *construction time*, not *run time* 
- Must implement a high-quality unit-test suite
- Must have 99% test-coverage
- Must use test-runner thresholds for coverage test
- Must have strict argument validations.
- Must `throw` on incorrect argument.
- Must not sanitise or normalise input.
- Must `throw` if a property/method will be overwriten
- Must create immutable FSMs
- Must throw custom `Error`s

## Authors

[@nicholaswmin][nicholaswmin]

[nicholaswmin]: https://github.com/nicholaswmin
[sv]: https://semver.org/
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[2119]: https://www.ietf.org/rfc/rfc2119.txt
[gh-rel]: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
[npm]: https://www.npmjs.com/package/@nicholaswmin/fsm?activeTab=versions
[repo-rels]: https://github.com/nicholaswmin/fsm/releases
