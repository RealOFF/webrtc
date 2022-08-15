import FastRTCPeer from '@mattkrick/fast-rtc-peer'

const initPeers = async (socket: any, { receiver, isOfferer }: {
  name: string
  receiver: string
  isOfferer: boolean
}) => {
  const cam = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
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

  localPeer.on('stream', (stream: MediaStream) => {
    // all tracks that belong to the stream have been received!
    const el: any = document.getElementById('video')
    el.srcObject = stream
  })
}

export const initConnection = () => {
  const params = new URLSearchParams(window.location.search)
  const socket = new WebSocket('wss://signal-server-app.herokuapp.com/')

  socket.addEventListener('open', () => {
    socket.send(JSON.stringify({ type: 'login', name: params.get('name') }))
    initPeers(socket, {
      name: params.get('name') || '',
      receiver: params.get('reciever') || '',
      isOfferer: JSON.parse(params.get('is-offerrer') || 'false')
    })
  })
} 
