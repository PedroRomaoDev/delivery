import { CreateOrderRepository } from '../../repositories/index.js';
import { CreateOrderUseCase } from '../../usecases/index.js';
import { CreateOrderController } from '../../controllers/index.js';

export const makeCreateOrderController = () => {
    const createOrderRepository = new CreateOrderRepository();

    const createOrderUseCase = new CreateOrderUseCase(createOrderRepository);

    const createOrderController = new CreateOrderController(createOrderUseCase);

    return createOrderController;
};
