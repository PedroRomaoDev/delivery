import Order from '../aggregates/Order.js';

class AddPaymentToOrderUseCase {
    constructor(findOrderByIdRepository, addPaymentToOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.addPaymentToOrderRepository = addPaymentToOrderRepository;
    }

    async execute({ orderId, origin, prepaid }) {
        if (!orderId || !origin) {
            throw new Error('orderId and origin are required');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        if (!order.isDraft()) {
            throw new Error(
                'Cannot add payments to order that is not in DRAFT status',
            );
        }

        const value = order.getTotalItems();

        if (value <= 0) {
            throw new Error('Order must have items before adding payment');
        }

        order.addPayment({
            origin,
            value,
            prepaid,
        });

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.addPaymentToOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default AddPaymentToOrderUseCase;
