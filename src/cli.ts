import WebSocket from "ws";
import {
  getCurrencyFromAddress,
  loadWalletBalanceLoop,
  printInfoWith,
  sendSocketMessage,
  setupKeyListener,
} from "./utils/kafka";
import { WebSocketEvents } from "./events";

const ws = new WebSocket("ws://localhost:3000");
const address = process.argv[2];
const currency = getCurrencyFromAddress(address);
let balance: number | undefined;
let price: number | undefined;

const shutdown = () => {
  Array.apply(null, Array(1)).forEach(() =>
    process.stdout.write("⛔Promt is quit⛔... \t👋 Goodbye\n")
  );
  ws.close();
  process.exit();
};

ws.on("open", () => {
  sendSocketMessage(ws, WebSocketEvents.SetupWallet, address);

  setupKeyListener({
    onEnter: (address) =>
      sendSocketMessage(ws, WebSocketEvents.ReadBalance, address),
    onClose: () => shutdown(),
  });

  loadWalletBalanceLoop(ws, 60);
});

ws.on("message", (message: string) => {
  const { type, data } = JSON.parse(message.toString());

  switch (type) {
    case WebSocketEvents.BalanceUpdated: {
      balance = data.balance;
      printInfoWith(currency, price, balance);
      break;
    }
    case WebSocketEvents.PriceUpdated: {
      price = data.price;
      printInfoWith(currency, price, balance);
      break;
    }
  }
  console.log("💬 Message from server:", data.toString());
});

ws.on("close", () => {
  shutdown();
  console.log("🔌 Disconnected from server");
});

ws.on("error", (err) => {
  console.error("❌ WebSocket error:", err);
});
