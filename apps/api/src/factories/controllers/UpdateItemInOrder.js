import {
    FindOrderByIdRepository,
    UpdateOrderRepository,
} from '../../repositories/index.js';
import { UpdateItemInOrderUseCase } from '../../usecases/index.js';
import { UpdateItemInOrderController } from '../../controllers/index.js';

export const makeUpdateItemInOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();

    const updateItemInOrderUseCase = new UpdateItemInOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );

    const updateItemInOrderController = new UpdateItemInOrderController(
        updateItemInOrderUseCase,
    );

    return updateItemInOrderController;
};
