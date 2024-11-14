import { Channel, ConsumeMessage } from "amqplib";
import MessageHandler from "../messageHandler";

export default class Consumer {
    constructor(private channel: Channel, private rpcQueue: string) { }

    async consumeMessages() {
        console.log('consume messages.....');
        this.channel.consume(this.rpcQueue, async (message: ConsumeMessage) => {
            const { correlationId, replyTo } = message.properties;
            if (!correlationId || !replyTo) {
                console.log('missing correlation id and reply to');
            }

            const operation = message.properties.headers.function;

            await MessageHandler.handel(operation, JSON.parse(message.content.toString()), correlationId, replyTo);
        }, {
            noAck: true
        })

    }
}