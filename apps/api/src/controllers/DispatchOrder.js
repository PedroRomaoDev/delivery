import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { orderIdParamSchema } from '@delivery/shared/schemas';

class DispatchOrderController {
    constructor(dispatchOrderUseCase) {
        this.dispatchOrderUseCase = dispatchOrderUseCase;
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

            const { id: orderId } = paramsValidation.data;

            // Executa o UseCase
            const orderUpdated = await this.dispatchOrderUseCase.execute({
                orderId,
            });

            // Retorna sucesso com mensagem
            const response = ok({
                message: 'Order dispatched successfully',
                order: orderUpdated,
            });
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            // Erros de negócio conhecidos
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Only orders in CONFIRMED status can be dispatched'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            // Erro genérico
            console.error('Error in DispatchOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default DispatchOrderController;
