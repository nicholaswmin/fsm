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

List current releases::

```bash
gh release list
```

## Design goals

The following goals are *central* to this implementation:

- [Zero maintenance](#zero-maintenance)
- [Minimal API](#minimal-api)
- [Robust](#robust)

Trade-offs can be made elsewhere, if required. 

> The key words *"must", *"must not"*, *"required"*, *"shall"*, *"shall not"*,   
> *"should"*, *"should not"*, *"recommended"*, *"may"*, and *"optional"* in  
> this document are to be interpreted as described in [RFC 2119][2119]

### Zero Maintenance  

> Designed to be *safe* for long-term use since it does not require much
> maintenance. It should work without generating any warnings, 
> security advisories etc.

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

- Must not implement extras
- Must not allow configuration
- Should be concise instead of detailed
- Must use native APIs where applicable:
  - i.e: Assume a feature i.e: *"Get instance `JSON`"*:
  - `JSON.stringify(fsm)` is idiomatic, well-known & easy to remember. Good.
  - `fsm.asJSON()` is specific to us, must be looked-up & memorised. Bad.

### Robust

> The package should throw validation errors unless provided with *exact* input,
> in the required format. It minimises configurability or normalising input.   
> Any failures after "OK-ing" the input should be blamed on faulty code logic,   
> never as a user or environment issue.

- Must implement a high-quality unit-test suite
  - Should use plainly-worded test cases without technical
  - Should use consistent language and test file structure
  - Should be modular, using the file structure to split into aspects.
  - Must test output, only. Must not test how the output was obtained.
  - Should aim to be simple to follow, may ignore the DRY principle here.
  - Should not be obscured by complicated setups/mocks etc
  - Should not perform any imperative logic
  - Should include descriptive error messages with expected & actual values
  - Must have `> 95%` test-coverage, must fail the entire suite otherwise.
  - Must run in `< 2 seconds`, at most.
  - Should only test public props & methods. 
- Must attempt catching errors, at *construction time* via strict validations
  - Must `throw` on incorrect argument, must not attempt to normalise input
  - Must `throw` if a property/method will be overwriten
- Must only throw an `instanceof Error`.
- Must create immutable FSMs
- Must throw custom and descriptive `Error`s

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
