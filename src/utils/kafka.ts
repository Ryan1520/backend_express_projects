import readline from "readline";
import { WebSocket } from "ws";
import { WebSocketEvents } from "../events";

export const sendSocketMessage = <T>(ws: WebSocket, type: string, data?: T) => {
  if (ws.readyState === ws.CLOSED) return;
  const message = JSON.stringify({ type, data: data || null });
  ws.send(message);
};

export const getCurrencyFromAddress = (address?: string) => {
  return address?.startsWith("0x") ? "eth" : "btc";
};

export const setupKeyListener = (handler: {
  onEnter: (command: string) => void;
  onClose: () => void;
}) => {
  readline.emitKeypressEvents(process.stdin);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.prompt();

  rl.on("line", (input: string) => {
    console.log(`➡️\t You typed: "${input}"`);

    handler.onEnter(input);
    if (input === "exit") {
      rl.close();
      handler.onClose();
    } else {
      rl.prompt();
    }
  });
};

export const loadWalletBalanceLoop = (ws: WebSocket, seconds: number) => {
  const interval = setInterval(() => {
    if (ws.readyState !== ws.CLOSED) {
      sendSocketMessage(ws, WebSocketEvents.ReadBalance);
    } else {
      console.log("🛑 Clearing interval");
      clearInterval(interval);
    }
  }, seconds * 1000);

  // Similar way: use recursion inside setTimeOut()
  // setTimeout(() => {
  //   if (ws.readyState !== ws.CLOSED) {
  //     sendSocketMessage(ws, WebSocketEvents.ReadBalance);
  //     loadWalletBalanceLoop(ws, seconds);
  //   }
  // }, seconds * 1000);
};

export const formatUSD = (amount: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(amount);
};

export const printInfoWith = (
  currency: string,
  price?: number,
  balance?: number
) => {
  process.stdout.write(`Wallet:  ${currency.toUpperCase()}\n`);
  process.stdout.write(
    `Price:   ${price ? formatUSD(Number(price)) : "..."}\n`
  );
  process.stdout.write(`Balance: ${balance || "..."}\n`);
  process.stdout.write(
    `Value:   ${
      balance !== undefined && price ? formatUSD(balance * price) : "..."
    }\n`
  );

  process.stdout.moveCursor(0, -4);
};
