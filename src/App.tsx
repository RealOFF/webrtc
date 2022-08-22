import React, { useEffect } from 'react'
import 'normalize.css'

import { initConnection, initSwarmConnection } from './peer'

import './App.css'

const params = new URLSearchParams(window.location.search)

function App() {
  useEffect(() => {
    if (JSON.parse(params.get('is-swarm') || 'false')) {
      initSwarmConnection()
    } else {
      initConnection()
    }

  }, [])

  return (
    <div className="App">
      <span style={{
        color: '#7c7c83',
        fontSize: 24,
        fontWeight: 600
      }}>
        Hello! Room: {params.get('room-id')}
      </span>
      <div id="video-wrapper">
      </div>
    </div>
  )
}

export default App
