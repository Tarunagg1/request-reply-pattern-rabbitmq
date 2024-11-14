import { Channel, ConsumeMessage } from "amqplib";
import config from "../config";
import { randomUUID } from 'crypto';
import EventEmitter from "events";

export default class Producer {
    constructor(private channel: Channel, private replyQueueName: string, private eventEmitter: EventEmitter) { }

    async produceMessages(data: any) {
        console.log('produce messages.....');
        const uuid = randomUUID();
        console.log('uuid', uuid);

        this.channel.sendToQueue(config.rabbitMQ.queues.rpcQueue, Buffer.from(JSON.stringify(data)), {
            replyTo: this.replyQueueName,
            correlationId: uuid,
            headers: {
                function: data.eperation
            }
        });

        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.once(uuid, (message) => {
                // console.log('this is From event emit', JSON.parse(message.content.toString()));
                const reply = JSON.parse(message.content.toString());
                resolve(reply);
            })
        })
    }
}