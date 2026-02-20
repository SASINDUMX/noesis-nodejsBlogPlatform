

let io = null;

const onlineUsers = new Map();

function initSocket(httpServer) {
  const { Server } = require("socket.io");

  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Client sends their username after connecting so we can map them
    socket.on("register", (username) => {
      // Clear any old mappings for THIS socket ID first
      for (const [user, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(user);
        }
      }

      if (username) {
        onlineUsers.set(username, socket.id);
        console.log(`[Socket] ${username} connected (${socket.id})`);
      } else {
        console.log(`[Socket] Unregistered socket ${socket.id}`);
      }
    });

    socket.on("disconnect", () => {
      // Remove from map on disconnect
      for (const [username, id] of onlineUsers.entries()) {
        if (id === socket.id) {
          onlineUsers.delete(username);
          console.log(`[Socket] ${username} disconnected`);
          // Note: we don't break because one socket ID might (accidentally) have multiple usernames
          // in a buggy state, so we clean all.
        }
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialised. Call initSocket first.");
  return io;
}

function getSocketId(username) {
  return onlineUsers.get(username);
}

/**
 * Push a real-time notification to a user if they are online.
 * Silently does nothing if the user is offline (they will see
 * it when they load the notifications list from the DB).
 */
function pushNotification(recipientUsername, payload) {
  const socketId = getSocketId(recipientUsername);
  if (socketId) {
    getIO().to(socketId).emit("notification", payload);
  }
}

module.exports = { initSocket, getIO, getSocketId, pushNotification };
