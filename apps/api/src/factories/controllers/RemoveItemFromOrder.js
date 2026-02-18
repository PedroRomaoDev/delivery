import {
    FindOrderByIdRepository,
    UpdateOrderRepository,
} from '../../repositories/index.js';
import { RemoveItemFromOrderUseCase } from '../../usecases/index.js';
import { RemoveItemFromOrderController } from '../../controllers/index.js';

export const makeRemoveItemFromOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();

    const removeItemFromOrderUseCase = new RemoveItemFromOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );

    const removeItemFromOrderController = new RemoveItemFromOrderController(
        removeItemFromOrderUseCase,
    );

    return removeItemFromOrderController;
};
