## Contributing

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom]
  
## Publishing

> must be published with [build provenance][provenance].  

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
