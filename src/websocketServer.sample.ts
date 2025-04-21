import WebSocket, { WebSocketServer } from "ws";

const PORT = 3000;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    console.log(`📨 Received: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  const interval = setInterval(() => {
    const randomNumber = Math.floor(Math.random() * 100);
    ws.send(`🎲 Random Number: ${randomNumber}`);
  }, 2000);

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(interval);
  });

  ws.send("👋 Welcome to the WebSocket server!");
});

console.log(`🚀 WebSocket server is running on ws://localhost:${PORT}`);

//run cli 'npx ts-node-dev src/websocketServer.sample.ts' to start server at port 3000
