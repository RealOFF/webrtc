import React, { useEffect } from 'react'

import { initConnection } from './peer'

import './App.css'

function App() {

  useEffect(() => {
    window.onload = () => {
      initConnection()
    }
  }, [])

  return (
    <div className="App">
      <video id="video" autoPlay playsInline>
      </video>
    </div>
  )
}

export default App
