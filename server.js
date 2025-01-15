const net = require("net");
const fs = require("fs");

let clients = [];
let clientIdCounter = 1;

const server = net.createServer((socket) => {
  const clientId = `Client${clientIdCounter++}`;
  clients.push({ socket, clientId });
  // Sends connect message to all clients when a client connects
  console.log(`${clientId} connected`);
  fs.appendFileSync("chat.log", `${clientId} connected\n`);

  socket.write(`Welcome ${clientId}!\n`);

  clients.forEach((client) => {
    if (client.socket !== socket) {
      client.socket.write(`${clientId} has joined the chat.\n`);
    }
  });

  socket.on("data", (data) => {
    const message = data.toString().trim();
    console.log(`${clientId}: ${message}`);
    fs.appendFileSync("chat.log", `${clientId}: ${message}\n`);

    // Send message to all other clients
    clients.forEach((client) => {
      if (client.socket !== socket) {
        client.socket.write(`${clientId}: ${message}\n`);
      }
    });
  });
  // Sends disconnect message to all clients when a client disconnects
  socket.on("end", () => {
    console.log(`${clientId} disconnected`);
    fs.appendFileSync("chat.log", `${clientId} disconnected\n`);

    clients.forEach((client) => {
      if (client.socket !== socket) {
        client.socket.write(`${clientId} has left the chat.\n`);
      }
    });

    clients = clients.filter((client) => client.socket !== socket);
  });

  socket.on("error", (err) => {
    console.error(`Error with client ${clientId}:`, err.message);
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
