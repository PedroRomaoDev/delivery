import Order from '../aggregates/Order.js';

class ConfirmOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId }) {
        if (!orderId) {
            throw new Error('orderId is required');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        order.confirm();

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default ConfirmOrderUseCase;
