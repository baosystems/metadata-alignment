import { uniqueBy } from '../utils/mappingUtils'

describe('Test uniqueBy behaviour', () => {
  test('Original returned when there are no duplicates', () => {
    const a = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const fn = (item) => item?.id
    expect(uniqueBy(a, fn)).toEqual(a)
  })

  test('Correctly works to compare string arrays', () => {
    const a = [
      ['Pizza', ' is', ' the', ' ultimate', ' food.'],
      ['Sandwiches', ' are', ' better.'],
      ['No.'],
      ['Pizza', ' is', ' the', ' ultimate', ' food.'],
      ['No.'],
      ['Sandwiches', ' are', ' better.'],
      ['Let us', ' agree', ' to', ' disagree.'],
      ['OK.'],
    ]
    const expected = [
      ['Pizza', ' is', ' the', ' ultimate', ' food.'],
      ['Sandwiches', ' are', ' better.'],
      ['No.'],
      ['Let us', ' agree', ' to', ' disagree.'],
      ['OK.'],
    ]
    const fn = (item) => item.join()
    expect(uniqueBy(a, fn)).toEqual(expected)
  })
})
