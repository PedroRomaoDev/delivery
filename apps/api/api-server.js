import fastify from 'fastify';
import { makeFindAllOrdersController } from './src/factories/index.js';

const app = fastify();

app.get('/', async () => {
    return { message: 'Hello World' };
});

// Orders routes
const findAllOrdersController = makeFindAllOrdersController();

app.get('/orders', async (request, reply) => {
    return findAllOrdersController.execute(request, reply);
});

const start = async () => {
    try {
        await app.ready();
        await app.listen({ port: 8080 });
        console.log('Server running at http://localhost:8080');
    } catch (err) {
        console.error(err);
    }
};

start();
