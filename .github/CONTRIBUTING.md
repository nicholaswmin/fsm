## Contributing

This project does not accept contributions apart from bug fixes and 
security disclosures. It's feature-complete.

## Test 

The test suite is more important than the code.

Required: `95%` unit-test coverage,`94%` is failing, `96%` nobody cares. 

This is the only `no-go` metric. The CI linters, mutation testers etc.
are just a heads up.

### Validations

Input arguments with a potential to cause runtime errors *must*  be strictly 
validated for `typeof`, `undefined` and ranges, where ranges means: 
`array`/`string` must not be empty, `object` must have keys etc.

Require specific formats and throws a noisy error immediately if something is 
amiss.

[github-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
