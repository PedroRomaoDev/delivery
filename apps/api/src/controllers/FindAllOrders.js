import { ok, serverError } from '../../../../packages/helpers/http';

class FindAllOrdersController {
    constructor(findAllOrdersUseCase) {
        if (!findAllOrdersUseCase) {
            throw new Error('FindAllOrdersUseCase is required');
        }
        this.findAllOrdersUseCase = findAllOrdersUseCase;
    }

    async execute(request, reply) {
        try {
            const orders = await this.findAllOrdersUseCase.execute();
            const response = ok(orders);
            return reply.status(response.statusCode).send(response.body);
        } catch (error) {
            console.error('Error in FindAllOrdersController:', error);
            const response = serverError();
            return reply.status(response.statusCode).send(response.body);
        }
    }
}

export default FindAllOrdersController;
