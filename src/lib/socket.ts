import { io, Socket } from "socket.io-client";
import { useRoomStore } from "@/app/useRoomStore";

export function getSocket(): Socket {
  const store = useRoomStore.getState();
  let socket = store.socket;
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      autoConnect: false,
    });
    store.setSocket(socket);
  }
  return socket;
}
