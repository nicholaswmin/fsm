class TransitionError extends Error {
  constructor(message) {
    super(message)
    this.error = this.constructor.name
    this.name = this.constructor.name
  }
}

export { TransitionError }
