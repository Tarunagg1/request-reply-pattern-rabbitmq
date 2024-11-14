import express from 'express'
import RabbitMqClient from './rabbitmq/client'

import * as service1 from './service1';
import * as service2 from './service2';


const app = express();

app.use(express.json());


app.post('/operate', async (req, res) => {
    const data = await RabbitMqClient.produce(req.body);
    // await service1.sendMessage(req.body);
    // await service2.sendMessage(req.body);
    res.status(200).json({ message: "success", data })
})

app.listen(3001, async () => {
    console.log('server listening on port 3001');
    RabbitMqClient.initialize()
});
