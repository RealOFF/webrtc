import React, { useEffect } from 'react'

import { initConnection, initSwarmConnection } from './peer'

import './App.css'

const color = 'blue'

function App() {
  useEffect(() => {
    window.onload = () => {
      if (window.location.pathname.includes('/swarm')) {
        initSwarmConnection()
      } else {
        initConnection()
      }
    }
  }, [])

  return (
    <div className="App">
      <h1 style={{
        color
      }}>
        HELLO
      </h1>
      <div id="video-wrapper">
      </div>
    </div>
  )
}

export default App
