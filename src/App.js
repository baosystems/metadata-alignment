import React, { useState } from 'react'
import classes from './App.module.css'
import MappingPage from './components/MappingPage/MappingPage'
import SetupPage from './components/SetupPage/SetupPage'
import { mockSourceDs, mockTargetDs } from './tests/mockData/mockDataSets'

const App = () => {
  const [sourceDs, setSourceDs] = useState(mockSourceDs)
  const [targetDs, setTargetDs] = useState(mockTargetDs)

  return (
    <div className={classes.container}>
      {sourceDs.length > 0 && targetDs.length > 0 ? (
        <MappingPage sourceDs={sourceDs} targetDs={targetDs} />
      ) : (
        <SetupPage setSourceDs={setSourceDs} setTargetDs={setTargetDs} />
      )}
    </div>
  )
}

export default App
