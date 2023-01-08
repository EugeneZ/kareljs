import { Context, State } from "./types"

let states: State[] = []
let context: Context | null = null
let startTime = 0

export function preProgram(state: State, newContext: Context) {
  states = [state]
  context = newContext
  startTime = Date.now()
}

export function postProgram(): State[] {
  return states
}

type CommandHandler<T> = (state: State, context: Context) => [State, T]

export function doCommand<T>(fn: CommandHandler<T>): T {
  // Check for infinite loops or other very long running programs
  if (Date.now() - startTime > 1000) {
    throw new Error('program took too long to run')
  }
  
  const latestState = states[states.length-1]

  if (!latestState) {
    throw new Error('latest state not found')
  }

  if (!context) {
    throw new Error('context not set yet')
  }

  const [newState, retval] = fn(latestState, context)
  states.push(newState)
  return retval
}

export function move() {
  return doCommand(handleMove)
}

export function turnLeft() {
  return doCommand(handleTurnLeft)
}

export function putBeeper() {
  return doCommand(handlePutBeeper)
}

export function pickBeeper() {
  return doCommand(handlePickBeeper)
}

export function frontIsBlocked() {
  return doCommand(handleFrontIsBlocked)
}

export function leftIsBlocked() {
  return doCommand(handleLeftIsBlocked)
}

export function rightIsBlocked() {
  return doCommand(handleRightIsBlocked)
}

export function backIsBlocked() {
  return doCommand(handleBackIsBlocked)
}

export function facingNorth() {
  return doCommand(handleFacingNorth)
}

export function facingEast() {
  return doCommand(handleFacingEast)
}

export function facingSouth() {
  return doCommand(handleFacingSouth)
}

export function facingWest() {
  return doCommand(handleFacingWest)
}

export function beepersPresent() {
  return doCommand(handleBeepersPresent)
}

const handleMove: CommandHandler<undefined> = function(state: State, context: Context): [State, undefined] {
  console.log('move', state, context)
  if (state.direction === 'north') {
    if (state.y === 0) {
      return [state, undefined]
    }
    return [{
      ...state,
      y: state.y - 1
    }, undefined]
  } else if (state.direction === 'east') {
    if (state.x + 1 === context.boardWidth) {
      return [state, undefined]
    }
    return [{
      ...state,
      x: state.x + 1
    }, undefined]
  }else if (state.direction === 'south') {
    if (state.y + 1 === context.boardHeight) {
      return [state, undefined]
    }
    return [{
      ...state,
      y: state.y + 1
    }, undefined]
  } else if (state.direction === 'west') {
    if (state.x === 0) {
      return [state, undefined]
    }
    return [{
      ...state,
      x: state.x - 1
    }, undefined]
  } else {
    throw new Error('invalid direction')
  }
}

const handleTurnLeft: CommandHandler<undefined> = function(state: State): [State, undefined] {
  if (state.direction === 'north') {
    return [{
      ...state,
      direction: 'west'
    }, undefined]
  } else if (state.direction === 'east') {
    return [{
      ...state,
      direction: 'north'
    }, undefined]
  }else if (state.direction === 'south') {
    return [{
      ...state,
      direction: 'east'
    }, undefined]
  } else if (state.direction === 'west') {
    return [{
      ...state,
      direction: 'south'
    }, undefined]
  } else {
    throw new Error('invalid direction')
  }
}

const handlePutBeeper: CommandHandler<undefined> = function(state: State): [State, undefined]  {
  return [{
    ...state,
    beepers: state.beepers.concat({
      x: state.x,
      y: state.y,
    })
  }, undefined]
}

const handlePickBeeper: CommandHandler<undefined> = function(state: State): [State, undefined] {
  const indexToDelete = state.beepers.findIndex(beeper => state.x === beeper.x && state.y === beeper.y)
  
  if (indexToDelete === -1) {
    return [state, undefined]
  }
  
  const newArray = state.beepers.slice()
  newArray.splice(indexToDelete, 1)
  
  return [{
    ...state,
    beepers: newArray
  }, undefined]
}

const handleFrontIsBlocked: CommandHandler<boolean> = function(state: State, context: Context): [State, boolean] {
  let retval = false
  if (state.direction === 'north' && state.y === 0) {
    retval = true
  } else if (state.direction === 'east' && state.x === context.boardWidth - 1) {
    retval = true
  }else if (state.direction === 'south' && state.y === context.boardHeight - 1) {
    retval = true
  } else if (state.direction === 'west' && state.x === 0) {
    retval = true
  }
  return [state, retval]
}

const handleLeftIsBlocked: CommandHandler<boolean> = function(state: State, context: Context): [State, boolean] {
  let retval = false
  if (state.direction === 'east' && state.y === 0) {
    retval = true
  } else if (state.direction === 'south' && state.x === context.boardWidth - 1) {
    retval = true
  }else if (state.direction === 'west' && state.y === context.boardHeight - 1) {
    retval = true
  } else if (state.direction === 'north' && state.x === 0) {
    retval = true
  }
  return [state, retval]
}

const handleRightIsBlocked: CommandHandler<boolean> = function(state: State, context: Context): [State, boolean] {
  let retval = false
  if (state.direction === 'west' && state.y === 0) {
    retval = true
  } else if (state.direction === 'north' && state.x === context.boardWidth - 1) {
    retval = true
  }else if (state.direction === 'east' && state.y === context.boardHeight - 1) {
    retval = true
  } else if (state.direction === 'south' && state.x === 0) {
    retval = true
  }
  return [state, retval]
}

const handleBackIsBlocked: CommandHandler<boolean> = function(state: State, context: Context): [State, boolean] {
  let retval = false
  if (state.direction === 'south' && state.y === 0) {
    retval = true
  } else if (state.direction === 'west' && state.x === context.boardWidth - 1) {
    retval = true
  }else if (state.direction === 'north' && state.y === context.boardHeight - 1) {
    retval = true
  } else if (state.direction === 'east' && state.x === 0) {
    retval = true
  }
  return [state, retval]
}

const handleFacingNorth: CommandHandler<boolean> = function(state: State): [State, boolean] {
  return [state, state.direction === 'north']
}

const handleFacingEast: CommandHandler<boolean> = function(state: State): [State, boolean] {
  return [state, state.direction === 'east']
}

const handleFacingSouth: CommandHandler<boolean> = function(state: State): [State, boolean] {
  return [state, state.direction === 'south']
}

const handleFacingWest: CommandHandler<boolean> = function(state: State): [State, boolean] {
  return [state, state.direction === 'west']
}

const handleBeepersPresent: CommandHandler<boolean> = function(state: State, context: Context): [State, boolean] {
  return [state, Boolean(state.beepers.find(beeper => beeper.x === state.x && beeper.y === state.y))]
}



