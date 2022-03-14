import React from 'react'
import classes from './App.module.css'
// import MappingPage from './components/MappingPage/MappingPage'
import SetupPage from './components/SetupPage/SetupPage'

const App = () => {
  return (
    <div className={classes.container}>
      <SetupPage />
      {/* <MappingPage /> */}
    </div>
  )
}

export default App
