import { useState, useCallback } from 'react'
import { tableTypes } from '../components/MappingPage/MappingConsts'

export default function useSuggestions() {
  const [suggestions, setAllSuggestions] = useState({
    [tableTypes.DE]: {},
    [tableTypes.AOC]: {},
    [tableTypes.OU]: {},
  })
  const setSuggestions = {
    [tableTypes.DE]: useCallback(
      (v) =>
        setAllSuggestions((suggestions) => ({
          ...suggestions,
          [tableTypes.DE]: v,
        })),
      []
    ),
    [tableTypes.AOC]: useCallback(
      (v) =>
        setAllSuggestions((suggestions) => ({
          ...suggestions,
          [tableTypes.AOC]: v,
        })),
      []
    ),
    [tableTypes.OU]: useCallback(
      (v) =>
        setAllSuggestions((suggestions) => ({
          ...suggestions,
          [tableTypes.OU]: v,
        })),
      []
    ),
  }
  return [suggestions, setSuggestions]
}
