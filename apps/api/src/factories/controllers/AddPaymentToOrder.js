import AddPaymentToOrderController from '../../controllers/AddPaymentToOrder.js';
import AddPaymentToOrderUseCase from '../../usecases/AddPaymentToOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import AddPaymentToOrderRepository from '../../repositories/AddPaymentToOrderRepository.js';

export const makeAddPaymentToOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const addPaymentToOrderRepository = new AddPaymentToOrderRepository();
    const addPaymentToOrderUseCase = new AddPaymentToOrderUseCase(
        findOrderByIdRepository,
        addPaymentToOrderRepository,
    );
    const addPaymentToOrderController = new AddPaymentToOrderController(
        addPaymentToOrderUseCase,
    );

    return addPaymentToOrderController;
};
