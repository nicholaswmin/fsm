# Contribution Guide

- [Conventions](#conventions)
- [Publishing](#publishing)
- [Design goals](#design-goals)

## Conventions

- [Github Flow][gh-flow]
- [Conventional Commits][ccom]
- [Semver][sv]

## Publishing

Only via [Github Releases][gh-rel] which auto-publish to [npm][npm].

> example: publishing a new release:

```bash
gh release create v1.7.1
```

List current releases:

```bash
gh release list
```

> note: versions must use format: `vX.X.X` & strictly follow [Semver][sv].

## Design goals

> The key words: *"must"*, *"must not"*, *"should"*, *"should not"* & *"may"*  
> within this section, are to be interpreted as described in [RFC 2119][2119].

The following goals are *central* to this implementation:

- [Zero maintenance](#zero-maintenance)
- [Minimal API](#minimal-api)
- [Robust](#robust)

Trade-offs may be made in any aspect except the above.

### Zero Maintenance  

> Designed to be safe for long-term use without any maintenance, even across
> NodeJS versions.   
> Any warnings, security advisories etc. are considered failures.

- Must not have dependencies, in any form:
  - no runtime dependencies
  - no `devDependencies`
  - no 3rd party services, i.e: coveralls
- Must not use proposal-stage language features
- Should not use Node APIs, i.e: `fs`
- Must add a README indicator of tests status
- CI must run tests on: 
  - `engine` Node version.
  - `latest` Node version.

### Minimal API

> An API so minimal you won't need to look it up twice. Do one thing in one way.   
> No bells & whistles. Non-configurable.[^1]

- Must not implement extras
- Must not allow configuration
- Should be concise instead of detailed
- Must use native APIs where applicable:
  - i.e: Assume a feature i.e: *"Get instance `JSON`"*:
  - `JSON.stringify(fsm)` is idiomatic, well-known & easy to remember. Good.
  - `fsm.asJSON()` is specific to us, must be looked-up & memorised. Bad.

### Robust

> Throws validation errors unless input is given in an exact format.   
> Any failures after accepting the input should be treated as a bug.

- Must implement a high-quality unit test suite:
  - Should use plainly-worded test cases, avoid technical details
  - Should use consistent language and test file structure
  - Should be modular, use file structure to split into distinct aspects
  - Must test only output. Must not test how it was obtained
  - Should have self-contained test files, can ignore DRY principle
  - Should not have complicated setups/mocks etc
  - Should not include imperative logic
  - Should have descriptive error messages with expected & actual values
  - Must have `> 95%` test-coverage & fail the entire suite if not
  - Must run in `< 2 seconds`, at most
  - Should only test public APIs
- Must catch errors at *construction time* via strict validations
  - Must resolve ambiguity by throwing an `Error`. Don't assume.
  - Must `throw` on "okay-ish" arguments, don't attempt to normalise input
  - Must `throw` if a property/method exists and will be overwriten
  - Must only throw an `instanceof Error`
- Must seal internal structure
- Must hide private methods & state via `enumerable: false`

## Authors

[@nicholaswmin][nicholaswmin]

## Footnotes

[^1]: Not a variation of [Sensible Defaults][sd].  
      Here, we're not allowing *any* configuration.

[nicholaswmin]: https://github.com/nicholaswmin
[sv]: https://semver.org/
[sd]: https://en.wikipedia.org/wiki/Convention_over_configuration
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[2119]: https://www.ietf.org/rfc/rfc2119.txt
[gh-rel]: https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
[npm]: https://www.npmjs.com/package/@nicholaswmin/fsm?activeTab=versions
[repo-rels]: https://github.com/nicholaswmin/fsm/releases
