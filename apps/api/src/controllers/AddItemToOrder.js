import {
    ok,
    badRequest,
    serverError,
} from '../../../../packages/helpers/http.js';

class AddItemToOrderController {
    constructor(addItemToOrderUseCase) {
        this.addItemToOrderUseCase = addItemToOrderUseCase;
    }

    async handle(request, reply) {
        try {
            const { id: orderId } = request.params;
            const { code, quantity, observations, name } = request.body;

            // Validações de entrada
            if (!code) {
                const response = badRequest('code is required');
                return reply.status(response.statusCode).send(response.body);
            }

            if (quantity === undefined || quantity === null) {
                const response = badRequest('quantity is required');
                return reply.status(response.statusCode).send(response.body);
            }

            if (typeof quantity !== 'number' || quantity <= 0) {
                const response = badRequest(
                    'quantity must be a positive number',
                );
                return reply.status(response.statusCode).send(response.body);
            }

            // Executa o UseCase
            const orderUpdated = await this.addItemToOrderUseCase.execute({
                orderId,
                code,
                quantity,
                observations: observations || null,
                name: name || null,
            });

            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Cannot add items to order that is not in DRAFT status'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error('Error adding item to order:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default AddItemToOrderController;
