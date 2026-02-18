import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { orderIdParamSchema } from '@delivery/shared/schemas';

class GetOrderByIdController {
    constructor(getOrderByIdUseCase) {
        if (!getOrderByIdUseCase) {
            throw new Error('GetOrderByIdUseCase is required');
        }
        this.getOrderByIdUseCase = getOrderByIdUseCase;
    }

    async handle(request, reply) {
        try {
            const paramsValidation = validate(
                orderIdParamSchema,
                request.params,
            );

            if (!paramsValidation.success) {
                const response = validationError(paramsValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId } = paramsValidation.data;

            const order = await this.getOrderByIdUseCase.execute(orderId);

            const response = ok(order);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (error.message === 'Order not found') {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error('Error in GetOrderByIdController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default GetOrderByIdController;
