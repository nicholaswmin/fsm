## Contributing

> The key words “MUST”, “SHOULD”, are to be
> interpreted as described in [RFC 2119][rfc2119].

- [Overview](#overview)
- [General](#general-attributes)
- [Publishing new versions](#publishing-new-versions)
- [Authors](#authors)

## Overview

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom]

This package is feature-complete, however 
bug reports, bug fixes, security reports and/or fixes are welcome.

## General attributes

- must have 0 `dependencies`
- should have 0 `devDependencies`.
- should be feature-poor & uncomplicated.
- must have a bundle size hovering `1 KB`.
- must not clean up arguments: i.e `trim()` etc. 
  `throw` error instead. require that user fixes it.
- must have clear, descriptive & unambigous error messages.
- must mention property path if argument is a complex object.
- must distinguish `TypeError`, `RangeError`.
- must mention actual value & what was expected.
- must be published with [provenance][provenance]
- must have validations.
  
## Publishing new versions

> short guide on how to do `npm publish`, with build provenance.

1. Ensure all tests pass.
2. Increment `npm package.json` version:

```bash
npm version patch
```
> or: `minor`, `major`

3. Push to the current branch with commit message:


```bash
git commit -am "build: version bump"
```

4. Merge to `main`.
5. Create a Github Release using the same version tag/number as the `version`
   from `package.json`.
6. The `build:publish.yml` Github Actions workflow will then run `npm publish` 
   with build provenance when the Github Release is saved/published.

## Authors

[@nicholaswmin][nicholaswmin]

[nicholaswmin]: https://github.com/nicholaswmin
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt
