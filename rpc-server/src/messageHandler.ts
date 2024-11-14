import RabbitMqClient from './rabbitmq/client'


export default class MessageHandler {
    static async handel(operation: string, data: any, corelationId: string, replyTo: string) {
        let response = {};

        const { num1, num2 } = data;

        console.log("This is opetarion", operation);

        switch (operation) {
            case "multiply":
                response = num1 * num2;
                break;

            case "add":
                response = num1 + num2;
                break;

            case "subtract":
                response = num1 - num2;
                break;
            case "divide":
                response = num1 / num2;
                break;
            default:
                response = 0
                break;
        }

        await RabbitMqClient.produce(response, corelationId, replyTo);
    }
}