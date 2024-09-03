import FSM from './index.js'

const gate = new FSM({
  states: {
    locked: { 
      lock: {  
        to: 'unlocked',  actions: [3] // <-- must be a string
      } 
    }
  },
  // .. rest of args
})
