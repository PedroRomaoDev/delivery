import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import {
    addDeliveryAddressToOrderSchema,
    orderIdParamSchema,
} from '@delivery/shared/schemas';

class AddDeliveryAddressToOrderController {
    constructor(addDeliveryAddressToOrderUseCase) {
        this.addDeliveryAddressToOrderUseCase =
            addDeliveryAddressToOrderUseCase;
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

            const bodyValidation = validate(
                addDeliveryAddressToOrderSchema,
                request.body,
            );

            if (!bodyValidation.success) {
                const response = validationError(bodyValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId } = paramsValidation.data;
            const address = bodyValidation.data;

            const orderUpdated =
                await this.addDeliveryAddressToOrderUseCase.execute({
                    orderId,
                    address,
                });

            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Cannot set delivery address to order that is not in DRAFT status' ||
                error.message ===
                    'Address must have street_name, street_number, city, state, postal_code and country' ||
                error.message ===
                    'Order must have payment before adding delivery address'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            console.error(
                'Error in AddDeliveryAddressToOrderController:',
                error,
            );
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default AddDeliveryAddressToOrderController;
