import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

let socket: Socket | null = null;

/** Lazily connects a single authenticated socket, reusing it across the app. */
export function getSocket(): Socket | null {
  const token = useAuthStore.getState().accessToken;
  if (!token) return null;

  if (!socket) {
    socket = io("/", { auth: { token }, transports: ["websocket", "polling"] });
  } else if (socket.auth && (socket.auth as { token?: string }).token !== token) {
    socket.auth = { token };
    socket.disconnect().connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
