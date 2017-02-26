import {blend} from './lib'
import {should, assert} from 'chai'

should()

// Primitive types tests
describe('#blend primitive type states', function() {
  it('equal strings', function() {
    blend('test', 'test').should.equal('test')
  })

  it('different strings', function() {
    blend('test', 'test2').should.equal('test2')
  })

  it('equal numbers', function() {
    blend(5, 5).should.equal(5)
  })

  it('different numbers', function() {
    blend(5, 6).should.equal(6)
  })

  it('equal bools', function() {
    blend(true, true).should.equal(true)
  })

  it('different bools', function() {
    blend(true, false).should.equal(false)
  })

  it('equal undefined', function() {
    const newState = blend(undefined, undefined)
    assert.equal(newState, undefined)
  })

  it('undefined and something else', function() {
    blend(undefined, 4).should.equal(4)
  })

  it('something and undefined', function() {
    const newState = blend(4, undefined)
    assert.equal(newState, undefined)
  })

  it('equal nulls', function() {
    const newState = blend(null, null)
    assert.equal(newState, null)
  })

  it('null and something else', function() {
    blend(null, 4).should.equal(4)
  })

  it('something and null', function() {
    const newState = blend(4, null)
    assert.equal(newState, null)
  })
})

// Primitive types and objects
describe('#blend objects with primitive types', function() {
  const state = {}

  it('returns new state if old state is string', function() {
    blend('test', state).should.equal(state)
  })

  it('returns string if old state is object', function() {
    blend(state, 'test').should.equal('test')
  })

  it('returns new state if old state is null', function() {
    blend(null, state).should.equal(state)
  })

  it('returns null if old state is object', function() {
    const newState = blend(state, null)
    assert.equal(newState, null)
  })

  it('returns new state if old state is undefined', function() {
    blend(undefined, state).should.equal(state)
  })

  it('returns undefined if old state is object', function() {
    const newState = blend(state, undefined)
    assert.equal(newState, undefined)
  })
})

// Objects with primitive types only
describe('#blend objects with primitive properties', function() {
  const oldState = {
      stringData: 'dataItem',
      numberData: 5
    }

  it('returns old state object if states are equal', function() {
    blend(oldState, oldState).should.equal(oldState)
  })

  it('returns old state object if state values are equal', function() {
    const newState = {...oldState}
    blend(oldState, newState).should.equal(oldState)
  })

  it('returns new state if new state has new field', function() {
    const newState = {...oldState, newStringData: 'newDataItem'}
    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.stringData, oldState.stringData)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.newStringData, 'newDataItem')
  })

  it('returns new state if new state has changed string value', function() {
    const newState = {...oldState, stringData: 'newValue'}
    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.stringData, 'newValue')
  })

  it('returns new state if new state has changed number value', function() {
    const newState = {...oldState, numberData: 4}
    const blended = blend(oldState, newState)
    assert.equal(blended.stringData, oldState.stringData)
    assert.equal(blended.numberData, 4)
  })

  it('returns new state without field if new state has missing field', function() {
    const {stringData, ...newState} = oldState
    const blended = blend(oldState, newState)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.stringData, undefined)
  })
})

// Objects with object types
describe('#blend objects with object properties', function() {
  const oldState = {
      stringData: 'dataItem',
      numberData: 5,
      innerItem: {
        innerString: 'innerDataItem',
        innerNumber: 6
      },
      otherInnerItem: {
        foo: 'bar'
      },
      nullItem: null,
      undefinedItem: undefined
    }

  it('returns old state object if states are equal', function() {
    blend(oldState, oldState).should.equal(oldState)
  })

  it('returns old state object if state values are equal', function() {
    const newState = {...oldState}
    blend(oldState, newState).should.equal(oldState)
  })

  it('returns old state object if inner state values are equal', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    blend(oldState, newState).should.equal(oldState)
  })

  it('returns new state object if inner state values are different', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem, innerNumber: 7}
    
    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.stringData, oldState.stringData)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.otherInnerItem, oldState.otherInnerItem)
    assert.notEqual(blended.innerItem, oldState.innerItem)
    assert.equal(blended.innerItem.innerNumber, 7)
  })

  it('returns new state object if inner state has new field', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem, newField: 7}
    
    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.stringData, oldState.stringData)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.otherInnerItem, oldState.otherInnerItem)
    assert.notEqual(blended.innerItem, oldState.innerItem)
    assert.equal(blended.innerItem.newField, 7)
    assert.equal(blended.innerItem.innerNumber, 6)
  })

  it('returns new state object if inner state has removed field', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    delete newState.innerItem.innerNumber
    
    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.stringData, oldState.stringData)
    assert.equal(blended.numberData, oldState.numberData)
    assert.equal(blended.otherInnerItem, oldState.otherInnerItem)
    assert.notEqual(blended.innerItem, oldState.innerItem)
    assert.equal(blended.innerItem.innerNumber, undefined)
  })

  it('returns newly constructed, blended object if inner state value changed on one object but not other', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    newState.otherInnerItem = {newFoo: 'newBar'}

    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.innerItem, oldState.innerItem)
    assert.notEqual(blended.otherInnerItem, oldState.otherInnerItem)
  })
})

// Nested Objects
describe('#blend objects with nested object properties', function() {
  const oldState = {
      stringData: 'dataItem',
      numberData: 5,
      innerItem: {
        innerString: 'innerDataItem',
        innerNumber: 6,
        innerInnerItem: {
          deepString: 'deep'
        },
        otherInnerInnerItem: {
          deepNumber: 10,
          deepString: 'deep',
          deepNull: null
        }
      },
      otherInnerItem: {
        foo: 'bar'
      },
      nullItem: null,
      undefinedItem: undefined
    }

  it('returns old state object if states are equal', function() {
    blend(oldState, oldState).should.equal(oldState)
  })

  it('returns old state object if state values are equal', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    newState.innerItem.innerInnerItem = {...oldState.innerItem.innerInnerItem}

    const blended = blend(oldState, newState)
    blended.should.equal(oldState)
    assert.equal(blended.innerItem, oldState.innerItem)
    assert.equal(blended.innerItem.innerInnerItem, oldState.innerItem.innerInnerItem)
  })

  it('returns new state object if state values are different', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    newState.innerItem.innerInnerItem = {...oldState.innerItem.innerInnerItem}
    newState.innerItem.innerInnerItem.deepString = 'deep2'
    newState.innerItem.otherInnerInnerItem = {...oldState.innerItem.otherInnerInnerItem}

    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.otherInnerItem, oldState.otherInnerItem)
    assert.notEqual(blended.innerItem, oldState.innerItem)
    assert.notEqual(blended.innerItem.innerInnerItem, oldState.innerItem.innerInnerItem)
    assert.equal(blended.innerItem.otherInnerInnerItem, oldState.innerItem.otherInnerInnerItem)
  })

  it('returns blended state object if deleted inner object property', function() {
    const newState = {...oldState}
    newState.innerItem = {...oldState.innerItem}
    newState.innerItem.otherInnerInnerItem = {...oldState.innerItem.otherInnerInnerItem}
    newState.innerItem.innerInnerItem = {...oldState.innerItem.innerInnerItem}
    delete newState.innerItem.innerInnerItem.deepString

    const blended = blend(oldState, newState)
    blended.should.not.equal(oldState)
    assert.equal(blended.otherInnerItem, oldState.otherInnerItem)
    assert.notEqual(blended.innerItem, oldState.innerItem)
    assert.notEqual(blended.innerItem.innerInnerItem, oldState.innerItem.innerInnerItem)
    assert.equal(blended.innerItem.otherInnerInnerItem, oldState.innerItem.otherInnerInnerItem)
  })
})
