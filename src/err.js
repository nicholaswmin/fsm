class InvalidTransitionError extends Error {
  constructor({ transitionName, current, to }) {
    super([
      `Invalid transition: "${transitionName}"`,
      `Current state: "${current}" can only transition to: "${to}"`
    ].join('. '))
    this.error = this.constructor.name
    this.name = this.constructor.name
  }
}

class UnknownTransitionError extends Error {
  constructor({ transitionName }) {
    super(`Transition: "${transitionName}" does not exist`)
    this.error = this.constructor.name
    this.name = this.constructor.name
  }
}

export { InvalidTransitionError, UnknownTransitionError }
