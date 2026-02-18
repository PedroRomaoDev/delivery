import { FindOrderByIdRepository } from '../../repositories/index.js';
import { GetOrderByIdUseCase } from '../../usecases/index.js';
import { GetOrderByIdController } from '../../controllers/index.js';

export const makeGetOrderByIdController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();

    const getOrderByIdUseCase = new GetOrderByIdUseCase(
        findOrderByIdRepository,
    );

    const getOrderByIdController = new GetOrderByIdController(
        getOrderByIdUseCase,
    );

    return getOrderByIdController;
};
