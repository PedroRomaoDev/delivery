import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { orderIdParamSchema } from '@delivery/shared/schemas';

class ReceiveOrderController {
    constructor(receiveOrderUseCase) {
        this.receiveOrderUseCase = receiveOrderUseCase;
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

            const orderUpdated = await this.receiveOrderUseCase.execute({
                orderId,
            });

            const response = ok({
                message: 'Order received successfully',
                order: orderUpdated,
            });
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Only orders in DRAFT status can be received' ||
                error.message.includes('Order is not complete')
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error('Error in ReceiveOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default ReceiveOrderController;
