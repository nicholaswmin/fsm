## Contributing

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom].

## Guidelines 

> These package doesn't expect (or accept) feature PRs. Bug fixes are welcome.  
> These guidelines are specific to this package & included for future reference.
  
### General 

- Being feature-poor is the feature. Do one thing, only.
- No configurations, at all. There's only one way, that way.
- Stupidly simple is a plus. No abstractions.
- Hide internal structure. Prefer read-only. 
- Don't normalise input. Throw an error. It's OK to be annoying.
- Don't expand the API:
  - `JSON.stringify(fsm)` is well-known & easy to remember. 
  - A custom: `fsm.asJSON()` must be looked-up & memorised. No thanks. 

### Build

- No dependencies. Not even `dev`. For any reason.
- Publish with provenance, otherwise don't publish.

### Tests

- 100% test coverage. 
- Assume a non-technical person is reading the tests: 
  - Can he/she/* figure out what this is supposed to do?

### Documentation

- 1-2 lines of some description then a copy/pasteable example.
- No opinions, personal fluff or jargon. Shut up :)
- If "it" requires a long explanation, "it" probably sucks. Reconsider "it".
- Test code examples before pushing.

## Publishing

> Guide to publishing with [build provenance][provenance]

From `main` branch:

1. Bump version:

```bash
npm version patch
```
> or: `minor`, `major` depending on SemVer change

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
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt
