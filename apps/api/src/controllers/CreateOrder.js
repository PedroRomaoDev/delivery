import {
    created,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { createOrderSchema } from '@delivery/shared/schemas';

class CreateOrderController {
    constructor(createOrderUseCase) {
        if (!createOrderUseCase) {
            throw new Error('CreateOrderUseCase is required');
        }
        this.createOrderUseCase = createOrderUseCase;
    }

    async execute(request, reply) {
        try {
            const validation = validate(createOrderSchema, request.body);

            if (!validation.success) {
                const response = validationError(validation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { storeId, customer } = validation.data;

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
