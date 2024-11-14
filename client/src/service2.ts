import RabbitMqClient from "./rabbitmq/client"

export const sendMessage = (data: any) => {
    RabbitMqClient.produce(data);
}