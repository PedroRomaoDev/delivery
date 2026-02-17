import AddDeliveryAddressToOrderController from '../../controllers/AddDeliveryAddressToOrder.js';
import AddDeliveryAddressToOrderUseCase from '../../usecases/AddDeliveryAddressToOrder.js';
import FindOrderByIdRepository from '../../repositories/FindOrderByIdRepository.js';
import AddDeliveryAddressToOrderRepository from '../../repositories/AddDeliveryAddressToOrderRepository.js';
import GeocodingService from '../../services/GeocodingService.js';

export const makeAddDeliveryAddressToOrderController = () => {
    const findOrderByIdRepository = new FindOrderByIdRepository();
    const addDeliveryAddressToOrderRepository =
        new AddDeliveryAddressToOrderRepository();
    const geocodingService = new GeocodingService();
    const addDeliveryAddressToOrderUseCase =
        new AddDeliveryAddressToOrderUseCase(
            findOrderByIdRepository,
            addDeliveryAddressToOrderRepository,
            geocodingService,
        );
    const addDeliveryAddressToOrderController =
        new AddDeliveryAddressToOrderController(
            addDeliveryAddressToOrderUseCase,
        );

    return addDeliveryAddressToOrderController;
};
