import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import {
    addPaymentToOrderSchema,
    orderIdParamSchema,
} from '@delivery/shared/schemas';

class AddPaymentToOrderController {
    constructor(addPaymentToOrderUseCase) {
        this.addPaymentToOrderUseCase = addPaymentToOrderUseCase;
    }

    async handle(request, reply) {
        try {
            // Validação dos parâmetros da rota
            const paramsValidation = validate(
                orderIdParamSchema,
                request.params,
            );

            if (!paramsValidation.success) {
                const response = validationError(paramsValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            // Validação do body
            const bodyValidation = validate(
                addPaymentToOrderSchema,
                request.body,
            );

            if (!bodyValidation.success) {
                const response = validationError(bodyValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId } = paramsValidation.data;
            const { origin, prepaid } = bodyValidation.data;

            // Executa o UseCase
            const orderUpdated = await this.addPaymentToOrderUseCase.execute({
                orderId,
                origin,
                prepaid,
            });

            // Retorna sucesso
            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            // Erros de negócio conhecidos
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Cannot add payments to order that is not in DRAFT status' ||
                error.message ===
                    'Order must have items before adding payment' ||
                error.message ===
                    'Order already has a payment. Only one payment is allowed per order'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            // Erro genérico
            console.error('Error in AddPaymentToOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default AddPaymentToOrderController;
