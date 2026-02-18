import Order from '../aggregates/Order.js';

class RemoveItemFromOrderUseCase {
    constructor(findOrderByIdRepository, updateOrderRepository) {
        this.findOrderByIdRepository = findOrderByIdRepository;
        this.updateOrderRepository = updateOrderRepository;
    }

    async execute({ orderId, code }) {
        if (!orderId) {
            throw new Error('orderId is required');
        }

        if (!code) {
            throw new Error('code is required');
        }

        const orderData = await this.findOrderByIdRepository.execute(orderId);

        if (!orderData) {
            throw new Error('Order not found');
        }

        const order = Order.hydrate(orderData);

        order.removeItem(code);

        const updatedOrderData = order.toJSON();

        const savedOrder =
            await this.updateOrderRepository.execute(updatedOrderData);

        return savedOrder;
    }
}

export default RemoveItemFromOrderUseCase;
