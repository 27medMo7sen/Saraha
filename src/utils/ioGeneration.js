import { Server } from "socket.io";
let io;
let isRead = false;
export function ioGeneration(server, url) {
  if (!io) io = new Server(server, { cors: { origin: url } });
  return io;
}
export function setIsRead(value) {
  isRead = value;
  console.log(isRead, "is set");
}
export function getIsRead() {
  return isRead;
}
export function getIo() {
  if (!io) return new Error("there's no avalabile io", { cause: 400 });
  return io;
}
export let usersSocket = {};
