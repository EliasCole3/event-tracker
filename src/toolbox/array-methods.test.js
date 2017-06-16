import { arraymove } from './array-methods'


let test1 = [
  0,
  1,
  2,
  3,
  4
]

let test2 = [
  1,
  '2',
  ['three'],
  {
    four: 'four'
  },
  {
    five: {
      five: {
        five: 'five'
      }
    }
  }
]



it('simple number array: moves an array value', () => {
  expect(arraymove(test1, 1, 0)).toEqual([
    1, 0, 2, 3, 4
  ])
})

it('doesn\'t do anything if the fromIndex and toIndex are the same value', () => {
  expect(arraymove(test1, 1, 1)).toEqual([
    0, 1, 2, 3, 4
  ])
})

it('should default to the first index if given a value less than 0', () => {
  expect(arraymove(test1, -1, 4)).toEqual([
    1, 2, 3, 4, 0
  ])
})

it('should default to the last index if given a value greater than the array upper bound', () => {
  expect(arraymove(test1, 8, 0)).toEqual([
    4, 0, 1, 2, 3
  ])
})

it('complex array: moves an array value', () => {
  expect(arraymove(test2, 1, 0)).toEqual([
    '2',
    1,
    ['three'],
    {
      four: 'four'
    },
    {
      five: {
        five: {
          five: 'five'
        }
      }
    }
  ])
})

it('complex array: moves an array value', () => {
  expect(arraymove(test2, 4, 3)).toEqual([
    1,
    '2',
    ['three'],
    {
      five: {
        five: {
          five: 'five'
        }
      }
    },
    {
      four: 'four'
    }
  ])
})













