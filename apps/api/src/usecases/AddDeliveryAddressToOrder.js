import Order from '../aggregates/Order.js';

class AddDeliveryAddressToOrderUseCase {
    constructor(
        findOrderByIdRepository,
        addDeliveryAddressToOrderRepository,
        geocodingService = null,
    ) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addDeliveryAddressToOrderRepository =
            addDeliveryAddressToOrderRepository;
        this.geocodingService = geocodingService;
    }

    async execute({ orderId, address }) {
        if (!orderId || !address) {
            throw new Error('orderId and address are required');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        if (!order.isDraft()) {
            throw new Error(
                'Cannot add delivery address to order that is not in DRAFT status',
            );
        }

        if (!order.payments || order.payments.length === 0) {
            throw new Error(
                'Order must have payment before adding delivery address',
            );
        }

        const hasValidCoordinates =
            address.coordinates &&
            typeof address.coordinates.latitude === 'number' &&
            typeof address.coordinates.longitude === 'number' &&
            (address.coordinates.latitude !== 0 ||
                address.coordinates.longitude !== 0);

        if (!hasValidCoordinates && this.geocodingService) {
            try {
                const coords = await this.geocodingService.geocode(address);
                address.coordinates = coords;
            } catch (error) {
                console.warn('Geocoding skipped:', error.message);
                address.coordinates = null;
            }
        }

        order.setDeliveryAddress(address);

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.addDeliveryAddressToOrderRepository.execute(
                updatedOrderData,
            );

        return savedOrder;
    }
}

export default AddDeliveryAddressToOrderUseCase;
