import Binance from "binance-api-node";
import { Kafka, logLevel } from "kafkajs";
import { KafkaTopics } from "./events";

const KAFKA_BROKER = process.env.KAFKA_BROKER!;

const client = Binance();
const kafka = new Kafka({ brokers: [KAFKA_BROKER], logLevel: logLevel.ERROR });
const producer = kafka.producer();

async function main() {
  await producer.connect();

  client.ws.ticker(["BTCUSDT", "ETHUSDT"], (ticker) => {
    const currency = ticker.symbol.split("USDT")[0].toLocaleLowerCase();
    const price = Number(ticker.curDayClose);

    const payload = JSON.stringify({ price });
    producer.send({
      topic: KafkaTopics.CurrencyPrice,
      messages: [{ key: currency, value: payload }],
    });

    console.log(
      `📈 ${ticker.symbol.split("USDT")[0]}/USDT Price: ${ticker.curDayClose} `
    );
  });

  process.on("SIGTERM", async () => {
    await producer.disconnect();

    process.exit(0);
  });

  console.log("🚦Price service started");
}

main();
