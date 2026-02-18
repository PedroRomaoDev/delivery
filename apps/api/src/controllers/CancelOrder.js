import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { orderIdParamSchema } from '@delivery/shared/schemas';

class CancelOrderController {
    constructor(cancelOrderUseCase) {
        this.cancelOrderUseCase = cancelOrderUseCase;
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

            const orderUpdated = await this.cancelOrderUseCase.execute({
                orderId,
            });

            const response = ok({
                message: 'Order canceled successfully',
                order: orderUpdated,
            });
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Only orders in DRAFT, RECEIVED, or CONFIRMED status can be canceled'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error('Error in CancelOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default CancelOrderController;
