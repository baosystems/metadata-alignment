import React from 'react'
import { MenuBar } from './components'
import SetupStateProvider from './SetupStateProvider'
import { CssVariables } from '@dhis2/ui'
import classes from './App.module.css'

const App = () => {
  return (
    <div className={classes.container}>
      <CssVariables colors elevations layers spacers theme />
      <SetupStateProvider>
        <MenuBar />
      </SetupStateProvider>
    </div>
  )
}

export default App
