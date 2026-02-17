import {
    ok,
    badRequest,
    validationError,
    serverError,
} from '../../../../packages/helpers/http.js';
import { validate } from '../../../../packages/helpers/validate.js';
import { orderIdParamSchema } from '@delivery/shared/schemas';

class DeliverOrderController {
    constructor(deliverOrderUseCase) {
        this.deliverOrderUseCase = deliverOrderUseCase;
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
            const orderUpdated = await this.deliverOrderUseCase.execute({
                orderId,
            });

            // Retorna sucesso com mensagem
            const response = ok({
                message: 'Order delivered successfully',
                order: orderUpdated,
            });
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            // Erros de negócio conhecidos
            if (
                error.message === 'Order not found' ||
                error.message ===
                    'Only orders in DISPATCHED status can be delivered'
            ) {
                const response = badRequest(error.message);
                return reply.status(response.statusCode).send(response.body);
            }

            // Erro genérico
            console.error('Error in DeliverOrderController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default DeliverOrderController;
