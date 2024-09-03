## Contributing

feature-complete but bug & security fixes welcome:

follows [Github Flow][gh-flow], [Semver][sv] & [Conventional Commits][ccom]

## minimal

- no `dependencies`, no `devDependencies`. ever.
- no `v2`. No new features.
- feature-poor & uncomplicated.
- bundle size hovering `1 KB`.
- always published with [provenance][provenance]

## robust

- strict validations.
  -  don't clean up arguments: i.e `trim()` etc. 
    `throw` error instead. require that user fixes it.
- clear, descriptive and unambigous errors:
  - mention property path if argument is a complex object.
  - distinguish `TypeError`, `RangeError`.
  - mention actual value & what was expected.

[gh-flow]: https://docs.github.com/en/get-started/using-github/github-flow
[provenance]: https://docs.npmjs.com/generating-provenance-statements
[ccom]: https://www.conventionalcommits.org/en/v1.0.0/
[sv]: https://semver.org/
