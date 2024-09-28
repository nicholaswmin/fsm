## Contributing

> The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, 
> “SHOULD NOT”, “RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to 
> be interpreted as described in [RFC 2119][rfc2119].

Follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom]

This package is feature-complete.  
Bug & security reports or fixes are welcome.

## Philosophy

### Minimal

- must have zero `dependencies`
- should have zero `devDependencies`.
- should be feature-poor & uncomplicated.
- must have a bundle size hovering `1 KB`.
- must be published with [provenance][provenance]

### Robust

- must have validations.
  -  must not clean up arguments: i.e `trim()` etc. 
    `throw` error instead. require that user fixes it.
- must have clear, descriptive and unambigous errors:
  - must mention property path if argument is a complex object.
  - must distinguish `TypeError`, `RangeError`.
  - must mention actual value & what was expected.

[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
[rfc2119]: https://www.ietf.org/rfc/rfc2119.txt
