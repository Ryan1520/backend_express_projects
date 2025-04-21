import Binance, { AvgPriceResult } from "binance-api-node";
import { Kafka, logLevel } from "kafkajs";
import { KafkaTopics } from "./events";

const KAFKA_BROKER = process.env.KAFKA_BROKER!;

const kafka = new Kafka({ brokers: [KAFKA_BROKER] });
const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: "balance-crawler",
  retry: { retries: 0 },
});

const client = Binance();

const getBalance = async (address: string) => {
  console.log("Address sent to balance service: ", address);

  const balance = (await client.avgPrice({
    symbol: "BTCUSDT",
  })) as AvgPriceResult;

  return balance.price;
};

async function main() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: KafkaTopics.TaskToReadBalance,
    fromBeginning: false,
  });

  console.log("✅ Balance service started");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { address } = JSON.parse(message.value!.toString());

      const balance = await getBalance(address);

      const payload = JSON.stringify({ balance });

      await producer.send({
        topic: KafkaTopics.WalletBalance,
        messages: [
          {
            key: address,
            value: payload,
          },
        ],
      });
    },
  });
}

main();
