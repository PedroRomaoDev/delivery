import AddItemToOrderController from '../../controllers/AddItemToOrder.js';
import AddItemToOrderUseCase from '../../usecases/AddItemToOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import AddItemToOrderRepository from '../../repositories/AddItemToOrderRepository.js';

export const makeAddItemToOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const addItemToOrderRepository = new AddItemToOrderRepository();
    const addItemToOrderUseCase = new AddItemToOrderUseCase(
        findOrderByIdRepository,
        addItemToOrderRepository,
    );
    const addItemToOrderController = new AddItemToOrderController(
        addItemToOrderUseCase,
    );

    return addItemToOrderController;
};
