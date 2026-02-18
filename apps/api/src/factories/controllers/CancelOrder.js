import CancelOrderController from '../../controllers/CancelOrder.js';
import CancelOrderUseCase from '../../usecases/CancelOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import UpdateOrderRepository from '../../repositories/UpdateOrderRepository.js';

export const makeCancelOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();
    const cancelOrderUseCase = new CancelOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );
    const cancelOrderController = new CancelOrderController(cancelOrderUseCase);

    return cancelOrderController;
};
