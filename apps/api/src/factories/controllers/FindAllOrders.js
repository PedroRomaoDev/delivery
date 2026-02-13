import { FindAllOrdersRepository } from '../../repositories/index.js';
import { FindAllOrdersUseCase } from '../../usecases/index.js';
import { FindAllOrdersController } from '../../controllers/index.js';

export const makeFindAllOrdersController = () => {
    const findAllOrdersRepository = new FindAllOrdersRepository();

    const findAllOrdersUseCase = new FindAllOrdersUseCase(
        findAllOrdersRepository,
    );

    const findAllOrdersController = new FindAllOrdersController(
        findAllOrdersUseCase,
    );

    return findAllOrdersController;
};
