import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { verifyAccessToken } from "./utils/jwt.js";

let io: Server | null = null;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || true, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Missing auth token"));
    try {
      const payload = verifyAccessToken(token);
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { role, sub } = socket.data.user as { role: string; sub: number };
    // Rooms let the server target "everyone", "all teachers", or a single user.
    socket.join("all");
    socket.join(`role:${role}`);
    socket.join(`user:${sub}`);
  });

  return io;
}

/** Broadcasts a real-time event. Safe to call even if sockets aren't initialized (e.g. in tests). */
export function emitEvent(room: string, event: string, payload: unknown): void {
  io?.to(room).emit(event, payload);
}
