import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { itemCodeParamSchema } from '@delivery/shared/schemas';

class RemoveItemFromOrderController {
    constructor(removeItemFromOrderUseCase) {
        this.removeItemFromOrderUseCase = removeItemFromOrderUseCase;
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

            const { id: orderId, code } = paramsValidation.data;

            // Executa o UseCase
            const orderUpdated = await this.removeItemFromOrderUseCase.execute({
                orderId,
                code,
            });

            const response = ok(orderUpdated);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            // Erros de negócio conhecidos
            if (
                error.message === 'Order not found' ||
                error.message === 'Item not found' ||
                error.message ===
                    'Cannot remove items from order that is not in DRAFT status'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            // Erro genérico
            console.error('Error removing item from order:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default RemoveItemFromOrderController;
