import { useState, useCallback } from 'react'

export default function useSelects(initValues) {
  const [values, setValues] = useState(initValues)
  const setters = {}
  for (const key in initValues) {
    setters[key] = useCallback((v) => {
      setValues({ ...values, [key]: v })
    })
  }
  return [values, setters]
}
