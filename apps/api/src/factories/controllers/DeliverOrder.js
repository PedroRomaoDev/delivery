import DeliverOrderController from '../../controllers/DeliverOrder.js';
import DeliverOrderUseCase from '../../usecases/DeliverOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import UpdateOrderRepository from '../../repositories/UpdateOrderRepository.js';

export const makeDeliverOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const updateOrderRepository = new UpdateOrderRepository();
    const deliverOrderUseCase = new DeliverOrderUseCase(
        findOrderByIdRepository,
        updateOrderRepository,
    );
    const deliverOrderController = new DeliverOrderController(
        deliverOrderUseCase,
    );

    return deliverOrderController;
};
