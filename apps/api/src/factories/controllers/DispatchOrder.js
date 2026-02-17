import DispatchOrderController from '../../controllers/DispatchOrder.js';
import DispatchOrderUseCase from '../../usecases/DispatchOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import UpdateOrderRepository from '../../repositories/UpdateOrderRepository.js';

export const makeDispatchOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();
    const dispatchOrderUseCase = new DispatchOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );
    const dispatchOrderController = new DispatchOrderController(
        dispatchOrderUseCase,
    );

    return dispatchOrderController;
};
