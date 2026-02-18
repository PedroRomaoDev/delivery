import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import {
    updateItemInOrderSchema,
    itemCodeParamSchema,
} from '@delivery/shared/schemas';

class UpdateItemInOrderController {
    constructor(updateItemInOrderUseCase) {
        this.updateItemInOrderUseCase = updateItemInOrderUseCase;
    }

    async handle(request, reply) {
        try {
            // Validação dos parâmetros da rota (orderId + code)
            const paramsValidation = validate(
                itemCodeParamSchema,
                request.params,
            );

            if (!paramsValidation.success) {
                const response = validationError(paramsValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            // Validação do body
            const bodyValidation = validate(
                updateItemInOrderSchema,
                request.body,
            );

            if (!bodyValidation.success) {
                const response = validationError(bodyValidation.errors);
                return reply.status(response.statusCode).send(response.body);
            }

            const { id: orderId, code } = paramsValidation.data;
            const updates = bodyValidation.data;

            // Executa o UseCase
            const orderUpdated = await this.updateItemInOrderUseCase.execute({
                orderId,
                code,
                updates,
            });

            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            // Erros de negócio conhecidos
            if (
                error.message === 'Order not found' ||
                error.message === 'Item not found' ||
                error.message ===
                    'Cannot update items in order that is not in DRAFT status'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            // Erro genérico
            console.error('Error updating item in order:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default UpdateItemInOrderController;
