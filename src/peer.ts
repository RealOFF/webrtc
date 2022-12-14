import FastRTCPeer from '@mattkrick/fast-rtc-peer'
import FastRTCSwarm from '@mattkrick/fast-rtc-swarm'

import {
  BASE_SIGNAL_SERVER_URL,
  SWARM_SIGNAL_SERVER_URL,
  ICE_SERVERS
} from './config'

const createVideoCreator = (containerId: string) => {
  return {
    createVideo: (media: MediaStream, id: string) => {
      const container = document.getElementById(containerId)
      const video = document.createElement('video')
      video.autoplay = true
      video.playsInline = true
      video.srcObject = media
      video.id = `video-${id}`
      container?.appendChild(video)
    },
    removeVideo: (id: string) => {
      const element = document.getElementById(`video-${id}`)
      element?.remove()
    }
  }
}

const { createVideo, removeVideo } = createVideoCreator('video-wrapper')

const initPeers = async (socket: any, { receiver, isOfferer }: {
  name: string
  receiver: string
  isOfferer: boolean
}) => {
  const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  const localPeer: any = new FastRTCPeer({ isOfferer, streams: { cam } })
  // handle outgoing signals
  localPeer.on('signal', (payload: any) => {
    socket.send(JSON.stringify({ ...payload, name: receiver }))
  })

  // handle incoming signals
  socket.addEventListener('message', (event: any) => {
    const payload = JSON.parse(event.data)
    localPeer.dispatch(payload)
  })

  // handle events
  localPeer.on('open', (peer: any) => {
    console.log('connected & ready to send and receive data!', peer)
    peer.send(JSON.stringify('Hello from', peer.id))
  })
  localPeer.on('close', (peer: any) => {
    console.log('disconnected from peer!', peer)
  })
  localPeer.on('data', (data: any, peer: any) => {
    console.log(`got message ${data} from ${peer.id}`)
  })

  localPeer.on('stream', (stream: MediaStream, sourceName: string, peer: FastRTCPeer) => {
    // all tracks that belong to the stream have been received!
    if (peer.userId)
      createVideo(stream, peer.userId)
  })
}

export const initConnection = () => {
  const params = new URLSearchParams(window.location.search)
  const socket = new WebSocket(BASE_SIGNAL_SERVER_URL)

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'login', name: params.get('name') }))
    initPeers(socket, {
      name: params.get('name') || '',
      receiver: params.get('reciever') || '',
      isOfferer: JSON.parse(params.get('is-offerrer') || 'false')
    })
  })

  window.addEventListener('beforeunload', () => {
    if (socket.readyState === WebSocket.OPEN)
      socket.close()
  })

  return () => socket.close()
}

const initSwarmPeer = async (socket: any) => {
  const params = new URLSearchParams(window.location.search)
  const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  if (JSON.parse(params.get('is-muted') || 'true')) {
    const audioTrack = cam.getAudioTracks()[0]
    audioTrack.stop()
    audioTrack.enabled = false
  }
  const swarm: any = new FastRTCSwarm({
    streams: { cam },
    rtcConfig: {
      iceServers: ICE_SERVERS,
    } as any
  })
  // send the signal to the signaling server
  swarm.on('signal', (signal: any) => {
    socket.send(JSON.stringify({ ...signal, roomId: params.get('room-id') }))
  })
  // when the signal come back, dispatch it to the swarm
  socket.addEventListener('message', (event: any) => {
    const payload = JSON.parse(event.data)
    swarm.dispatch(payload)
  })
  // when the connection is open, say hi to your new peer
  swarm.on('dataOpen', (peer: any) => {
    console.log('data channel open!')
    peer.send('hi')
  })
  swarm.on('stream', (stream: MediaStream, sourceName: string, peer: FastRTCPeer) => {
    // all tracks that belong to the stream have been received!
    if (peer.userId)
      createVideo(stream, peer.userId)
  })
  // when your peer says hi, log it
  swarm.on('data', (data: any, peer: any) => {
    console.log('data received', data, peer)
  })
  swarm.on('error', (...data: any) => console.error('Error:', data))
  swarm.on('close', (peer: FastRTCPeer) => {
    if (peer.userId)
      removeVideo(peer.userId)
  })
}

const closeSwarmPeer = (socket: any) => {
  socket.send(JSON.stringify({ type: 'close' }))
  socket.close()
}

export const initSwarmConnection = () => {
  const socket = new WebSocket(SWARM_SIGNAL_SERVER_URL)

  socket.addEventListener('open', () => {
    initSwarmPeer(socket)
  })

  window.addEventListener('beforeunload', () => {
    if (socket.readyState === WebSocket.OPEN) {
      closeSwarmPeer(socket)
    }
  })

  return () => closeSwarmPeer(socket)
}