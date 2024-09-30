## Contributing

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom]
  
## Publishing

> This package must be published with [build provenance][provenance].  

Assuming an open PR waiting for `main` merge:

1. Ensure local is clean, all pushed to branch and tests pass.
2. Bump version, using:

```bash
npm version patch
```
> or: `minor`, `major`

3. Create a bump commit:

```bash
git commit -am "build: version bump"
```

4. Push to branch.
5. Merge to `main`.
6. Create a Github Release using the same version tag/number as the `version`
   from `package.json`. 
7. The `build:publish.yml` workflow will `npm publish` with build provenance.
8. Ensure all looks OK 

## Authors

[@nicholaswmin][nicholaswmin]

[nicholaswmin]: https://github.com/nicholaswmin
[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt
