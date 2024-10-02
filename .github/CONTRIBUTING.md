# Contributing

> The key words: "MUST", "MUST NOT", "SHOULD", "SHOULD NOT"   
> in this document are to be interpreted as described in [RFC 2119][2119].

## Conventions

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom].

## Design goals

> Above all else, this package focuses on the following:

- [Zero maintenance](#zero-maintenance)
- [Minimal API](#minimal-api)
- [Robust](#robust)

### Zero Maintenance  

> A strong indicator the package is *safe* for long-term use without requiring 
> maintenance. 
> It should work and won't generate warnings, security advisories etc.

- Must not have dependencies, in any form:
  - no runtime dependencies
  - no `devDependencies`
  - no 3rd party service, i.e: Coveralls
- Must not use proposal-stage language features
- Should not use Node APIs, i.e: `fs`
- Must use `test-runner` thresholds for coverage
- Must include 2 README badges, CI tests and test coverage
- CI tests on: 
  - `engine` Node version.
  - `latest` Node version.
- Should use Github Actions for CI

### Minimal API

> An API so simple, it doesn't need to be looked up twice.

- Must satisfy the spec
- Must not implement extras
- Must not allow configuration
- Should be concise instead of detailed
- Must use native APIs where applicable:
  - Assume feature i.e: *"Get instance `JSON`"*:
  - `JSON.stringify(fsm)` is idiomatic, well-known & easy to remember. Good.
  - `fsm.asJSON()` is specific to us, must be looked-up & memorised. Bad.

### Robust

> The package may complain unless provided with *exact* input; however,  
> when given like asked, it should carry out the task flawlessly.

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

- 1 or 2 lines of description then a copy/pasteable example.
- If "it" requires a long explanation, "it" probably sucks. Reconsider "it".
- No opinions, personal fluff or jargon. Shut up :)
- Test code examples before pushing.

## Publishing

> `npm publish` with [build provenance][provenance]

From `main` branch:

1. Bump version:

```bash
npm version patch
```
> or: `minor`, `major` 

then:

```bash
git commit -am "build: version bump"
git push origin main
```

2. Create a Github Release using the same version tag/number as the `version`
   from `package.json`. 
3. The `build:publish.yml` workflow will `npm publish` with build provenance.
4. Ensure all looks OK (version was published to `npm`, it works etc)

## Authors

[@nicholaswmin][nicholaswmin]

[nicholaswmin]: https://github.com/nicholaswmin
[sv]: https://semver.org/
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[2119]: https://www.ietf.org/rfc/rfc2119.txt
