## Contributing

Contributions can be made following the [Github Flow][github-flow].

> "must", "must not" etc. follow [RFC:2119][rfc2119].

## build 

- must follow [Semver][sv].
- should follow [Conventional Commits][ccom].
- must not have any runtime dependencies.
- should not have any dev. dependencies.
- bundled size be < 1000 bytes, gzipped.

## test 

- must have > 95% unit-test coverage.
- should have > 85% mutation-tests score.

## general 

- validation errors must clearly specify the issue, with specific paths 
  especially if the argument is a complex object.  
- input arguments with a potential to cause runtime errors *must*
  be strictly validated for `typeof`, `undefined` and ranges, where ranges
  means: `array`/`string` must not be empty, `object` must have keys etc.
  
[github-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
