import { Connection, Channel, connect } from "amqplib";
import config from "../config";
import Consumer from "./consumer";
import Producer from "./producer.";
import EventEmitter from "events";

class RabbitMqClient {
    private producer: Producer;
    private consumer: Consumer;

    private constructor() { };

    private static instance: RabbitMqClient;
    private isInitialized = false;

    private connection: Connection;

    private producerChannel: Channel;
    private consumerChannel: Channel;

    private eventEmitter: EventEmitter;

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

            const { queue: replyQueue } = await this.consumerChannel.assertQueue('', { exclusive: true });

            this.eventEmitter = new EventEmitter();

            this.producer = new Producer(this.producerChannel, replyQueue, this.eventEmitter);
            this.consumer = new Consumer(this.consumerChannel, replyQueue, this.eventEmitter);

            this.consumer.consumeMessages();
            this.isInitialized = true;
        } catch (error) {
            console.log(error);
        }
    }

    async produce(data: any) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return await this.producer.produceMessages(data);
    }

}

export default RabbitMqClient.getInstance();