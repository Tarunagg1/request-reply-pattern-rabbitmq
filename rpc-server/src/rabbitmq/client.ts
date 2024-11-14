import { Connection, Channel, connect } from "amqplib";
import config from "../config";
import Consumer from "./consumer";
import Producer from "./producer.";

class RabbitMqClient {
    private producer: Producer;
    private consumer: Consumer;

    private constructor() { };

    private static instance: RabbitMqClient;
    private isInitialized = false;

    private connection: Connection;

    private producerChannel: Channel;
    private consumerChannel: Channel;

    public static getInstance(): RabbitMqClient {
        if (!this.instance) {
            this.instance = new RabbitMqClient();
        }
        return this.instance;
    }


    async initialize() {
        if (this.isInitialized) {
            return;
        }
        try {
            this.connection = await connect(config.rabbitMQ.url);

            this.producerChannel = await this.connection.createChannel();
            this.consumerChannel = await this.connection.createChannel();

            const { queue: rpcQueue } = await this.consumerChannel.assertQueue(config.rabbitMQ.queues.rpcQueue, { exclusive: true });

            this.producer = new Producer(this.producerChannel);
            this.consumer = new Consumer(this.consumerChannel, rpcQueue);

            this.consumer.consumeMessages();
            this.isInitialized = true;
        } catch (error) {
            console.log(error);
        }
    }

    async produce(data: any, corelationId: string, replyTo: string) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return await this.producer.produceMessages(data, corelationId, replyTo);
    }

}

export default RabbitMqClient.getInstance();