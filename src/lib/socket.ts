import { io, Socket } from 'socket.io-client'

let socketSingleton: Socket | null = null

export function getSocket(): Socket {
  if (!socketSingleton) {
    socketSingleton = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
      autoConnect: false,
      transports: ['websocket'],
    })
  }

  return socketSingleton
}
