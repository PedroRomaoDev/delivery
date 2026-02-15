import {
    created,
    badRequest,
    serverError,
} from '../../../../packages/helpers/http.js';

class CreateOrderController {
    constructor(createOrderUseCase) {
        if (!createOrderUseCase) {
            throw new Error('CreateOrderUseCase is required');
        }
        this.createOrderUseCase = createOrderUseCase;
    }

    async execute(request, reply) {
        try {
            const { storeId, customer } = request.body;

            // Validação básica de entrada
            if (!storeId || !customer) {
                const response = badRequest(
                    'storeId and customer are required',
                );
                return reply.status(response.statusCode).send(response.body);
            }

            if (!customer.name || !customer.phone) {
                const response = badRequest(
                    'customer.name and customer.phone are required',
                );
                return reply.status(response.statusCode).send(response.body);
            }

            // Executa o UseCase
            const order = await this.createOrderUseCase.execute({
                storeId,
                customer,
            });

            const response = created(order);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            console.error('Error in CreateOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default CreateOrderController;
