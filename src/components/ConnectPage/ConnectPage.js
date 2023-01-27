import React, { useState } from 'react'
import { Box, Button, Card, InputField } from '@dhis2/ui'
import './ConnectPage.css'

import { loginToAP } from '../../utils/apiUtils'
import { useAlert } from '@dhis2/app-runtime'

const ConnectPage = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(!!sessionStorage.getItem('auth'))
  const { show: showSuccess } = useAlert((msg) => msg, { success: true })
  const { show: showError } = useAlert((msg) => msg, { critical: true })

  const handleSignIn = async () => {
    try {
      await loginToAP(username, password)
      showSuccess('Login Successful')
      setIsLoggedIn(true)
    } catch (error) {
      showError(`Login failed for: ${username}`, error.message)
    }
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('auth')
    setUsername('')
    setPassword('')
    setIsLoggedIn(false)
  }

  let cardBody = ''
  if (isLoggedIn) {
    cardBody = (
      <div>
        <h2 style={{ fontWeight: 300 }}>
          You are signed in as {sessionStorage.getItem('username')}
        </h2>
        <Button primary onClick={handleSignOut} className="loginBtn">
          Sign out
        </Button>
      </div>
    )
  } else {
    cardBody = (
      <div>
        <InputField
          value={username}
          onChange={(e) => setUsername(e.value)}
          label="Username"
        />
        <InputField
          className="inputField"
          value={password}
          onChange={(e) => setPassword(e.value)}
          label="Password"
          type="password"
        />
        <Button onClick={handleSignIn} primary className="loginBtn">
          Login
        </Button>
      </div>
    )
  }

  return (
    <div className="body">
      <Box width="500px">
        <Card className="cardContent">{cardBody}</Card>
      </Box>
    </div>
  )
}

export default ConnectPage
