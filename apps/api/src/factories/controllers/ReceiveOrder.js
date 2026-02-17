import ReceiveOrderController from '../../controllers/ReceiveOrder.js';
import ReceiveOrderUseCase from '../../usecases/ReceiveOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import UpdateOrderRepository from '../../repositories/UpdateOrderRepository.js';

export const makeReceiveOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();
    const receiveOrderUseCase = new ReceiveOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );
    const receiveOrderController = new ReceiveOrderController(
        receiveOrderUseCase,
    );

    return receiveOrderController;
};
