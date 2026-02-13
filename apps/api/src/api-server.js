import fastify from 'fastify';

const app = fastify();

app.get('/', async () => {
    return { message: 'Hello World' };
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
