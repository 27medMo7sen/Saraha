import { Server } from "socket.io";
let io;
export function ioGeneration(server, url) {
  if (!io) io = new Server(server, { cors: { origin: url } });
  return io;
}
export function getIo() {
  if (!io) return new Error("there's no avalabile io", { cause: 400 });
  return io;
}
