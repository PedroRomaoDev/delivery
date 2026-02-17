import ConfirmOrderController from '../../controllers/ConfirmOrder.js';
import ConfirmOrderUseCase from '../../usecases/ConfirmOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import UpdateOrderRepository from '../../repositories/UpdateOrderRepository.js';

export const makeConfirmOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();
    const confirmOrderUseCase = new ConfirmOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );
    const confirmOrderController = new ConfirmOrderController(
        confirmOrderUseCase,
    );

    return confirmOrderController;
};
