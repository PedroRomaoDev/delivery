import {
    FindOrderByIdRepository,
    UpdateOrderRepository,
} from '../../repositories/index.js';
import { UpdateCustomerInOrderUseCase } from '../../usecases/index.js';
import { UpdateCustomerInOrderController } from '../../controllers/index.js';

export const makeUpdateCustomerInOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();

    const updateCustomerInOrderUseCase = new UpdateCustomerInOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );

    const updateCustomerInOrderController = new UpdateCustomerInOrderController(
        updateCustomerInOrderUseCase,
    );

    return updateCustomerInOrderController;
};
