import { useState, useCallback } from 'react'

export default function useSelects(keyArr, initFunc) {
  const itemIds = keyArr.map(({ id }) => id)
  const initState = itemIds.reduce(
    (acc, itemId) => ({ ...acc, [itemId]: initFunc(itemId) }),
    {}
  )
  const [values, setValues] = useState(initState)
  const setters = {}
  for (const key in initState) {
    setters[key] = useCallback((v) => {
      setValues({ ...values, [key]: v })
    })
  }
  return [values, setters]
}
