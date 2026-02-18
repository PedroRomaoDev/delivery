import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import {
    orderIdParamSchema,
    updateCustomerSchema,
} from '@delivery/shared/schemas';

class UpdateCustomerInOrderController {
    constructor(updateCustomerInOrderUseCase) {
        this.updateCustomerInOrderUseCase = updateCustomerInOrderUseCase;
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

            const bodyValidation = validate(updateCustomerSchema, request.body);

            if (!bodyValidation.success) {
                const response = validationError(bodyValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId } = paramsValidation.data;
            const updates = bodyValidation.data;

            const orderUpdated =
                await this.updateCustomerInOrderUseCase.execute({
                    orderId,
                    updates,
                });

            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Cannot update customer in order that is not in DRAFT status'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error('Error updating customer in order:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default UpdateCustomerInOrderController;
