import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import {
    addItemToOrderSchema,
    orderIdParamSchema,
} from '@delivery/shared/schemas';

class AddItemToOrderController {
    constructor(addItemToOrderUseCase) {
        this.addItemToOrderUseCase = addItemToOrderUseCase;
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

            const bodyValidation = validate(addItemToOrderSchema, request.body);

            if (!bodyValidation.success) {
                const response = validationError(bodyValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId } = paramsValidation.data;
            const { code, quantity, observations, name } = bodyValidation.data;

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
