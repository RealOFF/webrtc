export const BASE_SIGNAL_SERVER_URL = process.env.REACT_APP_BASE_SIGNAL_SERVER || 'ws://localhost:3000'
export const SWARM_SIGNAL_SERVER_URL = process.env.REACT_APP_SWARM_SIGNAL_SERVER || 'ws://localhost:3000'

export const ICE_SERVERS = [
  { urls: ["stun:fr-turn1.xirsys.com"] },
  {
    username: "cy4qehElBbmgenjIsgcsTB8-9yioouR9hPgGSjkxZ7cPWmKzwXmrtlalPWiBGpxXAAAAAGKfOxFBbGV4ZXk=",
    credential: "c23220b4-e657-11ec-a512-0242ac120004",
    urls: [
      "turn:fr-turn1.xirsys.com:80?transport=udp",
      "turn:fr-turn1.xirsys.com:3478?transport=udp",
      "turn:fr-turn1.xirsys.com:80?transport=tcp",
      "turn:fr-turn1.xirsys.com:3478?transport=tcp",
      "turns:fr-turn1.xirsys.com:443?transport=tcp",
      "turns:fr-turn1.xirsys.com:5349?transport=tcp"
    ]
  }
]